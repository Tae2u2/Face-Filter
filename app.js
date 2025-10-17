// 모듈 임포트
import { filterConfigs, filterButtons } from "./js/config/filterConfig.js";
import { colorFilters } from "./js/config/colorFilterConfig.js";
import { ImageLoader } from "./js/utils/imageLoader.js";
import { FilterManager } from "./js/core/FilterManager.js";
import { FaceDetector } from "./js/core/FaceDetector.js";
import { FilterRenderer } from "./js/renderers/FilterRenderer.js";
import { UIController } from "./js/ui/UIController.js";

// 앱 클래스
class FaceFilterApp {
  constructor() {
    // 인스턴스 생성
    this.imageLoader = new ImageLoader();
    this.filterManager = new FilterManager();
    this.filterRenderer = new FilterRenderer(this.imageLoader);
    this.uiController = new UIController(filterButtons);
    this.faceDetector = new FaceDetector(this.onResults.bind(this));

    // DOM 요소
    this.canvas = null;
    this.video = null;
    this.ctx = null;
    this.currentColorFilter = null;
    this.debugMode = false;
    this.debugLandmarks = [10, 234, 454, 33, 263, 168]; // 주요 랜드마크
  }

  /**
   * MediaPipe 얼굴 감지 결과 콜백
   * @param {Object} results - 얼굴 감지 결과
   */
  async onResults(results) {
    if (!this.ctx || !this.canvas) return;

    // 비디오 실제 크기에 맞춰 캔버스 크기 설정
    const videoWidth = this.video.videoWidth || 640;
    const videoHeight = this.video.videoHeight || 480;

    this.canvas.width = videoWidth;
    this.canvas.height = videoHeight;

    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 셀카 모드 미러링 (좌우 반전)
    this.ctx.translate(this.canvas.width, 0);
    this.ctx.scale(-1, 1);

    // 얼굴이 감지되면
    if (
      results.multiFaceLandmarks &&
      results.multiFaceLandmarks.length > 0
    ) {
      const landmarks = results.multiFaceLandmarks[0];

      // 랜드마크 품질 확인
      if (landmarks && landmarks.length >= 468) {
        // 디버그 모드일 때 랜드마크 정보 표시
        if (this.debugMode) {
          this.drawDebugLandmarks(landmarks);
          this.updateDebugInfo(landmarks);
        }

        // 필터가 설정되어 있으면 적용
        if (this.filterManager.hasActiveFilter()) {
          const currentFilter = this.filterManager.getCurrentFilter();
          const config = filterConfigs[currentFilter];
          await this.filterRenderer.applyFilter(this.ctx, landmarks, config);
        }
      } else {
        console.warn("불완전한 랜드마크 데이터");
      }
    }

    this.ctx.restore();
  }

  /**
   * 디버그 랜드마크 그리기
   * @param {Array} landmarks - 얼굴 랜드마크
   */
  drawDebugLandmarks(landmarks) {
    this.debugLandmarks.forEach((index) => {
      const point = landmarks[index];
      const x = point.x * this.canvas.width;
      const y = point.y * this.canvas.height;

      // 점 그리기
      this.ctx.fillStyle = "#ff0000";
      this.ctx.beginPath();
      this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
      this.ctx.fill();

      // 인덱스 표시
      this.ctx.fillStyle = "#ffff00";
      this.ctx.font = "12px Arial";
      this.ctx.fillText(`${index}`, x + 8, y - 8);
    });
  }

  /**
   * 디버그 정보 업데이트
   * @param {Array} landmarks - 얼굴 랜드마크
   */
  updateDebugInfo(landmarks) {
    const debugContent = document.getElementById("debug-content");
    if (!debugContent) return;

    const info = [];
    info.push(`Canvas: ${this.canvas.width}x${this.canvas.height}`);
    info.push(`Video: ${this.video.videoWidth}x${this.video.videoHeight}`);
    info.push(`Display: ${this.video.clientWidth}x${this.video.clientHeight}`);
    info.push(`\n주요 랜드마크 (정규화):`);

    this.debugLandmarks.forEach((index) => {
      const point = landmarks[index];
      info.push(`[${index}] x:${point.x.toFixed(3)}, y:${point.y.toFixed(3)}`);
    });

    info.push(`\n주요 랜드마크 (픽셀):`);
    this.debugLandmarks.forEach((index) => {
      const point = landmarks[index];
      const x = (point.x * this.canvas.width).toFixed(2);
      const y = (point.y * this.canvas.height).toFixed(2);
      info.push(`[${index}] x:${x}, y:${y}`);
    });

    // 얼굴 크기 정보
    const faceWidth = Math.abs(landmarks[234].x - landmarks[454].x);
    const eyeWidth = Math.abs(landmarks[33].x - landmarks[263].x);
    info.push(`\n얼굴 너비: ${(faceWidth * this.canvas.width).toFixed(2)}px`);
    info.push(`눈 간격: ${(eyeWidth * this.canvas.width).toFixed(2)}px`);

    debugContent.innerHTML = info.join("<br>");
  }

  /**
   * 필터 변경 핸들러
   * @param {string} filterId - 필터 ID
   * @param {HTMLElement} buttonElement - 클릭된 버튼 요소
   */
  changeFilter(filterId, buttonElement) {
    this.filterManager.setFilter(filterId);
    this.uiController.updateButtonState(buttonElement);
  }

  /**
   * 필터 제거 핸들러
   */
  clearFilter() {
    this.filterManager.clearFilter();
    this.uiController.clearButtonState();
  }

  /**
   * 컬러 필터 토글 핸들러
   * @param {string} filterType - 필터 타입 (grayscale, sepia, warm, cool, vintage)
   */
  toggleColorFilter(filterType) {
    const video = document.getElementById("video");
    const allButtons = document.querySelectorAll(".color-filter-btn");

    // 같은 필터를 다시 클릭하면 해제
    if (this.currentColorFilter === filterType) {
      video.className = "";
      this.currentColorFilter = null;
      allButtons.forEach((btn) => btn.classList.remove("active"));
    } else {
      // 새로운 필터 적용
      video.className = filterType;
      this.currentColorFilter = filterType;

      // 모든 버튼 비활성화 후 클릭된 버튼만 활성화
      allButtons.forEach((btn) => btn.classList.remove("active"));
      document.getElementById(`${filterType}-btn`).classList.add("active");
    }
  }

  /**
   * 디버그 모드 토글
   */
  toggleDebugMode() {
    this.debugMode = !this.debugMode;
    const btn = document.querySelector(".debug-btn");
    const panel = document.getElementById("debug-panel");

    if (this.debugMode) {
      btn.classList.add("active");
      panel.style.display = "block";
    } else {
      btn.classList.remove("active");
      panel.style.display = "none";
    }
  }

  /**
   * 앱 초기화
   */
  async init() {
    try {
      // 1. 로딩 표시
      this.uiController.showLoading();

      // 2. 이미지 미리 로드
      await this.imageLoader.preloadImages(filterConfigs);

      // 3. 필터 버튼 생성
      this.uiController.createFilterButtons(this.changeFilter.bind(this));
      this.uiController.createColorFilterButtons(
        colorFilters,
        this.toggleColorFilter.bind(this)
      );

      // 4. MediaPipe 초기화
      await this.faceDetector.initializeFaceMesh();

      // 5. DOM 요소 가져오기
      this.canvas = document.getElementById("canvas");
      this.video = document.getElementById("video");
      this.ctx = this.canvas.getContext("2d");

      // 6. 카메라 시작 (세로형)
      await this.faceDetector.startCamera(this.video, 640, 480);

      // 7. UI 업데이트
      this.uiController.hideLoading();
      this.uiController.showVideoControls();
    } catch (error) {
      console.error("초기화 실패:", error);
      this.uiController.hideLoading();
      this.uiController.showError(error.message);
    }
  }
}

// 전역 앱 인스턴스
let app = null;

// 전역 함수 (HTML onclick에서 호출)
window.clearFilter = () => {
  if (app) {
    app.clearFilter();
  }
};

window.toggleColorFilter = (filterType) => {
  if (app) {
    app.toggleColorFilter(filterType);
  }
};

window.toggleDebugMode = () => {
  if (app) {
    app.toggleDebugMode();
  }
};

// 페이지 로드 후 시작
window.onload = async () => {
  app = new FaceFilterApp();
  await app.init();
};
