// 필터 설정 및 상수
export const filterConfigs = {
  rabbit: {
    type: "model",
    model: "./images/rabbit.glb",
    scale: 0.08,
    offsetY: 10,
    landmarks: [10],
    followHeadPose: true,
  },
  raccoon: {
    type: "model",
    model: "./images/raccoon.glb",
    scale: 0.07,
    offsetY: 10,
    landmarks: [10],
    followHeadPose: true,
  },
  cat: {
    image: "./images/cat.png",
    scale: 0.4,
    offsetY: -60,
    landmarks: [10],
  },
  dog: {
    image: "./images/puppy.png",
    scale: 0.4,
    offsetY: -60,
    landmarks: [10],
  },
  sparkles: {
    type: "particles",
    landmarks: [10, 338, 297, 332, 284, 251, 389, 356, 454], // 얼굴 윤곽
    color: "rainbow",
    animation: "twinkle",
  },
  hearts: {
    type: "particles",
    landmarks: [33, 7, 163, 144, 145, 153, 362, 398, 384, 385, 386, 387], // 눈 주변
    color: "pink",
    animation: "float",
  },
  ribbon: {
    image: "./images/ribbon.png",
    scale: 0.15,
    offsetY: -50,
    landmarks: [234, 454], // 양쪽 관자놀이 (머리 장식 위치)
  },
  sunglasses: {
    image: "./images/sunglass.png",
    scale: 0.1,
    offsetY: -110,
    landmarks: [168], // 코 브릿지 (안경 중심점
    useEyeWidth: true, // 눈 너비 기반 크기 조정
  },
};

export const filterButtons = [
  { id: "rabbit", emoji: "🐰", name: "토끼" },
  { id: "raccoon", emoji: "🦝", name: "라쿤" },
  { id: "cat", emoji: "🐱", name: "고양이" },
  { id: "dog", emoji: "🐶", name: "강아지" },
  { id: "sparkles", emoji: "✨", name: "반짝이" },
  { id: "hearts", emoji: "💕", name: "하트" },
  { id: "ribbon", emoji: "🎀", name: "리본" },
  { id: "sunglasses", emoji: "🕶️", name: "선글라스" },
];
