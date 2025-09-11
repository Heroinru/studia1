// Плавная прокрутка по якорным ссылкам
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    // Клик по бургеру — переключаем меню
    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        navUl.classList.toggle('active');
    });

    // Закрытие меню при клике по ссылке
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
        container.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
        `;
        document.body.appendChild(container);
    }
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    const colors = {
        success: { bg: '#4CAF50', color: '#fff' },
        error: { bg: '#f44336', color: '#fff' },
        info: { bg: '#2196F3', color: '#fff' }
    };
    notification.style.cssText = `
        background: ${colors[type].bg};
        color: ${colors[type].color};
        padding: 15px 20px;
        border-radius: 5px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 350px;
        word-wrap: break-word;
    `;
    container.appendChild(notification);
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
};

// Карусель галереи (упрощенная версия)
class GalleryCarousel {
    constructor() {
        this.carousel = document.querySelector('.gallery-carousel');
        if (!this.carousel) return;
        this.track = this.carousel.querySelector('.carousel-track');
        this.items = this.carousel.querySelectorAll('.gallery-item');
        this.prevBtn = this.carousel.querySelector('.carousel-btn-prev');
        this.nextBtn = this.carousel.querySelector('.carousel-btn-next');
        this.indicators = this.carousel.querySelectorAll('.indicator');
        this.currentSlide = 0;
        this.totalSlides = this.items.length;
        this.autoplayInterval = null;
        this.init();
    }
    init() {
        if (!this.track || this.totalSlides === 0) return;
        this.prevBtn?.addEventListener('click', () => this.prevSlide());
        this.nextBtn?.addEventListener('click', () => this.nextSlide());
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        this.startAutoplay();
        this.updateCarousel();
    }
    prevSlide() {
        this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
        this.updateCarousel();
    }
    nextSlide() {
        this.currentSlide = this.currentSlide === this.totalSlides - 1 ? 0 : this.currentSlide + 1;
        this.updateCarousel();
    }
    goToSlide(index) {
        if (index >= 0 && index < this.totalSlides) {
            this.currentSlide = index;
            this.updateCarousel();
        }
    }
    updateCarousel() {
        this.track.style.transform = `translateX(-${this.currentSlide * 100}%)`;
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
    }
    startAutoplay() {
        this.autoplayInterval = setInterval(() => this.nextSlide(), 5000);
    }
}

// Яндекс Карты (упрощенная версия)
class YandexMapIntegration {
    constructor() {
        this.mapContainer = document.getElementById('yandex-map');
        this.fallback = document.querySelector('.map-fallback');
        this.loadButton = document.getElementById('load-map-btn');
        this.coordinates = [55.688209, 37.296337];
        this.mapLoaded = false;
        this.init();
    }
    init() {
        if (!this.mapContainer) return;
        this.loadButton?.addEventListener('click', () => this.loadYandexMaps());
        setTimeout(() => this.loadYandexMaps(), 2000);
    }
    loadYandexMaps() {
        if (this.mapLoaded) return;
        this.mapLoaded = true;
        if (this.fallback) this.fallback.innerHTML = '<p>Карта загружается...</p>';
        const script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
        script.async = true;
        script.onload = () => ymaps.ready(() => {
            const map = new ymaps.Map(this.mapContainer, {
                center: this.coordinates,
                zoom: 16,
                controls: ['zoomControl']
            });
            const placemark = new ymaps.Placemark(this.coordinates, {
                balloonContent: 'Детская Изостудия<br>Творческое развитие детей'
            });
            map.geoObjects.add(placemark);
            if (this.fallback) this.fallback.style.display = 'none';
        });
        script.onerror = () => {
            if (this.fallback) this.fallback.innerHTML = '<p>❌ Не удалось загрузить карту</p>';
        };
        document.head.appendChild(script);
    }
}

// Обработка формы с минимальной валидацией
class ContactFormHandler {
    constructor() {
        this.form = document.querySelector('.contact-form form');
        if (this.form) this.init();
    }
    init() {
        this.form.addEventListener('submit', e => this.handleSubmit(e));
        this.form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', () => {
                field.style.borderColor = '#e0e0e0';
                field.parentNode.querySelector('.field-error')?.remove();
            });
        });
    }
    handleSubmit(e) {
        e.preventDefault();
        if (!this.validateRequiredFields()) {
            showNotification('Пожалуйста, заполните все обязательные поля', 'error');
            return;
        }
        showNotification('Отправляем заявку...', 'info');
        setTimeout(() => this.form.submit(), 500);
    }
    validateRequiredFields() {
        let valid = true;
        this.form.querySelectorAll('[required]').forEach(field => {
            const v = field.value.trim();
            if (!v) {
                this.showError(field, 'Заполните это поле');
                valid = false;
            } else if (field.type === 'email' && !v.includes('@')) {
                this.showError(field, 'Введите корректный email');
                valid = false;
            } else if (field.type === 'tel' && v.length < 10) {
                this.showError(field, 'Введите номер телефона');
                valid = false;
            } else {
                field.style.borderColor = '#4CAF50';
            }
        });
        return valid;
    }
    showError(field, msg) {
        field.style.borderColor = '#f44336';
        const div = document.createElement('div');
        div.className = 'field-error';
        div.textContent = msg;
        div.style.cssText = 'color:#f44336;font-size:12px;margin-top:5px;';
        field.parentNode.appendChild(div);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    createMobileMenu();
    observeElements();
    new GalleryCarousel();
    new YandexMapIntegration();
    new ContactFormHandler();
});
