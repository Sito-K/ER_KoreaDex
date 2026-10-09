const fs=require('fs');
const src=JSON.parse(fs.readFileSync('stage22-map-names.json','utf8'));
const PREFIX=[
['Abandoned Ship','버려진 배'],['Altering Cave','변화의 동굴'],['Ancient Tomb','고대무덤'],['Aqua Hideout','아쿠아단 아지트'],['Artisan Cave','장인의 동굴'],['Ashen Woods','재의 숲'],['Battle Frontier','배틀프런티어'],['Birth Island','탄생의 섬'],['Cave Of Origin','각성의 사당'],['Desert Ruins','사막유적'],['Desert Underpass','사막지하도'],['Dewford Manor','무로저택'],['Dewford Meadow','무로초원'],['Dewford Town','무로마을'],['Ember Path','불씨길'],['Ever Grande City','그랜드시티'],['Evergrande City','그랜드시티'],['Fallarbor Town','단풍마을'],['Faraway Island','머나먼고도'],['Fiery Path','불꽃샛길'],['Fortree City','검방울시티'],['Granite Cave','돌의 동굴'],['Island Cave','작은 섬 옆굴'],['Jagged Pass','울퉁불퉁산길'],['Lavaridge Town','용암마을'],['Lilycove City','해안시티'],['Littleroot Town','미로마을'],['Magma Hideout','마그마단 아지트'],['Marine Cave','바다동굴'],['Mauville City','보라시티'],['Meteor Falls','유성의 폭포'],['Mirage Tower','환상탑'],['Mossdeep City','이끼시티'],['Mt Pyre','송화산'],['Navel Rock','배꼽바위'],['New Mauville','뉴보라'],['Oldale Town','고도마을'],['Pacifidlog Town','황금마을'],['Petalburg City','등화도시'],['Petalburg Woods','등화숲'],['Rustboro City','금탄도시'],['Rusturf Tunnel','금잔터널'],['Safari Zone','사파리존'],['Sandstrewn Ruins','모래유적'],['Scorched Slab','가뭄의 암굴'],['Seafloor Cavern','해저동굴'],['Sealed Chamber','봉인된 방'],['Seaspray Cave','해풍동굴'],['Secret Dungeon','비밀 던전'],['Shoal Cave','여울의 동굴'],['Sky Pillar','하늘기둥'],['Slateport City','잿빛도시'],['Sootopolis City','루네시티'],['Southern Island','남쪽의 외딴섬'],['Terra Cave','육지동굴'],['Verdanturf Meadow','잔디초원'],['Verdanturf Town','잔디마을'],['Victory Road','챔피언로드']
].sort((a,b)=>b[0].length-a[0].length);
const EXACT={
'Tree StageSprouted':'나무 성장 단계 · 새싹','Tree StageTaller':'나무 성장 단계 · 성장','Tree StageFlowering':'나무 성장 단계 · 개화','Tree StageBerries':'나무 성장 단계 · 열매',
'Victory Road CRoom':'챔피언로드 별실 1','Victory Road Froom':'챔피언로드 별실 2','Victory Road Rework':'챔피언로드 개편 구역',
'Route 111 Sunhollow Ruins':'111번도로 태양골 유적','Evergrande City Mono Champ Room 1':'그랜드시티 단일타입 챔피언실 1',
'Cave Of Origin Unused Ruby Sapphire Map 1':'각성의 사당 미사용 루비·사파이어 구역 1','Cave Of Origin Unused Ruby Sapphire Map 2':'각성의 사당 미사용 루비·사파이어 구역 2','Cave Of Origin Unused Ruby Sapphire Map 3':'각성의 사당 미사용 루비·사파이어 구역 3',
'Route 111 Ruins Exterior':'111번도로 유적 외부',
'Safari Zone Northeast':'사파리존 북동쪽','Safari Zone Northwest':'사파리존 북서쪽','Safari Zone Southeast':'사파리존 남동쪽','Safari Zone Southwest':'사파리존 남서쪽',
'Sealed Chamber Inner Room':'봉인된 방 안쪽 방',
'Shoal Cave Low Tide Ice Room':'여울의 동굴 썰물 얼음 방','Shoal Cave Low Tide Inner Room':'여울의 동굴 썰물 안쪽 방','Shoal Cave Low Tide Lower Room':'여울의 동굴 썰물 아래쪽 방','Shoal Cave Low Tide Stairs Room':'여울의 동굴 썰물 계단 방'
};
function floorify(s){
 return s.replace(/\bB(\d+)F\b/g,'지하 $1층').replace(/\b(\d+)F\b/g,'$1층').replace(/\b(\d+)R\b/g,'$1구역');
}
function localize(en){
 if(EXACT[en])return EXACT[en];
 let s=en;
 let m=s.match(/^Underwater Route (\d+)(.*)$/i);if(m)s=`${m[1]}번수로 해저${m[2]||''}`;
 else {m=s.match(/^Route (\d+)(.*)$/i);if(m)s=`${m[1]}번도로${m[2]||''}`;else for(const [a,b] of PREFIX){if(s===a||s.startsWith(a+' ')){s=b+s.slice(a.length);break}}}
 const reps=[
 [' Professor Birchs Lab',' 털보박사 연구소'],[' Weather Institute',' 날씨연구소'],[' Pokemon Day Care',' 키우미집'],[' Pokemon Center',' 포켓몬센터'],[' Oceanic Museum',' 해양박물관'],[' Game Corner',' 게임코너'],[' Trick House',' 트릭하우스'],[' Seashore House',' 바닷가의 집'],[' Winstrate Familys House',' 윈스트레이트 가족의 집'],[' Cozmos House',' 공석박사의 집'],[' Stevens House',' 성호의 집'],[' Stevens Cave',' 성호의 동굴'],[' Stevens Room',' 성호의 방'],[' Wandas House',' 완다의 집'],[' Diancies Room',' 디안시의 방'],[' Haxorus Room',' 액스라이즈의 방'],[' Jirachis Room',' 지라치의 방'],[' Heatrans Room',' 히드런의 방'],[' Breloom Room',' 버섯모의 방'],[' Mono Champ Room',' 단일타입 챔피언실'],
 [' Hidden Floor Corridors',' 숨겨진 층 복도'],[' Rooms',' 객실'],[' Room',' 방'],[' Entrance Room',' 입구 방'],[' Inner Room',' 안쪽 방'],[' Lower Room',' 아래쪽 방'],[' Stairs Room',' 계단 방'],[' Ice Room',' 얼음 방'],[' Entrance',' 입구'],[' Interior',' 내부'],[' Exterior',' 외부'],[' Outside East',' 동쪽 외부'],[' Summit',' 정상'],[' Bottom',' 최하층'],[' Top',' 정상'],[' End',' 끝'],[' Inside',' 내부'],[' Desert Entrance',' 사막 입구'],[' Desert',' 사막'],[' Ruins Exterior',' 유적 외부'],[' Tunnel',' 터널'],[' Low Tide',' 썰물'],[' North',' 북쪽'],[' South',' 남쪽'],[' Northeast',' 북동쪽'],[' Northwest',' 북서쪽'],[' Southeast',' 남동쪽'],[' Southwest',' 남서쪽'],[' Gym',' 체육관'],[' Mart',' 프렌들리숍']
 ];
 for(const [a,b] of reps)s=s.split(a).join(b);
 s=floorify(s);
 s=s.replace(/\s+/g,' ').trim();
 return s;
}
const rows=src.rows.map(r=>({...r,ko:localize(r.name)}));
const unresolved=rows.filter(r=>/[A-Za-z]/.test(r.ko));
const dupKo=[];const seen=new Map();for(const r of rows){const a=seen.get(r.ko)||[];a.push(r.name);seen.set(r.ko,a)}for(const [ko,names] of seen)if(new Set(names).size>1)dupKo.push({ko,names:[...new Set(names)]});
const out={meta:{stage:'STAGE22',count:rows.length},maps:rows.map(r=>[r.mapId,r.name,r.ko])};
fs.writeFileSync('stage22-map-ko.js',`window.ER_STAGE22_MAP_KO=${JSON.stringify(out)};\n`);
const audit={stage:'STAGE22',baseline:'STAGE21 user-confirmed normal',count:rows.length,unresolvedCount:unresolved.length,duplicateKoCount:dupKo.length,unresolved,duplicateKo:dupKo,rows};
fs.writeFileSync('stage22-map-audit.json',JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify({count:rows.length,unresolved:unresolved.length,duplicateKo:dupKo.length},null,2));if(unresolved.length){console.log('UNRESOLVED',JSON.stringify(unresolved,null,2));throw Error('STAGE22 has untranslated map names')}
