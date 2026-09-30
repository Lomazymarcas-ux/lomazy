/* --- Background canvas particles --- */
(function() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.r = Math.random() * 1.5 + 0.3;
    this.alpha = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.7 ? '#ff6a00' : '#ffffff';
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < 80; i++) particles.push(new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
    ctx.globalAlpha = 0.04;
    ctx.strokeStyle = '#ff6a00';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.globalAlpha = 0.06 * (1 - dist / 120);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  init();
  draw();
})();

/* --- Navbar scroll effect --- */
window.addEventListener('scroll', function() {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
});

/* ===========================
   PHONE MASK + VALIDATION
=========================== */

// DDDs válidos no Brasil
const DDDS_VALIDOS = [
  11,12,13,14,15,16,17,18,19, // SP
  21,22,24,                    // RJ
  27,28,                       // ES
  31,32,33,34,35,37,38,        // MG
  41,42,43,44,45,46,           // PR
  47,48,49,                    // SC
  51,53,54,55,                 // RS
  61,                          // DF
  62,64,                       // GO
  63,                          // TO
  65,66,                       // MT
  67,                          // MS
  68,                          // AC
  69,                          // RO
  71,73,74,75,77,              // BA
  79,                          // SE
  81,87,                       // PE
  82,                          // AL
  83,                          // PB
  84,                          // RN
  85,88,                       // CE
  86,89,                       // PI
  91,93,94,                    // PA
  92,97,                       // AM
  95,                          // RR
  96,                          // AP
  98,99                        // MA
];

function applyPhoneMask(input) {
  // Remove tudo que não for dígito
  let digits = input.value.replace(/\D/g, '').slice(0, 11);

  let formatted = '';
  if (digits.length === 0) {
    formatted = '';
  } else if (digits.length <= 2) {
    formatted = '(' + digits;
  } else if (digits.length <= 6) {
    formatted = '(' + digits.slice(0,2) + ') ' + digits.slice(2);
  } else if (digits.length <= 10) {
    // fixo: (XX) XXXX-XXXX
    formatted = '(' + digits.slice(0,2) + ') ' + digits.slice(2,6) + '-' + digits.slice(6);
  } else {
    // celular: (XX) XXXXX-XXXX
    formatted = '(' + digits.slice(0,2) + ') ' + digits.slice(2,7) + '-' + digits.slice(7);
  }

  input.value = formatted;
}

function validatePhone(input) {
  const digits = input.value.replace(/\D/g, '');

  // Tamanho mínimo: 10 dígitos (fixo) ou 11 (celular)
  if (digits.length < 10) return 'Número incompleto';

  const ddd = parseInt(digits.slice(0, 2), 10);
  if (!DDDS_VALIDOS.includes(ddd)) return 'DDD inválido';

  // Celular deve começar com 9
  if (digits.length === 11 && digits[2] !== '9') return 'Celular deve começar com 9';

  // Sequências inválidas (todos iguais)
  const numPart = digits.slice(2);
  if (/^(\d)\1+$/.test(numPart)) return 'Número inválido';

  return null; // válido
}

function showFieldError(input, msg) {
  input.classList.add('invalid');
  let err = input.parentElement.querySelector('.field-error');
  if (!err) {
    err = document.createElement('span');
    err.className = 'field-error';
    input.parentElement.appendChild(err);
  }
  err.textContent = msg;
}

function clearFieldError(input) {
  input.classList.remove('invalid');
  const err = input.parentElement.querySelector('.field-error');
  if (err) err.remove();
}

// Aplica máscara em tempo real
document.getElementById('f-whats').addEventListener('input', function() {
  applyPhoneMask(this);
  clearFieldError(this);
});

// Quando o browser preenche via autocomplete, formatar também
document.getElementById('f-whats').addEventListener('change', function() {
  applyPhoneMask(this);
});

document.getElementById('f-nome').addEventListener('input', function() {
  clearFieldError(this);
});

document.getElementById('f-email').addEventListener('input', function() {
  clearFieldError(this);
});

function submitLeadForm() {
  const nome  = document.getElementById('f-nome');
  const email = document.getElementById('f-email');
  const whats = document.getElementById('f-whats');

  let valid = true;

  if (!nome.value.trim() || nome.value.trim().split(' ').length < 2) {
    showFieldError(nome, 'Informe nome e sobrenome');
    valid = false;
  } else { clearFieldError(nome); }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
    showFieldError(email, 'Informe um e-mail válido');
    valid = false;
  } else { clearFieldError(email); }

  const phoneErr = validatePhone(whats);
  if (phoneErr) {
    showFieldError(whats, phoneErr);
    valid = false;
  } else { clearFieldError(whats); }

  if (!valid) return;

  // Envia lead por email (Google Apps Script)
  fetch('https://script.google.com/macros/s/AKfycbzwfMfL7blpGDSfgb0qdrXaHSnC546jCSTUu_SlZ-zTA0dyY-64vpLeRIecaBziA7QEhw/exec', {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      nome:     nome.value.trim(),
      email:    email.value.trim(),
      whatsapp: whats.value.trim(),
    })
  }).catch(() => {});

   // Dispara conversão Google Ads
gtag('event', 'conversion', {
  'send_to': 'AW-18011864797/qlirCNzGwYccEN393IxD',
  'value': 1.0,
  'currency': 'BRL'
});

  const primeiroNome = nome.value.trim().split(' ')[0];
  const mensagem = 'Olá! Meu nome é ' + primeiroNome + ' e quero registrar minha marca no INPI.';
  const whatsUrl = 'https://wa.me/5581995689180?text=' + encodeURIComponent(mensagem);

  document.getElementById('success-whats-btn').href = whatsUrl;
  document.getElementById('stage-form').style.display    = 'none';
  document.getElementById('stage-success').style.display = 'block';

  window.open(whatsUrl, '_blank', 'noopener');
}

/* --- FAQ accordion --- */
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

/* --- Scroll fade-in observer --- */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

/* ===========================
   ENERGY PARTICLES — travel along star edges
=========================== */
(function() {
  // Wait for DOM
  const edges = document.querySelectorAll('.star-edge');
  if (!edges.length) return;

  edges.forEach(function(edge) {
    const len = edge.getTotalLength ? edge.getTotalLength() : 600;
    const dotLen = 50;
    const dur = parseFloat(edge.style.getPropertyValue('--dur') || '8') * 1000;
    const delay = parseFloat(edge.style.getPropertyValue('--delay') || '0') * 1000;

    edge.style.strokeDasharray = dotLen + ' ' + (len + dotLen);
    edge.style.strokeDashoffset = len + dotLen;
    edge.style.opacity = '1';

    let start = null;

    function animate(ts) {
      if (!start) start = ts + delay;
      const elapsed = (ts - start) % dur;
      if (elapsed < 0) { requestAnimationFrame(animate); return; }

      const progress = elapsed / dur;
      // ease in-out sine
      const eased = -(Math.cos(Math.PI * progress) - 1) / 2;
      const offset = (len + dotLen) - eased * (len + dotLen * 2);

      // Fade in/out at extremes
      const fadeLen = 0.08;
      let alpha;
      if (progress < fadeLen)        alpha = progress / fadeLen;
      else if (progress > 1-fadeLen) alpha = (1-progress) / fadeLen;
      else                           alpha = 1;

      edge.style.strokeDashoffset = offset;
      edge.style.opacity = (alpha * 0.9).toFixed(3);

      requestAnimationFrame(animate);
    }

    setTimeout(function() {
      requestAnimationFrame(animate);
    }, delay);
  });
})();

/* ===========================
   HERO CANVAS — floating particles
=========================== */
(function() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function Pt() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.18;
    this.vy = (Math.random() - 0.5) * 0.18;
    this.r  = Math.random() * 1.2 + 0.3;
    this.a  = Math.random() * 0.35 + 0.05;
    this.orange = Math.random() > 0.72;
  }

  function init() {
    resize();
    pts = [];
    const count = Math.min(55, Math.floor(W * H / 14000));
    for (let i = 0; i < count; i++) pts.push(new Pt());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.orange ? '#ff6a00' : '#ffffff';
      ctx.globalAlpha = p.a;
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });

    // Faint connecting lines between nearby particles
    ctx.lineWidth = 0.4;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 90) {
          ctx.globalAlpha = 0.04 * (1 - d/90);
          ctx.strokeStyle = '#ff6a00';
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', init);
  init();
  draw();
})();

/* ===========================
   MOUSE PARALLAX — hero star
=========================== */
(function() {
  const wrap = document.getElementById('hero-star-wrap');
  if (!wrap) return;
  let cx = 0, cy = 0, tx = 0, ty = 0;
  let raf;

  document.getElementById('hero').addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    // Normalize -1 to 1
    cx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    cy = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
  });

  document.getElementById('hero').addEventListener('mouseleave', function() {
    cx = 0; cy = 0;
  });

  function loop() {
    // Smooth lerp toward target
    tx += (cx - tx) * 0.04;
    ty += (cy - ty) * 0.04;
    const maxShift = 10; // px — very subtle
    wrap.style.transform =
      'translate(calc(-50% + ' + (tx * maxShift) + 'px), calc(-50% + ' + (ty * maxShift) + 'px))';
    raf = requestAnimationFrame(loop);
  }
  loop();
})();
