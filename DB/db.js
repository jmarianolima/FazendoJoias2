async function carregarProdutos() {
    try {
        const response = await fetch('DB/db.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.produtos;
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        throw error;
    }
} 