const fs=require('fs');
global.window=global;
const files=[
  'moves-1.js','moves-2.js','moves-3.js','move-short-1.js','move-short-2.js','move-short-3.js','move-short-4.js','move-long-1.js','move-long-2.js','move-long-3.js','move-long-4.js',
  'abilities-1.js','abilities-2.js','abilities-3.js','ability-stage18.js','ability-short-1.js','ability-short-2.js','ability-short-3.js','ability-short-4.js','ability-long-1.js','ability-long-2a.js','ability-long-2b.js','ability-long-3a.js','ability-long-3b.js','ability-long-4.js'
];
for(const f of files)require('./'+f);
function mapRows(a){return new Map((Array.isArray(a)?a:[]).filter(r=>Array.isArray(r)&&Number(r[0])>0).map(r=>[Number(r[0]),String(r[1]||'')]))}
const moveNames=mapRows(global.ER_MOVES), moveShort=mapRows(global.ER_MOVE_SHORT_KO), moveLong=mapRows(global.ER_MOVE_LONG_KO);
const abilityNames=mapRows(global.ER_ABILITIES), abilityShort=mapRows(global.ER_ABILITY_SHORT_KO), abilityLong=mapRows(global.ER_ABILITY_LONG_KO);
const moves=[...moveNames].sort((a,b)=>a[0]-b[0]).map(([id,name])=>[id,name,moveShort.get(id)||'',moveLong.get(id)||moveShort.get(id)||'']);
const abilities=[...abilityNames].sort((a,b)=>a[0]-b[0]).map(([id,name])=>[id,name,abilityShort.get(id)||'',abilityLong.get(id)||abilityShort.get(id)||'']);
const audit={stage:'STAGE25',moves:moves.length,abilities:abilities.length,moveShortMissing:moves.filter(r=>!r[2]).map(r=>r[0]),moveLongMissing:moves.filter(r=>!r[3]).map(r=>r[0]),abilityShortMissing:abilities.filter(r=>!r[2]).map(r=>r[0]),abilityLongMissing:abilities.filter(r=>!r[3]).map(r=>r[0])};
fs.writeFileSync('stage25-detail-data.js',`window.ER_STAGE25_DETAIL_DATA=${JSON.stringify({moves,abilities})};\n`);
fs.writeFileSync('stage25-detail-audit.json',JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify(audit,null,2));
if(moves.length!==1031)throw Error(`move count ${moves.length} != 1031`);
if(abilities.length!==1062)throw Error(`ability count ${abilities.length} != 1062`);
