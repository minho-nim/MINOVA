import { CharacterId } from '../types/game';

export const MAIN_CAST: CharacterId[] = ['oracle', 'seoYoonha', 'kangDohyun', 'hanJiwoo', 'baekSion', 'ohHyejin'];
export const CHARACTER_SHEET = `${import.meta.env.BASE_URL}assets/aistudio/image_7b1e602b.png`;
export const CAST_DETAILS: Partial<Record<CharacterId, { tag: string; quote: string; traits: string[] }>> = {
  oracle: { tag: '도시 운영 AI', quote: '평균 대기 시간은 줄었습니다. 더 오래 기다린 사람이 있다는 보고는 받았습니다.', traits: ['논리적', '냉정함', '목표 중심'] },
  seoYoonha: { tag: 'AI 개발자', quote: '제가 만든 모델이에요. 왜 그런 답이 나왔는지 모른다는 말로 끝낼 수는 없죠.', traits: ['꼼꼼함', '신중함', '책임감'] },
  kangDohyun: { tag: '행정 관료', quote: '검토할 시간은 드리겠습니다. 다만 버스는 내일 아침에도 운행해야 합니다.', traits: ['현실주의', '효율 중심', '정치적'] },
  hanJiwoo: { tag: '시민 활동가', quote: '기각 통지서만 세 번째예요. 이번에는 담당자 이름이라도 알려주세요.', traits: ['직설적', '공감 능력', '행동 중심'] },
  baekSion: { tag: '독립 감사관', quote: '보고서는 읽었습니다. 이제 수정하기 전의 기록을 보여주시죠.', traits: ['분석적', '신중함', '비밀스러움'] },
  ohHyejin: { tag: '의료 책임자', quote: '빈 침대는 하나고, 구급차는 두 대가 오고 있어요. 기준을 정해주셔야 해요.', traits: ['실용적', '따뜻함', '단호함'] },
};
