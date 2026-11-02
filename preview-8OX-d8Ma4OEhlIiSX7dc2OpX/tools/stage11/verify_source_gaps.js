'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(process.argv[2]||'.');
const ctx=vm.createContext({window:{}});
function load(f){vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f,timeout:30000});}
for(const f of ['stage11-source-gaps.js','move-names-canonical.js','move-short-canonical.js','move-long-canonical.js','ability-names-canonical.js','ability-short-canonical.js','ability-long-canonical.js','stage25-detail-data.js','pokemon-data.js'])load(f);
const w=ctx.window,g=w.ER_STAGE11_GAPS;
assert(g.stage===11);assert(g.missingMoveShort.length===9);assert(g.missingAbilityLong.length===178);
function map(x){return new Map(x.map(r=>[Number(r[0]),r[1]]));}
const ms=map(w.ER_MOVE_SHORT_KO),ml=map(w.ER_MOVE_LONG_KO),as=map(w.ER_ABILITY_SHORT_KO),al=map(w.ER_ABILITY_LONG_KO);
const mr=new Map(w.ER_STAGE25_DETAIL_DATA.moves.map(r=>[Number(r[0]),r]));
const ar=new Map(w.ER_STAGE25_DETAIL_DATA.abilities.map(r=>[Number(r[0]),r]));
for(const i of g.missingMoveShort){assert(ms.get(i));assert.strictEqual(ms.get(i),ml.get(i));assert.strictEqual(mr.get(i)[2],ms.get(i));assert.strictEqual(mr.get(i)[3],ms.get(i));}
for(const i of g.missingAbilityLong){assert(as.get(i));assert.strictEqual(as.get(i),al.get(i));assert.strictEqual(ar.get(i)[2],as.get(i));assert.strictEqual(ar.get(i)[3],as.get(i));}
const sp=new Map(w.ER_POKEMON_DATA.map(r=>[r[0],r]));
assert(sp.get(2126)[3]==='Amicabull');assert(sp.get(2502)[3]==='Clawed Mimic');
for(const [i,en,ko] of [[2126,'Amicabull','아미카불'],[2502,'Clawed Mimic','발톱미믹'],[2334,'Cauldrican','콜드리칸'],[2335,'Numberg','넘버그'],[2336,'Cameberg','카메버그'],[2337,'Maniberg','마니버그'],[2338,'Swarmos','스웜모스'],[2339,'Camoudon','카무돈']]){
  assert(sp.get(i)[3]===en);
  assert(sp.get(i)[2]===ko);
}
assert(g.source_game_commit==='888d826064ba45d9febfa3a64d8a2b9d34503360');
assert(as.get(1075)==='일렉트릭필드의 영향을 받으면 전기 기술 위력이 50% 증가한다.');
assert(al.get(1075)==='일렉트릭필드의 영향을 받는 동안 전기타입 기술의 위력이 50% 증가한다.');
assert(as.get(1080)==='발차기 기술은 상대의 특수방어로 계산하며 위력이 1.3배가 된다.');
assert(al.get(1080)===as.get(1080));
for(const [name,key,col] of [['stage20-data.js','ER_STAGE20_DATA',1],['stage21-data.js','ER_STAGE21_DATA',1]]){
 load(name);
 const r=new Map(w[key].species.map(x=>[x[0],x]));
 assert(r.get(2126)[col]==='아미카불');assert(r.get(2502)[col]==='발톱미믹');
}
const idx=fs.readFileSync(path.join(root,'index.html'),'utf8');assert(idx.indexOf('stage11-source-gaps.js')<idx.indexOf('app-stage13.js'));
const a=fs.readFileSync(path.join(root,'app-stage13.js'),'utf8'),b=fs.readFileSync(path.join(root,'stage25.js'),'utf8');
assert(a.includes('요약 설명으로 대체') && a.includes('상세 설명으로 대체'));
assert(b.includes('요약 설명으로 대체') && b.includes('상세 설명으로 대체'));
const summary={result:'PASS',source_blank_ability_long:g.missingAbilityLong.length,source_blank_move_short:g.missingMoveShort.length,verified_proper_names:8,remapped_ids:2,latest_game_commit:g.source_game_commit,stage25_fallback_rows:187};
console.log(JSON.stringify(summary,null,2));
if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(summary,null,2)+'\n');
