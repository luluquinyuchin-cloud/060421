let capture;
let pg; // 宣告繪圖圖層

function setup() {
  // 1. 產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 2. 擷取攝影機影像
  capture = createCapture(VIDEO);
  // 隱藏預設產生的 HTML video 元件，我們只在 canvas 上繪製
  capture.hide();

  // 創建一個與視訊顯示大小相同的圖層
  pg = createGraphics(width * 0.6, height * 0.6);
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

  // 6. 將影像繪製在畫布中間 (並修正左右顛倒/鏡像問題)
  push(); // 儲存目前的繪圖設定
  translate(x + videoW, y); // 將原點移至影像顯示區域的右上角
  scale(-1, 1); // 水平翻轉座標系
  image(capture, 0, 0, videoW, videoH); // 繪製影像，此時 0,0 會對應到翻轉後的座標
  pop(); // 恢復先前的繪圖設定，避免影響後續的繪圖

  // 7. 在 pg 圖層上繪製內容 (例如：文字或邊框)
  pg.clear(); // 清除上一影格的內容，保持背景透明
  pg.stroke(255);
  pg.strokeWeight(4);
  pg.noFill();
  pg.rect(0, 0, pg.width, pg.height); // 畫一個框在圖層邊緣
  pg.fill(255);
  pg.noStroke();
  pg.textSize(24);
  pg.textAlign(CENTER, CENTER);
  pg.text("Overlay Content", pg.width / 2, pg.height / 2);

  // 8. 將 pg 圖層顯示在視訊畫面的上方
  image(pg, x, y);
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
  // 同步調整圖層大小
  pg.resizeCanvas(width * 0.6, height * 0.6);
}