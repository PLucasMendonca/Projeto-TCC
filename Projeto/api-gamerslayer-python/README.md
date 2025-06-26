# GamerSlayer API (Python/FastAPI)

API para buscar informações de jogos mobile na Google Play Store.

## Configuração

1. Crie um ambiente virtual Python:
```bash
python -m venv venv
```

2. Ative o ambiente virtual:
- Windows:
```bash
.\venv\Scripts\activate
```
- Linux/Mac:
```bash
source venv/bin/activate
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

## Executando a API

1. Inicie o servidor:
```bash
uvicorn main:app --reload
```

2. Acesse a documentação da API:
```
http://localhost:8000/docs
```

## Endpoints Disponíveis

1. Buscar jogos:
```
GET http://localhost:8000/api/mobile/games/search?query=nome_do_jogo
```

2. Obter detalhes de um jogo:
```
GET http://localhost:8000/api/mobile/games/package_name
```

Exemplo:
```
GET http://localhost:8000/api/mobile/games/com.mojang.minecraftpe
```

## Retorno da API

### Busca de Jogos
```json
[
  {
    "title": "Nome do Jogo",
    "package_name": "com.exemplo.jogo",
    "icon": "URL do ícone",
    "score": 4.5,
    "price": "Free",
    "developer": "Nome do Desenvolvedor",
    "category": "Categoria do Jogo"
  }
]
```

### Detalhes do Jogo
```json
{
  "title": "Nome do Jogo",
  "package_name": "com.exemplo.jogo",
  "icon": "URL do ícone",
  "score": 4.5,
  "price": "Free",
  "developer": "Nome do Desenvolvedor",
  "size": "100MB",
  "android_version": "5.0",
  "installs": "1,000,000+",
  "content_rating": "Livre",
  "last_updated": "1 de janeiro de 2025",
  "category": "Jogos",
  "description": "Descrição do jogo",
  "requirements": {
    "min_android": "5.0",
    "min_ram": "N/A",
    "min_storage": "100MB",
    "permissions": ["INTERNET", "ACCESS_NETWORK_STATE"]
  }
}
```
