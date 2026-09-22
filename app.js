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

  var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  var mouseMoved = false;
  window.addEventListener("pointermove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouseMoved = true;
    if (evilCursors.length === 0) {
      ensureInitialEvilCursor();
    }
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
  var muteBtn = document.getElementById("mute-btn");
  var muted = false;
  var fleeing = false;

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
      var newLeft = r.left - moveX * 560;
      var newTop = r.top - moveY * 560;

      if (newLeft < 0) newLeft = 20;
      if (newTop < 0) newTop = 20;
      if (newLeft > window.innerWidth - r.width) newLeft = window.innerWidth - r.width - 20;
      if (newTop > window.innerHeight - r.height) newTop = window.innerHeight - r.height - 20;

      setTimeout(function () {
        placeThief(newLeft, newTop);
        setTimeout(function () {
          fleeing = false;
          muteContainer.classList.remove("fleeing");
        }, 120);
      }, 30);
    }
  }, 40);

  /* ---------- Sección 1: cursor malvado duplicable ---------- */
  var evilCounter = document.getElementById("evilCounter");
  var evilCursors = [];
  var lastEvilSpawnAt = 0;

  function updateEvilCounter() {
    evilCounter.textContent = "Cursores enemigos activos: " + evilCursors.length;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  function clampCursorPosition(x, y) {
    var cursorHalfSize = 15;
    return {
      x: clamp(x, cursorHalfSize, Math.max(cursorHalfSize, window.innerWidth - cursorHalfSize)),
      y: clamp(y, cursorHalfSize, Math.max(cursorHalfSize, window.innerHeight - cursorHalfSize))
    };
  }

  function createEvilCursor(x, y) {
    var evil = document.createElement("img");
    var variant = Math.floor(Math.random() * 4) + 1;
    evil.src = "img/cursor-malvado" + variant + ".png";
    evil.alt = "";
    evil.className = "evil-cursor";
    var position = clampCursorPosition(x, y);
    evil.style.left = position.x + "px";
    evil.style.top = position.y + "px";
    document.body.appendChild(evil);
    evilCursors.push({
      element: evil,
      x: position.x,
      y: position.y,

      
      /* La velocidad de cada stiker */
      speed: Math.random() * 0.8 + 0.3,
      
      
      
      vx: 0,
      vy: 0
    });
    updateEvilCounter();
  }

  function ensureInitialEvilCursor() {
    if (evilCursors.length) return;
    createEvilCursor(mouse.x + 160, mouse.y - 110);
  }

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

      var clamped = clampCursorPosition(cursor.x, cursor.y);
      cursor.x = clamped.x;
      cursor.y = clamped.y;
      cursor.element.style.left = cursor.x + "px";
      cursor.element.style.top = cursor.y + "px";









      var MAX_CURSORES = 1000000; // Límite máximo para proteger la memoria del navegador

      if (mouseMoved && distance < 20 && Date.now() - lastEvilSpawnAt > 50) { // Multiplica cada 1.5 segundos
        if (evilCursors.length < MAX_CURSORES) {
          lastEvilSpawnAt = Date.now();
          
          // En lugar de multiplicar exponencialmente, crea solo 1 o 2 nuevos por colisión
          var burst = 1; 

          for (var spawnIndex = 0; spawnIndex < burst; spawnIndex++) {
            var angle = Math.random() * Math.PI * 2;
            var offset = 40 + Math.random() * 60;
            createEvilCursor(cursor.x + Math.cos(angle) * offset, cursor.y + Math.sin(angle) * offset);
          }
        }
      }
    }

    requestAnimationFrame(updateEvilCursors);
  }

  updateEvilCursors();

  /* ---------- Sección 1: engaño del CV ---------- */
  var cv = document.getElementById("cv");
  var uploadBtn = document.getElementById("uploadBtn");
  var overlay = document.getElementById("spinnerOverlay");
  var pdfWarningOverlay = document.getElementById("pdfWarningOverlay");
  var barWrap = document.getElementById("barWrap");
  var barFill = document.getElementById("barFill");
  var barText = document.getElementById("barText");
  var resultBox = document.getElementById("resultBox");
  var history = document.getElementById("history");
  var busy = false;
  var progressTimer = null;
  var finishTimer = null;
  var spinnerTimer = null;
  var messageTimer = null;

  function clearCvTimers() {
    if (progressTimer) clearInterval(progressTimer);
    if (finishTimer) clearTimeout(finishTimer);
    if (spinnerTimer) clearTimeout(spinnerTimer);
    if (messageTimer) clearTimeout(messageTimer);
    progressTimer = null;
    finishTimer = null;
    spinnerTimer = null;
    messageTimer = null;
  }

  function showCvResult() {
    overlay.classList.remove("on");
    resultBox.hidden = false;
    busy = false;
  }

  var pdfWarningArmed = false;
  var pdfWarningArmTimer = null;


  function showPdfWarning() {
    pdfWarningOverlay.hidden = false;
    pdfWarningArmed = false;
    if (pdfWarningArmTimer) clearTimeout(pdfWarningArmTimer);

    pdfWarningArmTimer = setTimeout(function () {
      pdfWarningArmed = true;
    }, 0);

    // En lugar de redirigir, mostramos el video arriba a la derecha
    setTimeout(function () {
      var videoContainer = document.getElementById("floatingVideoContainer");
      var iframe = document.getElementById("youtubeIframe");

      // ⚠️ REEMPLAZA "TU_VIDEO_ID" POR EL ID REAL DEL VIDEO DE YOUTUBE
      iframe.src = "https://www.youtube.com/embed/pUDvnWApfak?autoplay=1";
      
      videoContainer.style.display = "block";
    }, 3000);
  }

  function hidePdfWarning() {
    if (pdfWarningArmTimer) clearTimeout(pdfWarningArmTimer);
    pdfWarningArmTimer = null;
    pdfWarningArmed = false;
    pdfWarningOverlay.hidden = true;
  }

  function startFakeCvProgress() {
    if (busy) return;
    clearCvTimers();
    busy = true;
    resultBox.hidden = true;
    history.value = "";
    barWrap.hidden = false;
    overlay.classList.remove("on");
    barFill.style.width = "0%";
    barText.textContent = "0% — Analizando documento con inteligencia artificial…";

    var startedAt = Date.now();
    var spinnerShown = false;
    progressTimer = setInterval(function () {
      var elapsed = Date.now() - startedAt;
      var progress;
      if (elapsed < 4000) {
        progress = elapsed / 100;
      } else if (elapsed < 5000) {
        progress = 40;
      } else {
        progress = 40 + ((elapsed - 5000) / 5000) * 60;
      }
      if (progress > 100) progress = 100;
      barFill.style.width = progress + "%";
      barText.textContent = Math.floor(progress) + "% — Analizando documento con inteligencia artificial…";
      if (!spinnerShown && elapsed >= 10000) {
        spinnerShown = true;
        clearInterval(progressTimer);
        progressTimer = null;
        barFill.style.width = "100%";
        barText.textContent = "100% — Analizando documento con inteligencia artificial…";
        overlay.classList.add("on");
        spinnerTimer = setTimeout(function () {
          showCvResult();
        }, 1300);
      }
    }, 50);
  }

  function validarCamposFormulario() {
    var name = document.getElementById("name").value.trim();
    var birth = document.getElementById("birth").value.trim();
    var country = document.getElementById("country").value;
    var phone = document.getElementById("phone").value.trim();
    var letter = document.getElementById("letter").value.trim();

    // Comprueba que los campos de texto no estén vacíos
    if (!name || !birth || !country || !phone || !letter) {
      return false;
    }

    // Comprueba que se haya añadido al menos una habilidad a la lista
    if (skills.length === 0) {
      return false;
    }

    return true;
  }

  uploadBtn.addEventListener("click", function () {
    // Si la validación falla, muestra la alerta y detiene la ejecución
    if (!validarCamposFormulario()) {
      alert("⚠️ ¡ERROR! Debe completar todos los campos del formulario (datos personales, habilidades y carta) antes de subir el PDF.");
      return;
    }

    // Si pasa la validación, ejecuta la lógica original
    showPdfWarning();
    startFakeCvProgress();
  });

  document.addEventListener("click", function () {
    if (pdfWarningArmed && !pdfWarningOverlay.hidden) {
      hidePdfWarning();
    }
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
  bigGreen.addEventListener("mouseleave", function () { bigGreen.textContent = "Subir Aplicacion"; });
  tinyGray.addEventListener("mouseenter", function () { tinyGray.textContent = "Subir Aplicacion"; });
  tinyGray.addEventListener("mouseleave", function () { tinyGray.textContent = "Borrar formulario"; });

  bigGreen.addEventListener("click", function () {
    clearCvTimers();
    busy = false;
    overlay.classList.remove("on");
    barWrap.hidden = true;
    barFill.style.width = "0%";
    barText.textContent = "";
    resultBox.hidden = true;
    cv.value = "";
    document.getElementById("name").value = "";
    birth.value = "";
    calendar.hidden = true;
    country.value = "";
    phone.value = "000-000-0000";
    skills = [];
    renderSkills();
    skillDraft.value = "";
    letter.value = "";
    letterCount.textContent = "0/50 caracteres";
    history.value = "";
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
  updateEvilCounter();

})();
