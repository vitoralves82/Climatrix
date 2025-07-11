from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Literal
from climada.hazard import TCTracks, TropCyclone, Centroids
from climada.entity import Exposures, ImpactFuncSet, ImpfTropCyclone
from climada.engine import Impact
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point


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
    
    # Criar DataFrame com os dados
    data = []
    for e in exp_list:
        data.append({
            'latitude': e.lat,
            'longitude': e.lon,
            'value': e.value_usd,
            'id': e.id,
            'category': e.type
        })
    
    df = pd.DataFrame(data)
    
    # Criar geometria Point para cada linha
    geometry = [Point(row['longitude'], row['latitude']) for _, row in df.iterrows()]
    
    # Criar GeoDataFrame
    gdf = gpd.GeoDataFrame(df, geometry=geometry, crs='epsg:4326')
    
    # Criar objeto Exposures e atribuir o GeoDataFrame
    exp = Exposures()
    exp.gdf = gdf
    
    return exp

# ----- rota principal -----
@app.post("/api/calculate")
def calc(req: CalcRequest):
    exp = build_exposures(req.exposures)
    tc = build_tc_hazard(
        req.hazard, 
        list(zip([e.lon for e in req.exposures], [e.lat for e in req.exposures]))
    )

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
              "type": row.category,
              "lat": row.latitude,
              "lon": row.longitude,
              "value_usd": row.value,
              "damage_pct": round(float(imp.eai_exp[i]/row.value*100), 2)
            }
            for i, row in exp.gdf.iterrows()
        ]
    }
