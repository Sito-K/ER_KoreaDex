const fs=require('fs'), vm=require('vm'), path=require('path'), assert=require('assert');
const root=process.argv[2];const els=new Map();
class Node {
 constructor(){this.innerHTML='';this.hidden=false;this.dataset={}}
 set id(v){this._id=v;els.set(v,this)}get id(){return this._id}
 insertAdjacentElement(_,n){if(n.id)els.set(n.id,n)}appendChild(n){if(n.id)els.set(n.id,n)}prepend(n){if(n.id)els.set(n.id,n)}addEventListener(){}
}
const forms=new Node();forms.id='detailForms';const detail=new Node();
const document={body:new Node(),getElementById:id=>els.get(id)||null,querySelector:s=>s==='.detail-body'?detail:null,createElement:()=>new Node(),addEventListener:()=>{}};
const window={},ctx=vm.createContext({window,document,console,setTimeout,Map,Set});
function load(f){vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f,timeout:15000})}
document.body.appendChild=n=>{if(n.src){load(n.src.split('?')[0]);n.onload?.()}};
load('stage26-item-names.js');load('stage20.js');
const tick=()=>new Promise(r=>setImmediate(r));
async function show(id){window.ER_STAGE20.show(id);for(let j=0;j<6;j++)await tick();return els.get('stage20EvolutionDetail').innerHTML}
(async()=>{
 let h=await show(667);
 assert.strictEqual((h.match(/data-id="668"/g)||[]).length,2,'Litleo should show two gender-conditioned records');
 assert(h.includes('수컷일 때 Lv.35에 진화')&&h.includes('암컷일 때 Lv.35에 진화'));
 h=await show(668);
 assert.strictEqual((h.match(/data-id="667"/g)||[]).length,2,'Pyroar reverse links');
 assert(h.includes('수컷일 때 Lv.35에 진화')&&h.includes('암컷일 때 Lv.35에 진화'));
 h=await show(281);assert(h.includes('수컷일 때 Lv.30에 진화'),'Kirlia -> Gallade');
 h=await show(361);assert(h.includes('암컷일 때 Lv.23에 진화'),'Snorunt -> Froslass');
 h=await show(412);assert(h.includes('암컷일 때 Lv.20에 진화')&&h.includes('수컷일 때 Lv.20에 진화'),'Burmy branches');
 h=await show(384);assert(h.includes('화룡점정')&&!h.includes('MOVE_DRAGON_ASCENT'),'Rayquaza retained previous fix');
 h=await show(1);assert(h.includes('Lv.16에 진화')&&!h.includes('수컷일 때 Lv.16'),'normal evos unaffected');
 console.log('PASS STAGE16 DOM: gender split/reciprocal rows/branches, normal evolution, Rayquaza translation');
})().catch(e=>{console.error(e);process.exitCode=1});
