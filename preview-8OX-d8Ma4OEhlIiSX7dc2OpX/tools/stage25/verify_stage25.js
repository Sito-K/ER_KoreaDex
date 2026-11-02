const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const dir=path.resolve(process.argv[2]||'.'),d={window:{},console,Map,Set,setTimeout};
class El{constructor(){this.dataset={};this.innerHTML='';this.hidden=false;this.textContent=''}insertAdjacentElement(_,n){eles.set(n.id,n)}appendChild(n){if(n.id)eles.set(n.id,n); if(n.src){load(n.src.split('?')[0]);n.onload?.()}}prepend(n){if(n.id)eles.set(n.id,n)}addEventListener(){}remove(){}}
let eles=new Map();const body=new El();d.document={body,querySelector:(s)=>s==='.detail-body'?body:null,getElementById:id=>eles.get(id)||null,createElement:()=>new El(),addEventListener(){}};
const ctx=vm.createContext(d);function load(file){vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),ctx,{filename:file})}
load('stage22-map-ko.js');load('stage21.js');
const next=()=>new Promise(r=>setImmediate(r));async function show(id){d.window.ER_STAGE21.show(id);for(let i=0;i<5;i++)await next();return eles.get('stage21EncounterDetail').innerHTML}
(async()=>{
 let x=await show(12);assert(x.includes('출현 기록 수는 장소 수가 아닙니다'));assert(x.includes('건</span>'));assert(!x.includes('곳</span>'));assert(x.includes('야생 출현'));
 x=await show(1);assert(x.includes('15 BP'));assert(x.includes('실제 접근·구매·포획 여부는 검증되지 않았습니다'));assert(x.includes('입양센터 판매'));
 x=await show(11);assert(x.includes('출현 기록 수는 장소 수가 아닙니다'));
 x=await show(2);assert(x.includes('확인된 야생·스크립트 출현 정보가 없습니다.'));assert(!x.includes('출현 기록 수는 장소 수가 아닙니다'));
 console.log('STAGE25 PASS: wild count unit and scope, source-only 15 BP warning, empty state');
})().catch(e=>{console.error(e);process.exitCode=1});
