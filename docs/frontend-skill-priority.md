## HandSpeak Translator 프론트엔드 개발자 필수 기술 (우선순위 정리)

이 문서는 HandSpeak Translator 프로젝트에서 **프론트엔드 개발자로 일할 때 꼭 알고 있어야 하는 기술들**을 우선순위에 따라 정리한 것입니다.  
먼저 1순위를 확실히 다지고, 이후 2·3순위를 확장해 나가는 것을 추천합니다.

---

### 1순위 (최우선 – 바로 써먹는 것들)

- **TypeScript 기본기**
  - `type`, `interface`, 제네릭 기본 문법
  - 유니온/인터섹션 타입(`|`, `&`) 이해
  - `strict` 모드에서 타입 에러 읽고 고치기
  - `any`/`unknown` 최소화, 명시적 타입 작성 습관

- **React + Hooks**
  - 함수형 컴포넌트 기본 패턴
  - 상태/사이드 이펙트 훅: `useState`, `useEffect`
  - 메모이제이션 훅: `useMemo`, `useCallback`
  - DOM/외부 라이브러리 연동: `useRef`
  - 부모 → 자식 props 흐름, 상태 끌어올리기(lifting state)

- **Vite + npm 스크립트**
  - `npm run dev`, `npm run build`, `npm run preview`, `npm run lint` 의미와 사용법
  - `import.meta.env.BASE_URL` 개념과 정적 파일(`/public`) 서빙 방식
  - 개발/빌드 환경에서 경로가 어떻게 달라지는지 이해

- **ESLint / @typescript-eslint**
  - 린트 에러 메세지 읽고, 규칙에 맞게 고치는 방법
  - `eslint.config.js` 혹은 설정 파일 구조 이해
  - 주요 플러그인 역할:
    - `eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`
    - `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`

- **Git & GitHub 워크플로우**
  - 브랜치 전략: `main`, `feat/*`, `fix/*`, `refactor/*`
  - 커밋 메시지 규칙 (이 프로젝트의 `CONTRIBUTING.md` 참고)
  - Pull Request 생성 → 리뷰 → 머지 기본 흐름

---

### 2순위 (프로젝트 특화 – 잘 알수록 디버깅이 쉬움)

- **TensorFlow.js 기초**
  - `tf.loadLayersModel`로 `.json + .bin` 모델 로드
  - `tf.tensor`, `tensor.shape`, `tensor.dispose()` 사용법
  - MLP(다층 퍼셉트론) / Sequential 모델 구조와 softmax 분류 이해
  - 브라우저 환경에서의 추론 성능(지연 시간, FPS)에 영향을 주는 요소

- **MediaPipe Hands 파이프라인**
  - `@mediapipe/hands`, `@mediapipe/camera_utils`가 웹캠 프레임을 어떻게 처리하는지
  - 21개 손 랜드마크 좌표(`x`, `y`, `z`) 구조와 정규화 개념
  - FPS(프레임 레이트), `processEvery` 옵션 등 성능 관련 설정

- **실시간 UI 성능 최적화**
  - 불필요한 리렌더 줄이기
    - 상태 최소화, 상위 컴포넌트에 너무 많은 상태 두지 않기
    - 메모이제이션 훅(`useMemo`, `useCallback`) 적절히 사용
  - 비디오/캔버스 영역과 텍스트/컨트롤 영역의 책임 분리
  - 추론 결과가 변할 때만 UI 업데이트하도록 조건부 렌더링 설계

---

### 3순위 (있으면 좋은 것들 – 중장기적으로 유용)

- **머신러닝 파이프라인 이해 (개념 레벨)**
  - Keras → TensorFlow.js 변환 흐름(tfjs-converter)
  - `model.json` + `group*-shard*.bin` 구조와 `weightsManifest` 의미
  - 입력 특성(shape 63 = 21 포인트 × x/y/z)과 출력 클래스(숫자 1~5) 매핑

- **테스트 및 품질 관리**
  - 핵심 로직(전처리, 안정화 로직 등)에 대한 단위 테스트 아이디어
  - Lighthouse를 활용한 성능/접근성/SEO 기본 점검
  - 크로스 브라우저/디바이스 테스트 체크리스트

- **배포/운영 관점**
  - 정적 호스팅 환경(예: GitHub Pages, Vercel)에서 Vite 앱 동작 방식
  - 번들 사이즈 경고와 코드 스플리팅 개념
  - 에러 로깅/모니터링 도입 시 고려할 포인트(Sentry 등)

---

### 학습 순서 추천

1. **1순위**를 빠르게 한 바퀴 훑고, 바로 코드에 적용해 보기  
2. 추론/손 인식 과정에서 문제가 생길 때 **2순위(TF.js, MediaPipe)**를 깊게 파기  
3. 여유가 생기면 **3순위**를 공부하며 성능/운영/ML 파이프라인까지 시야 확장

이 문서는 프로젝트 진행 중에 계속 업데이트해도 됩니다.  
“지금 나에게 가장 필요한 기술이 무엇인지”를 판단하는 기준으로 활용하세요.


