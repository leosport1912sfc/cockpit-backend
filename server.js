const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// A Chave do nosso Cofre: Conectando ao banco SQLite
let db;
(async () => {
    db = await open({
        filename: './frota.sqlite', // Ele vai criar esse arquivo magicamente na sua pasta!
        driver: sqlite3.Database
    });

    // Criando a tabela de Pedidos se ela ainda não existir
    await db.exec(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      solicitante TEXT,
      destino TEXT,
      dataPartida TEXT,
      status TEXT
    )
  `);
    console.log("📦 Nosso cofre SQLite está aberto e pronto para guardar segredos!");
})();

// --- AS NOSSAS ROTAS DE AMOR ---

// Rota GET: O Logístico pede, nós entregamos!
app.get('/api/pedidos', async (req, res) => {
    try {
        // Busca todos os pedidos no banco, ordenando do mais novo para o mais velho
        const pedidos = await db.all('SELECT * FROM pedidos ORDER BY id DESC');
        res.json(pedidos);
    } catch (erro) {
        res.status(500).json({ erro: "Ih, deu ruim ao buscar os pedidos." });
    }
});

// Rota POST: O servidor pede um carro, nós salvamos!
app.post('/api/pedidos', async (req, res) => {
    try {
        // Pegamos os dados que o frontend nos enviou num abraço caloroso
        const { solicitante, destino, dataPartida } = req.body;

        // Inserimos no banco com o status inicial 'Pendente'
        const resultado = await db.run(
            'INSERT INTO pedidos (solicitante, destino, dataPartida, status) VALUES (?, ?, ?, ?)',
            [solicitante, destino, dataPartida, 'Pendente']
        );

        // Respondemos com sucesso e o ID da nova viagem
        res.json({ id: resultado.lastID, mensagem: 'Pedido salvo com muito amor no nosso cofre!' });
    } catch (erro) {
        res.status(500).json({ erro: "Falha ao salvar no cofre." });
    }
});

// Rota PATCH: O beijo final! Atualiza o status quando a logística despacha o carro.
app.patch('/api/pedidos/:id', async (req, res) => {
    try {
        // Pegamos o ID que vem lá na URL (o número do pedido)
        const { id } = req.params;

        // Atualizamos o status lá no nosso cofre SQLite
        await db.run(
            'UPDATE pedidos SET status = ? WHERE id = ?',
            ['Agendado', id]
        );

        res.json({ mensagem: 'Carro despachado com muito sucesso e amor!' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Ih, a chave do carro agarrou. Erro ao atualizar o cofre." });
    }
});

// --- LIGANDO A IGNIÇÃO ---
app.listen(PORT, () => {
    console.log(`🚗 Vrum! Servidor do Cockpit rodando na porta http://localhost:${PORT}`);
});