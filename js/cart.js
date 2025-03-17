// Função para validar formato do CEP
function isValidCEP(cep) {
    const cepRegex = /^[0-9]{5}-?[0-9]{3}$/;
    return cepRegex.test(cep);
}

// Função para formatar o CEP
function formatCEP(cep) {
    cep = cep.replace(/\D/g, '');
    if (cep.length > 5) {
        cep = cep.substring(0, 5) + '-' + cep.substring(5);
    }
    return cep;
}

// Função para calcular prazo de entrega simulado
function calcularPrazoEntrega(tipo) {
    const prazos = {
        'PAC': { min: 5, max: 8 },
        'SEDEX': { min: 1, max: 3 }
    };
    return prazos[tipo];
}

// Função para calcular frete simulado
function calcularFrete(cep) {
    // Simulação de valores de frete baseado no CEP
    const cepNum = parseInt(cep.replace(/\D/g, ''));
    
    // Valores base para simulação
    const freteBase = {
        'PAC': 15.90,
        'SEDEX': 25.90
    };

    // Adiciona variação baseada no CEP para simular diferentes regiões
    const variacao = (cepNum % 10) / 10;
    
    // Calcula valores para cada tipo de frete
    const fretes = {
        'PAC': (freteBase.PAC + (freteBase.PAC * variacao)).toFixed(2),
        'SEDEX': (freteBase.SEDEX + (freteBase.SEDEX * variacao)).toFixed(2)
    };

    // Gera HTML com as opções de frete
    const shippingOptions = document.querySelector('.shipping-options');
    if (shippingOptions) {
        const prazoPAC = calcularPrazoEntrega('PAC');
        const prazoSEDEX = calcularPrazoEntrega('SEDEX');

        shippingOptions.innerHTML = `
            <div class="frete-opcoes">
                <label class="frete-opcao">
                    <input type="radio" name="frete" value="${fretes.PAC}" checked>
                    <div class="frete-info">
                        <div class="frete-tipo">PAC</div>
                        <div class="frete-prazo">${prazoPAC.min}-${prazoPAC.max} dias úteis</div>
                        <div class="frete-valor">R$ ${fretes.PAC.replace('.', ',')}</div>
                    </div>
                </label>
                <label class="frete-opcao">
                    <input type="radio" name="frete" value="${fretes.SEDEX}">
                    <div class="frete-info">
                        <div class="frete-tipo">SEDEX</div>
                        <div class="frete-prazo">${prazoSEDEX.min}-${prazoSEDEX.max} dias úteis</div>
                        <div class="frete-valor">R$ ${fretes.SEDEX.replace('.', ',')}</div>
                    </div>
                </label>
            </div>
        `;

        // Adiciona a classe show para exibir as opções
        shippingOptions.classList.add('show');

        // Adiciona evento para atualizar o total quando a opção de frete é alterada
        const freteRadios = shippingOptions.querySelectorAll('input[name="frete"]');
        freteRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                atualizarTotalComFrete(parseFloat(radio.value));
            });
        });

        // Atualiza o total com o valor do PAC (opção padrão)
        atualizarTotalComFrete(parseFloat(fretes.PAC));
    }

    return fretes;
}

// Função para atualizar o total com o frete
function atualizarTotalComFrete(freteValor = 0) {
    const totalElement = document.querySelector('.total-value');
    const freteElement = document.querySelector('.summary-item.frete .frete-value');
    const summaryProducts = document.querySelector('.summary-products');
    
    if (!totalElement || !summaryProducts) return;

    // Calcula o total dos produtos
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const subtotal = carrinho.reduce((total, item) => {
        return total + (item.preco * item.quantidade);
    }, 0);

    // Atualiza o valor do frete no resumo
    if (freteElement) {
        freteElement.textContent = `R$ ${freteValor.toFixed(2).replace('.', ',')}`;
    } else {
        // Se o elemento do frete não existir, cria ele
        const summaryItemsList = document.querySelector('.summary-item.items-list');
        if (summaryItemsList) {
            const freteItem = document.createElement('div');
            freteItem.className = 'summary-item frete';
            freteItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>Frete:</span>
                    <span class="frete-value">R$ ${freteValor.toFixed(2).replace('.', ',')}</span>
                </div>
            `;
            summaryItemsList.insertAdjacentElement('afterend', freteItem);
        }
    }

    const total = subtotal + freteValor;
    totalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Função para atualizar os itens no resumo
function atualizarItensResumo(carrinho) {
    const summaryProducts = document.querySelector('.summary-products');
    if (!summaryProducts) return;

    if (carrinho.length === 0) {
        summaryProducts.innerHTML = '<p class="empty-cart-summary">Nenhum item no carrinho</p>';
        return;
    }

    let html = '';
    carrinho.forEach(produto => {
        html += `
            <div class="summary-product">
                <span class="summary-product-name">${produto.nome}</span>
                <span class="summary-product-size">Tam: ${produto.tamanho || 'Único'}</span>
                <span class="summary-product-quantity">x${produto.quantidade}</span>
                <span class="summary-product-price">R$ ${(produto.preco * produto.quantidade).toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    });

    summaryProducts.innerHTML = html;
}

// Função para carregar os produtos do carrinho
function carregarProdutosCarrinho() {
    const cartItems = document.querySelector('.cart-items');
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    
    if (carrinho.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Seu carrinho está vazio</p>';
        atualizarSubtotalETotal(0);
        atualizarItensResumo([]); // Atualiza o resumo vazio
        return;
    }

    let html = '';
    let subtotal = 0;

    carrinho.forEach(produto => {
        const total = produto.preco * produto.quantidade;
        subtotal += total;

        html += `
            <div class="cart-item" data-id="${produto.id}">
                <div class="cart-item-image">
                    <img src="${produto.imagem}" alt="${produto.nome}">
                </div>
                <div class="cart-item-info">
                    <h3>${produto.nome}</h3>
                    <p class="price">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
                    <p class="item-size">Tamanho: <span>${produto.tamanho || 'Único'}</span></p>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" onclick="alterarQuantidade(${produto.id}, -1)">-</button>
                        <span class="quantity">${produto.quantidade}</span>
                        <button class="quantity-btn plus" onclick="alterarQuantidade(${produto.id}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removerProduto(${produto.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });

    cartItems.innerHTML = html;
    atualizarSubtotalETotal(subtotal);
    atualizarItensResumo(carrinho); // Atualiza o resumo com os itens
}

// Função para atualizar subtotal e total
function atualizarSubtotalETotal(subtotal) {
    const totalElement = document.querySelector('.total-value');
    if (totalElement) {
        totalElement.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    }
}

// Função para mostrar alerta do carrinho
function mostrarAlertaCarrinho(mensagem) {
    const alerta = document.getElementById('cart-alert');
    const mensagemElement = alerta.querySelector('.cart-alert-message');
    
    // Atualiza a mensagem
    mensagemElement.textContent = mensagem;
    
    // Remove a classe show caso já exista
    alerta.classList.remove('show');
    
    // Força um reflow para reiniciar a animação
    void alerta.offsetWidth;
    
    // Adiciona a classe show
    alerta.classList.add('show');
    
    // Remove o alerta após 3 segundos
    setTimeout(() => {
        alerta.classList.remove('show');
    }, 3000);
}

// Função para alterar a quantidade de um produto
function alterarQuantidade(produtoId, delta) {
    if (window.cartManager) {
        window.cartManager.updateItemQuantity(produtoId, delta);
    }
}

// Função para remover um produto
function removerProduto(produtoId) {
    if (window.cartManager) {
        window.cartManager.removeItem(produtoId);
    }
}

// Adiciona os eventos quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    const cepInput = document.querySelector('#cep');
    const btnCalcularFrete = document.querySelector('.btn-calcular-frete');
    const btnFinalizarCompra = document.querySelector('.btn-finalizar');
    
    if (!cepInput || !btnCalcularFrete) return;

    // Formata o CEP enquanto digita
    cepInput.addEventListener('input', function(e) {
        let cep = e.target.value;
        cep = cep.replace(/\D/g, '');
        if (cep.length > 8) cep = cep.slice(0, 8);
        e.target.value = formatCEP(cep);
    });

    // Permite calcular o frete pressionando Enter no campo de CEP
    cepInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const cep = this.value.replace(/\D/g, '');
            if (isValidCEP(cep)) {
                calcularFrete(cep);
            } else {
                alert('Por favor, digite um CEP válido');
            }
        }
    });

    // Calcula o frete ao clicar no botão
    btnCalcularFrete.addEventListener('click', function() {
        const cep = cepInput.value.replace(/\D/g, '');
        if (isValidCEP(cep)) {
            calcularFrete(cep);
        } else {
            alert('Por favor, digite um CEP válido');
        }
    });

    // Redireciona para o checkout ao clicar em Finalizar Compra
    if (btnFinalizarCompra) {
        btnFinalizarCompra.addEventListener('click', function() {
            const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
            if (carrinho.length === 0) {
                alert('Adicione produtos ao carrinho antes de finalizar a compra');
                return;
            }

            const freteRadio = document.querySelector('input[name="frete"]:checked');
            if (!freteRadio) {
                alert('Por favor, calcule o frete antes de finalizar a compra');
                return;
            }

            // Salva o valor do frete selecionado
            localStorage.setItem('shipping_cost', freteRadio.value);

            // Redireciona para a página de checkout
            window.location.href = 'checkout.html';
        });
    }

    // Atualiza o carrinho quando a página carrega
    if (window.cartManager) {
        window.cartManager.renderCartItems();
    }
});

function atualizarTotal() {
    const subtotalElement = document.querySelector('.subtotal-value');
    const freteSelect = document.querySelector('.frete-select');
    const totalElement = document.querySelector('.total-value');

    if (!subtotalElement || !freteSelect || !totalElement) return;

    const subtotal = parseFloat(subtotalElement.textContent.replace('R$ ', '').replace(',', '.'));
    const frete = freteSelect.value ? parseFloat(freteSelect.value) : 0;
    const total = subtotal + frete;

    totalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
} 