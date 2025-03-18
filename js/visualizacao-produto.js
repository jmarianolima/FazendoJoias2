console.log('[VisualizacaoProduto] Script carregado');

// Função para mostrar alerta do carrinho
function mostrarAlertaCarrinho(mensagem, tipo = 'sucesso') {
    console.log('Tentando mostrar alerta:', mensagem);
    
    // Remove alerta existente se houver
    const alertaExistente = document.querySelector('.cart-alert');
    if (alertaExistente) {
        console.log('Removendo alerta existente');
        alertaExistente.remove();
    }
    
    // Define o ícone baseado no tipo
    const icone = tipo === 'sucesso' ? 'fa-check-circle' : 'fa-exclamation-circle';
    const corIcone = tipo === 'sucesso' ? '#4ade80' : '#fbbf24';
    
    // Cria novo alerta
    const alertaHTML = `
        <div class="cart-alert ${tipo}">
            <div class="cart-alert-content">
                <i class="fas ${icone}" style="color: ${corIcone}"></i>
                <span class="cart-alert-message">${mensagem}</span>
                <button class="cart-alert-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="cart-alert-progress"></div>
        </div>
    `;
    
    // Adiciona o novo alerta ao body
    console.log('Adicionando novo alerta ao body');
    document.body.insertAdjacentHTML('beforeend', alertaHTML);
    
    // Força um reflow e mostra o alerta
    const alerta = document.querySelector('.cart-alert');
    if (alerta) {
        console.log('Alerta criado, adicionando classe show');
        // Força reflow
        void alerta.offsetHeight;
        
        // Adiciona a classe show
        requestAnimationFrame(() => {
            alerta.classList.add('show');
        });

        // Adiciona evento de clique no botão fechar
        const btnFechar = alerta.querySelector('.cart-alert-close');
        if (btnFechar) {
            btnFechar.addEventListener('click', () => {
                alerta.classList.remove('show');
                setTimeout(() => {
                    alerta.remove();
                }, 300);
            });
        }
        
        // Remove o alerta após 3 segundos
        const timeoutId = setTimeout(() => {
            if (document.body.contains(alerta)) {
                console.log('Removendo classe show do alerta');
                alerta.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(alerta)) {
                        console.log('Removendo alerta do DOM');
                        alerta.remove();
                    }
                }, 300);
            }
        }, 3000);

        // Limpa o timeout se o alerta for fechado manualmente
        btnFechar.addEventListener('click', () => {
            clearTimeout(timeoutId);
        });
    } else {
        console.error('Falha ao criar o alerta');
    }
}

// Função para atualizar o contador do carrinho
function atualizarContadorCarrinho() {
    console.log('[VisualizacaoProduto] Atualizando contador do carrinho');
    try {
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const contador = carrinho.reduce((total, produto) => total + (produto.quantidade || 1), 0);
        
        console.log('[VisualizacaoProduto] Total de itens:', contador);
        
        // Atualiza todos os contadores na página
        const contadorElements = document.querySelectorAll('.cart-count');
        contadorElements.forEach(element => {
            if (element) {
                element.textContent = contador > 99 ? '99+' : contador.toString();
                element.style.display = contador > 0 ? 'flex' : 'none';
                console.log('[VisualizacaoProduto] Contador atualizado:', element.textContent);
            }
        });
    } catch (error) {
        console.error('[VisualizacaoProduto] Erro ao atualizar contador:', error);
    }
}

// Configuração dos listeners de eventos
function setupEventListeners() {
    console.log('[VisualizacaoProduto] Configurando listeners de eventos');
    
    // Listener para remoção de item
    document.addEventListener('itemRemovidoDoCarrinho', (e) => {
        console.log('[VisualizacaoProduto] Evento itemRemovidoDoCarrinho recebido:', e.detail);
        atualizarContadorCarrinho();
        if (e.detail && e.detail.itemRemovido) {
            mostrarAlertaCarrinho(`${e.detail.itemRemovido.nome} removido do carrinho`);
        }
    });

    // Listener para mudanças no localStorage
    window.addEventListener('storage', (e) => {
        if (e.key === 'carrinho') {
            console.log('[VisualizacaoProduto] Mudança detectada no localStorage');
            atualizarContadorCarrinho();
        }
    });
}

// Inicializa os listeners quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('[VisualizacaoProduto] DOM carregado, inicializando...');
    setupEventListeners();
    atualizarContadorCarrinho();
});

// Função para adicionar produto ao carrinho
function adicionarAoCarrinho(produto) {
    console.log('Adicionando produto ao carrinho:', produto);
    
    if (window.cartManager) {
        // Usa o CartManager se disponível
        window.cartManager.addItem(produto);
        mostrarAlertaCarrinho(`${produto.nome} adicionado ao carrinho`);
    } else {
        // Fallback para o método antigo
        let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        const produtoExistente = carrinho.find(p => p.id === produto.id && p.tamanho === produto.tamanho);
        
        if (produtoExistente) {
            produtoExistente.quantidade += 1;
            mostrarAlertaCarrinho(`Quantidade de ${produto.nome} aumentada para ${produtoExistente.quantidade}`);
        } else {
            produto.quantidade = 1;
            carrinho.push(produto);
            mostrarAlertaCarrinho(`${produto.nome} adicionado ao carrinho`);
        }
        
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        // Dispara evento personalizado
        document.dispatchEvent(new CustomEvent('carrinhoAtualizado'));
        atualizarContadorCarrinho();
    }
}

// Função para carregar avaliações do produto
async function carregarAvaliacoes(produtoId) {
    console.log('[VisualizacaoProduto] Carregando avaliações para o produto ID:', produtoId);
    
    // Aqui você pode implementar uma chamada para uma API real
    // Por enquanto, vamos simular algumas avaliações
    const avaliacoes = [
        {
            id: 1,
            usuario: {
                nome: "Maria Silva",
                iniciais: "MS"
            },
            data: "25/06/2023",
            estrelas: 5,
            comentario: "Anel lindo e de excelente qualidade! O diamante brilha muito e o acabamento é perfeito. Chegou antes do prazo previsto e muito bem embalado. Super recomendo!"
        },
        {
            id: 2,
            usuario: {
                nome: "João Paulo",
                iniciais: "JP"
            },
            data: "18/06/2023",
            estrelas: 5,
            comentario: "Comprei para o pedido de casamento e foi um sucesso! A qualidade é excepcional e o atendimento da loja foi impecável. Minha noiva adorou!"
        },
        {
            id: 3,
            usuario: {
                nome: "Carla Almeida",
                iniciais: "CA"
            },
            data: "10/06/2023",
            estrelas: 4,
            comentario: "O anel é muito bonito, mas achei que o diamante seria um pouco maior. De qualquer forma, a qualidade é ótima e o atendimento foi excelente."
        },
        {
            id: 4,
            usuario: {
                nome: "Roberto Santos",
                iniciais: "RS"
            },
            data: "05/06/2023",
            estrelas: 5,
            comentario: "Produto de altíssima qualidade! Entrega rápida e embalagem segura. Recomendo a todos!"
        },
        {
            id: 5,
            usuario: {
                nome: "Ana Luiza",
                iniciais: "AL"
            },
            data: "28/05/2023",
            estrelas: 5,
            comentario: "Simplesmente perfeito! O anel é ainda mais bonito pessoalmente. Valeu cada centavo!"
        },
        {
            id: 6,
            usuario: {
                nome: "Pedro Henrique",
                iniciais: "PH"
            },
            data: "20/05/2023",
            estrelas: 3,
            comentario: "O produto é bom, mas demorou mais do que o esperado para chegar. O atendimento ao cliente poderia ser melhor."
        }
    ];
    
    return {
        media: 4.8,
        total: 24,
        distribuicao: {
            5: 75,
            4: 20,
            3: 5,
            2: 0,
            1: 0
        },
        avaliacoes: avaliacoes
    };
}

// Função para renderizar as avaliações na página
function renderizarAvaliacoes(dadosAvaliacoes) {
    console.log('[VisualizacaoProduto] Renderizando avaliações:', dadosAvaliacoes);
    
    // Atualizar média e total
    document.querySelector('.media-valor').textContent = dadosAvaliacoes.media.toFixed(1);
    document.querySelector('.total-avaliacoes').textContent = `Baseado em ${dadosAvaliacoes.total} avaliações`;
    
    // Atualizar distribuição de estrelas
    for (let i = 5; i >= 1; i--) {
        const porcentagem = dadosAvaliacoes.distribuicao[i];
        const barraElement = document.querySelector(`.barra-estrela:nth-child(${6-i}) .barra-preenchida`);
        const porcentagemElement = document.querySelector(`.barra-estrela:nth-child(${6-i}) .estrela-porcentagem`);
        
        if (barraElement && porcentagemElement) {
            barraElement.style.width = `${porcentagem}%`;
            porcentagemElement.textContent = `${porcentagem}%`;
        }
    }
    
    // Limpar lista de avaliações existente
    const listaAvaliacoes = document.querySelector('.avaliacoes-lista');
    // Manter apenas o botão "Ver Mais"
    const btnMaisAvaliacoes = listaAvaliacoes.querySelector('.btn-mais-avaliacoes');
    listaAvaliacoes.innerHTML = '';
    
    // Adicionar avaliações (limitado a 3 inicialmente)
    const avaliacoesVisiveis = dadosAvaliacoes.avaliacoes.slice(0, 3);
    
    avaliacoesVisiveis.forEach(avaliacao => {
        const avaliacaoHTML = criarElementoAvaliacao(avaliacao);
        listaAvaliacoes.appendChild(avaliacaoHTML);
    });
    
    // Adicionar botão "Ver Mais" se houver mais avaliações
    if (dadosAvaliacoes.avaliacoes.length > 3) {
        const btnMais = document.createElement('button');
        btnMais.className = 'btn-mais-avaliacoes';
        btnMais.textContent = 'Ver Mais Avaliações';
        btnMais.addEventListener('click', () => mostrarMaisAvaliacoes(dadosAvaliacoes.avaliacoes));
        listaAvaliacoes.appendChild(btnMais);
    }
}

// Função para criar elemento de avaliação
function criarElementoAvaliacao(avaliacao) {
    const avaliacaoItem = document.createElement('div');
    avaliacaoItem.className = 'avaliacao-item';
    avaliacaoItem.dataset.id = avaliacao.id;
    
    // Criar estrelas
    let estrelasHTML = '';
    for (let i = 1; i <= 5; i++) {
        const estrelaTipo = i <= avaliacao.estrelas ? 'fas' : 'far';
        estrelasHTML += `<i class="${estrelaTipo} fa-star"></i>`;
    }
    
    avaliacaoItem.innerHTML = `
        <div class="avaliacao-cabecalho">
            <div class="avaliacao-usuario">
                <div class="usuario-avatar">${avaliacao.usuario.iniciais}</div>
                <div class="usuario-info">
                    <h4 class="usuario-nome">${avaliacao.usuario.nome}</h4>
                    <span class="data-avaliacao">${avaliacao.data}</span>
                </div>
            </div>
            <div class="avaliacao-estrelas">
                ${estrelasHTML}
            </div>
        </div>
        <p class="avaliacao-comentario">${avaliacao.comentario}</p>
    `;
    
    return avaliacaoItem;
}

// Função para mostrar mais avaliações
function mostrarMaisAvaliacoes(todasAvaliacoes) {
    console.log('[VisualizacaoProduto] Mostrando mais avaliações');
    
    const listaAvaliacoes = document.querySelector('.avaliacoes-lista');
    const avaliacoesExistentes = listaAvaliacoes.querySelectorAll('.avaliacao-item');
    
    // Remover o botão "Ver Mais"
    const btnMais = listaAvaliacoes.querySelector('.btn-mais-avaliacoes');
    if (btnMais) {
        btnMais.remove();
    }
    
    // Adicionar as avaliações restantes
    const avaliacoesRestantes = todasAvaliacoes.slice(avaliacoesExistentes.length);
    
    avaliacoesRestantes.forEach(avaliacao => {
        const avaliacaoHTML = criarElementoAvaliacao(avaliacao);
        listaAvaliacoes.appendChild(avaliacaoHTML);
    });
}

// Função para formatar o preço no padrão brasileiro
function formatarPreco(valor) {
    return `R$${valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

// Carrega o produto e adiciona os eventos quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded disparado');
    
    try {
        // Pegar o ID do produto da URL
        const urlParams = new URLSearchParams(window.location.search);
        const produtoId = urlParams.get('id');

        // Carregar dados do produto
        const response = await fetch('DB/db.json');
        const data = await response.json();
        const produto = data.produtos.find(p => p.id === parseInt(produtoId));

        if (!produto) {
            console.error('Produto não encontrado');
            return;
        }

        // Preencher informações do produto na página
        document.querySelector('.produto-info h1').textContent = produto.nome;
        document.querySelector('.preco').textContent = formatarPreco(produto.preco);
        document.querySelector('.produto-descricao p').textContent = produto.descricao;
        document.querySelector('.produto-imagem-principal img').src = produto.imagem;
        
        // Preencher materiais
        const materiaisList = document.querySelector('.produto-materiais ul');
        materiaisList.innerHTML = '';
        produto.materiais.forEach(material => {
            const li = document.createElement('li');
            li.textContent = material;
            materiaisList.appendChild(li);
        });
        
        // Carregar avaliações do produto
        const dadosAvaliacoes = await carregarAvaliacoes(produto.id);
        renderizarAvaliacoes(dadosAvaliacoes);

        // Adicionar evento aos botões de tamanho
        const btnsSize = document.querySelectorAll('.tamanho-btn');
        btnsSize.forEach(btn => {
            btn.addEventListener('click', () => {
                // Se o botão já está selecionado, remove a seleção
                if (btn.classList.contains('selected')) {
                    btn.classList.remove('selected');
                } else {
                    // Se não está selecionado, remove a seleção dos outros e seleciona este
                    btnsSize.forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                }
            });
        });

        // Adiciona o botão de ir para o carrinho (inicialmente oculto)
        const btnContainer = document.querySelector('.adicionar-carrinho').parentElement;
        const btnIrCarrinho = document.createElement('a');
        btnIrCarrinho.href = 'carrinho.html';
        btnIrCarrinho.className = 'ir-carrinho';
        btnIrCarrinho.innerHTML = 'Ir para o Carrinho <i class="fas fa-shopping-cart"></i>';
        btnContainer.appendChild(btnIrCarrinho);

        // Adicionar evento ao botão de compra
        const btnAdicionar = document.querySelector('.adicionar-carrinho');
        if (btnAdicionar) {
            btnAdicionar.addEventListener('click', () => {
                // Verificar se um tamanho foi selecionado
                const tamanhoSelecionado = document.querySelector('.tamanho-btn.selected');
                if (!tamanhoSelecionado) {
                    mostrarAlertaCarrinho('Por favor, selecione um tamanho antes de continuar.', 'atencao');
                    return;
                }

                try {
                    // Criar objeto do item do carrinho
                    const itemCarrinho = {
                        id: produto.id,
                        nome: produto.nome,
                        preco: produto.preco,
                        imagem: produto.imagem,
                        tamanho: tamanhoSelecionado ? tamanhoSelecionado.textContent : 'Único',
                        quantidade: 1
                    };

                    // Adicionar ao carrinho
                    adicionarAoCarrinho(itemCarrinho);
                    
                    // Mostra o botão de ir para o carrinho
                    document.querySelector('.ir-carrinho').classList.add('show');

                } catch (error) {
                    console.error('Erro ao processar o carrinho:', error);
                    mostrarAlertaCarrinho('Ocorreu um erro ao adicionar o item ao carrinho. Por favor, tente novamente.', 'atencao');
                }
            });
        }

        // Inicializa o contador quando o DOM estiver pronto
        console.log('Inicializando contador do carrinho');
        atualizarContadorCarrinho();

    } catch (error) {
        console.error('Erro ao carregar produto:', error);
    }
}); 