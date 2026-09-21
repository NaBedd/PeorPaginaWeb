/* Portal Anti-UX — lógica hostil en JavaScript puro */
(function () {
  "use strict";

  var COUNTRIES_BY_GDP = ["Estados Unidos","China","Alemania","Japón","India","Reino Unido","Francia","Italia","Brasil","Canadá","Rusia","México","Australia","Corea del Sur","España","Indonesia","Países Bajos","Turquía","Arabia Saudita","Suiza","Polonia","Taiwán","Bélgica","Argentina","Suecia","Irlanda","Noruega","Austria","Israel","Tailandia","Singapur","Emiratos Árabes Unidos","Filipinas","Vietnam","Bangladesh","Malasia","Dinamarca","Sudáfrica","Hong Kong","Egipto","Colombia","Chile","Finlandia","Rumanía","República Checa","Portugal","Perú","Nueva Zelanda","Grecia","Kazajistán"];

  var MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  var LETTERS = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
  function shuffle(arr) {

    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  var mouse = { x: 0, y: 0 };

  window.addEventListener("mousemove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
  /* ---------- Sección 6: música de ascensor ---------- */

  var muted = false, gainNode = null, started = false;
  function startMusic() {
    if (started) return;
    started = true;

    

    var Ctx = window.AudioContext || window.webkitAudioContext;
    var ctx = new Ctx();
    gainNode = ctx.createGain();
    gainNode.gain.value = muted ? 0 : 0.07;
    gainNode.connect(ctx.destination);
    var melody = [523.25, 587.33, 659.25, 587.33, 523.25, 440, 493.88, 523.25];
    var i = 0;
    function note() {
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = melody[i % melody.length];
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
      osc.connect(g); g.connect(gainNode);
      osc.start(); osc.stop(ctx.currentTime + 0.6);
      i++;
    }
    note();
    setInterval(note, 620);
  }
  ["pointerdown", "keydown", "mousemove"].forEach(function (ev) {
    window.addEventListener(ev, startMusic);
  });

  /* ---------- Sección 6: el ladrón roba el botón de silencio ---------- */
  var thiefBox = document.getElementById("thiefBox");
  var thiefImg = document.getElementById("thiefImg");
  var muteBtn = document.getElementById("muteBtn");
  thiefImg.src = THIEF_SRC;
  thiefBox.style.left = (window.innerWidth - 170) + "px";
  var fleeing = false;

  muteBtn.addEventListener("click", function () {
    muted = !muted;
    if (gainNode) gainNode.gain.value = muted ? 0 : 0.07;
    muteBtn.textContent = "🔊 " + (muted ? "Activar" : "Silenciar");
  });

  setInterval(function () {
    if (fleeing) return;
    var r = thiefBox.getBoundingClientRect();
    var cx = Math.max(r.left, Math.min(mouse.x, r.right));
    var cy = Math.max(r.top, Math.min(mouse.y, r.bottom));
    if (Math.hypot(mouse.x - cx, mouse.y - cy) < 50) {
      fleeing = true;
      thiefBox.classList.add("fleeing");
      setTimeout(function () {
        thiefBox.style.left = Math.random() * Math.max(50, window.innerWidth - 220) + "px";
        thiefBox.style.top = Math.random() * Math.max(50, window.innerHeight - 120) + "px";
        setTimeout(function () {
          fleeing = false;
          thiefBox.classList.remove("fleeing");
        }, 350);
      }, 120);
    }
  }, 40);

  /* ---------- Sección 7: enjambre de cursores malvados ---------- */
  var layer = document.getElementById("evilLayer");
  var counter = document.getElementById("evilCounter");
  var evils = [{ x: 40, y: 40, touching: false }];

  (function loop() {
    var spawned = [];
    for (var i = 0; i < evils.length; i++) {
      var e = evils[i];
      var dx = mouse.x - e.x, dy = mouse.y - e.y;
      var d = Math.hypot(dx, dy) || 1;
      e.x += (dx / d) * 2.2;
      e.y += (dy / d) * 2.2;
      if (d < 8) {
        // Solo se duplica en el instante del contacto
        if (!e.touching) {
          e.touching = true;
          spawned.push({ x: e.x + (Math.random() * 40 - 20), y: e.y + (Math.random() * 40 - 20), touching: true });
        }
      } else if (d > 60) {
        e.touching = false;
      }
    }
    if (spawned.length) {
      evils = evils.concat(spawned);
      counter.textContent = "Cursores enemigos activos: " + evils.length;
    }
    while (layer.childElementCount < evils.length) {
      var el = document.createElement("div");
      el.className = "evil";
      layer.appendChild(el);
    }
    for (var k = 0; k < evils.length; k++) {
      layer.children[k].style.transform = "translate(" + evils[k].x + "px," + evils[k].y + "px)";
    }
    requestAnimationFrame(loop);
  })();

  /* ---------- Sección 1: engaño del CV ---------- */
  var cv = document.getElementById("cv");
  var uploadBtn = document.getElementById("uploadBtn");
  var overlay = document.getElementById("spinnerOverlay");
  var barWrap = document.getElementById("barWrap");
  var barFill = document.getElementById("barFill");
  var barText = document.getElementById("barText");
  var resultBox = document.getElementById("resultBox");
  var busy = false;

  uploadBtn.addEventListener("click", function () { cv.click(); });
  cv.addEventListener("change", function () {
    if (busy || !cv.files || !cv.files.length) return; // espera a que elija archivo
    busy = true;
    resultBox.hidden = true;
    barWrap.hidden = true;
    overlay.classList.add("on");           // rueda gigante: 5 segundos
    setTimeout(function () {
      overlay.classList.remove("on");
      barWrap.hidden = false;
      var t0 = Date.now();
      var id = setInterval(function () {
        var el = Date.now() - t0, p;
        if (el < 4000) p = (el / 4000) * 47;
        else if (el < 7000) p = 47;        // pausa visual: parece congelado
        else p = 47 + ((el - 7000) / 3000) * 53;
        p = Math.min(100, p);
        barFill.style.width = p + "%";
        barText.textContent = Math.floor(p) + "% — Analizando documento con inteligencia artificial…";
        if (el >= 10000) {                 // 10 segundos en total
          clearInterval(id);
          barFill.style.width = "100%";
          barText.textContent = "100% — Analizando documento con inteligencia artificial…";
          resultBox.hidden = false;
          busy = false;
        }
      }, 80);
    }, 5000);
  });

  /* ---------- Sección 2: datepicker hostil ---------- */
  var birth = document.getElementById("birth");
  var calendar = document.getElementById("calendar");
  var monthLabel = document.getElementById("monthLabel");
  var dayBtn = document.getElementById("dayBtn");
  var now = new Date();
  var month = now.getMonth(), year = now.getFullYear();
  var day = new Date(year, month + 1, 0).getDate();

  function renderCal() {
    monthLabel.textContent = MONTHS[month] + " " + year;
    dayBtn.textContent = day;
  }
  renderCal();

  birth.addEventListener("keydown", function (e) { e.preventDefault(); });
  birth.addEventListener("click", function () { calendar.hidden = !calendar.hidden; });
  document.getElementById("prevMonth").addEventListener("click", function () {
    var m = month === 0 ? 11 : month - 1;
    var y = month === 0 ? year - 1 : year;
    month = m; year = y;
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
    o.value = c; o.textContent = c;
    country.appendChild(o);
  });

  /* ---------- Sección 2: teléfono que nunca se borra solo ---------- */
  var phone = document.getElementById("phone");
  var phoneValue = "000-000-0000";
  function toEnd() { phone.setSelectionRange(phone.value.length, phone.value.length); }
  phone.addEventListener("click", toEnd);
  phone.addEventListener("focus", toEnd);
  phone.addEventListener("input", function () {
    var next = phone.value;
    if (next.length > phoneValue.length) {
      var added = next.length - phoneValue.length, typed = "";
      for (var i = 0; i < next.length; i++) {
        if (phoneValue[i] !== next[i]) { typed = next.slice(i, i + added); break; }
      }
      phoneValue = phoneValue + typed;   // todo se añade SIEMPRE al final
    } else {
      phoneValue = next;
    }
    phone.value = phoneValue;
    toEnd();
  });

  /* ---------- Sección 3: teclado virtual que se baraja ---------- */
  var skillDraft = document.getElementById("skillDraft");
  var keyboard = document.getElementById("keyboard");
  var skillList = document.getElementById("skillList");
  var keys = LETTERS.slice();
  var skills = [];
  skillDraft.addEventListener("keydown", function (e) { e.preventDefault(); });

  function renderKeyboard() {
    keyboard.innerHTML = "";
    keys.forEach(function (k) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = k;
      b.addEventListener("click", function () {
        skillDraft.value += k;
        keys = shuffle(keys);   // trampa: todas las letras cambian de sitio
        renderKeyboard();
      });
      keyboard.appendChild(b);
    });
    [["ESPACIO", "wide", function () { skillDraft.value += " "; }],
     ["BORRAR", "wide", function () { skillDraft.value = skillDraft.value.slice(0, -1); }],
     ["AÑADIR", "wider", function () {
        if (skillDraft.value.trim()) { skills.push(skillDraft.value.trim()); renderSkills(); }
        skillDraft.value = "";
     }]].forEach(function (cfg) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = cfg[0]; b.className = cfg[1];
      b.addEventListener("click", function () { cfg[2](); keys = shuffle(keys); renderKeyboard(); });
      keyboard.appendChild(b);
    });
  }
  function renderSkills() {
    skillList.innerHTML = "";
    skills.forEach(function (s) {
      var li = document.createElement("li"); li.textContent = s; skillList.appendChild(li);
    });
  }
  renderKeyboard();

  /* ---------- Sección 4: la carta se come a sí misma ---------- */
  var letter = document.getElementById("letter");
  var letterCount = document.getElementById("letterCount");
  letter.addEventListener("input", function () {
    var t = letter.value;
    while (t.length > 50) t = t.slice(1);   // borra el PRIMER carácter
    letter.value = t;
    letterCount.textContent = t.length + "/50 caracteres";
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
    phoneValue = "000-000-0000"; phone.value = phoneValue;
    skillDraft.value = ""; skills = []; renderSkills();
    letter.value = ""; letterCount.textContent = "0/50 caracteres";
    document.getElementById("history").value = "";
    barFill.style.width = "0%"; barWrap.hidden = true; resultBox.hidden = true;
  });
  tinyGray.addEventListener("click", function () {
    window.alert("Su solicitud ha sido enviada al vacío.");
  });
})();
