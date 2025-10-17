import { BaseRenderer } from "./BaseRenderer.js";

// 파티클 효과 렌더러
export class ParticleRenderer extends BaseRenderer {
  /**
   * 파티클 효과 렌더링
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Array} landmarks - 얼굴 랜드마크
   * @param {Object} config - 필터 설정
   */
  render(ctx, landmarks, config) {
    const time = Date.now() * 0.005; // 애니메이션 속도

    config.landmarks.forEach((pointIndex, i) => {
      const point = landmarks[pointIndex];
      const x = point.x * ctx.canvas.width;
      const y = point.y * ctx.canvas.height;

      if (config.color === "rainbow") {
        this.drawSparkle(ctx, x, y, time, i);
      } else if (config.color === "pink") {
        this.drawHeart(ctx, x, y, time, i);
      }
    });

    ctx.shadowBlur = 0; // 그림자 리셋
  }

  /**
   * 반짝이 효과 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {number} time - 애니메이션 시간
   * @param {number} index - 파티클 인덱스
   */
  drawSparkle(ctx, x, y, time, index) {
    const hue = (time * 50 + index * 45) % 360;
    const size = 4 + Math.sin(time * 3 + index) * 2;
    const opacity = 0.7 + Math.sin(time * 2 + index) * 0.3;

    ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${opacity})`;
    ctx.shadowColor = `hsl(${hue}, 80%, 60%)`;
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fill();

    // 십자 모양 반짝임
    ctx.strokeStyle = `hsla(${hue}, 80%, 80%, ${opacity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - size * 2, y);
    ctx.lineTo(x + size * 2, y);
    ctx.moveTo(x, y - size * 2);
    ctx.lineTo(x, y + size * 2);
    ctx.stroke();
  }

  /**
   * 하트 효과 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {number} time - 애니메이션 시간
   * @param {number} index - 파티클 인덱스
   */
  drawHeart(ctx, x, y, time, index) {
    const floatY = y + Math.sin(time * 2 + index) * 5;
    const size = 8 + Math.sin(time * 1.5 + index) * 3;
    const opacity = 0.6 + Math.sin(time * 1.8 + index) * 0.4;

    ctx.fillStyle = `hsla(330, 80%, 60%, ${opacity})`;
    ctx.shadowColor = "rgba(255, 105, 180, 0.5)";
    ctx.shadowBlur = 8;

    // 하트 모양 그리기
    this.drawHeartShape(ctx, x, floatY, size);
  }

  /**
   * 하트 모양 그리기 함수
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {number} size - 하트 크기
   */
  drawHeartShape(ctx, x, y, size) {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;

    ctx.moveTo(x, y + size * 0.3);
    // 왼쪽 커브
    ctx.bezierCurveTo(
      x,
      y,
      x - size * 0.5,
      y,
      x - size * 0.5,
      y + topCurveHeight
    );
    ctx.bezierCurveTo(
      x - size * 0.5,
      y + size * 0.7,
      x,
      y + size * 0.7,
      x,
      y + size
    );
    // 오른쪽 커브
    ctx.bezierCurveTo(
      x,
      y + size * 0.7,
      x + size * 0.5,
      y + size * 0.7,
      x + size * 0.5,
      y + topCurveHeight
    );
    ctx.bezierCurveTo(x + size * 0.5, y, x, y, x, y + size * 0.3);

    ctx.fill();
  }
}
