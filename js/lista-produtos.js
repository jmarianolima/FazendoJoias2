function criarCardProduto(produto) {
    return `
        <div class="produto-card">
            <div class="img-container">
                <img src="${produto.imagem}" alt="${produto.nome}">
                <div class="preco-hover">R$ ${produto.preco.toFixed(2)}</div>
            </div>
            <div class="card-content">
                <h3>${produto.nome}</h3>
                <p class="descricao">${produto.descricao}</p>
                <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
            </div>
        </div>
    `;
}

async function carregarProdutos() {
    try {
        const produtos = await fetch('DB/db.json')
            .then(response => response.json())
            .then(data => data.produtos);

        const produtosGrid = document.querySelector('.produtos-grid');
        const cardsHTML = produtos.map(criarCardProduto).join('');
        produtosGrid.innerHTML = cardsHTML;
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

document.addEventListener('DOMContentLoaded', carregarProdutos); 