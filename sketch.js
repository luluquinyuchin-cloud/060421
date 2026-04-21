let capture;
let pg; // 宣告繪圖圖層
let videoBuffer; // 專門用來處理濾鏡的圖層
let saveBtn, filterBtn; // 儲存與濾鏡按鈕
let bubbles = []; // 儲存泡泡物件的陣列

let vW, vH; // 用於儲存計算後的等比例寬高

// 濾鏡相關變數
let filterIndex = 0;
const filterNames = ['原始', '黑白', '馬賽模糊'];

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

  pg.fill(255);
  pg.noStroke();
  pg.textSize(24);
  pg.textAlign(CENTER, CENTER);
  pg.text("Filter: " + filterNames[filterIndex], pg.width / 2, pg.height / 2);

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

function applySelectedFilter(buffer) {
  if (filterIndex === 1) buffer.filter(GRAY);
  else if (filterIndex === 2) buffer.filter(BLUR, 8);
}

function positionButton(x, y, vW, vH) {
  // 計算按鈕位置，並排放在視訊畫面下方 20px 處
  let btnY = y + vH + 20;
  let centerX = width / 2;
  saveBtn.position(centerX - saveBtn.width - 10, btnY);
  filterBtn.position(centerX + 10, btnY);
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