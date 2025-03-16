const categoriasNomes = ['casamento', 'namorados', 'aniversario'];

async function carregarProdutosPorCategoria() {
    try {
        const produtos = await carregarProdutos();
        const categorias = document.querySelectorAll('.categoria-grid');
        
        categorias.forEach((categoriaGrid, index) => {
            // Filtrar produtos por categoria
            const produtosCategoria = produtos.filter(p => p.categoria === categoriasNomes[index]);
            
            // Criar e inserir todos os cards da categoria
            const cardsHTML = produtosCategoria.map(produto => criarProdutoCard(produto)).join('');
            
            categoriaGrid.innerHTML = cardsHTML;
        });

    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Mapeamento das categorias
    const categoriasNomes = {
        'Casamento': 'casamento',
        'Dia dos Namorados': 'namorados',
        'Aniversário': 'aniversario'
    };

    // Função para criar o card do produto
    function criarProdutoCard(produto) {
        return `
            <a href="visualizacaoproduto.html?id=${produto.id}" class="produto-card">
                <div class="img-container">
                    <img src="${produto.imagem}" alt="${produto.nome}">
                    <span class="preco-hover">R$ ${produto.preco.toFixed(2)}</span>
                </div>
                <div class="card-content">
                    <h3>${produto.nome}</h3>
                    <p class="descricao">${produto.descricao || ''}</p>
                    <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
                </div>
            </a>
        `;
    }

    // Carregar produtos do DB
    fetch('DB/db.json')
        .then(response => response.json())
        .then(data => {
            const produtos = data.produtos;
            const grids = document.querySelectorAll('.categoria-grid');
            
            grids.forEach(grid => {
                // Pega o título da categoria
                const categoriaTitle = grid.closest('.colecao-categoria').querySelector('h2').textContent;
                const categoriaSlug = categoriasNomes[categoriaTitle];
                
                // Filtra os produtos pela categoria e limita a 4 produtos
                const produtosCategoria = produtos
                    .filter(p => p.categoria === categoriaSlug)
                    .slice(0, 4); // Limita a 4 produtos
                
                // Cria os cards usando o template
                const produtosHTML = produtosCategoria
                    .map(produto => criarProdutoCard(produto))
                    .join('');
                
                grid.innerHTML = produtosHTML;
            });
        })
        .catch(error => console.error('Erro ao carregar produtos:', error));
}); 