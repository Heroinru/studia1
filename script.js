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

// Обработка формы записи и валидация
class ContactFormHandler {
    constructor() {
        this.form = document.querySelector('.contact-form form');
        this.submitButton = this.form?.querySelector('button[type="submit"]');
        if (this.form) this.init();
    }
    init() {
        this.form.addEventListener('submit', e => this.handleSubmit(e));
        this.form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.clearErrors(field));
        });
        const phoneInput = this.form.querySelector('input[type="tel"]');
        if (phoneInput) phoneInput.addEventListener('input', this.formatPhone);
    }
    handleSubmit(e) {
        e.preventDefault();
        if (!this.validateForm()) {
            showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
            return;
        }
        // Отправка на Getform — нативная отправка формы
        this.form.submit();
    }
    validateForm() {
        let isValid = true;
        this.form.querySelectorAll('[required]').forEach(field => {
            if (!this.validateField(field)) isValid = false;
        });
        return isValid;
    }
    validateField(field) {
        const val = field.value.trim();
        let valid = true, msg = '';
        if (field.hasAttribute('required') && !val) {
            valid = false; msg = 'Это поле обязательно для заполнения';
        }
        if (val) {
            if (field.type === 'email') {
                const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
                if (!re.test(val)) { valid = false; msg = 'Введите корректный email'; }
            }
            if (field.type === 'tel') {
                const re = /^\\+7\\s\\(\\d{3}\\)\\s\\d{3}-\\d{2}-\\d{2}$/;
                if (!re.test(val)) { valid = false; msg = 'Введите корректный номер телефона'; }
            }
            if (field.type === 'number') {
                const age = parseInt(val);
                if (age < 3 || age > 18) { valid = false; msg = 'Возраст должен быть от 3 до 18 лет'; }
            }
        }
        this.showFieldError(field, valid ? '' : msg);
        return valid;
    }
    showFieldError(field, message) {
        const oldError = field.parentNode.querySelector('.field-error');
        if (oldError) oldError.remove();
        if (message) {
            field.style.borderColor = '#f44336';
            const div = document.createElement('div');
            div.className = 'field-error';
            div.textContent = message;
            div.style.cssText = 'color:#f44336; font-size:12px; margin-top:5px; animation:slideDown 0.3s ease;';
            field.parentNode.appendChild(div);
        } else {
            field.style.borderColor = '#4CAF50';
        }
    }
    clearErrors(field) {
        field.style.borderColor = '#e0e0e0';
        const err = field.parentNode.querySelector('.field-error');
        if (err) err.remove();
    }
    formatPhone(e) {
        let val = e.target.value.replace(/\D/g, '');
        if (val.startsWith('8')) val = '7' + val.slice(1);
        if (val.startsWith('7')) val = val.slice(1);
        let formatted = '+7';
        if (val.length > 0) formatted += ' (' + val.substring(0, 3);
        if (val.length >= 4) formatted += ') ' + val.substring(3, 6);
        if (val.length >= 7) formatted += '-' + val.substring(6, 8);
        if (val.length >= 9) formatted += '-' + val.substring(8, 10);
        e.target.value = formatted;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    createMobileMenu();
    observeElements();
    new ContactFormHandler();
    console.log('Скрипт формы и меню загружен');
});
