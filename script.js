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

      // 적절한 크기로 조정 (최대 너비/높이 설정)
      const maxWidth = 1200;
      const maxHeight = 1200;
      let width = img.width;
      let height = img.height;

      // 이미지 크기 조정
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      // 캔버스 크기 설정
      tempCanvas.width = width;
      tempCanvas.height = height;

      // 이미지 그리기
      tempCtx.drawImage(img, 0, 0, width, height);

      // 실제 캔버스에 이미지 적용
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(tempCanvas, 0, 0);

      // 임시 캔버스 제거
      tempCanvas.remove();
    };

    // CORS 문제 방지
    img.crossOrigin = "Anonymous";
    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
});

// 색상 추출 함수
function getColorName(r, g, b) {
  // 확장된 색상 데이터베이스 - 더 세밀한 색상값 추가
  const colors = {
    // 무채색 계열
    검정: [0, 0, 0],
    진회색: [64, 64, 64],
    회색: [128, 128, 128],
    연회색: [192, 192, 192],
    흰색: [255, 255, 255],

    // 빨간계열
    빨강: [255, 0, 0],
    진빨강: [139, 0, 0],
    밝은빨강: [255, 69, 0],

    // 주황계열
    주황: [255, 165, 0],
    진주황: [255, 140, 0],
    연주황: [255, 200, 140],
    귤색: [255, 128, 0],
    토마토: [255, 99, 71],

    // 노란계열
    노랑: [255, 255, 0],
    연노랑: [255, 255, 224],
    골드: [255, 215, 0],

    // 초록계열
    초록: [0, 128, 0],
    라임: [50, 205, 50],
    연두: [144, 238, 144],
    올리브: [128, 128, 0],
    진초록: [0, 100, 0],

    // 파란계열
    파랑: [0, 0, 255],
    하늘: [135, 206, 235],
    네이비: [0, 0, 128],
    코발트: [0, 71, 171],

    // 보라계열
    보라: [128, 0, 128],
    자주: [186, 85, 211],
    라벤더: [230, 230, 250],

    // 갈색계열
    갈색: [139, 69, 19],
    연갈색: [210, 180, 140],
    베이지: [245, 245, 220],
  };

  // HSV 변환
  const [h, s, v] = rgbToHsv(r, g, b);

  // 무채색 처리 (더 엄격한 기준 적용)
  if (s < 0.1) {
    // 채도가 매우 낮은 경우
    if (v > 0.95) return "흰색";
    if (v < 0.1) return "검정";
    if (v < 0.3) return "진회색";
    if (v < 0.7) return "회색";
    if (v < 0.9) return "연회색";
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
      hueDistance * 18 + // 색상 차이에 더 높은 가중치
      satDistance * 10 + // 채도 차이 가중치 증가
      valDistance * 7; // 명도 차이 가중치 증가

    // 특정 색상 범위에 대한 추가 처리
    if (h >= 0.95 || h <= 0.05) {
      // 빨간색 계열
      distance *= 0.8; // 빨간색 판별 민감도 증가
    }

    if (h >= 0.05 && h <= 0.11) {
      // 주황색 계열
      const orangeWeight = 1 - Math.abs(h - 0.08) / 0.03; // 주황색 중심 가중치
      distance *= 1 + orangeWeight * 0.3;
    }

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = name;
    }
  }

  // 특정 색상 범위에 대한 후처리
  if (s < 0.15 && v > 0.9) return "흰색";
  if (s < 0.15 && v < 0.1) return "검정";

  // 주황계열 추가 검증
  if (closestColor === "토마토" || closestColor === "주황") {
    const orangeHue = h >= 0.05 && h <= 0.11;
    const highSat = s >= 0.7;
    const highVal = v >= 0.8;

    if (!orangeHue || !highSat || !highVal) {
      // 주황 조건에 맞지 않으면 다른 가까운 색상 찾기
      return findNextClosestColor(r, g, b, colors, ["토마토", "주황"]);
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

// 캔버스 클릭 이벤트 처리 수정
canvas.addEventListener("click", function (e) {
  e.preventDefault(); // 기본 클릭 동작 방지
  e.stopPropagation(); // 이벤트 전파 중지

  const rect = canvas.getBoundingClientRect();

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

    // 터치 좌표 계산 개선
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // 캔버스 크기에 맞게 좌표 조정
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const scaledX = x * scaleX;
    const scaledY = y * scaleY;

    try {
      const imageData = ctx.getImageData(
        Math.floor(scaledX),
        Math.floor(scaledY),
        1,
        1
      ).data;
      const [r, g, b] = imageData;
      const hex = `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

      colorPreview.style.backgroundColor = hex;
      const colorName = getColorName(r, g, b);
      colorValue.textContent = `${colorName} (${hex})`;
    } catch (error) {
      console.error("색상 추출 중 오류 발생:", error);
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
