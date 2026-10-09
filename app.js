(()=>{'use strict';
const speciesRaw=Array.isArray(window.ER_SPECIES)?window.ER_SPECIES:[];
const officialRaw=Array.isArray(window.ER_OFFICIAL_SPECIES)?window.ER_OFFICIAL_SPECIES:[];
const moveRaw=Array.isArray(window.ER_MOVES)?window.ER_MOVES:[];
const abilityRaw=Array.isArray(window.ER_ABILITIES)?window.ER_ABILITIES:[];
const moveDesc=new Map((Array.isArray(window.ER_MOVE_SHORT_KO)?window.ER_MOVE_SHORT_KO:[]).map(r=>[Number(r[0]),String(r[1]||'')]));
const abilityDesc=new Map((Array.isArray(window.ER_ABILITY_SHORT_KO)?window.ER_ABILITY_SHORT_KO:[]).map(r=>[Number(r[0]),String(r[1]||'')]));
const moveLong=new Map((Array.isArray(window.ER_MOVE_LONG_KO)?window.ER_MOVE_LONG_KO:[]).map(r=>[Number(r[0]),String(r[1]||'')]));
const abilityLong=new Map((Array.isArray(window.ER_ABILITY_LONG_KO)?window.ER_ABILITY_LONG_KO:[]).map(r=>[Number(r[0]),String(r[1]||'')]));
const species=(officialRaw.length?officialRaw:speciesRaw).filter(r=>Array.isArray(r)&&r.length>=3&&String(r[2]||'').trim()).map(r=>officialRaw.length?({id:Number(r[0]),en:String(r[1]||''),ko:String(r[2]||''),dex:Number(r[3]||0),form:Boolean(r[4]),token:String(r[5]||'')}):({id:Number(r[0]),en:String(r[1]||''),ko:String(r[2]||''),dex:Number(r[0])+1,form:false,token:''}));
const speciesById=new Map(species.map(x=>[x.id,x]));
const formGroups=new Map();
for(const x of species){if(!formGroups.has(x.dex))formGroups.set(x.dex,[]);formGroups.get(x.dex).push(x)}
const moves=moveRaw.filter(r=>Array.isArray(r)&&Number(r[0])>0&&String(r[1]||'').trim()&&String(r[1]||'').trim()!=="'-").map(r=>({id:Number(r[0]),ko:String(r[1]||''),desc:moveDesc.get(Number(r[0]))||'',long:moveLong.get(Number(r[0]))||''}));
const abilities=abilityRaw.filter(r=>Array.isArray(r)&&Number(r[0])>0&&String(r[1]||'').trim()).map(r=>({id:Number(r[0]),ko:String(r[1]||''),desc:abilityDesc.get(Number(r[0]))||'',long:abilityLong.get(Number(r[0]))||''}));
const q=document.getElementById('q'),grid=document.getElementById('grid'),empty=document.getElementById('empty'),count=document.getElementById('count'),countLabel=document.getElementById('countLabel'),result=document.getElementById('result'),title=document.getElementById('title'),tabs=[...document.querySelectorAll('.tab')];
const backdrop=document.getElementById('detailBackdrop'),detailType=document.getElementById('detailType'),detailTitle=document.getElementById('detailTitle'),detailShort=document.getElementById('detailShort'),detailLong=document.getElementById('detailLong'),detailShortLabel=document.getElementById('detailShortLabel'),detailLongLabel=document.getElementById('detailLongLabel'),detailFormsSection=document.getElementById('detailFormsSection'),detailForms=document.getElementById('detailForms'),detailClose=document.getElementById('detailClose');
let view='pokemon';
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function current(){return view==='moves'?moves:view==='abilities'?abilities:species}
function matches(x,term){if(!term)return true;if(view==='pokemon')return x.ko.toLocaleLowerCase('ko-KR').includes(term)||x.en.toLowerCase().includes(term)||String(x.dex).includes(term)||String(x.id).includes(term);return x.ko.toLocaleLowerCase('ko-KR').includes(term)||String(x.id).includes(term)||(x.desc||'').toLocaleLowerCase('ko-KR').includes(term)||(x.long||'').toLocaleLowerCase('ko-KR').includes(term)}
function meta(){if(view==='moves')return['기술','불러온 기술','한국어 기술 이름 / 설명 / 기술 ID 검색'];if(view==='abilities')return['특성','불러온 특성','한국어 특성 이름 / 설명 / 특성 ID 검색'];return['포켓몬','불러온 포켓몬·폼','한국어 / 영어 포켓몬·폼 이름 / 도감 번호 검색']}
function render(){
 const rows=current(),term=(q.value||'').trim().toLocaleLowerCase('ko-KR'),out=rows.filter(x=>matches(x,term)),m=meta();
 count.textContent=rows.length.toLocaleString('ko-KR');countLabel.textContent=m[1];title.textContent=m[0];result.textContent=`${out.length.toLocaleString('ko-KR')}개`;q.placeholder=m[2];
 grid.classList.toggle('moves',view!=='pokemon');
 grid.innerHTML=view==='pokemon'?out.map(x=>`<article class="card species-card is-detail${x.form?' is-form':''}" role="button" tabindex="0" data-kind="pokemon" data-id="${x.id}" aria-label="${esc(x.ko)} 상세 보기"><div class="num"><span>#${String(x.dex).padStart(4,'0')}</span>${x.form?'<span class="form-badge">폼</span>':''}</div><div class="ko">${esc(x.ko)}</div><div class="en">${esc(x.en)}</div><div class="detail-hint">${(formGroups.get(x.dex)||[]).length>1?'폼 보기':'상세 보기'}</div></article>`).join(''):out.map(x=>`<article class="card move-card is-detail" role="button" tabindex="0" data-kind="${view}" data-id="${x.id}" aria-label="${esc(x.ko)} 상세 보기"><div class="num">${view==='moves'?'MOVE':'ABILITY'} #${String(x.id).padStart(4,'0')}</div><div class="ko">${esc(x.ko)}</div>${x.desc?`<div class="desc">${esc(x.desc)}</div>`:''}<div class="detail-hint">상세 보기</div></article>`).join('');
 empty.hidden=out.length!==0;
}
function findDetail(kind,id){if(kind==='pokemon')return speciesById.get(id);const rows=kind==='moves'?moves:abilities;return rows.find(x=>x.id===id)}
function renderForms(x){
 const siblings=formGroups.get(x.dex)||[];
 detailFormsSection.hidden=siblings.length<=1;
 detailForms.innerHTML=siblings.length<=1?'':siblings.map(s=>`<button class="form-link${s.id===x.id?' active':''}" type="button" data-id="${s.id}" aria-current="${s.id===x.id?'true':'false'}"><strong>${esc(s.ko)}</strong><span>${esc(s.en)}</span></button>`).join('');
 return siblings;
}
function openDetail(kind,id,keepFocus=false){
 const x=findDetail(kind,id);if(!x)return;
 if(kind==='pokemon'){
   const siblings=renderForms(x);
   detailType.textContent=`포켓몬 · 전국도감 #${String(x.dex).padStart(4,'0')}`;
   detailTitle.textContent=x.ko;
   detailShortLabel.textContent='영문명';detailShort.textContent=x.en;
   detailLongLabel.textContent='폼 정보';detailLong.textContent=siblings.length>1?`같은 도감 번호로 등록된 모습이 ${siblings.length.toLocaleString('ko-KR')}종 있습니다. 아래에서 다른 폼으로 바로 전환할 수 있습니다.`:'이 도감 번호에는 별도로 등록된 폼이 없습니다.';
 }else{
   const isMove=kind==='moves';
   detailFormsSection.hidden=true;detailForms.innerHTML='';
   detailType.textContent=`${isMove?'기술':'특성'} · ${isMove?'MOVE':'ABILITY'} #${String(x.id).padStart(4,'0')}`;
   detailTitle.textContent=x.ko;
   detailShortLabel.textContent='요약 설명';detailShort.textContent=x.desc||'요약 설명이 없습니다.';
   detailLongLabel.textContent='상세 설명';detailLong.textContent=x.long||x.desc||'상세 설명이 없습니다.';
 }
 backdrop.hidden=false;document.body.classList.add('modal-open');if(!keepFocus)detailClose.focus();
}
function closeDetail(){if(backdrop.hidden)return;backdrop.hidden=true;document.body.classList.remove('modal-open')}
q.addEventListener('input',render);
tabs.forEach(btn=>btn.addEventListener('click',()=>{view=btn.dataset.view||'pokemon';tabs.forEach(x=>x.classList.toggle('active',x===btn));q.value='';closeDetail();render();window.scrollTo({top:0,behavior:'smooth'})}));
grid.addEventListener('click',e=>{const card=e.target.closest('.is-detail');if(card)openDetail(card.dataset.kind,Number(card.dataset.id))});
grid.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('.is-detail')){e.preventDefault();const card=e.target.closest('.is-detail');openDetail(card.dataset.kind,Number(card.dataset.id))}});
detailForms.addEventListener('click',e=>{const btn=e.target.closest('.form-link');if(btn)openDetail('pokemon',Number(btn.dataset.id),true)});
detailClose.addEventListener('click',closeDetail);backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeDetail()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!backdrop.hidden){closeDetail();return}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();q.focus();q.select()}});
render();
})();
