// src/pages/GraficoPorTipoPage.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar
} from 'recharts';
import * as XLSX from 'xlsx'; // ★ IMPORTAÇÃO DO XLSX PARA GERAR O EXCEL
import styles from '../styles/GraficoPorTipoPage.module.css';
import 'react-datepicker/dist/react-datepicker.css';

export default function GraficoPorTipoPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1) Lê nomeCampus, tipoIndicador e idCampus vindos do state
  const nomeCampus = location.state?.nomeCampus || '—';
  const tipoIndicador = location.state?.tipoIndicador || '';
  const idCampus = location.state?.idCampus;

  // 2) Estado para armazenar todos os indicadores do tipo selecionado
  const [todosIndicadores, setTodosIndicadores] = useState([]);

  // 3) Estados para o DatePicker de início e fim (apenas o ano)
  const hoje = new Date();
  // Por padrão: anoInicioDate = ano passado, anoFimDate = ano atual
  const [anoInicioDate, setAnoInicioDate] = useState(
    new Date(hoje.getFullYear() - 1, 0, 1)
  );
  const [anoFimDate, setAnoFimDate] = useState(
    new Date(hoje.getFullYear(), 0, 1)
  );

  // 4) Estado para o array que o Recharts vai consumir (duas barras)
  const [dadosGrafico, setDadosGrafico] = useState([]);

  // 5) Ao montar, busca todos os indicadores (sem filtrar por campus)
  useEffect(() => {
    if (!tipoIndicador) return;

    fetch('https://utfprsustentavel.onrender.com/api/indicadores')
      .then(res => {
        if (!res.ok) throw new Error(`Erro ao buscar indicadores: ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Mantém apenas os itens do tipo selecionado
        const filtradosPorTipo = data.filter(ind => ind.tipo === tipoIndicador);
        setTodosIndicadores(filtradosPorTipo);

        // Gera o gráfico já com os dois anos padrão (ano passado e ano atual)
        gerarDadosGrafico(
          filtradosPorTipo,
          anoInicioDate.getFullYear(),
          anoFimDate.getFullYear()
        );
      })
      .catch(err => {
        console.error('Falha ao buscar indicadores:', err);
        setTodosIndicadores([]);
        setDadosGrafico([]);
      });
  }, [tipoIndicador]);

  // 6) Gera dados para o gráfico somando quantidades por ano de dataFinal
  const gerarDadosGrafico = (lista, anoInicio, anoFim) => {
    let somaInicio = 0;
    let somaFim    = 0;

    lista.forEach(ind => {
      // Agora “olha” para o ano de dataFinal, e não dataAtualizacao
      const anoFinal = new Date(ind.dataFinal).getFullYear();

      if (anoFinal === anoInicio) somaInicio += ind.quantidade || 0;
      else if (anoFinal === anoFim) somaFim += ind.quantidade || 0;
    });

    setDadosGrafico([
      { ano: String(anoInicio), quantidade: somaInicio },
      { ano: String(anoFim),    quantidade: somaFim    }
    ]);
  };

  // 7) Quando usuário clicar em “Pesquisar”, refaz o gráfico com os anos selecionados
  const handlePesquisar = () => {
    const anoIni = anoInicioDate.getFullYear();
    const anoFm  = anoFimDate.getFullYear();
    gerarDadosGrafico(todosIndicadores, anoIni, anoFm);
  };

  // 8) NOVA FUNÇÃO: Exportar os dados do gráfico para Excel
  const handleExportar = () => {
    if (!dadosGrafico || dadosGrafico.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }

    // 8.1) Converte nosso array de objetos “dadosGrafico” em uma worksheet
    const worksheet = XLSX.utils.json_to_sheet(dadosGrafico);

    // 8.2) Cria um novo workbook
    const workbook = XLSX.utils.book_new();

    // 8.3) Adiciona a worksheet ao workbook, com o nome “Dados”
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');

    // 8.4) Define o nome do arquivo final
    const fileName = `${tipoIndicador}_${nomeCampus}_grafico.xlsx`;

    // 8.5) Dispara o download no browser
    XLSX.writeFile(workbook, fileName);
  };

  // 9) Botão “Voltar” para a página de indicadores (mantendo idCampus e nomeCampus no state)
  const handleVoltar = () => {
    navigate('/indicadores', { state: { idCampus, nomeCampus } });
  };

  return (
    <div className={styles.container}>
      {/*** FILTRO DE ANOS (apenas ano) e BOTÕES “Pesquisar” + “Exportar” ***/}
      <div className={styles.dateFilter}>
        <label className={styles.labelDate}>
          Ano Início:
          <DatePicker
            selected={anoInicioDate}
            onChange={date => setAnoInicioDate(date)}
            showYearPicker
            dateFormat="yyyy"
            placeholderText="Selecione o ano"
          />
        </label>
        <label className={styles.labelDate}>
          Ano Fim:
          <DatePicker
            selected={anoFimDate}
            onChange={date => setAnoFimDate(date)}
            showYearPicker
            dateFormat="yyyy"
            placeholderText="Selecione o ano"
          />
        </label>

        <button className={styles.btnPesquisar} onClick={handlePesquisar}>
          Pesquisar
        </button>

        {/* Novo botão “Exportar” ao lado de Pesquisar */}
        <button className={styles.btnExportar} onClick={handleExportar}>
          Exportar
        </button>
      </div>

      {/*** BOTÃO PARA VOLTAR ***/}
      <button className={styles.btnVoltar} onClick={handleVoltar}>
        ← Voltar
      </button>

      {/*** TÍTULO COM TIPO DO INDICADOR E NOME DO CAMPUS ***/}
      <h2 className={styles.title}>
        {tipoIndicador} – {nomeCampus}
      </h2>

      {/*** GRÁFICO RECHARTS (duas barras: anoInicio e anoFim) ***/}
      {dadosGrafico.length === 2 ? (
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={dadosGrafico}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" />

              {/* Eixo X: “Ano” */}
              <XAxis dataKey="ano" tick={{ fontSize: 14 }} />

              {/* Eixo Y com formatação PT-BR */}
              <YAxis
                tickFormatter={value => value.toLocaleString('pt-BR')}
                tick={{ fontSize: 12 }}
              />

              {/* TOOLTIP: exibe valor formatado */}
              <Tooltip
                formatter={value => `${value.toLocaleString('pt-BR')}`}
                labelFormatter={label => `Ano: ${label}`}
              />

              {/* Legenda (só “Quantidade”) */}
              <Legend verticalAlign="top" height={36} />

              {/* Barra única: dataKey="quantidade" */}
              <Bar dataKey="quantidade" name="Quantidade" barSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className={styles.emptyMessage}>
          Não há dados disponíveis para o período selecionado.
        </p>
      )}
    </div>
  );
}
