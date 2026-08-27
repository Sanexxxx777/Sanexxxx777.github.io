<?php
declare(strict_types=1);

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);
umask(0077);

const SESSION_COOKIE = 'mechta_admin_session';
const SESSION_TTL = 2592000;
const LOGIN_CODE_TTL = 600;
const MAX_REQUEST_BYTES = 524288;
const MAX_CONTENT_BYTES = 131072;

function security_headers(): void
{
    header('Cache-Control: no-store, max-age=0');
    header('Pragma: no-cache');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: no-referrer');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
    header('X-Robots-Tag: noindex, nofollow, noarchive');
    header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
}

function respond(int $status, array $payload, array $headers = []): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    foreach ($headers as $name => $value) header($name . ': ' . $value);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}

function request_json(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || strlen($raw) > MAX_REQUEST_BYTES) throw new InvalidArgumentException('Некорректный запрос.');
    $value = json_decode($raw, true, 32, JSON_THROW_ON_ERROR);
    if (!is_array($value)) throw new InvalidArgumentException('Ожидается объект JSON.');
    return $value;
}

function normalize_email(string $email): string
{
    return strtolower(trim($email));
}

function text_length(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function mask_email(string $email): string
{
    $parts = explode('@', $email, 2);
    if (count($parts) !== 2) return '***';
    return substr($parts[0], 0, 1) . '***@' . $parts[1];
}

function hash_identity(string $value, string $key): string
{
    return hash_hmac('sha256', $value, $key);
}

function admin_emails(array $config): array
{
    $configured = $config['admin_emails'] ?? [];
    if (!is_array($configured)) return [];
    $result = [];
    foreach ($configured as $email) {
        if (!is_string($email)) continue;
        $email = normalize_email($email);
        if (filter_var($email, FILTER_VALIDATE_EMAIL)) $result[$email] = true;
    }
    return array_keys($result);
}

function allowed_admin_email(array $config, string $email): ?string
{
    $email = normalize_email($email);
    $provided = hash_identity($email, $config['identity_key']);
    foreach (admin_emails($config) as $candidate) {
        if (hash_equals(hash_identity($candidate, $config['identity_key']), $provided)) return $candidate;
    }
    return null;
}

function session_admin_email(array $config, string $emailHash): ?string
{
    foreach (admin_emails($config) as $candidate) {
        if (hash_equals(hash_identity($candidate, $config['identity_key']), $emailHash)) return $candidate;
    }
    return null;
}

function password_algorithm()
{
    return defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT;
}

function code_hash(string $code): string
{
    $options = defined('PASSWORD_ARGON2ID') ? ['memory_cost' => 32768, 'time_cost' => 3, 'threads' => 1] : ['cost' => 12];
    $hash = password_hash($code, password_algorithm(), $options);
    if (!is_string($hash)) throw new RuntimeException('Cannot hash login code.');
    return $hash;
}

function db(array $config): PDO
{
    if (!extension_loaded('pdo_sqlite')) throw new RuntimeException('SQLite support is missing.');
    $dataDir = $config['data_dir'];
    if (!is_dir($dataDir) && !mkdir($dataDir, 0700, true) && !is_dir($dataDir)) throw new RuntimeException('Cannot create data directory.');
    chmod($dataDir, 0700);
    $path = $dataDir . '/admin.sqlite';
    $pdo = new PDO('sqlite:' . $path, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    chmod($path, 0600);
    $pdo->exec('PRAGMA busy_timeout = 5000');
    $pdo->exec('PRAGMA journal_mode = WAL');
    $pdo->exec('CREATE TABLE IF NOT EXISTS login_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email_hash TEXT NOT NULL,
        code_hash TEXT NOT NULL,
        ip_hash TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        consumed_at INTEGER
    )');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_login_codes_email ON login_codes(email_hash, id DESC)');
    $pdo->exec('CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        email_hash TEXT NOT NULL,
        csrf_token TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        last_seen_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS rate_limits (bucket TEXT PRIMARY KEY, count INTEGER NOT NULL, resets_at INTEGER NOT NULL)');
    $pdo->exec('CREATE TABLE IF NOT EXISTS audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at INTEGER NOT NULL, event TEXT NOT NULL, actor_hash TEXT, ip_hash TEXT NOT NULL, details TEXT NOT NULL)');
    $now = time();
    $pdo->prepare('DELETE FROM login_codes WHERE expires_at < ?')->execute([$now - 86400]);
    $pdo->prepare('DELETE FROM sessions WHERE expires_at <= ? OR last_seen_at <= ?')->execute([$now, $now - SESSION_TTL]);
    $pdo->prepare('DELETE FROM rate_limits WHERE resets_at <= ?')->execute([$now]);
    $pdo->prepare('DELETE FROM audit_log WHERE created_at < ?')->execute([$now - 7776000]);
    return $pdo;
}

function audit(PDO $pdo, string $event, ?string $actorHash, string $ipHash, array $details = []): void
{
    $stmt = $pdo->prepare('INSERT INTO audit_log(created_at, event, actor_hash, ip_hash, details) VALUES(?, ?, ?, ?, ?)');
    $stmt->execute([time(), $event, $actorHash, $ipHash, json_encode($details, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)]);
}

function rate_limit(PDO $pdo, string $bucket, int $limit, int $windowSeconds): bool
{
    $now = time();
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare('SELECT count, resets_at FROM rate_limits WHERE bucket = ?');
        $stmt->execute([$bucket]);
        $row = $stmt->fetch();
        if (!$row || (int) $row['resets_at'] <= $now) {
            $stmt = $pdo->prepare('INSERT INTO rate_limits(bucket, count, resets_at) VALUES(?, 1, ?) ON CONFLICT(bucket) DO UPDATE SET count = 1, resets_at = excluded.resets_at');
            $stmt->execute([$bucket, $now + $windowSeconds]);
            $pdo->commit();
            return true;
        }
        if ((int) $row['count'] >= $limit) {
            $pdo->commit();
            return false;
        }
        $pdo->prepare('UPDATE rate_limits SET count = count + 1 WHERE bucket = ?')->execute([$bucket]);
        $pdo->commit();
        return true;
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $error;
    }
}

function cookie_value(string $token, int $maxAge): string
{
    return SESSION_COOKIE . '=' . rawurlencode($token) . '; Path=/admin/; Max-Age=' . $maxAge . '; Secure; HttpOnly; SameSite=Strict';
}

function request_cookie(string $name): string
{
    return isset($_COOKIE[$name]) && is_string($_COOKIE[$name]) ? $_COOKIE[$name] : '';
}

function authenticated_session(PDO $pdo, array $config): ?array
{
    $token = request_cookie(SESSION_COOKIE);
    if ($token === '' || strlen($token) > 256) return null;
    $tokenHash = hash('sha256', $token);
    $stmt = $pdo->prepare('SELECT token_hash, email_hash, csrf_token, last_seen_at, expires_at FROM sessions WHERE token_hash = ?');
    $stmt->execute([$tokenHash]);
    $session = $stmt->fetch();
    if (!$session || (int) $session['expires_at'] <= time() || (int) $session['last_seen_at'] <= time() - SESSION_TTL || session_admin_email($config, (string) $session['email_hash']) === null) {
        if ($session) $pdo->prepare('DELETE FROM sessions WHERE token_hash = ?')->execute([$tokenHash]);
        return null;
    }
    $now = time();
    $pdo->prepare('UPDATE sessions SET last_seen_at = ?, expires_at = ? WHERE token_hash = ?')->execute([$now, $now + SESSION_TTL, $tokenHash]);
    $session['token'] = $token;
    return $session;
}

function require_session(PDO $pdo, array $config): array
{
    $session = authenticated_session($pdo, $config);
    if (!$session) respond(401, ['ok' => false, 'error' => 'Нужно войти снова.']);
    return $session;
}

function request_header(string $name): string
{
    $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
    return isset($_SERVER[$key]) && is_string($_SERVER[$key]) ? trim($_SERVER[$key]) : '';
}

function require_csrf(array $session): void
{
    $provided = request_header('X-CSRF-Token');
    if ($provided === '' || !hash_equals((string) $session['csrf_token'], $provided)) respond(403, ['ok' => false, 'error' => 'Защитный токен устарел. Обновите страницу.']);
}

function require_allowed_origin(array $config): void
{
    $origin = request_header('Origin');
    if ($origin === '') return;
    $allowed = $config['allowed_origins'] ?? [];
    if (!is_array($allowed) || !in_array($origin, $allowed, true)) respond(403, ['ok' => false, 'error' => 'Недопустимый источник запроса.']);
}

function read_content(string $path): array
{
    $raw = file_get_contents($path);
    if ($raw === false) throw new RuntimeException('Cannot read content.');
    $content = json_decode($raw, true, 32, JSON_THROW_ON_ERROR);
    if (!is_array($content)) throw new RuntimeException('Invalid content.');
    return $content;
}

function assert_text($value, string $field, int $max): string
{
    if (!is_string($value)) throw new InvalidArgumentException('Проверьте поле «' . $field . '».');
    $value = trim($value);
    if ($value === '' || text_length($value) > $max || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', $value)) throw new InvalidArgumentException('Проверьте поле «' . $field . '».');
    return $value;
}

function assert_integer($value, string $field, int $min, int $max): int
{
    if (!is_int($value) || $value < $min || $value > $max) throw new InvalidArgumentException('Проверьте поле «' . $field . '».');
    return $value;
}

function validate_content(array $content): array
{
    $encoded = json_encode($content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    if (strlen($encoded) > MAX_CONTENT_BYTES) throw new InvalidArgumentException('Слишком большой объём данных.');
    $hallNames = ['blue' => 'Синий зал', 'red' => 'Красный зал', 'green' => 'Зелёный зал', 'black' => 'Чёрный зал', 'white' => 'Белый зал', 'gray' => 'Серый зал'];
    if (!isset($content['halls']) || !is_array($content['halls']) || count($content['halls']) !== count($hallNames)) throw new InvalidArgumentException('Проверьте список залов.');
    $halls = [];
    foreach ($content['halls'] as $hall) {
        if (!is_array($hall)) throw new InvalidArgumentException('Проверьте список залов.');
        $id = isset($hall['id']) && is_string($hall['id']) ? $hall['id'] : '';
        if (!isset($hallNames[$id]) || isset($halls[$id]) || ($hall['name'] ?? null) !== $hallNames[$id]) throw new InvalidArgumentException('Проверьте список залов.');
        $halls[$id] = [
            'id' => $id,
            'name' => $hallNames[$id],
            'pricePerHour' => assert_integer($hall['pricePerHour'] ?? null, 'цена ' . $hallNames[$id], 0, 1000000),
            'capacity' => assert_integer($hall['capacity'] ?? null, 'вместимость ' . $hallNames[$id], 1, 1000),
        ];
    }
    $orderedHalls = [];
    foreach (array_keys($hallNames) as $id) $orderedHalls[] = $halls[$id];
    if (!isset($content['free']) || !is_array($content['free'])) throw new InvalidArgumentException('Проверьте свободное посещение.');
    $free = [
        'pricePerMinute' => assert_integer($content['free']['pricePerMinute'] ?? null, 'цена за минуту', 0, 10000),
        'dayCap' => assert_integer($content['free']['dayCap'] ?? null, 'стоп-чек', 0, 1000000),
    ];
    if (!isset($content['announcements']) || !is_array($content['announcements']) || count($content['announcements']) > 20) throw new InvalidArgumentException('Проверьте анонсы.');
    $announcements = [];
    foreach ($content['announcements'] as $index => $item) {
        if (!is_array($item)) throw new InvalidArgumentException('Проверьте анонс №' . ($index + 1) . '.');
        $announcements[] = [
            'date' => assert_text($item['date'] ?? null, 'дата анонса №' . ($index + 1), 100),
            'title' => assert_text($item['title'] ?? null, 'заголовок анонса №' . ($index + 1), 160),
            'text' => assert_text($item['text'] ?? null, 'текст анонса №' . ($index + 1), 2000),
        ];
    }
    return ['halls' => $orderedHalls, 'free' => $free, 'announcements' => $announcements];
}

function atomic_write(string $path, string $contents, int $mode): void
{
    $directory = dirname($path);
    if (!is_dir($directory) && !mkdir($directory, $mode === 0600 ? 0700 : 0755, true) && !is_dir($directory)) throw new RuntimeException('Cannot create directory.');
    $temporary = tempnam($directory, '.publish-');
    if ($temporary === false) throw new RuntimeException('Cannot create temporary file.');
    try {
        if (file_put_contents($temporary, $contents, LOCK_EX) === false) throw new RuntimeException('Cannot write temporary file.');
        chmod($temporary, $mode);
        if (!rename($temporary, $path)) throw new RuntimeException('Cannot publish file.');
    } finally {
        if (is_file($temporary)) unlink($temporary);
    }
}

function save_content(array $config, array $content): string
{
    $content = validate_content($content);
    $json = json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . "\n";
    $lockPath = $config['data_dir'] . '/content.lock';
    $lock = fopen($lockPath, 'c');
    if (!$lock || !flock($lock, LOCK_EX)) throw new RuntimeException('Cannot lock content.');
    try {
        $backupDir = $config['data_dir'] . '/backups';
        if (!is_dir($backupDir) && !mkdir($backupDir, 0700, true) && !is_dir($backupDir)) throw new RuntimeException('Cannot create backup directory.');
        if (is_file($config['content_file'])) {
            $backup = $backupDir . '/content-' . gmdate('Ymd-His') . '-' . bin2hex(random_bytes(3)) . '.json';
            if (!copy($config['content_file'], $backup)) throw new RuntimeException('Cannot back up content.');
            chmod($backup, 0600);
        }
        atomic_write($config['content_file'], $json, 0600);
        atomic_write($config['publish_file'], $json, 0644);
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
    return hash('sha256', $json);
}

function send_login_code(array $config, string $email, string $code): bool
{
    if (($config['mail_transport'] ?? 'mail') === 'file') return file_put_contents($config['test_mail_file'], $code, LOCK_EX) !== false;
    $subject = function_exists('mb_encode_mimeheader') ? mb_encode_mimeheader('Код входа в админку МечтаТут', 'UTF-8') : 'MechtaTut admin login code';
    $message = "Код входа: {$code}\n\nОн действует 10 минут и подходит только для одного входа. Если вы не запрашивали код, проигнорируйте письмо.\n";
    $headers = ['From: ' . $config['mail_from'], 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: 8bit', 'X-Auto-Response-Suppress: All'];
    return mail($email, $subject, $message, implode("\r\n", $headers));
}

security_headers();

try {
    $configPath = getenv('MECHTA_ADMIN_CONFIG') ?: dirname(__DIR__, 2) . '/admin_data/config.php';
    if (!is_file($configPath)) throw new RuntimeException('Admin configuration is missing.');
    $config = require $configPath;
    if (!is_array($config) || !isset($config['data_dir'], $config['content_file'], $config['publish_file'], $config['identity_key'], $config['mail_from']) || strlen((string) $config['identity_key']) < 32 || admin_emails($config) === []) throw new RuntimeException('Invalid admin configuration.');
    $pdo = db($config);
    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    $action = isset($_GET['action']) && is_string($_GET['action']) ? $_GET['action'] : '';
    $remoteAddress = isset($_SERVER['REMOTE_ADDR']) && is_string($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
    $ipHash = hash_identity($remoteAddress, $config['identity_key']);

    if ($method === 'GET' && $action === 'session') {
        $session = authenticated_session($pdo, $config);
        if (!$session) respond(200, ['ok' => true, 'authenticated' => false]);
        $email = session_admin_email($config, (string) $session['email_hash']);
        if ($email === null) respond(200, ['ok' => true, 'authenticated' => false], ['Set-Cookie' => cookie_value('', 0)]);
        respond(200, ['ok' => true, 'authenticated' => true, 'email' => mask_email($email), 'csrfToken' => $session['csrf_token']], ['Set-Cookie' => cookie_value((string) $session['token'], SESSION_TTL)]);
    }

    if ($method === 'POST' && $action === 'request-code') {
        require_allowed_origin($config);
        $payload = request_json();
        $email = normalize_email((string) ($payload['email'] ?? ''));
        $emailHash = hash_identity($email, $config['identity_key']);
        if (!rate_limit($pdo, 'request-ip:' . $ipHash, 20, 3600) || !rate_limit($pdo, 'request:' . $ipHash . ':' . $emailHash, 5, 3600)) {
            audit($pdo, 'login_rate_limited', null, $ipHash, ['scope' => 'request']);
            respond(429, ['ok' => false, 'error' => 'Слишком много попыток. Попробуйте позже.'], ['Retry-After' => '3600']);
        }
        $allowedEmail = allowed_admin_email($config, $email);
        if ($allowedEmail !== null) {
            $code = str_pad((string) random_int(0, 99999999), 8, '0', STR_PAD_LEFT);
            $stmt = $pdo->prepare('UPDATE login_codes SET consumed_at = ? WHERE email_hash = ? AND consumed_at IS NULL');
            $stmt->execute([time(), $emailHash]);
            $stmt = $pdo->prepare('INSERT INTO login_codes(email_hash, code_hash, ip_hash, created_at, expires_at) VALUES(?, ?, ?, ?, ?)');
            $stmt->execute([$emailHash, code_hash($code), $ipHash, time(), time() + LOGIN_CODE_TTL]);
            $sent = send_login_code($config, $allowedEmail, $code);
            audit($pdo, $sent ? 'login_code_requested' : 'login_delivery_failed', $emailHash, $ipHash);
            if (!$sent) respond(503, ['ok' => false, 'error' => 'Почтовый сервер не принял письмо. Попробуйте позже.']);
        } else {
            code_hash(bin2hex(random_bytes(8)));
            audit($pdo, 'login_unknown_email', null, $ipHash);
        }
        respond(202, ['ok' => true, 'message' => 'Если адрес разрешён, письмо с кодом уже отправлено.']);
    }

    if ($method === 'POST' && $action === 'verify-code') {
        require_allowed_origin($config);
        $payload = request_json();
        $email = normalize_email((string) ($payload['email'] ?? ''));
        $code = trim((string) ($payload['code'] ?? ''));
        $emailHash = hash_identity($email, $config['identity_key']);
        if (!rate_limit($pdo, 'verify-ip:' . $ipHash, 30, 3600) || !rate_limit($pdo, 'verify:' . $ipHash . ':' . $emailHash, 10, 3600)) {
            audit($pdo, 'login_rate_limited', null, $ipHash, ['scope' => 'verification']);
            respond(429, ['ok' => false, 'error' => 'Слишком много попыток. Попробуйте позже.'], ['Retry-After' => '3600']);
        }
        $stmt = $pdo->prepare('SELECT * FROM login_codes WHERE email_hash = ? AND consumed_at IS NULL ORDER BY id DESC LIMIT 1');
        $stmt->execute([$emailHash]);
        $row = $stmt->fetch();
        $valid = $row && (int) $row['expires_at'] > time() && (int) $row['attempts'] < 8 && preg_match('/^\d{8}$/', $code) && password_verify($code, (string) $row['code_hash']) && allowed_admin_email($config, $email) !== null;
        if (!$valid) {
            if ($row) $pdo->prepare('UPDATE login_codes SET attempts = attempts + 1 WHERE id = ?')->execute([$row['id']]);
            else password_verify($code, code_hash('00000000'));
            audit($pdo, 'login_failed', $emailHash, $ipHash);
            respond(401, ['ok' => false, 'error' => 'Код неверен или уже истёк.']);
        }
        $pdo->prepare('UPDATE login_codes SET consumed_at = ? WHERE id = ?')->execute([time(), $row['id']]);
        $token = bin2hex(random_bytes(32));
        $csrf = bin2hex(random_bytes(24));
        $pdo->prepare('DELETE FROM sessions WHERE email_hash = ? OR expires_at <= ?')->execute([$emailHash, time()]);
        $pdo->prepare('INSERT INTO sessions(token_hash, email_hash, csrf_token, created_at, last_seen_at, expires_at) VALUES(?, ?, ?, ?, ?, ?)')->execute([hash('sha256', $token), $emailHash, $csrf, time(), time(), time() + SESSION_TTL]);
        audit($pdo, 'login_succeeded', $emailHash, $ipHash);
        respond(200, ['ok' => true, 'email' => mask_email($email), 'csrfToken' => $csrf], ['Set-Cookie' => cookie_value($token, SESSION_TTL)]);
    }

    if ($method === 'POST' && $action === 'logout') {
        require_allowed_origin($config);
        $session = require_session($pdo, $config);
        require_csrf($session);
        $pdo->prepare('DELETE FROM sessions WHERE token_hash = ?')->execute([$session['token_hash']]);
        audit($pdo, 'logout', $session['email_hash'], $ipHash);
        respond(200, ['ok' => true], ['Set-Cookie' => cookie_value('', 0)]);
    }

    if ($method === 'GET' && $action === 'content') {
        require_session($pdo, $config);
        respond(200, ['ok' => true, 'content' => read_content($config['content_file'])]);
    }

    if ($method === 'POST' && $action === 'content') {
        require_allowed_origin($config);
        $session = require_session($pdo, $config);
        require_csrf($session);
        $payload = request_json();
        $content = isset($payload['content']) && is_array($payload['content']) ? $payload['content'] : [];
        $revision = save_content($config, $content);
        audit($pdo, 'content_saved', $session['email_hash'], $ipHash, ['revision' => $revision]);
        respond(200, ['ok' => true, 'revision' => $revision, 'savedAt' => gmdate(DATE_ATOM)]);
    }

    respond(404, ['ok' => false, 'error' => 'Маршрут не найден.']);
} catch (JsonException | InvalidArgumentException $error) {
    respond(422, ['ok' => false, 'error' => $error->getMessage()]);
} catch (Throwable $error) {
    error_log('mechta admin exception: ' . $error->getMessage());
    respond(500, ['ok' => false, 'error' => 'Не удалось выполнить действие. Попробуйте ещё раз.']);
}
