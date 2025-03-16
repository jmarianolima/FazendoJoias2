document.addEventListener('DOMContentLoaded', function() {
    let lastScrollTop = 0;
    const header = document.querySelector('header');
    const navbar = document.querySelector('.navbar');
    const headerHeight = header.offsetHeight;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > headerHeight) {
            // Rolando para baixo
            if (scrollTop > lastScrollTop) {
                header.style.transform = `translateY(-${headerHeight}px)`;
            } 
            // Rolando para cima
            else {
                header.style.transform = 'translateY(0)';
            }
        }
        
        lastScrollTop = scrollTop;
    });
}); 