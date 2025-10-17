// 얼굴 감지 및 MediaPipe 관리 클래스
export class FaceDetector {
  constructor(onResultsCallback) {
    this.faceMesh = null;
    this.camera = null;
    this.isReady = false;
    this.onResultsCallback = onResultsCallback;
  }

  /**
   * MediaPipe FaceMesh 초기화
   */
  async initializeFaceMesh() {
    this.faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.3,
      selfieMode: true, // 셀카 모드 활성화
    });

    this.faceMesh.onResults(this.onResultsCallback);
  }

  /**
   * 카메라 시작
   * @param {HTMLVideoElement} videoElement - 비디오 엘리먼트
   * @param {number} width - 비디오 너비
   * @param {number} height - 비디오 높이
   */
  async startCamera(videoElement, width = 640, height = 480) {
    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        if (this.isReady) {
          await this.faceMesh.send({ image: videoElement });
        }
      },
      width,
      height,
    });

    await this.camera.start();
    this.isReady = true;
  }

  /**
   * 준비 상태 확인
   */
  getIsReady() {
    return this.isReady;
  }

  /**
   * 카메라 중지
   */
  stopCamera() {
    if (this.camera) {
      this.camera.stop();
      this.isReady = false;
    }
  }
}
