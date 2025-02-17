const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colorPreview = document.getElementById("colorPreview");
const colorValue = document.getElementById("colorValue");
const imageUpload = document.getElementById("imageUpload");

// 이미지 업로드 처리
imageUpload.addEventListener("change", function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// 색상 추출 함수
function getColorName(r, g, b) {
  // 확장된 색상 데이터베이스 - 더 세분화된 색상값 추가
  const colors = {
    // 빨간계열
    빨강: [255, 0, 0],
    진빨강: [139, 0, 0],
    밝은빨강: [255, 69, 0],
    토마토: [255, 99, 71],

    // 분홍계열
    분홍: [255, 192, 203],
    핫핑크: [255, 105, 180],
    딥핑크: [255, 20, 147],
    연분홍: [255, 182, 193],
    살구색: [255, 218, 185],

    // 주황계열
    주황: [255, 165, 0],
    진주황: [255, 140, 0],
    연주황: [255, 218, 185],
    귤색: [255, 128, 0],

    // 노란계열
    노랑: [255, 255, 0],
    연노랑: [255, 255, 224],
    골드: [255, 215, 0],
    레몬: [255, 250, 205],

    // 초록계열
    초록: [0, 128, 0],
    라임: [50, 205, 50],
    연두: [144, 238, 144],
    올리브: [128, 128, 0],
    진초록: [0, 100, 0],
    민트: [189, 252, 201],

    // 청록계열
    청록: [0, 206, 209],
    터콰이즈: [64, 224, 208],
    아쿠아: [0, 255, 255],

    // 파란계열
    파랑: [0, 0, 255],
    하늘: [135, 206, 235],
    네이비: [0, 0, 128],
    로얄블루: [65, 105, 225],
    코발트: [0, 71, 171],

    // 보라계열
    보라: [128, 0, 128],
    자주: [186, 85, 211],
    라벤더: [230, 230, 250],
    진보라: [75, 0, 130],

    // 갈색계열
    갈색: [165, 42, 42],
    진갈색: [139, 69, 19],
    연갈색: [210, 180, 140],
    초콜릿: [139, 69, 19],

    // 무채색계열
    검정: [0, 0, 0],
    회색: [128, 128, 128],
    진회색: [64, 64, 64],
    연회색: [192, 192, 192],
    흰색: [255, 255, 255],

    // 기타
    베이지: [245, 245, 220],
    아이보리: [255, 255, 240],
    세피아: [112, 66, 20],
  };

  // HSV 색상 공간으로 변환
  const [h, s, v] = rgbToHsv(r, g, b);

  let closestColor = "";
  let minDistance = Infinity;

  // 무채색 특별 처리 개선 (먼저 처리)
  if (s < 0.15) {
    if (v > 0.95) return "흰색";
    if (v < 0.12) return "검정";
    if (v < 0.3) return "진회색";
    if (v < 0.7) return "회색";
    if (v < 0.9) return "연회색";
    return "흰색";
  }

  for (let name in colors) {
    const [cr, cg, cb] = colors[name];
    const [ch, cs, cv] = rgbToHsv(cr, cg, cb);

    // 색상 거리 계산 개선
    let hueDistance = Math.min(Math.abs(h - ch), 1 - Math.abs(h - ch));
    let satDistance = Math.abs(s - cs);
    let valDistance = Math.abs(v - cv);

    // 가중치 조정
    const distance =
      hueDistance * 15 + // 색상(hue) 가중치 증가
      satDistance * 8 + // 채도(saturation) 가중치 증가
      valDistance * 5; // 명도(value) 가중치 조정

    // 색상 범위에 따른 추가 가중치
    if (s < 0.2) {
      // 채도가 낮은 경우
      distance *= 1.5; // 무채색에 가까운 색상은 거리를 더 멀게
    }

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = name;
    }
  }

  // 특정 색상 범위에 대한 후처리
  if (s < 0.2 && v > 0.9) {
    return "흰색";
  }
  if (s < 0.2 && v < 0.2) {
    return "검정";
  }

  return closestColor;
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

  const imageData = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
  const [r, g, b] = imageData;
  const hex = `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

  colorPreview.style.backgroundColor = hex;
  const colorName = getColorName(r, g, b);
  colorValue.textContent = `${colorName} (${hex})`;
});

// 터치 이벤트 수정
canvas.addEventListener("touchstart", function (e) {
  e.preventDefault(); // 기본 터치 동작 방지

  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];

  // 스크롤 위치 고려
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;

  // 캔버스의 실제 크기와 표시되는 크기의 비율 계산
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  // 터치 좌표를 캔버스 내부 좌표로 변환 (스크롤 위치 반영)
  const x = (touch.clientX + scrollX - rect.left) * scaleX;
  const y = (touch.clientY + scrollY - rect.top) * scaleY;

  // 범위를 벗어나는 터치 처리
  if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
    return;
  }

  const imageData = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
  const [r, g, b] = imageData;
  const hex = `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

  colorPreview.style.backgroundColor = hex;
  const colorName = getColorName(r, g, b);
  colorValue.textContent = `${colorName} (${hex})`;
});
