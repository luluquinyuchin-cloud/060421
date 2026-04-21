let capture;

function setup() {
  // 1. 產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 2. 擷取攝影機影像
  capture = createCapture(VIDEO);
  // 隱藏預設產生的 HTML video 元件，我們只在 canvas 上繪製
  capture.hide();
}

function draw() {
  // 3. 設定背景顏色為 e7c6ff
  background('#e7c6ff');

  // 4. 計算顯示影像的寬高 (整個畫布寬高的 60%)
  let videoW = width * 0.6;
  let videoH = height * 0.6;

  // 5. 計算置中的座標位置
  let x = (width - videoW) / 2;
  let y = (height - videoH) / 2;

  // 6. 將影像繪製在畫布中間
  image(capture, x, y, videoW, videoH);
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}