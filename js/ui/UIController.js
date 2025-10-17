// UI 제어 클래스
export class UIController {
  constructor(filterButtons) {
    this.filterButtons = filterButtons;
  }

  /**
   * 필터 버튼 생성
   * @param {Function} onFilterChange - 필터 변경 콜백 함수
   */
  createFilterButtons(onFilterChange) {
    const controls = document.getElementById("controls");
    if (!controls) return;

    this.filterButtons.forEach((filter) => {
      const button = document.createElement("button");
      button.className = "filter-btn";
      button.textContent = `${filter.emoji}`;
      button.onclick = () => onFilterChange(filter.id, button);
      button.dataset.filter = filter.id;
      controls.appendChild(button);
    });
  }

  /**
   * 컬러 필터 버튼 생성
   * @param {Array} colorFilters - 컬러 필터 설정 배열
   * @param {Function} onColorFilterChange - 컬러 필터 변경 콜백 함수
   */
  createColorFilterButtons(colorFilters, onColorFilterChange) {
    const container = document.getElementById("color-filters-container");
    if (!container) return;

    colorFilters.forEach((filter) => {
      const button = document.createElement("button");
      button.className = "color-filter-btn";
      button.id = `${filter.id}-btn`;
      button.textContent = filter.name;
      button.onclick = () => onColorFilterChange(filter.id);
      button.dataset.filterId = filter.id;
      container.appendChild(button);
    });
  }

  /**
   * 버튼 활성화 상태 업데이트
   * @param {HTMLElement} activeButton - 활성화할 버튼
   */
  updateButtonState(activeButton) {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    if (activeButton) {
      activeButton.classList.add("active");
    }
  }

  /**
   * 모든 필터 버튼 비활성화
   */
  clearButtonState() {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
  }

  /**
   * 로딩 화면 표시
   */
  showLoading() {
    const loading = document.getElementById("loading");
    if (loading) loading.style.display = "block";
  }

  /**
   * 로딩 화면 숨김
   */
  hideLoading() {
    const loading = document.getElementById("loading");
    if (loading) loading.style.display = "none";
  }

  /**
   * 에러 메시지 표시
   * @param {string} message - 에러 메시지
   */
  showError(message) {
    const error = document.getElementById("error");
    if (error) {
      error.style.display = "block";
      error.textContent = `오류: ${message}`;
    }
  }

  /**
   * 비디오 컨테이너 및 컨트롤 표시
   */
  showVideoControls() {
    const videoContainer = document.querySelector(".video-container");
    const controls = document.getElementById("controls");
    const clearControls = document.getElementById("clear-controls");

    if (videoContainer) videoContainer.style.display = "block";
    if (controls) controls.style.display = "flex";
    if (clearControls) clearControls.style.display = "flex";
  }
}
