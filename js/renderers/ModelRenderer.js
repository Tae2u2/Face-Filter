import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * 3D 모델 렌더러 클래스
 * Three.js를 사용하여 GLB/GLTF 모델을 캔버스에 렌더링
 */
export class ModelRenderer {
  constructor() {
    this.models = new Map();
    this.loader = new GLTFLoader();
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
  }

  /**
   * Three.js 렌더러 초기화
   * @param {number} width - 캔버스 너비
   * @param {number} height - 캔버스 높이
   */
  initRenderer(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;

    // Scene 생성
    this.scene = new THREE.Scene();

    // Camera 생성
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.z = 5;

    // WebGL Renderer 생성
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 0); // 투명 배경
    this.renderer.outputColorSpace = THREE.SRGBColorSpace; // 색상 공간 설정

    // 조명 추가 - 더 밝고 균일한 조명
    // 1. 전체 환경광 (밝게)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    this.scene.add(ambientLight);

    // 2. 정면 메인 조명
    const frontLight = new THREE.DirectionalLight(0xffffff, 1.3);
    frontLight.position.set(0, 0, 1);
    this.scene.add(frontLight);

    // 3. 위쪽 조명
    const topLight = new THREE.DirectionalLight(0xffffff, 0.8);
    topLight.position.set(0, 1, 0);
    this.scene.add(topLight);

    // 4. 좌우 보조 조명 (그림자 제거)
    const leftLight = new THREE.DirectionalLight(0xffffff, 0.5);
    leftLight.position.set(-1, 0.5, 0.5);
    this.scene.add(leftLight);

    const rightLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rightLight.position.set(1, 0.5, 0.5);
    this.scene.add(rightLight);
  }

  /**
   * 3D 모델 로드
   * @param {string} modelPath - 모델  파일 경로
   * @returns {Promise<THREE.Group>}
   */
  async loadModel(modelPath) {
    // 이미 로드된 모델이 있으면 반환
    if (this.models.has(modelPath)) {
      return this.models.get(modelPath);
    }

    return new Promise((resolve, reject) => {
      this.loader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene;

          // 모델 크기 정규화
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 1 / maxDim;
          model.scale.setScalar(scale);

          // 모델 중심 조정
          const center = box.getCenter(new THREE.Vector3());
          model.position.sub(center.multiplyScalar(scale));

          this.models.set(modelPath, model);
          resolve(model);
        },
        (progress) => {
          console.log(
            `로딩 진행: ${((progress.loaded / progress.total) * 100).toFixed(
              2
            )}%`
          );
        },
        (error) => {
          console.error("모델 로드 오류:", error);
          reject(error);
        }
      );
    });
  }

  /**
   * 랜드마크 좌표를 3D 공간 좌표로 변환
   * @param {Array} landmarks - 얼굴 랜드마크
   * @param {number} landmarkIndex - 랜드마크 인덱스
   * @param {number} canvasWidth - 캔버스 너비
   * @param {number} canvasHeight - 캔버스 높이
   * @returns {THREE.Vector3}
   */
  landmarkToWorld(landmarks, landmarkIndex, canvasWidth, canvasHeight) {
    const landmark = landmarks[landmarkIndex];

    // 캔버스 좌표를 NDC(Normalized Device Coordinates)로 변환
    const x = ((landmark.x * canvasWidth) / canvasWidth) * 2 - 1;
    const y = -((landmark.y * canvasHeight) / canvasHeight) * 2 + 1;
    const z = landmark.z || 0;

    // NDC를 월드 좌표로 변환
    const vector = new THREE.Vector3(x, y, z);
    vector.unproject(this.camera);

    return vector;
  }

  /**
   * 얼굴 방향 계산 (헤드 포즈)
   * @param {Array} landmarks - 얼굴 랜드마크
   * @returns {THREE.Euler}
   */
  calculateHeadPose(landmarks) {
    // 얼굴의 주요 포인트
    const nose = landmarks[1]; // 코끝
    const leftEye = landmarks[33]; // 왼쪽 눈
    const rightEye = landmarks[263]; // 오른쪽 눈
    const chin = landmarks[152]; // 턱

    // 좌우 회전 (Yaw) 계산
    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
    const yaw = (nose.x - eyeCenterX) * Math.PI;

    // 상하 회전 (Pitch) 계산
    const eyeCenterY = (leftEye.y + rightEye.y) / 2;
    const pitch = (nose.y - eyeCenterY) * Math.PI;

    // 기울임 (Roll) 계산
    const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);

    return new THREE.Euler(pitch, yaw, roll, "XYZ");
  }

  /**
   * 얼굴 크기 계산
   * @param {Array} landmarks - 얼굴 랜드마크
   * @returns {number}
   */
  calculateFaceScale(landmarks) {
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const eyeDistance = Math.sqrt(
      Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2)
    );
    return eyeDistance * 5; // 스케일 조정 계수
  }

  /**
   * 3D 모델 렌더링
   * @param {CanvasRenderingContext2D} ctx - 2D 캔버스 컨텍스트
   * @param {Array} landmarks - 얼굴 랜드마크
   * @param {Object} config - 필터 설정
   */
  async render(ctx, landmarks, config) {
    if (!config.model || !landmarks || landmarks.length === 0) return;

    try {
      // 렌더러 초기화 (처음 한 번만)
      if (!this.renderer) {
        this.initRenderer(ctx.canvas.width, ctx.canvas.height);
      }

      // 캔버스 크기가 변경되었을 때 업데이트
      if (
        this.canvasWidth !== ctx.canvas.width ||
        this.canvasHeight !== ctx.canvas.height
      ) {
        this.canvasWidth = ctx.canvas.width;
        this.canvasHeight = ctx.canvas.height;
        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        this.camera.aspect = this.canvasWidth / this.canvasHeight;
        this.camera.updateProjectionMatrix();
      }

      // 모델 로드
      const model = await this.loadModel(config.model);

      // 기존 모델 제거
      this.scene.children.forEach((child) => {
        if (child.type === "Group" || child.type === "Scene") {
          this.scene.remove(child);
        }
      });

      // 새 모델 복사 및 추가
      const modelClone = model.clone();

      // 랜드마크 인덱스 (기본값: 코끝)
      const landmarkIndex = config.landmarks ? config.landmarks[0] : 1;

      // 모델 위치 설정
      const position = this.landmarkToWorld(
        landmarks,
        landmarkIndex,
        ctx.canvas.width,
        ctx.canvas.height
      );
      modelClone.position.copy(position);

      // 얼굴 방향에 맞춰 모델 회전
      if (config.followHeadPose !== false) {
        const rotation = this.calculateHeadPose(landmarks);
        modelClone.rotation.copy(rotation);
      }

      // 얼굴 크기에 맞춰 모델 스케일 조정
      const faceScale = this.calculateFaceScale(landmarks);
      const configScale = config.scale || 1;
      modelClone.scale.multiplyScalar(faceScale * configScale);

      // Y축 오프셋 적용
      if (config.offsetY) {
        modelClone.position.y += config.offsetY / 1000;
      }

      this.scene.add(modelClone);

      // 렌더링
      this.renderer.render(this.scene, this.camera);

      // Three.js 캔버스를 2D 캔버스에 복사
      ctx.drawImage(this.renderer.domElement, 0, 0);
    } catch (error) {
      console.error("3D 모델 렌더링 오류:", error);
    }
  }

  /**
   * 리소스 정리
   */
  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
    }
    this.models.clear();
    this.scene = null;
    this.camera = null;
    this.renderer = null;
  }
}
