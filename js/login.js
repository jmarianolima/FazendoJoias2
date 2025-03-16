document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    
    // Verificar se o usuário está logado
    function checkLoginState() {
        const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
        const userIcon = document.querySelector('.user-icon');
        
        if (userIcon) {
            if (isLoggedIn) {
                userIcon.classList.add('logged-in');
                userIcon.title = `Minha Conta (${localStorage.getItem('userEmail')})`;
            } else {
                userIcon.classList.remove('logged-in');
                userIcon.title = 'Fazer Login';
            }
        }
    }

    // Toggle password visibility
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle eye icon
            const eyeIcon = togglePassword.querySelector('i');
            eyeIcon.classList.toggle('fa-eye');
            eyeIcon.classList.toggle('fa-eye-slash');
        });
    }

    // Handle form submission
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;

            // Simulação de login bem-sucedido
            console.log('Login attempt:', { email, password, remember });
            
            // Por enquanto, aceita qualquer login
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            if (remember) {
                localStorage.setItem('rememberLogin', 'true');
            } else {
                localStorage.removeItem('rememberLogin');
            }
            
            // Atualizar estado do ícone
            checkLoginState();
            
            // Redirecionar para a página principal
            window.location.href = 'index.html';
        });
    }

    // Verificar estado de login ao carregar a página
    checkLoginState();

    // Carregar dados salvos se "lembrar-me" estiver ativo
    if (loginForm && localStorage.getItem('rememberLogin') === 'true') {
        const savedEmail = localStorage.getItem('userEmail');
        if (savedEmail) {
            document.getElementById('email').value = savedEmail;
            document.getElementById('remember').checked = true;
        }
    }
}); 