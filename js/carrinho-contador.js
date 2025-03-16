function atualizarContadorCarrinho() {
    const contador = document.querySelector('.cart-count');
    if (!contador) return;

    try {
        // Obtém o carrinho do localStorage
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        
        // Calcula o total de itens incluindo as quantidades
        const totalItens = carrinho.reduce((total, item) => {
            // Garante que quantidade seja um número válido
            const quantidade = parseInt(item.quantidade) || 1;
            return total + quantidade;
        }, 0);

        // Atualiza a visibilidade e o texto do contador
        if (totalItens > 0) {
            contador.style.display = 'flex';
            contador.textContent = totalItens > 99 ? '99+' : totalItens;
        } else {
            contador.style.display = 'none';
            contador.textContent = '0';
        }
    } catch (error) {
        console.error('Erro ao atualizar contador:', error);
        contador.style.display = 'none';
        contador.textContent = '0';
    }
}

// Atualiza o contador quando:

// 1. A página carrega
document.addEventListener('DOMContentLoaded', atualizarContadorCarrinho);

// 2. O localStorage é modificado em outra aba
window.addEventListener('storage', (e) => {
    if (e.key === 'carrinho') {
        atualizarContadorCarrinho();
    }
});

// 3. Um item é adicionado/removido do carrinho
document.addEventListener('carrinhoAtualizado', atualizarContadorCarrinho);

// Disponibiliza globalmente
window.atualizarContadorCarrinho = atualizarContadorCarrinho;

// Executa a primeira vez
atualizarContadorCarrinho(); 