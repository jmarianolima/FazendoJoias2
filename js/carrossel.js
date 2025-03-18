document.addEventListener('DOMContentLoaded', async () => {
    const carrossel = document.querySelector('.carrossel');
    if (!carrossel) return;

    try {
        // Carregar produtos do DB
        const response = await fetch('DB/db.json');
        const data = await response.json();
        const produtos = data.produtos;

        // Função para formatar o preço no padrão brasileiro
        const formatarPreco = (valor) => {
            return `R$${valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
        };

        // Selecionar 5 produtos aleatórios para o carrossel
        const produtosAleatorios = produtos
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);

        // Criar HTML dos produtos
        const produtosHTML = produtosAleatorios.map(produto => `
            <a href="visualizacaoproduto.html?id=${produto.id}" class="produto-card">
                <div class="img-container">
                    <img src="${produto.imagem}" alt="${produto.nome}">
                    <span class="preco-hover">${formatarPreco(produto.preco)}</span>
                </div>
                <div class="card-content">
                    <h3>${produto.nome}</h3>
                    <p class="preco">${formatarPreco(produto.preco)}</p>
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