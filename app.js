(()=>{'use strict';
const speciesRaw=Array.isArray(window.ER_SPECIES)?window.ER_SPECIES:[];
const moveRaw=Array.isArray(window.ER_MOVES)?window.ER_MOVES:[];
const species=speciesRaw.filter(r=>Array.isArray(r)&&r.length>=3&&String(r[2]||'').trim()).map(r=>({id:Number(r[0]),en:String(r[1]||''),ko:String(r[2]||'')}));
const moves=moveRaw.filter(r=>Array.isArray(r)&&Number(r[0])>0&&String(r[1]||'').trim()&&String(r[1]||'').trim()!=="'-").map(r=>({id:Number(r[0]),ko:String(r[1]||'')}));
const q=document.getElementById('q'),grid=document.getElementById('grid'),empty=document.getElementById('empty'),count=document.getElementById('count'),countLabel=document.getElementById('countLabel'),result=document.getElementById('result'),title=document.getElementById('title'),tabs=[...document.querySelectorAll('.tab')];
let view='pokemon';
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function current(){return view==='moves'?moves:species}
function matches(x,term){if(!term)return true;if(view==='moves')return x.ko.toLocaleLowerCase('ko-KR').includes(term)||String(x.id).includes(term);return x.ko.toLocaleLowerCase('ko-KR').includes(term)||x.en.toLowerCase().includes(term)||String(x.id+1).includes(term)}
function render(){
 const rows=current(),term=(q.value||'').trim().toLocaleLowerCase('ko-KR'),out=rows.filter(x=>matches(x,term));
 count.textContent=rows.length.toLocaleString('ko-KR');countLabel.textContent=view==='moves'?'불러온 기술':'불러온 포켓몬';title.textContent=view==='moves'?'기술':'포켓몬';result.textContent=`${out.length.toLocaleString('ko-KR')}개`;
 q.placeholder=view==='moves'?'한국어 기술 이름 / 기술 ID 검색':'한국어 / 영어 포켓몬 이름 검색';
 grid.classList.toggle('moves',view==='moves');
 grid.innerHTML=view==='moves'?out.map(x=>`<article class="card move-card"><div class="num">MOVE #${String(x.id).padStart(4,'0')}</div><div class="ko">${esc(x.ko)}</div></article>`).join(''):out.map(x=>`<article class="card"><div class="num">#${String(x.id+1).padStart(4,'0')}</div><div class="ko">${esc(x.ko)}</div><div class="en">${esc(x.en)}</div></article>`).join('');
 empty.hidden=out.length!==0;
}
q.addEventListener('input',render);
tabs.forEach(btn=>btn.addEventListener('click',()=>{view=btn.dataset.view||'pokemon';tabs.forEach(x=>x.classList.toggle('active',x===btn));q.value='';render();window.scrollTo({top:0,behavior:'smooth'})}));
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();q.focus();q.select()}});
render();
})();
