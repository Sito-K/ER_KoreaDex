(()=>{'use strict';
const speciesRaw=Array.isArray(window.ER_SPECIES)?window.ER_SPECIES:[];
const officialRaw=Array.isArray(window.ER_OFFICIAL_SPECIES)?window.ER_OFFICIAL_SPECIES:[];
const pokemonRaw=Array.isArray(window.ER_POKEMON_DATA)?window.ER_POKEMON_DATA:[];
const moveRaw=Array.isArray(window.ER_MOVES)?window.ER_MOVES:[];
const abilityRaw=Array.isArray(window.ER_ABILITIES)?window.ER_ABILITIES:[];
const moveDesc=new Map((Array.isArray(window.ER_MOVE_SHORT_KO)?window.ER_MOVE_SHORT_KO:[]).map(r=>[Number(r[0]),String(r[1]||'')]));
const abilityDesc=new Map((Array.isArray(window.ER_ABILITY_SHORT_KO)?window.ER_ABILITY_SHORT_KO:[]).map(r=>[Number(r[0]),String(r[1]||'')]));
const moveLong=new Map((Array.isArray(window.ER_MOVE_LONG_KO)?window.ER_MOVE_LONG_KO:[]).map(r=>[Number(r[0]),String(r[1]||'')]));
const abilityLong=new Map((Array.isArray(window.ER_ABILITY_LONG_KO)?window.ER_ABILITY_LONG_KO:[]).map(r=>[Number(r[0]),String(r[1]||'')]));
function speciesFallback(){
 const raw=officialRaw.length?officialRaw:speciesRaw;
 return raw.filter(r=>Array.isArray(r)&&r.length>=3&&String(r[2]||'').trim()).map(r=>officialRaw.length?({id:Number(r[0]),en:String(r[1]||''),ko:String(r[2]||''),dex:Number(r[3]||0),form:Boolean(r[4]),token:String(r[5]||''),sprite:'',types:[],stats:null}):({id:Number(r[0]),en:String(r[1]||''),ko:String(r[2]||''),dex:Number(r[0])+1,form:false,token:'',sprite:'',types:[],stats:null}));
}
function makeStats(r){const s={hp:Number(r[7]||0),atk:Number(r[8]||0),def:Number(r[9]||0),spa:Number(r[10]||0),spd:Number(r[11]||0),spe:Number(r[12]||0)};return Object.values(s).every(v=>v>0)?s:null}
const species=(pokemonRaw.length?pokemonRaw.map(r=>({id:Number(r[0]),dex:Number(r[1]),ko:String(r[2]||''),en:String(r[3]||''),sprite:String(r[4]||''),types:[String(r[5]||''),String(r[6]||'')].filter(Boolean),stats:makeStats(r),form:Boolean(r[13]),token:String(r[14]||'')})).filter(x=>x.id>0&&x.ko):speciesFallback());
const speciesById=new Map(species.map(x=>[x.id,x]));
const formGroups=new Map();for(const x of species){if(!formGroups.has(x.dex))formGroups.set(x.dex,[]);formGroups.get(x.dex).push(x)}
const moves=moveRaw.filter(r=>Array.isArray(r)&&Number(r[0])>0&&String(r[1]||'').trim()&&String(r[1]||'').trim()!=="'-").map(r=>({id:Number(r[0]),ko:String(r[1]||''),desc:moveDesc.get(Number(r[0]))||'',long:moveLong.get(Number(r[0]))||''}));
const abilities=abilityRaw.filter(r=>Array.isArray(r)&&Number(r[0])>0&&String(r[1]||'').trim()).map(r=>({id:Number(r[0]),ko:String(r[1]||''),desc:abilityDesc.get(Number(r[0]))||'',long:abilityLong.get(Number(r[0]))||''}));
const TYPE_ORDER=['노말','불꽃','물','풀','전기','얼음','격투','독','땅','비행','에스퍼','벌레','바위','고스트','드래곤','악','강철','페어리','스텔라'];
const STAT_LABELS=[['hp','체력'],['atk','공격'],['spa','특공'],['def','방어'],['spd','특방'],['spe','스피드']];
const q=document.getElementById('q'),grid=document.getElementById('grid'),empty=document.getElementById('empty'),count=document.getElementById('count'),countLabel=document.getElementById('countLabel'),result=document.getElementById('result'),title=document.getElementById('title'),tabs=[...document.querySelectorAll('.tab')];
const filters=document.getElementById('pokemonFilters'),typeFilters=document.getElementById('typeFilters'),resetFilters=document.getElementById('resetFilters'),sortPokemon=document.getElementById('sortPokemon'),showForms=document.getElementById('showForms');
const backdrop=document.getElementById('detailBackdrop'),detailType=document.getElementById('detailType'),detailTitle=document.getElementById('detailTitle'),detailShort=document.getElementById('detailShort'),detailLong=document.getElementById('detailLong'),detailShortLabel=document.getElementById('detailShortLabel'),detailLongLabel=document.getElementById('detailLongLabel'),detailPokemonExtra=document.getElementById('detailPokemonExtra'),detailFormsSection=document.getElementById('detailFormsSection'),detailForms=document.getElementById('detailForms'),detailClose=document.getElementById('detailClose');
let view='pokemon';const activeTypes=new Set();
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function current(){return view==='moves'?moves:view==='abilities'?abilities:species}
function bst(x){if(!x.stats)return 0;return x.stats.hp+x.stats.atk+x.stats.def+x.stats.spa+x.stats.spd+x.stats.spe}
function matches(x,term){if(!term)return true;if(view==='pokemon')return x.ko.toLocaleLowerCase('ko-KR').includes(term)||x.en.toLowerCase().includes(term)||String(x.dex).includes(term)||String(x.id).includes(term)||x.types.some(t=>t.includes(term));return x.ko.toLocaleLowerCase('ko-KR').includes(term)||String(x.id).includes(term)||(x.desc||'').toLocaleLowerCase('ko-KR').includes(term)||(x.long||'').toLocaleLowerCase('ko-KR').includes(term)}
function meta(){if(view==='moves')return['기술 도감','불러온 기술','한국어 기술 이름 / 설명 / 기술 ID 검색'];if(view==='abilities')return['특성 도감','불러온 특성','한국어 특성 이름 / 설명 / 특성 ID 검색'];return['포켓몬 도감','불러온 포켓몬·폼','포켓몬 이름 또는 도감 번호를 검색해주세요']}
function spriteUrl(x){return x.sprite?`https://raw.githubusercontent.com/ForwardFeed/ER-nextdex/main/static/sprites/${encodeURIComponent(x.sprite)}.png`:''}
function typeChips(types){return types.length?types.map(t=>`<span class="type-chip" data-type="${esc(t)}">${esc(t)}</span>`).join(''):'<span class="stats-unavailable">타입 데이터 준비 중</span>'}
function statCells(x){if(!x.stats)return '<div class="stats-unavailable">종족값 데이터 준비 중</div>';return `<div class="mini-stats">${STAT_LABELS.map(([k,l])=>`<div><span>${l}</span><b>${x.stats[k]}</b></div>`).join('')}</div>`}
function pokemonCard(x){const img=spriteUrl(x);return `<article class="card species-card is-detail${x.form?' is-form':''}" role="button" tabindex="0" data-kind="pokemon" data-id="${x.id}" aria-label="${esc(x.ko)} 상세 보기"><div class="sprite-wrap">${img?`<img class="sprite" src="${img}" alt="${esc(x.ko)}" loading="lazy" decoding="async">`:''}<span class="sprite-fallback">?</span></div><div class="card-copy"><div class="num"><span>No.${String(x.dex).padStart(4,'0')}</span>${x.form?'<span class="form-badge">FORM</span>':''}</div><div class="ko">${esc(x.ko)}</div><div class="en">${esc(x.en)}</div><div class="type-row">${typeChips(x.types)}</div>${statCells(x)}<div class="detail-hint">${(formGroups.get(x.dex)||[]).length>1?'다른 폼 / 상세 정보':'상세 정보'}</div></div></article>`}
function render(){
 const rows=current(),term=(q.value||'').trim().toLocaleLowerCase('ko-KR'),m=meta();let out=rows.filter(x=>matches(x,term));
 if(view==='pokemon'){
   if(activeTypes.size)out=out.filter(x=>x.types.some(t=>activeTypes.has(t)));
   if(showForms&&!showForms.checked)out=out.filter(x=>!x.form);
   const mode=sortPokemon?.value||'dex';out=[...out].sort((a,b)=>mode==='name'?a.ko.localeCompare(b.ko,'ko'):mode==='bst'?bst(b)-bst(a)||a.dex-b.dex:a.dex-b.dex||a.id-b.id);
 }
 count.textContent=rows.length.toLocaleString('ko-KR');countLabel.textContent=m[1];title.textContent=m[0];result.textContent=`${out.length.toLocaleString('ko-KR')}개`;q.placeholder=m[2];
 filters.hidden=view!=='pokemon';grid.classList.toggle('moves',view!=='pokemon');grid.classList.toggle('pokemon-grid',view==='pokemon');
 grid.innerHTML=view==='pokemon'?out.map(pokemonCard).join(''):out.map(x=>`<article class="card move-card is-detail" role="button" tabindex="0" data-kind="${view}" data-id="${x.id}" aria-label="${esc(x.ko)} 상세 보기"><div class="num">${view==='moves'?'MOVE':'ABILITY'} #${String(x.id).padStart(4,'0')}</div><div class="ko">${esc(x.ko)}</div>${x.desc?`<div class="desc">${esc(x.desc)}</div>`:''}<div class="detail-hint">상세 보기</div></article>`).join('');
 empty.hidden=out.length!==0;
}
function renderTypeFilters(){if(!typeFilters)return;const present=new Set(species.flatMap(x=>x.types));typeFilters.innerHTML=TYPE_ORDER.filter(t=>present.has(t)).map(t=>`<button type="button" class="type-filter" data-type="${esc(t)}" aria-pressed="false"><span class="type-dot" data-type="${esc(t)}"></span>${esc(t)}</button>`).join('')}
function findDetail(kind,id){if(kind==='pokemon')return speciesById.get(id);const rows=kind==='moves'?moves:abilities;return rows.find(x=>x.id===id)}
function renderForms(x){const siblings=formGroups.get(x.dex)||[];detailFormsSection.hidden=siblings.length<=1;detailForms.innerHTML=siblings.length<=1?'':siblings.map(s=>`<button class="form-link${s.id===x.id?' active':''}" type="button" data-id="${s.id}" aria-current="${s.id===x.id?'true':'false'}"><strong>${esc(s.ko)}</strong><span>${esc(s.en)}</span></button>`).join('');return siblings}
function renderPokemonExtra(x){if(!detailPokemonExtra)return;const img=spriteUrl(x),stats=x.stats?STAT_LABELS.map(([k,l])=>{const v=x.stats[k],w=Math.max(2,Math.min(100,(v/255)*100));return `<div class="detail-stat"><span>${l}</span><b>${v}</b><i><em style="width:${w.toFixed(1)}%"></em></i></div>`}).join(''):'';detailPokemonExtra.innerHTML=`<div class="pokemon-detail-overview"><div class="detail-sprite-wrap">${img?`<img class="detail-sprite" src="${img}" alt="${esc(x.ko)}">`:''}<span class="sprite-fallback">?</span></div><div class="detail-pokemon-data"><div class="type-row">${typeChips(x.types)}</div>${x.stats?`<div class="detail-stats">${stats}</div><div class="bst">종족값 합계 <b>${bst(x)}</b></div>`:'<p class="muted">공식 NextDex에 이 폼의 종족값이 비어 있습니다.</p>'}</div></div>`;detailPokemonExtra.hidden=false}
function openDetail(kind,id,keepFocus=false){
 const x=findDetail(kind,id);if(!x)return;
 if(kind==='pokemon'){
   const siblings=renderForms(x);renderPokemonExtra(x);detailType.textContent=`포켓몬 · 전국도감 No.${String(x.dex).padStart(4,'0')}`;detailTitle.textContent=x.ko;detailShortLabel.textContent='영문명';detailShort.textContent=x.en;detailLongLabel.textContent='폼 정보';detailLong.textContent=siblings.length>1?`같은 도감 번호로 등록된 모습이 ${siblings.length.toLocaleString('ko-KR')}종 있습니다. 아래에서 다른 폼으로 바로 전환할 수 있습니다.`:'이 도감 번호에는 별도로 등록된 폼이 없습니다.';
 }else{
   const isMove=kind==='moves';detailPokemonExtra.hidden=true;detailPokemonExtra.innerHTML='';detailFormsSection.hidden=true;detailForms.innerHTML='';detailType.textContent=`${isMove?'기술':'특성'} · ${isMove?'MOVE':'ABILITY'} #${String(x.id).padStart(4,'0')}`;detailTitle.textContent=x.ko;detailShortLabel.textContent='요약 설명';detailShort.textContent=x.desc||'요약 설명이 없습니다.';detailLongLabel.textContent='상세 설명';detailLong.textContent=x.long||x.desc||'상세 설명이 없습니다.';
 }
 backdrop.hidden=false;document.body.classList.add('modal-open');if(!keepFocus)detailClose.focus();
}
function closeDetail(){if(backdrop.hidden)return;backdrop.hidden=true;document.body.classList.remove('modal-open')}
q.addEventListener('input',render);
tabs.forEach(btn=>btn.addEventListener('click',()=>{view=btn.dataset.view||'pokemon';tabs.forEach(x=>x.classList.toggle('active',x===btn));q.value='';closeDetail();render();window.scrollTo({top:0,behavior:'smooth'})}));
if(typeFilters)typeFilters.addEventListener('click',e=>{const btn=e.target.closest('.type-filter');if(!btn)return;const t=btn.dataset.type;if(activeTypes.has(t))activeTypes.delete(t);else activeTypes.add(t);btn.classList.toggle('active',activeTypes.has(t));btn.setAttribute('aria-pressed',activeTypes.has(t)?'true':'false');render()});
if(resetFilters)resetFilters.addEventListener('click',()=>{activeTypes.clear();typeFilters?.querySelectorAll('.type-filter').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false')});if(sortPokemon)sortPokemon.value='dex';if(showForms)showForms.checked=true;q.value='';render()});
if(sortPokemon)sortPokemon.addEventListener('change',render);if(showForms)showForms.addEventListener('change',render);
grid.addEventListener('click',e=>{const card=e.target.closest('.is-detail');if(card)openDetail(card.dataset.kind,Number(card.dataset.id))});
grid.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('.is-detail')){e.preventDefault();const card=e.target.closest('.is-detail');openDetail(card.dataset.kind,Number(card.dataset.id))}});
grid.addEventListener('error',e=>{if(e.target?.classList?.contains('sprite')){e.target.hidden=true;e.target.closest('.sprite-wrap')?.classList.add('no-image')}},true);
detailPokemonExtra?.addEventListener('error',e=>{if(e.target?.classList?.contains('detail-sprite')){e.target.hidden=true;e.target.closest('.detail-sprite-wrap')?.classList.add('no-image')}},true);
detailForms.addEventListener('click',e=>{const btn=e.target.closest('.form-link');if(btn)openDetail('pokemon',Number(btn.dataset.id),true)});
detailClose.addEventListener('click',closeDetail);backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeDetail()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!backdrop.hidden){closeDetail();return}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();q.focus();q.select()}});
renderTypeFilters();render();
})();
