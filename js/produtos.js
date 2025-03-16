document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('DB/db.json');
        const data = await response.json();
        const produtos = data.produtos;

        const produtosGrid = document.querySelector('.produtos-grid');
        const buscaInput = document.querySelector('.busca-input');
        const filtroSelects = document.querySelectorAll('.filtro-select');
        
        if (!produtosGrid) return;

        // Função para criar o card do produto
        function criarProdutoCard(produto) {
            return `
                <div class="produto-card" data-categoria="${produto.categoria}" data-tipo="${produto.tipo || ''}" data-material="${produto.material || ''}">
                    <a href="visualizacao-produto.html?id=${produto.id}">
                        <div class="img-container">
                            <img src="${produto.imagem}" alt="${produto.nome}">
                            <span class="preco-hover">R$ ${produto.preco.toFixed(2)}</span>
                        </div>
                        <div class="card-content">
                            <h3>${produto.nome}</h3>
                            <p class="descricao">${produto.descricao}</p>
                            <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
                        </div>
                    </a>
                </div>
            `;
        }

        // Função para popular os selects de filtro
        function popularFiltros() {
            // Extrair valores únicos para cada filtro
            const tipos = [...new Set(produtos.map(p => p.tipo).filter(Boolean))];
            const materiais = [...new Set(produtos.map(p => p.material).filter(Boolean))];
            
            // Criar faixas de preço
            const faixasPreco = [
                { min: 0, max: 1000, label: 'Até R$ 1.000' },
                { min: 1000, max: 2000, label: 'R$ 1.000 a R$ 2.000' },
                { min: 2000, max: 3000, label: 'R$ 2.000 a R$ 3.000' },
                { min: 3000, max: 5000, label: 'R$ 3.000 a R$ 5.000' },
                { min: 5000, max: Infinity, label: 'Acima de R$ 5.000' }
            ];

            // Popular selects
            filtroSelects[0].innerHTML = `
                <option value="">Tipo de Acessório</option>
                ${tipos.map(tipo => `<option value="${tipo}">${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</option>`).join('')}
            `;

            filtroSelects[1].innerHTML = `
                <option value="">Material</option>
                ${materiais.map(material => `<option value="${material}">${material.replace(/-/g, ' ').toUpperCase()}</option>`).join('')}
            `;

            filtroSelects[2].innerHTML = `
                <option value="">Faixa de Preço</option>
                ${faixasPreco.map((faixa, index) => `<option value="${index}">${faixa.label}</option>`).join('')}
            `;
        }

        // Função para filtrar produtos
        function filtrarProdutos() {
            const termoBusca = buscaInput.value.toLowerCase();
            const tipoSelecionado = filtroSelects[0].value;
            const materialSelecionado = filtroSelects[1].value;
            const faixaPrecoIndex = filtroSelects[2].value;
            const categoriaSelecionada = document.querySelector('.tab-link.active').dataset.categoria;

            const faixasPreco = [
                { min: 0, max: 1000 },
                { min: 1000, max: 2000 },
                { min: 2000, max: 3000 },
                { min: 3000, max: 5000 },
                { min: 5000, max: Infinity }
            ];

            const produtosFiltrados = produtos.filter(produto => {
                // Filtro por texto
                const matchTexto = produto.nome.toLowerCase().includes(termoBusca) ||
                                 produto.descricao.toLowerCase().includes(termoBusca);

                // Filtro por categoria
                const matchCategoria = categoriaSelecionada === 'todos' || 
                                     produto.categoria === categoriaSelecionada;

                // Filtro por tipo
                const matchTipo = !tipoSelecionado || produto.tipo === tipoSelecionado;

                // Filtro por material
                const matchMaterial = !materialSelecionado || produto.material === materialSelecionado;

                // Filtro por faixa de preço
                const matchPreco = !faixaPrecoIndex || (
                    produto.preco >= faixasPreco[faixaPrecoIndex].min &&
                    produto.preco < faixasPreco[faixaPrecoIndex].max
                );

                return matchTexto && matchCategoria && matchTipo && matchMaterial && matchPreco;
            });

            // Atualizar grid
            produtosGrid.innerHTML = produtosFiltrados.length > 0
                ? produtosFiltrados.map(criarProdutoCard).join('')
                : '<div class="sem-resultados">Nenhum produto encontrado com os filtros selecionados.</div>';
        }

        // Inicializar filtros
        popularFiltros();

        // Event listeners para filtros
        buscaInput.addEventListener('input', filtrarProdutos);
        filtroSelects.forEach(select => select.addEventListener('change', filtrarProdutos));

        // Event listeners para tabs de categoria
        const filtros = document.querySelectorAll('.tab-link');
        filtros.forEach(filtro => {
            filtro.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Atualizar classe ativa
                filtros.forEach(f => f.classList.remove('active'));
                e.target.classList.add('active');

                // Aplicar filtros
                filtrarProdutos();
            });
        });

        // Renderizar todos os produtos inicialmente
        filtrarProdutos();

        // Funções do modal do provador virtual
        function resetarEstadoModal() {
            // Resetar o estado do modal
            const todasPaginas = document.querySelectorAll('.modal-page');
            todasPaginas.forEach(pagina => {
                pagina.classList.remove('active');
            });
            
            // Voltar para a primeira página
            const paginaIntro = document.getElementById('pagina-intro');
            if (paginaIntro) {
                paginaIntro.classList.add('active');
            }

            // Desativar a câmera se estiver ativa
            const video = document.querySelector('#camera-preview video');
            if (video && video.srcObject) {
                const stream = video.srcObject;
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
                video.srcObject = null;
            }
        }

        function fecharModalProvador() {
            const modal = document.getElementById('modal-provador');
            modal.style.display = 'none';
            resetarEstadoModal();
        }

        function mostrarCategorias() {
            const paginaIntro = document.getElementById('pagina-intro');
            const paginaCategorias = document.getElementById('pagina-categorias');
            
            paginaIntro.classList.remove('active');
            paginaCategorias.classList.add('active');
        }

        function voltarParaIntro() {
            const paginaIntro = document.getElementById('pagina-intro');
            const paginaCategorias = document.getElementById('pagina-categorias');
            
            paginaCategorias.classList.remove('active');
            paginaIntro.classList.add('active');
        }

        function selecionarCategoria(categoria, event) {
            event.preventDefault();
            const paginaCategorias = document.getElementById('pagina-categorias');
            const paginaCamera = document.getElementById('pagina-camera');
            
            paginaCategorias.classList.remove('active');
            paginaCamera.classList.add('active');
        }

        function voltarParaCategorias() {
            const paginaCamera = document.getElementById('pagina-camera');
            const paginaCategorias = document.getElementById('pagina-categorias');
            
            // Desativar a câmera ao voltar
            const video = document.querySelector('#camera-preview video');
            if (video && video.srcObject) {
                const stream = video.srcObject;
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
                video.srcObject = null;
            }
            
            paginaCamera.classList.remove('active');
            paginaCategorias.classList.add('active');
        }

        function ativarCamera() {
            // Implementação da ativação da câmera aqui
            console.log('Ativando câmera...');
        }

        // Função para abrir o modal do provador virtual
        function abrirProvadorVirtual(produtoId) {
            const modal = document.getElementById('modal-provador');
            resetarEstadoModal();
            modal.style.display = 'block';
        }

        // Configurar event listeners do modal
        const modal = document.getElementById('modal-provador');
        const btnFechar = modal.querySelector('.btn-fechar');
        const btnComecar = modal.querySelector('.btn-comecar');
        const btnVoltarIntro = modal.querySelector('.btn-voltar-intro');
        const btnVoltarCategorias = modal.querySelector('.btn-voltar-categorias');
        const btnAtivarCamera = modal.querySelector('.btn-ativar-camera');

        // Event listeners do modal
        if (btnFechar) btnFechar.addEventListener('click', fecharModalProvador);
        if (btnComecar) btnComecar.addEventListener('click', mostrarCategorias);
        if (btnVoltarIntro) btnVoltarIntro.addEventListener('click', voltarParaIntro);
        if (btnVoltarCategorias) btnVoltarCategorias.addEventListener('click', voltarParaCategorias);
        if (btnAtivarCamera) btnAtivarCamera.addEventListener('click', ativarCamera);

        // Event listener para fechar com ESC
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                fecharModalProvador();
            }
        });

        // Event listener para clicar fora do modal
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                fecharModalProvador();
            }
        });

        // Expor função globalmente
        window.abrirProvadorVirtual = abrirProvadorVirtual;

    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        if (produtosGrid) {
            produtosGrid.innerHTML = '<div class="erro-carregamento">Erro ao carregar os produtos. Por favor, tente novamente mais tarde.</div>';
        }
    }
}); 