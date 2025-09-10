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

    const style = document.createElement('style');
    style.textContent = `
        .burger { display: none; flex-direction: column; cursor: pointer; padding: 5px; }
        .burger span { width: 25px; height: 3px; background: #333; margin: 3px 0; transition: 0.3s; border-radius: 2px; }
        .burger.active span:nth-child(1) { transform: rotate(-45deg) translate(-5px, 6px); }
        .burger.active span:nth-child(2) { opacity: 0; }
        .burger.active span:nth-child(3) { transform: rotate(45deg) translate(-5px, -6px); }
        @media (max-width: 768px) {
            .burger { display: flex; }
            .nav ul {
                position: fixed; top: 100%; left: 0; width: 100%; background: white;
                flex-direction: column; padding: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                transform: translateY(-100vh); transition: transform 0.3s;
            }
            .nav ul.active { transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
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
        container.style.cssText = `
            position: fixed;
            top: 20px; right: 20px; z-index: 10000;
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

    setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 100);
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) notification.parentNode.removeChild(notification);
        }, 300);
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
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
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

        this.loadButton?.addEventListener('click', () => {
            this.loadYandexMaps();
        });

        // Автозагрузка карты через 2 секунды
        setTimeout(() => this.loadYandexMaps(), 2000);
    }

    loadYandexMaps() {
        if (this.mapLoaded) return;
        this.mapLoaded = true;

        if (this.fallback) {
            this.fallback.innerHTML = `
                <p>Карта загружается...</p>
                <div style="width: 32px; height: 32px; border: 3px solid #ff6b6b; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            `;
        }

        const script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/2.1/?apikey=&lang=ru_RU';
        script.async = true;

        script.onload = () => {
            window.ymaps.ready(() => {
                try {
                    const map = new window.ymaps.Map(this.mapContainer, {
                        center: this.coordinates,
                        zoom: 16,
                        controls: ['zoomControl']
                    });

                    const placemark = new window.ymaps.Placemark(this.coordinates, {
                        balloonContent: 'Детская Изостудия<br>Творческое развитие детей'
                    });

                    map.geoObjects.add(placemark);

                    if (this.fallback) {
                        this.fallback.style.display = 'none';
                    }
                } catch (error) {
                    console.error('Ошибка загрузки карты:', error);
                }
            });
        };

        script.onerror = () => {
            if (this.fallback) {
                this.fallback.innerHTML = `
                    <p>❌ Не удалось загрузить карту</p>
                    <button class="btn-map" onclick="window.open('https://yandex.ru/maps/', '_blank')">
                        Открыть в Яндекс.Картах
                    </button>
                `;
            }
        };

        document.head.appendChild(script);
    }
}

// Простая обработка формы с минимальной валидацией
class ContactFormHandler {
    constructor() {
        this.form = document.querySelector('.contact-form form');
        if (this.form) this.init();
    }

    init() {
        this.form.addEventListener('submit', e => this.handleSubmit(e));

        // Убираем красные границы при вводе
        this.form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('input', () => {
                field.style.borderColor = '#e0e0e0';
                const error = field.parentNode.querySelector('.field-error');
                if (error) error.remove();
            });
        });
    }

    handleSubmit(e) {
        e.preventDefault();

        // Минимальная проверка только обязательных полей
        if (!this.validateRequiredFields()) {
            showNotification('Пожалуйста, заполните все обязательные поля', 'error');
            return;
        }

        showNotification('Отправляем заявку...', 'info');

        // Отправляем форму на Getform
        setTimeout(() => {
            this.form.submit();
        }, 500);
    }

    validateRequiredFields() {
        let isValid = true;

        this.form.querySelectorAll('[required]').forEach(field => {
            const value = field.value.trim();

            if (!value) {
                this.showFieldError(field, 'Заполните это поле');
                isValid = false;
            } else {
                // Только базовые проверки
                if (field.type === 'email' && !value.includes('@')) {
                    this.showFieldError(field, 'Введите email с символом @');
                    isValid = false;
                } else if (field.type === 'tel' && value.length < 10) {
                    this.showFieldError(field, 'Введите номер телефона');
                    isValid = false;
                } else if (field.type === 'number') {
                    const age = parseInt(value);
                    if (age < 3 || age > 18) {
                        this.showFieldError(field, 'Возраст от 3 до 18 лет');
                        isValid = false;
                    }
                } else {
                    field.style.borderColor = '#4CAF50';
                }
            }
        });

        return isValid;
    }

    showFieldError(field, message) {
        const oldError = field.parentNode.querySelector('.field-error');
        if (oldError) oldError.remove();

        field.style.borderColor = '#f44336';

        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #f44336;
            font-size: 12px;
            margin-top: 5px;
        `;

        field.parentNode.appendChild(errorDiv);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    createMobileMenu();
    observeElements();
    new GalleryCarousel();
    new YandexMapIntegration();
    new ContactFormHandler();

    console.log('Сайт изостудии загружен успешно!');
});

// Добавляем стили для анимации спиннера
const spinStyle = document.createElement('style');
spinStyle.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(spinStyle);
