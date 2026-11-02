#!/usr/bin/env node
'use strict';
// Offline static/structural guard; real Chromium QA report is STAGE33_DEVICE_BROWSER_QA.json.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(process.argv[2]||'.'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html'),css=read('stage33-mobile-a11y.css');
const audit=JSON.parse(read('STAGE33_DEVICE_BROWSER_QA.json'));
assert(html.includes('<title>Elite Redux 한글 도감 · v1.1 (최신 버전)</title>'));
assert(html.includes('class="s33-mobile-latest">최신 버전</span>'));
assert(html.includes('class="s33-game-source">원본 소스 2.65.4.2</span>'));
assert(html.includes('aria-label="포켓몬, 기술, 특성 이름 또는 도감 번호 검색"'));
assert(html.includes('<span aria-hidden="true">⌕</span>'));
assert(html.includes('id="result" role="status" aria-live="polite" aria-atomic="true"'));
assert(html.includes('stage33-mobile-a11y.css?v=20261103-stage33'));
assert(css.includes('@media (max-width:360px)')&&css.includes('white-space:nowrap'));
const pos1=html.indexOf('src="pokemon-data.js'),pos2=html.indexOf('src="species-name-overrides-v01.js'),pos3=html.indexOf('src="stage30-name-disambiguation.js'),pos4=html.indexOf('src="app-stage13.js');
assert(pos1>=0&&pos1<pos2&&pos2<pos3&&pos3<pos4);
const ctx={window:{}};vm.createContext(ctx);
for(const file of ['pokemon-data.js','species-name-overrides-v01.js','stage30-name-disambiguation.js','stage25-detail-data.js'])vm.runInContext(read(file),ctx,{filename:file});
const mons=ctx.window.ER_POKEMON_DATA,detail=ctx.window.ER_STAGE25_DETAIL_DATA;
assert(mons.length===1938&&new Set(mons.map(r=>r[0])).size===1938&&new Set(mons.map(r=>r[2])).size===1938);
assert(detail.moves.length===1040&&detail.abilities.length===1083);
assert(audit.chromiumBrowserActions.passed===125&&audit.accessibilityAndResponsive.passed===45);
console.log('STAGE33 PASS: v1.1 labels, 1938 unique Pokemon forms, 1040 moves, 1083 abilities, browser QA 125 + responsive/accessibility QA 45');
