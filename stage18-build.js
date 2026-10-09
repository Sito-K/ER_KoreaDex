const fs=require('fs'),vm=require('vm');
const SOURCE='https://raw.githubusercontent.com/ForwardFeed/ER-nextdex/main/static/js/data/gameDataV2.65.4.json';
const MOVE_FILES=['moves-1.js','moves-2.js','moves-3.js','move-short-1.js','move-short-2.js','move-short-3.js','move-short-4.js','move-long-1.js','move-long-2.js','move-long-3.js','move-long-4.js'];
const ABI_FILES=['abilities-1.js','abilities-2.js','abilities-3.js','ability-short-1.js','ability-short-2.js','ability-short-3.js','ability-short-4.js','ability-long-1.js','ability-long-2a.js','ability-long-2b.js','ability-long-3a.js','ability-long-3b.js','ability-long-4.js'];
function load(files){const c={window:{}};vm.createContext(c);for(const f of files)vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});return c.window}
function mapRows(a){return new Map((Array.isArray(a)?a:[]).map(r=>[Number(r[0]),String(r[1]??'')]))}
function validKo(s){s=String(s||'').trim();return !!s&&s!=="'-"&&s!=='-'&&s!=='-------'}
(async()=>{
 const mw=load(MOVE_FILES),aw=load(ABI_FILES);
 const moveNames=mapRows(mw.ER_MOVES),moveShort=mapRows(mw.ER_MOVE_SHORT_KO),moveLong=mapRows(mw.ER_MOVE_LONG_KO);
 const abiNames=mapRows(aw.ER_ABILITIES),abiShort=mapRows(aw.ER_ABILITY_SHORT_KO),abiLong=mapRows(aw.ER_ABILITY_LONG_KO);
 const res=await fetch(SOURCE);if(!res.ok)throw Error(`NextDex HTTP ${res.status}`);const g=await res.json();
 const om=(Array.isArray(g.moves)?g.moves:[]).filter(x=>x&&Number(x.id)>0&&String(x.name||'').trim()&&String(x.NAME||'')!=='MOVE_NONE');
 const oa=(Array.isArray(g.abilities)?g.abilities:[]).filter(x=>x&&Number(x.id)>0&&String(x.name||'').trim()&&String(x.name||'').trim()!=='-------');
 const omBy=new Map(om.map(x=>[Number(x.id),x])),oaBy=new Map(oa.map(x=>[Number(x.id),x]));
 const km=[...moveNames].filter(([id,n])=>id>0&&validKo(n)),ka=[...abiNames].filter(([id,n])=>id>0&&validKo(n));
 const moveMissing=om.filter(x=>!validKo(moveNames.get(+x.id))).map(x=>({id:+x.id,en:x.name,NAME:x.NAME}));
 const moveExtra=km.filter(([id])=>!omBy.has(id)).map(([id,ko])=>({id,ko}));
 const abiMissing=oa.filter(x=>!validKo(abiNames.get(+x.id))).map(x=>({id:+x.id,en:x.name}));
 const abiExtra=ka.filter(([id])=>!oaBy.has(id)).map(([id,ko])=>({id,ko}));
 const moveShortMissing=om.filter(x=>!String(moveShort.get(+x.id)||'').trim()).map(x=>({id:+x.id,en:x.name,ko:moveNames.get(+x.id)||''}));
 const moveLongMissing=om.filter(x=>!String(moveLong.get(+x.id)||'').trim()).map(x=>({id:+x.id,en:x.name,ko:moveNames.get(+x.id)||''}));
 const abiShortMissing=oa.filter(x=>!String(abiShort.get(+x.id)||'').trim()).map(x=>({id:+x.id,en:x.name,ko:abiNames.get(+x.id)||''}));
 const abiLongMissing=oa.filter(x=>!String(abiLong.get(+x.id)||'').trim()).map(x=>({id:+x.id,en:x.name,ko:abiNames.get(+x.id)||''}));
 const typeT=Array.isArray(g.typeT)?g.typeT:[],splitT=Array.isArray(g.splitT)?g.splitT:[],targetT=Array.isArray(g.targetT)?g.targetT:[];
 const moveMeta=om.map(x=>[+x.id,String(x.name||''),String(x.NAME||''),String(typeT[Number((x.types||[])[0])]||''),String(splitT[Number(x.split)]||''),Number(x.pwr)||0,Number(x.acc)||0,Number(x.pp)||0,Number(x.prio)||0,Number(x.chance)||0,String(targetT[Number(x.target)]||''),String(x.desc||''),String(x.lDesc||'')]);
 const abiMeta=oa.map(x=>[+x.id,String(x.name||''),String(x.desc||'')]);
 fs.writeFileSync('move-meta.js',`window.ER_MOVE_META=${JSON.stringify(moveMeta)};\n`);
 fs.writeFileSync('ability-meta.js',`window.ER_ABILITY_META=${JSON.stringify(abiMeta)};\n`);
 const report={stage:'STAGE18',generatedAt:new Date().toISOString(),baseline:'STAGE17 user-confirmed normal',source:SOURCE,counts:{officialMoveSlots:(g.moves||[]).length,officialMoves:om.length,koreanMoves:km.length,officialAbilitySlots:(g.abilities||[]).length,officialAbilities:oa.length,koreanAbilities:ka.length,moveMissing:moveMissing.length,moveExtra:moveExtra.length,abilityMissing:abiMissing.length,abilityExtra:abiExtra.length,moveShortMissing:moveShortMissing.length,moveLongMissing:moveLongMissing.length,abilityShortMissing:abiShortMissing.length,abilityLongMissing:abiLongMissing.length},moveMissing,moveExtra,abilityMissing:abiMissing,abilityExtra:abiExtra,descriptionCoverage:{moveShortMissing,moveLongMissing,abilityShortMissing,abilityLongMissing}};
 fs.writeFileSync('stage18-audit.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report.counts,null,2));
})();
