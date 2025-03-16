function criarProdutoCard(produto) {
    return `
        <a href="produto.html?id=${produto.id}" class="produto-card">
            <div class="img-container">
                <img src="${produto.imagem}" alt="${produto.nome}">
                <span class="preco-hover">R$ ${produto.preco.toFixed(2)}</span>
            </div>
            <div class="card-content">
                <h3>${produto.nome}</h3>
                <p class="descricao">${produto.descricao}</p>
                <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
            </div>
        </a>
    `;
} 