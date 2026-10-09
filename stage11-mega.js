(()=>{'use strict';
const rows=Array.isArray(window.ER_POKEMON_DATA)?window.ER_POKEMON_DATA:[];
const byKey=new Map(rows.filter(r=>Array.isArray(r)&&r[4]).map(r=>[String(r[4]),r]));
let megaCount=0,parentLinked=0,specialParentMega=0;
function megaName(parentKo,variant){
  const ko=String(parentKo||'').trim();
  if(!ko)return variant?`메가진화${variant}`:'메가진화';
  const m=ko.match(/^(.+?)\s*\((.+)\)$/);
  if(m)return `메가${m[1]}${variant||''} (${m[2]})`;
  return `메가${ko}${variant||''}`;
}
for(const r of rows){
  if(!Array.isArray(r))continue;
  const key=String(r[4]||'');
  const m=key.match(/^(.*)_MEGA(?:_([XY]))?$/);
  if(!m)continue;
  megaCount++;
  const parent=byKey.get(m[1]);
  if(!parent)continue;
  parentLinked++;
  const variant=m[2]||'';
  if(/_(REDUX|HISUIAN|ALOLAN|GALARIAN|PARTNER|MASK|EX|COMPLETE|ETERNAL|RAPID_STRIKE|BLADE)/.test(m[1]))specialParentMega++;
  r[1]=Number(parent[1])||Number(r[1]);
  r[2]=megaName(parent[2],variant);
  r[13]=1;
  r[14]=variant?`MEGA_${variant}`:'MEGA';
}
window.ER_MEGA_FIX_META={stage:11,megaCount,parentLinked,specialParentMega,policy:'derive Mega parent from official sprite/species constant key, then inherit parent Korean form name'};
})();
