import { ImageRenderer } from "./ImageRenderer.js";
import { ParticleRenderer } from "./ParticleRenderer.js";
import { ModelRenderer } from "./ModelRenderer.js";

// 필터 렌더링 통합 클래스
export class FilterRenderer {
  constructor(imageLoader) {
    this.imageRenderer = new ImageRenderer(imageLoader);
    this.particleRenderer = new ParticleRenderer(imageLoader);
    this.modelRenderer = new ModelRenderer();
  }

  /**
   * 필터 적용
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Array} landmarks - 얼굴 랜드마크
   * @param {Object} config - 필터 설정
   */
  async applyFilter(ctx, landmarks, config) {
    if (!config) return;

    try {
      if (config.type === "particles") {
        this.particleRenderer.render(ctx, landmarks, config);
      } else if (config.type === "model") {
        await this.modelRenderer.render(ctx, landmarks, config);
      } else {
        this.imageRenderer.render(ctx, landmarks, config);
      }
    } catch (error) {
      console.error("필터 적용 오류:", error);
      // 오류 발생 시 기본 점만 표시
      this.imageRenderer.drawDebugPoint(ctx, landmarks);
    }
  }
}
