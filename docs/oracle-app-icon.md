# ORACLE 앱 아이콘

2026-10-30 사용자 승인에 따라 기본 제공 이미지 생성 도구로 대표 아이콘을 제작했다. 게임의 캐릭터 원화는 변경하지 않았다. 참고 이미지는 승인된 `oracle-expression-0.png`다.

선택된 생성 원본: `public/icons/oracle-app-source.png`. 16·32·48·180·192·512px PNG, 여백을 둔 maskable 512px, 다중 크기 ICO를 `scripts/export-app-icons.mjs`로 내보낸다. 이미지 생성 API나 추가 런타임 의존성은 없다. 재출력에는 기존 원화 내보내기와 동일한 개발용 sharp가 필요하다.

브라우저 파비콘, Apple 홈 화면 아이콘, 웹 매니페스트, 공유 이미지와 게임 헤더의 작은 브랜드 표시로 연결한다. 매니페스트의 시작 주소·범위·ID는 상대 경로여서 기존 MinLab 하위 경로 안에서 실행된다. 오프라인 캐시나 서비스 워커는 추가하지 않았다. 아이콘 변경은 이미 설치한 바로가기의 캐시 정책에 따라 늦게 보일 수 있다.

## 최종 생성 프롬프트

Use case: logo-brand. Asset type: single finished square app icon for Crossroads: AI Verdict. Input image: reference only, approved ORACLE design. Create a polished 1024x1024 opaque full-bleed square icon, no mockup or margins outside canvas. Preserve ORACLE identity: dark navy elongated symmetrical integrated shell, bright cyan/turquoise diamond core, one thin elliptical orbital ring passing around the core. Simplify small fins and fragmented shards, remove floating debris. Enlarge core and ring so the icon reads clearly at 32px. Main silhouette occupies central 75% width and 80% height, all crucial details inside central safe circle. Rich near-black navy background, subtle cyan glow behind core, clean crisp 2D graphic novel cel shading, restrained metallic edges. White-cyan center, turquoise body accents; no purple or orange. No text, letters, monogram, people, city buildings, framing border, rounded outer tile corners, app-store mockup, watermark. Icon should feel like the exact approved administrative AI, not a robot head or eye.

## 확인 범위

180px 내보내기에서 코어·링·외곽선과 배경을 시각 확인했다. 타입 검사·프로덕션 빌드 및 각 PNG 크기·ICO 구조·매니페스트 파일 경로를 점검한다. 실제 iOS·Android 홈 화면 설치와 공유 서비스 캐시 갱신은 검증 대상 기기가 없어 확인하지 않았다. 게임 엔진·스토리·저장은 수정하지 않았다.
