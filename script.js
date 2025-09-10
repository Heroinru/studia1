// Плавная прокрутка по якорным ссылкам
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Показ/скрытие мобильного меню
const createMobileMenu = () => {
    const nav = document.querySelector('.nav');
    const navUl = nav.querySelector('ul');

    const burger = document.createElement('div');
    burger.className = 'burger';
    burger.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .burger {
            display: none;
            flex-direction: column;
            cursor: pointer;
            padding: 5px;
        }

        .burger span {
            width: 25px;
            height: 3px;
            background: #333;
            margin: 3px 0;
            transition: 0.3s;
            border-radius: 2px;
        }

        .burger.active span:nth-child(1) {
            transform: rotate(-45deg) translate(-5px, 6px);
        }

        .burger.active span:nth-child(2) {
            opacity: 0;
        }

        .burger.active span:nth-child(3) {
            transform: rotate(45deg) translate(-5px, -6px);
        }

        @media (max-width: 768px) {
            .burger {
                display: flex;
            }

            .nav ul {
                position: fixed;
                top: 100%;
                left: 0;
                width: 100%;
                background: white;
                flex-direction: column;
                padding: 20px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                transform: translateY(-100vh);
                transition: transform 0.3s;
            }

            .nav ul.active {
                transform: translateY(0);
            }
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
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

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
            top: 20px;
            right: 20px;
            z-index: 10000;
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

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
};

// Класс для управления каруселью галереи
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
        this.autoplayDelay = 5000;

        this.init();
    }

    init() {
        if (!this.track || this.totalSlides === 0) return;

        this.setupEventListeners();
        this.setupTouchEvents();
        this.setupKeyboardEvents();
        this.startAutoplay();
        this.updateCarousel();

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoplay();
            } else {
                this.startAutoplay();
            }
        });
    }

    setupEventListeners() {
        this.prevBtn?.addEventListener('click', () => this.prevSlide());
        this.nextBtn?.addEventListener('click', () => this.nextSlide());

        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        this.carousel.addEventListener('mouseenter', () => this.stopAutoplay());
        this.carousel.addEventListener('mouseleave', () => this.startAutoplay());

        this.items.forEach(item => {
            const img = item.querySelector('img');
            img?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openModal(img.src, img.alt);
            });
        });
    }

    setupTouchEvents() {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            this.stopAutoplay();
        }, { passive: true });

        this.track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const diff = startX - currentX;

            const percentage = (diff / this.track.offsetWidth) * 100;
            this.track.style.transform = `translateX(calc(-${this.currentSlide * 100}% - ${percentage}%))`;
        }, { passive: true });

        this.track.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;

            const diff = startX - currentX;
            const threshold = this.track.offsetWidth * 0.2;

            this.track.style.transform = `translateX(-${this.currentSlide * 100}%)`;

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }

            this.startAutoplay();
        }, { passive: true });
    }

    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.isCarouselInView()) return;

            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevSlide();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case ' ':
                    e.preventDefault();
                    this.toggleAutoplay();
                    break;
            }
        });
    }

    isCarouselInView() {
        const rect = this.carousel.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
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
        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoplayDelay);
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    toggleAutoplay() {
        if (this.autoplayInterval) {
            this.stopAutoplay();
        } else {
            this.startAutoplay();
        }
    }

    openModal(src, alt) {
        let modal = document.querySelector('.gallery-modal');

        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'gallery-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <button class="modal-close" aria-label="Закрыть">&times;</button>
                    <img class="modal-image" src="" alt="">
                    <div class="modal-info">
                        <h3></h3>
                        <p></p>
                    </div>
                    <div class="modal-nav">
                        <button class="modal-prev" aria-label="Предыдущее изображение">❮</button>
                        <button class="modal-next" aria-label="Следующее изображение">❯</button>
                    </div>
                </div>
            `;

            const style = document.createElement('style');
            style.textContent = `
                .gallery-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.95);
                    display: none;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                    padding: 20px;
                    box-sizing: border-box;
                }

                .modal-content {
                    position: relative;
                    max-width: 90vw;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .modal-close {
                    position: absolute;
                    top: -40px;
                    right: 0;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 30px;
                    cursor: pointer;
                    z-index: 10001;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: opacity 0.3s;
                }

                .modal-close:hover {
                    opacity: 0.7;
                }

                .modal-image {
                    max-width: 100%;
                    max-height: 70vh;
                    object-fit: contain;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }

                .modal-info {
                    color: white;
                    text-align: center;
                    margin-top: 20px;
                }

                .modal-info h3 {
                    margin: 0 0 5px 0;
                    font-size: 18px;
                }

                .modal-info p {
                    margin: 0;
                    opacity: 0.8;
                }

                .modal-nav {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    pointer-events: none;
                }

                .modal-prev, .modal-next {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: auto;
                    transition: background 0.3s;
                }

                .modal-prev:hover, .modal-next:hover {
                    background: rgba(255,255,255,0.4);
                }

                @media (max-width: 768px) {
                    .modal-close {
                        top: -50px;
                        font-size: 25px;
                    }

                    .modal-prev, .modal-next {
                        width: 40px;
                        height: 40px;
                        font-size: 16px;
                    }
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(modal);

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });

            modal.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
            modal.querySelector('.modal-prev').addEventListener('click', () => this.modalPrev());
            modal.querySelector('.modal-next').addEventListener('click', () => this.modalNext());

            document.addEventListener('keydown', (e) => {
                if (modal.style.display === 'flex') {
                    switch(e.key) {
                        case 'Escape':
                            this.closeModal();
                            break;
                        case 'ArrowLeft':
                            this.modalPrev();
                            break;
                        case 'ArrowRight':
                            this.modalNext();
                            break;
                    }
                }
            });
        }

        const modalImg = modal.querySelector('.modal-image');
        const modalTitle = modal.querySelector('.modal-info h3');
        const modalDesc = modal.querySelector('.modal-info p');

        modalImg.src = src;
        modalImg.alt = alt;

        const currentItem = this.items[this.currentSlide];
        const overlay = currentItem.querySelector('.gallery-overlay');
        if (overlay) {
            modalTitle.textContent = overlay.querySelector('h4')?.textContent || '';
            modalDesc.textContent = overlay.querySelector('p')?.textContent || '';
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.querySelector('.gallery-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    modalPrev() {
        this.prevSlide();
        this.updateModalContent();
    }

    modalNext() {
        this.nextSlide();
        this.updateModalContent();
    }

    updateModalContent() {
        const modal = document.querySelector('.gallery-modal');
        if (modal) {
            const currentItem = this.items[this.currentSlide];
            const img = currentItem.querySelector('img');
            const overlay = currentItem.querySelector('.gallery-overlay');

            const modalImg = modal.querySelector('.modal-image');
            const modalTitle = modal.querySelector('.modal-info h3');
            const modalDesc = modal.querySelector('.modal-info p');

            modalImg.src = img.src;
            modalImg.alt = img.alt;

            if (overlay) {
                modalTitle.textContent = overlay.querySelector('h4')?.textContent || '';
                modalDesc.textContent = overlay.querySelector('p')?.textContent || '';
            }
        }
    }
}

// Класс для работы с Яндекс Картами
class YandexMapIntegration {
    constructor() {
        this.mapContainer = document.getElementById('yandex-map');
        this.fallback = document.querySelector('.map-fallback');
        this.loadButton = document.getElementById('load-map-btn');

        // Координаты студии (пример - центр Москвы, замените на реальные)
        this.coordinates = [55.751244, 37.618423];
        this.mapLoaded = false;

        this.init();
    }

    init() {
        if (!this.mapContainer) return;

        this.loadButton?.addEventListener('click', () => {
            this.loadYandexMaps();
        });

        this.setupIntersectionObserver();

        if (window.innerWidth > 768) {
            setTimeout(() => this.loadYandexMaps(), 1000);
        }
    }

    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.mapLoaded) {
                    setTimeout(() => this.loadYandexMaps(), 500);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '50px'
        });

        observer.observe(this.mapContainer);
    }

    loadYandexMaps() {
        if (this.mapLoaded) return;

        this.showLoadingState();

        if (window.ymaps) {
            this.initializeMap();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/2.1/?apikey=&lang=ru_RU';
        script.async = true;

        script.onload = () => {
            window.ymaps.ready(() => {
                this.initializeMap();
            });
        };

        script.onerror = () => {
            this.showErrorState();
        };

        document.head.appendChild(script);
    }

    initializeMap() {
        try {
            const map = new window.ymaps.Map(this.mapContainer, {
                center: this.coordinates,
                zoom: 16,
                controls: ['zoomControl', 'routeButtonControl']
            }, {
                searchControlProvider: 'yandex#search'
            });

            const placemark = new window.ymaps.Placemark(this.coordinates, {
                balloonContentHeader: 'Детская Изостудия',
                balloonContentBody: 'Творческое развитие детей с 3 лет<br><strong>Телефон:</strong> +7 (912) 345-67-89<br><strong>Режим работы:</strong> Пн-Пт 15:00-20:00, Сб-Вс 10:00-18:00',
                balloonContentFooter: 'г. Москва, ул. Примерная, д. 1, корп. 2',
                hintContent: 'Детская Изостудия - Творческое развитие детей'
            }, {
                iconLayout: 'default#imageWithContent',
                iconImageHref: this.createCustomIcon(),
                iconImageSize: [48, 48],
                iconImageOffset: [-24, -48],
                iconContentOffset: [0, 0],
                hideIconOnBalloonOpen: false
            });

            map.geoObjects.add(placemark);

            map.controls.remove('geolocationControl');
            map.controls.remove('searchControl');
            map.controls.remove('trafficControl');
            map.controls.remove('typeSelector');
            map.controls.remove('fullscreenControl');
            map.controls.remove('rulerControl');

            const routeButton = new window.ymaps.control.Button({
                data: {
                    content: '🚗 Маршрут',
                    title: 'Построить маршрут до студии'
                },
                options: {
                    selectOnClick: false
                }
            });

            routeButton.events.add('click', () => {
                this.openRouteInYandexMaps();
            });

            map.controls.add(routeButton, {
                float: 'right',
                floatIndex: 100
            });

            this.onMapLoaded();

        } catch (error) {
            console.error('Ошибка инициализации карты:', error);
            this.showErrorState();
        }
    }

    createCustomIcon() {
        const svg = `
            <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="20" fill="#ff6b6b" stroke="#fff" stroke-width="4"/>
                <path d="M24 12c-6.627 0-12 5.373-12 12 0 6.627 12 24 12 24s12-17.373 12-24c0-6.627-5.373-12-12-12z" fill="#ff6b6b"/>
                <circle cx="24" cy="20" r="4" fill="#fff"/>
                <text x="24" y="42" text-anchor="middle" fill="#333" font-size="10" font-family="Arial">🎨</text>
            </svg>
        `;

        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    openRouteInYandexMaps() {
        const url = `https://yandex.ru/maps/?rtext=~${this.coordinates[0]},${this.coordinates[1]}&rtt=auto`;
        window.open(url, '_blank');
    }

    showLoadingState() {
        if (this.fallback) {
            this.fallback.innerHTML = `
                <div class="map-loading">
                    <div class="loading-spinner"></div>
                    <p>Загружаем карту...</p>
                </div>
            `;

            if (!document.querySelector('#map-loading-styles')) {
                const style = document.createElement('style');
                style.id = 'map-loading-styles';
                style.textContent = `
                    .map-loading {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 15px;
                    }
                    .loading-spinner {
                        width: 32px;
                        height: 32px;
                        border: 3px solid #ff6b6b;
                        border-top-color: transparent;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }

    showErrorState() {
        if (this.fallback) {
            this.fallback.innerHTML = `
                <div class="map-error">
                    <p>❌ Не удалось загрузить карту</p>
                    <button class="btn-map" onclick="window.open('https://yandex.ru/maps/?text=г. Москва, ул. Примерная, д. 1', '_blank')">
                        Открыть в Яндекс.Картах
                    </button>
                </div>
            `;
        }
    }

    onMapLoaded() {
        this.mapLoaded = true;

        if (this.fallback) {
            this.fallback.classList.add('hidden');
        }

        this.mapContainer.style.opacity = '0';
        setTimeout(() => {
            this.mapContainer.style.transition = 'opacity 0.5s ease';
            this.mapContainer.style.opacity = '1';
        }, 100);

        console.log('Яндекс.Карта успешно загружена');
    }
}

// Улучшенная обработка формы с валидацией
class ContactFormHandler {
    constructor() {
        this.form = document.querySelector('.contact-form form');
        this.submitButton = this.form?.querySelector('button[type="submit"]');

        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        this.form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.clearErrors(field));
        });

        const phoneInput = this.form.querySelector('input[type="tel"]');
        if (phoneInput) {
            phoneInput.addEventListener('input', this.formatPhone);
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
            return;
        }

        this.showLoadingState();

        try {
            const formData = this.collectFormData();
            await this.simulateSubmission(formData);
            this.onSubmissionSuccess();

        } catch (error) {
            console.error('Ошибка отправки формы:', error);
            this.onSubmissionError(error);
        } finally {
            this.hideLoadingState();
        }
    }

    validateForm() {
        let isValid = true;
        const requiredFields = this.form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Это поле обязательно для заполнения';
        }

        if (value) {
            switch (field.type) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Введите корректный email';
                    }
                    break;

                case 'tel':
                    const phoneRegex = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/;
                    if (!phoneRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Введите корректный номер телефона';
                    }
                    break;

                case 'number':
                    const age = parseInt(value);
                    if (age < 3 || age > 18) {
                        isValid = false;
                        errorMessage = 'Возраст должен быть от 3 до 18 лет';
                    }
                    break;
            }
        }

        this.showFieldError(field, isValid ? '' : errorMessage);
        return isValid;
    }

    showFieldError(field, message) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        if (message) {
            field.style.borderColor = '#f44336';

            const errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.textContent = message;
            errorElement.style.cssText = `
                color: #f44336;
                font-size: 12px;
                margin-top: 5px;
                animation: slideDown 0.3s ease;
            `;

            field.parentNode.appendChild(errorElement);
        } else {
            field.style.borderColor = '#4CAF50';
        }
    }

    clearErrors(field) {
        field.style.borderColor = '#e0e0e0';
        const error = field.parentNode.querySelector('.field-error');
        if (error) {
            error.remove();
        }
    }

    formatPhone(e) {
        let value = e.target.value.replace(/\D/g, '');

        if (value.startsWith('8')) {
            value = '7' + value.slice(1);
        }

        if (value.startsWith('7')) {
            value = value.slice(1);
        }

        let formatted = '+7';
        if (value.length > 0) {
            formatted += ' (' + value.substring(0, 3);
        }
        if (value.length >= 4) {
            formatted += ') ' + value.substring(3, 6);
        }
        if (value.length >= 7) {
            formatted += '-' + value.substring(6, 8);
        }
        if (value.length >= 9) {
            formatted += '-' + value.substring(8, 10);
        }

        e.target.value = formatted;
    }

    collectFormData() {
        const data = {};
        const inputs = this.form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                data[input.name || input.placeholder] = input.checked;
            } else if (input.value.trim()) {
                data[input.name || input.placeholder] = input.value.trim();
            }
        });

        return data;
    }

    async simulateSubmission(formData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Данные формы:', formData);
                resolve({ success: true });
            }, 2000);
        });
    }

    showLoadingState() {
        this.form.classList.add('form-loading');
        this.submitButton.disabled = true;
        this.submitButton.textContent = 'Отправляем...';
    }

    hideLoadingState() {
        this.form.classList.remove('form-loading');
        this.submitButton.disabled = false;
        this.submitButton.textContent = 'Записаться на пробное занятие';
    }

    onSubmissionSuccess() {
        showNotification('Спасибо! Ваша заявка принята. Мы свяжемся с вами в течение 30 минут.', 'success');
        this.form.reset();

        this.form.querySelectorAll('.field-error').forEach(error => error.remove());
        this.form.querySelectorAll('input, select, textarea').forEach(field => {
            field.style.borderColor = '#e0e0e0';
        });
    }

    onSubmissionError(error) {
        showNotification('Произошла ошибка при отправке. Попробуйте еще раз или позвоните нам.', 'error');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    createMobileMenu();
    observeElements();
    new GalleryCarousel();
    new YandexMapIntegration();
    new ContactFormHandler();

    console.log('Сайт детской изостудии с картой и каруселью загружен успешно!');
});