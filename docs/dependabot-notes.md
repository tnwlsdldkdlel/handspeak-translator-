!# Dependabot 이슈/정리 메모

## Dependabot을 쓰는 이유
- 주기적 취약점/버전 업데이트 자동화 → 사람 손을 덜 쓰고 보안 리스크 감소.
- PR 단위로 변경 이력을 남겨 검토/롤백이 용이.
- npm lockfile까지 자동 생성해 재현성 유지.

## 어떻게 동작하나 (이 저장소 기준)
- 설정 파일: `.github/dependabot.yml`
  - weekly 스케줄로 루트 디렉터리 npm 의존성 점검.
  - PR 라벨은 제거(미존재 라벨 오류 방지).
- 워크플로: PR이 열리면 CI(`npm ci`, lint, build, audit)를 실행.
- 기본 전략: 한 의존성씩 PR 생성 → 충돌 시 rebase/recreate 지시 가능.

## 최근 관찰한 문제들
- **라벨 미존재 오류**: dependabot.yml에 없는 라벨(`dependencies`, `automated`)로 경고. 해결: 라벨 항목 삭제.
- **ESLint 9 + TS-ESLint 6 충돌**: eslint만 9.x로 올리고 `@typescript-eslint/*`가 6.x이면 `npm ci`가 `ERESOLVE`.
- **Parser만 단독 업그레이드 충돌**: parser 8.x, plugin 6.x도 동일하게 peer conflict.

## PR 별 상황 기록
- **PR #10 (eslint 9.39.1)**  
  - 문제: eslint 9.x ↔ ts-eslint 6.x peer 불일치로 CI 실패.  
  - 조치: `@typescript-eslint/eslint-plugin`/`parser` 8.49.0, TypeScript 5.6.3로 상향, flat `eslint.config.js` 도입. `npm run lint`, `npm run build` 통과 후 푸시.

- **PR #11 (@typescript-eslint/parser 8.49.0)**  
  - 문제: parser 8.x vs plugin 6.x 충돌로 `npm ci` 실패.  
  - 해법: plugin도 8.x로 올리거나, #10 머지 후 리베이스/클로즈.

## 재발 방지/운영 팁
- ESLint 메이저 업/다운 시 TS-ESLint(plugin, parser) 메이저를 함께 맞춘다.
- CI는 `npm ci`이므로 package-lock을 항상 package.json과 동기화.
- 라벨은 실제 존재하는 것만 dependabot.yml에 명시하거나, 불필요하면 제거.
- peer conflict가 보이면 의존성 세트를 묶어서 올리고 한 번에 `npm ci`, `npm run lint`, `npm run build`로 검증.

## 현재 상태 요약
- main: lock 재생성 및 라벨 정리 반영 완료.
- PR #10: TS-ESLint 8.49 + ESLint 9 구성이 적용되어 CI 통과 예상.
- PR #11: plugin 버전 미상향으로 CI 실패 중 → plugin 8.x로 올리거나 #10 머지 후 정리 필요.

