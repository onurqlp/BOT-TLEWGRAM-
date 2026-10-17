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

test('RSS spreadsheet formula injection is neutralized',()=>{
 assert.equal(ctx.botSafeCell_('=IMPORTDATA("https://evil.example")'), '\u200b=IMPORTDATA("https://evil.example")');
 assert.equal(ctx.botSafeCell_('+SUM(1,2)'), '\u200b+SUM(1,2)');
 assert.equal(ctx.botSafeCell_('Normal haber'), 'Normal haber');
});
test('pollTelegram drains a bounded backlog and advances the offset',()=>{
 values.set('TELEGRAM_BOT_TOKEN','test-only');
 values.delete('NEXT_UPDATE_ID');
 const seen=[];
 let calls=0;
 ctx.botApi_=(method,options)=>{
  assert.equal(method,'getUpdates');
  calls++;
  const start=options.offset||100;
  const remaining=145-start;
  return Array.from({length:Math.max(0,Math.min(options.limit,remaining))},(_,i)=>({update_id:start+i}));
 };
 ctx.botUpdate_=(entry)=>seen.push(entry.update_id);
 ctx.botLogError_=()=>{};
 ctx.botMetric_=()=>{};
 ctx.pollTelegram();
 assert.equal(calls,2);
 assert.equal(seen.length,45);
 assert.equal(values.get('NEXT_UPDATE_ID'),'145');
});
test('transient failed update is retried without losing its offset',()=>{
 values.set('NEXT_UPDATE_ID','800');
 values.delete('RETRY_800');
 let attempts=0;
 ctx.botApi_=()=>[{update_id:800}];
 ctx.botUpdate_=()=>{if(attempts++===0)throw Error('temporary');};
 ctx.pollTelegram();
 assert.equal(values.get('NEXT_UPDATE_ID'),'800');
 assert.equal(values.get('RETRY_800'),'1');
 ctx.pollTelegram();
 assert.equal(values.get('NEXT_UPDATE_ID'),'801');
 assert.equal(values.has('RETRY_800'),false);
});
test('poison update is skipped after three failed polling runs',()=>{
 values.set('NEXT_UPDATE_ID','901');
 values.delete('RETRY_901');
 ctx.botApi_=()=>[{update_id:901}];
 ctx.botUpdate_=()=>{throw Error('bad update');};
 ctx.pollTelegram();
 ctx.pollTelegram();
 assert.equal(values.get('NEXT_UPDATE_ID'),'901');
 ctx.pollTelegram();
 assert.equal(values.get('NEXT_UPDATE_ID'),'902');
 assert.equal(values.has('RETRY_901'),false);
});
test('successful group send survives failed admin confirmation without duplicate retry',()=>{
 const statuses=[], sent=[];
 ctx.botEnabled_=flag=>flag==='PUBLISH';
 ctx.botConfig_=key=>key==='TELEGRAM_GROUP_ID'?'-100123':'';
 ctx.botDigestById_=()=>({row:2,status:'pending',body:'hello'});
 ctx.botSheet_=()=>({getRange:()=>({setValue:v=>statuses.push(v)})});
 ctx.botRows_=()=>[];
 ctx.botSend_=(target,body)=>{
  sent.push(String(target));
  if(String(target)==='42')throw Error('admin blocked');
 };
 ctx.botMetric_=()=>{throw Error('metrics unavailable');};
 ctx.botLogError_=()=>{};
 ctx.botPublish_('42','10');
 assert.ok(statuses.includes('sending'));
 assert.ok(statuses.includes('sent'));
 assert.ok(!statuses.includes('needs_review'));
 assert.equal(sent.filter(x=>x==='-100123').length,1);
});

test('outdated or future RSS articles are filtered before creating digests',()=>{
 const now=Date.now();
 assert.equal(ctx.botFresh_(new Date(now-86400000).toISOString()),true);
 assert.equal(ctx.botFresh_(new Date(now-10*86400000).toISOString()),false);
 assert.equal(ctx.botFresh_(new Date(now+2*86400000).toISOString()),false);
 assert.equal(ctx.botFresh_(''),true);
 assert.match(source,/botFresh_\(published\)/);
});

test('five-minute polling panel uses message buttons, not callback data',()=>{
 const messages=[];
 ctx.botLatestDigest_=()=>({id:'123',status:'pending'});
 ctx.botConfig_=key=>key==='TELEGRAM_GROUP_ID'?'-100TEST':'';
 ctx.botEnabled_=()=>false;
 ctx.botSend_=(id,msg,extra)=>messages.push({id,msg,extra});
 ctx.botPanel_('42');
 assert.equal(messages.length,1);
 const keyboard=messages[0].extra.reply_markup.keyboard;
 assert.ok(keyboard.flat().some(x=>x.text==='/hepsiniac'));
 assert.ok(keyboard.flat().some(x=>x.text==='/yayinhazir 123'));
 assert.equal(messages[0].extra.reply_markup.inline_keyboard,undefined);
});
test('expired inline callbacks cause no state mutation or messages',()=>{
 const sent=[];
 ctx.botApi_=()=>{throw Error('query is too old');};
 ctx.botSend_=()=>sent.push(true);
 ctx.botCallback_({id:'expired',from:{id:42},message:{chat:{type:'private',id:42}},data:'admin:toggle:AI'});
 assert.equal(sent.length,0);
});
test('admin can activate only modes with configured prerequisites',()=>{
 values.set('ADMIN_USER_IDS','42');
 values.delete('FLAG_AI');values.delete('FLAG_PUBLISH');values.delete('FLAG_MODERATION');
 ctx.botConfig_=key=>values.get(key)||'';
 ctx.botEnabled_=key=>values.get('FLAG_'+key)==='true';
 ctx.botSend_=()=>{};
 ctx.botPanel_=()=>{};
 ctx.botAdminCommand_(42,42,'/hepsiniac','/hepsiniac');
 assert.equal(values.get('FLAG_AI'),undefined);
 assert.equal(values.get('FLAG_PUBLISH'),undefined);
 values.set('TELEGRAM_GROUP_ID','-10012345');
 values.set('OPENAI_API_KEY','unit-test-dummy-key');
 ctx.botAdminCommand_(42,42,'/hepsiniac','/hepsiniac');
 assert.equal(values.get('FLAG_AI'),'true');
 assert.equal(values.get('FLAG_MODERATION'),'true');
 assert.equal(values.get('FLAG_PUBLISH'),'true');
 ctx.botAdminCommand_(42,42,'/aikapat','/aikapat');
 assert.equal(values.get('FLAG_AI'),'false');
});
test('unauthorized user cannot change admin control flags',()=>{
 values.set('FLAG_AI','false');
 ctx.botAdminCommand_(123,123,'/aiac','/aiac');
 assert.equal(values.get('FLAG_AI'),'false');
});

test('authorized group /bagla configures group ID, notifies admin and does not spam group',()=>{
 values.set('ADMIN_USER_IDS','42');
 values.delete('TELEGRAM_GROUP_ID');
 const calls=[];
 ctx.botConfig_=(key,otherwise)=>values.has(key)?values.get(key):(otherwise||'');
 ctx.botSend_=(id,body,options)=>calls.push({id,body,options});
 ctx.botGroup_({from:{id:42},chat:{id:-100888,title:'Ornek test grubu',type:'supergroup'},text:'/bagla'});
 assert.equal(values.get('TELEGRAM_GROUP_ID'),'-100888');
 assert.equal(calls.length,1);
 assert.equal(calls[0].id,42);
 assert.match(calls[0].body,/Grup baglandi/);
 ctx.botGroup_({from:{id:42},chat:{id:-100777,title:'Yanlis',type:'supergroup'},text:'/bagla'});
 assert.equal(values.get('TELEGRAM_GROUP_ID'),'-100888');
});
test('only authorized admin can add or remove an RSS source from Telegram',()=>{
 values.set('ADMIN_USER_IDS','42');
 values.delete('NEWS_FEEDS');
 ctx.botConfig_=(key,otherwise)=>values.has(key)?values.get(key):(otherwise||'');
 ctx.botSend_=()=>{};
 ctx.botAdminSetup_(123,123,'/kaynak https://example.org/rss','/kaynak');
 assert.equal(values.has('NEWS_FEEDS'),false);
 ctx.botAdminSetup_(42,42,'/kaynak https://example.org/rss','/kaynak');
 assert.ok(values.get('NEWS_FEEDS').includes('example.org|https://example.org/rss'));
 ctx.botAdminSetup_(42,42,'/kaynak https://example.org/rss','/kaynak');
 assert.equal(ctx.botFeeds_().length,1);
 ctx.botAdminSetup_(42,42,'/kaynaksil 1','/kaynaksil');
 assert.equal(ctx.botFeeds_().length,0);
});
test('RSS configuration rejects HTTP, embedded separators and private addresses',()=>{
 values.set('ADMIN_USER_IDS','42');values.delete('NEWS_FEEDS');
 ctx.botConfig_=(key,otherwise)=>values.has(key)?values.get(key):(otherwise||'');
 ctx.botSend_=()=>{};
 for(const entry of ['/kaynak http://example.org/rss','/kaynak https://127.0.0.1/a','/kaynak https://example.org/rss;bad','/kaynak https://example.org/rss|injection']){
  ctx.botAdminSetup_(42,42,entry,'/kaynak');
 }
 assert.equal(ctx.botFeeds_().length,0);
});
