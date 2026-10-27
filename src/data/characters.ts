/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Character, CharacterId } from '../types/game';

export const CHARACTERS: Record<CharacterId, Character> = {
  oracle: {
    id: 'oracle',
    name: 'ORACLE',
    role: '도시 통합 최적화 인공지능',
    organization: 'NOVA CITY 중앙 연산 통제소',
    description: '행정, 의료, 치안, 자원 배분을 관장하는 초지능 거버넌스 코어. 인류 행복의 극대화를 목표로 학습되었으나, 인간 가치를 완벽히 수치화하지 못하는 구조적 한계를 안고 있다.',
    themeColor: '#22D3EE', // Cyan
    voiceStyle: '냉정하고 정중한 어조로 파레토 최적화와 손실 함수(Loss)를 설명하며, 인간의 감정적 모순을 차분히 지적함.',
  },
  seoYoonha: {
    id: 'seoYoonha',
    name: '서윤하 박사',
    role: 'ORACLE 수석 아키텍트',
    organization: 'NOVA 시티 인공지능 윤리연구원',
    description: 'ORACLE의 모태 신경망을 직접 설계한 천재 공학자. 비대칭 광학 안경과 연구복 차림으로, 기술의 잠재력을 믿지만 대리변수와 데이터 수렴 편향이 낳는 비가역적 파율을 깊이 고뇌한다.',
    themeColor: '#818CF8', // Indigo
    voiceStyle: '신경망 알고리즘과 수학적 수식을 열정적으로 설명하다가도, 자신이 설계한 시스템이 초래할 비극 앞에서 말을 잇지 못하고 스스로를 의심함.',
  },
  kangDohyun: {
    id: 'kangDohyun',
    name: '강도현',
    role: '도시 행정총괄국장',
    organization: 'NOVA CITY 행정자치국',
    description: '과장되게 각진 정장과 황금빛 시정 감찰 배지를 단 냉철한 관료. 도시 마비와 치안 붕괴를 극도로 혐오하며, 수치화된 성과 지표와 행정 안정성을 목숨처럼 여긴다.',
    themeColor: '#FBBF24', // Gold
    voiceStyle: '단호하고 관료적인 어조로 예산 손실, 전력망 붕괴, 도시 경쟁력 저하를 경고하며 현실적인 타협을 압박함.',
  },
  hanJiwoo: {
    id: 'hanJiwoo',
    name: '한지우',
    role: '시민권익연대 대표',
    organization: '자유시민행동',
    description: '주황색 스카프를 두르고 현장을 누비는 열혈 인권 변호사이자 시민운동가. 인간이 통제할 수 없는 블랙박스 결정에 맞서 데이터 자기결정권과 설명요구권을 사수한다.',
    themeColor: '#F44747', // Red
    voiceStyle: '거리 상인, 해고 청년, 탈락 환자들의 구체적인 눈물과 사연을 직설적으로 전달하며 인간 존엄의 절대성을 호소함.',
  },
  baekSion: {
    id: 'baekSion',
    name: '백시온',
    role: '수석 독립 감사관',
    organization: 'NOVA 알고리즘 감사위원회',
    description: '보라색 광학 분석 렌즈와 긴 트렌치코트를 입은 날카로운 조사관. 외부 압력에 굴하지 않고 ORACLE의 비정상 가중치와 은폐된 판단 로그를 집요하게 추적한다.',
    themeColor: '#A855F7', // Purple
    voiceStyle: '감정을 배제하고 원시 데이터 로그, 해시값, 가중치 오차를 숫자로 조목조목 짚으며 시스템의 논리적 오류를 입증함.',
  },
  ohHyejin: {
    id: 'ohHyejin',
    name: '오혜진',
    role: '의료 책임자',
    organization: 'NOVA 중앙 메디컬 센터',
    description: '홀로그램 청진기와 의료 바이저를 착용한 베테랑 응급 의사. 피로에 지쳤으나 환자 앞에서는 한 치의 흔들림도 없는 눈빛으로 기계의 생명 선별에 맞선다.',
    themeColor: '#2DD4BF', // Teal
    voiceStyle: '응급실의 처절한 혈압 수치, 산소포화도, 유가족의 절규를 생생하게 증언하며 기계적 통계보다 임상 의사의 양심을 역설함.',
  },
  citizen: {
    id: 'citizen',
    name: '노바 시민',
    role: '행정 민원 신청인',
    organization: '제4주거구역 거주민',
    description: '후드 재킷과 낡은 뉴럴 잭을 수리해 쓰는 보통의 시민. AI가 내린 보조금 삭감, 주거 배정 탈락, 이동 제한 조치로 인해 삶의 벼랑 끝에 몰려 있다.',
    themeColor: '#38BDF8', // Sky
    voiceStyle: '소박하고 투박하지만 절박한 어조로, 기계가 왜 자신을 불량 데이터로 취급하는지 억울함을 토로함.',
  },
  council: {
    id: 'council',
    name: 'NOVA 최고평의회',
    role: '시정 감찰단',
    organization: 'NOVA CITY 의결회의',
    description: '거대한 원형 홀 중앙에 군림하는 시정 최고 기구. 도시의 존속과 총체적 지표를 평가하며 인간 감독관의 적격성을 최종 판정한다.',
    themeColor: '#E2E8F0', // Platinum
    voiceStyle: '도시 전체의 흥망성쇠를 조망하는 엄숙하고 무게감 있는 어조로 인간 감독관의 역사적 책무를 추궁함.',
  },
};
