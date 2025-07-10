from fastapi import FastAPI, HTTPException
import json

app = FastAPI()

class Req(BaseModel):
    hazard_type: str
    event_id: str
    exposure: list
    resolution: float = 1.0

@app.post("/api/calculate")
def calc(req: Req):
    if not req.exposure:
        raise HTTPException(status_code=400, detail="exposure vazio")

    features = [
        {
            "type": "Feature",
            "properties": {"eai": pt["value"] * 0.1},
            "geometry": {"type": "Point", "coordinates": [pt["lon"], pt["lat"]]},
        }
        for pt in req.exposure
    ]
    return {"type": "FeatureCollection", "features": features}
