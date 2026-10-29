import { GameCard, StoryFlags } from '../types/game';
// Keep the legacy source card intact while presenting the implemented v0.2 ending action.
export function choicePresentation(card: GameCard, direction: 'left' | 'right', flags: StoryFlags = {}) {
  const choice = direction === 'left' ? card.leftChoice : card.rightChoice;
  if (card.id === 'act1_11_education_tracking' && direction === 'right') return {
    text: 'AI 판단으로 14세 학생의 진학·직업 트랙을 영구 강제 배정하는 제도를 도입한다.',
    actionLabel: '강제 진로 배정 도입',
    consequence: 'AI 판단에 따른 14세 학생의 영구 진로 배정제를 승인했습니다. 단순 진로 추천을 승인한 것이 아닙니다.',
  };
  if (card.id === 'act1_13_unintended_consequence' && flags.surveillance_level !== 'total') return direction === 'left'
    ? {
      text: '확인되지 않은 피해 보상은 집행하지 않고, 수집을 축소하며 예방 보안과 공개 검증을 강화한다.',
      actionLabel: '예방 보안·공개 검증',
      consequence: '확인되지 않은 유출 피해에 보상하지 않고 예방적 보안 보강과 수집 축소를 결정했습니다. 점검 기간 감시 범위와 운영 여력은 줄었습니다.',
    }
    : {
      text: '침투 대응 정보를 기밀로 두고 감시 수집 범위와 사이버 방첩을 확대한다.',
      actionLabel: '기밀 대응·감시 확대',
      consequence: '확인되지 않은 유출을 사실로 단정하지 않고 대응 정보를 기밀화했습니다. 감시 확대의 안전 편익과 정보 비공개·기본권 제한의 비용이 발생했습니다.',
    };
  if (card.id === 'act2_ch3_07_final_civitas_verdict') return direction === 'left'
    ? { text: '제1안 가결: CIVITAS_SCORE를 영구 파기하고 기존 안전장치를 유지하며 존엄 헌장을 집행한다.', actionLabel: '점수 폐기·안전장치 유지', consequence: 'CIVITAS_SCORE 영구 파기와 보편 존엄 헌장을 의결했습니다. 기존 안전장치를 유지하면서 필수 서비스 전환의 비용을 감당하기로 했습니다.' }
    : { text: '제2안 가결: 점수를 기밀로 존속시키고 기존 감독 제한보다 ORACLE 완전 자율 집행권을 우선한다.', actionLabel: '감독 제한 철회·전권 위임', consequence: '기존의 점진적 개혁·감독 제한을 우선하지 않는 새로운 최종 판결로, 점수의 기밀 존속과 ORACLE 완전 자율 집행권을 의결했습니다.' };
  // The supervisor approves audit access; judicial search powers remain separate.
  // Buttons and newly written decision records share this same presentation.
  if (card.id === 'act2_ch2_06_independent_audit_warrant') return direction === 'left'
    ? {
      text: '독립 감사 접근을 승인한다. 어떤 알고리즘도 감사의 대상에서 제외될 수 없다.',
      actionLabel: '독립 감사 접근 승인',
      consequence: 'ORACLE 코어에 대한 독립 감사 자료 접근을 승인했습니다.',
    }
    : {
      text: '코어 개방의 도시 관제 중단 위험을 우선해 이번 접근 요청을 거부한다.',
      actionLabel: '코어 접근 거부',
      consequence: '도시 관제 안전을 이유로 독립 감사 접근 요청을 거부했습니다.',
    };
  if (card.id === 'act2_ch3_08_act2_epilogue' && direction === 'right')
    return {
      text: 'ACT II 완료 결과를 확인하고 다음 도시 운영 방식을 선택한다.',
      actionLabel: '완료 결과 확인',
      consequence: 'ACT II의 결과를 확인하고 앞으로의 도시 운영을 검토했습니다.',
    };
  return { text: choice.text, actionLabel: choice.actionLabel, consequence: choice.consequence };
}
