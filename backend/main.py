from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class Point(BaseModel):
    lat: float
    lon: float
    value: float

class Req(BaseModel):
    hazard_type: str
    event_id: str
    exposure: list[Point]
    resolution: float = 1.0

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
            "properties": {"eai": pt.value * 0.1},
            "geometry": {"type": "Point", "coordinates": [pt.lon, pt.lat]},
        }
        for pt in req.exposure
    ]
    return {"type": "FeatureCollection", "features": feats}
