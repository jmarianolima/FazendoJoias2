// Gerenciamento global do carrinho
class CartManager {
    constructor() {
        console.log('[CartManager] Inicializando...');
        this.cartItems = [];
        this.loadCartState();
        this.setupListeners();
    }

    // Função para formatar o preço no padrão brasileiro
    formatarPreco(valor) {
        return `R$${valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
    }

    setupListeners() {
        console.log('[CartManager] Configurando listeners...');
        // Garante que o DOM está carregado antes de inicializar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
        } else {
            this.onDOMReady();
        }
    }

    onDOMReady() {
        console.log('[CartManager] DOM pronto, inicializando interface...');
        this.updateHeaderCounter();
        this.renderCartItems();
    }

    loadCartState() {
            try {
            const carrinhoData = localStorage.getItem('carrinho');
            console.log('[CartManager] Carregando estado do carrinho:', carrinhoData);
            this.cartItems = JSON.parse(carrinhoData) || [];
            } catch (e) {
            console.error('[CartManager] Erro ao carregar itens do carrinho:', e);
                this.cartItems = [];
        }
    }

    saveCartState() {
        console.log('[CartManager] Salvando estado do carrinho:', this.cartItems);
        
        // Salva no localStorage
        localStorage.setItem('carrinho', JSON.stringify(this.cartItems));
        
        // Dispara evento de atualização
        const evento = new CustomEvent('carrinhoAtualizado', {
            detail: { carrinho: this.cartItems }
        });
        document.dispatchEvent(evento);
        console.log('[CartManager] Evento carrinhoAtualizado disparado');
    }

    updateHeaderCounter() {
        console.log('[CartManager] Atualizando contador do header');
        const headerCounters = document.querySelectorAll('.cart-count');
        const totalItens = this.cartItems.reduce((total, item) => total + (item.quantidade || 1), 0);
        
        console.log('[CartManager] Total de itens:', totalItens);
        
        headerCounters.forEach(counter => {
            if (counter) {
                counter.textContent = totalItens > 99 ? '99+' : totalItens.toString();
                counter.style.display = totalItens > 0 ? 'flex' : 'none';
                console.log('[CartManager] Contador atualizado:', counter.textContent);
            }
        });
    }

    updateAllCounters() {
        console.log('Atualizando todos os contadores');
        // Atualiza o contador no header
        this.updateHeaderCounter();
        
        // Dispara eventos para notificar outras partes da aplicação
        document.dispatchEvent(new CustomEvent('carrinhoAtualizado'));
        
        // Força atualização em outras abas
        window.dispatchEvent(new CustomEvent('storage', {
            detail: { key: 'carrinho', newValue: JSON.stringify(this.cartItems) }
        }));
    }

    addItem(item) {
        console.log('[CartManager] Adicionando item:', item);
        
        // Garante que o item tenha um tamanho
        if (!item.tamanho) {
            item.tamanho = 'Único';
        }
        
        // Procura por um item igual (mesmo ID e tamanho)
        const itemExistente = this.cartItems.find(i => i.id === item.id && i.tamanho === item.tamanho);
        
        if (itemExistente) {
            itemExistente.quantidade += 1;
        } else {
            this.cartItems.push({ ...item, quantidade: 1 });
        }
        
        this.saveCartState();
        this.updateAllCounters();
    }

    removeItem(itemId) {
        console.log('[CartManager] Iniciando remoção do item:', itemId);
        
        try {
            // Encontra o item antes de remover
            const itemRemovido = this.cartItems.find(item => item.id === itemId);
            
            if (!itemRemovido) {
                console.error('[CartManager] Item não encontrado:', itemId);
                return;
            }
            
            // Remove o item do array
            this.cartItems = this.cartItems.filter(item => item.id !== itemId);
            
            // Calcula o novo subtotal após a remoção
            const subtotal = this.cartItems.reduce((total, item) => total + (item.preco * (item.quantidade || 1)), 0);
            
            // Atualiza o resumo antes de renderizar
            this.updateTotals(subtotal);
            
            // Atualiza localStorage e interface
            this.saveCartState();
            this.renderCartItems();
            
            // Dispara evento de remoção
            const totalItens = this.cartItems.reduce((total, item) => total + (item.quantidade || 1), 0);
            document.dispatchEvent(new CustomEvent('itemRemovidoDoCarrinho', {
                detail: { itemId, itemRemovido, totalItens, subtotal }
            }));
            
            // Atualiza contadores
            this.updateHeaderCounter();
            
            console.log('[CartManager] Item removido com sucesso. Total de itens:', totalItens);
            
        } catch (error) {
            console.error('[CartManager] Erro ao remover item:', error);
        }
    }

    updateItemQuantity(itemId, delta) {
        const item = this.cartItems.find(i => i.id === itemId);
        if (item) {
            item.quantidade = Math.max(1, (item.quantidade || 1) + delta);
            this.saveCartState();
            this.updateHeaderCounter();
            this.renderCartItems();
        }
    }

    renderCartItems() {
        console.log('[CartManager] Renderizando itens do carrinho');
        const cartItemsContainer = document.querySelector('.cart-items');
        const cartSummary = document.querySelector('.cart-summary');
        
        if (!cartItemsContainer) {
            console.log('[CartManager] Container do carrinho não encontrado');
            return;
        }

        if (this.cartItems.length === 0) {
            console.log('[CartManager] Carrinho vazio');
            if (cartSummary) {
                cartSummary.classList.add('empty');
            }
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-container">
                    <div class="empty-cart-icon">
                        <i class="fas fa-shopping-bag"></i>
                    </div>
                    <h2>🛒 Seu carrinho está vazio!</h2>
                    <p class="empty-cart-message">
                        Parece que você ainda não adicionou nada ao carrinho. Que tal explorar nossas ofertas imperdíveis e encontrar algo especial para você?
                    </p>
                    <div class="empty-cart-highlights">
                        <p>🔥 Destaques do dia: <a href="produtos.html">Ver ofertas</a></p>
                        <p>🎁 Frete grátis em pedidos acima de R$299!</p>
                        <p>💳 Parcelamento facilitado para você comprar sem preocupações.</p>
                    </div>
                    <a href="produtos.html" class="btn-continuar-comprando">
                        👉 Continuar comprando
                    </a>
                </div>
            `;
            this.updateTotals(0);
            return;
        }

        if (cartSummary) {
            cartSummary.classList.remove('empty');
        }

        let html = '';
        let subtotal = 0;

        this.cartItems.forEach(item => {
            const total = item.preco * (item.quantidade || 1);
            subtotal += total;

            html += `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-image">
                        <img src="${item.imagem}" alt="${item.nome}">
                    </div>
                    <div class="cart-item-info">
                        <h3>${item.nome}</h3>
                        <p class="price">${this.formatarPreco(item.preco)}</p>
                        <p class="item-size">Tamanho: <span>${item.tamanho || 'Único'}</span></p>
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" data-id="${item.id}" data-action="decrease">-</button>
                            <span class="quantity">${item.quantidade || 1}</span>
                            <button class="quantity-btn plus" data-id="${item.id}" data-action="increase">+</button>
                        </div>
                    </div>
                    <button class="remove-item" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = html;
        this.updateTotals(subtotal);
        
        // Adiciona eventos após renderizar o HTML
        this.setupCartEvents(cartItemsContainer);
    }

    setupCartEvents(container) {
        // Eventos para os botões de remover
        container.querySelectorAll('.remove-item').forEach(button => {
            button.removeEventListener('click', this.handleRemoveClick);
            button.addEventListener('click', this.handleRemoveClick.bind(this));
        });

        // Eventos para os botões de quantidade
        container.querySelectorAll('.quantity-btn').forEach(button => {
            button.removeEventListener('click', this.handleQuantityClick);
            button.addEventListener('click', this.handleQuantityClick.bind(this));
        });
    }

    handleRemoveClick(event) {
        const button = event.currentTarget;
        const itemId = parseInt(button.dataset.id);
        if (itemId) {
            console.log('[CartManager] Clique no botão remover:', itemId);
            this.removeItem(itemId);
        }
    }

    handleQuantityClick(event) {
        const button = event.currentTarget;
        const itemId = parseInt(button.dataset.id);
        const delta = button.dataset.action === 'increase' ? 1 : -1;
        this.updateItemQuantity(itemId, delta);
    }

    updateTotals(subtotal) {
        const subtotalElement = document.querySelector('.subtotal-value');
        const totalElement = document.querySelector('.total-value');
        const summaryProducts = document.querySelector('.summary-products');
        
        if (subtotalElement) {
            subtotalElement.textContent = this.formatarPreco(subtotal);
        }
        
        if (totalElement) {
            totalElement.textContent = this.formatarPreco(subtotal);
        }

        if (summaryProducts) {
            if (this.cartItems.length === 0) {
                summaryProducts.innerHTML = `
                    <div class="empty-summary">
                        <p>Nenhum item no carrinho</p>
                        <small>Adicione produtos para ver o resumo aqui</small>
                    </div>
                `;
            } else {
                let html = '';
                this.cartItems.forEach(item => {
                    const precoTotal = (item.quantidade || 1) * item.preco;
                    html += `
                        <div class="summary-product">
                            <span class="summary-product-name">${item.nome}</span>
                            <span class="summary-product-size">Tam: ${item.tamanho || 'Único'}</span>
                            <span class="summary-product-quantity">${item.quantidade || 1}x</span>
                            <span class="summary-product-price">${this.formatarPreco(precoTotal)}</span>
                        </div>
                    `;
                });
                summaryProducts.innerHTML = html;
            }
        }
    }
}

// Inicializa o CartManager globalmente
console.log('[CartManager] Criando instância global...');
window.cartManager = new CartManager(); 
console.log('[CartManager] Instância global criada'); 