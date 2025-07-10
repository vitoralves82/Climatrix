from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware          # ← novo
from pydantic import BaseModel

app = FastAPI()

# ── CORS: libera chamadas do Vercel ───────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://climatrix.vercel.app"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Tipos ------------------------------------------------------
class Point(BaseModel):
    lat: float
    lon: float
    value: float

class Req(BaseModel):
    hazard_type: str
    event_id: str
    exposure: list[Point]
    resolution: float = 1.0

# ── Rotas ──────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok"}

@app.post("/api/calculate")
def calc(req: Req):
    if not req.exposure:
        raise HTTPException(status_code=400, detail="exposure vazio")

    feats = [
        {
            "type": "Feature",
            "properties": {"value": pt.value, "eai": pt.value * 0.1},
            "geometry": {"type": "Point", "coordinates": [pt.lon, pt.lat]},
        }
        for pt in req.exposure
    ]
    return {"type": "FeatureCollection", "features": feats}
