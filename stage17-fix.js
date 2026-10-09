const fs=require('fs'),vm=require('vm');

const IDS=[1856,1892,1894,2146,2147,2148,2149,2150,2151,2152,2153,2154,2159,2166,2191,2229,2230,2562];
function load(path){const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync(path,'utf8'),c,{filename:path});return c.window;}
function saveForms(w,rows){const meta={...(w.ER_FORM_META||{}),generatedAt:new Date().toISOString(),displayStage:'STAGE17_DATA_AUDIT'};fs.writeFileSync('forms.js',`window.ER_FORM_META=${JSON.stringify(meta)};\nwindow.ER_OFFICIAL_SPECIES=${JSON.stringify(rows)};\n`);}
function savePokemon(w,rows){const meta={...(w.ER_POKEMON_META||{}),generatedAt:new Date().toISOString(),displayStage:'STAGE17_DATA_AUDIT'};fs.writeFileSync('pokemon-data.js',`window.ER_POKEMON_META=${JSON.stringify(meta)};\nwindow.ER_POKEMON_DATA=${JSON.stringify(rows)};\n`);}

const fw=load('forms.js'),pw=load('pokemon-data.js');
const forms=fw.ER_OFFICIAL_SPECIES||[],pokemon=pw.ER_POKEMON_DATA||[];
if(forms.length!==1922||pokemon.length!==1922)throw Error('expected 1922 rows in both datasets');
const changes=[];
for(const id of IDS){
  const f=forms.find(r=>+r[0]===id),p=pokemon.find(r=>+r[0]===id);
  if(!f||!p)throw Error(`missing id ${id}`);
  if(!/Mega/i.test(String(f[1]))||!/Mega/i.test(String(p[3])))throw Error(`id ${id} is not an official Mega row`);
  const before={formToken:String(f[5]||''),pokemonToken:String(p[14]||''),en:String(p[3]),sprite:String(p[4]),ko:String(p[2])};
  // UI category token only: normalize every official Mega variant to MEGA.
  // Exact subtype remains preserved in English name, sprite/internal name and Korean display name.
  f[4]=1;f[5]='MEGA';p[13]=1;p[14]='MEGA';
  changes.push({id,before,after:{token:'MEGA',isForm:true}});
}
const fm=new Map(forms.map(r=>[+r[0],r]));
const mismatch=pokemon.filter(p=>{const f=fm.get(+p[0]);return !f||String(f[2])!==String(p[2])||+f[4]!==+p[13]||String(f[5]||'')!==String(p[14]||'');});
if(mismatch.length)throw Error(`forms/pokemon mismatch ${mismatch.length}`);
const normalized=IDS.map(id=>pokemon.find(r=>+r[0]===id)).filter(r=>String(r[14])==='MEGA');
if(normalized.length!==IDS.length)throw Error(`normalized ${normalized.length}/${IDS.length}`);
saveForms(fw,forms);savePokemon(pw,pokemon);
fs.writeFileSync('stage17-fix-audit.json',JSON.stringify({stage:'STAGE17',generatedAt:new Date().toISOString(),baseline:'STAGE16 user-confirmed normal',scope:'normalize 18 official Mega variant category tokens only',changesCount:changes.length,changes,crossMismatches:mismatch.length},null,2)+'\n');
console.log(`STAGE17 normalized Mega category tokens: ${changes.length}`);
