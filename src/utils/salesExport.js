import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabaseClient';
import { STATUS_CONFIG } from '../data/statusConfig';
import { BARRIS } from '../data/pricing';

// Busca todas as reservas direto da tabela (não usa o hook useMesasState
// porque este é só um snapshot pontual para exportação, sem precisar de
// realtime).
export async function fetchVendas() {
  const { data, error } = await supabase.from('reservas').select('*').order('numero', { ascending: true });
  if (error) throw error;
  return data || [];
}

function formatDataHora(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('pt-BR');
}

export function gerarPlanilhaVendas(rows) {
  const linhas = rows.map((row) => {
    const barril50 = Number(row.barril_50) || 0;
    const barril30 = Number(row.barril_30) || 0;
    return {
      Mesa: row.numero,
      Status: STATUS_CONFIG[row.status]?.label || row.status || '',
      Comprador: row.comprador || '',
      WhatsApp: row.telefone || '',
      [BARRIS.b50.label]: barril50 || '',
      [BARRIS.b30.label]: barril30 || '',
      'Valor (R$)': row.valor != null ? Number(row.valor) : '',
      Observação: row.observacao || '',
      'Comprovante nº': row.comprovante_codigo || '',
      'Atualizado em': formatDataHora(row.updated_at),
    };
  });

  const totalArrecadado = rows
    .filter((r) => r.status === 'PAGO')
    .reduce((sum, r) => sum + (Number(r.valor) || 0), 0);
  const totalAReceber = rows
    .filter((r) => r.status === 'RESERVADO')
    .reduce((sum, r) => sum + (Number(r.valor) || 0), 0);
  const totalBarril50 = rows.reduce((sum, r) => sum + (Number(r.barril_50) || 0), 0);
  const totalBarril30 = rows.reduce((sum, r) => sum + (Number(r.barril_30) || 0), 0);

  const resumo = [
    { Indicador: 'Mesas com registro', Valor: rows.length },
    { Indicador: 'Arrecadado (pago)', Valor: totalArrecadado },
    { Indicador: 'A receber (reservado)', Valor: totalAReceber },
    { Indicador: BARRIS.b50.label, Valor: totalBarril50 },
    { Indicador: BARRIS.b30.label, Valor: totalBarril30 },
  ];

  const wb = XLSX.utils.book_new();
  const wsVendas = XLSX.utils.json_to_sheet(linhas);
  const wsResumo = XLSX.utils.json_to_sheet(resumo);
  XLSX.utils.book_append_sheet(wb, wsVendas, 'Vendas');
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');
  return wb;
}

export async function baixarVendasExcel() {
  const rows = await fetchVendas();
  const wb = gerarPlanilhaVendas(rows);
  const dataHoje = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `baile-do-chopp-vendas-${dataHoje}.xlsx`);
  return rows.length;
}
