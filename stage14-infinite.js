(()=>{'use strict';
const button=document.getElementById('loadMore');
const wrap=button?.closest('.load-more-wrap');
if(!button||!wrap)return;
wrap.classList.add('auto-load-sentinel');
button.setAttribute('aria-hidden','true');
button.tabIndex=-1;
function hasMore(){return !button.hidden}
let queued=false;
function requestMore(){
  if(queued||!hasMore())return;
  queued=true;
  requestAnimationFrame(()=>{
    queued=false;
    if(hasMore())button.click();
  });
}
const observer=new IntersectionObserver(entries=>{
  if(entries.some(e=>e.isIntersecting))requestMore();
},{root:null,rootMargin:'900px 0px 900px 0px',threshold:0});
observer.observe(wrap);
const stateObserver=new MutationObserver(()=>{
  if(hasMore())requestMore();
});
stateObserver.observe(wrap,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
window.ER_STAGE14_SCROLL_META={stage:14,mode:'intersection-observer',pageSize:48,buttonVisible:false};
})();
