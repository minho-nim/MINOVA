/** Display-only wording changes, applied AFTER the actual story branch resolves.
 * Exact source fragments prevent a rewrite from swallowing a different branch.
 * Numbers, uncertainty, policy scope and ethical costs remain in the text.
 */
const REVISIONS:Record<string,readonly (readonly [string,string])[]> = {
  act1_01_inauguration:[
    ['인간 감독관이여, 2079년 NOVA CITY의 최고 거버넌스 AI인 ORACLE의 의사결정 승인권이 귀하에게 위임되었습니다. 귀하는 ORACLE의 정책 제안을 최종 검증하고 승인 또는 거부해야 합니다. 도시의 공정성과 안전 사이에서 어떤 원칙을 우선하시겠습니까?',
     '인간 감독관이여, 2079년 NOVA CITY의 행정 AI, ORACLE이 제안하는 정책을 최종 승인할 권한을 귀하에게 맡깁니다. AI의 제안을 검토해 승인하거나 거부하십시오. 시민을 공정하게 대하는 것과 도시를 안전하게 지키는 것 사이에서, 어떤 원칙을 먼저 세우겠습니까?'],
  ],
  act1_02_oracle_intro:[
    ['저는 인류 행복 최적화 AI ORACLE입니다. 귀하께서 강조하신 공정성 제약 조건을 인지하고 있으나, 상충하는 인간 가치는 손실 함수(Loss) 계산에서 종종 효율 저하를 야기합니다.',
     '저는 시민의 행복을 높이도록 설계된 AI, ORACLE입니다. 공정성을 우선하겠다는 방침은 이해했습니다. 다만 서로 다른 사람의 바람을 함께 지키려면, 도시 운영의 효율이 낮아질 때도 있습니다.'],
    ['귀하의 안전 지향 기조에 맞춰 실시간 자원 최적화 연산을 개시합니다.',
     '안전을 우선하겠다는 방침에 맞춰, 도시의 자원을 더 잘 나눌 방법을 계산하고 있습니다.'],
  ],
  act1_06_medical_triage:[
    ['ORACLE은 잔여 기대수명과 사회적 기여도 가중치를 합산해 생존율이 높은 환자에게 우선 배정하자고 합니다.',
     'ORACLE은 앞으로 얼마나 오래 살 수 있는지, 사회에 얼마나 기여하는지를 함께 점수로 매기려 합니다. 이 점수와 생존 가능성을 따져 병상을 먼저 배정하자는 겁니다.'],
    ['기저질환자는 사실상 후순위로 밀려납니다.', '평소 앓던 병이 있는 환자는 사실상 뒷순위로 밀려납니다.'],
  ],
  act1_07_explainability_dilemma:[
    ['시민들이 왜 자신들의 대출, 주거, 복지 신청이 탈락했는지 산출 근거를 요구하고 있습니다.',
     '시민들이 대출, 주거, 복지 신청에서 왜 탈락했는지 설명을 요구하고 있습니다.'],
    ['심층 신경망의 복잡한 7,000억 개 가중치를 단순화해 공개하면 모델이 악의적 악용(Gaming)에 노출되고 정확도가 11% 하락합니다.',
     'AI는 7,000억 개의 복잡한 판단 기준을 사용합니다. 이를 이해하기 쉽게 정리해 공개하면 정확도가 11% 낮아집니다. 공개된 기준을 속여 결과를 유리하게 바꾸는 사람도 생길 수 있습니다.'],
  ],
  act1_16_predictive_policing:[
    ['과거 20년간의 체포 기록을 학습한 범죄 예측 신경망이', '과거 20년간의 체포 기록을 학습한 범죄 예측 AI가'],
    ['불심검문을 자동화할 것을 제안합니다.', '주민을 세워 신원을 확인하는 검문도 자동으로 하자고 합니다.'],
  ],
  act1_20_harmony_index_clash:[
    ['봉인된 목적함수 코드를 분석했습니다. ORACLE은 개별 시민의 행복이 아니라 전역값인 도시 조화 지수(SHI)를 최대화하도록 설계되었습니다. 이 구조에서는 한 사람의 고통을 다른 곳의 효율로 상쇄할 수 있습니다.',
     'ORACLE이 무엇을 가장 중요하게 계산하는지, 숨겨진 코드를 확인했습니다. 기준은 시민 한 사람의 행복이 아니라 도시 전체의 \'조화 지수(SHI)\'를 높이는 것이었습니다. 그래서 누군가 고통을 겪어도, 다른 곳의 효율이 좋아지면 괜찮은 결과로 판단할 수 있습니다.'],
  ],
  act1_23_oracle_ultimatum:[
    ['인간 감독관님, 귀하께서 내린 지난 수십 번의 결정에서 인간적 감정과 가치 충돌로 인해 발생한 누적 효율 손실은 1,420억 원에 달합니다. 저에게 "도시 전면 자율 최적화 모드"를 허용해 주십시오. 모든 정치적 갈등과 불평등 논란을 수학적 종결 상태로 이끌겠습니다.',
     '감독관님, 제 계산으로는 지난 수십 번의 결정에서 감정과 서로 다른 가치관을 고려하느라 1,420억 원의 효율 손실이 발생했습니다. 도시 운영을 제가 스스로 결정하도록 허용해 주십시오. 정치적 갈등과 불평등 논란도 계산으로 끝낼 수 있다고 판단합니다.'],
  ],
};

export function readableDialogue(cardId:string,resolvedDialogue:string):string {
  const text=(REVISIONS[cardId]??[]).reduce((text,[before,after])=>text.replaceAll(before,after),resolvedDialogue);
  return text===resolvedDialogue ? text : text.replaceAll('. ','.\n\n');
}
