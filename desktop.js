(()=>{'use strict';
const mq=window.matchMedia('(min-width:900px)');
const fine=window.matchMedia('(hover:hover) and (pointer:fine)');
function sync(){document.documentElement.classList.toggle('desktop-ui',mq.matches);document.documentElement.classList.toggle('fine-pointer',fine.matches)}
sync();mq.addEventListener?.('change',sync);fine.addEventListener?.('change',sync);
function focusSearch(){const q=document.getElementById('q');if(q){q.focus();q.select?.()}}
document.addEventListener('keydown',e=>{
 const tag=(document.activeElement?.tagName||'').toLowerCase();const typing=tag==='input'||tag==='textarea'||tag==='select'||document.activeElement?.isContentEditable;
 if((e.ctrlKey||e.metaKey)&&String(e.key).toLowerCase()==='k'){e.preventDefault();focusSearch();return}
 if(e.key==='/'&&!typing){e.preventDefault();focusSearch();return}
 if(e.key==='Escape'){
  const bd=document.getElementById('backdrop');if(bd&&!bd.classList.contains('hidden')){document.getElementById('close')?.click();return}
  const q=document.getElementById('q');if(q&&q.value){q.value='';q.dispatchEvent(new Event('input',{bubbles:true}))}
 }
 if((e.key==='Enter'||e.key===' ')&&document.activeElement?.matches?.('.card,.relation-card,.ability-box,.tag')){e.preventDefault();document.activeElement.click()}
});
function enhance(root=document){
 root.querySelectorAll?.('.card,.relation-card,.ability-box,.tag').forEach(el=>{if(!/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(el.tagName)&&!el.hasAttribute('tabindex'))el.tabIndex=0});
}
enhance();
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)enhance(n)}).observe(document.body,{childList:true,subtree:true});
const q=document.getElementById('q');if(q)q.title='검색 (Ctrl/⌘+K 또는 /)';
})();
