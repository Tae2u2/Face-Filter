# Face Filter App

실시간 얼굴 인식 기반 AR 필터 웹 애플리케이션입니다. MediaPipe Face Mesh와 Three.js를 활용하여 다양한 필터와 이펙트를 제공합니다.

## 주요 기능

### AR 필터
- **3D 모델 필터**: 토끼, 라쿤 (Three.js GLB 모델)
- **이미지 필터**: 고양이, 강아지, 리본, 선글라스
- **파티클 효과**: 반짝이, 하트 애니메이션

### 컬러 필터
- 흑백 (Grayscale)
- 세피아 (Sepia)
- 따뜻한 톤 (Warm)
- 차가운 톤 (Cool)
- 빈티지 (Vintage)

### 기타 기능
- 실시간 얼굴 랜드마크 감지 (468개 포인트)
- 디버그 모드 (랜드마크 시각화)
- 셀카 모드 미러링
- 반응형 디자인

## 기술 스택

- **Vanilla JavaScript** (ES6 Modules)
- **MediaPipe Face Mesh** - 얼굴 인식 및 랜드마크 감지
- **Three.js** - 3D 모델 렌더링
- **Canvas API** - 2D 렌더링 및 이미지 합성
- **Live Server** - 개발 서버

## 프로젝트 구조

```
face-filter/
├── index.html              # 메인 HTML
├── style.css               # 스타일시트
├── app.js                  # 메인 애플리케이션
├── package.json           # NPM 설정
├── REFACTORING.md         # 리팩토링 가이드
├── README.md              # 프로젝트 문서
└── js/
    ├── config/            # 설정 파일
    │   ├── filterConfig.js       # 필터 설정
    │   └── colorFilterConfig.js  # 컬러 필터 설정
    ├── core/              # 핵심 로직
    │   ├── FaceDetector.js       # 얼굴 감지
    │   └── FilterManager.js      # 필터 상태 관리
    ├── renderers/         # 렌더러
    │   ├── BaseRenderer.js       # 렌더러 기본 클래스
    │   ├── ImageRenderer.js      # 이미지 필터 렌더러
    │   ├── ParticleRenderer.js   # 파티클 렌더러
    │   ├── ModelRenderer.js      # 3D 모델 렌더러
    │   └── FilterRenderer.js     # 통합 렌더러
    ├── ui/                # UI 컨트롤
    │   └── UIController.js       # UI 상태 관리
    └── utils/             # 유틸리티
        └── imageLoader.js        # 이미지 로딩
```

## 시작하기

### 필수 요구사항
- Node.js (v14 이상)
- 웹캠이 연결된 브라우저
- 최신 웹 브라우저 (Chrome, Edge, Safari 권장)

### 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/Tae2u2/Face-Filter.git
cd Face-Filter
```

2. **의존성 설치**
```bash
npm install
```

3. **개발 서버 실행**
```bash
npm run dev
```

브라우저가 자동으로 열리고 `http://localhost:8080`에서 앱이 실행됩니다.

### 카메라 권한
- 최초 실행 시 웹캠 접근 권한을 허용해주세요.
- HTTPS 또는 localhost에서만 정상 작동합니다.

## 사용 방법

1. **필터 적용**: 화면 하단의 이모지 버튼을 클릭하여 필터 적용
2. **컬러 필터**: 상단의 컬러 필터 버튼으로 색감 조정
3. **필터 제거**: "필터 제거" 버튼 클릭
4. **디버그 모드**: 🔍 버튼으로 랜드마크 정보 확인

## 아키텍처

### 디자인 패턴
- **Facade Pattern**: `FilterRenderer`가 여러 렌더러를 통합
- **Strategy Pattern**: 각 렌더러가 다른 전략으로 렌더링
- **Module Pattern**: ES6 모듈을 통한 의존성 관리

### 핵심 클래스

#### FaceDetector
MediaPipe 얼굴 감지 및 카메라 관리
```javascript
const detector = new FaceDetector(onResultsCallback);
await detector.initializeFaceMesh();
await detector.startCamera(videoElement, 640, 480);
```

#### FilterManager
필터 상태 관리
```javascript
const manager = new FilterManager();
manager.setFilter('rabbit');
manager.clearFilter();
```

#### FilterRenderer
통합 렌더러 (이미지, 파티클, 3D 모델)
```javascript
const renderer = new FilterRenderer(imageLoader);
await renderer.applyFilter(ctx, landmarks, config);
```

## 새로운 필터 추가

### 1. 이미지 필터 추가

`js/config/filterConfig.js` 파일 수정:

```javascript
export const filterConfigs = {
  // 기존 필터들...
  crown: {
    image: "./images/crown.png",
    scale: 0.3,
    offsetY: -120,
    landmarks: [10],  // 이마 중앙
  }
};

export const filterButtons = [
  // 기존 버튼들...
  { id: "crown", emoji: "👑", name: "왕관" },
];
```

### 2. 파티클 효과 추가

```javascript
export const filterConfigs = {
  stars: {
    type: "particles",
    landmarks: [10, 338, 297],  // 파티클이 나타날 위치
    color: "gold",
    animation: "twinkle",
  }
};
```

### 3. 3D 모델 추가

```javascript
export const filterConfigs = {
  glasses: {
    type: "model",
    model: "./images/glasses.glb",
    scale: 0.08,
    offsetY: 0,
    landmarks: [168],  // 코 브릿지
    followHeadPose: true,
  }
};
```

## MediaPipe 랜드마크

주요 얼굴 랜드마크 인덱스:
- `10`: 이마 중앙
- `168`: 코 브릿지
- `234`, `454`: 양쪽 관자놀이
- `33`, `263`: 양쪽 눈 중심
- `61`, `291`: 입 양쪽 끝

전체 468개 랜드마크 정보는 [MediaPipe 공식 문서](https://google.github.io/mediapipe/solutions/face_mesh.html)를 참고하세요.

## 성능 최적화

- 이미지 사전 로딩으로 렌더링 지연 최소화
- Canvas 크기를 비디오 해상도에 맞춰 최적화
- 필터 미적용 시 렌더링 스킵
- 디버그 모드 토글로 성능 조절

## 브라우저 지원

| 브라우저 | 버전 | 지원 여부 |
|---------|------|----------|
| Chrome  | 90+  | ✅ 완전 지원 |
| Edge    | 90+  | ✅ 완전 지원 |
| Safari  | 14+  | ✅ 완전 지원 |
| Firefox | 88+  | ⚠️ 부분 지원 |

## 문제 해결

### 카메라가 작동하지 않을 때
- 브라우저 카메라 권한 설정 확인
- HTTPS 또는 localhost에서 실행 중인지 확인
- 다른 애플리케이션이 카메라를 사용 중인지 확인

### 필터가 적용되지 않을 때
- 얼굴이 화면 중앙에 잘 보이는지 확인
- 조명이 충분한지 확인
- 브라우저 콘솔에서 에러 메시지 확인

### 성능 문제
- 디버그 모드를 끄세요
- 브라우저 하드웨어 가속 활성화
- 다른 탭을 닫아 메모리 확보

## 향후 계획

- [ ] TypeScript 마이그레이션
- [ ] Web Worker를 이용한 성능 최적화
- [ ] 필터 커스터마이징 기능
- [ ] 사진 촬영 및 저장 기능
- [ ] 비디오 녹화 기능
- [ ] 다중 얼굴 지원
- [ ] PWA 지원

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

자세한 내용은 [REFACTORING.md](./REFACTORING.md)를 참고하세요.

## 라이선스

이 프로젝트는 ISC 라이선스를 따릅니다.

## 참고 자료

- [MediaPipe Face Mesh](https://google.github.io/mediapipe/solutions/face_mesh.html)
- [Three.js Documentation](https://threejs.org/docs/)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Web APIs for Camera Access](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

## 연락처

프로젝트 링크: [https://github.com/Tae2u2/Face-Filter](https://github.com/Tae2u2/Face-Filter)

---

**Made with ❤️ using Vanilla JavaScript**
