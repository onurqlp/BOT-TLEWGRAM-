export function escapeHTML(s='') {return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
export function stripHTML(s='') {return String(s).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();}
export function decodeXML(s='') {return s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");}
export function takeTag(xml,tag) { const m = xml.match(new RegExp('<(?:[\\w-]+:)?'+tag+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[\\w-]+:)?'+tag+'>','i')); return m?decodeXML(stripHTML(m[1])):''; }
export function isSafeHttps(url) {try {let u=new URL(url);return u.protocol==='https:'&&!['localhost','127.0.0.1'].includes(u.hostname)&&!u.hostname.endsWith('.local')}catch{return false}}
export function parseFeed(xml,source) {
 const parts = [...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].slice(0,20);
 return parts.map(m=>{
  const x=m[2]; const title=takeTag(x,'title').slice(0,220);
  const rssLink=takeTag(x,'link');const atomLink=x.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1]||'';
  const url=decodeXML(rssLink||atomLink).trim();
  const summary=(takeTag(x,'description')||takeTag(x,'summary')).slice(0,500);
  return {title,url,summary,source};
 }).filter(x=>x.title&&isSafeHttps(x.url));
}
export function spamScore(text=''){
 const x=text.toLowerCase(); let p=0;
 const links=(text.match(/https?:\/\/\S+/gi)||[]).length;
 if(links>=3)p+=3;
 if(/(?:t\.me\/\+|t\.me\/joinchat\/)/i.test(x))p+=2;
 if(/(?:free money|guaranteed profit|garantili kazanç|bedava usdt)/i.test(x))p+=2;
 if(text.length>1000&&links>=1)p+=1;
 return p;
}
export function fromISOTimeToTR(d){return new Date(d).toLocaleString('tr-TR',{timeZone:'Europe/Istanbul'})}
