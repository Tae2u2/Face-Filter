import { BaseRenderer } from "./BaseRenderer.js";

// 이미지 기반 필터 렌더러
export class ImageRenderer extends BaseRenderer {
  /**
   * 이미지 필터 렌더링
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Array} landmarks - 얼굴 랜드마크
   * @param {Object} config - 필터 설정
   */
  render(ctx, landmarks, config) {
    if (!config.image) return;

    const img = this.imageLoader.getImage(config.image);
    if (!img) return;

    // 얼굴 크기 기반 스케일 계산 (선글라스용)
    const faceWidth = Math.abs(landmarks[234].x - landmarks[454].x); // 얼굴 너비
    const eyeWidth = Math.abs(landmarks[33].x - landmarks[263].x); // 눈 간 거리

    config.landmarks.forEach((landmarkIndex) => {
      const point = landmarks[landmarkIndex];

      const x = point.x * ctx.canvas.width;
      const y = point.y * ctx.canvas.height;

      // 선글라스의 경우 눈 너비 기반 스케일 적용
      let scale = config.scale;
      if (config.useEyeWidth) {
        scale = ((eyeWidth * ctx.canvas.width) / img.width) * 2.5; // 눈 너비에 맞춰 조정
      }

      const imgWidth = img.width * scale;
      const imgHeight = img.height * scale;

      const drawX = x - imgWidth / 2;

      // 리본의 경우 정수리 위치 계산, 선글라스는 눈 위치 그대로
      let drawY = y + config.offsetY;
      if (!config.useEyeWidth) {
        const crownOffset = faceWidth * ctx.canvas.width * 0.5;
        drawY = y + config.offsetY - crownOffset;
      }

      ctx.drawImage(img, drawX, drawY, imgWidth, imgHeight);
    });
  }
}
