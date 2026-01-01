/**
 * ОБНОВЛЕННЫЙ SCRIPT.JS
 * Совместим с новым index.html и styles.css
 */

/* =================== 1. УТИЛИТЫ И ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =================== */

// Уведомления (Notifications)
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
    
    // Анимация появления
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });

    // Удаление через 5 секунд
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
};

/* =================== 2. КЛАССЫ =================== */

// Класс карусели (Галерея + Отзывы + Программы)
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
        this.initSwipe(); // Инициализация свайпа для мобильных
    }

    init() {
        this.updateCarousel();
        
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeSlide(this.currentSlide - 1);
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeSlide(this.currentSlide + 1);
            });
        }
        
        this.indicators.forEach((ind, i) => {
            ind.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeSlide(i);
            });
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

    // Добавлен функционал свайпа (Touch Events)
    initSwipe() {
        let startX = 0;
        let isDragging = false;

        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });

        this.track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
        }, { passive: true });

        this.track.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            // Если свайпнули больше чем на 50px
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.changeSlide(this.currentSlide + 1); // Свайп влево -> След. слайд
                } else {
                    this.changeSlide(this.currentSlide - 1); // Свайп вправо -> Пред. слайд
                }
            }
            isDragging = false;
        });
    }
}

// Класс Яндекс.Карт
class YandexMapIntegration {
    constructor() {
        this.mapContainer = document.getElementById('yandex-map');
        // Координаты студии (из ТЗ или HTML)
        this.coordinates = [55.694602, 37.306913]; 
        
        if (!this.mapContainer) return;
        
        // Ленивая загрузка (через 2 секунды после загрузки сайта)
        setTimeout(() => this.loadYandexMaps(), 2000);
    }

    loadYandexMaps() {
        if (this.loaded) return;
        this.loaded = true;
        
        const script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
        script.async = true;
        script.onload = () => ymaps.ready(() => {
            // Очищаем контейнер от текста "Загрузка..."
            this.mapContainer.innerHTML = '';
            
            const map = new ymaps.Map(this.mapContainer, { 
                center: this.coordinates, 
                zoom: 16,
                controls:
