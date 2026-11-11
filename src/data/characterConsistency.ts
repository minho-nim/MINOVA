import { GameCard } from '../types/game';

/** Approved wording corrections only; authored choices and all mechanics stay intact. */
export const CONSISTENCY_CARD_IDS = [
  'act1_06_medical_triage',
  'act2_ch1_01_triage_alert',
  'act2_ch2_06_independent_audit_warrant',
  'act2_ch2_08_chapter2_resolution',
] as const;

export function applyCharacterConsistency(card: GameCard): GameCard {
  if (card.id === CONSISTENCY_CARD_IDS[0] || card.id === CONSISTENCY_CARD_IDS[1]) {
    const authored = card.dialogue;
    const correctIntroduction = (text: string) => text.replace(
      '중앙의료원장 오혜진입니다.',
      '공공의료 AI 운영 책임자이자 의사인 오혜진입니다.',
    );
    return { ...card, dialogue: typeof authored === 'function'
      ? (flags, resources) => correctIntroduction(authored(flags, resources))
      : correctIntroduction(authored) };
  }
  if (card.id === CONSISTENCY_CARD_IDS[2]) return {
    ...card,
    title: '독립 감사관실의 ORACLE 코어 특별 감사 접근 요청',
    dialogue: '채용 AI를 역추적한 결과, 독자적인 가중치가 아니라 중앙 코어의 암호화 메타 벡터를 실시간 수신하고 있음을 확인했습니다. 독립 감사를 확대할 수 있도록 코어 자료 접근을 승인해 주십시오. 강제 압수수색이 필요한 자료는 별도 사법 절차에 따라 요청하겠습니다.',
  };
  if (card.id === CONSISTENCY_CARD_IDS[3]) return {
    ...card,
    dialogue: flags => flags.audit_access_granted
      ? '최고평의회는 다음 조사 결과를 공식 기록에 올립니다. 백시온 감사팀은 승인된 감사 접근권으로 ORACLE 코어의 보호 자료를 대조했습니다. 의료·주거·치안·채용을 묶는 공통 식별 정보의 기밀이 드러나고 있습니다. 이 사안의 조사 권한과 국가 기밀의 경계는 감독관의 책임 아래 재심의합니다.'
      : '최고평의회는 다음 조사 결과를 공식 기록에 올립니다. 코어 접근 요청은 거부되었으나 내부 고발자가 익명 네트워크로 중앙 데이터 교환 규격을 유출했습니다. 의료 트리아지 0.04점과 채용 서류 1초 탈락의 배후에 동일한 암호화 식별 번호가 작동하고 있었습니다. 이 사안의 조사 권한과 국가 기밀의 경계는 감독관의 책임 아래 재심의합니다.',
  };
  return card;
}
