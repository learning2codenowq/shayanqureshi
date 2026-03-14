/* ============================================
   NAVBAR — scroll effect + mobile toggle
============================================ */
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

navToggle.addEventListener('click', () => {
  navMobile.classList.toggle('open');
});

// Close mobile nav when a link is clicked
navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMobile.classList.remove('open');
  });
});

/* ============================================
   FADE-IN-UP — intersection observer
============================================ */
const fadeEls = document.querySelectorAll('.fade-in-up');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

fadeEls.forEach(el => observer.observe(el));

/* ============================================
   FAQ — accordion
============================================ */
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');

  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // Close all
    faqItems.forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-answer').style.maxHeight = null;
    });

    // Open clicked if it was closed
    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

/* ============================================
   SMOOTH SCROLL — offset for fixed navbar
============================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================
   STAGGERED ANIMATION DELAYS — cards
============================================ */
document.querySelectorAll('.programs-grid .program-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.08}s`;
});

document.querySelectorAll('.testimonials-grid .testimonial-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.08}s`;
});

/* ============================================
   RESOURCES FORM
============================================ */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwzb7gHAJLOH58f3Knm9FmItPnpW1rO3x9_lKXPoJcsSW0VEdesL-dt490ML6DlGnJILg/exec';
const RECAPTCHA_SITE_KEY = '6LcHCn0sAAAAAEVEgqRjkOpVDIcthP-Q4h5Y7USW';

const submitBtn = document.getElementById('resourcesSubmit');
const formError = document.getElementById('form-error');

function unlockResources() {
  document.getElementById('resourcesForm').style.display = 'none';
  document.getElementById('resourcesSuccess').style.display = 'block';

  document.querySelectorAll('.resource-lock').forEach(lock => {
    lock.classList.add('hidden');
  });
  document.querySelectorAll('.resource-btn').forEach(btn => {
    btn.classList.add('unlocked');
    btn.style.display = 'block';
  });

  document.querySelector('.resource-cards').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showError(msg) {
  formError.textContent = msg;
  formError.style.display = 'block';
}

function sendToSheet(name, email, whatsapp, agreed, token) {
  // Create a hidden iframe to handle the response
  const iframe = document.createElement('iframe');
  iframe.name = 'hidden-iframe';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  // Create a hidden form
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = SCRIPT_URL;
  form.target = 'hidden-iframe';

  const fields = { name, email, whatsapp, agreed, token };
  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();

  // Clean up after submission
  setTimeout(() => {
    document.body.removeChild(form);
    document.body.removeChild(iframe);
  }, 5000);
}

if (submitBtn) {
  submitBtn.addEventListener('click', async () => {
    const name = document.getElementById('res-name').value.trim();
    const email = document.getElementById('res-email').value.trim();
    const whatsapp = document.getElementById('res-country').value.trim();
    const agreed = document.getElementById('res-agree').checked;

    formError.style.display = 'none';

    if (!name) return showError('Please enter your full name.');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('Please enter a valid email address.');
    if (!agreed) return showError('Please agree to receive updates to unlock the resources.');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Unlocking...';

    try {
      const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' });
      sendToSheet(name, email, whatsapp, agreed, token);
      unlockResources();
    } catch (err) {
      unlockResources();
    }
  });
  
}
/* ============================================
   RECITATION AUDIO PLAYER
============================================ */
const audio = document.getElementById('recitationAudio');
const playBtn = document.getElementById('recitationPlayBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const progressBar = document.getElementById('recitationProgress');
const progressWrap = document.getElementById('recitationProgressWrap');
const timeDisplay = document.getElementById('recitationTime');

if (audio && playBtn) {
  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
    } else {
      audio.pause();
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
    }
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = pct + '%';
    const mins = Math.floor(audio.currentTime / 60);
    const secs = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
    timeDisplay.textContent = `${mins}:${secs}`;
  });

  progressWrap.addEventListener('click', (e) => {
    const rect = progressWrap.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
  });

  audio.addEventListener('ended', () => {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    progressBar.style.width = '0%';
    timeDisplay.textContent = '0:00';
  });
}
/* ============================================
   STICKY MOBILE CTA — hide in hero
============================================ */
const mobileCta = document.getElementById('mobileCta');

if (mobileCta) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      mobileCta.style.opacity = '1';
      mobileCta.style.pointerEvents = 'auto';
      mobileCta.style.transform = 'translateY(0)';
    } else {
      mobileCta.style.opacity = '0';
      mobileCta.style.pointerEvents = 'none';
      mobileCta.style.transform = 'translateY(100%)';
    }
  });

  // Initial state
  mobileCta.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  mobileCta.style.opacity = '0';
  mobileCta.style.transform = 'translateY(100%)';
  mobileCta.style.pointerEvents = 'none';
}