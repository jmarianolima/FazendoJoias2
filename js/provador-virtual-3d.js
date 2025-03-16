import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Elementos DOM
    const video = document.getElementById('camera');
    const canvas3d = document.getElementById('overlay3d');
    const handCanvas = document.getElementById('hand-canvas');
    const captureBtn = document.getElementById('capture-btn');
    const switchBtn = document.getElementById('switch-camera');
    const rotateLeft = document.getElementById('rotate-left');
    const rotateRight = document.getElementById('rotate-right');
    const joiasGrid = document.getElementById('joias-disponiveis');

    // Variáveis Three.js
    let scene, camera3D, renderer, currentModel;
    let facingMode = 'user';

    // Variáveis MediaPipe
    let hands;
    let lastHandLandmarks = null;

    // Mover as variáveis do carrinho para o escopo global do módulo
    let cartCount = 0;
    let cartItems = [];

    // Adicionar variáveis para controle de visibilidade
    let handDetectionCount = 0;
    const DETECTION_THRESHOLD = 10; // Número de frames para confirmar detecção
    let isHandPresent = false;

    // Atualizar a lista de modelos disponíveis para incluir preços
    const modelosDisponiveis = [
        {
            id: 'ring',
            nome: 'Anel Solitário Diamante',
            tipo: 'anel',
            modelo3D: './assets/models/ring.glb',
            imagem: './assets/images/ring-preview.jpg',
            preco: '2.999,99'
        }
    ];

    // Adicione no início do arquivo, após as variáveis
    function updateDebug(type, value) {
        const element = document.getElementById(`debug-${type}`);
        if (element) {
            element.textContent = value;
        }
    }

    // Atualizar posição do modelo 3D
    function updateModelPosition(landmarks, handedness) {
        if (!currentModel) return;

        const tipo = currentModel.userData.tipo;
        
        if (tipo === 'anel') {
            // Posição fixa no centro da tela
            currentModel.position.set(0, 0, -0.5);
            
            // Rotação fixa
            currentModel.rotation.set(Math.PI / 2, 0, 0);
            
            // Escala reduzida
            currentModel.scale.set(0.3, 0.2, 0.3);
        }
    }

    // Inicializar MediaPipe Hands
    async function initHandTracking() {
        try {
            const Hands = window.Hands;
            if (!Hands) {
                console.error('MediaPipe Hands não encontrado');
                return;
            }

            hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            hands.onResults(onHandResults);

            const Camera = window.Camera;
            if (!Camera) {
                console.error('MediaPipe Camera não encontrado');
                return;
            }

            const camera = new Camera(video, {
                onFrame: async () => {
                    try {
                        await hands.send({image: video});
                    } catch (error) {
                        console.error('Erro ao processar frame:', error);
                    }
                },
                width: 1280,
                height: 720
            });

            try {
                await camera.start();
                console.log('Câmera iniciada com sucesso');
                updateDebug('status', 'Câmera ativa');
            } catch (error) {
                console.error('Erro ao iniciar câmera:', error);
                updateDebug('status', 'Erro na câmera');
            }
        } catch (error) {
            console.error('Erro ao inicializar hand tracking:', error);
            updateDebug('status', 'Erro no hand tracking');
        }
    }

    // Processar resultados do MediaPipe
    function onHandResults(results) {
        const ctx = handCanvas.getContext('2d');
        handCanvas.width = video.videoWidth;
        handCanvas.height = video.videoHeight;
        ctx.clearRect(0, 0, handCanvas.width, handCanvas.height);
        
        if (currentModel) {
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                // Se a mão for detectada, torna o modelo visível
                if (!currentModel.visible) {
                    currentModel.visible = true;
                    updateModelPosition(); // Posiciona o modelo no centro
                }
                updateDebug('hands', `Mão detectada`);
            } else {
                // Se não houver mão, esconde o modelo
                currentModel.visible = false;
                updateDebug('hands', 'Aguardando mão...');
            }
        }
    }

    // Inicializar Three.js
    function initThree() {
        scene = new THREE.Scene();
        
        const container = document.querySelector('.camera-container');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Configurar câmera
        camera3D = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera3D.position.z = 2;
        camera3D.lookAt(0, 0, 0);

        // Configurar renderer
        renderer = new THREE.WebGLRenderer({
            canvas: canvas3d,
            alpha: true,
            antialias: true
        });
        
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.outputEncoding = THREE.sRGBEncoding;

        // Iluminação
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(2, 2, 2);
        scene.add(directionalLight);

        // Evento de redimensionamento
        window.addEventListener('resize', () => {
            const width = container.clientWidth;
            const height = container.clientHeight;

            camera3D.aspect = width / height;
            camera3D.updateProjectionMatrix();

            renderer.setSize(width, height);
        });

        animate();
    }

    // Função de animação
    function animate() {
        requestAnimationFrame(animate);
        
        if (currentModel && currentModel.userData.tipo !== 'anel') {
            // Só rotaciona automaticamente se não for um anel
            currentModel.rotation.y += 0.01;
        }
        
        renderer.render(scene, camera3D);
    }

    // Carregar modelo 3D com configurações específicas para anel
    async function loadModel(modelPath, tipo) {
        updateDebug('status', 'Carregando modelo...');

        try {
            if (currentModel) {
                scene.remove(currentModel);
            }

            const loader = new GLTFLoader();
            
            return new Promise((resolve, reject) => {
                loader.load(
                    modelPath,
                    (gltf) => {
                        currentModel = gltf.scene;
                        currentModel.userData.tipo = tipo;
                        currentModel.visible = false; // Iniciar invisível

                        // Configurações específicas para anel
                        if (tipo === 'anel') {
                            // Posição inicial fixa
                            currentModel.position.set(0, 0, -0.5);
                            
                            // Escala reduzida
                            currentModel.scale.set(0.3, 0.2, 0.3);
                            
                            // Rotação fixa
                            currentModel.rotation.set(Math.PI / 2, 0, 0);

                            // Melhorar materiais para visualização mais realista
                            currentModel.traverse((child) => {
                                if (child.isMesh) {
                                    child.material.side = THREE.DoubleSide;
                                    child.material.metalness = 0.7;
                                    child.material.roughness = 0.3;
                                    child.material.envMapIntensity = 1.2;
                                    child.castShadow = true;
                                    child.receiveShadow = true;
                                }
                            });
                        }

                        scene.add(currentModel);
                        updateDebug('status', 'Modelo carregado');
                        updateDebug('model', tipo);
                        resolve(gltf);
                    },
                    (progress) => {
                        const percent = (progress.loaded / progress.total * 100).toFixed(2);
                        updateDebug('status', `Carregando: ${percent}%`);
                    },
                    (error) => {
                        console.error('Erro ao carregar modelo:', error);
                        updateDebug('status', 'Erro ao carregar modelo');
                        reject(error);
                    }
                );
            });

        } catch (error) {
            console.error('Erro:', error);
            updateDebug('status', 'Erro ao carregar modelo');
            throw error;
        }
    }

    // Ajustar escala do modelo
    function ajustarEscalaModelo(tipo) {
        const escalas = {
            'brinco': [1, 1, 1],
            'colar': [1, 1, 1],
            'pulseira': [1, 1, 1],
            'anel': [1, 1, 1]
        };
        return escalas[tipo] || [1, 1, 1];
    }

    // Função para atualizar todos os contadores do carrinho na página
    function updateCartCounters() {
        // Atualizar contador no header
        const headerCounter = document.querySelector('.navbar .cart-count');
        if (headerCounter) {
            headerCounter.textContent = cartCount.toString();
        }
        
        // Atualizar contador flutuante
        const floatingCounter = document.querySelector('.cart-icon .cart-count');
        if (floatingCounter) {
            floatingCounter.textContent = cartCount.toString();
        }
        
        // Salvar no localStorage
        localStorage.setItem('cartCount', cartCount);
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        
        console.log('Carrinho atualizado:', { count: cartCount, items: cartItems });
    }

    // Função para adicionar item ao carrinho
    function addToCart(item) {
        if (window.cartManager) {
            window.cartManager.addItem(item);
            showToast(`${item.nome} adicionado ao carrinho!`);
        } else {
            console.error('CartManager não encontrado');
        }
    }

    // Função para mostrar notificação toast
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 2000);
        }, 100);
    }

    // Carregar estado do carrinho
    function loadCartState() {
        const savedCount = localStorage.getItem('cartCount');
        const savedItems = localStorage.getItem('cartItems');
        
        if (savedCount) {
            cartCount = parseInt(savedCount);
        }
        
        if (savedItems) {
            try {
                cartItems = JSON.parse(savedItems);
            } catch (e) {
                cartItems = [];
                console.error('Erro ao carregar itens do carrinho:', e);
            }
        }
        
        // Atualizar contadores após carregar
        updateCartCounters();
    }

    // Adicionar listener para quando o header for carregado
    document.addEventListener('headerLoaded', () => {
        console.log('Header carregado, atualizando contadores...');
        updateCartCounters();
    });

    // Atualizar função carregarJoias
    function carregarJoias() {
        joiasGrid.innerHTML = modelosDisponiveis.map(joia => `
            <div class="joia-item" data-model="${joia.modelo3D}" data-tipo="${joia.tipo}">
                <img src="${joia.imagem}" alt="${joia.nome}" onerror="this.src='assets/images/placeholder.jpg'">
                <p class="joia-nome">${joia.nome}</p>
                <p class="joia-preco">R$ ${joia.preco}</p>
            </div>
        `).join('');

        // Event listeners para seleção de item
        document.querySelectorAll('.joia-item').forEach(item => {
            item.addEventListener('click', async () => {
                document.querySelectorAll('.joia-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                
                try {
                    await loadModel(item.dataset.model, item.dataset.tipo);
                } catch (error) {
                    console.error('Erro ao carregar modelo:', error);
                    updateDebug('status', 'Erro ao carregar modelo');
                }
            });
        });
    }

    // Event Listeners
    rotateLeft.addEventListener('click', () => {
        if (currentModel) currentModel.rotation.y += 0.1;
    });

    rotateRight.addEventListener('click', () => {
        if (currentModel) currentModel.rotation.y -= 0.1;
    });

    switchBtn.addEventListener('click', async () => {
        facingMode = facingMode === 'user' ? 'environment' : 'user';
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        await initHandTracking();
    });

    // Inicialização
    try {
        console.log('Iniciando aplicação...');
        
        // Carregar joias primeiro
        carregarJoias();
        console.log('Joias carregadas');
        
        // Inicializar Three.js
        initThree();
        console.log('Three.js inicializado');
        
        // Iniciar hand tracking por último
        await initHandTracking();
        console.log('Hand tracking iniciado');
        
        console.log('Inicialização completa');
        updateDebug('status', 'Sistema pronto');
    } catch (error) {
        console.error('Erro na inicialização:', error);
        updateDebug('status', 'Erro na inicialização');
    }
}); 