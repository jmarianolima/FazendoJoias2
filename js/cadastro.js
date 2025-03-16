document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.cadastro-form');
    const inputs = form.querySelectorAll('input');
    const btnCriarConta = document.querySelector('.btn-criar-conta');

    // Criar elemento de alerta global
    const formAlert = document.createElement('div');
    formAlert.className = 'form-alert';
    formAlert.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <div>
            <strong>Por favor, corrija os seguintes erros:</strong>
            <ul class="error-list"></ul>
        </div>
    `;
    document.body.appendChild(formAlert);

    // Função para mostrar alerta global
    const showFormAlert = (errors) => {
        const errorList = formAlert.querySelector('.error-list');
        errorList.innerHTML = errors.map(error => `<li>${error}</li>`).join('');
        formAlert.classList.add('show');

        // Esconder alerta após 5 segundos
        setTimeout(() => {
            formAlert.classList.remove('show');
        }, 5000);
    };

    // Regras de validação
    const validationRules = {
        nome: {
            minLength: 3,
            pattern: /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/,
            messages: {
                empty: 'Por favor, insira seu nome completo',
                invalid: 'Use apenas letras e espaços',
                tooShort: 'Nome deve ter pelo menos 3 caracteres'
            }
        },
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            messages: {
                empty: 'Por favor, insira seu e-mail',
                invalid: 'Insira um e-mail válido (exemplo@dominio.com)'
            }
        },
        senha: {
            minLength: 6,
            pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/,
            messages: {
                empty: 'Por favor, insira sua senha',
                invalid: 'A senha deve conter letras e números',
                tooShort: 'A senha deve ter pelo menos 6 caracteres'
            }
        },
        'confirmar-senha': {
            messages: {
                empty: 'Por favor, confirme sua senha',
                mismatch: 'As senhas não coincidem'
            }
        }
    };

    // Função para mostrar erro
    const showError = (input, message) => {
        const wrapper = input.closest('.input-wrapper');
        wrapper.classList.add('error');
        
        let tooltip = wrapper.querySelector('.tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            wrapper.appendChild(tooltip);
        }
        tooltip.textContent = message;
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
        tooltip.style.transform = 'translateY(0)';

        // Adicionar shake animation
        input.style.animation = 'none';
        input.offsetHeight; // Trigger reflow
        input.style.animation = null;
    };

    // Função para remover erro
    const removeError = (input) => {
        const wrapper = input.closest('.input-wrapper');
        wrapper.classList.remove('error');
        const tooltip = wrapper.querySelector('.tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    };

    // Função para validar campo individual
    const validateField = (input) => {
        const value = input.value.trim();
        const rules = validationRules[input.id];
        const wrapper = input.closest('.input-wrapper');
        
        // Remover estado de erro anterior
        removeError(input);

        // Validação de campo vazio
        if (!value) {
            showError(input, rules.messages.empty);
            return false;
        }

        // Validações específicas por campo
        switch (input.id) {
            case 'nome':
                if (!rules.pattern.test(value)) {
                    showError(input, rules.messages.invalid);
                    return false;
                }
                if (value.length < rules.minLength) {
                    showError(input, rules.messages.tooShort);
                    return false;
                }
                break;

            case 'email':
                if (!rules.pattern.test(value)) {
                    showError(input, rules.messages.invalid);
                    return false;
                }
                break;

            case 'senha':
                if (value.length < rules.minLength) {
                    showError(input, rules.messages.tooShort);
                    return false;
                }
                if (!rules.pattern.test(value)) {
                    showError(input, rules.messages.invalid);
                    return false;
                }
                // Validar confirmação de senha se já preenchida
                const confirmarSenha = document.getElementById('confirmar-senha');
                if (confirmarSenha.value) {
                    validateField(confirmarSenha);
                }
                break;

            case 'confirmar-senha':
                const senha = document.getElementById('senha').value;
                if (value !== senha) {
                    showError(input, rules.messages.mismatch);
                    return false;
                }
                break;
        }

        return true;
    };

    // Função para validar todos os campos
    const validateForm = () => {
        let isValid = true;
        const errors = [];
        
        inputs.forEach(input => {
            const value = input.value.trim();
            const rules = validationRules[input.id];
            
            if (!value) {
                errors.push(rules.messages.empty);
                isValid = false;
            } else {
                switch (input.id) {
                    case 'nome':
                        if (!rules.pattern.test(value)) {
                            errors.push(rules.messages.invalid);
                            isValid = false;
                        } else if (value.length < rules.minLength) {
                            errors.push(rules.messages.tooShort);
                            isValid = false;
                        }
                        break;
                    case 'email':
                        if (!rules.pattern.test(value)) {
                            errors.push(rules.messages.invalid);
                            isValid = false;
                        }
                        break;
                    case 'senha':
                        if (value.length < rules.minLength) {
                            errors.push(rules.messages.tooShort);
                            isValid = false;
                        } else if (!rules.pattern.test(value)) {
                            errors.push(rules.messages.invalid);
                            isValid = false;
                        }
                        break;
                    case 'confirmar-senha':
                        const senha = document.getElementById('senha').value;
                        if (value !== senha) {
                            errors.push(rules.messages.mismatch);
                            isValid = false;
                        }
                        break;
                }
            }
        });

        if (!isValid) {
            showFormAlert(errors);
        }

        return isValid;
    };

    // Eventos de validação em tempo real
    inputs.forEach(input => {
        // Validar ao digitar (com delay)
        let timeout;
        input.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                validateField(input);
            }, 500);
        });

        // Validar ao perder o foco
        input.addEventListener('blur', () => {
            validateField(input);
        });
    });

    // Evento de submit do formulário
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            // Simulação de envio
            const btnSubmit = form.querySelector('.btn-criar-conta');
            const originalText = btnSubmit.textContent;
            btnSubmit.textContent = 'Criando conta...';
            btnSubmit.disabled = true;

            setTimeout(() => {
                alert('Conta criada com sucesso!');
                form.reset();
                btnSubmit.textContent = originalText;
                btnSubmit.disabled = false;
                window.location.href = 'login.html';
            }, 2000);
        }
    });

    // Toggle de visibilidade da senha
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            button.innerHTML = type === 'password' ? 
                '<i class="far fa-eye"></i>' : 
                '<i class="far fa-eye-slash"></i>';
        });
    });
}); 