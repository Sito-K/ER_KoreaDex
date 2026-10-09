(()=>{'use strict';
const BASE={
  'Iron Exo':'무쇠외골격',
  'Iron Heart':'무쇠심장',
  'Clawtificer':'쌍포스터',
  'Kilozuna':'킬로주나',
  'Fogging':'포깅',
  'Breezing':'브리징',
  'Storming':'스토밍',
  'Merrykarp':'메리카프',
  'Gyarevelry':'갸라벨리',
  'Crag Hopper':'크래그호퍼',
  'Kipmodo':'킵모도',
  'Marshmodo':'마시모도',
  'Swampage':'스왐페이지',
  'Rexcadrill':'렉스카드릴',
  'Selenumbra':'셀레넘브라',
  'Eraticate':'에라티케이트',
  'Terrow':'테로우',
  'Luxzero':'럭스제로',
  'Frostuccino':'프로스투치노',
  'Slate':'슬레이트'
};
const CONFIRMED=new Set(['Clawtificer','Kilozuna','Crag Hopper','Swampage','Luxzero']);
function formKo(en,root,ko,token=''){
  if(en===root)return ko;
  const suffix=en.slice(root.length).trim();
  const t=String(token||'').toUpperCase();
  if(/MEGA[_ ]?X|MEGA X/i.test(suffix)||t==='MEGA_X')return `메가${ko}X`;
  if(/MEGA[_ ]?Y|MEGA Y/i.test(suffix)||t==='MEGA_Y')return `메가${ko}Y`;
  if(/MEGA/i.test(suffix)||t.includes('MEGA'))return `메가${ko}`;
  if(/REDUX/i.test(suffix)||t.includes('REDUX'))return `${ko} (리덕스폼)`;
  if(/PRIMAL/i.test(suffix)||t==='PRIMAL')return `원시${ko}`;
  return `${ko} (${suffix||'특수폼'})`;
}
function apply(rows,enIndex,koIndex,tokenIndex){
  if(!Array.isArray(rows))return;
  for(const r of rows){
    if(!Array.isArray(r))continue;
    const en=String(r[enIndex]||'');
    for(const [root,ko] of Object.entries(BASE)){
      if(en===root||en.startsWith(root+' ')){
        r[koIndex]=formKo(en,root,ko,r[tokenIndex]);
        break;
      }
    }
  }
}
apply(window.ER_OFFICIAL_SPECIES,1,2,5);
apply(window.ER_POKEMON_DATA,3,2,14);
window.ER_NAME_FIX_META={stage:10,overrides:Object.keys(BASE).length,confirmed:[...CONFIRMED],policy:'exact English override; never reuse unrelated Korean name by numeric ID'};
})();
