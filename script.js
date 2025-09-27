// Плавная прокрутка по якорям
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        const targetId = href === '#masterclasses' ? 'masterclasses' : href.substring(1);
        const target = document.getElementById(targetId);
        if (target) {
            const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
            const offset = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            window.scrollTo({ top: offset, behavior: 'smooth' });
        }
    });
});

// Мобильное меню
const createMobileMenu = () => {
    const nav = document.querySelector('.nav');
    const navUl = nav.querySelector('ul');
    const burger = document.createElement('div');
    burger.className = 'burger';
    burger.innerHTML = '<span></span><span></span><span></span>';
    nav.appendChild(burger);
    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        navUl.classList.toggle('active');
    });
    navUl.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            navUl.classList.remove('active');
        });
    });
};

// Анимация появления
const observeElements = () => {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    const style = document.createElement('style');
    style.textContent = `
        .fade-in {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
    `;
    document.head.appendChild(style);
    document.querySelectorAll('.program-card, .about-content').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
};

// Уведомления
const showNotification = (message, type = 'info') => {
    let container = document.querySelector('.notifications');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notifications';
        Object.assign(container.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '10000'
        });
        document.body.appendChild(container);
    }
    const notification = document.createElement('div');
    const colors = {
        success: { bg: '#4CAF50', color: '#fff' },
        error:   { bg: '#f44336', color: '#fff' },
        info:    { bg: '#2196F3', color: '#fff' }
    };
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    Object.assign(notification.style, {
        background: colors[type].bg,
        color: colors[type].color,
        padding: '15px 20px',
        borderRadius: '5px',
        marginBottom: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '350px',
        wordWrap: 'break-word'
    });
    container.appendChild(notification);
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
};

// Класс карусели
class GalleryCarousel {
    constructor(root) {
        this.carousel = root;
        this.track = root.querySelector('.carousel-track');
        this.items = root.querySelectorAll('.gallery-item');
        this.prevBtn = root.querySelector('.carousel-btn-prev');
        this.nextBtn = root.querySelector('.carousel-btn-next');
        this.indicators = root.querySelectorAll('.indicator');
        this.currentSlide = 0;
        this.totalSlides = this.items.length;
        if (this.totalSlides === 0) return;
        this.init();
    }
    init() {
        this.updateCarousel();
        this.prevBtn.addEventListener('click', () => this.changeSlide(this.currentSlide - 1));
        this.nextBtn.addEventListener('click', () => this.changeSlide(this.currentSlide + 1));
        this.indicators.forEach((ind, i) => {
            ind.addEventListener('click', () => this.changeSlide(i));
        });
    }
    changeSlide(index) {
        this.currentSlide = (index + this.totalSlides) % this.totalSlides;
        this.updateCarousel();
    }
    updateCarousel() {
        this.track.style.transform = `translateX(-${this.currentSlide * 100}%)`;
        this.indicators.forEach((ind, i) => ind.classList.toggle('active', i === this.currentSlide));
    }
}

// Яндекс.Карты
class YandexMapIntegration {
    constructor() {
        this.mapContainer = document.getElementById('yandex-map');
        this.fallback = document.querySelector('.map-fallback');
        this.loadButton = document.getElementById('load-map-btn');
        this.coordinates = [55.688209, 37.296337];
        if (!this.mapContainer) return;
        this.loadButton?.addEventListener('click', () => this.loadYandexMaps());
        setTimeout(() => this.loadYandexMaps(), 2000);
    }
    loadYandexMaps() {
        if (this.loaded) return;
        this.loaded = true;
        this.fallback.textContent = 'Карта загружается...';
        const script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
        script.async = true;
        script.onload = () => ymaps.ready(() => {
            const map = new ymaps.Map(this.mapContainer, { center: this.coordinates, zoom: 16 });
            map.geoObjects.add(new ymaps.Placemark(this.coordinates, {
                balloonContent: 'Детская Изостудия<br>Творческое развитие детей'
            }));
            this.fallback.style.display = 'none';
        });
        document.head.appendChild(script);
    }
}

// Обработка формы
class ContactFormHandler {
    constructor() {
        this.form = document.querySelector('.contact-form form');
        if (!this.form) return;
        this.form.addEventListener('submit', e => this.handleSubmit(e));
        this.form.querySelectorAll('input, select, textarea').forEach(f => {
            f.addEventListener('input', () => {
                f.style.borderColor = '';
                f.parentNode.querySelector('.field-error')?.remove();
            });
        });
    }
    handleSubmit(e) {
        e.preventDefault();
        if (!this.validate()) {
            showNotification('Пожалуйста, заполните все обязательные поля', 'error');
            return;
        }
        showNotification('Отправляем заявку...', 'info');
        setTimeout(() => this.form.submit(), 500);
    }
    validate() {
        let valid = true;
        this.form.querySelectorAll('[required]').forEach(f => {
            const v = f.value.trim();
            if (!v || (f.type === 'email' && !v.includes('@')) || (f.type === 'tel' && v.length < 10)) {
                this.showError(f, 'Введите корректное значение');
                valid = false;
            } else {
                f.style.borderColor = '#4CAF50';
            }
        });
        return valid;
    }
    showError(field, message) {
        field.style.borderColor = '#f44336';
        const err = document.createElement('div');
        err.className = 'field-error';
        err.textContent = message;
        Object.assign(err.style, {
            color: '#f44336',
            fontSize: '12px',
            marginTop: '5px'
        });
        field.parentNode.appendChild(err);
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    createMobileMenu();
    observeElements();
    document.querySelectorAll('.gallery-carousel, .about-carousel').forEach(el => new GalleryCarousel(el));
    new YandexMapIntegration();
    new ContactFormHandler();

    // Свайп для мобильных
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints;
    document.querySelectorAll('.gallery-carousel, .about-carousel').forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        let startX = 0, moved = false;
        if (isTouch) {
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
});

// script.js — добавьте в конец файла
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.btn-program').forEach(button => {
    button.addEventListener('click', function() {
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
});
