export default function App() {
  fetch('/impact.geojson')
    .then(r => {
      console.log('Status fetch:', r.status);   // deve ser 200
      return r.text();
    })
    .then(txt => console.log('Primeiras linhas do GeoJSON:', txt.slice(0,120)))
    .catch(err => console.error('Erro no fetch:', err));

  return <h1 style={{color:'orange'}}>Teste fetch no console → F12</h1>;
}
