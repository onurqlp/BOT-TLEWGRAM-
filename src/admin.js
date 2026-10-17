const enc = new TextEncoder();
async function hmac(key, msg) {
 const k=await crypto.subtle.importKey('raw',key,{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return new Uint8Array(await crypto.subtle.sign('HMAC',k,enc.encode(msg)));
}
function toHex(bytes){return [...bytes].map(x=>x.toString(16).padStart(2,'0')).join('')}
function same(a,b){if(a.length!==b.length)return false;let v=0;for(let i=0;i<a.length;i++)v|=a.charCodeAt(i)^b.charCodeAt(i);return v===0}
export async function requireAdmin(request,env){
 const init=request.headers.get('X-Telegram-Init-Data')||'';
 if(!init||!env.TELEGRAM_BOT_TOKEN) return false;
 const p=new URLSearchParams(init);
 if(p.getAll('hash').length!==1||p.getAll('auth_date').length!==1||p.getAll('user').length!==1)return false;
 const theirHash=p.get('hash')||'';p.delete('hash');
 const date=Number(p.get('auth_date')||0);const now=Math.floor(Date.now()/1000);
 if(!date||now-date>3600||date>now+120)return false;
 const data=[...p].sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0).map(([k,v])=>`${k}=${v}`).join('\n');
 const key=await hmac(enc.encode('WebAppData'),env.TELEGRAM_BOT_TOKEN);
 const ours=toHex(await hmac(key,data));
 if(!same(ours,theirHash.toLowerCase()))return false;
 let user;try{user=JSON.parse(p.get('user')||'{}')}catch{return false}
 return String(env.ADMIN_USER_IDS||'').split(',').map(x=>x.trim()).includes(String(user.id));
}
export function adminHTML(){return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BOT TLEWGRAM • Yönetim</title><script src="https://telegram.org/js/telegram-web-app.js"></script><style>
:root{color-scheme:dark;font:15px system-ui,sans-serif;background:#0a111c;color:#edf4ff}body{max-width:760px;margin:auto;padding:18px}h1{font-size:24px;margin:4px 0 8px}.sub{color:#a9bad4}section{border:1px solid #2c3950;border-radius:16px;padding:15px;margin:15px 0;background:#151f30}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.stat{background:#222f45;border-radius:12px;padding:12px}button{border:0;background:#38a6db;color:#082030;border-radius:11px;padding:11px 14px;margin:4px 4px 4px 0;font-weight:700;cursor:pointer}.danger{background:#e67e80}.outline{background:#34465e;color:white}pre{white-space:pre-wrap;word-break:break-word}.card{padding:10px 0;border-top:1px solid #33435a}.tiny{font-size:12px;color:#acbed5}a{color:#8bd1ff}
</style></head><body><h1>BOT TLEWGRAM</h1><p class="sub">Sessiz topluluk • Yönetici merkezi</p><div id="auth" class="tiny">Telegram kimliği doğrulanıyor…</div><section><h2>Durum</h2><div class="grid" id="stats"></div></section><section><h2>Kontroller</h2><div id="controls"></div><p class="tiny">Haberler yalnızca onaydan sonra yayınlanır.</p></section><section><h2>Yayın bekleyenler</h2><div id="pending"></div></section><script>
const init=window.Telegram?.WebApp?.initData||''; if(window.Telegram?.WebApp){Telegram.WebApp.ready();Telegram.WebApp.expand()}
async function call(url,opt={}){let r=await fetch(url,{...opt,headers:{'X-Telegram-Init-Data':init,'Content-Type':'application/json'}});if(!r.ok)throw Error(await r.text());return r.json()}
async function refresh(){try{let d=await call('/api/admin/state');document.getElementById('auth').textContent='Yetkili yönetici';document.getElementById('stats').innerHTML=Object.entries(d.stats).map(([k,v])=>'<div class="stat"><div class="tiny">'+k+'</div><strong>'+v+'</strong></div>').join('');document.getElementById('controls').innerHTML=Object.entries(d.flags).map(([k,v])=>'<button class="'+(v==='true'?'danger':'outline')+'" data-key="'+k+'" data-value="'+(v==='true'?'false':'true')+'">'+k+': '+(v==='true'?'AÇIK':'KAPALI')+'</button>').join('');document.querySelectorAll('[data-key]').forEach(b=>b.onclick=async()=>{if(!confirm('Bu ayar değiştirilsin mi?'))return;try{await call('/api/admin/flag',{method:'POST',body:JSON.stringify({key:b.dataset.key,value:b.dataset.value})});refresh()}catch(e){alert(e.message)}});document.getElementById('pending').innerHTML=d.pending.map(x=>'<div class="card"><pre></pre><button data-id="'+x.id+'">Onayla ve yayınla</button></div>').join('')||'<p class="tiny">Bekleyen yayın yok.</p>';d.pending.forEach((x,i)=>document.querySelectorAll('.card pre')[i].textContent=x.body);document.querySelectorAll('[data-id]').forEach(b=>b.onclick=async()=>{if(!confirm('Bu mesaj gerçek gruba gönderilecek. Onaylıyor musun?'))return;try{await call('/api/admin/publish',{method:'POST',body:JSON.stringify({id:Number(b.dataset.id)})});refresh()}catch(e){alert(e.message)}})}catch(e){document.getElementById('auth').textContent='Erişim yok: Telegram içindeki /panel komutundan aç. '+e.message}}
}refresh();</script></body></html>`}
