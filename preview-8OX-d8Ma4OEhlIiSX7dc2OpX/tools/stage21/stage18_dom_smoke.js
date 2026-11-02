const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=process.argv[2],els=new Map();class Node{constructor(){this.innerHTML='';this.hidden=false;this.dataset={}}set id(v){this._id=v;els.set(v,this)}get id(){return this._id}insertAdjacentElement(_,n){if(n.id)els.set(n.id)}appendChild(n){if(n.id)els.set(n.id)}prepend(n){if(n.id)els.set(n.id,n)}addEventListener(){}}
const detail=new Node();const forms=new Node();forms.id='detailForms';const document={body:new Node(),getElementById:id=>els.get(id)||null,querySelector:s=>s==='.detail-body'?detail:null,createElement:()=>new Node(),addEventListener:()=>{}};
const window={},ctx=vm.createContext({window,document,console,setTimeout,Map,Set});function load(f){vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f,timeout:15000})}
document.body.appendChild=n=>{if(n.src){load(n.src.split('?')[0]);n.onload?.()}};
load('stage26-item-names.js');load('stage17-data.js');load('stage20.js');
const tick=()=>new Promise(r=>setImmediate(r));async function show(id){window.ER_STAGE20.show(id);for(let j=0;j<5;j++)await tick();return els.get('stage20EvolutionDetail').innerHTML}
(async()=>{
 const data=window.ER_STAGE17_DATA;assert.equal(data.formShifts.length,113);assert.equal(data.deevLinks.length,10);
 let h=await show(479);assert(h.includes('파티 메뉴 선택·폼 변경 실행 경로')&&h.includes('실제 게임 플레이 검증은 아직 하지 않았습니다'));assert.equal((h.match(/폼 변화 관계 \(조건 미검증\)/g)||[]).length,5);
 h=await show(676);assert(h.includes('게임 엔진 성별 판정 확인'));assert(h.includes('암컷 폼 변화 관계')&&h.includes('수컷 폼 변화 관계'));
 h=await show(1852);assert.equal((h.match(/수컷 폼 변화 관계/g)||[]).length,7);
 h=await show(133);assert(h.includes('파티 메뉴·PC의 진화 목록 코드'));assert.equal((h.match(/별도 레벨·아이템 조건 없음/g)||[]).length,8);
 h=await show(800);assert.equal((h.match(/퇴화 대상 \(발동 조건 미검증\)/g)||[]).length,2);
 h=await show(667);assert(h.includes('수컷일 때 Lv.35에 진화')&&h.includes('암컷일 때 Lv.35에 진화'));
 h=await show(384);assert(h.includes('화룡점정'));
 assert(!h.includes('100% 입수 가능'));console.log('PASS STAGE18 VM: engine path labels, forms/deev, gender, prior evolutions');
})().catch(err=>{console.error(err);process.exitCode=1});
