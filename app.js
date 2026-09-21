/* Portal Anti-UX — lógica hostil en JavaScript puro */
(function () {
  "use strict";

  var COUNTRIES_BY_GDP = ["Estados Unidos","China","Alemania","Japón","India","Reino Unido","Francia","Italia","Brasil","Canadá","Rusia","México","Australia","Corea del Sur","España","Indonesia","Países Bajos","Turquía","Arabia Saudita","Suiza","Polonia","Taiwán","Bélgica","Argentina","Suecia","Irlanda","Noruega","Austria","Israel","Tailandia","Singapur","Emiratos Árabes Unidos","Filipinas","Vietnam","Bangladesh","Malasia","Dinamarca","Sudáfrica","Hong Kong","Egipto","Colombia","Chile","Finlandia","Rumanía","República Checa","Portugal","Perú","Nueva Zelanda","Grecia","Kazajistán","Venezuela"];
  var MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  var LETTERS = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
  var DIGITS = "0123456789".split("");
  var BG_SONG_SRC = "bg-song.mp4";

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function preventTyping(e) {
    e.preventDefault();
  }

  function lockField(el) {
    el.readOnly = true;
    el.setAttribute("inputmode", "none");
    el.addEventListener("keydown", preventTyping);
    el.addEventListener("paste", preventTyping);
    el.addEventListener("beforeinput", preventTyping);
  }

  function appendValue(el, value) {
    el.value += value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function removeLastValue(el) {
    el.value = el.value.slice(0, -1);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function createShufflingKeyboard(inputEl, keyboardEl, options) {
    var keys = options.keys.slice();
    var extras = options.extras || [];
    var onChange = options.onChange || function () {};

    lockField(inputEl);

    function render() {
      keyboardEl.innerHTML = "";

      keys.forEach(function (key) {
        var button = document.createElement("button");
        button.type = "button";
        button.textContent = key;
        button.addEventListener("click", function () {
          appendValue(inputEl, key);
          keys = shuffle(keys);
          onChange(inputEl.value);
          render();
        });
        keyboardEl.appendChild(button);
      });

      extras.forEach(function (extra) {
        var button = document.createElement("button");
        button.type = "button";
        button.textContent = extra.label;
        button.className = extra.className || "";
        button.addEventListener("click", function () {
          extra.action(inputEl);
          keys = shuffle(keys);
          onChange(inputEl.value);
          render();
        });
        keyboardEl.appendChild(button);
      });
    }

    render();
  }

  var mouse = { x: 0, y: 0 };
  window.addEventListener("mousemove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  /* ---------- Sección 6: canción de fondo del programador ---------- */
  var bgVideo = document.getElementById("bgVideo");
  var bgSongStarted = false;
  bgVideo.src = BG_SONG_SRC;
  bgVideo.loop = true;
  bgVideo.autoplay = true;
  bgVideo.playsInline = true;
  bgVideo.preload = "auto";
  bgVideo.muted = false;
  bgVideo.volume = 1;

  function tryPlayBackgroundSong() {
    if (bgSongStarted || !bgVideo.src) return;
    var playPromise = bgVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.then(function () {
        bgSongStarted = true;
      }).catch(function () {});
    } else {
      bgSongStarted = true;
    }
  }

  ["pointerdown", "keydown", "click"].forEach(function (eventName) {
    window.addEventListener(eventName, tryPlayBackgroundSong, true);
  });

  /* ---------- Sección 6: el ladrón roba el botón de silencio ---------- */
  var muteContainer = document.getElementById("mute-container");
  var thiefImg = document.getElementById("thief-img");
  var muteBtn = document.getElementById("mute-btn");
  var muted = false;
  var fleeing = false;

  thiefImg.src = "img/thief.png";

  function updateMuteLabel() {
    muteBtn.textContent = muted ? "🔊 Activar canción" : "🔇 Silenciar canción";
  }

  function placeThief(x, y) {
    muteContainer.style.left = Math.max(0, x) + "px";
    muteContainer.style.top = Math.max(0, y) + "px";
  }

  function positionThiefInitial() {
    var rect = muteContainer.getBoundingClientRect();
    placeThief(window.innerWidth - rect.width - 20, 20);
  }

  muteBtn.addEventListener("click", function () {
    muted = !muted;
    bgVideo.muted = muted;
    updateMuteLabel();
    tryPlayBackgroundSong();
  });

  updateMuteLabel();
  positionThiefInitial();

  setInterval(function () {
    if (fleeing) return;

    var r = muteContainer.getBoundingClientRect();
    var cx = Math.max(r.left, Math.min(mouse.x, r.right));
    var cy = Math.max(r.top, Math.min(mouse.y, r.bottom));
    var dx = mouse.x - cx;
    var dy = mouse.y - cy;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 50) {
      fleeing = true;
      muteContainer.classList.add("fleeing");

      var moveX = dx === 0 && dy === 0 ? (Math.random() < 0.5 ? -1 : 1) : dx / distance;
      var moveY = dx === 0 && dy === 0 ? (Math.random() < 0.5 ? -1 : 1) : dy / distance;
      var newLeft = r.left - moveX * 420;
      var newTop = r.top - moveY * 420;

      if (newLeft < 0) newLeft = 20;
      if (newTop < 0) newTop = 20;
      if (newLeft > window.innerWidth - r.width) newLeft = window.innerWidth - r.width - 20;
      if (newTop > window.innerHeight - r.height) newTop = window.innerHeight - r.height - 20;

      setTimeout(function () {
        placeThief(newLeft, newTop);
        setTimeout(function () {
          fleeing = false;
          muteContainer.classList.remove("fleeing");
        }, 200);
      }, 60);
    }
  }, 40);

  /* ---------- Sección 1: cursor malvado duplicable ---------- */
  var evilCounter = document.getElementById("evilCounter");
  var evilCursors = [];

  function updateEvilCounter() {
    evilCounter.textContent = "Cursores enemigos activos: " + evilCursors.length;
  }

  function createEvilCursor(x, y) {
    var evil = document.createElement("img");
    var variant = Math.floor(Math.random() * 4) + 1;
    evil.src = "img/cursor-malvado" + variant + ".png";
    evil.alt = "";
    evil.className = "evil-cursor";
    evil.style.left = x + "px";
    evil.style.top = y + "px";
    document.body.appendChild(evil);
    evilCursors.push({
      element: evil,
      x: x,
      y: y,
      speed: Math.random() * 2 + 1.5
    });
    updateEvilCounter();
  }

  createEvilCursor(0, 0);

  function updateEvilCursors() {
    for (var i = 0; i < evilCursors.length; i++) {
      var cursor = evilCursors[i];
      var dx = mouse.x - cursor.x;
      var dy = mouse.y - cursor.y;
      var distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        cursor.x += (dx / distance) * cursor.speed;
        cursor.y += (dy / distance) * cursor.speed;
      }

      cursor.element.style.left = cursor.x + "px";
      cursor.element.style.top = cursor.y + "px";

      if (distance < 15) {
        createEvilCursor(cursor.x - (Math.random() * 40 - 20), cursor.y - (Math.random() * 40 - 20));
      }
    }

    requestAnimationFrame(updateEvilCursors);
  }

  updateEvilCursors();

  /* ---------- Sección 1: engaño del CV ---------- */
  var cv = document.getElementById("cv");
  var uploadBtn = document.getElementById("uploadBtn");
  var overlay = document.getElementById("spinnerOverlay");
  var barWrap = document.getElementById("barWrap");
  var barFill = document.getElementById("barFill");
  var barText = document.getElementById("barText");
  var resultBox = document.getElementById("resultBox");
  var history = document.getElementById("history");
  var busy = false;
  var progressTimer = null;
  var finishTimer = null;

  function startFakeCvProgress() {
    if (busy) return;
    busy = true;
    resultBox.hidden = true;
    history.value = "";
    barWrap.hidden = false;
    barFill.style.width = "0%";
    barText.textContent = "0% — Analizando documento con inteligencia artificial…";

    var startedAt = Date.now();
    progressTimer = setInterval(function () {
      var elapsed = Date.now() - startedAt;
      var progress = Math.min(100, elapsed / 80);
      barFill.style.width = progress + "%";
      barText.textContent = Math.floor(progress) + "% — Analizando documento con inteligencia artificial…";
    }, 40);

    finishTimer = setTimeout(function () {
      clearInterval(progressTimer);
      barFill.style.width = "100%";
      barText.textContent = "100% — Analizando documento con inteligencia artificial…";
      resultBox.hidden = false;
      busy = false;
    }, 8000);
  }

  uploadBtn.addEventListener("click", function () {
    cv.click();
    startFakeCvProgress();
  });

  cv.addEventListener("change", function () {
    startFakeCvProgress();
  });

  /* ---------- Sección 2: datepicker hostil ---------- */
  var birth = document.getElementById("birth");
  var calendar = document.getElementById("calendar");
  var monthLabel = document.getElementById("monthLabel");
  var dayBtn = document.getElementById("dayBtn");
  var now = new Date();
  var month = now.getMonth();
  var year = now.getFullYear();
  var day = new Date(year, month + 1, 0).getDate();

  function renderCal() {
    monthLabel.textContent = MONTHS[month] + " " + year;
    dayBtn.textContent = day;
  }

  renderCal();

  birth.addEventListener("keydown", preventTyping);
  birth.addEventListener("click", function () { calendar.hidden = !calendar.hidden; });
  document.getElementById("prevMonth").addEventListener("click", function () {
    var m = month === 0 ? 11 : month - 1;
    var y = month === 0 ? year - 1 : year;
    month = m;
    year = y;
    day = new Date(y, m + 1, 0).getDate();
    renderCal();
  });
  document.getElementById("prevDay").addEventListener("click", function () {
    day = day > 1 ? day - 1 : 1;
    renderCal();
  });
  dayBtn.addEventListener("click", function () {
    birth.value = String(day).padStart(2, "0") + "/" + String(month + 1).padStart(2, "0") + "/" + year;
    calendar.hidden = true;
  });

  /* ---------- Sección 2: países por PIB ---------- */
  var country = document.getElementById("country");
  COUNTRIES_BY_GDP.forEach(function (c) {
    var o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    country.appendChild(o);
  });

  /* ---------- Sección 2: teléfono con teclado digital ---------- */
  var phone = document.getElementById("phone");
  var phoneKeyboard = document.getElementById("phoneKeyboard");
  createShufflingKeyboard(phone, phoneKeyboard, {
    keys: DIGITS.concat(["-"]),
    extras: [
      { label: "BORRAR", className: "wide", action: function (el) { removeLastValue(el); } }
    ]
  });

  /* ---------- Sección 3: teclado virtual que se baraja ---------- */
  var skillDraft = document.getElementById("skillDraft");
  var skillKeyboard = document.getElementById("skillKeyboard");
  var skillList = document.getElementById("skillList");
  var skills = [];

  createShufflingKeyboard(skillDraft, skillKeyboard, {
    keys: LETTERS.slice(),
    extras: [
      { label: "ESPACIO", className: "wide", action: function (el) { appendValue(el, " "); } },
      { label: "BORRAR", className: "wide", action: function (el) { removeLastValue(el); } },
      {
        label: "AÑADIR",
        className: "wider",
        action: function (el) {
          if (el.value.trim()) {
            skills.push(el.value.trim());
            renderSkills();
          }
          el.value = "";
        }
      }
    ]
  });

  function renderSkills() {
    skillList.innerHTML = "";
    skills.forEach(function (s) {
      var li = document.createElement("li");
      li.textContent = s;
      skillList.appendChild(li);
    });
  }

  /* ---------- Sección 4: carta con teclado digital ---------- */
  var letter = document.getElementById("letter");
  var letterCount = document.getElementById("letterCount");
  var letterKeyboard = document.getElementById("letterKeyboard");

  createShufflingKeyboard(letter, letterKeyboard, {
    keys: LETTERS.slice(),
    extras: [
      { label: "ESPACIO", className: "wide", action: function (el) { appendValue(el, " "); } },
      { label: "BORRAR", className: "wide", action: function (el) { removeLastValue(el); } },
      { label: "SALTO", className: "wide", action: function (el) { appendValue(el, "\n"); } }
    ],
    onChange: function (value) {
      while (value.length > 50) value = value.slice(1);
      letter.value = value;
      letterCount.textContent = value.length + "/50 caracteres";
    }
  });

  letter.addEventListener("input", function () {
    while (letter.value.length > 50) letter.value = letter.value.slice(1);
    letterCount.textContent = letter.value.length + "/50 caracteres";
  });

  /* ---------- Sección 4: historial con teclado digital ---------- */
  var historyKeyboard = document.getElementById("historyKeyboard");
  createShufflingKeyboard(history, historyKeyboard, {
    keys: LETTERS.slice(),
    extras: [
      { label: "ESPACIO", className: "wide", action: function (el) { appendValue(el, " "); } },
      { label: "BORRAR", className: "wide", action: function (el) { removeLastValue(el); } },
      { label: "SALTO", className: "wide", action: function (el) { appendValue(el, "\n"); } }
    ]
  });

  /* ---------- Sección 5: jerarquía invertida ---------- */
  var bigGreen = document.getElementById("bigGreen");
  var tinyGray = document.getElementById("tinyGray");

  bigGreen.addEventListener("mouseenter", function () { bigGreen.textContent = "Borrar todo el formulario"; });
  bigGreen.addEventListener("mouseleave", function () { bigGreen.textContent = "Enviar Formulario"; });
  tinyGray.addEventListener("mouseenter", function () { tinyGray.textContent = "Enviar aplicación"; });
  tinyGray.addEventListener("mouseleave", function () { tinyGray.textContent = "Borrar formulario"; });

  bigGreen.addEventListener("click", function () {
    document.getElementById("name").value = "";
    birth.value = "";
    country.value = "";
    phone.value = "000-000-0000";
    skills = [];
    renderSkills();
    skillDraft.value = "";
    letter.value = "";
    letterCount.textContent = "0/50 caracteres";
    history.value = "";
    barFill.style.width = "0%";
    barWrap.hidden = true;
    resultBox.hidden = true;
  });

  tinyGray.addEventListener("click", function () {
    window.alert("Su solicitud ha sido enviada al vacío.");
  });

  /* ---------- Nombre con teclado digital ---------- */
  var nameInput = document.getElementById("name");
  var nameKeyboard = document.getElementById("nameKeyboard");
  createShufflingKeyboard(nameInput, nameKeyboard, {
    keys: LETTERS.slice(),
    extras: [
      { label: "ESPACIO", className: "wide", action: function (el) { appendValue(el, " "); } },
      { label: "BORRAR", className: "wide", action: function (el) { removeLastValue(el); } }
    ]
  });

})();
