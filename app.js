(()=>{'use strict';
const speciesRaw=Array.isArray(window.ER_SPECIES)?window.ER_SPECIES:[];
const moveRaw=Array.isArray(window.ER_MOVES)?window.ER_MOVES:[];
const abilityRaw=Array.isArray(window.ER_ABILITIES)?window.ER_ABILITIES:[];
const moveDesc=new Map((Array.isArray(window.ER_MOVE_SHORT_KO)?window.ER_MOVE_SHORT_KO:[]).map(r=>[Number(r[0]),String(r[1]||'')]));
const abilityDesc=new Map((Array.isArray(window.ER_ABILITY_SHORT_KO)?window.ER_ABILITY_SHORT_KO:[]).map(r=>[Number(r[0]),String(r[1]||'')]));
const moveLong=new Map((Array.isArray(window.ER_MOVE_LONG_KO)?window.ER_MOVE_LONG_KO:[]).map(r=>[Number(r[0]),String(r[1]||'')]));
const abilityLong=new Map((Array.isArray(window.ER_ABILITY_LONG_KO)?window.ER_ABILITY_LONG_KO:[]).map(r=>[Number(r[0]),String(r[1]||'')]));
const species=speciesRaw.filter(r=>Array.isArray(r)&&r.length>=3&&String(r[2]||'').trim()).map(r=>({id:Number(r[0]),en:String(r[1]||''),ko:String(r[2]||'')}));
const moves=moveRaw.filter(r=>Array.isArray(r)&&Number(r[0])>0&&String(r[1]||'').trim()&&String(r[1]||'').trim()!=="'-").map(r=>({id:Number(r[0]),ko:String(r[1]||''),desc:moveDesc.get(Number(r[0]))||'',long:moveLong.get(Number(r[0]))||''}));
const abilities=abilityRaw.filter(r=>Array.isArray(r)&&Number(r[0])>0&&String(r[1]||'').trim()).map(r=>({id:Number(r[0]),ko:String(r[1]||''),desc:abilityDesc.get(Number(r[0]))||'',long:abilityLong.get(Number(r[0]))||''}));
const q=document.getElementById('q'),grid=document.getElementById('grid'),empty=document.getElementById('empty'),count=document.getElementById('count'),countLabel=document.getElementById('countLabel'),result=document.getElementById('result'),title=document.getElementById('title'),tabs=[...document.querySelectorAll('.tab')];
const backdrop=document.getElementById('detailBackdrop'),detailType=document.getElementById('detailType'),detailTitle=document.getElementById('detailTitle'),detailShort=document.getElementById('detailShort'),detailLong=document.getElementById('detailLong'),detailClose=document.getElementById('detailClose');
let view='pokemon';
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function current(){return view==='moves'?moves:view==='abilities'?abilities:species}
function matches(x,term){if(!term)return true;if(view==='pokemon')return x.ko.toLocaleLowerCase('ko-KR').includes(term)||x.en.toLowerCase().includes(term)||String(x.id+1).includes(term);return x.ko.toLocaleLowerCase('ko-KR').includes(term)||String(x.id).includes(term)||(x.desc||'').toLocaleLowerCase('ko-KR').includes(term)||(x.long||'').toLocaleLowerCase('ko-KR').includes(term)}
function meta(){if(view==='moves')return['기술','불러온 기술','한국어 기술 이름 / 설명 / 기술 ID 검색'];if(view==='abilities')return['특성','불러온 특성','한국어 특성 이름 / 설명 / 특성 ID 검색'];return['포켓몬','불러온 포켓몬','한국어 / 영어 포켓몬 이름 검색']}
function render(){
 const rows=current(),term=(q.value||'').trim().toLocaleLowerCase('ko-KR'),out=rows.filter(x=>matches(x,term)),m=meta();
 count.textContent=rows.length.toLocaleString('ko-KR');countLabel.textContent=m[1];title.textContent=m[0];result.textContent=`${out.length.toLocaleString('ko-KR')}개`;q.placeholder=m[2];
 grid.classList.toggle('moves',view!=='pokemon');
 grid.innerHTML=view==='pokemon'?out.map(x=>`<article class="card"><div class="num">#${String(x.id+1).padStart(4,'0')}</div><div class="ko">${esc(x.ko)}</div><div class="en">${esc(x.en)}</div></article>`).join(''):out.map(x=>`<article class="card move-card is-detail" role="button" tabindex="0" data-kind="${view}" data-id="${x.id}" aria-label="${esc(x.ko)} 상세 보기"><div class="num">${view==='moves'?'MOVE':'ABILITY'} #${String(x.id).padStart(4,'0')}</div><div class="ko">${esc(x.ko)}</div>${x.desc?`<div class="desc">${esc(x.desc)}</div>`:''}<div class="detail-hint">상세 보기</div></article>`).join('');
 empty.hidden=out.length!==0;
}
function findDetail(kind,id){const rows=kind==='moves'?moves:abilities;return rows.find(x=>x.id===id)}
function openDetail(kind,id){const x=findDetail(kind,id);if(!x)return;const isMove=kind==='moves';detailType.textContent=`${isMove?'기술':'특성'} · ${isMove?'MOVE':'ABILITY'} #${String(x.id).padStart(4,'0')}`;detailTitle.textContent=x.ko;detailShort.textContent=x.desc||'요약 설명이 없습니다.';detailLong.textContent=x.long||x.desc||'상세 설명이 없습니다.';backdrop.hidden=false;document.body.classList.add('modal-open');detailClose.focus()}
function closeDetail(){if(backdrop.hidden)return;backdrop.hidden=true;document.body.classList.remove('modal-open')}
q.addEventListener('input',render);
tabs.forEach(btn=>btn.addEventListener('click',()=>{view=btn.dataset.view||'pokemon';tabs.forEach(x=>x.classList.toggle('active',x===btn));q.value='';closeDetail();render();window.scrollTo({top:0,behavior:'smooth'})}));
grid.addEventListener('click',e=>{const card=e.target.closest('.is-detail');if(card)openDetail(card.dataset.kind,Number(card.dataset.id))});
grid.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('.is-detail')){e.preventDefault();const card=e.target.closest('.is-detail');openDetail(card.dataset.kind,Number(card.dataset.id))}});
detailClose.addEventListener('click',closeDetail);backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeDetail()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!backdrop.hidden){closeDetail();return}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();q.focus();q.select()}});
render();
})();
