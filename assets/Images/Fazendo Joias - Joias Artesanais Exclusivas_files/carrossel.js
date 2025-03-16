document.addEventListener('DOMContentLoaded', async function() {
    const carrossel = document.querySelector('.carrossel');
    
    // Carrega os dados dos produtos
    const produtos = await carregarProdutos();
    const produtosCarrossel = produtos.slice(0, 5); // 5 primeiros produtos
    
    // Cria os cards dos produtos
    produtosCarrossel.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'produto-card';
        card.innerHTML = `
            <a href="visualizacaoproduto.html?id=${produto.id}">
                <img src="${produto.imagem}" alt="${produto.nome}">
                <h3>${produto.nome}</h3>
                <p class="preco">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
            </a>
        `;
        carrossel.appendChild(card);
    });

    // Clone todo o conjunto de cards uma única vez para o efeito infinito
    const todosCards = Array.from(carrossel.children);
    todosCards.forEach(card => {
        const clone = card.cloneNode(true);
        carrossel.appendChild(clone);
    });

    let position = 0;
    const cardWidth = document.querySelector('.produto-card').offsetWidth + 32; // largura + gap
    
    function slideCarrossel() {
        position -= 2; // Move 2px por frame para aumentar a velocidade
        
        // Quando o primeiro conjunto de cards terminar, reinicie a posição
        if (position <= -(cardWidth * produtosCarrossel.length)) {
            position = 0;
        }
        
        carrossel.style.transform = `translateX(${position}px)`;
    }

    // Inicia o deslizamento automático
    let animationFrame;
    function animate() {
        slideCarrossel();
        animationFrame = requestAnimationFrame(animate);
    }
    
    // Pausa o carrossel quando o mouse está sobre ele
    carrossel.addEventListener('mouseenter', () => {
        cancelAnimationFrame(animationFrame);
    });
    
    // Retoma o carrossel quando o mouse sai
    carrossel.addEventListener('mouseleave', () => {
        animationFrame = requestAnimationFrame(animate);
    });

    // Inicia a animação
    animate();
});

// Slider da barra de promoções
const promoMessages = [
    'FRETE GRÁTIS ACIMA DE R$180',
    'PARCELE EM ATÉ 3X SEM JUROS',
    'NOVIDADES TODA SEMANA',
    '10% OFF NA PRIMEIRA COMPRA'
];

let currentPromoIndex = 0;
const promoSlider = document.querySelector('.promo-bar-slider');

function updatePromoMessage() {
    promoSlider.style.opacity = '0';
    setTimeout(() => {
        promoSlider.textContent = promoMessages[currentPromoIndex];
        promoSlider.style.opacity = '1';
        currentPromoIndex = (currentPromoIndex + 1) % promoMessages.length;
    }, 500);
}

setInterval(updatePromoMessage, 3000);

// Carrossel de promoções
const promoDots = document.querySelectorAll('.promo-dot');
const promoImage = document.querySelector('.promo-carousel img');

const promoImages = [
    'https://via.placeholder.com/1920x400?text=Promo+1',
    'https://via.placeholder.com/1920x400?text=Promo+2',
    'https://via.placeholder.com/1920x400?text=Promo+3',
    'https://via.placeholder.com/1920x400?text=Promo+4',
    'https://via.placeholder.com/1920x400?text=Promo+5'
];

let currentPromoImageIndex = 0;

promoDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        updatePromoImage(index);
    });
});

function updatePromoImage(index) {
    promoDots[currentPromoImageIndex].classList.remove('active');
    promoDots[index].classList.add('active');
    promoImage.src = promoImages[index];
    currentPromoImageIndex = index;
}

setInterval(() => {
    const nextIndex = (currentPromoImageIndex + 1) % promoImages.length;
    updatePromoImage(nextIndex);
}, 5000); 