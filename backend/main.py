import json
from fastapi import HTTPException

@app.post("/api/calculate")
def calc(req: Req):
    # validação mínima
    if not req.exposure:
        raise HTTPException(status_code=400, detail="exposure vazio")

    # GeoJSON de teste: devolve cada ponto da exposição como Feature
    features = [
        {
            "type": "Feature",
            "properties": {"eai": pt["value"] * 0.1},
            "geometry": {"type": "Point", "coordinates": [pt["lon"], pt["lat"]]}
        }
        for pt in req.exposure
    ]
    return json.loads(json.dumps({"type": "FeatureCollection", "features": features}))
