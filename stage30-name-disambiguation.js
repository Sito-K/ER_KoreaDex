(()=>{'use strict';
// STAGE30: reversible, preview-only display names; never modify canonical IDs or game statistics.
const patches=[[1740,"ZYGARDE_10_POWER_CONSTRUCT","지가르데 (10%폼)","지가르데 (10%폼·스웜체인지)"],[2169,"AEGISLASH_BLADE_REDUX_MEGA","메가킬가르도 (리덕스폼)","메가킬가르도 (리덕스폼·블레이드폼)"],[2179,"TOXTRICITY_REDUX_FUZZ_MEGA","메가스트린더 (리덕스폼)","메가스트린더 (리덕스폼·FUZZ)"],[2510,"AEGISLASH_BLADE_REDUX","킬가르도 (리덕스폼)","킬가르도 (리덕스폼·블레이드폼)"],[2576,"FLYGON_REDUX_B","플라이곤 (리덕스폼)","플라이곤 (리덕스폼 B)"],[2577,"FLYGON_REDUX_B_MEGA","메가플라이곤 (리덕스폼)","메가플라이곤 (리덕스폼 B)"],[2590,"MAWILE_REDUX_B","입치트 (리덕스폼)","입치트 (리덕스폼 B)"],[2591,"MAWILE_REDUX_B_MEGA","메가입치트 (리덕스폼)","메가입치트 (리덕스폼 B)"],[2610,"TOXTRICITY_REDUX_FUZZ","스트린더 (리덕스폼)","스트린더 (리덕스폼·FUZZ)"],[2629,"DARMANITAN_REDUX_AURA","불비달마 (리덕스폼)","불비달마 (리덕스폼·오라)"],[2630,"DARMANITAN_REDUX_BOND","불비달마 (리덕스폼)","불비달마 (리덕스폼·본드)"],[2635,"DARMANITAN_REDUX_BLUNDER","불비달마 (리덕스폼)","불비달마 (리덕스폼·블런더)"]];
const rows=window.ER_POKEMON_DATA;
if(!Array.isArray(rows)||rows.length!==1938){console.error('STAGE30: missing/unexpected species dataset');return;}
const byId=new Map(rows.map(r=>[Number(r[0]),r]));
const planned=new Map(patches.map(p=>[p[0],p[3]]));
for(const p of patches){
  const r=byId.get(p[0]);
  if(!r||r[4]!==p[1]||r[2]!==p[2]){console.error('STAGE30: source-id/name mismatch; no changes applied',p[0]);return;}
}
const seen=new Set(),collisions=new Set();
for(const r of rows){
  const name=planned.get(Number(r[0]))??r[2];
  if(seen.has(name))collisions.add(name);else seen.add(name);
}
if(collisions.size){console.error('STAGE30: duplicate display names remain; no changes applied',[...collisions]);return;}
const overrides=Object.assign({},window.ER_SPECIES_NAME_OVERRIDES||{});
for(const [id,symbol,before,after] of patches){byId.get(id)[2]=after;overrides[id]=after;}
window.ER_SPECIES_NAME_OVERRIDES=Object.freeze(overrides);
window.ER_STAGE30_NAME_AUDIT=Object.freeze({patches:patches.length,duplicateLabels:0,source:'game symbols + STAGE24/29 review'});
})();
