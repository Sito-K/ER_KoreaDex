'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const site=process.argv[2];if(!site)throw Error('site required');
const tests=[];const nodes=new Map(),listeners={},observers=[];
class E {
 constructor(id='',classes=[]){this.id=id;this.hidden=false;this.isConnected=true;this.inert=false;this.scrollTop=7;this.attrs={};this.dataset={};this.classSet=new Set(classes);this.classList={contains:x=>this.classSet.has(x),toggle:(x,value)=>{const v=value===undefined?!this.classSet.has(x):value;v?this.classSet.add(x):this.classSet.delete(x);return v}};this.parent=null;this.focusables=[];this.close=null;this.dialog=null;this._focusCount=0;if(id)nodes.set(id,this)}
 getClientRects(){return [1]}
 getAttribute(k){return this.attrs[k]}
 setAttribute(k,v){this.attrs[k]=String(v)}
 removeAttribute(k){delete this.attrs[k]}
 focus(){doc.activeElement=this;this._focusCount++}
 contains(x){while(x){if(x===this)return true;x=x.parent}return false}
 closest(sel){if(sel==='[hidden]')return null;
  if(sel.includes('.is-detail')&&this.isLauncher)return this;
  if(sel.includes('.form-link')&&this.isFormLink)return this;
  if(sel.includes('.tab')&&this.isTab)return this;
  return null}
 querySelector(sel){if(sel==='.detail-close')return this.close;if(sel==='[role="dialog"]')return this.dialog;if(sel==='.detail-body')return this.bodyArea;return null}
 querySelectorAll(){return this.focusables}
}
const header=new E('header'),main=new E('main'),body=new E('body'),base=new E('detailBackdrop'),baseDialog=new E('baseDialog'),baseClose=new E('detailClose'),formBtn=new E('formbtn'),q=new E('q'),launcher=new E('launcher'),otherBtn=new E('otherBtn');
const tabs=[new E('tabP',['active']),new E('tabM'),new E('tabA')];tabs.forEach(x=>x.isTab=true);
base.hidden=true;base.dialog=baseDialog;baseDialog.parent=base;baseClose.parent=baseDialog;formBtn.parent=baseDialog;base.focusables=[baseClose,formBtn];base.close=baseClose;base.bodyArea=new E('detailBody');base.bodyArea.parent=baseDialog;
launcher.isLauncher=true;
const doc={body,activeElement:launcher,getElementById:id=>nodes.get(id)||null,querySelectorAll:sel=>sel==='header.top, main'?[header,main]:sel==='.tabs .tab[data-view]'?tabs:[],addEventListener:(type,fn)=>{(listeners[type]??=[]).push(fn)}};
class MutationObserver{constructor(cb){this.callback=cb;observers.push(this)}observe(){} }
const context=vm.createContext({window:{},document:doc,MutationObserver,queueMicrotask,console});
vm.runInContext(fs.readFileSync(path.join(site,'stage20-accessibility.js'),'utf8'),context,{filename:'stage20-accessibility.js',timeout:15000});
const api=context.window.ER_STAGE20_ACCESSIBILITY;assert(api);
function notify(node){for(const obs of observers)obs.callback([{type:'attributes',target:node,attributeName:'hidden',addedNodes:[]}])}
function dispatch(type,target,opts={}){const event={type,target,key:opts.key||'',shiftKey:!!opts.shiftKey,defaultPrevented:false,preventDefault(){this.defaultPrevented=true}};for(const fn of listeners[type]||[])fn(event);return event}
function ok(name,fn){fn();tests.push({name,status:'PASS'})}
ok('01 initial background is reachable',()=>{assert.equal(main.inert,false);assert.equal(body.classSet.has('modal-open'),false);assert.equal(tabs[0].attrs['aria-pressed'],'true');assert.equal(tabs[1].attrs['aria-pressed'],'false')});
ok('02 card launcher tracked',()=>{dispatch('click',launcher)});
ok('03 base modal locks background and focuses close',()=>{base.hidden=false;notify(base);assert.equal(main.inert,true);assert.equal(header.inert,true);assert.equal(body.classSet.has('modal-open'),true);assert.equal(doc.activeElement,baseClose)});
ok('04 Tab wraps last to first',()=>{formBtn.focus();const e=dispatch('keydown',formBtn,{key:'Tab'});assert.equal(e.defaultPrevented,true);assert.equal(doc.activeElement,baseClose)});
ok('05 ShiftTab wraps first to last',()=>{baseClose.focus();const e=dispatch('keydown',baseClose,{key:'Tab',shiftKey:true});assert.equal(e.defaultPrevented,true);assert.equal(doc.activeElement,formBtn)});
ok('06 outside focus redirected to active dialog',()=>{q.focus();dispatch('focusin',q);assert.equal(doc.activeElement,baseClose)});
ok('07 species switch scroll reset',()=>{formBtn.isFormLink=true;dispatch('click',formBtn);return});
ok('08 closing base restores launcher',()=>{base.hidden=true;notify(base);assert.equal(doc.activeElement,launcher);assert.equal(body.classSet.has('modal-open'),false);assert.equal(main.inert,false)});
ok('09 removed launcher falls back to search',()=>{launcher.isConnected=false;dispatch('click',launcher);base.hidden=false;notify(base);base.hidden=true;notify(base);assert.equal(doc.activeElement,q);launcher.isConnected=true});
let ref;
ok('10 nested reference dialog becomes topmost',()=>{base.hidden=false;notify(base);ref=new E('s25ReferenceBackdrop');ref.hidden=true;ref.dialog=new E('refDialog');ref.dialog.parent=ref;ref.close=new E('refClose');ref.close.parent=ref.dialog;const refSecond=new E('refSecond');refSecond.parent=ref.dialog;ref.focusables=[ref.close,refSecond];ref.hidden=false;notify(ref);assert.equal(doc.activeElement,ref.close);assert.equal(baseDialog.attrs['aria-hidden'],'true')});
ok('11 Tab trap prioritizes reference dialog',()=>{const last=ref.focusables[1];last.focus();const ev=dispatch('keydown',last,{key:'Tab'});assert.equal(ev.defaultPrevented,true);assert.equal(doc.activeElement,ref.close)});
ok('12 closing reference keeps main modal locked',()=>{ref.hidden=true;notify(ref);assert.equal(body.classSet.has('modal-open'),true);assert.equal(main.inert,true);assert.equal(baseDialog.attrs['aria-hidden'],undefined)});
ok('13 closing base unlocks background',()=>{base.hidden=true;notify(base);assert.equal(main.inert,false);assert.equal(header.inert,false);assert.equal(body.classSet.has('modal-open'),false)});
(async()=>{const css=fs.readFileSync(path.join(site,'stage20-accessibility.css'),'utf8');assert(/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/.test(css));assert(/min-height:44px/.test(css));assert(/prefers-reduced-motion/.test(css));tests.push({name:'14 three mobile tabs, 44px touch and reduced motion CSS',status:'PASS'});await new Promise(r=>setImmediate(r));assert.equal(base.bodyArea.scrollTop,0);tests.push({name:'15 scrolling reset after navigation',status:'PASS'});console.log('PASS STAGE20 accessibility VM:',tests.length,'scenarios');process.argv[3]&&fs.writeFileSync(process.argv[3],JSON.stringify({status:'PASS',tests},null,2)+'\n')})().catch(e=>{console.error(e.stack);process.exitCode=1});
