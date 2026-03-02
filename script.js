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
  // Hide form wrap, show success message inside card
  document.getElementById('resourcesForm').style.display = 'none';
  document.getElementById('resourcesSuccess').style.display = 'block';

  // Unlock resource cards
  document.querySelectorAll('.resource-lock').forEach(lock => {
    lock.classList.add('hidden');
  });
  document.querySelectorAll('.resource-btn').forEach(btn => {
    btn.classList.add('unlocked');
    btn.style.display = 'block';
  });

  // Smooth scroll to cards
  document.querySelector('.resource-cards').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showError(msg) {
  formError.textContent = msg;
  formError.style.display = 'block';
}

if (submitBtn) {
  submitBtn.addEventListener('click', async () => {
    const name = document.getElementById('res-name').value.trim();
    const email = document.getElementById('res-email').value.trim();
    const whatsapp = document.getElementById('res-whatsapp').value.trim();
    const agreed = document.getElementById('res-agree').checked;

    // Reset error
    formError.style.display = 'none';

    // Validate
    if (!name) return showError('Please enter your full name.');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('Please enter a valid email address.');
    if (!agreed) return showError('Please agree to receive updates to unlock the resources.');

    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Unlocking...';

    try {
      // Get reCAPTCHA token
      const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' });

      // Submit to Google Apps Script — fire and forget
      fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ name, email, whatsapp, agreed, token }),
      });

      // Unlock immediately — don't wait for response
      unlockResources();

    } catch (err) {
      // Still unlock even if something fails — don't penalise the user
      unlockResources();
    }
  });
}