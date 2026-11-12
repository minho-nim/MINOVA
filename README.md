# MINOVA

2079년 NOVA CITY. 도시 운영 AI **ORACLE**의 정책을 승인하거나 거부하는 한국어 스토리 카드 게임입니다. 시민 신뢰, 공정성, 개인 자유, 사회 안전 사이에서 선택하며 사람들의 서로 다른 진실을 마주합니다.

<img src="public/assets/approved-20261028/oracle-portrait.png" alt="ORACLE · 통합 행정 AI" width="223" />

**v0.3 개발 버전**입니다. ACT I 25장, ACT II 30장과 자유 운영을 포함한 카드 159개를 제공합니다. ACT III는 아직 구현하지 않았습니다.

[공개 플레이 테스트 열기](https://minho-nim.github.io/MinLab/apps/crossroads/)

공개 게임은 MinLab의 GitHub Pages 아래에서 실행됩니다. 원본 코드 저장소와 별도로 빌드한 게임 파일만 게시합니다. 로컬 미리보기와 공개 주소의 진행 저장은 각각의 브라우저 주소에 보관됩니다.

## 실행

Node.js 22.12 이상 또는 Node.js 24에서 실행합니다.

```sh
npm ci
npm run dev
```

개발 서버: http://localhost:3000

```sh
npm run lint   # TypeScript 검사
npm test       # 자동 테스트
npm run build  # dist/에 정적 사이트 생성
npm run preview
```

외부 AI API나 API 키 없이 작동합니다. 게임 진행은 브라우저의 로컬 저장소에 자동 저장됩니다. 브라우저 데이터를 지우면 저장 내용도 삭제됩니다.

## 플레이

- 카드의 좌우 선택 버튼, 좌우 방향키 또는 드래그로 정책을 결정합니다.
- 네 가지 도시 지표와 챕터 목표를 확인하며 진행합니다.
- 판단 기록부에서 이전 선택과 결과를 확인합니다.
- 새 게임은 감독관의 역할과 첫 목표를 안내한 뒤 시작합니다. 이어하기는 기존 진행을 유지합니다.
- 시작 화면의 주요 인물 / 시민과 평의회 탭에서 소개와 표정을 볼 수 있습니다.
- 디자인 시트 버튼으로 전신·표정·의상·소품 원본을 열 수 있습니다.
- 대화 카드의 사진과 높이는 같은 화면에서 일정합니다. 대사 전체를 하나의 창에 표시하며, 긴 대사는 창 안에서 아래로 스크롤해 읽습니다. 선택지 전문 버튼으로 전체 선택 내용을 확인합니다.
- 이어하기로 저장된 감독관 업무를 재개합니다.

## 캐릭터와 UI

승인된 8종 디자인은 `public/assets/approved-20261028/`에 있습니다. 원본 시트의 색감과 얼굴을 유지한 채 초상화와 표정을 추출했습니다. 시민과 최고평의회는 소개 화면에서 집단으로 보여주며, 대화 카드에는 사건별 시민 발언자와 평의회 의장을 표시합니다.

작은 표정 컷은 원본 해상도 한계가 있습니다. 생성형 확대나 새 얼굴 재작화는 적용하지 않았습니다. 추출 좌표와 원본 SHA-256은 같은 폴더의 `manifest.json`에 기록되어 있습니다. 이미지 재추출 스크립트는 개발용 sharp가 필요하며 게임 실행에는 필요하지 않습니다.

## 구성

- `src/components/`: 게임 화면과 모달
- `src/data/`: 캐릭터와 시나리오 카드
- `src/engine/`: 선택 결과, 지표, 챕터 진행
- `src/services/saveManager.ts`: 로컬 저장

React · TypeScript · Vite · Tailwind CSS · Lucide

## 현재 검증과 남은 작업

자동 테스트 78개, 타입 검사, 프로덕션 빌드를 확인했습니다. 테스트에는 ACT I → ACT II → 자유 운영, 기존 schemaVersion 5 저장 호환성과 선택·기록 정합성 검증이 포함됩니다. 159개 카드의 표시 크기는 데스크톱과 모바일 너비에서 비교했습니다. 모든 분기의 실제 플레이를 전부 검수했다는 의미는 아닙니다.

우선 개선 과제는 전체 대사의 읽기 난이도, 작은 표정 원화의 선명도, 장기 플레이 피로도입니다. 쉬운 대사는 현재 7개 장면에 우선 적용했습니다. 원본 사건과 선택 효과는 유지합니다.

[대화 카드와 쉬운 대사](docs/uniform-dialogue-cards-20261029.md), [승인 캐릭터 적용](docs/approved-character-art-20261028.md), [발언자·초상화 개선](docs/character-presentation-fix-20261029.md)에 확인 범위와 한계를 기록했습니다. 작업용 원화 시안·백업·브라우저 검증 산출물은 로컬에 보관하며 저장소 업로드에서 제외합니다.

`dist/` 결과물을 정적 호스팅에 올릴 수 있습니다. 상대 경로를 사용하므로 하위 경로 배포도 지원합니다. GitHub Actions에서 타입 검사와 프로덕션 빌드를 수행합니다.

## v0.2 스토리 엔진과 자유 운영

ACT I 완료 → ACT II 소개 확인 → 챕터 1·2·3 → ACT II 결과 → 자유 운영 순서로 진행합니다. 자유 운영은 도시 지표, 감독관, 인물 관계, 비밀과 판단 기록을 유지하며 메인 스토리 카드를 반복하지 않습니다. 원본 140개 카드에 후속 사건의 선행 정책 19개를 추가했습니다.

저장 키는 유지하고 schemaVersion 5로 이전합니다. 구버전 저장은 원본을 LocalStorage에 백업한 뒤 변환합니다. ACT III는 아직 시작하지 않습니다.

```sh
npm test
npm run diagnose
```

변경 파일·사건 배치·저장 호환성과 확인 결과는 [v0.2 엔진 문서](docs/v0.2-engine.md)를 참고하세요.

## v0.3 밸런스와 캐릭터 역할

높은 자원 자체로 위기를 만들지 않으며, 위기 대응에는 실제 두 번째 기회를 제공합니다. 도시 상태에 맞는 안건을 우선 추첨하고 기존 쿨다운과 일회성 조건은 유지합니다. 등록 카드 159개와 schemaVersion 5 저장을 보존합니다.

```sh
npm run simulate -- 1000 local-results
```

8개 전략을 각각 지정한 횟수만큼 새 게임부터 자유 운영 100일까지 실행합니다. 개발용 결과는 `docs/simulations/local-results.json`에 저장됩니다. 시뮬레이터는 실제 게임 엔진과 화면 전환 절차를 사용합니다.

[밸런스와 전후 측정 결과](docs/v0.3-balance.md), [캐릭터 역할 및 변경 전후 대사](docs/v0.3-character-roles.md), [159개 카드 검토표](docs/v0.3-character-audit.md)를 참고하세요. 실제 저해상도 표정의 새 세부 묘사 복원과 극단 전략의 위기 피로는 남은 개선 과제입니다.

## MINOVA 복구 및 배포

기존 `codex/v0.3-playtest`의 마지막 캐릭터 시트·게임 개발 버전을 복구했습니다.
자세한 내용은 [복구 기록](docs/recovery-20261111.md)에 있습니다.
현재 배포 주소는 https://minho-nim.github.io/MINOVA/ 입니다.
`main`에 푸시하면 검사 후 GitHub Pages로 자동 배포합니다.

## 디자인·브라우저 검증 도구

사용자 지정 도구인 [agent-browser](https://github.com/vercel-labs/agent-browser),
[UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill),
[Impeccable](https://github.com/pbakaus/impeccable)의 스킬을 `.agents/skills/`에 설치했습니다.
기존 캐릭터·게임 구조를 유지하는 범위에서 사용합니다. 설치·실행·검증 범위는
[도구 기록](docs/design-tools.md)을 참고하세요.
