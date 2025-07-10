from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Literal
from climada.hazard import TCTracks, TropCyclone, Centroids
from climada.entity import Exposures, ImpactFuncSet, ImpfTropCyclone
from climada.engine import Impact
import pandas as pd

app = FastAPI()

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

def build_exposures(exps: List[ExposureIn]):
    df = pd.DataFrame([e.dict() for e in exps]).rename(
        columns={"lat":"latitude", "lon":"longitude", "value_usd":"value"}
    )
    exp = Exposures(df)
    exp.set_geometry_points()
    exp.gdf["impf_TC"] = 1
    return exp

# ----- rota principal -----
@app.post("/api/calculate")
def calc(req: CalcRequest):
    exp = build_exposures(req.exposures)
    tc  = build_tc_hazard(req.hazard, list(zip(exp.gdf.longitude, exp.gdf.latitude)))

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
