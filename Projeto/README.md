# 🎮 GamersLayer — Aplicativo de Verificação de Compatibilidade de Jogos Android

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![React Native](https://img.shields.io/badge/React_Native-0.76.9-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-52.0.43-green.svg)](https://expo.dev/)

## 📋 Descrição

O **GamersLayer** é um aplicativo mobile desenvolvido como Trabalho de Conclusão de Curso (TCC), com o objetivo de verificar automaticamente a **compatibilidade entre jogos da Google Play Store e dispositivos Android**. O app compara as especificações técnicas do aparelho com os requisitos mínimos dos jogos e retorna uma **pontuação de compatibilidade** (0 a 100), acompanhada de **feedback visual simples e direto**.

Inspirado na plataforma "Can You Run It", o GamersLayer traz essa abordagem para o ambiente mobile de forma acessível e intuitiva, ajudando usuários a evitarem frustrações na instalação de jogos incompatíveis.

---

## 🚀 Funcionalidades

- 🔍 Verificação de compatibilidade entre jogos e o aparelho do usuário
- ⚙️ Coleta de dados técnicos do dispositivo automaticamente
- 🕹️ Integração com a Google Play via API (RapidAPI)
- 📊 Geração de pontuação de compatibilidade com feedback visual
- 🔐 Autenticação de usuários com Firebase
- 📈 Histórico local de análises e compartilhamento de resultados

---

## 🛠️ Tecnologias Utilizadas

### 📱 Frontend
- React Native 0.76.9
- Expo 52.0.43
- Axios
- React Navigation
- AsyncStorage

### ☁️ Backend e Serviços
- Firebase (Auth, Firestore)
- Firebase Functions (Node.js)
- RapidAPI (Google Play)
- APIs Expo (Device, Battery, FileSystem)

---

## 📦 Requisitos

- Node.js 18+
- Expo CLI
- Yarn ou npm
- Android Studio (para testes Android)
- Xcode (opcional, para testes iOS)

---

## 🔧 Como rodar o projeto

### 1. Clonando o repositório

```bash
git clone https://github.com/PLucasMendonca/Projeto-Tcc-App.git
cd Projeto-Tcc-App
```

### 2. Instalando dependências

```bash
yarn install
```

### 3. Configuração do Firebase

Crie o arquivo firebase.ts com base no exemplo:

```bash
cp src/config/firebase.ts.example src/config/firebase.ts
```

### 4. Configuração do backend (Firebase Functions)

```bash
cp functions/env.example functions/.env
```

### 5. Executando o projeto

```bash
expo start
```

⚠️ Para builds de produção, use:

```bash
eas build --platform android
```

## 📄 Estrutura do Projeto

```
Projeto-Tcc-App/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   ├── config/          # Configurações (Firebase, etc)
│   ├── navigation/      # Navegação entre telas
│   ├── screens/         # Telas do app
│   ├── services/        # Integração com APIs
│   ├── styles/          # Estilos globais
│   └── types/           # Tipos TypeScript
└── functions/           # Backend Firebase Functions
```

## 🔒 Segurança e Privacidade

- Nenhum dado sensível do usuário (mensagens, localização, contatos, etc) é coletado
- A coleta é limitada a dados técnicos do dispositivo para análise de compatibilidade
- Os dados enviados ao Firebase são protegidos por regras de acesso
- O projeto segue os princípios da LGPD

## 🧪 Testes

O app foi testado em múltiplos dispositivos Android, de entrada a intermediários, com validação das seguintes funcionalidades:

- Coleta e análise de dados técnicos do dispositivo
- Integração com a Play Store
- Algoritmo de pontuação de compatibilidade
- Feedback visual e usabilidade
- Armazenamento local e autenticação

## 📄 Licença

Distribuído sob a licença MIT. Veja abaixo:

MIT License

Copyright (c) 2025 Lucas Mendonça

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

## 🗣️ Contato

Para dúvidas, sugestões ou melhorias, Entre em contato por email: plucas.santos.mendonca@gmail.com

## ✨ Créditos

Este projeto foi desenvolvido por Lucas Mendonça como Trabalho de Conclusão de Curso no curso de Ciência da Computação do Centro Universitário IESB — 2025.