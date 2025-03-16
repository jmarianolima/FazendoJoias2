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

    // Limpar dados do pedido do localStorage após exibir
    localStorage.removeItem('dadosPedidoConfirmado');
}); 