let capture;
let pg; // 宣告繪圖圖層
let videoBuffer; // 專門用來處理濾鏡的圖層
let saveBtn, filterBtn, decoBtn; // 儲存、濾鏡與裝飾按鈕
let bubbles = []; // 儲存泡泡物件的陣列

let vW, vH; // 用於儲存計算後的等比例寬高

// 濾鏡相關變數
let filterIndex = 0;
const filterNames = ['原始', '黑白', '馬賽模糊'];

// 裝飾相關變數
let decoIndex = 0;
const decoNames = ['無', '🎀 蝴蝶結', '❤️ 愛心', '✨ 邊框'];

class Bubble {
  constructor(w, h) {
    this.x = random(w);
    this.y = h + random(10, 50); // 從畫面下方外側生成
    this.r = random(5, 15);      // 隨機半徑
    this.speed = random(0.8, 2.5); // 往上飄的速度
    this.noiseOffset = random(1000); // 用於產生更自然的擺動
    this.alpha = random(50, 150);    // 隨機透明度
  }

  move() {
    this.y -= this.speed; // 向上移動
    // 使用 noise 讓水平擺動更絲滑
    this.x += (noise(this.noiseOffset + frameCount * 0.02) - 0.5) * 2;
  }

  display(g) {
    g.push();
    g.noStroke();
    // 泡泡主體
    g.fill(255, this.alpha * 0.5);
    g.circle(this.x, this.y, this.r * 2);
    // 增加一個白色高光點，讓泡泡有立體感
    g.fill(255, this.alpha);
    g.circle(this.x - this.r * 0.3, this.y - this.r * 0.3, this.r * 0.4);
    g.pop();
  }
}

function setup() {
  // 1. 產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 2. 擷取攝影機影像
  capture = createCapture(VIDEO);
  // 隱藏預設產生的 HTML video 元件，我們只在 canvas 上繪製
  capture.hide();

  // 創建一個與視訊顯示大小相同的圖層
  pg = createGraphics(100, 100); // 初始大小，draw 中會重新調整
  videoBuffer = createGraphics(100, 100);

  // 創建按鈕並設定位置與事件處理
  saveBtn = createButton('📸 拍照');
  saveBtn.mousePressed(saveScreenshot);

  filterBtn = createButton('✨ 切換濾鏡: 原始');
  filterBtn.mousePressed(nextFilter);

  decoBtn = createButton('🎀 裝飾: 無');
  decoBtn.mousePressed(nextDeco);

  positionButton();
}

function draw() {
  // 3. 設定背景顏色為 e7c6ff
  background('#8d99ae');

  // 4. 計算等比例顯示影像的寬高 (限制在畫布寬高的 60% 內)
  let maxWidth = width * 0.6;
  let maxHeight = height * 0.6;
  
  if (capture.width > 0) {
    let aspect = capture.width / capture.height;
    vW = maxWidth;
    vH = vW / aspect;
    if (vH > maxHeight) {
      vH = maxHeight;
      vW = vH * aspect;
    }
  } else {
    vW = maxWidth;
    vH = maxHeight;
  }

  // 同步調整 pg 圖層大小以符合比例
  if (pg.width !== floor(vW) || pg.height !== floor(vH)) {
    pg.resizeCanvas(vW, vH);
    videoBuffer.resizeCanvas(vW, vH);
  }

  // 5. 計算置中的座標位置
  let x = (width - vW) / 2;
  let y = (height - vH) / 2;

  // 6. 處理視訊影像與濾鏡
  videoBuffer.push();
  videoBuffer.translate(vW, 0);
  videoBuffer.scale(-1, 1);
  videoBuffer.image(capture, 0, 0, vW, vH);
  videoBuffer.pop();

  // 根據選擇套用濾鏡
  applySelectedFilter(videoBuffer);

  // 將處理好的視訊繪製到主畫布
  image(videoBuffer, x, y);

  // 7. 在 pg 圖層上繪製內容 (例如：文字或邊框)
  pg.clear(); // 清除上一影格的內容，保持背景透明
  
  // 生成新泡泡
  if (frameCount % 10 === 0) {
    bubbles.push(new Bubble(pg.width, pg.height));
  }

  // 更新並顯示泡泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].move();
    bubbles[i].display(pg);
    // 如果泡泡飄出畫面頂端，就從陣列移除
    if (bubbles[i].y < -20) bubbles.splice(i, 1);
  }

  // 繪製裝飾特效
  drawDecoration(pg);

  // 繪製濾鏡文字排版 (移至左上角)
  pg.push();
  pg.noStroke();
  pg.fill(0, 100); // 半透明深色背景
  pg.rect(0, 0, 140, 35, 0, 0, 10, 0); // 文字底框
  pg.fill(255);
  pg.textSize(16);
  pg.textAlign(LEFT, CENTER);
  pg.text("✨ " + filterNames[filterIndex], 15, 18);
  pg.pop();

  // 8. 將 pg 圖層顯示在視訊畫面的上方
  image(pg, x, y);

  // 9. 確保按鈕位置正確 (只有在尺寸計算出來後才移動)
  if (vW > 0) {
    positionButton(x, y, vW, vH);
  }
}

function nextFilter() {
  filterIndex = (filterIndex + 1) % filterNames.length;
  filterBtn.html('✨ 切換濾鏡: ' + filterNames[filterIndex]);
}

function nextDeco() {
  decoIndex = (decoIndex + 1) % decoNames.length;
  decoBtn.html('🎀 裝飾: ' + decoNames[decoIndex]);
}

function drawDecoration(g) {
  if (decoIndex === 1) { // 蝴蝶結
    g.push();
    g.translate(g.width - 60, g.height - 50); // 移至右下角
    g.fill(255, 100, 150); // 粉紅色
    g.noStroke();
    // 左右兩邊三角形
    g.triangle(0, 0, -40, -25, -40, 25);
    g.triangle(0, 0, 50, -30, 50, 30);
    // 中間圓結
    g.fill(255, 150, 180);
    g.ellipse(0, 0, 25, 25);
    g.pop();
  } else if (decoIndex === 2) { // 愛心
    g.push();
    g.translate(g.width - 60, 60); // 移至右上角
    g.fill(255, 50, 50, 200); // 半透明紅色
    g.noStroke();
    g.beginShape();
    for (let a = 0; a < TWO_PI; a += 0.1) {
      let r = 3; // 愛心縮小一點，當作點綴
      let dx = r * 16 * pow(sin(a), 3);
      let dy = -r * (13 * cos(a) - 5 * cos(2 * a) - 2 * cos(3 * a) - cos(4 * a));
      g.vertex(dx, dy);
    }
    g.endShape(CLOSE);
    g.pop();
  } else if (decoIndex === 3) { // 邊框裝飾
    g.push();
    g.stroke(255, 200, 200, 200); // 淺粉色半透明線條
    g.strokeWeight(4);
    g.noFill();
    let len = 30; // 邊框轉角長度
    let p = 15;   // 離邊緣的間距
    // 左上角
    g.line(p, p, p + len, p);
    g.line(p, p, p, p + len);
    // 右上角
    g.line(g.width - p, p, g.width - p - len, p);
    g.line(g.width - p, p, g.width - p, p + len);
    // 左下角
    g.line(p, g.height - p, p + len, g.height - p);
    g.line(p, g.height - p, p, g.height - p - len);
    // 右下角
    g.line(g.width - p, g.height - p, g.width - p - len, g.height - p);
    g.line(g.width - p, g.height - p, g.width - p, g.height - p - len);
    g.pop();
  }
}

function applySelectedFilter(buffer) {
  if (filterIndex === 1) buffer.filter(GRAY);
  else if (filterIndex === 2) buffer.filter(BLUR, 8);
}

function positionButton(x, y, vW, vH) {
  let btnY = y + vH + 25;
  saveBtn.position(width / 2 - 180, btnY);
  filterBtn.position(width / 2 - 60, btnY);
  decoBtn.position(width / 2 + 100, btnY);
}

function saveScreenshot() {
  let x = (width - vW) / 2;
  let y = (height - vH) / 2;
  // 從畫布擷取該區域
  let img = get(x, y, vW, vH);
  save(img, 'screenshot.jpg');
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}