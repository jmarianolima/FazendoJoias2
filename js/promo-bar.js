document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.promo-bar-slider');
    if (slider) {
        const text = slider.textContent.trim();
        slider.setAttribute('data-text', text);
    }
}); 