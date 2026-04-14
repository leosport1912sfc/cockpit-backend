const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { spfi } = require("@pnp/sp");
const { SPFetchClient } = require("@pnp/nodejs");
require("@pnp/sp/webs");
require("@pnp/sp/lists");
require("@pnp/sp/items");

const app = express();
const PORT = process.env.PORT || 3001;

// O abraço caloroso do Express para entender JSON
app.use(cors());
app.use(express.json()); 

// Configurando o "Crachá" do Servidor para falar com a Microsoft
const sp = spfi().using(SPFetchClient(
  process.env.SITE_URL,
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET
));

// A Rota POST (ÚNICA E VERDADEIRA) que recebe os dados do Wizard e salva na Nuvem
app.post('/api/pedidos', async (req, res) => {
  try {
    // Olha a mágica aqui: pegando o emailSolicitante que vem do frontend!
    const { solicitante, emailSolicitante, destino, dataPartida, justificativa, tipoServico } = req.body;

    // Criando o registro na lista transacional conforme o nosso PDF de arquitetura
    const iar = await sp.web.lists.getByTitle("SolicitacaoVeiculosForms").items.add({
      Title: `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      NomeSolicitante: solicitante,
      emailSolicitante: emailSolicitante, // Agora ele tem de onde puxar a informação!
      EnderecoDestino: destino,
      DataViagem: dataPartida,
      TipoServico: tipoServico || "Administrativo",
      Justificativa: justificativa,
      StatusFluxo: "Pendente" // O início de um novo romance
    });

    res.json({ success: true, id: iar.data.ID, mensagem: 'Salvo nas nuvens com muito amor!' });
  } catch (error) {
    console.error("Erro no SharePoint:", error);
    res.status(500).json({ error: "O cofre da Microsoft recusou o nosso beijo." });
  }
});

// --- LIGANDO A IGNIÇÃO ---
app.listen(PORT, () => {
    console.log(`🚗 Vrum! O romance com o SharePoint começou na porta http://localhost:${PORT}`);
});