(()=>{'use strict';
const byId=Object.freeze({
  1042:'코템플',
  1088:'분쇄하는귀',
  2681:'깨비테러',
  2162:'아보두사',
  2316:'네오마스',
  2310:'질척이',
  2313:'코리머드',
  2317:'네오노트',
  2321:'아이귀',
  2322:'아이슬래시'
});
const byEn=Object.freeze({
  'Tortemple':'코템플',
  'Crag Hopper':'분쇄하는귀',
  'Terrow':'깨비테러',
  'Asudem':'아보두사',
  'Illumars':'네오마스',
  'Moravine':'질척이',
  'Mastophan':'코리머드',
  'Illuminaut':'네오노트',
  'Isoshrew':'아이귀',
  'Isoslash':'아이슬래시'
});
window.ER_SPECIES_NAME_OVERRIDES=byId;
if(Array.isArray(window.ER_POKEMON_DATA)){
  for(const row of window.ER_POKEMON_DATA){const name=byId[Number(row?.[0])];if(name)row[2]=name}
}
if(Array.isArray(window.ER_SPECIES)){
  for(const row of window.ER_SPECIES){const name=byEn[String(row?.[1]||'')];if(name)row[2]=name}
}
})();
