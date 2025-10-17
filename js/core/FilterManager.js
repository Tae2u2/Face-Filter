// 필터 관리 클래스
export class FilterManager {
  constructor() {
    this.currentFilter = null;
  }

  /**
   * 현재 필터 설정
   * @param {string} filterId - 필터 ID
   */
  setFilter(filterId) {
    this.currentFilter = filterId;
  }

  /**
   * 현재 필터 가져오기
   */
  getCurrentFilter() {
    return this.currentFilter;
  }

  /**
   * 필터 제거
   */
  clearFilter() {
    this.currentFilter = null;
  }

  /**
   * 필터가 활성화되어 있는지 확인
   */
  hasActiveFilter() {
    return this.currentFilter !== null;
  }
}
