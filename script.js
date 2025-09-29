// script.js

// Плавная прокрутка по якорям и закрытие мобильного меню
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    const targetId = href.substring(1);
    const target = document.getElementById(targetId);
    if (target) {
      const headerHeight = document.querySelector('.header').offsetHeight || 0;
      const offset = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
    const navMenu = document.getElementById('nav-menu');
    const burgerBtn = document.getElementById('burger');
    if (navMenu && navMenu.classList.contains('show')) {
      navMenu.classList.remove('show');
      burgerBtn.classList.remove('active');
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {

  // Бургер-меню
  const burger = document.getElementById('burger');
  const navMenu = document.getElementById('nav-menu');
  if (burger && navMenu) {
    burger.addEventListener('click', () => {
      navMenu.classList.toggle('show');
      burger.classList.toggle('active');
    });
    // Закрытие меню при клике по ссылке
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('show');
        burger.classList.remove('active');
      });
    });
  }

  // Анимация появления элементов
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });

  // Инициализация каруселей
  document.querySelectorAll('.gallery-carousel, .about-carousel').forEach(root => {
    new GalleryCarousel(root);
  });

  // Инициализация карты
  new YandexMapIntegration();

  // Обработка формы
  new ContactFormHandler();

  // Свайп для карусели на мобильных
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints;
  document.querySelectorAll('.gallery-carousel, .about-carousel').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    let startX = 0, moved = false;
    if (isTouch && track) {
      track.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        moved = false;
      });
      track.addEventListener('touchmove', () => moved = true);
      track.addEventListener('touchend', e => {
        if (!moved) return;
        const delta = e.changedTouches[0].clientX - startX;
        const threshold = 50;
        if (delta < -threshold) carousel.querySelector('.carousel-btn-next').click();
        else if (delta > threshold) carousel.querySelector('.carousel-btn-prev').click();
      });
    }
  });

  // Кнопки "Подробнее"/"Свернуть" в программах
  document.querySelectorAll('.btn-program').forEach(button => {
    button.addEventListener('click', () => {
      const content = button.closest('.program-content');
      const benefits = content.querySelector('.program-benefits');
      const fullDesc = content.querySelector('.program-full-description');
      benefits.classList.toggle('hidden');
      fullDesc.classList.toggle('open');
      if (fullDesc.classList.contains('open')) {
        button.textContent = 'Свернуть';
        button.classList.add('active');
      } else {
        button.textContent = 'Подробнее';
        button.classList.remove('active');
      }
    });
  });

  // Расписание: кнопка "Расписание занятий"
  const scheduleToggle = document.getElementById('schedule-toggle');
  const scheduleContent = document.getElementById('schedule-content');
  if (scheduleToggle && scheduleContent) {
    scheduleToggle.addEventListener('click', () => {
      const isVisible = scheduleContent.classList.contains('show');
      if (isVisible) {
        scheduleContent.classList.remove('show');
        scheduleToggle.classList.remove('active');
        setTimeout(() => scheduleContent.style.display = 'none', 300);
      } else {
        scheduleContent.style.display = 'block';
        setTimeout(() => scheduleContent.classList.add('show'), 10);
        scheduleToggle.classList.add('active');
      }
    });
  }

  // Цены: кнопка "Цены"
  const pricesToggle = document.getElementById('prices-toggle');
  const pricesContent = document.getElementById('prices-content');
  if (pricesToggle && pricesContent) {
    pricesToggle.addEventListener('click', () => {
      const isVisible = pricesContent.classList.contains('show');
      if (isVisible) {
        pricesContent.classList.remove('show');
        pricesToggle.classList.remove('active');
        setTimeout(() => pricesContent.style.display = 'none', 300);
      } else {
        pricesContent.style.display = 'block';
        setTimeout(() => pricesContent.classList.add('show'), 10);
        pricesToggle.classList.add('active');
      }
    });
  }

  // Контакты: кнопка-ссылка "Смотреть расписание"
  const scheduleLinkBtn = document.getElementById('schedule-link-btn');
  if (scheduleLinkBtn) {
    scheduleLinkBtn.addEventListener('click', () => {
      const scheduleSection = document.getElementById('schedule-section');
      if (scheduleSection) {
        scheduleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (scheduleContent && !scheduleContent.classList.contains('show')) {
          setTimeout(() => {
            scheduleContent.style.display = 'block';
            setTimeout(() => scheduleContent.classList.add('show'), 10);
            scheduleToggle.classList.add('active');
          }, 500);
        }
      }
    });
  }

});
