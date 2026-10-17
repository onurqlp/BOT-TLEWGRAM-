import test from 'node:test';
import assert from 'node:assert/strict';
import {escapeHTML,parseFeed,spamScore,isSafeHttps} from '../src/utils.js';
test('protect Telegram HTML',()=>assert.equal(escapeHTML('<a>&'), '&lt;a&gt;&amp;'));
test('parse RSS sample',()=>{const r=parseFeed('<rss><channel><item><title>Test</title><link>https://example.org/x</link><description>Short</description></item></channel></rss>','Demo');assert.equal(r.length,1);assert.equal(r[0].title,'Test')});
test('do not accept untrusted schemes',()=>assert.equal(isSafeHttps('javascript:alert(1)'),false));
test('low false positives',()=>assert.equal(spamScore('Ders bugün başladı mı?'),0));
test('detect link flood',()=>assert.ok(spamScore('https://a.co https://b.co https://c.co')>=3));
