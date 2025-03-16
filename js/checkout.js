document.addEventListener('DOMContentLoaded', () => {
    // Elementos do formulário
    const form = document.querySelector('.checkout-form');
    const btnConfirmar = document.querySelector('.btn-confirmar');
    const cepInput = document.querySelector('#cep');
    const telefoneInput = document.querySelector('#telefone');

    // Máscara para o CEP
    cepInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);
        if (value.length > 5) {
            value = value.slice(0, 5) + '-' + value.slice(5);
        }
        e.target.value = value;
    });

    // Máscara para o telefone
    telefoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length > 2) {
            value = '(' + value.slice(0, 2) + ') ' + value.slice(2);
        }
        if (value.length > 10) {
            value = value.slice(0, 10) + '-' + value.slice(10);
        }
        e.target.value = value;
    });

    // Buscar endereço pelo CEP
    cepInput.addEventListener('blur', async () => {
        const cep = cepInput.value.replace(/\D/g, '');
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                
                if (!data.erro) {
                    document.querySelector('#rua').value = data.logradouro;
                    document.querySelector('#bairro').value = data.bairro;
                    document.querySelector('#cidade').value = data.localidade;
                    document.querySelector('#estado').value = data.uf;
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
            }
        }
    });

    // Carregar itens do carrinho
    function carregarItensCarrinho() {
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const summaryItems = document.querySelector('.summary-items');
        
        if (!summaryItems) return;

        if (carrinho.length === 0) {
            window.location.href = 'carrinho.html';
            return;
        }

        let html = '';
        let subtotal = 0;

        carrinho.forEach(item => {
            const quantidade = item.quantidade || 1;
            const precoTotal = item.preco * quantidade;
            subtotal += precoTotal;

            html += `
                <div class="summary-item">
                    <span class="item-name">${item.nome} (${quantidade}x)</span>
                    <span class="item-price">${precoTotal.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                    })}</span>
                </div>
            `;
        });

        // Adicionar frete se existir
        const freteRadios = document.querySelectorAll('input[name="frete"]');
        let freteValor = 0;
        freteRadios.forEach(radio => {
            if (radio.checked) {
                freteValor = parseFloat(radio.value);
            }
        });

        // Adicionar linha do frete
        html += `
            <div class="summary-item frete">
                <span class="item-name">Frete</span>
                <span class="item-price">${freteValor.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                })}</span>
            </div>
        `;

        // Calcular e adicionar total
        const total = subtotal + freteValor;
        html += `
            <div class="summary-total">
                <span>Total</span>
                <span class="total-price">${total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                })}</span>
            </div>
        `;

        summaryItems.innerHTML = html;
    }

    // Carregar itens inicialmente
    carregarItensCarrinho();

    // Validar formulário antes de enviar
    const validarFormulario = () => {
        const campos = [
            { id: 'nome', mensagem: 'Nome completo é obrigatório' },
            { id: 'telefone', mensagem: 'Telefone é obrigatório' },
            { id: 'rua', mensagem: 'Rua é obrigatória' },
            { id: 'numero', mensagem: 'Número é obrigatório' },
            { id: 'bairro', mensagem: 'Bairro é obrigatório' },
            { id: 'cep', mensagem: 'CEP é obrigatório' },
            { id: 'cidade', mensagem: 'Cidade é obrigatória' }
        ];

        let isValid = true;
        campos.forEach(campo => {
            const input = document.querySelector(`#${campo.id}`);
            const errorElement = input.parentElement.querySelector('.error-message');
            
            if (!input.value.trim()) {
                isValid = false;
                if (!errorElement) {
                    const error = document.createElement('span');
                    error.className = 'error-message';
                    error.style.color = 'red';
                    error.style.fontSize = '0.75rem';
                    error.textContent = campo.mensagem;
                    input.parentElement.appendChild(error);
                }
                input.style.borderColor = 'red';
            } else {
                if (errorElement) {
                    errorElement.remove();
                }
                input.style.borderColor = '';
            }
        });

        return isValid;
    };

    // Finalizar pedido
    btnConfirmar.addEventListener('click', async (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        const formData = {
            nome: document.querySelector('#nome').value,
            telefone: document.querySelector('#telefone').value,
            endereco: {
                rua: document.querySelector('#rua').value,
                numero: document.querySelector('#numero').value,
                complemento: document.querySelector('#complemento').value,
                bairro: document.querySelector('#bairro').value,
                cep: document.querySelector('#cep').value,
                cidade: document.querySelector('#cidade').value,
                estado: document.querySelector('#estado').value
            },
            formaPagamento: document.querySelector('input[name="payment"]:checked').value,
            itens: JSON.parse(localStorage.getItem('carrinho')) || [],
            frete: parseFloat(localStorage.getItem('shipping_cost')) || 0
        };

        try {
            // Pegar o valor total diretamente do elemento que está sendo exibido no checkout
            const totalElement = document.querySelector('.total-price');
            const totalTexto = totalElement ? totalElement.textContent : '0';
            const total = parseFloat(totalTexto.replace(/[^\d,]/g, '').replace(',', '.'));

            // Salvar dados do pedido para a página de confirmação
            const dadosConfirmacao = {
                total: total,
                formaPagamento: formData.formaPagamento,
                frete: formData.frete
            };
            localStorage.setItem('dadosPedidoConfirmado', JSON.stringify(dadosConfirmacao));

            // Aqui você pode implementar a chamada para sua API de pedidos
            // const response = await fetch('/api/pedidos', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(formData)
            // });

            // Simulando sucesso
            localStorage.removeItem('carrinho');
            localStorage.removeItem('shipping_cost');
            window.location.href = 'pedido-confirmado.html';
        } catch (error) {
            console.error('Erro ao finalizar pedido:', error);
            alert('Erro ao finalizar pedido. Por favor, tente novamente.');
        }
    });

    // Controle de exibição dos campos de pagamento
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    const creditCardFields = document.getElementById('credit-card-fields');
    const boletoInfo = document.getElementById('boleto-info');
    const pixInfo = document.getElementById('pix-info');

    // Máscara para o número do cartão
    const cardNumberInput = document.getElementById('card-number');
    cardNumberInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = value;
    });

    // Máscara para a validade do cartão
    const cardExpiryInput = document.getElementById('card-expiry');
    cardExpiryInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2);
        }
        e.target.value = value;
    });

    // Máscara para o CVV
    const cardCvvInput = document.getElementById('card-cvv');
    cardCvvInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    // Controle da exibição dos campos de acordo com a forma de pagamento selecionada
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            // Esconde todos os campos/informações
            creditCardFields.style.display = 'none';
            boletoInfo.style.display = 'none';
            pixInfo.style.display = 'none';

            // Exibe apenas os campos/informações da opção selecionada
            switch(this.value) {
                case 'credit':
                    creditCardFields.style.display = 'block';
                    break;
                case 'boleto':
                    boletoInfo.style.display = 'block';
                    break;
                case 'pix':
                    pixInfo.style.display = 'block';
                    break;
            }
        });
    });

    // Validação do formulário antes do envio
    btnConfirmar.addEventListener('click', function(e) {
        e.preventDefault();
        
        const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
        
        if (selectedPayment === 'credit') {
            // Validação dos campos do cartão
            const cardNumber = cardNumberInput.value.replace(/\s/g, '');
            const cardName = document.getElementById('card-name').value;
            const cardExpiry = cardExpiryInput.value;
            const cardCvv = cardCvvInput.value;

            if (cardNumber.length !== 16) {
                alert('Por favor, insira um número de cartão válido');
                return;
            }
            if (!cardName) {
                alert('Por favor, insira o nome como está no cartão');
                return;
            }
            if (!cardExpiry || cardExpiry.length !== 5) {
                alert('Por favor, insira uma data de validade válida');
                return;
            }
            if (!cardCvv || cardCvv.length !== 3) {
                alert('Por favor, insira um CVV válido');
                return;
            }
        }

        // Se passou por todas as validações, redireciona para a página de confirmação
        window.location.href = 'pedido-confirmado.html';
    });
}); 