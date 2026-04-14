const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { spfi } = require("@pnp/sp");
const { SPDefault } = require("@pnp/nodejs"); // <-- A Fechadura Nova!
require("@pnp/sp/webs");
require("@pnp/sp/lists");
require("@pnp/sp/items");

const app = express();
const PORT = process.env.PORT || 3001;

// O abraço caloroso do Express para entender JSON
app.use(cors());
app.use(express.json()); 

// 1. Configurando a Inteligência de Autenticação do Azure (MSAL)
const configAzure = {
  auth: {
    // Usando o ID do Locatário (Tenant) que você pegou no Azure
    authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  }
};

// 2. Entregando o "Crachá" moderno para o servidor
const sp = spfi(process.env.SITE_URL).using(SPDefault({
  msal: {
    config: configAzure,
    scopes: [`https://cecad365.sharepoint.com/.default`] // O escopo global do órgão
  }
}));

// A Rota POST (ÚNICA E VERDADEIRA) que recebe os dados e salva na Nuvem
app.post('/api/pedidos', async (req, res) => {
  try {
    // Pegando os dados que o frontend enviou, incluindo o e-mail!
    const { solicitante, emailSolicitante, destino, dataPartida, justificativa, tipoServico } = req.body;

    // Criando o registro na lista transacional conforme a arquitetura
    const iar = await sp.web.lists.getByTitle("SolicitacaoVeiculosForms").items.add({
      Title: `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      NomeSolicitante: solicitante,
      emailSolicitante: emailSolicitante, // Preenchendo a coluna para o Power Automate ler!
      EnderecoDestino: destino,
      DataViagem: dataPartida,
      TipoServico: tipoServico || "Administrativo",
      Justificativa: justificativa,
      StatusFluxo: "Pendente" 
    });

    res.json({ success: true, id: iar.data.ID, mensagem: 'Salvo no SharePoint com tecnologia Azure!' });
  } catch (error) {
    console.error("Erro no SharePoint:", error);
    res.status(500).json({ error: "O cofre da Microsoft recusou o nosso beijo." });
  }
});

// --- LIGANDO A IGNIÇÃO ---
app.listen(PORT, () => {
    console.log(`🚗 Vrum! O romance com o SharePoint começou na porta http://localhost:${PORT}`);
});