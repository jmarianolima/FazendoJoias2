document.addEventListener('DOMContentLoaded', async function() {
    const produtosGrid = document.querySelector('.produtos-grid');
    const itensPorPagina = 12;
    let paginaAtual = 1;
    
    try {
        const produtos = await carregarProdutos();
        let produtosFiltrados = produtos;
        
        // Debug
        console.log('Produtos carregados:', produtos);

        function exibirProdutos(produtosFiltrados) {
            produtosGrid.innerHTML = '';
            const inicio = (paginaAtual - 1) * itensPorPagina;
            const fim = inicio + itensPorPagina;
            const produtosPagina = produtosFiltrados.slice(inicio, fim);
            
            if (produtosPagina.length === 0) {
                produtosGrid.innerHTML = '<p>Nenhum produto encontrado</p>';
                return;
            }
            
            produtosPagina.forEach(produto => {
                const card = document.createElement('div');
                card.className = 'produto-card';
                card.innerHTML = `
                    <a href="visualizacaoproduto.html?id=${produto.id}">
                        <img src="${produto.imagem}" alt="${produto.nome}">
                        <div class="card-content">
                            <h3>${produto.nome}</h3>
                            <p class="preco">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
                        </div>
                    </a>
                `;
                produtosGrid.appendChild(card);
            });
            
            atualizarPaginacao(produtosFiltrados.length);
        }
        
        function atualizarPaginacao(total) {
            const totalPaginas = Math.ceil(total / itensPorPagina);
            document.querySelector('.pagina-atual').textContent = paginaAtual;
            document.querySelector('.paginacao-btn:first-child').disabled = paginaAtual === 1;
            document.querySelector('.paginacao-btn:last-child').disabled = paginaAtual === totalPaginas;
        }
        
        // Event Listeners para paginação
        document.querySelectorAll('.paginacao-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.querySelector('.fa-chevron-left')) {
                    paginaAtual--;
                } else {
                    paginaAtual++;
                }
                exibirProdutos(produtosFiltrados);
            });
        });
        
        // Busca
        const busca = document.querySelector('.busca-input');
        if (busca) {
            busca.addEventListener('input', (e) => {
                const termo = e.target.value.toLowerCase();
                produtosFiltrados = produtos.filter(produto => 
                    produto.nome.toLowerCase().includes(termo) ||
                    produto.descricao.toLowerCase().includes(termo)
                );
                paginaAtual = 1;
                exibirProdutos(produtosFiltrados);
            });
        }
        
        // Exibir todos os produtos inicialmente
        exibirProdutos(produtos);
        
    } catch (error) {
        console.error('Erro ao inicializar a página:', error);
        produtosGrid.innerHTML = '<p>Erro ao carregar os produtos. Por favor, tente novamente mais tarde.</p>';
    }
}); 