document.addEventListener('DOMContentLoaded', () => {
    // Recuperar dados do pedido do localStorage
    const dadosPedido = JSON.parse(localStorage.getItem('dadosPedidoConfirmado'));
    
    if (!dadosPedido) {
        window.location.href = 'carrinho.html';
        return;
    }

    // Formatar forma de pagamento para exibição
    const formatarFormaPagamento = (formaPagamento) => {
        const formatos = {
            'credit': 'Cartão de Crédito',
            'debit': 'Cartão de Débito',
            'pix': 'PIX',
            'boleto': 'Boleto'
        };
        return formatos[formaPagamento] || formaPagamento;
    };

    // Atualizar elementos na página
    const valorElement = document.querySelector('.valor.destaque');
    const formaPagamentoElement = document.querySelector('.pagamento .valor');

    if (valorElement) {
        valorElement.textContent = dadosPedido.total.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    if (formaPagamentoElement) {
        formaPagamentoElement.textContent = formatarFormaPagamento(dadosPedido.formaPagamento);
    }

    // Calcular e exibir a data prevista de entrega (5 dias úteis a partir de hoje)
    const calcularDataEntrega = () => {
        const hoje = new Date();
        let diasUteis = 0;
        let dataEntrega = new Date(hoje);
        
        while (diasUteis < 5) {
            dataEntrega.setDate(dataEntrega.getDate() + 1);
            // 0 = Domingo, 6 = Sábado
            if (dataEntrega.getDay() !== 0 && dataEntrega.getDay() !== 6) {
                diasUteis++;
            }
        }
        
        return dataEntrega.toLocaleDateString('pt-BR');
    };

    // Atualizar a data de entrega
    const entregaElement = document.querySelector('.entrega .valor');
    if (entregaElement) {
        entregaElement.textContent = calcularDataEntrega();
    }

    // Verificar se o pagamento é PIX e exibir o QR Code
    if (dadosPedido.formaPagamento === 'pix') {
        const cardPix = document.querySelector('.card-pix');
        if (cardPix) {
            cardPix.style.display = 'block';
            
            // Gerar QR Code
            const qrcodeContainer = document.getElementById('qrcode');
            if (qrcodeContainer && window.QRCode) {
                // Criar um código PIX fictício baseado no valor total e número do pedido
                const valorFormatado = dadosPedido.total.toFixed(2).replace('.', '');
                const numeroPedido = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
                const pixCopia = `00020126580014BR.GOV.BCB.PIX0136example.com/pix/v2/cobv/${numeroPedido}${valorFormatado}`;
                
                // Atualizar o campo de texto com o código PIX
                const pixCodeInput = document.getElementById('pix-code');
                if (pixCodeInput) {
                    pixCodeInput.value = pixCopia;
                }
                
                // Gerar o QR Code
                QRCode.toCanvas(qrcodeContainer, pixCopia, {
                    width: 200,
                    margin: 1,
                    color: {
                        dark: '#333333',
                        light: '#FFFFFF'
                    }
                }, function (error) {
                    if (error) console.error(error);
                });
                
                // Iniciar o temporizador
                iniciarTemporizador();
                
                // Adicionar funcionalidade para copiar o código PIX
                const btnCopy = document.getElementById('copy-pix');
                const copyMessage = document.getElementById('copy-message');
                
                if (btnCopy && copyMessage) {
                    btnCopy.addEventListener('click', () => {
                        const pixCode = document.getElementById('pix-code');
                        pixCode.select();
                        document.execCommand('copy');
                        
                        // Mostrar mensagem de confirmação
                        copyMessage.style.display = 'inline-block';
                        setTimeout(() => {
                            copyMessage.style.display = 'none';
                        }, 3000);
                    });
                }
            }
        }
    }
    
    // Função para iniciar o temporizador de 30 minutos
    function iniciarTemporizador() {
        const timerMinutes = document.getElementById('timer-minutes');
        const timerSeconds = document.getElementById('timer-seconds');
        
        if (!timerMinutes || !timerSeconds) return;
        
        let minutes = 30;
        let seconds = 0;
        
        const timer = setInterval(() => {
            if (seconds === 0) {
                if (minutes === 0) {
                    clearInterval(timer);
                    // Aqui você pode adicionar código para expirar o QR Code
                    return;
                }
                minutes--;
                seconds = 59;
            } else {
                seconds--;
            }
            
            timerMinutes.textContent = minutes.toString().padStart(2, '0');
            timerSeconds.textContent = seconds.toString().padStart(2, '0');
        }, 1000);
    }

    // Limpar dados do pedido do localStorage após exibir
    localStorage.removeItem('dadosPedidoConfirmado');
}); 