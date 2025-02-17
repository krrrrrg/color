const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colorPreview = document.getElementById("colorPreview");
const colorValue = document.getElementById("colorValue");
const imageUpload = document.getElementById("imageUpload");

// 이미지 업로드 처리 수정
imageUpload.addEventListener("change", function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    const img = new Image();

    img.onload = function () {
      // 이미지 방향 보정을 위한 임시 캔버스 생성
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");

      // 컨테이너 크기 가져오기
      const container = document.querySelector(".canvas-container");
      const containerWidth = container.clientWidth;

      // 이미지 크기 조정 (컨테이너 너비에 맞춤)
      let width = containerWidth;
      let height = (img.height * containerWidth) / img.width;

      // 캔버스 크기 설정
      canvas.width = width;
      canvas.height = height;
      tempCanvas.width = width;
      tempCanvas.height = height;

      // 이미지를 캔버스에 그리기
      tempCtx.drawImage(img, 0, 0, width, height);
      ctx.drawImage(tempCanvas, 0, 0);

      // 임시 캔버스 제거
      tempCanvas.remove();

      // 캔버스 스타일 설정
      canvas.style.width = "100%";
      canvas.style.height = "auto";
    };

    // CORS 문제 방지
    img.crossOrigin = "Anonymous";
    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
});

// 색상 추출 함수
function getColorName(r, g, b) {
  const colors = {
    // 무채색 계열
    검정: [0, 0, 0],
    진회색: [64, 64, 64],
    회색: [128, 128, 128],
    연회색: [192, 192, 192],
    흰색: [255, 255, 255],
    아이보리: [255, 255, 240],
    은색: [192, 192, 192],

    // 빨간계열
    빨강: [255, 0, 0],
    진빨강: [139, 0, 0],
    밝은빨강: [255, 69, 0],
    선홍색: [220, 20, 60],
    와인레드: [114, 47, 55],
    버건디: [128, 0, 32],
    루비: [224, 17, 95],
    적갈색: [165, 42, 42],
    토마토: [255, 99, 71],

    // 분홍계열
    분홍: [255, 192, 203],
    핫핑크: [255, 105, 180],
    딥핑크: [255, 20, 147],
    라즈베리: [227, 11, 93],
    연분홍: [255, 182, 193],
    살구색: [255, 218, 185],
    코랄핑크: [248, 131, 121],
    피치: [255, 218, 185],
    로즈: [255, 0, 127],

    // 주황계열
    주황: [255, 165, 0],
    진주황: [255, 140, 0],
    연주황: [255, 200, 140],
    귤색: [255, 128, 0],
    코랄: [255, 127, 80],
    캐럿: [237, 145, 33],
    황토색: [210, 105, 30],
    테라코타: [226, 114, 91],

    // 노란계열
    노랑: [255, 255, 0],
    연노랑: [255, 255, 224],
    골드: [255, 215, 0],
    머스타드: [255, 219, 88],
    레몬: [255, 247, 0],
    크림: [255, 253, 208],
    바나나: [255, 225, 53],
    카나리아: [255, 255, 153],
    황갈색: [218, 165, 32],

    // 초록계열
    초록: [0, 128, 0],
    라임: [50, 205, 50],
    연두: [144, 238, 144],
    올리브: [128, 128, 0],
    진초록: [0, 100, 0],
    민트: [189, 252, 201],
    에메랄드: [46, 204, 113],
    포레스트그린: [34, 139, 34],
    세이지: [176, 208, 176],
    녹차색: [134, 169, 62],
    잔디색: [124, 252, 0],
    애플그린: [141, 182, 0],

    // 청록계열
    청록: [0, 206, 209],
    터콰이즈: [64, 224, 208],
    아쿠아: [0, 255, 255],
    틸: [0, 128, 128],
    비취색: [32, 178, 170],
    제이드: [0, 168, 107],

    // 파란계열
    파랑: [0, 0, 255],
    하늘: [135, 206, 235],
    네이비: [0, 0, 128],
    로얄블루: [65, 105, 225],
    코발트: [0, 71, 171],
    스틸블루: [70, 130, 180],
    데님: [21, 96, 189],
    사파이어: [15, 82, 186],
    베이비블루: [137, 207, 240],
    파우더블루: [176, 224, 230],
    청색: [0, 49, 83],

    // 보라계열
    보라: [128, 0, 128],
    자주: [186, 85, 211],
    라벤더: [230, 230, 250],
    진보라: [75, 0, 130],
    플럼: [221, 160, 221],
    인디고: [75, 0, 130],
    퍼플: [147, 112, 219],
    아메시스트: [153, 102, 204],
    모브: [224, 176, 255],
    라일락: [200, 162, 200],

    // 갈색계열
    갈색: [139, 69, 19],
    진갈색: [101, 67, 33],
    연갈색: [210, 180, 140],
    카키: [189, 183, 107],
    시에나: [160, 82, 45],
    마호가니: [192, 64, 0],
    캐러멜: [210, 105, 30],
    초콜릿: [123, 63, 0],
    커피: [111, 78, 55],
    호두색: [87, 58, 46],
    탄색: [210, 180, 140],
    샌드: [194, 178, 128],

    // 메탈릭 계열
    골드메탈릭: [212, 175, 55],
    실버: [192, 192, 192],
    브론즈: [205, 127, 50],
    플래티넘: [229, 228, 226],
    구리색: [184, 115, 51],

    // 파스텔계열
    파스텔핑크: [255, 209, 220],
    파스텔블루: [174, 198, 207],
    파스텔퍼플: [221, 160, 221],
    파스텔옐로우: [254, 255, 163],
    파스텔그린: [176, 226, 172],
    파스텔오렌지: [255, 179, 71],
  };

  // HSV 변환
  const [h, s, v] = rgbToHsv(r, g, b);

  // 무채색 처리 (더 세밀한 구분)
  if (s < 0.12) {
    if (v > 0.95) return "흰색";
    if (v < 0.08) return "검정";
    if (v < 0.25) return "진회색";
    if (v < 0.5) return "회색";
    if (v < 0.85) return "연회색";
    return "흰색";
  }

  let closestColor = "";
  let minDistance = Infinity;

  for (let name in colors) {
    const [cr, cg, cb] = colors[name];
    const [ch, cs, cv] = rgbToHsv(cr, cg, cb);

    // 색상 거리 계산 개선
    let hueDistance = Math.min(Math.abs(h - ch), 1 - Math.abs(h - ch));
    let satDistance = Math.abs(s - cs);
    let valDistance = Math.abs(v - cv);

    // 색상별 가중치 조정
    let distance =
      hueDistance * 25 + // 색상 차이에 더 높은 가중치
      satDistance * 12 + // 채도 차이
      valDistance * 8; // 명도 차이

    // 특정 색상 범위에 대한 추가 처리
    if (h >= 0.95 || h <= 0.05) {
      // 빨간색 계열
      if (s > 0.7 && v > 0.8) {
        distance *= 0.8; // 선명한 빨간색 우선
      }
    }

    // 파스텔 톤 처리
    if (s < 0.3 && v > 0.8) {
      if (name.includes("파스텔")) {
        distance *= 0.8; // 파스텔 색상 우선
      } else {
        distance *= 1.2; // 일반 색상 가중치 증가
      }
    }

    // 메탈릭 색상 처리
    if (
      name.includes("메탈릭") ||
      name.includes("실버") ||
      name.includes("골드")
    ) {
      if (s < 0.2 && v > 0.7) {
        distance *= 0.9; // 메탈릭 색상 우선
      }
    }

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = name;
    }
  }

  return closestColor;
}

// 특정 색상을 제외하고 가장 가까운 색상 찾기
function findNextClosestColor(r, g, b, colors, excludeColors) {
  const [h, s, v] = rgbToHsv(r, g, b);
  let nextClosestColor = "";
  let minDistance = Infinity;

  for (let name in colors) {
    if (excludeColors.includes(name)) continue;

    const [cr, cg, cb] = colors[name];
    const [ch, cs, cv] = rgbToHsv(cr, cg, cb);

    let hueDistance = Math.min(Math.abs(h - ch), 1 - Math.abs(h - ch));
    let satDistance = Math.abs(s - cs);
    let valDistance = Math.abs(v - cv);

    const distance = hueDistance * 18 + satDistance * 10 + valDistance * 7;

    if (distance < minDistance) {
      minDistance = distance;
      nextClosestColor = name;
    }
  }

  return nextClosestColor;
}

// RGB를 HSV로 변환하는 함수 (HSL 대신 HSV 사용)
function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h,
    s,
    v = max;

  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, v];
}

// 스포이드 위치 표시를 위한 마커 생성 함수
function showColorMarker(x, y, color) {
  // 이전 마커 제거
  const oldMarker = document.querySelector(".color-marker");
  if (oldMarker) {
    oldMarker.remove();
  }

  // 새 마커 생성
  const marker = document.createElement("div");
  marker.className = "color-marker";
  marker.style.left = `${x}px`;
  marker.style.top = `${y}px`;
  marker.style.backgroundColor = color;

  // 캔버스 컨테이너에 마커 추가
  document.querySelector(".canvas-container").appendChild(marker);

  // 3초 후 마커 제거
  setTimeout(() => marker.remove(), 3000);
}

// 캔버스 클릭 이벤트 처리 수정
canvas.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();

  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  // 캔버스의 실제 크기와 표시되는 크기의 비율 계산
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  // 클릭 좌표를 캔버스 내부 좌표로 변환
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  // 범위를 벗어나는 클릭 처리
  if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
    return;
  }

  try {
    const imageData = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    const [r, g, b] = imageData;
    const hex = `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

    colorPreview.style.backgroundColor = hex;
    const colorName = getColorName(r, g, b);
    colorValue.textContent = `${colorName} (${hex})`;

    // 마커 표시
    showColorMarker(clickX, clickY, hex);
  } catch (error) {
    console.error("색상 추출 중 오류 발생:", error);
  }

  return false; // 추가 이벤트 방지
});

// 모바일 터치 이벤트 수정
canvas.addEventListener(
  "touchstart",
  function (e) {
    e.preventDefault();
    e.stopPropagation();

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];

    // 터치 좌표를 캔버스 상대 좌표로 변환
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    // 캔버스의 실제 크기와 표시되는 크기의 비율 계산
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // 실제 캔버스 좌표 계산
    const canvasX = Math.round(touchX * scaleX);
    const canvasY = Math.round(touchY * scaleY);

    try {
      // 색상 데이터 추출
      const imageData = ctx.getImageData(canvasX, canvasY, 1, 1).data;
      const [r, g, b] = imageData;
      const hex = `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

      colorPreview.style.backgroundColor = hex;
      const colorName = getColorName(r, g, b);
      colorValue.textContent = `${colorName} (${hex})`;

      // 마커 표시 (터치한 실제 위치에)
      showColorMarker(touchX, touchY, hex);

      // 디버깅용 로그
      console.log({
        touch: { x: touchX, y: touchY },
        canvas: { x: canvasX, y: canvasY },
        scale: { x: scaleX, y: scaleY },
        color: { r, g, b, hex },
      });
    } catch (error) {
      console.error("색상 추출 중 오류 발생:", error);
      console.log("오류 발생 좌표:", { x: canvasX, y: canvasY });
    }
  },
  { passive: false }
);

// 추가 이벤트 리스너로 다른 터치 이벤트 방지
canvas.addEventListener(
  "touchmove",
  function (e) {
    e.preventDefault();
    e.stopPropagation();
  },
  { passive: false }
);

canvas.addEventListener(
  "touchend",
  function (e) {
    e.preventDefault();
    e.stopPropagation();
  },
  { passive: false }
);
