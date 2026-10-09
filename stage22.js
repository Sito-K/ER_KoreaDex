(()=>{'use strict';
const targets=[['stage20EvolutionDetail','진화'],['stage19SpeciesDetail','특성·기술'],['stage21EncounterDetail','출현·획득']];
function body(){return document.querySelector('.detail-body')}
function host(){const b=body();if(!b)return null;let nav=document.getElementById('stage22DetailNav');if(nav)return nav;nav=document.createElement('nav');nav.id='stage22DetailNav';nav.className='s22-nav';nav.hidden=true;nav.setAttribute('aria-label','포켓몬 상세 빠른 이동');nav.innerHTML=`${targets.map(([id,label])=>`<button type="button" data-target="${id}">${label}</button>`).join('')}<span class="s22-nav-spacer"></span><button type="button" class="s22-nav-toggle" data-fold="open">전체 펼치기</button><button type="button" class="s22-nav-toggle" data-fold="close">전체 접기</button>`;const extra=document.getElementById('detailPokemonExtra');if(extra)extra.insertAdjacentElement('afterend',nav);else b.prepend(nav);return nav}
function visibleSections(){return targets.map(([id])=>document.getElementById(id)).filter(el=>el&&!el.hidden)}
function setHidden(el,value){if(el&&el.hidden!==value)el.hidden=value}
function sync(){const nav=host();if(!nav)return;const vis=visibleSections();setHidden(nav,!vis.length);for(const btn of nav.querySelectorAll('[data-target]')){const el=document.getElementById(btn.dataset.target);setHidden(btn,!el||el.hidden)}}
function fold(open){for(const section of visibleSections())for(const d of section.querySelectorAll('details'))d.open=open}
function deferredSync(){setTimeout(sync,0);setTimeout(sync,120)}
document.addEventListener('click',e=>{const jump=e.target.closest?.('#stage22DetailNav [data-target]');if(jump){const el=document.getElementById(jump.dataset.target);if(el&&!el.hidden)el.scrollIntoView({behavior:'smooth',block:'start'});return}const f=e.target.closest?.('#stage22DetailNav [data-fold]');if(f){fold(f.dataset.fold==='open');return}if(e.target.closest?.('.species-card[data-kind="pokemon"],.form-link[data-id],.tab[data-view]'))deferredSync()});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest?.('.species-card[data-kind="pokemon"],.form-link[data-id]'))deferredSync()});
const start=()=>{host();sync()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.ER_STAGE22_UI={sync,fold};
})();
