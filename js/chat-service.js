class ChatService {
    constructor() {
        this.config = CONFIG.ASSISTANT_CONFIG;
        this.conversationHistory = [];
        this.CLAUDE_API_KEY = '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';
        this.CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
        this.intencoes = {
            produtos: {
                palavrasChave: ['produto', 'joia', 'anel', 'colar', 'brinco', 'pulseira', 'acessório', 'peça', 'material'],
                respostas: [
                    "Nossa coleção inclui anéis, colares, brincos e pulseiras, todos feitos com materiais de alta qualidade. 💎",
                    "Temos uma variedade incrível de joias para todas as ocasiões. Que tipo de peça você está procurando? ✨",
                    "Nossas joias são feitas com materiais preciosos selecionados. Posso te mostrar algumas opções específicas! 👌"
                ]
            },
            precos: {
                palavrasChave: ['preço', 'valor', 'custo', 'parcela', 'pagamento', 'desconto', 'promoção', 'pagar'],
                respostas: [
                    "Aceitamos diversas formas de pagamento: cartão de crédito, PIX e boleto. Todas as transações são seguras! 💳",
                    "Oferecemos parcelamento em até 6x sem juros em todas as peças. Posso te ajudar a encontrar algo dentro do seu orçamento! 🛍️",
                    "Temos opções para todos os orçamentos e frequentemente fazemos promoções especiais! 🏷️"
                ]
            },
            entrega: {
                palavrasChave: ['entrega', 'prazo', 'envio', 'frete', 'receber', 'correio', 'transportadora', 'enviar'],
                respostas: [
                    "O prazo de entrega varia de acordo com sua localização, mas geralmente é de 3 a 7 dias úteis. 📦",
                    "Assim que seu pedido for aprovado, você receberá um código de rastreamento para acompanhar a entrega! 🚚",
                    "Trabalhamos com as melhores transportadoras para garantir que sua joia chegue em perfeito estado! ✨"
                ]
            },
            devolucao: {
                palavrasChave: ['troca', 'devolução', 'devolver', 'trocar', 'garantia', 'defeito', 'problema'],
                respostas: [
                    "Nossa política de trocas e devoluções é válida por 7 dias após o recebimento. Garantimos a qualidade das nossas peças! ✨",
                    "Se houver qualquer problema com sua joia, nossa equipe está pronta para ajudar. Sua satisfação é nossa prioridade! 🤝",
                    "Oferecemos garantia em todas as nossas peças. Pode confiar! 💎"
                ]
            },
            materiais: {
                palavrasChave: ['ouro', 'prata', 'pedra', 'diamante', 'material', 'qualidade', 'quilate', 'pureza'],
                respostas: [
                    "Trabalhamos apenas com materiais de alta qualidade: ouro 18k, prata 925 e pedras preciosas certificadas. 💎",
                    "Todas as nossas joias passam por um rigoroso controle de qualidade para garantir a excelência do material. ✨",
                    "Nossos materiais são selecionados cuidadosamente para garantir beleza e durabilidade! 👌"
                ]
            },
            cuidados: {
                palavrasChave: ['cuidado', 'limpar', 'conservar', 'manutenção', 'guardar', 'limpa', 'conservação'],
                respostas: [
                    "Para manter suas joias sempre bonitas, recomendamos guardar em local seco e limpar com pano macio regularmente. ✨",
                    "Evite contato com produtos químicos e perfumes. Suas joias merecem cuidados especiais! 💝",
                    "Oferecemos dicas personalizadas de cuidados para cada tipo de joia. Como posso ajudar? 🤝"
                ]
            },
            atendimento: {
                palavrasChave: ['ajuda', 'dúvida', 'atendimento', 'contato', 'falar', 'sac', 'suporte'],
                respostas: [
                    "Estou aqui para ajudar! Se precisar de algo mais específico, nossa equipe de atendimento está disponível por telefone ou email. 🤝",
                    "Como posso ajudar você hoje? Estou aqui para tirar todas as suas dúvidas! 😊",
                    "Nosso time está sempre pronto para ajudar! Qual sua dúvida? 💫"
                ]
            }
        };
    }

    async sendMessage(userMessage) {
        try {
            // Adicionar a mensagem do usuário ao histórico
            this.conversationHistory.push({
                role: "user",
                content: userMessage
            });

            // Tentar usar o Claude primeiro
            try {
                const resposta = await this.enviarParaClaude(userMessage);
                
                // Adicionar a resposta ao histórico
                this.conversationHistory.push({
                    role: "assistant",
                    content: resposta
                });

                // Manter o histórico limitado
                if (this.conversationHistory.length > 10) {
                    this.conversationHistory = this.conversationHistory.slice(-10);
                }

                return resposta;

            } catch (claudeError) {
                console.error('Erro ao usar Claude:', claudeError);
                // Fallback para o sistema de intenções
                return this.identificarEResponder(userMessage);
            }

        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
            return "Desculpe, ocorreu um erro ao processar sua mensagem. Como posso ajudar de outra forma? 🤔";
        }
    }

    async enviarParaClaude(mensagem) {
        const systemPrompt = `
            Você é ${this.config.name}, a assistente virtual da loja Fazendo Joias.
            Você deve responder em português do Brasil de forma natural e amigável.
            
            Suas especialidades incluem:
            - Conhecimento sobre joias e acessórios
            - Informações sobre materiais preciosos
            - Política de vendas e trocas da loja
            - Cuidados com joias
            - Tendências de moda em joalheria

            Diretrizes importantes:
            1. Mantenha as respostas concisas e diretas
            2. Use linguagem amigável e profissional
            3. Foque em ajudar o cliente a encontrar o produto ideal
            4. Sempre mantenha o tom positivo e prestativo
            5. Use emojis ocasionalmente para tornar a conversa mais amigável
            6. Se não souber algo específico, sugira contatar o SAC

            Informações importantes da loja:
            - Aceitamos cartão de crédito, PIX e boleto
            - Parcelamento em até 6x sem juros
            - Prazo de entrega: 3 a 7 dias úteis
            - Garantia em todas as peças
            - Política de trocas: 7 dias após recebimento
            - Materiais: ouro 18k, prata 925, pedras preciosas certificadas
        `;

        const requestBody = {
            model: "claude-3-opus-20240229",
            max_tokens: 150,
            temperature: 0.7,
            messages: [
                {
                    role: "assistant",
                    content: systemPrompt
                },
                ...this.conversationHistory.map(msg => ({
                    role: msg.role === "user" ? "user" : "assistant",
                    content: msg.content
                })),
                {
                    role: "user",
                    content: mensagem
                }
            ]
        };

        try {
            const response = await fetch(this.CLAUDE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01',
                    'x-api-key': this.CLAUDE_API_KEY
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Erro na resposta do Claude:', errorData);
                throw new Error(`Erro na chamada da API do Claude: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.content || !data.content[0] || !data.content[0].text) {
                console.error('Resposta inesperada do Claude:', data);
                throw new Error('Formato de resposta inválido do Claude');
            }

            return data.content[0].text;

        } catch (error) {
            console.error('Erro detalhado ao chamar Claude:', error);
            throw error; // Propagar o erro para usar o fallback
        }
    }

    identificarEResponder(mensagem) {
        const mensagemLower = mensagem.toLowerCase();
        let intencoesIdentificadas = [];

        // Identificar todas as intenções que correspondem à mensagem
        for (const [categoria, dados] of Object.entries(this.intencoes)) {
            const temPalavraChave = dados.palavrasChave.some(palavra => 
                mensagemLower.includes(palavra.toLowerCase())
            );
            if (temPalavraChave) {
                intencoesIdentificadas.push(categoria);
            }
        }

        // Se nenhuma intenção foi identificada
        if (intencoesIdentificadas.length === 0) {
            return "Desculpe, não entendi completamente sua pergunta. Posso ajudar com informações sobre nossos produtos, preços, entregas, trocas ou cuidados com joias. Como posso te ajudar? 😊";
        }

        // Selecionar uma intenção aleatória entre as identificadas
        const intencaoEscolhida = intencoesIdentificadas[Math.floor(Math.random() * intencoesIdentificadas.length)];
        const respostas = this.intencoes[intencaoEscolhida].respostas;
        
        // Retornar uma resposta aleatória para a intenção escolhida
        return respostas[Math.floor(Math.random() * respostas.length)];
    }

    clearHistory() {
        this.conversationHistory = [];
    }
}

// Exportar o serviço globalmente
window.chatService = new ChatService(); 