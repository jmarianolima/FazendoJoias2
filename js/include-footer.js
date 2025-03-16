// Código do footer aqui
document.addEventListener('DOMContentLoaded', () => {
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
        <div class="footer-container">
            <div class="footer-section">
                <div class="footer-title">
                    <i class="fas fa-map"></i>
                    <h3>Mapa do Site</h3>
                </div>
                <ul class="footer-links">
                        <li><a href="index.html">Home</a></li>
                        <li><a href="produtos.html">Produtos</a></li>
                        <li><a href="colecoes.html">Coleções</a></li>
                        <li><a href="sobre.html">Sobre</a></li>
                        <li><a href="login.html">Login</a></li>


                </ul>
            </div>

            <div class="footer-section">
                <div class="footer-title redes-sociais">
                    <i class="fas fa-share-alt"></i>
                    <h3>Redes Sociais</h3>
                </div>
                <div class="social-links">
                    <a href="#" title="Facebook"><i class="fab fa-facebook"></i></a>
                    <a href="#" title="Instagram"><i class="fab fa-instagram"></i></a>
                    <a href="#" title="WhatsApp"><i class="fab fa-whatsapp"></i></a>
                </div>
            </div>

            <div class="footer-section">
                <p class="copyright">© 2024 Fazendo Joias. Todos os direitos reservados.</p>
            </div>
        </div>
    `;

    // Inserir o footer no final do body
    document.body.appendChild(footer);
}); 