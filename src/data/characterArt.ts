import { CharacterId } from '../types/game';
const ART_BASE_URL = import.meta.env?.BASE_URL ?? '/';

export const MAIN_CAST: CharacterId[] = ['oracle', 'seoYoonha', 'kangDohyun', 'hanJiwoo', 'baekSion', 'ohHyejin'];
export const CHARACTER_SHEET = `${ART_BASE_URL}assets/aistudio/image_7b1e602b.png`;
export const EXPRESSION_SHEET = `${ART_BASE_URL}assets/character-expressions-v2.png`;
export const CAST_DETAILS: Partial<Record<CharacterId, { tag: string; quote: string; traits: string[] }>> = {
  oracle: { tag: 'AI SYSTEM', quote: '데이터는 거짓말하지 않습니다. 거짓말하는 것은 인간입니다.', traits: ['논리적', '냉정함', '완벽주의'] },
  seoYoonha: { tag: 'AI 개발자', quote: '완벽한 시스템은 없습니다. 문제는 우리가 어느 정도의 오류를 받아들일 수 있느냐예요.', traits: ['지식적', '불안함', '책임감'] },
  kangDohyun: { tag: '행정 관료', quote: '감정이 아니라 수치로 판단해야 도시가 움직입니다. 우리는 결과로 평가받습니다.', traits: ['현실주의', '효율 중심', '책임 회피'] },
  hanJiwoo: { tag: '시민 활동가', quote: '여기에도 사람이 살고 있어요. 통계에 없는 사람들까지 봐야 하지 않나요?', traits: ['직설적', '공감 능력', '때로는 편견'] },
  baekSion: { tag: '독립 감사관', quote: '의심하는 것이 제 일입니다. 증거가 말할 때까지, 아무것도 확신하지 않습니다.', traits: ['분석적', '신중함', '비밀스러움'] },
  ohHyejin: { tag: '의료 책임자', quote: 'AI가 아무리 정교해도, 환자는 숫자가 아닙니다. 우리는 사람을 치료합니다.', traits: ['실용적', '따뜻함', '단호함'] },
};

// Each rectangle is [x, y, width, height] in the supplied 1536 × 1024 sheet.
// Individual coordinates avoid sampling borders, labels or a neighboring character.
export const REFERENCE_SHEET = `${ART_BASE_URL}assets/character-sheet-v3.png`;
type ArtRegion = readonly [number, number, number, number];
interface CharacterArt {
  collective?: boolean;
  source?: string;
  sourceWidth?:number;
  sourceHeight?:number;
  rasterPortrait?:string;
  rasterExpressions?:readonly [string,string,string];
  portrait: ArtRegion;
  expressions: readonly [ArtRegion, ArtRegion, ArtRegion];
  labels: readonly [string, string, string];
  emotions: Record<import('../types/game').CharacterEmotion, 0 | 1 | 2>;
}
const REFERENCE_ART: Partial<Record<CharacterId, CharacterArt>> = {
  oracle: {
    portrait: [13, 102, 245, 310],
    expressions: [[22, 708, 72, 96], [103, 708, 72, 96], [184, 708, 70, 96]],
    labels: ['기본', '불확실', '충돌 · 오류'],
    emotions: {neutral:0, worried:1, uncertain:1, confident:0, angry:2, glitch:2},
  },
  seoYoonha: {
    portrait: [273, 102, 238, 310],
    expressions: [[277, 708, 72, 96], [355, 708, 72, 96], [434, 708, 72, 96]],
    labels: ['기본', '걱정', '단호'],
    emotions: {neutral:0, worried:1, uncertain:1, confident:2, angry:2, glitch:1},
  },
  kangDohyun: {
    portrait: [524, 102, 237, 310],
    expressions: [[530, 708, 70, 96], [606, 708, 70, 96], [683, 708, 70, 96]],
    labels: ['기본', '당황', '냉정'],
    emotions: {neutral:0, worried:1, uncertain:1, confident:2, angry:2, glitch:1},
  },
  hanJiwoo: {
    portrait: [776, 102, 239, 310],
    expressions: [[782, 708, 70, 96], [860, 708, 70, 96], [937, 708, 70, 96]],
    labels: ['기본', '미소', '결의'],
    emotions: {neutral:0, worried:0, uncertain:0, confident:1, angry:2, glitch:2},
  },
  baekSion: {
    portrait: [1030, 102, 237, 310],
    expressions: [[1036, 708, 70, 96], [1114, 708, 70, 96], [1192, 708, 70, 96]],
    labels: ['기본', '의심', '냉소'],
    emotions: {neutral:0, worried:1, uncertain:1, confident:2, angry:2, glitch:1},
  },
  ohHyejin: {
    portrait: [1283, 102, 240, 310],
    expressions: [[1288, 708, 70, 96], [1367, 708, 70, 96], [1445, 708, 70, 96]],
    labels: ['기본', '따뜻한 미소', '단호'],
    emotions: {neutral:0, worried:0, uncertain:0, confident:1, angry:2, glitch:2},
  },
};

export const CITIZEN_IMAGE = `${ART_BASE_URL}assets/nova-citizens.png`;
export const COUNCIL_IMAGE = `${ART_BASE_URL}assets/nova-council.png`;
export const COUNCIL_SHEET = `${ART_BASE_URL}assets/nova-council-sheet.png`;
export const APPROVED_ART_ROOT = `${ART_BASE_URL}assets/approved-20261028/`;
export const APPROVED_SHEETS = Object.fromEntries(
  [...MAIN_CAST, 'citizen', 'council'].map(id=>[id,`${APPROVED_ART_ROOT}${id}-sheet.png`]),
) as Record<CharacterId,string>;
export const DISPLAY_ROLES: Partial<Record<CharacterId,string>> = {
  oracle:'통합 행정 AI', seoYoonha:'AI 수석 개발자', kangDohyun:'도시 행정국장',
  hanJiwoo:'시민권 활동가', baekSion:'AI 독립 감사관', ohHyejin:'공공의료 책임자',
  citizen:'NOVA 시민', council:'최고평의회',
};
const APPROVED_LABELS: Record<string,readonly [string,string,string]> = {
  oracle:['기본','판단 중','오류 · 혼란'], seoYoonha:['기본','걱정','단호'],
  kangDohyun:['기본','고민','분노'], hanJiwoo:['기본','미소','결의'],
  baekSion:['기본','의심','분석'], ohHyejin:['기본','따뜻한 미소','단호'],
};
// Only lossless crops from the approved sheets. Old assets remain archived.
export const CHARACTER_ART: Partial<Record<CharacterId, CharacterArt>> = Object.fromEntries(
  MAIN_CAST.map(id => [id, { ...REFERENCE_ART[id]!, source: APPROVED_SHEETS[id],
    rasterPortrait:`${APPROVED_ART_ROOT}${id}-portrait.png`, labels:APPROVED_LABELS[id],
    rasterExpressions:([0,1,2] as const).map(i=>`${APPROVED_ART_ROOT}${id}-expression-${i}.png`),
  }]),
);
// These are collective speakers, so their portrait stays consistent across emotions.
CHARACTER_ART.citizen = {
  collective:true, rasterPortrait:`${APPROVED_ART_ROOT}citizen-portrait.png`,
  rasterExpressions:[0,1,2].map(i=>`${APPROVED_ART_ROOT}citizen-expression-${i}.png`) as [string,string,string],
  source: CITIZEN_IMAGE,sourceWidth:1024,sourceHeight:1536, portrait: [0, 300, 1024, 680],
  expressions: [[0, 300, 1024, 680], [0, 300, 1024, 680], [0, 300, 1024, 680]],
  labels: ['시민', '시민', '시민'], emotions: { neutral:0, worried:0, uncertain:0, confident:0, angry:0, glitch:0 },
};
CHARACTER_ART.council = {
  collective:true, rasterPortrait:`${APPROVED_ART_ROOT}council-portrait.png`,
  rasterExpressions:[0,1,2].map(i=>`${APPROVED_ART_ROOT}council-expression-${i}.png`) as [string,string,string],
  source: COUNCIL_IMAGE,sourceWidth:768,sourceHeight:1024, portrait: [197, 385, 480, 595],
  expressions: [[197, 385, 480, 595], [197, 385, 480, 595], [197, 385, 480, 595]],
  labels: ['최고평의회', '최고평의회', '최고평의회'], emotions: { neutral:0, worried:0, uncertain:0, confident:0, angry:0, glitch:0 },
};

export const FACTIONS = [
  { id: 'citizen', name: 'NOVA 시민', subtitle: 'NOVA CITY · PEOPLE', color: '#64e5ff', source:`${APPROVED_ART_ROOT}citizen-portrait.png`, sheet:APPROVED_SHEETS.citizen,
    quote: '각자의 삶을 살아가는 노바시티의 시민들입니다.',
    description: '학생, 직장인, 노동자, 자영업자, 어르신과 가족들. 정책의 혜택과 피해를 서로 다른 생활 현장에서 경험하며, 같은 안건에도 다양한 의견을 전합니다.',
    traits: ['다양성', '일상', '연대', '변화'], scenes: ['도시의 일상', '학생의 생활', '직장인의 생활', '자영업자의 생활'] },
  { id: 'council', name: 'NOVA 최고평의회', subtitle: 'NOVA SUPREME COUNCIL', color: '#efbf69', source:`${APPROVED_ART_ROOT}council-portrait.png`, sheet:APPROVED_SHEETS.council,
    quote: '노바시티의 질서와 안정을 유지하는 최고의 의사결정 기관입니다.',
    description: '도시의 데이터와 정책을 총괄하며 AI와 인간 사회의 균형을 조율합니다. 방대한 분석으로 도시의 미래를 결정하지만, 선택이 완벽한지에 대한 의심은 따라다닙니다.',
    traits: ['권력', '통제', '효율', '질서'], scenes: ['평의회 회의실', '의장', '시민권 · 인권', '기술 · 산업'] },
] as const;
