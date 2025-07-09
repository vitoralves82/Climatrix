from fastapi import FastAPI
from pydantic import BaseModel
from climada.hazard.tc_tracks import TCTracks
from climada.engine import Impact

app = FastAPI()

class Req(BaseModel):
    hazard_type: str
    event_id: str
    exposure: list
    resolution: float = 1.0

@app.post("/api/calculate")
def calc(req: Req):
    track = TCTracks.from_ibtracs_netcdf(event_id=req.event_id)
    # TODO: construir exposição e cálculo
    imp = Impact()  # placeholder
    return {"msg": "ok"}  # substitua pelo GeoJSON
