# Face Filter App - Refactoring Guide

## 📋 개요

이 문서는 Face Filter App의 리팩토링 내용과 새로운 구조에 대해 설명합니다.

## 🎯 리팩토링 목표

1. **모듈화**: 기능별로 파일을 분리하여 유지보수성 향상
2. **확장성**: 새로운 필터 추가 및 기능 확장이 용이한 구조
3. **재사용성**: 클래스 기반 구조로 코드 재사용성 증대
4. **가독성**: 명확한 책임 분리와 네이밍으로 코드 이해도 향상

## 📁 새로운 파일 구조

```
face-filter/
├── index.html                  # 메인 HTML
├── style.css                   # 스타일시트
├── app.js                      # 메인 애플리케이션 (리팩토링됨)
├── REFACTORING.md             # 이 문서
└── js/
    ├── config/
    │   └── filterConfig.js     # 필터 설정 및 상수
    ├── core/
    │   ├── FaceDetector.js     # 얼굴 감지 및 MediaPipe 관리
    │   └── FilterManager.js    # 필터 상태 관리
    ├── renderers/
    │   ├── BaseRenderer.js     # 렌더러 기본 클래스
    │   ├── ImageRenderer.js    # 이미지 필터 렌더러
    │   ├── ParticleRenderer.js # 파티클 효과 렌더러
    │   └── FilterRenderer.js   # 렌더러 통합 클래스
    ├── ui/
    │   └── UIController.js     # UI 제어 (버튼, 로딩, 에러 등)
    └── utils/
        └── imageLoader.js      # 이미지 로딩 유틸리티
```

## 🔧 모듈 설명

### 1. **Config Layer** (`js/config/`)

#### `filterConfig.js`
- 필터 설정 데이터 관리
- 필터 버튼 정보 정의
- 새로운 필터 추가 시 이 파일만 수정

```javascript
export const filterConfigs = {
  newFilter: {
    image: "./images/new.png",
    scale: 0.5,
    offsetY: -100,
    landmarks: [10],
  }
};
```

### 2. **Core Layer** (`js/core/`)

#### `FaceDetector.js`
- MediaPipe FaceMesh 초기화 및 관리
- 카메라 제어 (시작/중지)
- 얼굴 감지 결과 처리

**주요 메서드:**
- `initializeFaceMesh()`: MediaPipe 초기화
- `startCamera(videoElement, width, height)`: 카메라 시작
- `stopCamera()`: 카메라 중지

#### `FilterManager.js`
- 현재 활성화된 필터 상태 관리
- 필터 변경 및 제거 로직

**주요 메서드:**
- `setFilter(filterId)`: 필터 설정
- `getCurrentFilter()`: 현재 필터 가져오기
- `clearFilter()`: 필터 제거

### 3. **Renderers Layer** (`js/renderers/`)

#### `BaseRenderer.js`
- 모든 렌더러의 기본 클래스
- 공통 유틸리티 메서드 제공 (디버그 포인트 등)

#### `ImageRenderer.js`
- 이미지 기반 필터 렌더링 (토끼, 고양이, 강아지)
- 얼굴 크기 기반 위치 계산

#### `ParticleRenderer.js`
- 파티클 효과 렌더링 (반짝이, 하트)
- 애니메이션 로직 포함

#### `FilterRenderer.js`
- 모든 렌더러를 통합하는 파사드 클래스
- 필터 타입에 따라 적절한 렌더러 선택

### 4. **UI Layer** (`js/ui/`)

#### `UIController.js`
- UI 요소 제어 (버튼, 로딩, 에러 메시지)
- 버튼 상태 관리

**주요 메서드:**
- `createFilterButtons(onFilterChange)`: 필터 버튼 생성
- `updateButtonState(activeButton)`: 버튼 활성화 상태 업데이트
- `showLoading()` / `hideLoading()`: 로딩 화면 제어
- `showError(message)`: 에러 메시지 표시

### 5. **Utils Layer** (`js/utils/`)

#### `imageLoader.js`
- 이미지 미리 로딩 관리
- 로드된 이미지 캐싱

**주요 메서드:**
- `preloadImages(filterConfigs)`: 필터 이미지 일괄 로드
- `loadImage(imagePath)`: 단일 이미지 로드
- `getImage(imagePath)`: 로드된 이미지 가져오기

## 🚀 새로운 필터 추가 방법

### 1. 이미지 필터 추가

```javascript
// js/config/filterConfig.js

// 1. filterConfigs에 새 필터 추가
export const filterConfigs = {
  // ... 기존 필터들
  unicorn: {
    image: "./images/unicorn.png",
    scale: 0.5,
    offsetY: -120,
    landmarks: [10],
  }
};

// 2. filterButtons에 버튼 정보 추가
export const filterButtons = [
  // ... 기존 버튼들
  { id: "unicorn", emoji: "🦄", name: "유니콘" },
];
```

### 2. 새로운 파티클 효과 추가

```javascript
// js/config/filterConfig.js
export const filterConfigs = {
  stars: {
    type: "particles",
    landmarks: [10, 338, 297, 332, 284, 251, 389, 356, 454],
    color: "gold",  // 새로운 색상
    animation: "twinkle",
  }
};

// js/renderers/ParticleRenderer.js
// render() 메서드에 새로운 색상 로직 추가
if (config.color === "gold") {
  this.drawStar(ctx, x, y, time, i);
}
```

### 3. 완전히 새로운 렌더러 추가

```javascript
// js/renderers/CustomRenderer.js
import { BaseRenderer } from "./BaseRenderer.js";

export class CustomRenderer extends BaseRenderer {
  render(ctx, landmarks, config) {
    // 커스텀 렌더링 로직
  }
}

// js/renderers/FilterRenderer.js에서 사용
import { CustomRenderer } from "./CustomRenderer.js";

constructor(imageLoader) {
  this.imageRenderer = new ImageRenderer(imageLoader);
  this.particleRenderer = new ParticleRenderer(imageLoader);
  this.customRenderer = new CustomRenderer(imageLoader);  // 추가
}

applyFilter(ctx, landmarks, config) {
  if (config.type === "custom") {
    this.customRenderer.render(ctx, landmarks, config);
  }
  // ...
}
```

## 🔄 마이그레이션 가이드

### Before (기존 구조)
```javascript
// 모든 코드가 app.js 하나에 존재
let currentFilter = null;
const filterConfigs = { ... };

function drawImage(ctx, landmarks, config) { ... }
function drawParticles(ctx, landmarks, config) { ... }
// ...
```

### After (리팩토링 후)
```javascript
// app.js
import { filterConfigs } from "./js/config/filterConfig.js";
import { FilterManager } from "./js/core/FilterManager.js";
import { FaceDetector } from "./js/core/FaceDetector.js";
// ...

const filterManager = new FilterManager();
const faceDetector = new FaceDetector(onResults);
```

## ✅ 리팩토링 체크리스트

- [x] 설정 파일 분리 (`filterConfig.js`)
- [x] 이미지 로더 유틸리티 클래스화 (`ImageLoader`)
- [x] 필터 관리 클래스화 (`FilterManager`)
- [x] UI 컨트롤러 클래스화 (`UIController`)
- [x] 렌더러 클래스 분리 (Base, Image, Particle)
- [x] 얼굴 감지 클래스화 (`FaceDetector`)
- [x] 렌더러 통합 클래스 (`FilterRenderer`)
- [ ] 메인 app.js 리팩토링
- [ ] index.html 모듈 임포트 설정

## 🎨 디자인 패턴

### 1. **Facade Pattern**
- `FilterRenderer`: 여러 렌더러를 하나의 인터페이스로 통합

### 2. **Strategy Pattern**
- 각 렌더러가 다른 전략으로 필터 렌더링 수행

### 3. **Singleton-like Pattern**
- `FilterManager`, `FaceDetector`는 앱에서 단일 인스턴스로 사용

### 4. **Module Pattern**
- ES6 모듈을 사용한 의존성 관리

## 📝 코딩 컨벤션

1. **클래스명**: PascalCase (예: `FilterManager`, `ImageRenderer`)
2. **파일명**: PascalCase for classes (예: `FilterManager.js`)
3. **변수/메서드명**: camelCase (예: `currentFilter`, `applyFilter()`)
4. **상수**: camelCase (예: `filterConfigs`)
5. **주석**: JSDoc 스타일 사용

```javascript
/**
 * 필터 설정
 * @param {string} filterId - 필터 ID
 */
setFilter(filterId) {
  this.currentFilter = filterId;
}
```

## 🔍 테스트 가이드

### 단위 테스트 대상
1. `FilterManager` - 필터 상태 관리
2. `ImageLoader` - 이미지 로딩
3. 각 Renderer - 렌더링 로직

### 통합 테스트 대상
1. `FaceDetector` + `FilterRenderer` - 얼굴 감지 및 필터 적용
2. `UIController` - UI 상태 변경

## 🚧 향후 개선 사항

### 1. TypeScript 마이그레이션
- 타입 안정성 확보
- IDE 자동완성 개선

### 2. 성능 최적화
- Web Worker를 이용한 얼굴 감지 오프로딩
- OffscreenCanvas 활용

### 3. 필터 플러그인 시스템
```javascript
// 플러그인 등록 시스템
FilterRegistry.register('custom-filter', CustomFilterPlugin);
```

### 4. 상태 관리 라이브러리 도입
- Redux 또는 Zustand를 이용한 전역 상태 관리

### 5. 빌드 시스템 도입
- Webpack 또는 Vite를 이용한 번들링
- 코드 분할 및 최적화

## 📚 참고 자료

- [MediaPipe Face Mesh](https://google.github.io/mediapipe/solutions/face_mesh.html)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

## 👥 기여 가이드

1. 새로운 필터 추가 시 `filterConfig.js`만 수정
2. 렌더링 로직 변경 시 해당 Renderer만 수정
3. UI 변경 시 `UIController.js`만 수정
4. 코드 스타일은 기존 코드와 일관성 유지

---

**Last Updated**: 2025-10-04
**Version**: 2.0.0
