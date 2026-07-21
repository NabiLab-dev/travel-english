/* 우리집 여행영어 — 앱 로직 (서버 없음, localStorage 저장) */
"use strict";

const NEW_PER_DAY = 3;        // 하루 새 문장 수
const MAX_REVIEWS = 8;        // 하루 최대 복습 수
const INTERVALS = [1, 3, 7, 14, 30, 60]; // 레벨별 다음 복습 간격(일)

const app = document.getElementById("app");
let currentProfile = null;
let audioPlayer = null;
let countdownTimer = null;
let recorder = null, recordedUrl = null;

/* ---------- 저장 ---------- */
function storageKey(pid) { return "travelEng_" + pid; }
function loadState(pid) {
  try {
    const raw = localStorage.getItem(storageKey(pid));
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { progress: {}, attendance: [], favorites: [], lastSessionDate: null };
}
function saveState() {
  localStorage.setItem(storageKey(currentProfile.id), JSON.stringify(currentProfile.state));
}
function todayStr() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

/* ---------- 오디오 ---------- */
function audioSrc(id, speed) {
  return "audio/s" + String(id).padStart(2, "0") + "_" + speed + ".mp3";
}
function stopAudio() {
  if (audioPlayer) { audioPlayer.onended = null; audioPlayer.pause(); audioPlayer = null; }
  document.querySelectorAll(".audio-btn.playing").forEach(b => b.classList.remove("playing"));
}
function playAudio(id, speed, opts) {
  opts = opts || {};
  stopAudio();
  audioPlayer = new Audio(audioSrc(id, speed));
  if (opts.btn) opts.btn.classList.add("playing");
  let remaining = opts.repeat || 1;
  audioPlayer.onended = function () {
    remaining--;
    if (remaining > 0 && audioPlayer) {
      setTimeout(function () { if (audioPlayer) { audioPlayer.currentTime = 0; audioPlayer.play(); } }, 700);
    } else {
      if (opts.btn) opts.btn.classList.remove("playing");
      if (opts.onDone) opts.onDone();
    }
  };
  audioPlayer.play().catch(function () {
    if (opts.btn) opts.btn.classList.remove("playing");
  });
}

/* ---------- 화면 렌더 ---------- */
function render(html) {
  stopAudio();
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
  app.innerHTML = '<div class="screen">' + html + "</div>";
  window.scrollTo(0, 0);
}
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
function patternById(pid) { return PATTERNS.find(function (p) { return p.id === pid; }); }
function sentenceEnHtml(s) {
  if (s.pattern) {
    return '<span class="pat-fixed">' + esc(s.chunks[0]) + '</span> <span class="pat-var">' + esc(s.chunks[1]) + "</span>";
  }
  return esc(s.en);
}
// 캐릭터 이미지(img/munsook.png)가 없으면 이모지로 자동 대체됩니다.
window.charImgFail = function (el) {
  const span = document.createElement("span");
  span.className = "char-emoji";
  span.textContent = OWNER.emoji;
  el.replaceWith(span);
};
function characterHtml(mood) {
  const deco = { hello: "", cheer: "💪", happy: "🎉", think: "🤔" };
  const badge = deco[mood] ? '<span class="char-badge">' + deco[mood] + "</span>" : "";
  return '<div class="character owner-char">' +
    '<img src="' + OWNER.photo + '" alt="" onerror="charImgFail(this)">' + badge + "</div>";
}

/* ---------- 1. 시작 화면 (문숙님 전용) ---------- */
function showProfileSelect() {
  currentProfile = null;
  const p = PROFILES[0];
  const st = loadState(p.id);
  const learned = Object.keys(st.progress).length;

  let html = characterHtml("hello");
  html += '<div class="hello-title">' + esc(OWNER.name) + "님의<br>여행회화 ✈️</div>";
  html += '<div class="hello-sub">비행기 타기 전에<br>하루 10분씩 같이 해봐요! 😊</div>';
  html += '<button class="big-btn welcome-start" id="btn-enter">' +
    (learned > 0 ? "▶ 오늘도 공부하러 가기" : "▶ 첫 공부 시작하기") + "</button>";
  if (learned > 0) {
    html += '<div class="welcome-progress">지금까지 <b>' + learned + "문장</b> 배우셨어요 👏</div>";
  }
  html += '<div class="gift-note">💝 ' + esc(OWNER.gift) + "</div>";
  render(html);
  document.getElementById("btn-enter").onclick = function () {
    currentProfile = { id: p.id, name: p.name, emoji: p.emoji, state: loadState(p.id) };
    showDashboard();
  };
}

/* ---------- 학습 대상 계산 ---------- */
function getLearnedIds() {
  return Object.keys(currentProfile.state.progress).map(Number);
}
function getDueReviews() {
  const t = todayStr();
  const prog = currentProfile.state.progress;
  return getLearnedIds()
    .filter(function (id) { return prog[id].due <= t; })
    .sort(function (a, b) { return prog[a].due < prog[b].due ? -1 : 1; })
    .slice(0, MAX_REVIEWS)
    .map(function (id) { return SENTENCES.find(function (s) { return s.id === id; }); });
}
function getNewSentences() {
  const learned = getLearnedIds();
  const doneToday = currentProfile.state.lastSessionDate === todayStr();
  if (doneToday) return [];
  return SENTENCES.filter(function (s) { return learned.indexOf(s.id) === -1; }).slice(0, NEW_PER_DAY);
}
function calcStreak() {
  const att = currentProfile.state.attendance.slice().sort();
  if (att.length === 0) return 0;
  let streak = 0;
  let cursor = todayStr();
  if (att.indexOf(cursor) === -1) cursor = addDays(cursor, -1); // 오늘 아직 안 했으면 어제부터
  while (att.indexOf(cursor) !== -1) { streak++; cursor = addDays(cursor, -1); }
  return streak;
}

/* ---------- 2. 대시보드 ---------- */
function showDashboard() {
  const st = currentProfile.state;
  const learnedCount = getLearnedIds().length;
  const reviews = getDueReviews();
  const news = getNewSentences();
  const doneToday = st.attendance.indexOf(todayStr()) !== -1;
  const streak = calcStreak();

  // 이번 주 월~일 출석 점
  const now = new Date();
  const dayIdx = (now.getDay() + 6) % 7; // 월=0
  let dots = "";
  const dayNames = ["월", "화", "수", "목", "금", "토", "일"];
  for (let i = 0; i < 7; i++) {
    const d = addDays(todayStr(), i - dayIdx);
    const cls = (st.attendance.indexOf(d) !== -1 ? " done" : "") + (i === dayIdx ? " today" : "");
    dots += '<div class="dot' + cls + '">' + dayNames[i] + "</div>";
  }

  let html = '<div class="top-bar"><button class="back-btn" id="btn-switch">‹ 처음으로</button></div>';
  html += characterHtml(doneToday ? "happy" : "cheer");
  html += '<div class="greet">' + esc(currentProfile.name) + "님, 안녕하세요!</div>";
  html += '<div class="greet-sub">' + (doneToday ? "오늘 공부 완료! 정말 잘하셨어요 👏" : "오늘도 가볍게 시작해 볼까요?") + "</div>";

  html += '<div class="card streak-card"><div style="font-size:2rem">🔥</div>' +
    '<div><div class="streak-num">' + streak + "일 연속</div>" +
    '<div class="streak-label">출석 중이에요</div>' +
    '<div class="week-dots">' + dots + "</div></div></div>";

  html += '<div class="card"><div style="font-weight:800;margin-bottom:8px">📚 나의 진도</div>' +
    '<div class="progress-wrap"><div class="progress-track">' +
    '<div class="progress-fill" style="width:' + Math.round(learnedCount / SENTENCES.length * 100) + '%"></div></div>' +
    '<div class="progress-label"><span>' + learnedCount + "문장 배움</span><span>전체 " + SENTENCES.length + "문장</span></div></div></div>";

  const total = reviews.length + news.length;
  if (total > 0) {
    html += '<div class="today-summary">오늘의 공부: 복습 <b>' + reviews.length + "문장</b> + 새 문장 <b>" + news.length + "문장</b></div>";
    html += '<button class="big-btn" id="btn-start">▶ 오늘의 공부 시작</button>';
  } else {
    html += '<div class="today-summary">오늘 할 공부를 모두 마쳤어요! 🎉</div>';
    html += '<button class="big-btn" id="btn-free">🔁 자유 복습 하기</button>';
  }
  html += '<button class="big-btn secondary" id="btn-browse">📖 문장집 보기</button>';
  render(html);

  document.getElementById("btn-switch").onclick = showProfileSelect;
  document.getElementById("btn-browse").onclick = showBrowse;
  const startBtn = document.getElementById("btn-start");
  if (startBtn) startBtn.onclick = function () { startSession(reviews, news); };
  const freeBtn = document.getElementById("btn-free");
  if (freeBtn) freeBtn.onclick = function () {
    // 자유 복습: 배운 문장 중 무작위 6개
    const learned = getLearnedIds().map(function (id) { return SENTENCES.find(function (s) { return s.id === id; }); });
    learned.sort(function () { return Math.random() - 0.5; });
    startSession(learned.slice(0, 6), [], true);
  };
}

/* ---------- 3. 학습 세션 ---------- */
let session = null;
function startSession(reviews, news, isFree) {
  const queue = [];
  reviews.forEach(function (s) { queue.push({ s: s, isNew: false }); });
  news.forEach(function (s) { queue.push({ s: s, isNew: true }); });
  if (queue.length === 0) { showDashboard(); return; }
  session = { queue: queue, idx: 0, total: queue.length, isFree: !!isFree };
  showStep();
}
function sessionHeader() {
  let segs = "";
  for (let i = 0; i < session.total; i++) {
    segs += '<div class="sp-seg' + (i < session.idx ? " done" : "") + '"></div>';
  }
  return '<div class="top-bar"><button class="back-btn" id="btn-quit">✕</button>' +
    '<div class="session-progress">' + segs + "</div>" +
    '<div class="top-title">' + Math.min(session.idx + 1, session.total) + "/" + session.total + "</div></div>";
}
function bindQuit() {
  document.getElementById("btn-quit").onclick = function () {
    if (confirm("공부를 그만할까요? 지금까지 한 것은 저장돼요.")) showDashboard();
  };
}
function cueHtml(s) {
  if (!s.cue) return "";
  return '<div class="cue-box"><div class="cue-who">👤 상대방이 이렇게 말해요</div>' +
    "<div><b>" + esc(s.cue.en) + "</b></div>" +
    '<div class="cue-ko">' + esc(s.cue.ko) + "</div></div>";
}
function patternPreviewHtml(item) {
  const s = item.s;
  if (!s.pattern) return "";
  if (s.patternIntro) {
    const variants = SENTENCES.filter(function (x) { return x.pattern === s.pattern; });
    const chips = variants.map(function (v) {
      return '<button class="pattern-chip" data-id="' + v.id + '"><b>' + esc(v.chunks[1]) + "</b><span>" + esc(v.ko) + "</span></button>";
    }).join("");
    return '<div class="pattern-box"><div class="pattern-box-title">💡 이 말틀 뒤에 단어만 바꾸면 이렇게도 말해요</div>' +
      '<div class="pattern-chips">' + chips + "</div></div>";
  }
  const p = patternById(s.pattern);
  return '<div class="pattern-tag">🔁 전에 배운 말틀이에요 · <b>' + esc(p.en) + ' ___</b></div>';
}
function bindPatternChips() {
  document.querySelectorAll(".pattern-chip").forEach(function (chip) {
    chip.onclick = function () { playAudio(Number(chip.dataset.id), "normal", { btn: chip }); };
  });
}

function showStep() {
  if (session.idx >= session.queue.length) { finishSession(); return; }
  const item = session.queue[session.idx];
  if (item.isNew) showListenStep(item);
  else showRecallStep(item);
}

/* 3-1. 새 문장: 듣고 이해하기 */
function showListenStep(item) {
  const s = item.s;
  let html = sessionHeader();
  html += '<div class="step-label">1단계 · 듣고 이해하기</div>';
  html += '<div class="card">';
  html += '<span class="badge">🌱 새 문장 · ' + esc(s.cat) + "</span>";
  html += '<div class="situation">' + esc(s.situation) + "</div>";
  html += cueHtml(s);
  html += '<div class="sentence-en">' + sentenceEnHtml(s) + "</div>";
  html += '<div class="sentence-ko">' + esc(s.ko) + "</div>";
  html += '<div class="audio-btns">' +
    '<button class="audio-btn" id="btn-slow"><span class="icon">🐢</span> 천천히 듣기 <span style="margin-left:auto;color:var(--sub);font-size:0.85rem">' + esc(s.chunks.join(" / ")) + "</span></button>" +
    '<button class="audio-btn" id="btn-normal"><span class="icon">🔊</span> 자연스럽게 듣기</button>' +
    '<button class="audio-btn" id="btn-repeat"><span class="icon">🔁</span> 3번 반복 듣기</button></div>';
  html += patternPreviewHtml(item);
  html += "</div>";
  html += '<button class="big-btn" id="btn-next">다음 · 따라 말하기 ▶</button>';
  render(html);
  bindQuit();
  bindPatternChips();
  const bSlow = document.getElementById("btn-slow");
  const bNormal = document.getElementById("btn-normal");
  const bRepeat = document.getElementById("btn-repeat");
  bSlow.onclick = function () { playAudio(s.id, "slow", { btn: bSlow }); };
  bNormal.onclick = function () { playAudio(s.id, "normal", { btn: bNormal }); };
  bRepeat.onclick = function () { playAudio(s.id, "normal", { btn: bRepeat, repeat: 3 }); };
  document.getElementById("btn-next").onclick = function () { showShadowStep(item); };
  // 자동으로 한 번 들려주기
  playAudio(s.id, "normal", { btn: bNormal });
}

/* 3-2. 새 문장: 듣고 따라 말하기 */
function showShadowStep(item) {
  const s = item.s;
  let html = sessionHeader();
  html += '<div class="step-label">2단계 · 듣고 따라 말하기</div>';
  html += '<div class="card">';
  html += '<div class="sentence-en">' + sentenceEnHtml(s) + "</div>";
  html += '<div class="sentence-ko">' + esc(s.ko) + "</div>";
  html += '<div class="countdown-wrap"><div class="countdown-ring" id="ring">🔊</div>' +
    '<div class="countdown-msg" id="cd-msg">잘 들어보세요</div>' +
    '<div class="countdown-sub">소리가 끝나면 큰 소리로 따라 말해보세요</div></div>';
  html += '<div class="audio-btns"><button class="audio-btn" id="btn-again"><span class="icon">🔁</span> 한 번 더 듣고 따라하기</button></div>';
  html += "</div>";
  html += '<button class="big-btn" id="btn-next">다음 · 한국어만 보고 말하기 ▶</button>';
  render(html);
  bindQuit();
  const ring = document.getElementById("ring");
  const msg = document.getElementById("cd-msg");
  function playThenCount() {
    ring.textContent = "🔊";
    msg.textContent = "잘 들어보세요";
    playAudio(s.id, "normal", {
      onDone: function () {
        let n = 4;
        ring.textContent = n;
        msg.textContent = "지금 따라 말해보세요!";
        countdownTimer = setInterval(function () {
          n--;
          if (n <= 0) {
            clearInterval(countdownTimer); countdownTimer = null;
            ring.textContent = "👏";
            msg.textContent = "잘하셨어요!";
          } else ring.textContent = n;
        }, 1000);
      }
    });
  }
  document.getElementById("btn-again").onclick = playThenCount;
  document.getElementById("btn-next").onclick = function () { showRecallStep(item); };
  playThenCount();
}

/* 3-3. 한국어만 보고 영어로 말하기 (새 문장 3단계 + 복습의 기본 화면) */
function showRecallStep(item) {
  const s = item.s;
  const tier = item.isNew ? "first" : hintTier(s);
  let html = sessionHeader();
  html += '<div class="step-label">' + (item.isNew ? "3단계 · " : "복습 · ") + "한국어만 보고 영어로 말하기</div>";
  html += '<div class="card">';
  html += '<span class="badge' + (item.isNew ? "" : " review") + '">' + (item.isNew ? "🌱 새 문장" : "🔄 복습") + " · " + esc(s.cat) + "</span>";
  html += '<div class="situation">' + esc(s.situation) + "</div>";
  html += cueHtml(s);
  if (tier === "late") {
    html += '<div class="situation-only">' + esc(s.situation) + "</div>";
    html += '<button class="ko-toggle-btn" id="btn-ko-toggle">🇰🇷 한국어 뜻 보기</button>';
    html += '<div class="sentence-ko only" id="ko-hidden" style="display:none">“' + esc(s.ko) + '”</div>';
  } else {
    html += '<div class="sentence-ko only">“' + esc(s.ko) + '”</div>';
    if (tier === "first" && s.pattern) {
      html += '<div class="recall-hint">' + esc(patternById(s.pattern).en) + " ___</div>";
    }
  }
  html += '<div class="countdown-sub" style="text-align:center;color:var(--sub)">🎤 먼저 소리 내어 영어로 말해보세요</div>';
  html += '<button class="reveal-btn" id="btn-reveal">정답 확인하기</button>';
  html += '<div id="answer-area"></div>';
  html += "</div>";
  render(html);
  bindQuit();
  const koToggle = document.getElementById("btn-ko-toggle");
  if (koToggle) koToggle.onclick = function () {
    document.getElementById("ko-hidden").style.display = "block";
    koToggle.style.display = "none";
  };
  document.getElementById("btn-reveal").onclick = function () {
    document.getElementById("btn-reveal").style.display = "none";
    const area = document.getElementById("answer-area");
    let a = '<div style="border-top:2px dashed #F1E8DC;margin:16px 0;padding-top:16px">';
    a += '<div class="sentence-en">' + sentenceEnHtml(s) + "</div>";
    a += '<div class="audio-btns">' +
      '<button class="audio-btn" id="btn-normal2"><span class="icon">🔊</span> 정답 듣기</button>' +
      '<button class="audio-btn" id="btn-slow2"><span class="icon">🐢</span> 천천히 듣기</button></div>';
    a += '<div class="record-row">' +
      '<button class="audio-btn" id="btn-rec"><span class="icon">🎙️</span> 내 목소리 녹음</button>' +
      '<button class="audio-btn" id="btn-play-rec" style="display:none"><span class="icon">▶️</span> 내 발음 듣기</button></div>';
    a += '<div class="rating-btns">' +
      '<button class="rating-btn good" data-r="good"><span class="icon">😄</span> 바로 말할 수 있어요</button>' +
      '<button class="rating-btn ok" data-r="ok"><span class="icon">🙂</span> 조금 생각해야 했어요</button>' +
      '<button class="rating-btn again" data-r="again"><span class="icon">😅</span> 다시 연습할래요</button></div>';
    a += "</div>";
    area.innerHTML = a;
    const b2 = document.getElementById("btn-normal2");
    b2.onclick = function () { playAudio(s.id, "normal", { btn: b2 }); };
    const b3 = document.getElementById("btn-slow2");
    b3.onclick = function () { playAudio(s.id, "slow", { btn: b3 }); };
    setupRecorder();
    document.querySelectorAll(".rating-btn").forEach(function (btn) {
      btn.onclick = function () { rateAndNext(item, btn.dataset.r); };
    });
    playAudio(s.id, "normal", { btn: b2 });
  };
}

/* 복습 횟수에 따라 힌트를 점점 줄여가는 단계 */
function hintTier(s) {
  const p = currentProfile.state.progress[s.id];
  if (!p) return "first";
  if (p.level <= 1) return "early";
  return "late";
}

/* 녹음 기능 (지원 안 되면 버튼 숨김) */
function setupRecorder() {
  const recBtn = document.getElementById("btn-rec");
  const playBtn = document.getElementById("btn-play-rec");
  if (!navigator.mediaDevices || !window.MediaRecorder) { recBtn.style.display = "none"; return; }
  let chunks = [];
  recBtn.onclick = function () {
    if (recorder && recorder.state === "recording") {
      recorder.stop();
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      chunks = [];
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = function (e) { chunks.push(e.data); };
      recorder.onstop = function () {
        stream.getTracks().forEach(function (t) { t.stop(); });
        if (recordedUrl) URL.revokeObjectURL(recordedUrl);
        recordedUrl = URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType }));
        recBtn.classList.remove("recording");
        recBtn.innerHTML = '<span class="icon">🎙️</span> 다시 녹음';
        playBtn.style.display = "";
      };
      recorder.start();
      recBtn.classList.add("recording");
      recBtn.innerHTML = '<span class="icon">⏹️</span> 녹음 끝내기';
    }).catch(function () { alert("마이크 사용을 허용해 주세요."); });
  };
  playBtn.onclick = function () {
    if (recordedUrl) { stopAudio(); new Audio(recordedUrl).play(); }
  };
}

/* 평가 → 간격 반복 스케줄 */
function rateAndNext(item, rating) {
  const prog = currentProfile.state.progress;
  const id = item.s.id;
  if (!session.isFree) {
    const isFirst = !prog[id];
    let p = prog[id] || { level: 0, due: todayStr() };
    if (!isFirst) {
      // 처음 배운 날은 무조건 다음 날 복습(level 0 유지), 이후부터 간격 확장
      if (rating === "good") p.level = Math.min(p.level + 1, INTERVALS.length - 1);
      else if (rating === "again") p.level = Math.max(p.level - 1, 0);
      // ok: 레벨 유지
    }
    p.due = addDays(todayStr(), INTERVALS[p.level]);
    if (rating === "again") p.due = addDays(todayStr(), 1); // 내일 무조건 다시
    prog[id] = p;
    saveState();
    if (rating === "again") {
      // 이번 세션 마지막에 한 번 더 (복습 모드로)
      session.queue.push({ s: item.s, isNew: false, requeued: true });
      session.total++;
    }
  }
  session.idx++;
  showStep();
}

/* ---------- 4. 완료 화면 ---------- */
function finishSession() {
  const st = currentProfile.state;
  const t = todayStr();
  if (st.attendance.indexOf(t) === -1) st.attendance.push(t);
  st.lastSessionDate = t;
  saveState();
  const streak = calcStreak();
  let html = characterHtml("happy");
  html += '<div class="done-title">오늘 공부 끝!</div>';
  html += '<div class="done-sub">' + esc(currentProfile.name) + "님, 정말 잘하셨어요 👏</div>";
  html += '<div class="stamp">✅ ' + t.replace(/-/g, ". ") + " 출석 도장 꾹!</div>";
  html += '<div class="card streak-card"><div style="font-size:2rem">🔥</div>' +
    '<div><div class="streak-num">' + streak + "일 연속</div>" +
    '<div class="streak-label">내일도 만나요!</div></div></div>';
  html += '<button class="big-btn" id="btn-home">처음으로</button>';
  render(html);
  document.getElementById("btn-home").onclick = showDashboard;
}

/* ---------- 5. 문장집 ---------- */
let browseFilter = "all";
function showBrowse() {
  const st = currentProfile.state;
  const learned = getLearnedIds();
  let html = '<div class="top-bar"><button class="back-btn" id="btn-back">‹ 뒤로</button>' +
    '<div class="top-title">📖 문장집</div><div style="width:60px"></div></div>';
  html += '<div class="filter-row">' +
    '<button class="filter-btn' + (browseFilter === "all" ? " on" : "") + '" data-f="all">전체</button>' +
    '<button class="filter-btn' + (browseFilter === "learned" ? " on" : "") + '" data-f="learned">배운 문장</button>' +
    '<button class="filter-btn' + (browseFilter === "fav" ? " on" : "") + '" data-f="fav">⭐ 즐겨찾기</button></div>';

  let currentWeek = 0;
  SENTENCES.forEach(function (s) {
    const isLearned = learned.indexOf(s.id) !== -1;
    const isFav = st.favorites.indexOf(s.id) !== -1;
    if (browseFilter === "learned" && !isLearned) return;
    if (browseFilter === "fav" && !isFav) return;
    if (s.week !== currentWeek) {
      currentWeek = s.week;
      html += '<div class="week-header">' + esc(WEEK_TITLES[String(s.week)]) + "</div>";
    }
    html += '<div class="list-item' + (isLearned ? "" : " not-learned") + '">' +
      '<button class="mini-btn play" data-id="' + s.id + '">🔊</button>' +
      '<div class="txt"><div class="en">' + sentenceEnHtml(s) + '</div><div class="ko">' + esc(s.ko) + "</div></div>" +
      '<button class="mini-btn fav' + (isFav ? " on" : "") + '" data-id="' + s.id + '">' + (isFav ? "⭐" : "☆") + "</button></div>";
  });
  html += '<div class="footer-note">흐리게 보이는 문장은 아직 배우지 않은 문장이에요</div>';
  render(html);
  document.getElementById("btn-back").onclick = showDashboard;
  document.querySelectorAll(".filter-btn").forEach(function (b) {
    b.onclick = function () { browseFilter = b.dataset.f; showBrowse(); };
  });
  document.querySelectorAll(".mini-btn.play").forEach(function (b) {
    b.onclick = function () { playAudio(Number(b.dataset.id), "normal", {}); };
  });
  document.querySelectorAll(".mini-btn.fav").forEach(function (b) {
    b.onclick = function () {
      const id = Number(b.dataset.id);
      const favs = currentProfile.state.favorites;
      const i = favs.indexOf(id);
      if (i === -1) favs.push(id); else favs.splice(i, 1);
      saveState();
      showBrowse();
    };
  });
}

/* ---------- 홈 화면에 추가 ---------- */
let deferredInstallPrompt = null;
const INSTALL_DISMISS_KEY = "travelEng_installDismissed";

function isStandaloneMode() {
  return window.navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
}
function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}
function renderInstallBanner() {
  const bar = document.getElementById("install-banner");
  if (!bar) return;
  if (isStandaloneMode() || localStorage.getItem(INSTALL_DISMISS_KEY) === "1" || (!isIOS() && !deferredInstallPrompt)) {
    bar.style.display = "none";
    document.body.classList.remove("has-install-banner");
    return;
  }
  bar.style.display = "flex";
  document.body.classList.add("has-install-banner");
  bar.innerHTML =
    '<span class="install-text">📲 홈 화면에 추가하면 앱처럼 바로 쓸 수 있어요</span>' +
    '<button class="install-btn" id="btn-install-go">추가하기</button>' +
    '<button class="install-close" id="btn-install-close">✕</button>';
  document.getElementById("btn-install-close").onclick = function () {
    localStorage.setItem(INSTALL_DISMISS_KEY, "1");
    bar.style.display = "none";
    document.body.classList.remove("has-install-banner");
  };
  document.getElementById("btn-install-go").onclick = function () {
    if (isIOS()) { showIOSInstallGuide(); return; }
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(function () { deferredInstallPrompt = null; renderInstallBanner(); });
  };
}
function showIOSInstallGuide() {
  const overlay = document.createElement("div");
  overlay.className = "ios-guide-overlay";
  overlay.innerHTML =
    '<div class="ios-guide-card">' +
    '<div class="ios-guide-title">📲 홈 화면에 추가하는 방법</div>' +
    '<div class="ios-guide-step"><span class="num">1</span> 화면 아래(또는 위) <b>공유 버튼 ⬆️</b>을 눌러요</div>' +
    '<div class="ios-guide-step"><span class="num">2</span> 아래로 내려서 <b>"홈 화면에 추가"</b>를 찾아 눌러요</div>' +
    '<div class="ios-guide-step"><span class="num">3</span> 오른쪽 위 <b>"추가"</b>를 누르면 끝!</div>' +
    '<button class="big-btn" id="btn-guide-close">확인했어요</button>' +
    "</div>";
  document.body.appendChild(overlay);
  document.getElementById("btn-guide-close").onclick = function () { overlay.remove(); };
}
window.addEventListener("beforeinstallprompt", function (e) {
  e.preventDefault();
  deferredInstallPrompt = e;
  renderInstallBanner();
});
window.addEventListener("appinstalled", function () {
  localStorage.setItem(INSTALL_DISMISS_KEY, "1");
  renderInstallBanner();
});
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
}

/* ---------- 시작 ---------- */
showProfileSelect();
renderInstallBanner();
