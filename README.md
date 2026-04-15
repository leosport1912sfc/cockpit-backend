# 🚖 Cockpit de Gestão de Frota - Backend (API)

Bem-vindo ao motor do **Cockpit de Gestão de Frota** da CET-MG (DETRAN-MG). 
Este é o servidor Node.js responsável por receber as requisições da interface de usuário e gravar os dados de forma segura e auditável nas listas do **SharePoint Online**, utilizando autenticação moderna via **Microsoft Entra ID (MSAL)**.

## 🛠️ Pré-requisitos

Antes de ligar os motores, certifique-se de ter instalado em sua máquina:
* [Node.js](https://nodejs.org/en/) (Recomendada a versão LTS - Ex: v20+)
* [Visual Studio Code (VS Code)](https://code.visualstudio.com/)
* Acesso ao portal Azure AD para geração de chaves (caso precise renovar).

## 🚀 Passo a Passo para Rodar Localmente

Siga estas instruções para rodar a API no seu VS Code:

### Passo 1: Abrir o projeto
1. Abra o VS Code.
2. Vá em `File > Open Folder...` (Arquivo > Abrir Pasta...) e selecione a pasta `cockpit-backend`.
3. Abra o terminal integrado do VS Code (`Ctrl` + `"` ou `Terminal > New Terminal`).

### Passo 2: Instalar as "peças" do motor
No terminal, digite o comando abaixo e aperte Enter para instalar todas as bibliotecas necessárias (Express, PnPjs, MSAL, etc.):
\`\`\`bash
npm install
\`\`\`

### Passo 3: O Cofre de Senhas (.env)
Para que o servidor consiga acessar o SharePoint, ele precisa das credenciais do Azure. 
1. Na raiz do projeto, crie um arquivo chamado exatamente **`.env`** (com o ponto no início).
2. Cole a estrutura abaixo dentro dele e preencha com as chaves oficiais do projeto:

\`\`\`text
TENANT_ID=seu_tenant_id_aqui
CLIENT_ID=seu_client_id_aqui
CLIENT_SECRET=seu_secret_aqui
SITE_URL=https://cecad365.sharepoint.com/sites/SolicitacaodeVeiculos-CET
PORT=3001
\`\`\`
*(Aviso: O arquivo `.env` já está no `.gitignore` para nunca vazar as senhas no GitHub).*

### Passo 4: Ligar a Ignição
Com tudo instalado e configurado, rode o comando:
\`\`\`bash
npm run dev
\`\`\`
*(Ou `node server.js` se não estiver usando nodemon).*

Se tudo estiver correto, você verá no terminal a mensagem:
**"🚗 Vrum! O romance com o SharePoint começou na porta http://localhost:3001"**

## 📡 Rotas Principais
* **POST `/api/pedidos`**: Recebe o JSON do formulário e cria um item na lista `SolicitacaoVeiculosForms` do SharePoint com o status "Pendente", engatilhando o robô do Power Automate.
