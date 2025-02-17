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
  // 확장된 색상 데이터베이스
  const colors = {
    // 빨간계열
    빨강: [255, 0, 0],
    진빨강: [139, 0, 0],
    밝은빨강: [255, 69, 0],
    산호색: [255, 127, 80],

    // 분홍계열
    분홍: [255, 192, 203],
    핫핑크: [255, 105, 180],
    딥핑크: [255, 20, 147],
    연분홍: [255, 182, 193],

    // 주황계열
    주황: [255, 165, 0],
    진주황: [255, 140, 0],
    연주황: [255, 218, 185],

    // 노란계열
    노랑: [255, 255, 0],
    연노랑: [255, 255, 224],
    골드: [255, 215, 0],
    카키: [240, 230, 140],

    // 초록계열
    초록: [0, 128, 0],
    라임: [0, 255, 0],
    연두: [144, 238, 144],
    올리브: [128, 128, 0],
    진초록: [0, 100, 0],

    // 청록계열
    청록: [0, 255, 255],
    터콰이즈: [64, 224, 208],

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

  for (let name in colors) {
    const [cr, cg, cb] = colors[name];
    const [ch, cs, cv] = rgbToHsv(cr, cg, cb);

    // 색상 거리 계산 개선
    let hueDistance = Math.min(Math.abs(h - ch), 1 - Math.abs(h - ch));
    let satDistance = Math.abs(s - cs);
    let valDistance = Math.abs(v - cv);

    // 가중치 적용
    const distance =
      hueDistance * 10 + // 색상(hue)에 높은 가중치
      satDistance * 5 + // 채도(saturation)에 중간 가중치
      valDistance * 3; // 명도(value)에 낮은 가중치

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = name;
    }
  }

  // 무채색 특별 처리 개선
  if (s < 0.12) {
    // 채도가 매우 낮은 경우
    if (v > 0.9) return "흰색";
    if (v < 0.16) return "검정";
    if (v < 0.4) return "진회색";
    if (v < 0.7) return "회색";
    if (v < 0.9) return "연회색";
    return "흰색";
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

// 캔버스 클릭 이벤트 처리
canvas.addEventListener("click", function (e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const imageData = ctx.getImageData(x, y, 1, 1).data;
  const [r, g, b] = imageData;
  const hex = `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

  colorPreview.style.backgroundColor = hex;
  const colorName = getColorName(r, g, b);
  colorValue.textContent = `${colorName} (${hex})`;
});
