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

// A Rota POST (ÚNICA E VERDADEIRA) que recebe os dados do Frontend e salva na Nuvem
app.post('/api/pedidos', async (req, res) => {
  try {
    // 1. Recebendo a "carga" completa do Frontend (Next.js)
    const dados = req.body;

    // 2. Criando o registro na lista transacional com os nomes EXATOS do seu SharePoint
    const iar = await sp.web.lists.getByTitle("SolicitacaoVeiculos Forms").items.add({
      Title: `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      Author: dados.NomeSolicitante,
      emailSolicitante: dados.emailSolicitante,
      AreaTrabalho: dados.SetorSolicitante,
      ChefiaAreaSolicitante: dados.ChefiaAreaSolicitante, // O e-mail do chefe para o Automate!
      TelefoneSolicccitante: dados.TelefoneSolicitante,
      TipoServico: dados.TipoServico, // Ex: "Transporte - Van/Minibus (7+ lugares)"
      QuantasPessoas: Number(dados.QuantasPessoas),
      DatadaViagemeHorario: dados.DatadaViagem, // Formato YYYY-MM-DD
      Hor_x00e1_riodaPartida: dados.HorariodaPartida,
      Endere_x00e7_odeOrigem: dados.EnderecodeOrigem,
      NomedoLocaldeDestino: dados.NomedoLocaldeDestino,
      Endere_x00e7_odoLocaldeDestino: dados.EndereçodoLocaldeDestino,
      Munic_x00ed_pio: dados.Municipio,
      Itiner_x00e1_rioSeHouver: dados.ItinerarioSeHouver,
      NecessitaRetorno: dados.NecessitaRetorno, // "Sim" ou "Não"
      MotoristaVaiAguardar: dados.MotoristaVaiAguardar, // "Sim" ou "Não"
      Hor_x00e1_riodoT_x00e9_rminodoEvento: dados.HorariodoTerminodoEvento,
      Hor_x00e1_riodoRetorno: dados.HorariodoRetorno,
      StatusFluxo: "Pendente" // Mantemos o status inicial do fluxo
    });

    res.json({ success: true, id: iar.data.ID, mensagem: 'Salvo com sucesso e pronto para a chefia aprovar!' });
  } catch (error) {
    console.error("Erro no SharePoint:", error);
    res.status(500).json({ error: "Falha na comunicação com o banco do Governo." });
  }
});

// --- LIGANDO A IGNIÇÃO ---
app.listen(PORT, () => {
    console.log(`🚗 Vrum! O romance com o SharePoint começou na porta http://localhost:${PORT}`);
});