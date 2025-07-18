from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Literal
from climada.hazard import TCTracks, TropCyclone, Centroids
from climada.entity import Exposures, ImpactFuncSet, ImpfTropCyclone
from climada.engine import Impact
import pandas as pd


app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "API funcionando"}

# ----- esquemas de entrada -----
class ExposureIn(BaseModel):
    id: str
    type: str
    lat: float
    lon: float
    value_usd: float

class HazardIn(BaseModel):
    type: Literal["TC"] = "TC"
    start_lat: float
    start_lon: float
    wind_speed: float
    radius_max_wind: float
    translation_speed: float
    track_angle: float
    central_pressure: float
    duration_hours: int = 4
    climate_scenario: str = "CURRENT"

class CalcRequest(BaseModel):
    hazard: HazardIn
    exposures: List[ExposureIn]

# ----- funções auxiliares -----
def build_tc_hazard(h: HazardIn, locs):
    tr = TCTracks()
    track = tr.generate_synthetic_track(
        basin='NA',
        initial_pos=(h.start_lon, h.start_lat),
        wind_speed=h.wind_speed,
        central_pressure=h.central_pressure,
        radius_max_wind=h.radius_max_wind,
        track_angle=h.track_angle,
        track_speed=h.translation_speed,
        duration=h.duration_hours
    )
    cent = Centroids.from_exposures_locs(locs, res=0.25)
    tc = TropCyclone.from_tracks(tr, centroids=cent)
    if h.climate_scenario == "RCP45":
        tc = tc.apply_climate_scenario_knu(rcp_scenario=45)
    elif h.climate_scenario == "RCP85":
        tc = tc.apply_climate_scenario_knu(rcp_scenario=85)
    return tc

def build_exposures(exp_list: list[ExposureIn]) -> Exposures:
    """Recebe a lista de ativos do usuário e devolve um objeto Climada Exposures."""
    exp = Exposures()
    # preencher listas simples
    exp.lon  = [e.lon  for e in exp_list]
    exp.lat  = [e.lat  for e in exp_list]
    exp.value= [e.value_usd for e in exp_list]
    exp.id   = [e.id   for e in exp_list]
    exp.category = [e.type for e in exp_list]
    # gerar GeoSeries geometry
    exp.set_lat_lon()
    return exp

# ----- rota principal -----
@app.post("/api/calculate")

def calc(req: CalcRequest):
    exp = build_exposures(req.exposures)
    tc  = build_tc_hazard(
        req.hazard, 
        list(zip(exp.lon, exp.lat)))

    impf = ImpactFuncSet()
    base_if = ImpfTropCyclone.from_emanuel_usa()
    base_if.id = 1
    impf.append(base_if)

    imp = Impact()
    imp.calc(exp, impf, tc)

    return {
        "aal_usd": float(imp.aai_agg),
        "pml_200_usd": float(imp.calc_pml(return_periods=(200))[0]),
        "assets": [
            {
              "id": row.id,
              "type": row.type,
              "lat": row.latitude,
              "lon": row.longitude,
              "value_usd": row.value,
              "damage_pct": round(float(imp.eai_exp[i]/row.value*100),2)
            }
            for i, row in exp.gdf.iterrows()
        ]
    }
