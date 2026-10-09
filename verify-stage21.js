const fs=require('fs'),vm=require('vm');
const audit=JSON.parse(fs.readFileSync('stage21-audit.json','utf8'));
const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('stage21-data.js','utf8'),c);
const data=c.window.ER_STAGE21_DATA,html=fs.readFileSync('index.html','utf8'),js=fs.readFileSync('stage21.js','utf8');
function ok(v,m){if(!v)throw Error(m)}
ok(data&&data.meta?.stage==='STAGE21','data stage');ok(data.species.length===1922,'species count');
const x=audit.counts;ok(x.officialSpecies===1922&&x.webSpecies===1922&&x.payloadSpecies===1922,'audit species');ok(x.rawNaturalSlots===3114,'natural slot count');ok(x.unsetNaturalSlots===7,'unset slots');ok(x.unresolvedNatural===0&&x.missingMapNames===0&&x.invalidScriptedHow===0&&x.missingSource===0,'unresolved audit');ok(x.naturalIndexToIdRemaps===169,'natural remaps');ok(x.rawScriptedRows===200&&x.displayScriptedGroups===185,'scripted counts');
const by=new Map(data.species.map(r=>[Number(r[0]),r]));ok(by.get(25)?.[3]?.some(r=>r[2]==='Fortree City'),'Pikachu Fortree');ok(by.get(144)?.[4]?.some(r=>r[1]==='Shoal Cave Low Tide Ice Room'&&r[2]===0),'Articuno static');ok(by.get(150)?.[4]?.some(r=>r[1]==='Altering Cave B1F'&&r[2]===0),'Mewtwo static');ok(by.get(384)?.[4]?.some(r=>r[1]==='Sky Pillar Top'&&r[2]===0),'Rayquaza static');
ok(html.includes('STAGE 21')&&html.includes('stage21.css?v=20261009-stage21')&&html.includes('stage21.js?v=20261009-stage21'),'index promotion');ok(js.includes('트레이너 팀 데이터는 포함하지 않습니다.'),'trainer exclusion note');
console.log('STAGE21 verification OK',JSON.stringify(x));
