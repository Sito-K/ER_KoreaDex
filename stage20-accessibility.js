/* STAGE20: native dialog focus and accessible mobile navigation; no source data changes. */
(()=>{'use strict';
const base=document.getElementById('detailBackdrop');
if(!base)return;
const search=document.getElementById('q');
const background=[...document.querySelectorAll('header.top, main')];
const originallyInert=background.map(el=>Boolean(el.inert));
const tabs=[...document.querySelectorAll('.tabs .tab[data-view]')];
let launcher=null,wasBaseOpen=!base.hidden,wasRefOpen=false,guarding=false;
const ref=()=>document.getElementById('s25ReferenceBackdrop');
const refOpen=()=>{const x=ref();return Boolean(x&&!x.hidden)};
const baseOpen=()=>!base.hidden;
function active(){return refOpen()?ref():(baseOpen()?base:null)}
function buttons(scope){
  if(!scope)return[];
  return [...scope.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]
   .filter(el=>!el.hidden&&!el.closest('[hidden]')&&el.getClientRects().length>0);
}
function focusStart(scope){
  const x=scope?.querySelector('.detail-close')||buttons(scope)[0]||scope?.querySelector('[role="dialog"]');
  if(x&&typeof x.focus==='function')x.focus();
}
function updateTabs(){
  for(const tab of tabs){const chosen=tab.classList.contains('active');tab.setAttribute('aria-pressed',chosen?'true':'false')}
}
function sync(){
  const baseVisible=baseOpen(),refVisible=refOpen(),refNode=ref();
  for(let i=0;i<background.length;i++)background[i].inert=(baseVisible||refVisible)?true:originallyInert[i];
  document.body.classList.toggle('modal-open',baseVisible||refVisible);
  const dialog=base.querySelector('[role="dialog"]');
  if(dialog){if(refVisible)dialog.setAttribute('aria-hidden','true');else dialog.removeAttribute('aria-hidden')}
  if(refVisible&&!wasRefOpen){
    if(refNode&&!refNode.contains(document.activeElement))focusStart(refNode);
  }
  if(baseVisible&&!wasBaseOpen&&!refVisible){
    if(!base.contains(document.activeElement))focusStart(base);
  }
  if(!baseVisible&&wasBaseOpen&&!refVisible){
    if(launcher&&launcher.isConnected&&!launcher.closest('[hidden]'))launcher.focus();
    else if(search&&search.isConnected)search.focus();
    launcher=null;
  }
  wasBaseOpen=baseVisible;wasRefOpen=refVisible;updateTabs();
}
function saveLauncher(e){
  if(!base.hidden||refOpen())return;
  const target=e.target?.closest?.('.is-detail[data-kind][data-id]');
  if(target&&target.isConnected)launcher=target;
}
document.addEventListener('click',saveLauncher,true);
document.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&e.target?.closest?.('.is-detail[data-kind][data-id]'))saveLauncher(e);
  if(e.key!=='Tab')return;
  const scope=active();if(!scope)return;
  const allowed=buttons(scope);if(!allowed.length){e.preventDefault();focusStart(scope);return}
  const first=allowed[0],last=allowed[allowed.length-1];
  const focused=document.activeElement;
  if(!scope.contains(focused)){
    e.preventDefault();(e.shiftKey?last:first).focus();return;
  }
  if(e.shiftKey&&focused===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&focused===last){e.preventDefault();first.focus()}
},true);
document.addEventListener('focusin',e=>{
  const scope=active();if(!scope||scope.contains(e.target)||guarding)return;
  guarding=true;try{focusStart(scope)}finally{guarding=false}
},true);
document.addEventListener('click',e=>{
  const tab=e.target?.closest?.('.tab[data-view]');if(tab)queueMicrotask(updateTabs);
  if(e.target?.closest?.('.form-link[data-id],.s20-evo-target[data-id]')){
    const area=base.querySelector('.detail-body');if(area&&!base.hidden)area.scrollTop=0
  }
},false);
const observer=new MutationObserver(items=>{
  if(items.some(x=>x.type==='attributes'&&x.attributeName==='hidden'&&
     (x.target===base||x.target.id==='s25ReferenceBackdrop'))||
     items.some(x=>x.type==='childList'&&[...x.addedNodes].some(n=>n.id==='s25ReferenceBackdrop'))){sync();return}
  if(items.some(x=>x.type==='attributes'&&x.attributeName==='class'&&tabs.includes(x.target)))updateTabs();
});
observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});
sync();
window.ER_STAGE20_ACCESSIBILITY={sync,active,buttons};
})();
