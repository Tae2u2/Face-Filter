// 이미지 로딩 유틸리티
export class ImageLoader {
  constructor() {
    this.loadedImages = new Map();
  }

  /**
   * 필터 설정에서 이미지 경로를 추출하여 미리 로드
   * @param {Object} filterConfigs - 필터 설정 객체
   */
  async preloadImages(filterConfigs) {
    const promises = Object.values(filterConfigs)
      .filter((config) => config.image)
      .map((config) => this.loadImage(config.image));

    await Promise.all(promises);
  }

  /**
   * 단일 이미지 로드
   * @param {string} imagePath - 이미지 경로
   */
  loadImage(imagePath) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.loadedImages.set(imagePath, img);
        resolve(img);
      };
      img.onerror = () => reject(`이미지 로드 실패: ${imagePath}`);
      img.src = imagePath;
    });
  }

  /**
   * 로드된 이미지 가져오기
   * @param {string} imagePath - 이미지 경로
   */
  getImage(imagePath) {
    return this.loadedImages.get(imagePath);
  }

  /**
   * 이미지가 로드되었는지 확인
   * @param {string} imagePath - 이미지 경로
   */
  hasImage(imagePath) {
    return this.loadedImages.has(imagePath);
  }
}
