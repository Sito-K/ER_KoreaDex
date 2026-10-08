(()=>{'use strict';
const raw=Array.isArray(window.ER_SPECIES)?window.ER_SPECIES:[];
const rows=raw.filter(r=>Array.isArray(r)&&r.length>=3&&String(r[2]||'').trim()).map(r=>({id:Number(r[0]),en:String(r[1]||''),ko:String(r[2]||'')}));
const q=document.getElementById('q'),grid=document.getElementById('grid'),empty=document.getElementById('empty'),count=document.getElementById('count'),result=document.getElementById('result');
count.textContent=rows.length.toLocaleString('ko-KR');
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function render(){const term=(q.value||'').trim().toLocaleLowerCase('ko-KR');const out=term?rows.filter(x=>x.ko.toLocaleLowerCase('ko-KR').includes(term)||x.en.toLowerCase().includes(term)||String(x.id+1).includes(term)):rows;grid.innerHTML=out.map(x=>`<article class="card"><div class="num">#${String(x.id+1).padStart(4,'0')}</div><div class="ko">${esc(x.ko)}</div><div class="en">${esc(x.en)}</div></article>`).join('');result.textContent=`${out.length.toLocaleString('ko-KR')}개`;empty.hidden=out.length!==0}
q.addEventListener('input',render);document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();q.focus();q.select()}});render();
})();