# Pedidos Internos

Aplicativo mobile para consulta de produtos, montagem de carrinho, criação de pedidos internos e acompanhamento de pedidos já realizados. O app foi desenvolvido com Expo, React Native, Expo Router, TypeScript e NativeWind.

## Funcionalidades

- Login com documento CPF/CNPJ e senha.
- Persistência segura da sessão com `expo-secure-store`.
- Listagem de produtos com busca por código, descrição, volume ou preço.
- Exibição de imagem, preço e unidade/volume dos produtos.
- Consulta de limite de crédito disponível.
- Carrinho com inclusão, remoção, alteração de quantidade e totalização.
- Validação de limite antes do envio do pedido.
- Envio de pedidos para a API integrada ao Sankhya.
- Histórico de pedidos com status, data, valor total e detalhes dos itens.
- Atualização manual das listas por pull-to-refresh.

## Tecnologias

- Expo `~56`
- React Native `0.85`
- React `19`
- TypeScript
- Expo Router
- NativeWind/Tailwind CSS
- Expo SecureStore
- EAS Build

## Requisitos

- Node.js instalado.
- npm instalado.
- Expo CLI/EAS CLI, caso queira executar builds nativos.
- Android Studio ou dispositivo Android para `expo run:android`.
- Xcode/macOS para `expo run:ios`.

## Instalação

```bash
npm install
```

## Configuração da API

Por padrão, o app usa a API:

```txt
https://backend-pedidos-internos.onrender.com/api
```

Para apontar para outro backend, defina a variável de ambiente `EXPO_PUBLIC_API_URL`:

```bash
EXPO_PUBLIC_API_URL=https://sua-api.com/api npm start
```

No Windows PowerShell:

```powershell
$env:EXPO_PUBLIC_API_URL="https://sua-api.com/api"
npm start
```

## Executando o Projeto

Inicie o servidor de desenvolvimento:

```bash
npm start
```

Execute em Android:

```bash
npm run android
```

Execute em iOS:

```bash
npm run ios
```

Execute no navegador:

```bash
npm run web
```

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm start` | Inicia o Expo Dev Server. |
| `npm run android` | Compila e executa o app no Android. |
| `npm run ios` | Compila e executa o app no iOS. |
| `npm run web` | Inicia a versão web com Expo. |

## Estrutura do Projeto

```txt
.
+-- src
|   +-- app
|   |   +-- (auth)        # Telas de autenticação
|   |   +-- (tabs)        # Produtos, pedidos e carrinho
|   |   +-- _layout.tsx   # Providers globais e navegação raiz
|   |   +-- index.tsx     # Redirecionamento inicial
|   +-- assets            # Logos e ícones usados pela interface
|   +-- components        # Componentes reutilizáveis
|   +-- contexts          # Autenticação, carrinho e atualização de dados
|   +-- services          # Comunicação com API e storage local
|   +-- types             # Declarações globais
+-- assets                # Ícones e splash usados pelo Expo
+-- app.json              # Configuração do Expo
+-- eas.json              # Perfis de build EAS
+-- package.json          # Dependências e scripts
```

## Rotas Principais

- `/login`: autenticação do cliente.
- `/home`: catálogo de produtos e inclusão no carrinho.
- `/orders`: carrinho e envio do pedido.
- `/my-orders`: histórico e detalhes de pedidos.

## Integração com Backend

Os serviços em `src/services` consomem os seguintes recursos da API:

- `POST /auth`: autentica o cliente e retorna token, nome e tipo do cliente.
- `GET /products`: lista produtos disponíveis.
- `GET /credit-limit`: retorna limite de crédito disponível.
- `POST /orders`: cria um novo pedido com os itens do carrinho.
- `GET /orders`: lista pedidos do cliente autenticado.
- `GET /orders/:numeroUnico/items`: lista itens de um pedido.

As requisições autenticadas enviam o token no header:

```txt
Authorization: Bearer <token>
```

## Build com EAS

O projeto já possui perfis configurados em `eas.json`.

Build de desenvolvimento:

```bash
eas build --profile development
```

Build preview Android em APK:

```bash
eas build --profile preview --platform android
```

Build de produção:

```bash
eas build --profile production
```

## Observações

- O app está configurado para orientação portrait.
- O pacote Android configurado é `com.semalo.pedidosinternos`.
- O tema visual usa base clara com destaque em laranja `#F08510`.
- Não há script de testes configurado atualmente no `package.json`.
