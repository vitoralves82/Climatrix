from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List
from climada.hazard import TCTracks, TropCyclone, Centroids
from climada.entity import Exposures, ImpactFuncSet, ImpfTropCyclone
from climada.engine import Impact
import pandas as pd
import numpy as np

app = FastAPI()

# ---------- Esquemas de entrada ----------
class ExposureIn(BaseModel):
    id: str
    type: str
    lat: float
    lon: float
    value_usd: float

class HazardIn(BaseModel):
    type: str = Field("TC", const=True)
    start_lat: float
    start_lon: float
    wind_speed: float
    radius_max_wind: float
    translation_speed: float
    track_angle: float
    central_pressure: float
    duration_hours: int = 4
    climate_scenario: str = "CURRENT"  # "RCP45" | "RCP85"

class CalcRequest(BaseModel):
    hazard: HazardIn
    exposures: List[ExposureIn]

# ---------- Funções auxiliares ----------
def build_tc_hazard(h: HazardIn) -> TropCyclone:
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

    # grade grossa só na região em torno dos ativos
    cent = Centroids.from_exposures_locs([(e.lon, e.lat) for e in req.exposures], res=0.25)
    tc = TropCyclone.from_tracks(tr, centroids=cent)

    if h.climate_scenario == "RCP45":
        tc = tc.apply_climate_scenario_knu(ref_year=2050, rcp_scenario=45)
    elif h.climate_scenario == "RCP85":
        tc = tc.apply_climate_scenario_knu(ref_year=2050, rcp_scenario=85)

    return tc

def build_exposures(exps: List[ExposureIn]) -> Exposures:
    df = pd.DataFrame([e.dict() for e in exps])
    exp = Exposures(df.rename(columns={
        "lat": "latitude",
        "lon": "longitude",
        "value_usd": "value"
    }))
    exp.set_geometry_points()
    exp.gdf["impf_TC"] = 1
    return exp

# ---------- Rota principal ----------
@app.post("/api/calculate")
def calc(req: CalcRequest):
    # 1. hazard
    tc_haz = build_tc_hazard(req.hazard)

    # 2. exposures
    exp = build_exposures(req.exposures)

    # 3. impact functions (você pode calibrar por tipo)
    impf = ImpactFuncSet()
    base_if = ImpfTropCyclone.from_emanuel_usa()
    base_if.id = 1
    impf.append(base_if)

    # 4. impacto
    imp = Impact()
    imp.calc(exp, impf, tc_haz)

    # 5. métricas + resultados por ativo
    response = {
        "aal_usd": float(imp.aai_agg),
        "pml_200_usd": float(imp.calc_pml(return_periods=(200))[0]),
        "assets": [
            {
                "id": row["id"],
                "type": row["type"],
                "lat": row["latitude"],
                "lon": row["longitude"],
                "value_usd": row["value"],
                "damage_pct": float(imp.eai_exp[i] / row["value"] * 100) if row["value"] > 0 else 0
            }
            for i, row in exp.gdf.iterrows()
        ]
    }
    return response
