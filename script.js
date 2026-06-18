"use strict";

/* =========================================================
   カラーコード定義
   各色: 表示用hex / 数字 / 乗数 / 許容差(%) / 温度係数(ppm/K)
   null = その役割では使用不可
   ========================================================= */
const COLORS = {
  black:  { name: "黒",   hex: "#1b1b1b", digit: 0,    mult: 1,        tol: null, tc: null,  light: false },
  brown:  { name: "茶",   hex: "#7d4a23", digit: 1,    mult: 10,       tol: 1,    tc: 100,   light: false },
  red:    { name: "赤",   hex: "#d33a2c", digit: 2,    mult: 100,      tol: 2,    tc: 50,    light: false },
  orange: { name: "橙",   hex: "#ef7d18", digit: 3,    mult: 1e3,      tol: null, tc: 15,    light: false },
  yellow: { name: "黄",   hex: "#f5c518", digit: 4,    mult: 1e4,      tol: null, tc: 25,    light: true  },
  green:  { name: "緑",   hex: "#3a9b46", digit: 5,    mult: 1e5,      tol: 0.5,  tc: 20,    light: false },
  blue:   { name: "青",   hex: "#2767c9", digit: 6,    mult: 1e6,      tol: 0.25, tc: 10,    light: false },
  violet: { name: "紫",   hex: "#7b3fc4", digit: 7,    mult: 1e7,      tol: 0.1,  tc: 5,     light: false },
  grey:   { name: "灰",   hex: "#9aa0a6", digit: 8,    mult: 1e8,      tol: 0.05, tc: 1,     light: true  },
  white:  { name: "白",   hex: "#f4f4f4", digit: 9,    mult: 1e9,      tol: null, tc: null,  light: true  },
  gold:   { name: "金",   hex: "#c9a227", digit: null, mult: 0.1,      tol: 5,    tc: null,  light: false },
  silver: { name: "銀",   hex: "#c2cad4", digit: null, mult: 0.01,     tol: 10,   tc: null,  light: true  },
};

// 各役割で選べる色
const DIGIT_COLORS = ["black","brown","red","orange","yellow","green","blue","violet","grey","white"];
const MULT_COLORS  = ["black","brown","red","orange","yellow","green","blue","violet","grey","white","gold","silver"];
const TOL_COLORS   = ["brown","red","green","blue","violet","grey","gold","silver"];
const TC_COLORS    = ["black","brown","red","orange","yellow","green","blue","violet","grey"];

// E24標準値(1桁台)
const E24 = [1.0,1.1,1.2,1.3,1.5,1.6,1.8,2.0,2.2,2.4,2.7,3.0,3.3,3.6,3.9,4.3,4.7,5.1,5.6,6.2,6.8,7.5,8.2,9.1];
const E12 = [1.0,1.2,1.5,1.8,2.2,2.7,3.3,3.9,4.7,5.6,6.8,8.2];

/* =========================================================
   バンド構成（バンド数ごとの役割）
   ========================================================= */
function bandRoles(count) {
  if (count === 4) return ["digit","digit","mult","tol"];
  if (count === 5) return ["digit","digit","digit","mult","tol"];
  return ["digit","digit","digit","mult","tol","tc"];
}
const ROLE_INFO = {
  digit: { label: "数字", colors: DIGIT_COLORS },
  mult:  { label: "乗数", colors: MULT_COLORS },
  tol:   { label: "許容差", colors: TOL_COLORS },
  tc:    { label: "温度係数", colors: TC_COLORS },
};

// デフォルトの色（よくある 220Ω 5% など見栄えする初期値）
const DEFAULTS = {
  4: ["red","red","brown","gold"],          // 220Ω ±5%
  5: ["brown","black","black","brown","brown"], // 1.00kΩ ±1%
  6: ["brown","black","black","brown","brown","brown"], // 1.00kΩ ±1% 100ppm
};

/* =========================================================
   状態
   ========================================================= */
let bandCount = 4;
let bands = [...DEFAULTS[4]]; // 色キーの配列
let activeBandIndex = null;

/* =========================================================
   DOM参照
   ========================================================= */
const $ = (id) => document.getElementById(id);
const bandsGroup = $("bands-group");
const palette = $("palette");
const paletteGrid = $("palette-grid");
const paletteTitle = $("palette-title");

/* =========================================================
   抵抗バンドの描画
   ========================================================= */
function renderBands() {
  const roles = bandRoles(bandCount);
  bandsGroup.innerHTML = "";

  // 本体の描画領域 x:[150,570]、左右に余白を取る
  const startX = 205;
  const endX = 515;
  const span = endX - startX;
  const n = roles.length;
  // tol(と tc)は端側にまとめる：全体を均等配置しつつ最後のバンドは少し離す
  const bandW = 26;
  // 均等配置の中心位置を計算
  const positions = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    positions.push(startX + t * span);
  }

  roles.forEach((role, i) => {
    const colorKey = bands[i];
    const color = COLORS[colorKey];
    const cx = positions[i];
    const x = cx - bandW / 2;

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "band" + (activeBandIndex === i ? " selected-band" : ""));
    g.setAttribute("data-index", i);
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.setAttribute("aria-label", `${i + 1}番目のバンド（${ROLE_INFO[role].label}）: ${color ? color.name : "未設定"}`);

    // グロー
    const glow = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    glow.setAttribute("class", "band-glow");
    glow.setAttribute("x", x - 4);
    glow.setAttribute("y", 48);
    glow.setAttribute("width", bandW + 8);
    glow.setAttribute("height", 124);
    glow.setAttribute("rx", 8);
    glow.setAttribute("fill", "none");
    glow.setAttribute("stroke", "#fff");
    glow.setAttribute("stroke-width", "2");
    glow.setAttribute("opacity", "0.0");
    g.appendChild(glow);

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", 55);
    rect.setAttribute("width", bandW);
    rect.setAttribute("height", 110);
    rect.setAttribute("rx", 4);
    rect.setAttribute("fill", color ? color.hex : "#888");
    g.appendChild(rect);

    bandsGroup.appendChild(g);
  });
}

/* =========================================================
   抵抗値の計算
   ========================================================= */
function computeResistance() {
  const roles = bandRoles(bandCount);
  let digits = "";
  let mult = 1;
  let tol = null;
  let tc = null;

  roles.forEach((role, i) => {
    const c = COLORS[bands[i]];
    if (!c) return;
    if (role === "digit") digits += String(c.digit);
    else if (role === "mult") mult = c.mult;
    else if (role === "tol") tol = c.tol;
    else if (role === "tc") tc = c.tc;
  });

  const baseValue = parseInt(digits || "0", 10);
  const ohms = baseValue * mult;
  return { ohms, tol, tc, digits, baseValue };
}

// Ω/kΩ/MΩ/GΩ に整形
function formatOhms(ohms) {
  if (ohms === 0) return { value: "0", unit: "Ω" };
  let unit = "Ω", v = ohms;
  if (ohms >= 1e9) { v = ohms / 1e9; unit = "GΩ"; }
  else if (ohms >= 1e6) { v = ohms / 1e6; unit = "MΩ"; }
  else if (ohms >= 1e3) { v = ohms / 1e3; unit = "kΩ"; }
  // 余計な小数を削る
  let s = v.toPrecision(6).replace(/\.?0+$/, "");
  if (s.includes(".")) s = String(parseFloat(s));
  return { value: s, unit };
}

// E系列判定（E12はE24の部分集合。仮数を1.0〜9.9に正規化して判定）
function detectESeries(baseValue) {
  if (baseValue <= 0) return "—";
  let m = baseValue;
  while (m >= 10) m /= 10;
  const near = (arr) => arr.some((x) => Math.abs(x - m) < 0.05);
  if (near(E12)) return "E12";
  if (near(E24)) return "E24";
  return "規格外";
}

/* =========================================================
   結果の表示更新
   ========================================================= */
function updateResult() {
  const { ohms, tol, tc, baseValue } = computeResistance();
  const f = formatOhms(ohms);

  $("resistance-main").textContent = f.value;
  $("resistance-unit").textContent = f.unit;

  $("tolerance-value").textContent = tol == null ? "±20%" : `±${tol}%`;

  // 範囲
  if (tol != null && ohms > 0) {
    const lo = formatOhms(ohms * (1 - tol / 100));
    const hi = formatOhms(ohms * (1 + tol / 100));
    $("range-value").textContent = `${lo.value}${lo.unit} 〜 ${hi.value}${hi.unit}`;
  } else {
    $("range-value").textContent = "—";
  }

  // 温度係数
  const tcItem = $("tempco-item");
  if (bandCount === 6) {
    tcItem.hidden = false;
    $("tempco-value").textContent = tc == null ? "—" : `${tc} ppm/K`;
  } else {
    tcItem.hidden = true;
  }

  $("eseries-value").textContent = detectESeries(baseValue);

  renderLegend();
}

/* =========================================================
   バンド凡例の描画
   ========================================================= */
function renderLegend() {
  const roles = bandRoles(bandCount);
  const legend = $("band-legend");
  legend.innerHTML = "";
  roles.forEach((role, i) => {
    const c = COLORS[bands[i]];
    let meaning = "";
    if (role === "digit") meaning = `数字 ${c.digit}`;
    else if (role === "mult") meaning = `×${c.mult >= 1 ? c.mult.toLocaleString() : c.mult}`;
    else if (role === "tol") meaning = c.tol != null ? `±${c.tol}%` : "—";
    else if (role === "tc") meaning = c.tc != null ? `${c.tc}ppm/K` : "—";

    const item = document.createElement("div");
    item.className = "legend-item";
    item.innerHTML = `
      <span class="legend-swatch" style="background:${c.hex}"></span>
      <span class="legend-text"><b>${i + 1}. ${c.name}</b> <span>${meaning}</span></span>
    `;
    legend.appendChild(item);
  });
}

/* =========================================================
   パレット ポップオーバー
   ========================================================= */
function openPalette(index, anchorEl) {
  activeBandIndex = index;
  const roles = bandRoles(bandCount);
  const role = roles[index];
  const info = ROLE_INFO[role];

  paletteTitle.textContent = `${index + 1}番目のバンド — ${info.label}`;
  paletteGrid.innerHTML = "";

  info.colors.forEach((key) => {
    const c = COLORS[key];
    const sw = document.createElement("button");
    sw.className = "swatch" + (bands[index] === key ? " active" : "");
    sw.style.background = c.hex;
    sw.setAttribute("data-light", c.light ? "true" : "false");
    sw.setAttribute("type", "button");
    sw.setAttribute("title", c.name);
    sw.innerHTML = `<span class="sw-label">${c.name}</span>`;
    sw.addEventListener("click", () => {
      bands[index] = key;
      closePalette();
      renderBands();
      updateResult();
    });
    paletteGrid.appendChild(sw);
  });

  palette.hidden = false;
  positionPalette(anchorEl);
  renderBands(); // selected-band の表示更新
}

function positionPalette(anchorEl) {
  const rect = anchorEl.getBoundingClientRect();
  const pw = palette.offsetWidth;
  const ph = palette.offsetHeight;
  let left = rect.left + rect.width / 2 - pw / 2 + window.scrollX;
  let top = rect.bottom + 10 + window.scrollY;

  // 画面外に出ないよう調整
  left = Math.max(12 + window.scrollX, Math.min(left, window.scrollX + document.documentElement.clientWidth - pw - 12));
  // 下に入らなければ上に出す
  if (rect.bottom + ph + 14 > window.innerHeight) {
    top = rect.top - ph - 10 + window.scrollY;
  }
  palette.style.left = `${left}px`;
  palette.style.top = `${top}px`;
}

function closePalette() {
  palette.hidden = true;
  activeBandIndex = null;
  renderBands();
}

/* =========================================================
   イベント
   ========================================================= */
bandsGroup.addEventListener("click", (e) => {
  const g = e.target.closest(".band");
  if (!g) return;
  const idx = parseInt(g.getAttribute("data-index"), 10);
  openPalette(idx, g);
});
bandsGroup.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const g = e.target.closest(".band");
  if (!g) return;
  e.preventDefault();
  const idx = parseInt(g.getAttribute("data-index"), 10);
  openPalette(idx, g);
});

document.addEventListener("click", (e) => {
  if (palette.hidden) return;
  if (palette.contains(e.target)) return;
  if (e.target.closest(".band")) return;
  closePalette();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePalette();
});
window.addEventListener("resize", () => { if (!palette.hidden) closePalette(); });

$("band-count").addEventListener("change", (e) => {
  bandCount = parseInt(e.target.value, 10);
  bands = [...DEFAULTS[bandCount]];
  closePalette();
  renderBands();
  updateResult();
});

/* =========================================================
   LED 電流制限抵抗 計算
   ========================================================= */
function nearestE24(ohms) {
  if (ohms <= 0) return null;
  // 仮数と桁を出して最も近いE24値を探す
  const decade = Math.floor(Math.log10(ohms));
  let best = null, bestDiff = Infinity;
  for (let d = decade - 1; d <= decade + 1; d++) {
    for (const m of E24) {
      const v = m * Math.pow(10, d);
      const diff = Math.abs(v - ohms);
      if (diff < bestDiff) { bestDiff = diff; best = v; }
    }
  }
  return best;
}

function updateLED() {
  const vs = parseFloat($("led-vs").value);
  const vf = parseFloat($("led-vf").value);
  const ima = parseFloat($("led-if").value);
  const rEl = $("led-r");
  const e24El = $("led-e24");
  const powEl = $("led-power");
  const wattEl = $("led-wattage");
  const formulaEl = $("led-formula");

  if (![vs, vf, ima].every((x) => Number.isFinite(x))) {
    rEl.textContent = "—"; rEl.classList.remove("invalid");
    e24El.textContent = powEl.textContent = wattEl.textContent = "—";
    formulaEl.textContent = "";
    return;
  }
  if (ima <= 0) {
    rEl.textContent = "電流を入力してください"; rEl.classList.add("invalid");
    e24El.textContent = powEl.textContent = wattEl.textContent = "—";
    formulaEl.textContent = "";
    return;
  }
  if (vf >= vs) {
    rEl.textContent = "V_S は V_F より大きく"; rEl.classList.add("invalid");
    e24El.textContent = powEl.textContent = wattEl.textContent = "—";
    formulaEl.textContent = `(V_S − V_F) = ${(vs - vf).toFixed(2)} V では電流を流せません`;
    return;
  }

  rEl.classList.remove("invalid");
  const amps = ima / 1000;
  const r = (vs - vf) / amps;
  const power = (vs - vf) * amps;

  const rf = formatOhms(r);
  rEl.textContent = `${rf.value} ${rf.unit}`;

  const e24 = nearestE24(r);
  const e24f = formatOhms(e24);
  // E24で実際に流れる電流
  const actualMa = ((vs - vf) / e24) * 1000;
  e24El.textContent = `${e24f.value} ${e24f.unit}（実電流 ${actualMa.toFixed(1)} mA）`;

  powEl.textContent = `${power < 1 ? (power * 1000).toFixed(0) + " mW" : power.toFixed(2) + " W"}`;

  const recommended = power * 2;
  wattEl.textContent = formatWattage(recommended);

  formulaEl.textContent =
    `R = (V_S − V_F) / I_F = (${vs} − ${vf}) / ${amps} A = ${rf.value} ${rf.unit} ／ ` +
    `P = (V_S − V_F) × I_F = ${power < 1 ? (power * 1000).toFixed(0) + " mW" : power.toFixed(2) + " W"}`;
}

function formatWattage(w) {
  // 一般的な定格に切り上げ
  const standards = [0.0625, 0.125, 0.25, 0.5, 1, 2, 3, 5, 10];
  const labels = { 0.0625: "1/16W", 0.125: "1/8W", 0.25: "1/4W", 0.5: "1/2W", 1: "1W", 2: "2W", 3: "3W", 5: "5W", 10: "10W" };
  for (const s of standards) {
    if (w <= s) return `${labels[s]} 以上`;
  }
  return `${w.toFixed(1)}W 以上`;
}

["led-vs", "led-vf", "led-if"].forEach((id) => {
  $(id).addEventListener("input", updateLED);
});

/* =========================================================
   Xシェアボタン
   ========================================================= */
function setupShare() {
  const btn = $("share-x");
  if (!btn) return;
  const url = location.href.split("#")[0];
  const text = "抵抗カラーコード デコーダー｜バンドをクリックするだけで抵抗値を計算できるツール";
  const intent =
    "https://twitter.com/intent/tweet?" +
    "text=" + encodeURIComponent(text) +
    "&url=" + encodeURIComponent(url) +
    "&hashtags=" + encodeURIComponent("電子工作,抵抗");
  btn.setAttribute("href", intent);
}

/* =========================================================
   初期化
   ========================================================= */
renderBands();
updateResult();
updateLED();
setupShare();
