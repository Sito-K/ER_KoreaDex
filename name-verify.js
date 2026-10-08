(async()=>{'use strict';
const nativeFetch=window.fetch.bind(window);
const norm=s=>String(s||'').normalize('NFKD').toLowerCase().replace(/♀/g,' female ').replace(/♂/g,' male ').replace(/[^a-z0-9]+/g,'');
async function unpack(b64){if(!b64)return[];const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));if(typeof DecompressionStream!=='function')throw Error('gzip unsupported');const text=await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'))).text();return JSON.parse(text)}
function uniqueMap(rows){const out=new Map(),bad=new Set();for(const [en,ko] of rows||[]){const k=norm(en);if(!k||!ko||bad.has(k))continue;if(out.has(k)&&out.get(k)!==ko){out.delete(k);bad.add(k)}else out.set(k,ko)}return out}
async function game(){for(const u of ['https://cdn.jsdelivr.net/gh/ForwardFeed/ER-nextdex@main/static/js/data/gameDataV2.65beta.json','https://raw.githubusercontent.com/ForwardFeed/ER-nextdex/main/static/js/data/gameDataV2.65beta.json']){try{const r=await nativeFetch(u,{cache:'force-cache'});if(r.ok)return await r.json()}catch(e){}}throw Error('NextDex load failed')}
const FORM={
ALOLAN:'알로라의 모습',ALOLA:'알로라의 모습',GALARIAN:'가라르의 모습',GALAR:'가라르의 모습',HISUIAN:'히스이의 모습',HISUI:'히스이의 모습',PALDEAN:'팔데아의 모습',PALDEA:'팔데아의 모습',
ORIGIN:'오리진폼',THERIAN:'영물폼',INCARNATE:'화신폼',ATTACK:'어택폼',DEFENSE:'디펜스폼',SPEED:'스피드폼',MEGA:'메가진화',MEGA_X:'메가진화 X',MEGA_Y:'메가진화 Y',PRIMAL:'원시회귀',REDUX:'리덕스폼',GMAX:'거다이맥스',
SANDY:'모래땅도롱',TRASH:'슈레도롱',PLANT:'초목도롱',EAST:'동쪽바다',WEST:'서쪽바다',HEAT:'히트로토무',WASH:'워시로토무',FROST:'프로스트로토무',FAN:'스핀로토무',MOW:'커트로토무',
BLACK:'블랙큐레무',WHITE:'화이트큐레무',BLADE:'블레이드폼',SHIELD:'실드폼',ASH:'지우폼',COMPLETE:'퍼펙트폼',MIDDAY:'한낮의 모습',MIDNIGHT:'한밤중의 모습',DUSK:'황혼의 모습',
SCHOOL:'군집의 모습',SOLO:'단독의 모습',METEOR:'유성의 모습',CORE:'코어의 모습',DUSK_MANE:'황혼의 갈기',DAWN_WINGS:'새벽의 날개',ULTRA:'울트라폼',AMPED:'하이한 모습',LOW_KEY:'로우한 모습',
HANGRY:'배고픈 모습',CROWNED_SWORD:'검왕의 모습',CROWNED_SHIELD:'방패왕의 모습',ETERNAMAX:'무한다이맥스',SINGLE_STRIKE:'일격의 태세',RAPID_STRIKE:'연격의 태세',ICE_RIDER:'백마 탄 모습',SHADOW_RIDER:'흑마 탄 모습',
HERO:'마이티폼',ZERO:'나이브폼',CURLY:'늘어진 모습',DROOPY:'처진 모습',STRETCHY:'뻗은 모습',TWO_SEGMENT:'두 마디폼',THREE_SEGMENT:'세 마디폼',CHEST:'상자폼',ROAMING:'도보폼',
TEAL_MASK:'벽록의 가면',HEARTHFLAME_MASK:'화덕의 가면',WELLSPRING_MASK:'우물의 가면',CORNERSTONE_MASK:'주춧돌의 가면',TERASTAL:'테라스탈폼',STELLAR:'스텔라폼',BLOODMOON:'붉은 달의 모습',
ZEN:'달마모드',ZEN_GALAR:'가라르 달마모드',STANDARD:'노말모드',SUNSHINE:'포지폼',OVERCAST:'네거폼',RESOLUTE:'각오의 모습',PIROUETTE:'스텝폼',UNBOUND:'굴레를 벗어난 모습',
BAILE:'플라멩코스타일',POM_POM:'파칙파칙스타일',PAU:'훌라훌라스타일',SENSU:'하늘하늘스타일',DISGUISED:'둔갑한 모습',BUSTED:'들킨 모습',ICE_FACE:'아이스페이스',NOICE:'나이스페이스',
ORIGINAL_CAP:'오리지널캡',HOENN_CAP:'호연캡',SINNOH_CAP:'신오캡',UNOVA_CAP:'하나캡',KALOS_CAP:'칼로스캡',ALOLA_CAP:'알로라캡',PARTNER_CAP:'너로정했다캡',WORLD_CAP:'월드캡',
ROCK_STAR:'하드록',BELLE:'마담',POP_STAR:'아이돌',PHD:'닥터',LIBRE:'마스크드',COSPLAY:'코스튬',
SPRING:'봄의 모습',SUMMER:'여름의 모습',AUTUMN:'가을의 모습',WINTER:'겨울의 모습',SMALL:'작은 사이즈',AVERAGE:'보통 사이즈',LARGE:'큰 사이즈',SUPER:'특대 사이즈',
FAMILY_OF_THREE:'세 식구',FAMILY_OF_FOUR:'네 식구',COMBAT:'컴뱃종',BLAZE:'블레이즈종',AQUA:'워터종'
};
const PART={
RED:'빨강',ORANGE:'주황',YELLOW:'노랑',GREEN:'초록',BLUE:'파랑',INDIGO:'남색',VIOLET:'보라',PINK:'분홍',WHITE:'하양',BLACK:'검정',BROWN:'갈색',
MALE:'수컷',FEMALE:'암컷',SPRING:'봄',SUMMER:'여름',AUTUMN:'가을',WINTER:'겨울',SUN:'태양',MOON:'달',DAWN:'새벽',DUSK:'황혼',
MEGA:'메가',REDUX:'리덕스',GMAX:'거다이맥스',ORIGIN:'오리진',THERIAN:'영물',INCARNATE:'화신',ATTACK:'어택',DEFENSE:'디펜스',SPEED:'스피드',
RUBY:'루비',MATCHA:'말차',MINT:'민트',LEMON:'레몬',SALTED:'솔티',RUBY_SWIRL:'루비믹스',CARAMEL_SWIRL:'캐러멜믹스',RAINBOW_SWIRL:'트리플믹스',
VANILLA:'바닐라',CREAM:'크림',STRAWBERRY:'딸기',BERRY:'베리',LOVE:'하트',STAR:'스타',CLOVER:'네잎클로버',FLOWER:'꽃',RIBBON:'리본',
HEART:'하트',DIAMOND:'다이아',DEBUTANTE:'아가씨',MATRON:'마담',DANDY:'젠틀맨',LA_REINE:'퀸',KABUKI:'가부키',PHARAOH:'킹덤',NATURAL:'내추럴',
ELEGANT:'우아',MARINE:'마린',MEADOW:'목초',MODERN:'모던',MONSOON:'우기',OCEAN:'오션',POLAR:'설국',RIVER:'대하',SANDSTORM:'사막',SAVANNA:'사바나',SUN:'태양',TUNDRA:'빙설'
};
function labelToken(t){
 t=String(t||'').replace(/^FORM_/,'').replace(/_FORM(E)?$/,'');
 if(!t)return'';
 if(FORM[t])return FORM[t];
 if(/REDUX/.test(t))return'리덕스폼';
 if(/MEGA_X/.test(t))return'메가진화 X';
 if(/MEGA_Y/.test(t))return'메가진화 Y';
 if(/MEGA/.test(t))return'메가진화';
 if(/GMAX|GIGANTAMAX/.test(t))return'거다이맥스';
 const parts=t.split('_'),out=[];let ok=true;
 for(const p of parts){if(PART[p])out.push(PART[p]);else if(/^[XYZ0-9]+$/.test(p))out.push(p);else{ok=false;break}}
 return ok&&out.length?out.join(' ')+'폼':'특수폼';
}
function buildSpecies(g,rows){
 const byName=uniqueMap((rows||[]).map(r=>[r?.[1],r?.[2]]));
 const sp=g.species||[],owner=new Map();
 sp.forEach((m,i)=>{if(!m)return;(m.forms||[]).forEach(v=>{v=+v;if(Number.isInteger(v)&&v>=0&&v!==i&&!owner.has(v))owner.set(v,i)})});
 const rootIndex=i=>{let c=+i,seen=new Set();while(owner.has(c)&&!seen.has(c)){seen.add(c);c=owner.get(c)}return c};
 const baseKo=m=>byName.get(norm(m?.name))||'';
 const out=[];
 sp.forEach((m,i)=>{
   if(!m||!m.name)return;
   let ko=baseKo(m);
   if(!ko){
     const ri=rootIndex(i),r=sp[ri]||m,rootKo=baseKo(r);
     if(rootKo){
       const a=String(r.NAME||'').replace(/^SPECIES_/,''),b=String(m.NAME||'').replace(/^SPECIES_/,'');
       let t='';
       if(a&&b.startsWith(a+'_'))t=b.slice(a.length+1);
       else{
         const rn=String(r.name||''),mn=String(m.name||'');
         if(rn&&mn.toLowerCase().startsWith(rn.toLowerCase()))t=mn.slice(rn.length).replace(/^[_\s-]+/,'').replace(/[\s-]+/g,'_').toUpperCase();
         else t=b;
       }
       if(t==='MEGA')ko='메가'+rootKo;
       else if(t==='MEGA_X')ko='메가'+rootKo+'X';
       else if(t==='MEGA_Y')ko='메가'+rootKo+'Y';
       else if(t==='PRIMAL')ko='원시'+rootKo;
       else ko=`${rootKo} (${labelToken(t)})`;
     }
   }
   if(!ko)ko='포켓몬';
   out.push([Number(m.id??i),String(m.name),ko]);
 });
 return out;
}
try{
 const packs=window.ER_NAME_PACKS||{},descPack=window.ER_DESC_PACK||'';
 const [mr,ar,dd,g]=await Promise.all([unpack(packs.moves),unpack(packs.abilities),unpack(descPack),game()]);
 const mm=uniqueMap(mr),am=uniqueMap(ar),oldM=new Map((window.ER_MOVES||[]).map(r=>[+r[0],r[r.length-1]])),oldA=new Map((window.ER_ABILITIES||[]).map(r=>[+r[0],r[r.length-1]]));
 const dm=new Map(((dd&&dd[0])||[]).map((v,i)=>[i+1,String(v||'')])),da=new Map(((dd&&dd[1])||[]).map((v,i)=>[i+1,String(v||'')]));
 window.ER_MOVES=(g.moves||[]).filter(x=>x&&Number(x.id)!==0&&x.name).map(x=>[Number(x.id),mm.get(norm(x.name))||oldM.get(Number(x.id))||x.name]);
 window.ER_ABILITIES=(g.abilities||[]).filter(x=>x&&Number(x.id)!==0&&x.name).map(x=>[Number(x.id),am.get(norm(x.name))||oldA.get(Number(x.id))||x.name]);
 (g.moves||[]).forEach(x=>{if(!x)return;const d=dm.get(Number(x.id));if(d){x.desc=d;x.lDesc=d}});
 (g.abilities||[]).forEach(x=>{if(!x)return;const d=da.get(Number(x.id));if(d)x.desc=d});
 window.ER_SPECIES=buildSpecies(g,window.ER_SPECIES||[]);
 window.ER_OFFICIAL_DATA=g;
 const patched=JSON.stringify(g);
 window.fetch=async(input,init)=>{const u=typeof input==='string'?input:String(input?.url||input||'');if(u.includes('gameDataV2.65beta.json'))return new Response(patched,{status:200,headers:{'Content-Type':'application/json; charset=utf-8'}});return nativeFetch(input,init)}
}catch(e){
 console.warn('Korean data verification fallback',e);
 window.ER_MOVES=(window.ER_MOVES||[]).filter(r=>+r[0]!==0);
 window.ER_ABILITIES=(window.ER_ABILITIES||[]).filter(r=>+r[0]!==0)
}
const s=document.createElement('script');s.src='app.js?v=20261008-5';document.body.appendChild(s)
})();