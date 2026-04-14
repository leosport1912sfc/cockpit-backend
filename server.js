const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

require('dotenv').config();
const { spfi, SPFI } = require("@pnp/sp");
const { SPFetchClient } = require("@pnp/nodejs");
require("@pnp/sp/webs");
require("@pnp/sp/lists");
require("@pnp/sp/items");

// Configurando o "Crachá" do Servidor para falar com a Microsoft
const sp = spfi().using(SPFetchClient(
  process.env.SITE_URL,
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET
));

// A Rota que recebe os dados do Wizard e salva na Nuvem
app.post('/api/pedidos', async (req, res) => {
  try {
    const { solicitante, destino, dataPartida, justificativa, tipoServico } = req.body;

    // Criando o registro na lista transacional conforme o PDF [cite: 31, 35]
    const iar = await sp.web.lists.getByTitle("SolicitacaoVeiculosForms").items.add({
      Title: `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      NomeSolicitante: solicitante,
      emailSolicitante: emailSolicitante,
      EnderecoDestino: destino,
      DataViagem: dataPartida,
      TipoServico: tipoServico || "Administrativo",
      Justificativa: justificativa,
      StatusFluxo: "Pendente" // O início de tudo 
    });

    res.json({ success: true, id: iar.data.ID });
  } catch (error) {
    console.error("Erro no SharePoint:", error);
    res.status(500).json({ error: "O cofre da Microsoft recusou o acesso." });
  }
});

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