document.addEventListener('DOMContentLoaded', () => {
    // Remover header existente se houver
    const existingHeader = document.querySelector('header');
    if (existingHeader) {
        existingHeader.remove();
    }

    const header = document.createElement('header');
    header.innerHTML = `
        <nav class="navbar">
            <div class="nav-top">
                <div class="logo">
                    <a href="index.html" class="logo-container">
                        <img src="assets/images/logo.jpeg" alt="Fazendo Joias" class="logo-img">
                        <span class="logo-text">Fazendo Joias</span>
                    </a>
                </div>
                <div class="nav-bottom">
                    <ul class="nav-menu">
                        <li><a href="produtos.html">Produtos</a></li>
                        <li><a href="colecoes.html">Coleções</a></li>
                        <li><a href="sobre.html">Sobre</a></li>
                    </ul>
                </div>
                <div class="nav-icons">
                    <a href="login.html" class="user-icon">
                        <i class="fas fa-user"></i>
                    </a>
                    <a href="carrinho.html" class="cart-icon">
                        <i class="fas fa-shopping-cart"></i>
                        <span class="cart-count">0</span>
                    </a>
                </div>
            </div>
        </nav>
    `;

    // Inserir o header no início do body
    document.body.insertBefore(header, document.body.firstChild);

    // Marcar o link atual como ativo
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const currentLink = document.querySelector(`.nav-menu a[href="${currentPage}"]`);
    if (currentLink) {
        currentLink.classList.add('active');
    }

    // Atualizar contador do carrinho
    const updateCartCount = () => {
        if (window.cartManager) {
            window.cartManager.loadCartState();
            window.cartManager.updateHeaderCounter();
        }
    };

    // Tentar atualizar o contador algumas vezes para garantir que o cartManager esteja disponível
    let attempts = 0;
    const maxAttempts = 5;
    const tryUpdateCart = () => {
        if (window.cartManager) {
            updateCartCount();
        } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(tryUpdateCart, 500);
        }
    };

    tryUpdateCart();

    // Disparar evento de header carregado
    document.dispatchEvent(new Event('headerLoaded'));

    // Função para carregar o assistente virtual
    const loadAssistente = () => {
        // Verificar se o assistente já está carregado
        if (document.querySelector('.assistente-widget')) return;

        // Adicionar link para o CSS do assistente virtual
        const assistenteCSS = document.createElement('link');
        assistenteCSS.rel = 'stylesheet';
        assistenteCSS.href = 'styles/assistente-virtual.css';
        document.head.appendChild(assistenteCSS);

        // Esperar o CSS carregar antes de adicionar o script
        assistenteCSS.onload = () => {
            // Adicionar script do assistente virtual
            const assistenteJS = document.createElement('script');
            assistenteJS.src = 'js/assistente-virtual.js';
            assistenteJS.onload = () => {
                // Verificar se o assistente foi inicializado
                if (!window.AssistenteVirtual) {
                    console.error('Assistente Virtual não foi carregado corretamente');
                }
            };
            document.body.appendChild(assistenteJS);
        };
    };

    // Carregar o assistente após um pequeno delay para garantir que outros recursos foram carregados
    setTimeout(loadAssistente, 1000);
}); 