// Плавная прокрутка по якорным ссылкам
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        // Обрабатываем все ссылки, но для “Галереи” будем скроллить к #gallery
        if (href === '#masterclasses') {
            e.preventDefault();
            const target = document.getElementById('gallery');
            if (target) {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const offset = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({ top: offset, behavior: 'smooth' });
            }
        } else {
            // Обычные якорные ссылки работают как раньше
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const offset = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({ top: offset, behavior: 'smooth' });
            }
        }
    });
});


// Показ/скрытие мобильного меню
const createMobileMenu = () => {
    const nav = document.querySelector('.nav');
    const navUl = nav.querySelector('ul');
    const burger = document.createElement('div');
    burger.className = 'burger';
    burger.innerHTML = `<span></span><span></span><span></span>`;
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

// Анимация появления элементов при скролле
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
        container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:10000;';
        document.body.appendChild(container);
    }
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    const colors = {
        success: { bg: '#4CAF50', color: '#fff' },
        error:   { bg: '#f44336', color: '#fff' },
        info:    { bg: '#2196F3', color: '#fff' }
    };
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

// Карусель галереи, работает для любого количества .gallery-carousel
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
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        this.indicators.forEach((ind, i) => {
            ind.addEventListener('click', () => this.goToSlide(i));
        });
        this.autoplayInterval = setInterval(() => this.nextSlide(), 5000);
    }
    updateCarousel() {
        this.track.style.transform = `translateX(-${this.currentSlide * 100}%)`;
        this.indicators.forEach((ind, i) => {
            ind.classList.toggle('active', i === this.currentSlide);
        });
    }
    prevSlide() {
        this.currentSlide = this.currentSlide === 0 
            ? this.totalSlides - 1 
            : this.currentSlide - 1;
        this.updateCarousel();
    }
    nextSlide() {
        this.currentSlide = this.currentSlide === this.totalSlides - 1 
            ? 0 
            : this.currentSlide + 1;
        this.updateCarousel();
    }
    goToSlide(index) {
        if (index >= 0 && index < this.totalSlides) {
            this.currentSlide = index;
            this.updateCarousel();
        }
    }
}

// Яндекс Карты (упрощенная версия)
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
        if (this.fallback) this.fallback.textContent = 'Карта загружается...';
        const script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
        script.async = true;
        script.onload = () => ymaps.ready(() => {
            const map = new ymaps.Map(this.mapContainer, {
                center: this.coordinates, zoom: 16
            });
            map.geoObjects.add(new ymaps.Placemark(
                this.coordinates,
                { balloonContent: 'Детская Изостудия<br>Творческое развитие детей' }
            ));
            this.fallback.style.display = 'none';
        });
        document.head.appendChild(script);
    }
}

// Обработка формы с минимальной валидацией
class ContactFormHandler {
    constructor() {
        this.form = document.querySelector('.contact-form form');
        if (!this.form) return;
        this.form.addEventListener('submit', e => this.handleSubmit(e));
        this.form.querySelectorAll('input, select, textarea')
            .forEach(f => f.addEventListener('input', () => {
                f.style.borderColor = '';
                f.parentNode.querySelector('.field-error')?.remove();
            }));
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
        let ok = true;
        this.form.querySelectorAll('[required]').forEach(f => {
            const v = f.value.trim();
            if (!v || (f.type === 'email' && !v.includes('@')) || (f.type === 'tel' && v.length < 10)) {
                this.showError(f, 'Введите корректное значение');
                ok = false;
            } else {
                f.style.borderColor = '#4CAF50';
            }
        });
        return ok;
    }
    showError(f, msg) {
        f.style.borderColor = '#f44336';
        const d = document.createElement('div');
        d.className = 'field-error';
        d.textContent = msg;
        d.style.cssText = 'color:#f44336;font-size:12px;margin-top:5px;';
        f.parentNode.appendChild(d);
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    createMobileMenu();
    observeElements();
    document.querySelectorAll('.gallery-carousel')
        .forEach(node => new GalleryCarousel(node));
    new YandexMapIntegration();
    new ContactFormHandler();
});
