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
                                <input type="text" id="numero-cartao" placeholder="0000 0000 0000 0000" maxlength="19" required>
                            </div>
                            <div class="form-group full-width">
                                <label for="nome-cartao">Nome no Cartão</label>
                                <input type="text" id="nome-cartao" placeholder="Como aparece no cartão" maxlength="30" required>
                            </div>
                            <div class="form-group">
                                <label for="validade-cartao">Data de Validade</label>
                                <input type="text" id="validade-cartao" placeholder="MM/AA" maxlength="5" required>
                            </div>
                            <div class="form-group">
                                <label for="cvv-cartao">CVV</label>
                                <input type="text" id="cvv-cartao" placeholder="123" maxlength="4" required>
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
        
        // Adiciona as máscaras e validações para os campos do formulário
        const numeroCartao = modal.querySelector('#numero-cartao');
        const validadeCartao = modal.querySelector('#validade-cartao');
        const cvvCartao = modal.querySelector('#cvv-cartao');
        const nomeCartao = modal.querySelector('#nome-cartao');
        
        // Máscara para o número do cartão (formato: 0000 0000 0000 0000)
        numeroCartao.addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
            valor = valor.substring(0, 16); // Limita a 16 dígitos
            
            // Adiciona espaços a cada 4 dígitos
            let numeroFormatado = '';
            for (let i = 0; i < valor.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    numeroFormatado += ' ';
                }
                numeroFormatado += valor[i];
            }
            
            e.target.value = numeroFormatado;
        });
        
        // Máscara para a data de validade (formato: MM/AA)
        validadeCartao.addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
            valor = valor.substring(0, 4); // Limita a 4 dígitos
            
            if (valor.length > 0) {
                // Valida mês entre 01 e 12
                let mes = parseInt(valor.substring(0, 2));
                if (valor.length >= 2) {
                    if (mes < 1) mes = '01';
                    if (mes > 12) mes = '12';
                    valor = mes.toString().padStart(2, '0') + valor.substring(2);
                }
                
                // Formata como MM/AA
                if (valor.length > 2) {
                    valor = valor.substring(0, 2) + '/' + valor.substring(2);
                }
            }
            
            e.target.value = valor;
        });
        
        // Validação para permitir apenas números no CVV
        cvvCartao.addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
            valor = valor.substring(0, 4); // Limita a 4 dígitos (para cartões Amex)
            e.target.value = valor;
        });
        
        // Converte nome para maiúsculas
        nomeCartao.addEventListener('input', function(e) {
            e.target.value = e.target.value.toUpperCase();
        });
        
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
        const cartaoItem = event.target.closest('.cartao-item');
        const cartaoNumero = cartaoItem.querySelector('.cartao-numero').textContent;
        const cartaoValidade = cartaoItem.querySelector('.cartao-validade').textContent;
        const cartaoIcone = cartaoItem.querySelector('.cartao-icon').innerHTML;
        const isPadrao = cartaoItem.querySelector('.tag-padrao') !== null;
        
        // Cria um modal de confirmação personalizado
        const modalConfirmacao = document.createElement('div');
        modalConfirmacao.className = 'modal-confirmacao-exclusao';
        modalConfirmacao.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Confirmar exclusão</h2>
                    <button class="btn-fechar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="cartao-preview">
                        <div class="cartao-icon">${cartaoIcone}</div>
                        <div class="cartao-detalhes">
                            <div class="cartao-numero">${cartaoNumero}</div>
                            <div class="cartao-validade">Validade: ${cartaoValidade}</div>
                            ${isPadrao ? '<span class="tag-padrao" style="margin-top: 5px; display: inline-block;">Padrão</span>' : ''}
                        </div>
                    </div>
                    <p class="mensagem">Tem certeza que deseja remover este cartão?</p>
                    ${isPadrao ? '<p class="aviso">Este é seu cartão padrão. Se removê-lo, outro cartão será definido como padrão.</p>' : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn-cancelar">Cancelar</button>
                    <button class="btn-confirmar">Remover</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalConfirmacao);
        
        // Mostra o modal com animação
        setTimeout(() => {
            modalConfirmacao.classList.add('mostrar');
        }, 10);
        
        // Adiciona event listeners para o modal de confirmação
        modalConfirmacao.querySelector('.btn-fechar').addEventListener('click', () => {
            fecharModalConfirmacao();
        });
        
        modalConfirmacao.querySelector('.btn-cancelar').addEventListener('click', () => {
            fecharModalConfirmacao();
        });
        
        modalConfirmacao.querySelector('.btn-confirmar').addEventListener('click', () => {
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
            
            // Fecha o modal de confirmação
            fecharModalConfirmacao();
            
            // Exibe mensagem de sucesso
            mostrarAlerta('Cartão removido com sucesso!');
        });
        
        // Fecha o modal de confirmação quando clicar fora
        modalConfirmacao.addEventListener('click', (e) => {
            if (e.target === modalConfirmacao) {
                fecharModalConfirmacao();
            }
        });
        
        // Função para fechar o modal com animação
        function fecharModalConfirmacao() {
            modalConfirmacao.classList.remove('mostrar');
            setTimeout(() => {
                document.body.removeChild(modalConfirmacao);
            }, 300);
        }
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

    // ===== FUNCIONALIDADES DE ALTERAÇÃO DE SENHA =====
    
    // Referência ao modal e botão de alteração de senha
    const btnAlterarSenha = document.getElementById('btn-alterar-senha');
    const modalAlterarSenha = document.getElementById('modal-alterar-senha');
    
    // Inputs e botões do formulário de senha
    const novaSenhaInput = document.getElementById('nova-senha');
    const confirmarSenhaInput = document.getElementById('confirmar-senha');
    const toggleSenhaButtons = document.querySelectorAll('.toggle-senha');
    const salvarSenhaBtn = document.getElementById('salvar-senha');
    const cancelarAlteracaoBtn = document.getElementById('cancelar-alteracao');
    
    // Indicadores de requisitos de senha
    const reqTamanho = document.getElementById('req-tamanho');
    const reqMaiuscula = document.getElementById('req-maiuscula');
    const reqNumero = document.getElementById('req-numero');
    const reqEspecial = document.getElementById('req-especial');
    const erroConfirmacao = document.getElementById('erro-confirmacao');
    
    // Variáveis para controle de validação
    let requisitosValidos = {
        tamanho: false,
        maiuscula: false,
        numero: false,
        especial: false
    };
    let senhasIguais = false;
    
    // Adiciona event listener ao botão de alteração de senha
    if (btnAlterarSenha) {
        btnAlterarSenha.addEventListener('click', () => {
            // Limpa os campos e resetar validações
            novaSenhaInput.value = '';
            confirmarSenhaInput.value = '';
            erroConfirmacao.style.display = 'none';
            
            // Resetar os indicadores visuais
            resetarIndicadoresRequisitos();
            
            // Exibe o modal
            modalAlterarSenha.style.display = 'block';
            novaSenhaInput.focus();
        });
    }
    
    // Função para resetar indicadores visuais de requisitos
    function resetarIndicadoresRequisitos() {
        reqTamanho.classList.remove('valido');
        reqMaiuscula.classList.remove('valido');
        reqNumero.classList.remove('valido');
        reqEspecial.classList.remove('valido');
        
        reqTamanho.querySelector('i').className = 'fas fa-times-circle';
        reqMaiuscula.querySelector('i').className = 'fas fa-times-circle';
        reqNumero.querySelector('i').className = 'fas fa-times-circle';
        reqEspecial.querySelector('i').className = 'fas fa-times-circle';
        
        Object.keys(requisitosValidos).forEach(req => {
            requisitosValidos[req] = false;
        });
        
        senhasIguais = false;
        salvarSenhaBtn.disabled = true;
    }
    
    // Adiciona event listeners aos botões de visualização de senha
    toggleSenhaButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'far fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'far fa-eye';
            }
        });
    });
    
    // Validação da nova senha
    if (novaSenhaInput) {
        novaSenhaInput.addEventListener('input', function() {
            const senha = this.value;
            
            // Validar requisitos
            requisitosValidos.tamanho = senha.length >= 8;
            requisitosValidos.maiuscula = /[A-Z]/.test(senha);
            requisitosValidos.numero = /[0-9]/.test(senha);
            requisitosValidos.especial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);
            
            // Atualizar indicadores visuais
            atualizarIndicadoresRequisitos();
            
            // Validar confirmação de senha se já tiver algo digitado
            if (confirmarSenhaInput.value) {
                validarConfirmacaoSenha();
            }
            
            // Verificar se todos os requisitos estão válidos
            verificarHabilitarSalvar();
        });
    }
    
    // Validação da confirmação de senha
    if (confirmarSenhaInput) {
        confirmarSenhaInput.addEventListener('input', function() {
            validarConfirmacaoSenha();
            verificarHabilitarSalvar();
        });
    }
    
    // Função para atualizar os indicadores visuais de requisitos
    function atualizarIndicadoresRequisitos() {
        // Tamanho
        if (requisitosValidos.tamanho) {
            reqTamanho.classList.add('valido');
            reqTamanho.querySelector('i').className = 'fas fa-check-circle';
        } else {
            reqTamanho.classList.remove('valido');
            reqTamanho.querySelector('i').className = 'fas fa-times-circle';
        }
        
        // Maiúscula
        if (requisitosValidos.maiuscula) {
            reqMaiuscula.classList.add('valido');
            reqMaiuscula.querySelector('i').className = 'fas fa-check-circle';
        } else {
            reqMaiuscula.classList.remove('valido');
            reqMaiuscula.querySelector('i').className = 'fas fa-times-circle';
        }
        
        // Número
        if (requisitosValidos.numero) {
            reqNumero.classList.add('valido');
            reqNumero.querySelector('i').className = 'fas fa-check-circle';
        } else {
            reqNumero.classList.remove('valido');
            reqNumero.querySelector('i').className = 'fas fa-times-circle';
        }
        
        // Caractere especial
        if (requisitosValidos.especial) {
            reqEspecial.classList.add('valido');
            reqEspecial.querySelector('i').className = 'fas fa-check-circle';
        } else {
            reqEspecial.classList.remove('valido');
            reqEspecial.querySelector('i').className = 'fas fa-times-circle';
        }
    }
    
    // Função para validar a confirmação de senha
    function validarConfirmacaoSenha() {
        const senha = novaSenhaInput.value;
        const confirmacao = confirmarSenhaInput.value;
        
        if (confirmacao) {
            if (senha === confirmacao) {
                senhasIguais = true;
                erroConfirmacao.style.display = 'none';
                confirmarSenhaInput.style.borderColor = '#10B981';
            } else {
                senhasIguais = false;
                erroConfirmacao.style.display = 'block';
                confirmarSenhaInput.style.borderColor = '#EF4444';
            }
        } else {
            senhasIguais = false;
            erroConfirmacao.style.display = 'none';
            confirmarSenhaInput.style.borderColor = '#E5E7EB';
        }
    }
    
    // Função para verificar se o botão de salvar deve ser habilitado
    function verificarHabilitarSalvar() {
        const todosRequisitosValidos = Object.values(requisitosValidos).every(Boolean);
        salvarSenhaBtn.disabled = !(todosRequisitosValidos && senhasIguais);
    }
    
    // Event listener para o botão de salvar
    if (salvarSenhaBtn) {
        salvarSenhaBtn.addEventListener('click', function() {
            // Aqui você implementaria a chamada para API para alterar a senha
            // Por enquanto, apenas simulamos o sucesso
            
            // Fecha o modal
            modalAlterarSenha.style.display = 'none';
            
            // Exibe mensagem de sucesso
            mostrarAlerta('Sua senha foi alterada com sucesso!');
            
            // Limpa os campos
            novaSenhaInput.value = '';
            confirmarSenhaInput.value = '';
            resetarIndicadoresRequisitos();
        });
    }
    
    // Event listener para o botão de cancelar
    if (cancelarAlteracaoBtn) {
        cancelarAlteracaoBtn.addEventListener('click', function() {
            modalAlterarSenha.style.display = 'none';
        });
    }
    
    // Event listener para fechar o modal de alteração de senha
    if (modalAlterarSenha) {
        // Fechar ao clicar no X
        const btnFechar = modalAlterarSenha.querySelector('.btn-fechar');
        if (btnFechar) {
            btnFechar.addEventListener('click', function() {
                modalAlterarSenha.style.display = 'none';
            });
        }
        
        // Fechar ao clicar fora do modal
        modalAlterarSenha.addEventListener('click', function(e) {
            if (e.target === modalAlterarSenha) {
                modalAlterarSenha.style.display = 'none';
            }
        });
    }
}); 