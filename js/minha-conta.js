// Gerenciamento da página Minha Conta
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando script minha-conta.js');
    
    // Garantir que os campos de edição estejam ocultos inicialmente
    document.querySelectorAll('.campo-edicao').forEach(input => {
        input.style.display = 'none';
    });
    
    // Garantir que os campos de texto estejam visíveis inicialmente
    document.querySelectorAll('.campo-texto').forEach(span => {
        span.style.display = 'block';
    });
    
    // Adiciona event listeners aos botões de edição
    document.querySelectorAll('.btn-editar').forEach(botao => {
        botao.addEventListener('click', function() {
            console.log('Botão de edição clicado');
            const formId = this.getAttribute('data-form');
            console.log('Form ID:', formId);
            toggleEdicao(this, formId);
        });
    });

    // Função para alternar entre visualização e edição
    function toggleEdicao(botao, formId) {
        console.log('Executando toggleEdicao para', formId);
        const form = document.getElementById(formId);
        if (!form) {
            console.error('Formulário não encontrado:', formId);
            return;
        }
        
        const spans = form.querySelectorAll('.campo-texto');
        const inputs = form.querySelectorAll('.campo-edicao');
        const btnTexto = botao.querySelector('span');
        const isEditando = botao.classList.contains('editando');
        
        console.log('Estado atual:', isEditando ? 'Editando' : 'Visualizando');
        console.log('Spans encontrados:', spans.length);
        console.log('Inputs encontrados:', inputs.length);

        if (!isEditando) {
            // Ativar modo de edição
            console.log('Ativando modo de edição');
            spans.forEach(span => {
                span.style.display = 'none';
                console.log('Ocultando span:', span.textContent);
            });
            
            inputs.forEach(input => {
                input.style.display = 'block';
                input.disabled = false;
                console.log('Mostrando input:', input.value);
            });
            
            btnTexto.textContent = 'Salvar alterações';
            botao.classList.add('editando');
        } else {
            // Salvar alterações
            console.log('Salvando alterações');
            
            inputs.forEach((input, index) => {
                if (index < spans.length) {
                    spans[index].textContent = input.value;
                    console.log('Atualizando valor:', input.value);
                }
            });
            
            spans.forEach(span => {
                span.style.display = 'block';
            });
            
            inputs.forEach(input => {
                input.style.display = 'none';
                input.disabled = true;
            });
            
            btnTexto.textContent = 'Editar informações';
            botao.classList.remove('editando');

            // Aqui você pode adicionar a lógica para salvar no backend
            console.log('Dados salvos:', {
                formId,
                valores: Array.from(inputs).map(input => input.value)
            });
        }
    }

    // Função para mostrar a seção correta baseada na URL
    function mostrarSecaoAtiva() {
        const hash = window.location.hash || '#cadastro';
        console.log('Hash atual:', hash);
        
        const sections = {
            '#cadastro': document.querySelector('.dados-cadastrais'),
            '#pedidos': document.querySelector('.pedidos-andamento'),
            '#historico': document.querySelector('.historico-compras'),
            '#pagamento': document.querySelector('.dados-pagamento')
        };
        
        // Esconde todas as seções
        Object.values(sections).forEach(section => {
            if (section) {
                section.style.display = 'none';
                console.log('Ocultando seção:', section.className);
            }
        });
        
        // Mostra a seção ativa
        const secaoAtiva = sections[hash];
        if (secaoAtiva) {
            secaoAtiva.style.display = 'block';
            console.log('Mostrando seção:', secaoAtiva.className);
        }
        
        // Atualiza a navegação
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === hash) {
                item.classList.add('active');
                console.log('Item de navegação ativo:', item.textContent.trim());
            }
        });
    }

    // Adiciona listener para mudança na URL
    window.addEventListener('hashchange', mostrarSecaoAtiva);
    
    // Mostra a seção inicial
    mostrarSecaoAtiva();
    
    // ===== FUNCIONALIDADES DE CARTÕES DE CRÉDITO =====
    
    // Referências aos elementos
    const btnAdicionarCartao = document.querySelector('.btn-adicionar-cartao');
    const btnsDefinirPadrao = document.querySelectorAll('.btn-definir-padrao');
    const btnsRemoverCartao = document.querySelectorAll('.btn-remover');
    const cartoesContainer = document.querySelector('.cartoes-list');
    const alertaPersonalizado = document.getElementById('alerta-personalizado');
    
    // Modal para adicionar cartão
    let modalCartao = null;
    
    // Função para mostrar alerta personalizado
    function mostrarAlerta(mensagem, tipo = 'sucesso') {
        const alerta = document.getElementById('alerta-personalizado');
        const alertaMensagem = alerta.querySelector('.alerta-mensagem');
        const alertaIcone = alerta.querySelector('.alerta-icone i');
        
        // Define a mensagem
        alertaMensagem.textContent = mensagem;
        
        // Configura o tipo de alerta (sucesso ou erro)
        if (tipo === 'erro') {
            alerta.classList.add('erro');
            alertaIcone.className = 'fas fa-exclamation-circle';
        } else {
            alerta.classList.remove('erro');
            alertaIcone.className = 'fas fa-check-circle';
        }
        
        // Mostra o alerta
        alerta.classList.add('mostrar');
        
        // Remove o alerta após 3 segundos
        setTimeout(() => {
            alerta.classList.remove('mostrar');
        }, 3000);
    }
    
    // Função para criar o modal de adicionar cartão
    function criarModalCartao() {
        // Verifica se o modal já existe
        if (document.getElementById('modal-cartao')) {
            return document.getElementById('modal-cartao');
        }
        
        // Cria o modal
        const modal = document.createElement('div');
        modal.id = 'modal-cartao';
        modal.className = 'modal-pedido';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Adicionar Cartão de Crédito</h2>
                    <button class="btn-fechar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-section">
                    <form id="form-cartao">
                        <div class="form-grid">
                            <div class="form-group full-width">
                                <label for="numero-cartao">Número do Cartão</label>
                                <input type="text" id="numero-cartao" placeholder="0000 0000 0000 0000" required>
                            </div>
                            <div class="form-group full-width">
                                <label for="nome-cartao">Nome no Cartão</label>
                                <input type="text" id="nome-cartao" placeholder="Como aparece no cartão" required>
                            </div>
                            <div class="form-group">
                                <label for="validade-cartao">Data de Validade</label>
                                <input type="text" id="validade-cartao" placeholder="MM/AA" required>
                            </div>
                            <div class="form-group">
                                <label for="cvv-cartao">CVV</label>
                                <input type="text" id="cvv-cartao" placeholder="123" required>
                            </div>
                            <div class="form-group full-width">
                                <label class="checkbox-container">
                                    <input type="checkbox" id="cartao-padrao">
                                    <span class="checkmark"></span>
                                    Definir como cartão padrão
                                </label>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secundario fechar-modal">Cancelar</button>
                    <button class="btn-primario" id="salvar-cartao">Salvar Cartão</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Adiciona event listeners para o modal
        modal.querySelector('.btn-fechar').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.querySelector('.fechar-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.querySelector('#salvar-cartao').addEventListener('click', salvarNovoCartao);
        
        return modal;
    }
    
    // Função para abrir o modal de adicionar cartão
    function abrirModalCartao() {
        if (!modalCartao) {
            modalCartao = criarModalCartao();
        }
        
        // Limpa o formulário
        document.getElementById('form-cartao').reset();
        
        // Exibe o modal
        modalCartao.style.display = 'block';
    }
    
    // Função para salvar um novo cartão
    function salvarNovoCartao() {
        const numeroCartao = document.getElementById('numero-cartao').value;
        const nomeCartao = document.getElementById('nome-cartao').value;
        const validadeCartao = document.getElementById('validade-cartao').value;
        const definirPadrao = document.getElementById('cartao-padrao').checked;
        
        // Validação básica
        if (!numeroCartao || !nomeCartao || !validadeCartao) {
            mostrarAlerta('Por favor, preencha todos os campos obrigatórios.', 'erro');
            return;
        }
        
        // Formata o número do cartão para exibição (oculta a maioria dos dígitos)
        const numeroFormatado = '•••• •••• •••• ' + numeroCartao.slice(-4);
        
        // Cria o elemento do novo cartão
        const novoCartao = document.createElement('div');
        novoCartao.className = 'cartao-item';
        novoCartao.innerHTML = `
            <div class="cartao-info">
                <i class="far fa-credit-card cartao-icon"></i>
                <div class="cartao-detalhes">
                    <div class="cartao-numero">${numeroFormatado}</div>
                    <div class="cartao-nome">${nomeCartao.toUpperCase()}</div>
                    <div class="cartao-validade">Expira em ${validadeCartao}</div>
                </div>
            </div>
            <div class="cartao-acoes">
                ${definirPadrao ? '<span class="tag-padrao">Padrão</span>' : '<button class="btn-definir-padrao">Definir como padrão</button>'}
                <button class="btn-remover">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Se o novo cartão for definido como padrão, remove a tag padrão dos outros cartões
        if (definirPadrao) {
            document.querySelectorAll('.tag-padrao').forEach(tag => {
                const cartaoItem = tag.closest('.cartao-item');
                tag.remove();
                
                // Adiciona o botão "Definir como padrão" no lugar da tag
                const cartaoAcoes = cartaoItem.querySelector('.cartao-acoes');
                const btnRemover = cartaoAcoes.querySelector('.btn-remover');
                
                const btnDefinirPadrao = document.createElement('button');
                btnDefinirPadrao.className = 'btn-definir-padrao';
                btnDefinirPadrao.textContent = 'Definir como padrão';
                btnDefinirPadrao.addEventListener('click', definirCartaoPadrao);
                
                cartaoAcoes.insertBefore(btnDefinirPadrao, btnRemover);
            });
        }
        
        // Adiciona event listeners para os botões do novo cartão
        novoCartao.querySelector('.btn-remover').addEventListener('click', removerCartao);
        
        const btnDefinirPadrao = novoCartao.querySelector('.btn-definir-padrao');
        if (btnDefinirPadrao) {
            btnDefinirPadrao.addEventListener('click', definirCartaoPadrao);
        }
        
        // Adiciona o novo cartão à lista
        cartoesContainer.appendChild(novoCartao);
        
        // Fecha o modal
        modalCartao.style.display = 'none';
        
        // Exibe mensagem de sucesso
        mostrarAlerta('Cartão adicionado com sucesso!');
    }
    
    // Função para definir um cartão como padrão
    function definirCartaoPadrao(event) {
        // Remove a tag padrão de todos os cartões
        document.querySelectorAll('.tag-padrao').forEach(tag => {
            const cartaoItem = tag.closest('.cartao-item');
            tag.remove();
            
            // Adiciona o botão "Definir como padrão" no lugar da tag
            const cartaoAcoes = cartaoItem.querySelector('.cartao-acoes');
            const btnRemover = cartaoAcoes.querySelector('.btn-remover');
            
            const btnDefinirPadrao = document.createElement('button');
            btnDefinirPadrao.className = 'btn-definir-padrao';
            btnDefinirPadrao.textContent = 'Definir como padrão';
            btnDefinirPadrao.addEventListener('click', definirCartaoPadrao);
            
            cartaoAcoes.insertBefore(btnDefinirPadrao, btnRemover);
        });
        
        // Obtém o cartão atual
        const cartaoItem = event.target.closest('.cartao-item');
        const cartaoAcoes = cartaoItem.querySelector('.cartao-acoes');
        
        // Remove o botão "Definir como padrão"
        event.target.remove();
        
        // Adiciona a tag "Padrão"
        const tagPadrao = document.createElement('span');
        tagPadrao.className = 'tag-padrao';
        tagPadrao.textContent = 'Padrão';
        
        cartaoAcoes.insertBefore(tagPadrao, cartaoAcoes.firstChild);
        
        // Exibe mensagem de sucesso
        mostrarAlerta('Cartão definido como padrão com sucesso!');
    }
    
    // Função para remover um cartão
    function removerCartao(event) {
        // Cria um modal de confirmação personalizado
        const modalConfirmacao = document.createElement('div');
        modalConfirmacao.className = 'modal-pedido';
        modalConfirmacao.style.display = 'flex';
        modalConfirmacao.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h2>Confirmar exclusão</h2>
                    <button class="btn-fechar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-section">
                    <p>Tem certeza que deseja remover este cartão?</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-secundario btn-cancelar">Cancelar</button>
                    <button class="btn-primario btn-confirmar" style="background: var(--red-500);">Remover</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalConfirmacao);
        
        // Adiciona event listeners para o modal de confirmação
        modalConfirmacao.querySelector('.btn-fechar').addEventListener('click', () => {
            document.body.removeChild(modalConfirmacao);
        });
        
        modalConfirmacao.querySelector('.btn-cancelar').addEventListener('click', () => {
            document.body.removeChild(modalConfirmacao);
        });
        
        modalConfirmacao.querySelector('.btn-confirmar').addEventListener('click', () => {
            const cartaoItem = event.target.closest('.cartao-item');
            
            // Verifica se o cartão é o padrão
            const isPadrao = cartaoItem.querySelector('.tag-padrao');
            
            // Remove o cartão
            cartaoItem.remove();
            
            // Se o cartão removido era o padrão, define o primeiro cartão restante como padrão
            if (isPadrao && document.querySelector('.cartao-item')) {
                const primeiroCartao = document.querySelector('.cartao-item');
                const cartaoAcoes = primeiroCartao.querySelector('.cartao-acoes');
                const btnDefinirPadrao = cartaoAcoes.querySelector('.btn-definir-padrao');
                
                if (btnDefinirPadrao) {
                    btnDefinirPadrao.remove();
                    
                    const tagPadrao = document.createElement('span');
                    tagPadrao.className = 'tag-padrao';
                    tagPadrao.textContent = 'Padrão';
                    
                    cartaoAcoes.insertBefore(tagPadrao, cartaoAcoes.firstChild);
                }
            }
            
            // Remove o modal de confirmação
            document.body.removeChild(modalConfirmacao);
            
            // Exibe mensagem de sucesso
            mostrarAlerta('Cartão removido com sucesso!');
        });
    }
    
    // Adiciona event listeners para os botões
    if (btnAdicionarCartao) {
        btnAdicionarCartao.addEventListener('click', abrirModalCartao);
    }
    
    btnsDefinirPadrao.forEach(btn => {
        btn.addEventListener('click', definirCartaoPadrao);
    });
    
    btnsRemoverCartao.forEach(btn => {
        btn.addEventListener('click', removerCartao);
    });
}); 