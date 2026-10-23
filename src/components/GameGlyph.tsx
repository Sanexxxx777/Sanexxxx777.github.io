/* The Stonewake golem's head as a 7x6 pixel sprite for the «Игра» tab (owner 23.10: «выделить в стиле
   геймификации, вау анимированно»). Stone = currentColor, the eyes = the one coral LED of the header
   (coral budget). scripts/brand-nav.mjs stamps the same sprite (GLYPH) into the static pages: edit both. */
export function GameGlyph({ className, eyeClass }: { className?: string; eyeClass?: string }) {
  return (
    <svg className={className} viewBox="0 0 7 6" width="14" height="12" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M1 0h5v1H1zM0 1h7v1H0zM0 2h1v1H0zM2 2h3v1H2zM6 2h1v1H6zM0 3h7v1H0zM0 4h2v1H0zM5 4h2v1H5zM1 5h5v1H1z" />
      <path className={eyeClass} fill="var(--coral)" d="M1 2h1v1H1zM5 2h1v1H5z" />
    </svg>
  );
}
