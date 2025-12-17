# 프로젝트 작업 계획 (PRD 기반)

## 🎯 목표
- KSL 숫자 1~5 실시간 인식 및 텍스트 변환 데모 완성
- 성능: 추론 지연 ≤ 30ms, 안정화 500~800ms, FPS ≥ 20
- 품질: 인식 정확도 ≥ 90%, CI 파이프라인 상시 녹색(`npm ci`, lint, build)

## 🎯 작업 단계별 계획

### Phase 1: 환경·CI 안정화 (Foundation)
**목표**: 의존성 정합성과 CI 안정화 확보
- [x] PR #10 CI 녹색 확인 후 머지 (ESLint 9 + TS-ESLint 8.49 + flat config)
- [x] PR #11 처리: TS-ESLint plugin 8.49.0로 상향 후 CI 재실행 또는 PR 종료/리베이스
  - [x] `main` 기준 `npm ci && npm run lint && npm run build` 재검증
  - [x] dependabot.yml 라벨/스케줄 점검 (불필요 라벨 없음 확인)

### Phase 2: 모델/파이프라인 통합 (Core)
**목표**: MediaPipe 손 랜드마크 + TF.js 추론 파이프라인 완성
- [x] MediaPipe Hands 연동, 랜드마크 정규화(0~1), 스케일 검증
  - [x] 비디오 캡처 루프 rAF 최적화, 해상도/프레임 옵션 노출
- [x] TF.js MLP 모델 로드 및 추론 지연 측정(목표 ≤ 30ms)

### Phase 3: 안정화 로직 (Stabilization)
**목표**: 신뢰도 기반 확정 로직으로 오인식 최소화
- [x] 신뢰도 임계값 + 500~800ms 연속 검증 적용
  - [x] FPS/지연 로그 수집(콘솔 또는 DevTools Performance)

### Phase 4: 기능 완성 (Feature)
**목표**: PRD 기능 요구 충족
- [x] KSL 1~5 → “일 이 삼 사 오” 매핑 적용
  - [x] Undo / Reset / Copy 유스케이스 테스트(시나리오 4.1 재현)
  - [x] 결과 패널 텍스트 스크롤 + 버튼 고정(Fixed Footer)
  - [x] 랜드마크 오버레이 토글 및 상태 표시

### Phase 5: 품질 검증 및 문서 (QA/Docs)
**목표**: 성능·정확도 확인 및 배포 준비
- [ ] FPS ≥ 20, 추론 지연 ≤ 30ms, 안정화 500~800ms 충족 여부 점검
  - [ ] KSL 1~5 정확도 ≥ 90% 샘플 검증
- [ ] README 사용 가이드 및 제한 사항 정리
  - [ ] `docs/dependabot-notes.md`, 본 문서 최신화

## ⚠️ 위험 및 대응
- 데이터/정확도 부족 → 랜드마크 증강, 임계값/윈도 튜닝
- 성능 저하(저사양) → 모델 경량화, rAF 제어, 해상도/프레임 하향 옵션
- CI 불안정 → peer dependency 세트 업그레이드 + lock 동기화 유지

## 📦 산출물
- 동작 데모(웹): KSL 1~5 실시간 인식/텍스트 변환
- 문서: README 사용 가이드, `docs/dependabot-notes.md`, `docs/project-plan.md`

