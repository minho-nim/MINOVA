import { CharacterId } from '../types/game';

export const MAIN_CAST: CharacterId[] = ['oracle', 'seoYoonha', 'kangDohyun', 'hanJiwoo', 'baekSion', 'ohHyejin'];
export const CHARACTER_SHEET = `${import.meta.env.BASE_URL}assets/aistudio/image_7b1e602b.png`;
export const CAST_DETAILS: Partial<Record<CharacterId, { tag: string; quote: string; traits: string[] }>> = {
  oracle: { tag: 'AI SYSTEM', quote: '데이터는 거짓말하지 않습니다. 거짓말하는 것은 인간입니다.', traits: ['논리적', '냉정함', '목표 중심'] },
  seoYoonha: { tag: 'AI 개발자', quote: '완벽한 시스템은 없습니다. 문제는 우리가 어느 정도의 오류를 받아들일 수 있느냐예요.', traits: ['지식적', '신중함', '책임감'] },
  kangDohyun: { tag: '행정 관료', quote: '감정이 아니라 수치로 판단해야 도시가 움직입니다. 우리는 결과로 평가받습니다.', traits: ['현실주의', '효율 중심', '정치적'] },
  hanJiwoo: { tag: '시민 활동가', quote: '여기에도 사람이 살고 있어요. 통계에 없는 사람들까지 봐야 하지 않나요?', traits: ['직설적', '공감 능력', '행동 중심'] },
  baekSion: { tag: '독립 감사관', quote: '의심하는 것이 제 일입니다. 증거가 말할 때까지, 아무것도 확신하지 않습니다.', traits: ['분석적', '신중함', '비밀스러움'] },
  ohHyejin: { tag: '의료 책임자', quote: 'AI가 아무리 정교해도, 환자는 숫자가 아닙니다. 우리는 사람을 치료합니다.', traits: ['실용적', '따뜻함', '단호함'] },
};
