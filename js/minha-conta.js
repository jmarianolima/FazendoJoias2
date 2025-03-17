// Gerenciamento da página Minha Conta
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando script minha-conta.js');
    
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
}); 