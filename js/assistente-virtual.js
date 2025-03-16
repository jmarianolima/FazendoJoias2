// Definir a classe globalmente
window.AssistenteVirtual = class AssistenteVirtual {
    constructor() {
        this.inicializado = false;
        this.mensagensIniciais = [
            "Olá! Eu sou a Ana, sua assistente virtual da Fazendo Joias. 👋",
            "Como posso ajudar você hoje?"
        ];
        this.processando = false;
    }

    inicializar() {
        if (this.inicializado) return;
        
        // Criar estrutura HTML
        const estrutura = `
            <div class="assistente-widget">
                <button class="assistente-botao" aria-label="Abrir assistente virtual">
                    <i class="fas fa-comments"></i>
                </button>
                <div class="assistente-chat">
                    <div class="assistente-header">
                        <h3>Assistente Virtual</h3>
                        <button class="assistente-fechar" aria-label="Fechar chat">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="assistente-mensagens"></div>
                    <div class="assistente-input">
                        <input type="text" placeholder="Digite sua mensagem..." aria-label="Digite sua mensagem">
                        <button class="assistente-enviar" aria-label="Enviar mensagem">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Adicionar ao DOM
        document.body.insertAdjacentHTML('beforeend', estrutura);

        // Elementos
        this.widget = document.querySelector('.assistente-widget');
        this.botao = this.widget.querySelector('.assistente-botao');
        this.chat = this.widget.querySelector('.assistente-chat');
        this.fechar = this.widget.querySelector('.assistente-fechar');
        this.mensagens = this.widget.querySelector('.assistente-mensagens');
        this.input = this.widget.querySelector('.assistente-input input');
        this.enviar = this.widget.querySelector('.assistente-enviar');

        // Event listeners
        this.botao.addEventListener('click', () => this.abrirChat());
        this.fechar.addEventListener('click', () => this.fecharChat());
        this.enviar.addEventListener('click', () => this.enviarMensagem());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.enviarMensagem();
        });

        // Marcar como inicializado
        this.inicializado = true;

        // Adicionar mensagens iniciais com delay
        setTimeout(() => {
            this.mensagensIniciais.forEach((msg, index) => {
                setTimeout(() => {
                    this.adicionarMensagemAssistente(msg);
                }, index * 500);
            });
        }, 500);

        console.log('Assistente Virtual inicializado com sucesso!');
    }

    abrirChat() {
        this.chat.classList.add('aberto');
        this.botao.style.display = 'none';
        this.input.focus();
    }

    fecharChat() {
        this.chat.classList.remove('aberto');
        this.botao.style.display = 'flex';
        // Limpar histórico ao fechar
        if (window.chatService) {
            window.chatService.clearHistory();
        }
    }

    adicionarMensagemUsuario(texto) {
        const mensagem = document.createElement('div');
        mensagem.className = 'mensagem mensagem-usuario';
        mensagem.textContent = texto;
        this.mensagens.appendChild(mensagem);
        this.mensagens.scrollTop = this.mensagens.scrollHeight;
    }

    adicionarMensagemAssistente(texto) {
        const mensagem = document.createElement('div');
        mensagem.className = 'mensagem mensagem-assistente';
        mensagem.textContent = texto;
        this.mensagens.appendChild(mensagem);
        this.mensagens.scrollTop = this.mensagens.scrollHeight;
    }

    async enviarMensagem() {
        if (this.processando) return;

        const texto = this.input.value.trim();
        if (!texto) return;

        this.processando = true;
        this.input.value = '';
        this.input.disabled = true;
        this.enviar.disabled = true;

        this.adicionarMensagemUsuario(texto);

        try {
            // Adicionar indicador de digitação
            const digitando = document.createElement('div');
            digitando.className = 'mensagem mensagem-assistente digitando';
            digitando.textContent = "Digitando...";
            this.mensagens.appendChild(digitando);

            let resposta;
            if (window.chatService) {
                // Usar o serviço de chat com LLM
                resposta = await window.chatService.sendMessage(texto);
            } else {
                // Fallback para respostas predefinidas
                resposta = this.getRespostaPredefinida(texto);
            }

            // Remover indicador de digitação
            digitando.remove();
            
            // Adicionar resposta
            this.adicionarMensagemAssistente(resposta);

        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
            this.adicionarMensagemAssistente("Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.");
        } finally {
            this.processando = false;
            this.input.disabled = false;
            this.enviar.disabled = false;
            this.input.focus();
        }
    }

    getRespostaPredefinida(texto) {
        const textoPadrao = texto.toLowerCase();
        
        if (textoPadrao.includes('produto') || textoPadrao.includes('joia')) {
            return "Nossos produtos são feitos com materiais de alta qualidade. Você pode conferir nossa coleção completa na página de produtos.";
        } else if (textoPadrao.includes('pagamento') || textoPadrao.includes('pagar')) {
            return "Aceitamos diversas formas de pagamento: cartão de crédito, PIX e boleto. Todas as transações são seguras.";
        } else if (textoPadrao.includes('entrega') || textoPadrao.includes('prazo')) {
            return "O prazo de entrega varia de acordo com sua localização. Após a confirmação do pagamento, você receberá um e-mail com o código de rastreamento.";
        } else if (textoPadrao.includes('troca') || textoPadrao.includes('devolução')) {
            return "Nossa política de trocas e devoluções é válida por 7 dias após o recebimento do produto. Entre em contato com nosso SAC para mais informações.";
        }

        return "Desculpe, no momento eu estou em manutenção, mas você pode entrar em contato conosco pelo whatsapp.";
    }
};

// Inicializar o assistente quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const assistente = new AssistenteVirtual();
        assistente.inicializar();
    });
} else {
    const assistente = new AssistenteVirtual();
    assistente.inicializar();
} 