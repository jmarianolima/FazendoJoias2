document.addEventListener('DOMContentLoaded', async () => {
    const carrossel = document.querySelector('.carrossel');
    if (!carrossel) return;

    try {
        // Carregar produtos do DB
        const response = await fetch('DB/db.json');
        const data = await response.json();
        const produtos = data.produtos;

        // Selecionar 5 produtos aleatórios para o carrossel
        const produtosAleatorios = produtos
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);

        // Criar HTML dos produtos
        const produtosHTML = produtosAleatorios.map(produto => `
            <a href="visualizacaoproduto.html?id=${produto.id}" class="produto-card">
                <div class="img-container">
                    <img src="${produto.imagem}" alt="${produto.nome}">
                    <span class="preco-hover">R$ ${produto.preco.toFixed(2)}</span>
                </div>
                <div class="card-content">
                    <h3>${produto.nome}</h3>
                    <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
                </div>
            </a>
        `).join('');

        // Inserir produtos no carrossel
        carrossel.innerHTML = produtosHTML + produtosHTML;

        // Pausa a animação no hover
        carrossel.addEventListener('mouseenter', () => {
            carrossel.style.animationPlayState = 'paused';
        });

        carrossel.addEventListener('mouseleave', () => {
            carrossel.style.animationPlayState = 'running';
        });

    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}); 