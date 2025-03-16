document.addEventListener('DOMContentLoaded', () => {
    // Função para adicionar item ao carrinho
    function handleAddToCart(button) {
        const productId = button.dataset.id;
        const productName = button.dataset.name;
        const productPrice = button.dataset.price;
        
        const item = {
            id: productId,
            nome: productName,
            preco: productPrice
        };

        if (window.cartManager) {
            window.cartManager.addItem(item);
        } else {
            console.error('CartManager não encontrado');
        }
    }

    // Adicionar listeners para todos os botões de adicionar ao carrinho
    function setupAddToCartButtons() {
        const addToCartButtons = document.querySelectorAll('.btn-add-cart');
        
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart(button);
            });
        });
    }

    // Configurar os botões quando o DOM estiver pronto
    setupAddToCartButtons();

    // Configurar os botões novamente quando o header for carregado
    document.addEventListener('headerLoaded', setupAddToCartButtons);
}); 