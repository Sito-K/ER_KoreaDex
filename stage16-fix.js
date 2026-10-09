const fs=require('fs'),vm=require('vm');
function load(path){const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync(path,'utf8'),c,{filename:path});return c.window;}
function saveForms(meta,rows){fs.writeFileSync('forms.js',`window.ER_FORM_META=${JSON.stringify({...meta,generatedAt:new Date().toISOString(),displayStage:'STAGE16_FORM_NAMES'})};\nwindow.ER_OFFICIAL_SPECIES=${JSON.stringify(rows)};\n`)}
function savePokemon(meta,rows){fs.writeFileSync('pokemon-data.js',`window.ER_POKEMON_META=${JSON.stringify({...meta,generatedAt:new Date().toISOString(),displayStage:'STAGE16_FORM_NAMES'})};\nwindow.ER_POKEMON_DATA=${JSON.stringify(rows)};\n`)}
const fw=load('forms.js'),pw=load('pokemon-data.js');
const forms=fw.ER_OFFICIAL_SPECIES||[], pokemon=pw.ER_POKEMON_DATA||[];
if(forms.length!==1922||pokemon.length!==1922)throw Error(`STAGE15 baseline count mismatch: ${forms.length}/${pokemon.length}`);
const F=new Map(forms.map(r=>[+r[0],r])),P=new Map(pokemon.map(r=>[+r[0],r]));
const O=new Map();
function add(id,ko,sourceClass='OFFICIAL_KO',extra={}){O.set(id,{ko,sourceClass,...extra});}

// Base classification fixes: these are standalone species, not F/M forms.
add(29,'니드런♀','OFFICIAL_KO',{isForm:0,token:''});
add(32,'니드런♂','OFFICIAL_KO',{isForm:0,token:''});

// Official Korean form names / established Korean game terminology.
add(1588,'옷갈아입기 피카츄'); add(1589,'하드록 피카츄'); add(1590,'마담 피카츄'); add(1591,'아이돌 피카츄'); add(1592,'닥터 피카츄'); add(1593,'마스크드 피카츄');
add(1602,'삐쭉귀 피츄'); add(1628,'안농 (!폼)'); add(1629,'안농 (?폼)');
add(1636,'도롱충이 (모래땅도롱)'); add(1637,'도롱충이 (슈레도롱)'); add(1638,'도롱마담 (모래땅도롱)'); add(1639,'도롱마담 (슈레도롱)');
add(422,'깝질무 (서쪽바다)'); add(423,'트리토돈 (서쪽바다)'); add(1641,'깝질무 (동쪽바다)'); add(1642,'트리토돈 (동쪽바다)');
const TYPE_KO={FIGHTING:'격투',FLYING:'비행',POISON:'독',GROUND:'땅',ROCK:'바위',BUG:'벌레',GHOST:'고스트',STEEL:'강철',FIRE:'불꽃',WATER:'물',GRASS:'풀',ELECTRIC:'전기',PSYCHIC:'에스퍼',ICE:'얼음',DRAGON:'드래곤',DARK:'악',FAIRY:'페어리'};
const arceusIds={1650:'FIGHTING',1651:'FLYING',1652:'POISON',1653:'GROUND',1654:'ROCK',1655:'BUG',1656:'GHOST',1657:'STEEL',1658:'FIRE',1659:'WATER',1660:'GRASS',1661:'ELECTRIC',1662:'PSYCHIC',1663:'ICE',1664:'DRAGON',1665:'DARK',1666:'FAIRY'};
for(const [id,t] of Object.entries(arceusIds))add(+id,`아르세우스 (${TYPE_KO[t]}타입)`);
add(550,'배쓰나이 (적색근의 모습)'); add(1667,'배쓰나이 (청색근의 모습)'); add(2567,'배쓰나이 (백색근의 모습)');
add(555,'불비달마 (노말모드)'); add(1668,'불비달마 (달마모드)'); add(1669,'불비달마 (가라르의 모습 / 달마모드)');
add(1683,'게노세크트 (아쿠아카세트)'); add(1684,'게노세크트 (번개카세트)'); add(1685,'게노세크트 (블레이즈카세트)'); add(1686,'게노세크트 (프리즈카세트)');
add(1687,'개굴닌자 (유대변화)'); add(1688,'지우개굴닌자');
const VIV={1689:'설국의 모양',1690:'설원의 모양',1691:'대륙의 모양',1692:'정원의 모양',1693:'우아한 모양',1694:'화원의 모양',1695:'모던한 모양',1696:'마린의 모양',1697:'군도의 모양',1698:'황야의 모양',1699:'사진의 모양',1700:'대하의 모양',1701:'스콜의 모양',1702:'사바나의 모양',1703:'태양의 모양',1704:'오션의 모양',1705:'정글의 모양',1706:'팬시한 모양',1707:'볼의 모양'};
for(const [id,n] of Object.entries(VIV))add(+id,`비비용 (${n})`);
const FLOWER={1708:'노란 꽃',1709:'오렌지색 꽃',1710:'파란 꽃',1711:'하얀 꽃',1712:'노란 꽃',1713:'오렌지색 꽃',1714:'파란 꽃',1715:'하얀 꽃',1716:'영원의 꽃',1717:'노란 꽃',1718:'오렌지색 꽃',1719:'파란 꽃',1720:'하얀 꽃'};
for(const [id,n] of Object.entries(FLOWER)){const r=F.get(+id);add(+id,`${String(r?.[2]||'').split(' (')[0]} (${n})`)}
const FUR={1721:'하트컷',1722:'스타컷',1723:'다이아컷',1724:'레이디컷',1725:'마담컷',1726:'젠틀컷',1727:'퀸컷',1728:'가부키컷',1729:'킹덤컷'};
for(const [id,n] of Object.entries(FUR))add(+id,`트리미앙 (${n})`);
add(1738,'제르네아스 (액티브모드)'); add(1739,'지가르데 (10%폼)'); add(1740,'지가르데 (10%폼)'); add(1741,'지가르데 (50%폼)');
add(1747,'암멍이 (마이페이스)','OFFICIAL_TERM');
const silvallyIds={1751:'FIGHTING',1752:'FLYING',1753:'POISON',1754:'GROUND',1755:'ROCK',1756:'BUG',1757:'GHOST',1758:'STEEL',1759:'FIRE',1760:'WATER',1761:'GRASS',1762:'ELECTRIC',1763:'PSYCHIC',1764:'ICE',1765:'DRAGON',1766:'DARK',1767:'FAIRY'};
for(const [id,t] of Object.entries(silvallyIds))add(+id,`실버디 (${TYPE_KO[t]}타입)`);
add(1785,'마기아나 (500년 전의 색)'); add(1786,'윽우지 (그대로 삼킨 모습)'); add(1787,'윽우지 (통째로 삼킨 모습)');
add(1789,'데인차 (진작폼)'); add(1790,'포트데스 (진작폼)');
const ALC={1791:'밀키루비',1792:'밀키말차',1793:'밀키민트',1794:'밀키레몬',1795:'밀키솔트',1796:'루비믹스',1797:'캐러멜믹스',1798:'트리플믹스'};
for(const [id,n] of Object.entries(ALC))add(+id,`마휘핑 (${n})`);
add(1799,'빙큐보 (나이스페이스)'); add(1806,'아빠 자루도');
add(1825,'켄타로스 (팔데아의 모습 / 워터종)'); add(1826,'켄타로스 (팔데아의 모습 / 블레이즈종)'); add(1827,'켄타로스 (팔데아의 모습 / 컴뱃종)');
add(1831,'파밀리쥐 (네 식구)');
add(1835,'시비꼬 (그린 페더)'); add(1836,'시비꼬 (블루 페더)'); add(1837,'시비꼬 (옐로 페더)'); add(1838,'시비꼬 (화이트 페더)');
add(1849,'대쓰여너 (암컷의 모습)');

// Mega labels that were structurally correct but displayed in awkward order.
add(1892,'메가앱솔Z'); add(1894,'메가한카리아스Z'); add(2159,'메가루카리오Z'); add(2191,'메가리자몽Z','PATTERN_KO');
const reduxMega={2146:'메가후딘 (리덕스폼)',2147:'메가독침붕 (리덕스폼)',2148:'메가괴력몬 (리덕스폼)',2149:'메가무장조 (리덕스폼)',2150:'메가윈디 (리덕스폼)',2151:'메가한카리아스 (리덕스폼)',2152:'메가입치트 (리덕스폼)',2153:'메가깜까미 (리덕스폼)',2154:'메가헬가 (리덕스폼)',2562:'메가마기라스 (리덕스폼)'};
for(const [id,n] of Object.entries(reduxMega))add(+id,n,'ER_DESCRIPTIVE');
add(2166,'메가날쌩마 (가라르의 모습)','ER_DESCRIPTIVE'); add(2229,'메가야도란 (가라르의 모습)','ER_DESCRIPTIVE'); add(2230,'메가야도킹 (가라르의 모습)','ER_DESCRIPTIVE');

// Elite Redux-only forms: readable Korean descriptors, explicitly tracked as non-official.
const CUSTOM={
1068:'도롱충이 (에테르나폼)',1846:'툰폴라 (블루문폼)',1855:'원시따라큐',1856:'메가게을킹 (에이프 시프트)',1858:'캐스퐁 (안개의 모습)',
1860:'브리가론 (유대변화)',1861:'시트론 브리가론',1862:'마폭시 (유대변화)',1863:'세레나 마폭시',1865:'안농 (계시폼)',1866:'루가루암 (이클립스폼)',1867:'루가루암 (트와일라잇폼)',
2256:'그로토무 (글래스폼)',2257:'그로토무 (롤폼)',2258:'그로토무 (드럼폼)',2259:'그로토무 (킥폼)',2260:'그로토무 (필폼)',2262:'유령벌레 (하이브마인드폼)',
2569:'망나뇽 (딜리버리폼)',2582:'눈설왕 (산타폼)',2583:'이븐곰 (앵그리폼)',2584:'따라큐 (레쿠쟈폼)',2585:'원시에브이',2586:'다크라이 (나이트메어폼)',2587:'솔록 (시스템폼)',2588:'레이스포스 (클라우드폼)',2589:'버드렉스 (클라우드 라이더)',2592:'푸크린 (에이펙스폼)',2594:'종이신도 (타락폼)',2638:'따라큐 (에이펙스폼)',2639:'따라큐 (에이펙스폼 / 들킨 모습)',1851:'하이드레오 (암컷)'
};
for(const [id,n] of Object.entries(CUSTOM))add(+id,n,'ER_DESCRIPTIVE');

const changes=[];
for(const [id,o] of O){
  const f=F.get(id),p=P.get(id); if(!f||!p)throw Error(`missing target id ${id}`);
  const beforeF=[...f], beforeP=[...p];
  f[2]=o.ko; p[2]=o.ko;
  if(Object.prototype.hasOwnProperty.call(o,'isForm')){f[4]=o.isForm?1:0;p[13]=o.isForm?1:0;}
  if(Object.prototype.hasOwnProperty.call(o,'token')){f[5]=o.token;p[14]=o.token;}
  changes.push({id,en:f[1],sourceClass:o.sourceClass,before:{ko:beforeF[2],isForm:beforeF[4],token:beforeF[5]},after:{ko:f[2],isForm:f[4],token:f[5]}});
}

// STAGE15 invariants must survive.
const d=F.get(2211);if(!d||d[2]!=='메가두랄루돈'||d[5]!=='MEGA')throw Error('STAGE15 Duraludon invariant lost');
const partner=forms.filter(r=>r[5]==='PARTNER_MEGA').map(r=>r[1]).sort();
if(JSON.stringify(partner)!==JSON.stringify(['Eevee Mega','Meowth Mega','Pikachu Mega']))throw Error(`Partner Mega invariant: ${JSON.stringify(partner)}`);
const cross=[];for(const f of forms){const p=P.get(+f[0]);if(!p||String(f[2])!==String(p[2])||+f[4]!==+p[13]||String(f[5]||'')!==String(p[14]||''))cross.push(+f[0]);}
if(cross.length)throw Error(`cross mismatch ${cross.slice(0,20)}`);
const remainingSpecial=forms.filter(r=>String(r[2]).includes('특수폼 #')).map(r=>({id:r[0],en:r[1],ko:r[2],token:r[5]}));
const awkward=forms.filter(r=>/SEA폼|메가 가라르의 모습폼|\(10폼\)|\(PH D폼\)|\(메가 Z폼\)/.test(String(r[2]))).map(r=>({id:r[0],en:r[1],ko:r[2],token:r[5]}));
const official=changes.filter(x=>['OFFICIAL_KO','OFFICIAL_TERM'].includes(x.sourceClass));
const custom=changes.filter(x=>['ER_DESCRIPTIVE','PATTERN_KO'].includes(x.sourceClass));
const audit={stage:'STAGE16',generatedAt:new Date().toISOString(),baseline:'STAGE15 user-confirmed normal',scope:'full form-name cleanup without changing battle stats/types',counts:{forms:forms.length,pokemonData:pokemon.length,changes:changes.length,officialOrEstablished:official.length,erDescriptiveOrPattern:custom.length,remainingSpecial:remainingSpecial.length,awkward:awkward.length,crossMismatches:cross.length,partnerMega:partner.length},invariants:{duraludon:[d[0],d[1],d[2],d[3],d[4],d[5]],partnerMega:partner},changes,remainingSpecial,awkward};

saveForms(fw.ER_FORM_META||{},forms);savePokemon(pw.ER_POKEMON_META||{},pokemon);fs.writeFileSync('stage16-form-audit.json',JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify(audit.counts,null,2));
if(remainingSpecial.length)console.log('remainingSpecial',JSON.stringify(remainingSpecial));
if(awkward.length)console.log('awkward',JSON.stringify(awkward));
