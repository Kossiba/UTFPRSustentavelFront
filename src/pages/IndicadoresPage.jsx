// src/pages/IndicadoresPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/IndicadoresPage.module.css';

export default function IndicadoresPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialState = location.state || {};

  // 1) Estado para campus atual
  const [currentCampus, setCurrentCampus] = useState({
    idCampus: initialState.idCampus || '',
    nomeCampus: initialState.nomeCampus || '',
  });
  const [campusList, setCampusList] = useState([]);

  // 2) Indicadores brutos vindos da API
  const [rawIndicadores, setRawIndicadores] = useState([]);

  // 3) Indicadores já filtrados/agrupados para exibir nos cards
  const [indicadores, setIndicadores] = useState([]);

  // 4) Estado para o ano selecionado (inicialmente o ano corrente)
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());

  // 5) Se não veio idCampus/nomeCampus, volta pra Home
  useEffect(() => {
    if (!initialState.idCampus || !initialState.nomeCampus) {
      navigate('/');
    }
  }, [initialState, navigate]);

  // 6) Busca lista de campi ao montar
  useEffect(() => {
    fetch('https://utfprsustentavel.onrender.com/api/campuses')
      .then(res => {
        if (!res.ok) throw new Error(`Erro ao buscar campi: ${res.status}`);
        return res.json();
      })
      .then(data => setCampusList(data))
      .catch(err => {
        console.error('Falha no fetch de campi:', err);
        setCampusList([]);
      });
  }, []);

  // Função reutilizável para filtrar+agrupar pelo ano
  const filtrarPorAno = (dadosBrutos, ano) => {
    if (!dadosBrutos.length || !ano) {
      setIndicadores([]);
      return;
    }

    const filtradosPorAno = dadosBrutos.filter(ind => {
      const anoIni = new Date(ind.dataInicial).getFullYear();
      const anoFim = new Date(ind.dataFinal).getFullYear();
      return anoIni === Number(ano) && anoFim === Number(ano);
    });

    const somaPorTipo = filtradosPorAno.reduce((acc, ind) => {
      if (!acc[ind.tipo]) {
        acc[ind.tipo] = {
          tipo: ind.tipo,
          quantidade: ind.quantidade || 0,
          descricao: ind.descricao,
          medida: ind.medida,
        };
      } else {
        acc[ind.tipo].quantidade += ind.quantidade || 0;
      }
      return acc;
    }, {});

    setIndicadores(Object.values(somaPorTipo));
  };

  // 7) Quando muda currentCampus.idCampus, busca os indicadores brutos
  useEffect(() => {
    const campusId = currentCampus.idCampus;
    if (!campusId) {
      setRawIndicadores([]);
      setIndicadores([]);
      return;
    }

    fetch(`https://utfprsustentavel.onrender.com/api/indicadores/campus/${campusId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Erro ao buscar indicadores: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setRawIndicadores(data);
        // dispara filtragem automática para o anoAtual
        filtrarPorAno(data, anoSelecionado);
      })
      .catch(err => {
        console.error('Falha ao buscar indicadores:', err);
        setRawIndicadores([]);
        setIndicadores([]);
      });
  }, [currentCampus.idCampus]);

  // 8) Se o usuário trocar apenas o ano após os rawIndicadores já estarem carregados
  useEffect(() => {
    if (rawIndicadores.length) {
      filtrarPorAno(rawIndicadores, anoSelecionado);
    }
  }, [anoSelecionado]);

  // 9) ao clicar “Pesquisar”, reaplica filtro (útil caso queira manter o clique manual)
  const handlePesquisarAno = () => {
    filtrarPorAno(rawIndicadores, anoSelecionado);
  };

  // 10) Quando mudar de campus (select), limpa indicadores e reseta ano
  const handleCampusChange = (e) => {
    const novoId = e.target.value;
    const selecionado = campusList.find(c => c.idCampus === novoId) || null;

    if (selecionado) {
      setCurrentCampus({ idCampus: selecionado.idCampus, nomeCampus: selecionado.nome });
    } else {
      setCurrentCampus({ idCampus: '', nomeCampus: '' });
      setIndicadores([]);
    }
    setAnoSelecionado(new Date().getFullYear());
  };

  // 11) Ao clicar num card, leva à página de gráfico “por tipo”
  const handleCardClick = (ind) => {
    navigate('/indicadores/grafico', {
      state: {
        tipoIndicador: ind.tipo,
        idCampus: currentCampus.idCampus,
        nomeCampus: currentCampus.nomeCampus
      }
    });
  };

  return (
    <div className={styles.container}>
      {/* === 1. <select> para trocar de campus === */}
      <div className={styles.divFirst}>
        <label htmlFor="campus-select" className={styles.label}>
          Selecione um Campus
        </label>
        <select
          id="campus-select"
          className={styles.select}
          value={currentCampus.idCampus}
          onChange={handleCampusChange}
        >
          <option value="">— Selecione um campus —</option>
          {campusList.map(c => (
            <option key={c.idCampus} value={c.idCampus}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>

      {/* === 2. Campo para selecionar o ano e botão Pesquisar === */}
      <div className={styles.divYearFilter}>
        <input
          id="ano-input"
          type="number"
          className={styles.inputYear}
          value={anoSelecionado}
          onChange={e => setAnoSelecionado(e.target.value)}
          min="1900"
          max="2100"
        />
        <button
          className={styles.btnPesquisar}
          onClick={handlePesquisarAno}
        >
          Pesquisar
        </button>
      </div>

      {/* === 3. Título centralizado + botões à direita === */}
      <div className={styles.divSecond}>
        <h2 className={styles.title}>
          Indicadores – {currentCampus.nomeCampus}
        </h2>

        <div className={styles.buttonsRight}>
          <button
            className={styles.btnEditarIndicadores}
            onClick={() =>
              navigate('/indicadores/lista', {
                state: {
                  idCampus: currentCampus.idCampus,
                  nomeCampus: currentCampus.nomeCampus
                }
              })
            }
          >
            Editar índices
          </button>

          <button
            className={styles.btnNovoIndicador}
            onClick={() =>
              navigate('/indicadores/novo', {
                state: {
                  idCampus: currentCampus.idCampus,
                  nomeCampus: currentCampus.nomeCampus
                }
              })
            }
          >
            Novo indicador
          </button>
        </div>
      </div>

      {/* === 4. Grid de cards de indicadores (até 4 por linha) === */}
      <div className={styles.gridContainer}>
        {indicadores.map(ind => (
          <div
            key={ind.tipo}
            className={styles.card}
            style={{ cursor: 'pointer' }}
            onClick={() => handleCardClick(ind)}
          >
            <h3 className={styles.cardHeader}>{ind.tipo}</h3>
            <div className={styles.cardValue}>
              {ind.quantidade.toLocaleString('pt-BR')}
            </div>
            <div className={styles.cardFooter}>
              {ind.descricao}
              {ind.medida && ` (${ind.medida})`}
            </div>
          </div>
        ))}

        {indicadores.length === 0 && (
          <div className={styles.emptyMessage}>
            Nenhum indicador encontrado para este campus no ano {anoSelecionado}.
          </div>
        )}
      </div>
    </div>
  );
}
