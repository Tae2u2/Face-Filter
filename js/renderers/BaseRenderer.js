// 기본 렌더러 클래스
export class BaseRenderer {
  constructor(imageLoader) {
    this.imageLoader = imageLoader;
  }

  /**
   * 필터 렌더링 (하위 클래스에서 구현)
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Array} landmarks - 얼굴 랜드마크
   * @param {Object} config - 필터 설정
   */
  render(ctx, landmarks, config) {
    throw new Error("render() must be implemented by subclass");
  }

  /**
   * 디버그용 점 표시
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Array} landmarks - 얼굴 랜드마크
   * @param {number} landmarkIndex - 표시할 랜드마크 인덱스
   */
  drawDebugPoint(ctx, landmarks, landmarkIndex = 10) {
    if (landmarks[landmarkIndex]) {
      const x = landmarks[landmarkIndex].x * ctx.canvas.width;
      const y = landmarks[landmarkIndex].y * ctx.canvas.height;

      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}
