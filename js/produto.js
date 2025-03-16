document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const produtoId = params.get('id');
    
    if (produtoId) {
        const produto = produtos.find(p => p.id === produtoId);
        if (produto) {
            // Preenche os detalhes do produto na página
            preencherDetalhesProduto(produto);
        }
    }
}); 