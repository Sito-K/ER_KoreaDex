(()=>{'use strict';
const detailType=document.getElementById('detailType');
const detailBody=document.querySelector('#detailBackdrop .detail-body');
if(!detailType||!detailBody)return;
let referenceMode=false;
let cleaning=false;
const POKEMON_ONLY_IDS=['detailPokemonExtra','detailFormsSection','stage19SpeciesDetail','stage20EvolutionDetail','stage21EncounterDetail'];
function cleanupPokemonOnly(){
  if(!referenceMode||cleaning)return;
  cleaning=true;
  try{
    for(const id of POKEMON_ONLY_IDS){
      const el=document.getElementById(id);
      if(el&&!el.hidden)el.hidden=true;
    }
  }finally{cleaning=false}
}
function syncMode(){
  const text=String(detailType.textContent||'').trim();
  if(/^(기술|특성)\s*·/.test(text)){
    referenceMode=true;
    cleanupPokemonOnly();
  }else if(/^포켓몬\s*·/.test(text)){
    referenceMode=false;
  }
}
new MutationObserver(syncMode).observe(detailType,{childList:true,characterData:true,subtree:true});
new MutationObserver(()=>{if(referenceMode)cleanupPokemonOnly()}).observe(detailBody,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
document.addEventListener('click',e=>{
  const card=e.target.closest?.('.move-card[data-kind="moves"],.move-card[data-kind="abilities"]');
  if(card){referenceMode=true;queueMicrotask(cleanupPokemonOnly);return}
  if(e.target.closest?.('.species-card[data-kind="pokemon"],.form-link[data-id]'))referenceMode=false;
  const tab=e.target.closest?.('.tab[data-view]');
  if(tab&&tab.dataset.view!=='pokemon'){referenceMode=true;queueMicrotask(cleanupPokemonOnly)}
},true);
document.addEventListener('keydown',e=>{
  if(e.key!=='Enter'&&e.key!==' ')return;
  if(e.target.closest?.('.move-card[data-kind="moves"],.move-card[data-kind="abilities"]')){referenceMode=true;queueMicrotask(cleanupPokemonOnly)}
  else if(e.target.closest?.('.species-card[data-kind="pokemon"],.form-link[data-id]'))referenceMode=false;
},true);
syncMode();
window.ER_DETAIL_STATE_FIX={cleanupPokemonOnly,syncMode};
})();
