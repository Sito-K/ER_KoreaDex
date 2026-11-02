'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const base=process.argv[2];if(!base)throw Error('site directory needed');
let checks=[];
function makeDom(){
 const nodes=new Map(),pending=[];
 class Node {
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.dataset={};this.hidden=false;this.innerHTML='';this.textContent='';this.attributes={};this.eventHandlers={};this.children=[];this.className='';this.style={};this.isConnected=true}
  set id(id){this._id=id;nodes.set(id,this)}get id(){return this._id}
  addEventListener(type,fn){(this.eventHandlers[type]??=[]).push(fn)}
  insertAdjacentElement(_,child){this.appendChild(child)}
  appendChild(child){this.children.push(child);if(child.id)nodes.set(child.id,child);if(child.tagName==='SCRIPT')pending.push(child);return child}
  prepend(child){this.appendChild(child)}
  remove(){this.isConnected=false;for(let i=pending.length-1;i>=0;i--)if(pending[i]===this)pending.splice(i,1)}
  querySelector(s){let id=s.match(/^#([\w-]+)$/);return id?(nodes.get(id[1])||null):null}
  closest(){return null}
 }
 const body=new Node('body'),detailBody=new Node('div'),extra=new Node('section');extra.id='detailPokemonExtra';
 const type=new Node('div');type.id='detailType';type.textContent='포켓몬 · 전국도감';
 const backdrop=new Node('div');backdrop.id='detailBackdrop';backdrop.hidden=false;
 const doc={body,activeElement:new Node('button'),getElementById:id=>nodes.get(id)||null,
   createElement:tag=>new Node(tag),addEventListener(){},
   querySelector:s=>s==='.detail-body'?detailBody:s.startsWith('script[data-')?pending.find(n=>n.tagName==='SCRIPT'&&n.dataset[s.slice(12,-1)]!==undefined)||null:null};
 // The selector parser above is intentionally narrow: stageNN-data is in .dataset under its actual camelCase key.
 doc.querySelector=s=>{if(s==='.detail-body')return detailBody;if(s.startsWith('script[data-')){const token=s.slice('script[data-'.length,-1).replace(/-([a-z])/g,(_,x)=>x.toUpperCase());return pending.find(n=>Object.hasOwn(n.dataset,token))||null}return null};
 return {Node,document:doc,pending,nodes,detailBody,backdrop,type};
}
async function scenario(mod,src,extraFiles=[]){
 const d=makeDom(),window={};const context=vm.createContext({window,document:d.document,console,setTimeout,clearTimeout,Map,Set,Promise,Number,String});
 const load=f=>vm.runInContext(fs.readFileSync(path.join(base,f),'utf8'),context,{filename:f,timeout:20000});
 for(const x of extraFiles)load(x);load(mod);
 const apiName=({ 'stage19.js':'ER_STAGE19','stage20.js':'ER_STAGE20','stage21.js':'ER_STAGE21','stage25.js':'ER_STAGE25_DETAIL'})[mod];
 assert(window[apiName],mod);const api=window[apiName];
 const tick=async()=>{for(let i=0;i<8;i++)await new Promise(r=>setImmediate(r))};
 async function finish(fail=false){assert(d.pending.length,`no script pending ${mod}`);const script=d.pending[0];if(fail){script.onerror?.(new Error('simulated transient load failure'))}else{const file=String(script.src).split('?')[0];load(file);script.onload?.()}await tick();return script}
 return {d,api,finish,tick};
}
(async()=>{
 for(const [mod,key,id,extra,selector] of [
  ['stage19.js','stage19SpeciesDetail',1,[],'.s19-loading'],
  ['stage20.js','stage20EvolutionDetail',133,['stage26-item-names.js','stage17-data.js'],'.s20-loading'],
  ['stage21.js','stage21EncounterDetail',1,['stage22-map-ko.js'],'.s21-loading']]){
   const s=await scenario(mod,null,extra);s.api.show(id);assert(s.d.pending.length===1,mod+' lazy script');
   const box=s.d.nodes.get(key);assert(box&&!box.hidden,mod+' loading visible');
   s.api.hide();assert(box.hidden,mod+' hidden by navigation');
   await s.finish();assert(box.hidden,mod+' stale async completion should not reveal');
   s.api.show(id);await s.tick();assert(!box.hidden&&box.innerHTML&&!box.innerHTML.includes('불러오는 중'),mod+' subsequent render');
   checks.push({test:mod+' stale-render and reuse',pass:true});
 }
 // Two fast selections before the initial data loads: the most recent selection owns the UI.
 {
  const s=await scenario('stage20.js',null,['stage26-item-names.js','stage17-data.js']);
  s.api.show(133);s.api.show(800);await s.finish();const box=s.d.nodes.get('stage20EvolutionDetail');
  assert.equal((box.innerHTML.match(/퇴화 대상 \(발동 조건 미검증\)/g)||[]).length,2);
  checks.push({test:'stage20 most recent selection wins',pass:true});
 }
 // Failure should clear a rejected promise and stale <script> so a second click can retry.
 for(const [mod,id,extra] of [
  ['stage19.js',25,[]],
  ['stage20.js',133,['stage26-item-names.js','stage17-data.js']],
  ['stage21.js',25,['stage22-map-ko.js']]]){
  const s=await scenario(mod,null,extra);
  s.api.show(id);const old=s.d.pending[0];await s.finish(true);
  assert.equal(s.d.pending.length,0,mod+' failure cleanup');assert.equal(old.isConnected,false);
  s.api.show(id);assert.equal(s.d.pending.length,1,mod+' recreate script');await s.finish();
  checks.push({test:mod+' failed fetch retry',pass:true});
 }
 // An unfulfilled detail lookup cannot open a closed reference modal.
 {
  const s=await scenario('stage25.js');s.api.open('moves',1);assert(s.d.pending.length===1);s.api.close();await s.finish();
  assert.equal(s.d.nodes.get('s25ReferenceBackdrop'),undefined,'closed STAGE25 modal must not appear');
  checks.push({test:'stage25 cancel pending modal',pass:true});
 }
 console.log('PASS STAGE19 async VM:',checks.length,'scenarios');
 process.argv[3]&&fs.writeFileSync(process.argv[3],JSON.stringify({status:'PASS',checks},null,2)+'\n');
})().catch(e=>{console.error('FAIL STAGE19 async VM:',e.stack);process.exitCode=1});
