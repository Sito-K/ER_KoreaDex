(()=>{'use strict';
function arrangeCard(card){
  if(!card||card.dataset.stage9Ready==='1')return;
  const copy=card.querySelector('.card-copy');
  if(!copy)return;
  const num=copy.querySelector(':scope > .num');
  const ko=copy.querySelector(':scope > .ko');
  const en=copy.querySelector(':scope > .en');
  if(!num||!ko||!en)return;
  const head=document.createElement('div');
  head.className='card-head';
  head.append(num,ko,en);
  const sprite=card.querySelector(':scope > .sprite-wrap');
  card.insertBefore(head,sprite||card.firstChild);
  card.dataset.stage9Ready='1';
}
function arrangeAll(){document.querySelectorAll('.species-card').forEach(arrangeCard)}
let queued=false;
function queueArrange(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;arrangeAll()})}
const grid=document.getElementById('grid');
if(grid)new MutationObserver(queueArrange).observe(grid,{childList:true,subtree:true});
arrangeAll();
})();
