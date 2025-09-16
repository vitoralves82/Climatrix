import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { getDestinatarioByToken, submitResposta } from '../lib/esgApi';

export default function ResponderPage() {
  const router = useRouter();
  const token = useMemo(() => (router.query.token as string) || '', [router.query.token]);
  const [loading, setLoading] = useState(true);
  const [dest, setDest] = useState<{nome:string; email:string}|null>(null);
  const [erro, setErro] = useState<string|null>(null);

  // Exemplo simples de formulário; substitua pelos campos reais do app
  const [form, setForm] = useState<{[k:string]: any}>({ pergunta_1: '', pergunta_2: '' });
  const handleChange = (e: any) => setForm(s => ({ ...s, [e.target.name]: e.target.value }));

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const d = await getDestinatarioByToken(token);
        if (!d) throw new Error('Link inválido.');
        setDest({ nome: d.nome, email: d.email });
      } catch (e:any) {
        setErro(e.message || 'Erro ao validar link.');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const onSubmit = async (e:any) => {
    e.preventDefault();
    try {
      await submitResposta({ token, respostas: form });
      alert('Obrigado! Resposta enviada.');
      router.replace('/'); // redireciona após envio
    } catch (e:any) {
      alert(e.message || 'Falha ao enviar.');
    }
  };

  if (loading) return <p>Carregando…</p>;
  if (erro) return <p style={{color:'crimson'}}>{erro}</p>;
  return (
    <main style={{maxWidth:720, margin:'40px auto', padding:'0 16px'}}>
      <h1>Responder Formulário</h1>
      <p>Destinatário: <b>{dest?.nome}</b> ({dest?.email})</p>
      <form onSubmit={onSubmit} style={{display:'grid', gap:12}}>
        <label>Pergunta 1
          <input name="pergunta_1" value={form.pergunta_1} onChange={handleChange} required />
        </label>
        <label>Pergunta 2
          <input name="pergunta_2" value={form.pergunta_2} onChange={handleChange} />
        </label>
        <button type="submit">Enviar respostas</button>
      </form>
    </main>
  );
}
