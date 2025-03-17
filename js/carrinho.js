document.addEventListener('DOMContentLoaded', () => {
    // Carregar itens do carrinho do localStorage
    let cartItems = [];
    try {
        cartItems = JSON.parse(localStorage.getItem('carrinho')) || [];
        console.log('Itens carregados:', cartItems);
    } catch (e) {
        console.error('Erro ao carregar itens do carrinho:', e);
    }
    
    // Adicionar listener para o evento carrinhoAtualizado
    document.addEventListener('carrinhoAtualizado', () => {
        console.log('Evento carrinhoAtualizado recebido, atualizando interface...');
        // Recarregar os itens do localStorage
        try {
            cartItems = JSON.parse(localStorage.getItem('carrinho')) || [];
        } catch (e) {
            console.error('Erro ao recarregar itens do carrinho:', e);
        }
        // Renderizar os itens atualizados
        renderCartItems();
        // Atualizar o resumo do pedido
        atualizarResumo();
    });
    
    // Renderizar itens do carrinho
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartSummary = document.querySelector('.cart-summary');
    
    function renderCartItems() {
        const cartContainer = document.querySelector('.cart-items');
        const cart = JSON.parse(localStorage.getItem('carrinho')) || [];

        // Atualizar a variável cartItems com os dados mais recentes do localStorage
        cartItems = cart;

        if (cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart-container">
                    <div class="empty-cart-icon">
                        <i class="fas fa-shopping-bag"></i>
                    </div>
                    <h1>Seu carrinho está vazio!</h1>
                    <p class="empty-cart-message">Parece que você ainda não adicionou nada ao carrinho.</p>
                    <p class="empty-cart-message">Que tal explorar nossas ofertas imperdíveis e encontrar algo especial para você?</p>
                    
                    <div class="empty-cart-info">
                        <div class="info-item">
                            <span class="info-icon">🔥</span>
                            <span>Destaques do dia: <a href="produtos.html" class="link-ofertas">Ver ofertas</a></span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">🎁</span>
                            <span>Frete grátis em pedidos acima de R$299!</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">💳</span>
                            <span>Parcelamento facilitado para você comprar sem preocupações.</span>
                        </div>
                    </div>

                    <a href="produtos.html" class="btn-continuar-comprando">Continuar comprando</a>
                </div>
            `;

            // Zerar o resumo do pedido
            const summaryProducts = document.querySelector('.summary-products');
            if (summaryProducts) {
                summaryProducts.innerHTML = `
                    <div class="empty-summary">
                        <p>Nenhum item no carrinho</p>
                        <small>Adicione produtos para ver o resumo aqui</small>
                    </div>
                `;
            }

            // Zerar os valores totais
            const totalElement = document.querySelector('.total-value');
            if (totalElement) {
                totalElement.textContent = 'R$ 0,00';
            }

            // Limpar e zerar opções de frete
            const shippingOptions = document.querySelector('.shipping-options');
            if (shippingOptions) {
                shippingOptions.innerHTML = '';
                shippingOptions.classList.remove('show');
            }

            // Zerar o valor do frete no resumo
            const freteElement = document.querySelector('.summary-item.frete');
            if (freteElement) {
                const freteValueElement = freteElement.querySelector('.frete-value');
                if (freteValueElement) {
                    freteValueElement.textContent = 'R$ 0,00';
                }
            }

            // Resetar o select de frete se existir
            const freteSelect = document.querySelector('#opcao-frete');
            if (freteSelect) {
                freteSelect.value = '0';
            }

            // Resetar os radio buttons de frete se existirem
            const freteRadios = document.querySelectorAll('input[name="frete"]');
            freteRadios.forEach(radio => {
                radio.checked = false;
            });

            // Atualizar o resumo do pedido
            atualizarResumo();
            
            return;
        }

        if (cartSummary) {
            cartSummary.classList.remove('empty');
        }

        const itemsHtml = cartItems.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.imagem || 'assets/images/produto-default.jpg'}" alt="${item.nome}">
                <div class="item-info">
                        <h3>${item.nome}</h3>
                    <p class="item-price">${item.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
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
        `).join('');

        cartItemsContainer.innerHTML = itemsHtml;
        
        // Adicionar event listeners aos botões de remover
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                removeItem(itemId);
            });
        });

        // Adicionar event listeners aos botões de quantidade
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                const action = this.getAttribute('data-action');
                const delta = action === 'increase' ? 1 : -1;
                alterarQuantidade(itemId, delta);
            });
        });
        
        // Calcular e atualizar total
        const total = cartItems.reduce((sum, item) => {
            return sum + (parseFloat(item.preco) * (item.quantidade || 1));
        }, 0);
        
        updateTotal(total);
        
        // Atualizar o resumo do pedido
        atualizarResumo();
    }

    function updateTotal(total) {
        const subtotalElement = document.querySelector('.subtotal-value');
        const totalElement = document.querySelector('.total-value');
        
        const formatarPreco = (valor) => {
            return valor.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 2
            });
        };
        
        if (subtotalElement && totalElement) {
            subtotalElement.textContent = formatarPreco(total);
            totalElement.textContent = formatarPreco(total);
        }
    }

    // Adicionar listener para opções de frete
    const freteSelect = document.querySelector('#opcao-frete');
    if (freteSelect) {
        freteSelect.addEventListener('change', () => {
            const freteValor = parseFloat(freteSelect.value);
            atualizarTotal(freteValor);
        });
    }

    function atualizarTotal(freteValor = 0) {
        const subtotal = cartItems.reduce((sum, item) => {
            return sum + (parseFloat(item.preco) * (item.quantidade || 1));
        }, 0);

        const cupomDesconto = parseFloat(localStorage.getItem('cupomDesconto') || 0);
        const total = subtotal + freteValor - cupomDesconto;

        const totalElement = document.querySelector('.total-value');
        
        if (totalElement) {
            totalElement.textContent = total.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 2
            });
        }

        // Atualizar ou adicionar o item de frete no resumo
        const freteElement = document.querySelector('.summary-item.frete');
        if (freteElement) {
            const freteValueElement = freteElement.querySelector('.frete-value');
            if (freteValueElement) {
                freteValueElement.textContent = freteValor.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 2
                });
            }
        } else {
            const summaryItemsList = document.querySelector('.summary-item.items-list');
            if (summaryItemsList) {
                const freteItem = document.createElement('div');
                freteItem.className = 'summary-item frete';
                freteItem.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Frete:</span>
                        <span class="frete-value">${freteValor.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 2
                        })}</span>
                    </div>
                `;
                summaryItemsList.insertAdjacentElement('afterend', freteItem);
            }
        }
    }

    // Função para aplicar cupom
    const cupons = {
        'PRIMEIRA10': 10,
        'DESCONTO20': 20,
        'PROMO50': 50
    };

    const aplicarCupomBtn = document.querySelector('.aplicar-cupom');
    if (aplicarCupomBtn) {
        aplicarCupomBtn.addEventListener('click', () => {
            const cupomInput = document.querySelector('#cupom');
            const cupomValue = cupomInput.value.toUpperCase();
            const desconto = cupons[cupomValue];

            if (desconto) {
                localStorage.setItem('cupomDesconto', desconto);
                const cupomAplicado = document.querySelector('.cupom-aplicado');
                const valorDesconto = document.querySelector('.valor-desconto');
                
                cupomAplicado.style.display = 'flex';
                valorDesconto.textContent = `- R$ ${desconto.toFixed(2).replace('.', ',')}`;
                
                atualizarTotal(parseFloat(document.querySelector('#opcao-frete').value));
                
                // Feedback visual
                cupomInput.style.borderColor = 'var(--green-500)';
                setTimeout(() => cupomInput.style.borderColor = '', 2000);
            } else {
                alert('Cupom inválido');
                cupomInput.style.borderColor = 'var(--red-500)';
                setTimeout(() => cupomInput.style.borderColor = '', 2000);
            }
        });
    }

    // Adicionar listener para o botão de finalizar compra
    const finalizarBtn = document.querySelector('.btn-finalizar');
    if (finalizarBtn) {
        finalizarBtn.addEventListener('click', () => {
            if (cartItems.length === 0) {
                mostrarAlerta('Seu carrinho está vazio!', 'atencao');
                return;
            }

            // Verificar se o frete foi calculado
            const shippingOptions = document.querySelector('.shipping-options');
            const freteRadios = document.querySelectorAll('input[name="frete"]:checked');
            
            if (!shippingOptions || !shippingOptions.classList.contains('show') || freteRadios.length === 0) {
                mostrarAlerta('Para finalizar sua compra, por favor calcule o frete informando seu CEP. É importante para garantirmos o melhor serviço de entrega.', 'atencao');
                // Dar foco ao campo de CEP
                const cepInput = document.querySelector('#cep');
                if (cepInput) {
                    cepInput.focus();
                }
                return;
            }

            window.location.href = 'checkout.html';
        });
    }

    // Função para mostrar alerta
    function mostrarAlerta(mensagem, tipo = 'atencao') {
        // Remove alerta existente se houver
        const alertaExistente = document.querySelector('.cart-alert');
        if (alertaExistente) {
            alertaExistente.remove();
        }
        
        // Define o ícone baseado no tipo
        const icone = tipo === 'sucesso' ? 'fa-check-circle' : 'fa-exclamation-circle';
        const corIcone = tipo === 'sucesso' ? '#4ade80' : '#fbbf24';
        const corFundo = tipo === 'sucesso' ? '#4ade80' : '#f59e0b';
        
        // Cria novo alerta
        const alertaHTML = `
            <div class="cart-alert ${tipo}" style="
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                background-color: ${corFundo};
                color: white;
                padding: 1rem;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                gap: 10px;
                min-width: 300px;
                opacity: 0;
                transform: translateY(-20px);
                transition: all 0.3s ease;
            ">
                <div class="cart-alert-content" style="flex: 1; display: flex; align-items: center; gap: 10px;">
                    <i class="fas ${icone}" style="color: white; font-size: 1.2rem;"></i>
                    <span class="cart-alert-message" style="flex: 1;">${mensagem}</span>
                    <button class="cart-alert-close" style="background: transparent; border: none; cursor: pointer; padding: 0;">
                        <i class="fas fa-times" style="color: white; font-size: 1.2rem;"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Adiciona o novo alerta ao body
        document.body.insertAdjacentHTML('beforeend', alertaHTML);
        
        // Força um reflow e mostra o alerta
        const alerta = document.querySelector('.cart-alert');
        if (alerta) {
            // Força reflow
            void alerta.offsetHeight;
            
            // Mostra o alerta com animação
            requestAnimationFrame(() => {
                alerta.style.opacity = '1';
                alerta.style.transform = 'translateY(0)';
            });

            // Adiciona evento de clique no botão fechar
            const btnFechar = alerta.querySelector('.cart-alert-close');
            if (btnFechar) {
                btnFechar.addEventListener('click', () => {
                    alerta.style.opacity = '0';
                    alerta.style.transform = 'translateY(-20px)';
                    setTimeout(() => {
                        alerta.remove();
                    }, 300);
                });
            }
            
            // Remove o alerta após 5 segundos
            const timeoutId = setTimeout(() => {
                if (document.body.contains(alerta)) {
                    alerta.style.opacity = '0';
                    alerta.style.transform = 'translateY(-20px)';
                    setTimeout(() => {
                        if (document.body.contains(alerta)) {
                            alerta.remove();
                        }
                    }, 300);
                }
            }, 5000);

            // Limpa o timeout se o alerta for fechado manualmente
            btnFechar.addEventListener('click', () => {
                clearTimeout(timeoutId);
            });
        }
    }

    // Adicionar listener para o botão de calcular frete
    const calcularFreteBtn = document.querySelector('.shipping-section button');
    if (calcularFreteBtn) {
        // Prevenir envio do formulário
        const freteForm = calcularFreteBtn.closest('form');
        if (freteForm) {
            freteForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const cepInput = document.querySelector('#cep');
                const cep = cepInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos

                if (!cep) {
                    mostrarAlerta('Por favor, digite um CEP antes de calcular o frete.', 'atencao');
                    cepInput.focus();
                    return;
                }

                // Validação básica do CEP (8 dígitos)
                if (cep.length !== 8) {
                    mostrarAlerta('Por favor, digite um CEP válido.', 'atencao');
                    cepInput.focus();
                    return;
                }

                // Aqui você pode adicionar a lógica para calcular o frete
                const shippingOptions = document.querySelector('.shipping-options');
                if (shippingOptions) {
                    shippingOptions.innerHTML = `
                        <div class="frete-opcoes">
                            <label class="frete-opcao">
                                <input type="radio" name="frete" value="15.90" checked>
                                <div class="frete-info">
                                    <div class="frete-tipo">PAC</div>
                                    <div class="frete-prazo">5-8 dias úteis</div>
                                    <div class="frete-valor">R$ 15,90</div>
                                </div>
                            </label>
                            <label class="frete-opcao">
                                <input type="radio" name="frete" value="25.90">
                                <div class="frete-info">
                                    <div class="frete-tipo">SEDEX</div>
                                    <div class="frete-prazo">1-3 dias úteis</div>
                                    <div class="frete-valor">R$ 25,90</div>
                                </div>
                            </label>
                        </div>
                    `;
                    shippingOptions.classList.add('show');

                    // Habilitar o botão de finalizar compra
                    if (finalizarBtn) {
                        finalizarBtn.disabled = false;
                        finalizarBtn.title = 'Finalizar compra';
                    }

                    // Adicionar event listeners para os radios de frete
                    const freteRadios = shippingOptions.querySelectorAll('input[name="frete"]');
                    freteRadios.forEach(radio => {
                        radio.addEventListener('change', () => {
                            const freteValor = parseFloat(radio.value);
                            atualizarTotal(freteValor);
                            
                            // Garantir que o botão continue habilitado quando trocar o frete
                            if (finalizarBtn) {
                                finalizarBtn.disabled = false;
                                finalizarBtn.title = 'Finalizar compra';
                            }
                        });
                    });

                    // Atualizar o total com o valor do PAC (opção padrão)
                    atualizarTotal(15.90);
                }
            });
        }
    }

    // Função para remover item
    function removeItem(itemId) {
        const item = document.querySelector(`.cart-item[data-id="${itemId}"]`);
        if (item) {
            item.classList.add('removing');
            
            setTimeout(() => {
                // Remover o item do array local
                cartItems = cartItems.filter(item => item.id !== itemId);
                
                // Atualizar o localStorage
                localStorage.setItem('carrinho', JSON.stringify(cartItems));
                
                // Se o CartManager estiver disponível, atualizar através dele
                if (window.cartManager) {
                    window.cartManager.loadCartState();
                    window.cartManager.updateHeaderCounter();
                }
                
                // Renderizar os itens atualizados
                renderCartItems();
                
                // Atualizar explicitamente o resumo do pedido
                atualizarResumo();
                
                // Atualizar o total
                const total = cartItems.reduce((sum, item) => {
                    return sum + (parseFloat(item.preco) * (item.quantidade || 1));
                }, 0);
                updateTotal(total);
                
                // Desabilitar o botão de finalizar se o carrinho ficar vazio
                const finalizarBtn = document.querySelector('.btn-finalizar');
                if (finalizarBtn && cartItems.length === 0) {
                    finalizarBtn.disabled = true;
                    finalizarBtn.title = 'Seu carrinho está vazio';
                }
            }, 300);
        }
    }

    // Função para alterar quantidade
    function alterarQuantidade(itemId, delta) {
        const item = cartItems.find(item => item.id === itemId);
        if (item) {
            const novaQuantidade = (item.quantidade || 1) + delta;
            if (novaQuantidade > 0) {
                item.quantidade = novaQuantidade;
                localStorage.setItem('carrinho', JSON.stringify(cartItems));
                renderCartItems();
                atualizarResumo();
                
                // Atualizar o contador global do carrinho se disponível
                if (window.cartManager) {
                    window.cartManager.loadCartState();
                    window.cartManager.updateHeaderCounter();
                }
            }
        }
    }

    function atualizarResumo() {
        const summaryProducts = document.querySelector('.summary-products');
        if (!summaryProducts) return;

        if (cartItems.length === 0) {
            summaryProducts.innerHTML = `
                <div class="empty-summary">
                    <p>Nenhum item no carrinho</p>
                    <small>Adicione produtos para ver o resumo aqui</small>
                </div>
            `;
        } else {
            let html = '';
            cartItems.forEach(item => {
                const precoTotal = (item.quantidade || 1) * item.preco;
                html += `
                    <div class="summary-product">
                        <span class="summary-product-name">${item.nome}</span>
                        <span class="summary-product-size">Tam: ${item.tamanho || 'Único'}</span>
                        <span class="summary-product-quantity">${item.quantidade || 1}x</span>
                        <span class="summary-product-price">${precoTotal.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                        })}</span>
                    </div>
                `;
            });
            summaryProducts.innerHTML = html;
        }

        // Recalcular e atualizar o total
        const total = cartItems.reduce((sum, item) => {
            return sum + (parseFloat(item.preco) * (item.quantidade || 1));
        }, 0);

        // Pegar o valor atual do frete se existir
        const freteRadios = document.querySelectorAll('input[name="frete"]');
        let freteValor = 0;
        freteRadios.forEach(radio => {
            if (radio.checked) {
                freteValor = parseFloat(radio.value);
            }
        });

        atualizarTotal(freteValor);
    }

    // Renderizar itens iniciais
    renderCartItems();
}); 