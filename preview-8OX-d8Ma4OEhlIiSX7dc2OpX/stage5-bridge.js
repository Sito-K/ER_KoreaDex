(()=>{'use strict';
const source={moves:['move-names-canonical.js','move-short-canonical.js','move-long-canonical.js'],abilities:['ability-names-canonical.js','ability-short-canonical.js','ability-long-canonical.js']};
const waiting={};
async function apply(kind){
  if(!source[kind])return;
  if(waiting[kind])return waiting[kind];
  waiting[kind]=(async()=>{for(const file of source[kind]){
    await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=file+'?v=stage9-native';s.async=false;s.onload=resolve;s.onerror=()=>reject(new Error('native dataset load failed: '+file));document.body.appendChild(s)});
  }})().catch(err=>{waiting[kind]=null;throw err});
  return waiting[kind];
}
// No remote sprite fallback. Image errors must never fetch from third-party repositories.
document.addEventListener('error',e=>{const im=e.target;if(!(im instanceof HTMLImageElement))return;
  if(!im.matches('.sprite,.detail-sprite'))return;const wrap=im.parentElement;
  im.remove();wrap?.classList.add('sprite-missing');
},true);
window.ER_STAGE5={apply,source:'Sito-K/EliteReduxKorean',version:'staging-only'};
})();
