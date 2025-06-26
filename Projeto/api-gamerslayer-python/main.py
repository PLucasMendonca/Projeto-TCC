from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict
from pydantic import BaseModel
from google_play_scraper import search, app, permissions
import re
from datetime import datetime
import json

app = FastAPI(
    title="GamerSlayer API",
    description="API para buscar informações de jogos mobile na Google Play Store",
    version="1.0.0"
)

# Habilita CORS para requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GameRequirements(BaseModel):
    min_android_version: Optional[str] = None
    required_storage: Optional[float] = None  # in MB
    supported_architectures: List[str] = []
    required_permissions: List[Dict[str, List[str]]] = []
    hardware_accelerated: bool = False
    opengl_version: Optional[str] = None

class GameSearchResult(BaseModel):
    title: str
    package_name: str
    icon: str
    score: Optional[float]
    price: str
    developer: str
    category: Optional[str]
    size: Optional[str]
    android_version: Optional[str]
    installs: Optional[str]

class GameDetails(BaseModel):
    title: str
    package_name: str
    icon: str
    score: Optional[float]
    price: str
    developer: str
    size: Optional[str]
    android_version: Optional[str]
    installs: Optional[str]
    content_rating: Optional[str]
    last_updated: Optional[str]
    category: Optional[str]
    description: Optional[str]
    requirements: GameRequirements

@app.get("/", tags=["Root"])
def read_root():
    return JSONResponse(
        content={
            "message": "GamerSlayer API está funcionando!",
            "endpoints": {
                "buscar_jogos": "/api/mobile/games/search?query=nome_do_jogo",
                "detalhes_jogo": "/api/mobile/games/{package_name}"
            }
        },
        headers={"Content-Type": "application/json; charset=utf-8"}
    )

def parse_size_to_mb(size_str: str) -> Optional[float]:
    if not size_str:
        return None
    
    try:
        # Remove caracteres não numéricos exceto ponto e vírgula
        size_str = re.sub(r'[^0-9.,]', '', size_str)
        size_num = float(size_str.replace(',', '.'))
        
        if 'GB' in size_str.upper():
            return size_num * 1024  # Converter GB para MB
        elif 'KB' in size_str.upper():
            return size_num / 1024  # Converter KB para MB
        elif 'MB' in size_str.upper():
            return size_num
        return None
    except:
        return None

def parse_android_version(version_str: str) -> str:
    if not version_str:
        return 'N/A'
    
    # Extrai o número da versão (ex: "Android 5.0" -> "5.0")
    match = re.search(r'\d+(\.\d+)?', version_str)
    if match:
        return match.group(0)
    return version_str

@app.get("/api/mobile/games/search", response_model=List[GameSearchResult], tags=["Games"])
async def search_games(query: str = Query(..., min_length=3, description="Nome do jogo para buscar")):
    try:
        results = search(query, lang="pt-BR", country="br")
        return [
            {
                "title": game["title"],
                "package_name": game["appId"],
                "icon": game["icon"],
                "score": game["score"],
                "price": "Free" if game["free"] else f"${game['price']}",
                "developer": game["developer"],
                "category": game["genre"],
                "size": game.get("size", "N/A"),
                "android_version": game.get("androidVersion", "N/A"),
                "installs": game.get("installs", "N/A")
            }
            for game in results
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar jogos: {str(e)}")

@app.get("/api/mobile/games/{package_name}", response_model=GameDetails, tags=["Games"])
def get_game_details(package_name: str):
    try:
        # Buscar detalhes do jogo e permissões em paralelo
        from google_play_scraper import app
        details = app(
            package_name,  # Apenas o package_name é necessário
            lang='pt_BR',
            country='br'
        )
        perms = permissions(package_name)
        
        # Extrair arquiteturas suportadas da descrição
        architectures = []
        if "arm64-v8a" in str(details).lower():
            architectures.append("arm64-v8a")
        if "armeabi-v7a" in str(details).lower():
            architectures.append("armeabi-v7a")
        if "x86" in str(details).lower():
            architectures.append("x86")
        
        # Extrair features da descrição
        features = []
        if "gpu" in str(details).lower() or "opengl" in str(details).lower():
            features.append("GPU required")
        
        # Verificar se requer aceleração de hardware
        hardware_accelerated = False  # valor padrão
        description = str(details.get('description', '')).lower()
        if 'hardware' in description and 'acceleration' in description:
            hardware_accelerated = True
        
        required_permissions = []
        for category, permissions_list in perms.items():
            required_permissions.append({category: permissions_list})
        
        requirements = GameRequirements(
            min_android_version=parse_android_version(details.get("androidVersion", "N/A")),
            required_storage=parse_size_to_mb(details.get("size", "N/A")),
            supported_architectures=architectures,
            required_permissions=required_permissions,
            hardware_accelerated=hardware_accelerated
        )
        
        return {
            "title": details["title"],
            "package_name": details["appId"],
            "icon": details["icon"],
            "score": details["score"],
            "price": "Free" if details["free"] else f"${details['price']}",
            "developer": details["developer"],
            "size": details.get("size", "N/A"),
            "android_version": details.get("androidVersion", "N/A"),
            "installs": details.get("installs", "N/A"),
            "content_rating": details.get("contentRating", "N/A"),
            "last_updated": details.get("updated", "N/A"),
            "category": details.get("genre", ""),
            "description": details.get("description", ""),
            "requirements": requirements
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Erro ao obter detalhes do jogo: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
