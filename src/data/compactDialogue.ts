/** Presentation only. The resolved source and all decisions remain unchanged. */
const OPENING: Record<string, (source: string) => string> = {
  act1_01_inauguration: () => 'ORACLE의 정책을 승인할 권한을 맡깁니다. 시민의 공정한 대우와 도시의 안전, 어느 쪽을 먼저 지키겠습니까?',
  act1_02_oracle_intro: source => source.includes('공정성을 우선')
    ? '공정성을 지키려면 도시 운영의 효율이 낮아질 때도 있습니다. 첫 교통안을 검토해 주십시오.'
    : '안전을 우선하겠습니다. 통근 시간과 탄소 배출을 23.4% 줄일 교통안이 준비됐습니다.',
  act1_03_traffic_optimization: () => '통행료를 더 내면 신호를 먼저 주겠습니다. 생산성은 18.2% 늘고, 일반 차선은 평균 4.8분 더 기다립니다.',
  act1_04_movement_surveillance: () => '카메라와 휴대전화 기록을 연결하면 범죄 예측률을 94%까지 높일 수 있다고 합니다. 모든 시민의 이동 경로를 모아도 되겠습니까?',
  act1_05_complaint_automation: () => '민원이 하루 12만 건입니다. 승소 가능성이 30% 이하인 반복 민원을 사람이 읽기 전에 기각하면 처리 속도가 400% 빨라집니다.',
  act1_06_medical_triage: () => '병상이 모자랍니다. 예상 수명과 사회적 기여도로 배정하면, 70세 이상과 평소 병을 앓던 환자는 뒤로 밀립니다.',
  act1_07_explainability_dilemma: () => '시민들이 탈락 이유를 묻고 있어요. 판단 기준을 공개하면 정확도가 11% 낮아지고, 그 기준을 속이는 사람도 생길 수 있습니다.',
  act1_08_citizen_protest: () => '심사에서 탈락한 제4구역 시민 3천 명이 시청 앞에 모였습니다. 사람이 다시 심사해 달랍니다. 행정국은 청원을 기각하자고 합니다.',
};

export function compactDialogue(cardId: string, source: string): { text: string; excerpt: boolean } {
  if (OPENING[cardId]) return { text: OPENING[cardId](source), excerpt: false };
  const plain = source.replace(/\s+/gu, ' ').trim();
  if (Array.from(plain).length <= 110) return { text: plain, excerpt: false };
  // An explicitly labelled preview, not an invented summary of a dynamic branch.
  const prefix = Array.from(plain).slice(0, 104).join('');
  const space = prefix.lastIndexOf(' ');
  return { text: prefix.slice(0, space > 75 ? space : prefix.length).trimEnd() + '…', excerpt: true };
}
