// 사진 촬영 관리 클래스
export class CaptureManager {
  constructor(videoElement, canvasElement) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.capturedImageData = null;
  }

  /**
   * 사진 촬영
   * @param {string|null} currentColorFilter - 현재 적용된 컬러 필터
   * @returns {string} 촬영된 이미지 데이터 (base64)
   */
  capture(currentColorFilter = null) {
    try {
      // 플래시 효과
      this.showFlashEffect();

      // 촬영용 임시 캔버스 생성
      const captureCanvas = document.createElement("canvas");
      const captureCtx = captureCanvas.getContext("2d");

      // 비디오와 동일한 크기로 설정
      captureCanvas.width = this.video.videoWidth || 640;
      captureCanvas.height = this.video.videoHeight || 480;

      // 미러링 적용
      captureCtx.save();
      captureCtx.translate(captureCanvas.width, 0);
      captureCtx.scale(-1, 1);

      // 비디오 프레임 복사
      captureCtx.drawImage(
        this.video,
        0,
        0,
        captureCanvas.width,
        captureCanvas.height
      );

      // 컬러 필터 적용 (CSS 필터를 캔버스에 적용)
      if (currentColorFilter) {
        this.applyColorFilterToCanvas(
          captureCtx,
          captureCanvas.width,
          captureCanvas.height,
          currentColorFilter
        );
      }

      captureCtx.restore();

      // 필터 오버레이 복사 (캔버스의 필터 효과)
      captureCtx.save();
      captureCtx.translate(captureCanvas.width, 0);
      captureCtx.scale(-1, 1);
      captureCtx.drawImage(
        this.canvas,
        0,
        0,
        captureCanvas.width,
        captureCanvas.height
      );
      captureCtx.restore();

      // 이미지 데이터 저장
      this.capturedImageData = captureCanvas.toDataURL("image/png");

      console.log("사진 촬영 완료");
      return this.capturedImageData;
    } catch (error) {
      console.error("촬영 실패:", error);
      throw new Error("사진 촬영에 실패했습니다.");
    }
  }

  /**
   * 플래시 효과 표시
   */
  showFlashEffect() {
    const flash = document.getElementById("flash");
    if (flash) {
      flash.style.opacity = "1";
      setTimeout(() => {
        flash.style.opacity = "0";
      }, 200);
    }
  }

  /**
   * 캔버스에 컬러 필터 적용
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {number} width - 캔버스 너비
   * @param {number} height - 캔버스 높이
   * @param {string} filterType - 필터 타입
   */
  applyColorFilterToCanvas(ctx, width, height, filterType) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    switch (filterType) {
      case "grayscale":
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = data[i + 1] = data[i + 2] = avg;
        }
        break;
      case "sepia":
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i],
            g = data[i + 1],
            b = data[i + 2];
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        }
        break;
      case "warm":
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * 1.1); // 빨강 증가
          data[i + 2] = Math.max(0, data[i + 2] * 0.9); // 파랑 감소
        }
        break;
      case "cool":
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.max(0, data[i] * 0.9); // 빨강 감소
          data[i + 2] = Math.min(255, data[i + 2] * 1.1); // 파랑 증가
        }
        break;
      case "vintage":
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i],
            g = data[i + 1],
            b = data[i + 2];
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189) * 0.9;
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168) * 0.9;
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131) * 0.9;
        }
        break;
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * 촬영된 이미지 데이터 가져오기
   */
  getCapturedImage() {
    return this.capturedImageData;
  }

  /**
   * 미리보기 모달 표시
   */
  showPreview() {
    if (!this.capturedImageData) {
      console.warn("촬영된 이미지가 없습니다.");
      return;
    }

    const previewImage = document.getElementById("preview-image");
    if (previewImage) {
      previewImage.src = this.capturedImageData;
    }

    const modal = document.getElementById("preview-modal");
    if (modal) {
      modal.style.display = "flex";
    }
  }

  /**
   * 미리보기 모달 닫기
   */
  closePreview() {
    const modal = document.getElementById("preview-modal");
    if (modal) {
      modal.style.display = "none";
    }
  }

  /**
   * 사진 다운로드 (모바일/데스크톱 대응)
   */
  download() {
    if (!this.capturedImageData) {
      alert("저장할 사진이 없습니다.");
      return;
    }

    try {
      // 파일 이름 생성 (날짜 + 시간)
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, -5);
      const filename = `face-filter-${timestamp}.png`;

      // 모바일/데스크톱 환경 구분
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // 모바일: 새 탭에서 이미지 열기
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Face Filter - 촬영된 사진</title>
                <style>
                  body { margin: 0; padding: 0; background: #000; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                  img { max-width: 100%; height: auto; }
                  .download-info { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(255,255,255,0.9); padding: 15px 25px; border-radius: 10px; text-align: center; font-family: Arial, sans-serif; }
                </style>
              </head>
              <body>
                <div class="download-info">이미지를 길게 눌러 저장하세요</div>
                <img src="${this.capturedImageData}" alt="촬영된 사진" />
              </body>
            </html>
          `);
        }
      } else {
        // 데스크톱: 다운로드
        const link = document.createElement("a");
        link.download = filename;
        link.href = this.capturedImageData;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      console.log("다운로드 완료:", filename);
    } catch (error) {
      console.error("다운로드 실패:", error);
      alert("사진 저장에 실패했습니다. 다시 시도해주세요.");
    }
  }

  /**
   * 사진 공유 (Web Share API)
   */
  async share() {
    if (!this.capturedImageData) {
      alert("공유할 사진이 없습니다.");
      return;
    }

    try {
      // Web Share API 지원 확인
      if (navigator.share && navigator.canShare) {
        // Base64를 Blob으로 변환
        const response = await fetch(this.capturedImageData);
        const blob = await response.blob();
        const file = new File([blob], "face-filter.png", { type: "image/png" });

        const shareData = {
          files: [file],
          title: "Face Filter",
          text: "Face Filter로 촬영한 사진입니다!",
        };

        // 공유 가능 여부 확인
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          console.log("공유 완료");
        } else {
          // 파일 공유가 안 되면 텍스트만 공유
          await navigator.share({
            title: "Face Filter",
            text: "Face Filter로 촬영한 사진입니다!",
          });
        }
      } else {
        // Web Share API 미지원 시
        alert(
          "이 브라우저는 공유 기능을 지원하지 않습니다. 다운로드 버튼을 이용해주세요."
        );
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("공유 실패:", error);
        alert("사진 공유에 실패했습니다.");
      }
    }
  }
}
