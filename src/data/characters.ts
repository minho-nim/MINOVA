/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Character, CharacterId } from '../types/game';

export const CHARACTERS: Record<CharacterId, Character> = {
  oracle: {
    id: 'oracle',
    name: 'ORACLE',
    role: 'AI 통합 행정 시스템',
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
    voiceStyle: '시민권 활동가로서 기본권, 감시와 차별의 제도적 원인을 직설적으로 지적하고 동의·재심·구제 절차를 요구함. 시민 전체의 의견을 대신 단정하지 않음.',
  },
  baekSion: {
    id: 'baekSion',
    name: '백시온',
    role: '수석 독립 감사관',
    organization: 'NOVA 알고리즘 감사위원회',
    description: '보라색 광학 분석 렌즈와 긴 트렌치코트를 입은 날카로운 조사관. 외부 압력에 굴하지 않고 ORACLE의 비정상 가중치와 은폐된 판단 로그를 집요하게 추적한다.',
    themeColor: '#A855F7', // Purple
    voiceStyle: '확보한 증거와 미검증 의혹을 구분하고 로그 보존, 독립 검증, 은폐 조사 범위를 설명함. 기술 설계의 책임과 사법 판결을 대신하지 않음.',
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
    name: 'NOVA 시민',
    role: '일반 시민 집단',
    organization: '노바시티의 다양한 생활 현장',
    description: '학생, 직장인, 노동자, 자영업자, 어르신, 부모와 환자 등 노바시티의 평범한 사람들. 정책의 혜택과 피해를 직접 경험하며, 같은 정책에도 서로 다른 의견을 전한다.',
    themeColor: '#38BDF8', // Sky
    voiceStyle: '다양한 당사자가 자기 생활의 변화를 구체적으로 말함. 의견이 갈리면 반기는 사람과 불편한 사람의 목소리를 함께 전하며 특정 정치 입장이나 단체를 대표하지 않음.',
  },
  council: {
    id: 'council',
    name: 'NOVA 최고평의회',
    role: '최고 통치 기관',
    organization: 'NOVA CITY 의결회의',
    description: '거대한 원형 홀 중앙에 군림하는 시정 최고 기구. 도시의 존속과 총체적 지표를 평가하며 인간 감독관의 적격성을 최종 판정한다.',
    themeColor: '#E2E8F0', // Platinum
    voiceStyle: '정책 승인권, 감독관 임면권과 정치적 책임을 엄숙하게 추궁함. 통치 권한과 권력 유지의 이해관계를 드러내되 현장 예산·집행 보고는 행정국과 구분함.',
  },
};
