document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const produtoId = parseInt(urlParams.get('id'));
    
    const produtos = await carregarProdutos();
    const produto = produtos.find(p => p.id === produtoId);
    
    if (!produto) {
        window.location.href = 'produtos.html';
        return;
    }
    
    // Atualizar a página com os dados do produto
    document.title = `${produto.nome} - Fazendo Joias`;
    document.querySelector('.produto-info h1').textContent = produto.nome;
    document.querySelector('.produto-info .preco').textContent = 
        `R$ ${produto.preco.toFixed(2).replace('.', ',')}`;
    document.querySelector('.produto-descricao p').textContent = produto.descricao;
    document.querySelector('.produto-imagem-principal img').src = produto.imagem;
    
    // Atualizar materiais
    const materiaisList = document.querySelector('.produto-materiais ul');
    materiaisList.innerHTML = '';
    produto.materiais.forEach(material => {
        const li = document.createElement('li');
        li.textContent = material;
        materiaisList.appendChild(li);
    });
}); 