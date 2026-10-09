const fs=require('fs');const vm=require('vm');
function load(path){const c={window:{},console};vm.createContext(c);vm.runInContext(fs.readFileSync(path,'utf8'),c,{filename:path});return c.window}
function write(name,data){fs.mkdirSync('maintenance-export',{recursive:true});fs.writeFileSync('maintenance-export/'+name,JSON.stringify(data,null,2),'utf8')}
const p=load('pokemon-data.js');
const d=load('stage25-detail-data.js');
const mm=load('move-meta.js');
const am=load('ability-meta.js');
const maps=load('stage22-map-ko.js');
const evo=load('stage20-data.js');
const itemCtx={window:{}};vm.createContext(itemCtx);vm.runInContext(fs.readFileSync('stage26-item-names.js','utf8'),itemCtx,{filename:'stage26-item-names.js'});
const itemResolver=itemCtx.window.ER_STAGE26_ITEM_NAMES;
const pokemon=(p.ER_POKEMON_DATA||[]).map(r=>({id:r[0],dex:r[1],ko:r[2],en:r[3],internal:r[4],type1:r[5],type2:r[6],hp:r[7],atk:r[8],def:r[9],spa:r[10],spd:r[11],spe:r[12],mega:Number(r[13]||0),form_token:r[14]||''}));
const moveDetail=new Map((d.ER_STAGE25_DETAIL_DATA?.moves||[]).map(r=>[Number(r[0]),r]));
const moves=(mm.ER_MOVE_META||[]).map(r=>{const k=moveDetail.get(Number(r[0]))||[];return{id:r[0],en:r[1],internal:r[2],type:r[3],split:r[4],power:r[5],accuracy:r[6],pp:r[7],priority:r[8],chance:r[9],target:r[10],ko:k[1]||'',short_ko:k[2]||'',long_ko:k[3]||'',short_en:r[11]||'',long_en:r[12]||''}});
const abilityDetail=new Map((d.ER_STAGE25_DETAIL_DATA?.abilities||[]).map(r=>[Number(r[0]),r]));
const abilities=(am.ER_ABILITY_META||[]).map(r=>{const k=abilityDetail.get(Number(r[0]))||[];return{id:r[0],en:r[1],internal:r[2]||'',ko:k[1]||'',short_ko:k[2]||'',long_ko:k[3]||'',desc_en:r[3]||''}});
const locations=(maps.ER_STAGE22_MAP_KO?.maps||[]).map(r=>({map_id:r[0],en:r[1],ko:r[2]}));
const built=itemResolver.build(evo.ER_STAGE20_DATA?.species||[]);if(built.unresolved.length||built.conflicts.length)throw new Error('Evolution item map unresolved/conflicts');
const itemSources=new Map();for(const r of (evo.ER_STAGE20_DATA?.species||[])){for(const rel of (Array.isArray(r[5])?r[5]:[])){const code=String(rel?.[2]||'');if(!code.startsWith('ITEM_'))continue;if(!itemSources.has(code))itemSources.set(code,[]);itemSources.get(code).push({species_id:r[0],species_ko:r[1],target_id:rel[0],kind:rel[1]});}}
const evolution_items=[...built.map].sort((a,b)=>a[0].localeCompare(b[0])).map(([code,ko])=>({code,ko,source:itemResolver.FIXED[code]?'고정명':'포켓몬명 기반',references:itemSources.get(code)||[]}));
const summary={stage:'STAGE27',generated_at:new Date().toISOString(),counts:{pokemon:pokemon.length,moves:moves.length,abilities:abilities.length,locations:locations.length,evolution_items:evolution_items.length}};
write('summary.json',summary);write('pokemon.json',pokemon);write('moves.json',moves);write('abilities.json',abilities);write('locations.json',locations);write('evolution_items.json',evolution_items);console.log(summary);
