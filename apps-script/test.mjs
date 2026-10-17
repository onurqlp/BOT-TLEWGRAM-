import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const source=readFileSync(new URL('./Code.gs',import.meta.url),'utf8');
const values=new Map([['ADMIN_USER_IDS','42,99']]);
const properties={
  getProperty:key=>values.has(key)?values.get(key):null,
  setProperty:(key,value)=>values.set(key,String(value)),
  getKeys:()=>[...values.keys()],
  deleteProperty:key=>values.delete(key)
};
const ctx=vm.createContext({
  PropertiesService:{getScriptProperties:()=>properties},
  LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})},
  SpreadsheetApp:{getActiveSpreadsheet:()=>null},
  Logger:{log(){}},
  Utilities:{formatDate:()=> '2026-10-17'},
  Date,JSON,String,Number,RegExp,Math,Array,Object
});
new vm.Script(source,{filename:'Code.gs'}).runInContext(ctx);
test('script compiles without module imports',()=>assert.ok(!source.includes('import {')));
test('no unsupported browser URL constructor or fetch',()=>{
 assert.ok(!source.includes('new URL('));
 assert.ok(!source.includes('await fetch('));
});
test('only HTTPS hostnames accepted',()=>{
 assert.equal(ctx.botHttps_('https://www.example.org/rss'),true);
 assert.equal(ctx.botHttps_('https://www.example.org/rss?x=1'),true);
 for(const x of ['http://example.org','https://localhost/a','https://192.168.1.1/rss','https://foo.local/rss','https://example.org:8080/a','https://example.org@evil.test/rss'])assert.equal(ctx.botHttps_(x),false,x);
});
test('HTML escaped',()=>assert.equal(ctx.botEsc_('<script x="a">&'), '&lt;script x=&quot;a&quot;&gt;&amp;'));
test('spam heuristics',()=>{
 assert.equal(ctx.botSpamScore_('Merhaba nasilsiniz?'),0);
 assert.ok(ctx.botSpamScore_('Bedava coin garantili kazanc https://a.com https://b.com')>=5);
});
test('admin allowlist exact',()=>{
 assert.equal(ctx.botAdmin_('42'),true);
 assert.equal(ctx.botAdmin_(99),true);
 assert.equal(ctx.botAdmin_('4'),false);
});
test('all disruptive controls default disabled',()=>{
 assert.equal(ctx.botEnabled_('PUBLISH'),false);
 assert.equal(ctx.botEnabled_('MODERATION'),false);
 assert.equal(ctx.botEnabled_('AI'),false);
});
test('identity bootstrap and quiet group controls',()=>{
 assert.match(source,/command==='\/kimim'/);
 assert.match(source,/Telegram grup kimligi:/);
 assert.match(source,/if\(!botEnabled_\('MODERATION'\)/);
 assert.match(source,/disable_notification:true/);
});
test('uses polling not webhook endpoint',()=>{
 assert.match(source,/getUpdates/);
 assert.match(source,/deleteWebhook/);
 assert.doesNotMatch(source,/function doPost\(/);
});
