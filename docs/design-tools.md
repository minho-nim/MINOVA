# MINOVA 디자인·브라우저 도구

## 적용 범위

사용자가 지정한 세 도구를 프로젝트에 설치했습니다. 캐릭터 시트와 게임 엔진은
복구된 v0.3 기준을 유지합니다. 이 도구의 일반적인 디자인 권고로 현재 화면의
색상·캐릭터·스토리·밸런스를 전면 교체하지 않습니다.

- [agent-browser](https://github.com/vercel-labs/agent-browser), CLI 0.42.0, Apache-2.0
  - `.agents/skills/agent-browser/`의 공식 discovery 스킬을 설치했습니다.
  - 실제 사용 지침은 CLI의 `skills get core`로 읽습니다.
  - 개발 서버에서 접근성 트리 → 실제 버튼 조작 → 새 트리 확인을 수행했습니다.
- [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), MIT
  - 소스 커밋 `6ae86f61f520d6ca229d2f40e070410638c908c5`
  - `.agents/skills/ui-ux-pro-max/`에 검색 데이터·스크립트·지침을 설치했습니다.
  - 터치 크기·간격·키보드 접근성의 UX 검색 결과를 참고했습니다.
- [Impeccable](https://github.com/pbakaus/impeccable), 4.8.2, Apache-2.0
  - 소스 커밋 `b4bff1626c344067788c2679f048a20057c7cc5a`
  - 설치 서버 접근 실패 후 공식 GitHub의 스킬 소스를 설치했습니다.
  - 엔진은 공식 런처의 체크섬 검증을 통과했습니다.
  - 기존 화면을 유지하는 `adapt` 지침을 사용했습니다.
  - `CardGlossary.tsx`와 `GameCard.tsx` 소스 detector 결과: 0건, 종료 코드 0.
  - 수동 검증 방식이며 자동 편집 훅이나 live 원격 편집은 활성화하지 않았습니다.

## 이 환경에서 실행

프로젝트 개발 의존성 및 게임 번들에 도구를 추가하지 않습니다. CLI 설치 위치는
`/workspace/.tools/minova-design`입니다. 새 환경에서 CLI가 없으면 다음을 실행합니다.

```sh
bash scripts/design-tools.sh setup
bash scripts/design-tools.sh browser skills get core
bash scripts/design-tools.sh browser open http://127.0.0.1:3000/
bash scripts/design-tools.sh browser snapshot -i
bash scripts/design-tools.sh audit --json src/components/CardGlossary.tsx src/components/GameCard.tsx
```

브라우저는 프로젝트별 전용 세션과 `/tmp/minova-browser-state`를 사용합니다.
기존 `/usr/bin/chromium`을 사용하며, 컨테이너에서 요구하는 브라우저 시작 옵션을
헬퍼에 포함했습니다. 개발 서버는 `npm run dev -- --strictPort`로 별도 실행합니다.
게임 상태·계정·브라우저 인증 정보를 도구 설정이나 Git에 저장하지 않습니다.

## 이번 UI 작업

- 용어를 누르는 동안만 하단 포털 팝업으로 설명합니다. 설명을 인라인으로 펼치지 않습니다.
- 포인터 취소·놓기·키보드 키 놓기·초점 이탈에서 팝업을 닫습니다.
- 설명을 읽는 동안 wheel·touchmove·방향키 스크롤과 게임 선택을 막습니다.
- 본문 카드는 초반 8개 장면의 짧은 문장 또는 명시적인 대사 미리보기를 표시합니다.
- 원문은 `대사 전체 보기`, 선택 원문은 `선택지 전문`에서 유지합니다.
- 항상 보이는 선택 버튼은 동작 이름만 표시하고 전체 문장은 스와이프 미리보기에서 확인합니다.
- 캐릭터와 선택 결과·수치·시나리오의 원본 데이터는 유지합니다.

## 검증

자동 테스트·타입 검사·빌드와 별도로, 320×568·390×844·1440×1000 화면에서
민원 안건의 짧은 대사와 조작을 확인했습니다. 마우스·키보드와 Chromium의 터치 입력으로
누르고 있기, 놓기, 스크롤 차단과 복원, 본문 원문 보기, 일반 터치 스와이프를 검증했습니다.
실제 휴대폰 하드웨어에서 검증했다고 뜻하지는 않습니다.
