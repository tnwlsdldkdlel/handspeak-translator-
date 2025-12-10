# Dependabot 이슈/정리 메모

## 최근 관찰한 문제들
- **라벨 미존재 오류**: dependabot.yml에 없는 라벨(`dependencies`, `automated`)을 지정해 PR 경고가 발생. 해결: 라벨 항목 삭제.
- **ESLint 9 + TS-ESLint 6 충돌**: eslint만 9.x로 올리고 `@typescript-eslint/*`가 6.x일 때 `npm ci`가 `ERESOLVE`로 실패.
- **Parser만 단독 업그레이드 충돌**: parser를 8.x로 올리고 plugin이 6.x일 때도 동일하게 peer conflict가 발생.

## PR 별 상황
- **PR #10 (eslint 9.39.1)**  
  - 문제: eslint 9.x ↔ ts-eslint 6.x peer 불일치로 CI `npm ci` 실패.  
  - 조치: `@typescript-eslint/eslint-plugin`/`parser` 8.49.0, TypeScript 5.6.3로 상향, flat `eslint.config.js`로 마이그레이션. `npm run lint`, `npm run build` 통과 후 푸시.

- **PR #11 (@typescript-eslint/parser 8.49.0)**  
  - 문제: parser 8.x vs plugin 6.x peer 충돌로 `npm ci` 실패.  
  - 해법: plugin도 8.x로 올리거나, #10 머지 후 리베이스/클로즈.

## 재발 방지/운영 팁
- eslint 메이저 업/다운 시 TS-ESLint 버전(특히 plugin, parser)을 함께 맞춘다.  
- CI 기준 명령이 `npm ci`이므로 package-lock을 항상 최신 package.json과 일치시킨다.  
- 필요 없는 라벨은 dependabot.yml에서 제거하거나, 사용할 라벨을 먼저 생성한다.

## 현재 상태 요약
- main에는 lock 재생성 및 라벨 정리 반영 완료.  
- PR #10: TS-ESLint 8.49 + ESLint 9 구성이 적용되어 CI 통과 예상.  
- PR #11: plugin 버전 미상향으로 CI 실패 중. 조치 필요.*** End Patch

