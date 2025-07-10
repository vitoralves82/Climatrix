{
  "hazard": {
    "type": "TC",              // “Furacão”, por enquanto só tropical cyclone
    "start_lat": 25.0,
    "start_lon": -75.0,
    "wind_speed": 150,         // km/h
    "radius_max_wind": 200,    // km
    "translation_speed": 30,   // km/h
    "track_angle": 45,         // graus (0 = Leste → Oeste)
    "central_pressure": 950,   // hPa
    "duration_hours": 4,       // quanto tempo simular
    "climate_scenario": "RCP45" // "CURRENT" | "RCP45" | "RCP85"
  },

  "exposures": [
    { "id": "FPSO-001", "type": "FPSO",        "lat": 25.4, "lon": -74.8, "value_usd": 380000000 },
    { "id": "DRILL-002","type": "Plataforma",  "lat": 24.9, "lon": -75.2, "value_usd": 250000000 }
    // …quantos forem necessários
  ]
}
