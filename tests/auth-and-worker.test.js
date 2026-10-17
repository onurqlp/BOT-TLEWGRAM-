import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {requireAdmin} from '../src/admin.js';
import worker from '../src/index.js';

function signedInit(token, userId, date=Math.floor(Date.now()/1000)) {
 const values=new URLSearchParams({auth_date:String(date),query_id:'TEST',user:JSON.stringify({id:userId,first_name:'Dev'})});
 const check=[...values].sort((a,b)=>a[0]<b[0]?-1:1).map(([key,value])=>`${key}=${value}`).join('\n');
 const secret=createHmac('sha256','WebAppData').update(token).digest();
 const hash=createHmac('sha256',secret).update(check).digest('hex');
 values.set('hash',hash);
 return values.toString();
}
const env={TELEGRAM_BOT_TOKEN:'dummy_test_secret_only',ADMIN_USER_IDS:'42'};
const requestWithInit=init=>new Request('https://example.org/api/admin/state',{headers:{'X-Telegram-Init-Data':init}});

test('authorized Telegram Mini App initData is accepted',async()=>{assert.equal(await requireAdmin(requestWithInit(signedInit(env.TELEGRAM_BOT_TOKEN,42)),env),true)});
test('tampered user or non-admin rejects Mini App',async()=>{
 const valid=signedInit(env.TELEGRAM_BOT_TOKEN,42);
 assert.equal(await requireAdmin(requestWithInit(valid.replace('%22id%22%3A42','%22id%22%3A41')),env),false);
 assert.equal(await requireAdmin(requestWithInit(signedInit(env.TELEGRAM_BOT_TOKEN,88)),env),false);
});
test('expired and duplicate Mini App parameters rejected',async()=>{
 assert.equal(await requireAdmin(requestWithInit(signedInit(env.TELEGRAM_BOT_TOKEN,42,Math.floor(Date.now()/1000)-4000)),env),false);
 assert.equal(await requireAdmin(requestWithInit(signedInit(env.TELEGRAM_BOT_TOKEN,42)+'&auth_date=123'),env),false);
});
test('health stays accessible and does not claim deployment',async()=>{
 const r=await worker.fetch(new Request('https://example.org/health'),{});
 assert.equal(r.status,200);const j=await r.json();assert.equal(j.live,false);assert.equal(j.ok,true);
});
test('webhook rejects missing Telegram secret before DB access',async()=>{
 const r=await worker.fetch(new Request('https://example.org/telegram/webhook',{method:'POST',body:JSON.stringify({update_id:1})}),{TELEGRAM_WEBHOOK_SECRET:'unused'});
 assert.equal(r.status,403);
});
test('authorized webhook rejects oversized body before DB access',async()=>{
 const r=await worker.fetch(new Request('https://example.org/telegram/webhook',{method:'POST',headers:{'X-Telegram-Bot-Api-Secret-Token':'abc'},body:' '.repeat(70000)}),{TELEGRAM_WEBHOOK_SECRET:'abc'});
 assert.equal(r.status,413);
});
