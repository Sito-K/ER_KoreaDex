'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const site=process.argv[2],results=[];
function makeDom(){
 const nodes=new Map(),scripts=[];
 class El {
  constructor(tag='div',id=''){this.tagName=tag.toUpperCase();this.id=id;this.dataset={};this.hidden=false;this.innerHTML='';this.textContent='';this.children=[];this.listeners={};this.isConnected=true;this.attributes={};this.scrollTop=7;if(id)nodes.set(id,this)}
  appendChild(el){this.children.push(el);if(el.id)nodes.set(el.id,el);if(el.tagName==='SCRIPT')scripts.push(el)}
  addEventListener(k,f){(this.listeners[k]??=[]).push(f)}
  remove(){this.isConnected=false;const i=scripts.indexOf(this);if(i>=0)scripts.splice(i,1)}
  focus(){doc.activeElement=this}
  querySelector(s){if(!s.startsWith('#')&&!s.startsWith('.'))return null;
    if(this.id==='s25ReferenceBackdrop'){const id=s.startsWith('#')?s.slice(1):s;
      if(!nodes.has(id)){const el=new El('div',id);nodes.set(id,el)}
      return nodes.get(id)}return null}
 }
 const parent=new El('div','detailBackdrop'),title=new El('div','detailTitle'),type=new El('div','detailType');title.textContent='이상해씨';type.textContent='포켓몬 · 전국도감';const body=new El('body');const oldFocus=new El('button');
 body.classList={add(){},remove(){}};
 const doc={body,activeElement:oldFocus,getElementById:id=>nodes.get(id)||null,createElement:tag=>new El(tag),querySelector:s=>{
  if(s==='script[data-stage25-detail-data]')return scripts.find(x=>Object.hasOwn(x.dataset,'stage25DetailData'))||null;return null},addEventListener(){}};
 const window={};const context=vm.createContext({window,document:doc,console,Promise,Map,Number,String});
 const load=f=>vm.runInContext(fs.readFileSync(path.join(site,f),'utf8'),context,{filename:f,timeout:20000});
 load('stage25.js');
 const complete=async(fail=false)=>{assert(scripts.length===1,'pending script required');const s=scripts[0];if(fail)s.onerror?.(new Error('network failure'));else{load('stage25-detail-data.js');s.onload?.()}for(let i=0;i<5;i++)await new Promise(r=>setImmediate(r));};
 return {nodes,parent,title,type,window,complete,oldFocus};
}
async function run(){
 let x=makeDom();x.window.ER_STAGE25_DETAIL.open('moves',1);x.parent.hidden=true;await x.complete();assert(!x.nodes.has('s25ReferenceBackdrop'),'closed parent must not cause reference modal');results.push('01 parent closed during loading -> stale result suppressed');
 x=makeDom();x.window.ER_STAGE25_DETAIL.open('abilities',1);x.title.textContent='다른 포켓몬';await x.complete();assert(!x.nodes.has('s25ReferenceBackdrop'),'species switched must not create old reference');results.push('02 species changes during loading -> stale result suppressed');
 x=makeDom();x.window.ER_STAGE25_DETAIL.open('moves',1);x.parent.hidden=true;await x.complete(true);assert(!x.nodes.has('s25ReferenceBackdrop'),'failed load after close must not open modal');results.push('03 rejected data load after parent closed -> suppressed');
 x=makeDom();x.window.ER_STAGE25_DETAIL.open('moves',1);await x.complete();const modal=x.nodes.get('s25ReferenceBackdrop');assert(modal&&!modal.hidden,'active parent may open referenced move');assert(/막치기/.test(x.nodes.get('s25ReferenceTitle').textContent));x.window.ER_STAGE25_DETAIL.close();assert(modal.hidden);assert.equal(x.nodes.get('s25ReferenceClose').isConnected,true);results.push('04 active parent loads move details and close still works');
 console.log('PASS STAGE20 reference race VM:',results.length,'scenarios');process.argv[3]&&fs.writeFileSync(process.argv[3],JSON.stringify({status:'PASS',tests:results},null,2)+'\n');
}
run().catch(e=>{console.error(e.stack);process.exitCode=1});
