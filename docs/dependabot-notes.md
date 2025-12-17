## Dependabot 관리 메모

이 문서는 HandSpeak Translator 프로젝트에서 Dependabot이 관리하는 의존성 업그레이드를 정리한 것입니다.

### 현재 DevDependencies 주요 버전

- `@eslint/js`: ^9.39.2
- `@typescript-eslint/eslint-plugin`: ^8.50.0
- `@typescript-eslint/parser`: ^8.50.0
- `eslint-plugin-react-refresh`: ^0.4.25
- `vite`: ^7.3.0

### 최근 Dependabot PR 정리

- [#12 chore(deps-dev): bump eslint-plugin-react-refresh from 0.4.24 to 0.4.25](https://github.com/tnwlsdldkdlel/handspeak-translator-/pull/12)
- #13 chore(deps-dev): bump vite from 7.2.7 to 7.3.0
- #14 chore(deps-dev): bump @typescript-eslint/eslint-plugin from 8.49.0 to 8.50.0
- #15 chore(deps-dev): bump @eslint/js from 9.39.1 to 9.39.2
- [#16 chore(deps-dev): bump @typescript-eslint/parser from 8.49.0 to 8.50.0](https://github.com/tnwlsdldkdlel/handspeak-translator-/pull/16)

위 PR들은 모두 머지되었으며, 현재 `main` 브랜치의 `package.json` / `package-lock.json`과 동기화되어 있습니다.

### 운영 원칙

- Dependabot PR은 **CI(lint, build)**가 녹색일 때만 머지합니다.
- TS/ESLint/Vite처럼 서로 얽힌 devDependencies는 **세트로 올리는 것**을 우선합니다.
- 브레이킹 체인지 가능성이 있는 메이저 업그레이드는 PRD/코드 영향도를 검토한 뒤 진행합니다.

