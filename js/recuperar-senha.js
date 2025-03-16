document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('#form-recuperar-senha');
    const emailInput = document.querySelector('#email');
    const btnEnviar = document.querySelector('.btn-enviar');
    const inputWrapper = emailInput.closest('.input-wrapper');

    if (!form || !emailInput || !inputWrapper) {
        console.error('Elementos do formulário não encontrados');
        return;
    }

    // Função para validar email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Função para mostrar mensagem de erro/sucesso
    function showMessage(input, message, type = 'error') {
        const wrapper = input.closest('.input-wrapper');
        const tooltip = wrapper.querySelector('.tooltip');
        
        // Remove classes anteriores
        wrapper.classList.remove('success', 'error');
        tooltip.classList.remove('success', 'error');
        
        // Adiciona as novas classes
        wrapper.classList.add(type);
        tooltip.classList.add(type);
        tooltip.textContent = message;
    }

    // Validação durante digitação com debounce
    let typingTimer;
    emailInput.addEventListener('input', function() {
        const value = this.value.trim();
        clearTimeout(typingTimer);
        
        if (value === '') {
            showMessage(this, 'Por favor, insira seu e-mail', 'error');
        } else {
            typingTimer = setTimeout(() => {
                if (validateEmail(value)) {
                    showMessage(this, 'E-mail válido!', 'success');
                } else {
                    showMessage(this, 'Por favor, insira um e-mail válido', 'error');
                }
            }, 500);
        }
    });

    // Adiciona efeito de foco no ícone
    emailInput.addEventListener('focus', () => {
        inputWrapper.classList.add('focused');
    });

    emailInput.addEventListener('blur', () => {
        inputWrapper.classList.remove('focused');
    });

    // Previne o comportamento padrão e faz validação personalizada
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const value = emailInput.value.trim();
        
        if (!value) {
            showMessage(emailInput, 'Por favor, insira seu e-mail', 'error');
            emailInput.focus();
            return;
        }
        
        if (!validateEmail(value)) {
            showMessage(emailInput, 'Por favor, insira um e-mail válido', 'error');
            emailInput.focus();
            return;
        }

        // Se chegou aqui, o email é válido
        showMessage(emailInput, 'E-mail válido!', 'success');
        
        // Simula envio e mostra mensagem de sucesso
        btnEnviar.disabled = true;
        const originalText = btnEnviar.innerHTML;
        btnEnviar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        
        setTimeout(() => {
            // Mostra o modal de confirmação
            const modal = document.getElementById('modal-confirmacao');
            modal.classList.add('show');
            
            // Reseta o formulário
            form.reset();
            btnEnviar.disabled = false;
            btnEnviar.innerHTML = originalText;
            
            // Remove as classes de validação
            inputWrapper.classList.remove('success', 'error');
            const tooltip = inputWrapper.querySelector('.tooltip');
            if (tooltip) {
                tooltip.classList.remove('success', 'error');
                tooltip.textContent = 'Por favor, insira um e-mail válido';
            }
        }, 1500);
    });

    // Fecha o modal ao clicar fora dele
    const modal = document.getElementById('modal-confirmacao');
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('show');
        }
    });

    // Previne que o modal feche ao clicar no conteúdo
    const modalContent = modal.querySelector('.modal-content');
    modalContent.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}); 