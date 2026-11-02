(()=>{'use strict';
const FIXED=Object.freeze({
  ITEM_ALAKAZITE:'후디나이트',
  ITEM_ALAKAZITE_R:'후디나이트R',
  ITEM_BLUE_ORB:'쪽빛구슬',
  ITEM_RED_ORB:'주홍구슬',
  ITEM_ADAMANT_ORB:'금강옥',
  ITEM_LUSTROUS_ORB:'백옥',
  ITEM_GRISEOUS_ORB:'백금옥',
  ITEM_RUSTED_SWORD:'녹슨검',
  ITEM_RUSTED_SHIELD:'녹슨방패',
  ITEM_TEAL_MASK:'청록의 가면',
  ITEM_WELLSPRING_MASK:'우물의 가면',
  ITEM_HEARTHFLAME_MASK:'화덕의 가면',
  ITEM_CORNERSTONE_MASK:'주춧돌의 가면',
  ITEM_TERA_ORB:'테라스탈오브',
  ITEM_ULTRANECROZIUM_P:'울트라네크로Z',
  ITEM_DYNAMAX_ORB:'다이맥스오브',
  ITEM_PURPLE_ORB:'보라구슬',
  ITEM_GALACTIC_ORB:'갤럭틱오브',
  ITEM_SNORLAX_ORB:'잠만보오브',
  ITEM_VICTINI_ORB:'비크티니오브',
  ITEM_WIGGLITUFF_ORB:'푸크린오브',
  ITEM_PHANTOM_METEOR:'팬텀메테오'
});
const VARIANTS=[
  ['_R_B','RB'],['_R','R'],['_A','A'],['_G','G'],['_H','H'],['_S','S'],['_X','X'],['_Y','Y'],['_Z','Z']
];
function baseKo(name){return String(name||'').replace(/\s*\([^)]*\).*$/,'').trim()}
function variant(code){for(const [tail,label] of VARIANTS)if(String(code).endsWith(tail))return label;return''}
function isStoneCode(code){return /^ITEM_[A-Z0-9_]*ITE(?:_(?:R_B|R|A|G|H|S|X|Y|Z))?$/.test(String(code||''))}
function infer(code,sourceKo){if(!isStoneCode(code))return'';let root=baseKo(sourceKo);if(root==='후딘')root='후디';return root?`${root}나이트${variant(code)}`:''}
function build(species){const map=new Map(),conflicts=[],unresolved=[];for(const r of (Array.isArray(species)?species:[])){const sourceKo=String(r?.[1]||'');for(const rel of (Array.isArray(r?.[5])?r[5]:[])){const code=String(rel?.[2]||'');if(!code.startsWith('ITEM_'))continue;const ko=FIXED[code]||infer(code,sourceKo);if(!ko){unresolved.push({code,sourceId:Number(r?.[0])||0,sourceKo});continue}if(map.has(code)&&map.get(code)!==ko){conflicts.push({code,a:map.get(code),b:ko,sourceId:Number(r?.[0])||0});continue}map.set(code,ko)}}return{map,conflicts,unresolved}}
window.ER_STAGE26_ITEM_NAMES={FIXED,build,baseKo,infer};
})();
