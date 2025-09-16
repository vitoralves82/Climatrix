import { useCallback } from 'react';
import { addDestinatarios, createProjeto, listRespostasPorProjeto, validarResposta } from '@/lib/esgApi';

type DestinatarioInput = { nome: string; cargo?: string; email: string; token?: string };

type UseProjetoHandlersParams = {
  onLinksGerados?: (links: { email: string; token: string; link: string }[]) => void;
};

export function useProjetoHandlers(params: UseProjetoHandlersParams = {}) {
  const handleSalvarProjeto = useCallback(
    async ({ nomeProjeto, nomeCliente, destinatariosLista }: { nomeProjeto: string; nomeCliente: string; destinatariosLista: DestinatarioInput[] }) => {
      const projeto = await createProjeto({ nome_projeto: nomeProjeto, nome_cliente: nomeCliente });
      const { links } = await addDestinatarios(projeto.id, destinatariosLista);
      params.onLinksGerados?.(links);
      return { projetoId: projeto.id, links };
    },
    [params],
  );

  return { handleSalvarProjeto };
}

export function useConsultaHandlers() {
  const carregarRespostas = useCallback(async (projetoId: string) => {
    return await listRespostasPorProjeto(projetoId);
  }, []);

  const marcarValidado = useCallback(async (respostaId: string, valor = true) => {
    await validarResposta(respostaId, valor);
  }, []);

  return { carregarRespostas, marcarValidado };
}
