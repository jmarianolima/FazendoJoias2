document.addEventListener('DOMContentLoaded', function() {
    const heroVideo = document.querySelector('.hero-video video');
    if (heroVideo) {
        heroVideo.playbackRate = 0.6; // Reduz a velocidade para 60% da velocidade normal
    }
}); 