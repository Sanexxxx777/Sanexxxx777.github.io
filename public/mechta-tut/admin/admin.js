(function(){
"use strict";

var apiUrl="api.php?action=";
var csrfToken="";
var authCard=document.getElementById("authCard");
var adminApp=document.getElementById("adminApp");
var emailInput=document.getElementById("emailInput");
var codeForm=document.getElementById("codeForm");
var authStatus=document.getElementById("authStatus");
var contentStatus=document.getElementById("contentStatus");
var hallsList=document.getElementById("hallsList");
var announceList=document.getElementById("announceList");

function setStatus(element,text,kind){element.textContent=text;element.className="status"+(kind?" "+kind:"")}
function busy(button,state){button.disabled=state;button.setAttribute("aria-busy",state?"true":"false")}
function request(action,options){var config=options||{};config.credentials="same-origin";config.headers=Object.assign({"Accept":"application/json"},config.headers||{});return fetch(apiUrl+encodeURIComponent(action),config).then(function(response){return response.json().catch(function(){return {}}).then(function(body){return {ok:response.ok,status:response.status,body:body}})})}
function showLogin(){csrfToken="";adminApp.hidden=true;authCard.hidden=false;document.getElementById("codeInput").value=""}
function showAdmin(email,token){csrfToken=token||"";authCard.hidden=true;adminApp.hidden=false;document.getElementById("sessionEmail").textContent=email||"Администратор";loadContent()}

function checkSession(){request("session").then(function(result){if(result.ok&&result.body.authenticated)showAdmin(result.body.email,result.body.csrfToken);else showLogin()}).catch(showLogin)}

document.getElementById("emailForm").addEventListener("submit",function(event){event.preventDefault();var button=document.getElementById("requestCodeBtn");var email=emailInput.value.trim().toLowerCase();busy(button,true);setStatus(authStatus,"Отправляем код…","");request("request-code",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:email})}).then(function(result){busy(button,false);if(result.ok){codeForm.hidden=false;document.getElementById("codeInput").focus();setStatus(authStatus,"Если адрес разрешён, письмо с кодом уже отправлено. Код действует 10 минут.","ok")}else if(result.status===429){setStatus(authStatus,"Слишком много запросов. Попробуйте позже.","err")}else if(result.body.error){setStatus(authStatus,result.body.error,"err")}else{setStatus(authStatus,"Не удалось отправить код.","err")}}).catch(function(){busy(button,false);setStatus(authStatus,"Нет соединения с сервером.","err")})});

document.getElementById("codeForm").addEventListener("submit",function(event){event.preventDefault();var button=document.getElementById("verifyCodeBtn");busy(button,true);setStatus(authStatus,"Проверяем код…","");request("verify-code",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:emailInput.value.trim().toLowerCase(),code:document.getElementById("codeInput").value.trim()})}).then(function(result){busy(button,false);if(result.ok)showAdmin(result.body.email,result.body.csrfToken);else if(result.status===429)setStatus(authStatus,"Слишком много попыток. Попробуйте позже.","err");else setStatus(authStatus,"Код неверный или уже истёк.","err")}).catch(function(){busy(button,false);setStatus(authStatus,"Нет соединения с сервером.","err")})});

document.getElementById("changeEmailBtn").addEventListener("click",function(){codeForm.hidden=true;document.getElementById("codeInput").value="";emailInput.focus();setStatus(authStatus,"","")});
document.getElementById("logoutBtn").addEventListener("click",function(){request("logout",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-Token":csrfToken},body:"{}"}).finally(showLogin)});

function escapeHtml(value){var div=document.createElement("div");div.textContent=value==null?"":String(value);return div.innerHTML}
function escapeAttr(value){return escapeHtml(value).replace(/"/g,"&quot;")}
function renderHalls(halls){hallsList.innerHTML="";(halls||[]).forEach(function(hall){var row=document.createElement("div");row.className="hall-row";row.dataset.id=hall.id;row.dataset.name=hall.name;row.innerHTML='<div class="name">'+escapeHtml(hall.name)+'</div><div><label>Цена, ₽/час</label><input type="number" class="hall-price" min="0" max="1000000" step="1" required value="'+Number(hall.pricePerHour)+'"></div><div><label>Вместимость</label><input type="number" class="hall-capacity" min="1" max="1000" step="1" required value="'+Number(hall.capacity)+'"></div>';hallsList.appendChild(row)})}
function announcementCard(item){var card=document.createElement("div");card.className="card";card.innerHTML='<div class="row"><div class="field"><label>Дата</label><input type="text" class="an-date" maxlength="100" required value="'+escapeAttr(item.date||"")+'" placeholder="15 сентября"></div><div class="field"><label>Заголовок</label><input type="text" class="an-title" maxlength="160" required value="'+escapeAttr(item.title||"")+'"></div></div><div class="row"><div class="field"><label>Описание</label><textarea class="an-text" maxlength="2000" required>'+escapeHtml(item.text||"")+'</textarea></div></div><button class="danger an-remove" type="button">Удалить анонс</button>';card.querySelector(".an-remove").addEventListener("click",function(){card.remove()});return card}
function renderAnnouncements(items){announceList.innerHTML="";(items||[]).forEach(function(item){announceList.appendChild(announcementCard(item))})}
function applyContent(data){renderHalls(data.halls);document.getElementById("pricePerMinute").value=Number(data.free.pricePerMinute);document.getElementById("dayCap").value=Number(data.free.dayCap);renderAnnouncements(data.announcements)}
function loadContent(){setStatus(contentStatus,"Загружаем…","");request("content").then(function(result){if(result.status===401){showLogin();return}if(!result.ok)throw new Error("load");applyContent(result.body.content);setStatus(contentStatus,"","")}).catch(function(){setStatus(contentStatus,"Не удалось загрузить данные.","err")})}
function collectContent(){return {halls:Array.prototype.map.call(hallsList.querySelectorAll(".hall-row"),function(row){return {id:row.dataset.id,name:row.dataset.name,pricePerHour:Number(row.querySelector(".hall-price").value),capacity:Number(row.querySelector(".hall-capacity").value)}}),free:{pricePerMinute:Number(document.getElementById("pricePerMinute").value),dayCap:Number(document.getElementById("dayCap").value)},announcements:Array.prototype.map.call(announceList.querySelectorAll(".card"),function(card){return {date:card.querySelector(".an-date").value.trim(),title:card.querySelector(".an-title").value.trim(),text:card.querySelector(".an-text").value.trim()}})}}

document.getElementById("addAnnounceBtn").addEventListener("click",function(){if(announceList.children.length>=20){setStatus(contentStatus,"Можно добавить не больше 20 анонсов.","err");return}var card=announcementCard({date:"",title:"",text:""});announceList.appendChild(card);card.querySelector("input").focus()});
document.getElementById("saveBtn").addEventListener("click",function(){var firstInvalid=document.querySelector("#adminApp input:invalid,#adminApp textarea:invalid");if(firstInvalid){firstInvalid.reportValidity();firstInvalid.focus();return}var button=this;busy(button,true);setStatus(contentStatus,"Сохраняем…","");request("content",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-Token":csrfToken},body:JSON.stringify({content:collectContent()})}).then(function(result){busy(button,false);if(result.status===401){showLogin();return}if(result.status===403&&result.body.error){setStatus(contentStatus,result.body.error,"err");return}if(result.ok)setStatus(contentStatus,"Сохранено. Изменения уже доступны сайту.","ok");else setStatus(contentStatus,result.body.error||"Не удалось сохранить.","err")}).catch(function(){busy(button,false);setStatus(contentStatus,"Нет соединения с сервером.","err")})});

checkSession();
})();
