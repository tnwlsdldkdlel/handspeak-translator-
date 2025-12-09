# HandSpeak Translator

한국 수어(KSL) 실시간 인식 및 텍스트 변환 웹 애플리케이션

## 프로젝트 개요

웹캠을 통해 특정 한국 수어(KSL) 제스처(숫자 1~5)를 인식하고, 이를 실시간으로 한국어 텍스트로 변환하는 데모 웹 애플리케이션입니다.

## 기술 스택

- **Frontend**: React + TypeScript + Vite
- **ML Inference**: TensorFlow.js
- **Pre-processing**: MediaPipe Hand Landmarks
- **Model**: Custom MLP Model (KSL 숫자 1~5 분류)

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

### 미리보기

```bash
npm run preview
```

## 프로젝트 구조

```
src/
├── components/     # React 컴포넌트
├── hooks/          # Custom React Hooks
├── utils/          # 유틸리티 함수 및 상수
├── types/          # TypeScript 타입 정의
├── models/         # TensorFlow.js 모델 파일
├── App.tsx         # 메인 앱 컴포넌트
├── main.tsx        # 진입점
└── index.css       # 전역 스타일
```

## 주요 기능

- 실시간 웹캠 제스처 인식
- 한국 수어 숫자 1~5 인식
- 안정화 로직을 통한 오인식 방지
- Undo, Reset, Copy 기능

## 성능 목표

- **FPS**: ≥ 20 FPS
- **추론 지연**: ≤ 30ms
- **인식 정확도**: ≥ 90%

## 참고 문서

자세한 내용은 [PRD 문서](./docs/prd.md)를 참고하세요.

