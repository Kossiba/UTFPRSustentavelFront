// src/pages/IndicadoresListPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/IndicadoresListPage.module.css';

export default function IndicadoresListPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const idCampus   = location.state?.idCampus;
  const nomeCampus = location.state?.nomeCampus || '—';

  const [indicadores, setIndicadores] = useState([]);
  const [carregando, setCarregando]   = useState(true);

  // Guarda qual célula (linha+campo) está sendo editada, e seu valor temporário
  // { id: idIndicador, campo: 'tipo'|'descricao'|..., valor: string }
  const [editando, setEditando] = useState({
    id: null,
    campo: null,
    valor: ''
  });

  // NOVO ESTADO: tipagens únicas para popular o <select>
  const [tiposDisponiveis, setTiposDisponiveis] = useState([]);

  // NOVO ESTADO: armazena qual “tipo” o usuário selecionou no filtro
  // String vazia = mostrar todos
  const [selectedTipo, setSelectedTipo] = useState('');

  // 1) Se não tiver idCampus, volta para /indicadores
  useEffect(() => {
    if (!idCampus) {
      navigate('/indicadores');
    }
  }, [idCampus, navigate]);

  // 2) Busca indicadores ao montar, ordena por “tipo”
  useEffect(() => {
    if (!idCampus) return;

    setCarregando(true);
    fetch(`https://utfprsustentavel.onrender.com/api/indicadores/campus/${idCampus}`)
      .then(res => {
        if (!res.ok) throw new Error(`Erro: ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Ordena alfabeticamente pelo campo "tipo"
        const ordenado = data.slice().sort((a, b) =>
          a.tipo.localeCompare(b.tipo, 'pt', { sensitivity: 'base' })
        );
        setIndicadores(ordenado);
        setCarregando(false);

        // Preenche “tiposDisponiveis” com valores únicos de “tipo”
        const tiposUnicos = Array.from(
          new Set(data.map(item => item.tipo))
        ).sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }));
        setTiposDisponiveis(tiposUnicos);
      })
      .catch(err => {
        console.error('Falha ao buscar indicadores:', err);
        setIndicadores([]);
        setCarregando(false);
        setTiposDisponiveis([]);
      });
  }, [idCampus]);

  // 3) Quando o usuário clica numa célula para editar, guarda { id, campo, valor }
  const iniciarEdicao = (idIndicador, campo, valorAtual) => {
    setEditando({ id: idIndicador, campo, valor: valorAtual ?? '' });
  };

  // 4) Quando o usuário digita, atualiza só a tabela localmente (sem tocar no back)
  const aoDigitar = (idIndicador, campo, novoValor) => {
    setEditando(prev => ({ ...prev, valor: novoValor }));
    setIndicadores(prev =>
      prev.map(i =>
        i.idIndicador === idIndicador
          ? {
              ...i,
              [campo]:
                campo === 'quantidade' || campo === 'valor'
                  ? Number(novoValor)
                  : novoValor
            }
          : i
      )
    );
  };

  // 5) Quando o usuário pressiona “Enter” durante a edição, ou clica fora (onBlur),
  //    apenas saímos do modo de edição, sem chamar API.
  const terminarEdicao = () => {
    setEditando({ id: null, campo: null, valor: '' });
  };

  // 6) Botão “Alterar”: envia TODOS os campos alterados (linha completa) ao servidor
  const handleAlterar = async (row) => {
    // Monta o payload “completo” com TODOS os campos do row
    const payload = {
      tipo: row.tipo,
      descricao: row.descricao,
      quantidade: Number(row.quantidade),
      medida: row.medida,
      dataInicial: row.dataInicial,
      dataFinal: row.dataFinal
      // (O campo dataAtualizacao pode ser deixado para o back atualizar automaticamente)
    };

    try {
      const res = await fetch(
        `https://utfprsustentavel.onrender.com/api/indicadores/${row.idIndicador}`,
        {
          method: 'PUT', // ou "PATCH" completo, conforme sua API
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) throw new Error(`Status ${res.status}`);

      // Atualiza localmente (já está igual ao payload, mas só para reforçar)
      setIndicadores(prev =>
        prev.map(i =>
          i.idIndicador === row.idIndicador ? { ...i, ...payload } : i
        )
      );
      alert('Registro atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao alterar registro:', err);
      alert('Falha ao alterar. Tente novamente.');
    }
  };

  // 7) Botão “Excluir”: chama DELETE e, se der certo, remove da lista
  const handleExcluir = async (idIndicador) => {
    if (!window.confirm('Tem certeza que deseja excluir este indicador?')) {
      return;
    }
    try {
      const res = await fetch(
        `https://utfprsustentavel.onrender.com/api/indicadores/${idIndicador}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error(`Status ${res.status}`);

      setIndicadores(prev =>
        prev.filter(i => i.idIndicador !== idIndicador)
      );

      // Também removemos do conjunto de tipos, caso tenha sido o último daquela categoria:
      const restoTipos = indicadores
        .filter(i => i.idIndicador !== idIndicador)
        .map(i => i.tipo);
      const novosUnicos = Array.from(new Set(restoTipos));
      setTiposDisponiveis(novosUnicos);
    } catch (err) {
      console.error('Erro ao excluir indicador:', err);
      alert('Falha ao excluir. Tente novamente.');
    }
  };

  // 8) Voltar para tela de cards
  const handleVoltar = () => {
    navigate('/indicadores', { state: { idCampus, nomeCampus } });
  };

  // 9) Filtra a lista de indicadores localmente pelo “selectedTipo”
  const indicadoresFiltrados = selectedTipo
    ? indicadores.filter(i => i.tipo === selectedTipo)
    : indicadores;

  return (
    <div className={styles.container}>
      <button className={styles.btnVoltar} onClick={handleVoltar}>
        ← Voltar
      </button>

      <h2 className={styles.title}>
        Indicadores em {nomeCampus}
      </h2>

      {carregando && <p>Carregando dados…</p>}

      {!carregando && indicadores.length === 0 && (
        <p className={styles.emptyMessage}>
          Não há nenhum indicador cadastrado para este campus.
        </p>
      )}

      {!carregando && indicadores.length > 0 && (
        <>
          {/*** FILTRO “Tipo” ***/}
          <div className={styles.filtroTipoContainer}>
            <label htmlFor="filtro-tipo" className={styles.labelFiltro}>
              Filtrar por tipo:
            </label>
            <select
              id="filtro-tipo"
              className={styles.selectFiltro}
              value={selectedTipo}
              onChange={e => setSelectedTipo(e.target.value)}
            >
              <option value="">— Todos —</option>
              {tiposDisponiveis.map(tipo => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          {/*** TABELA ***/}
          <div className={styles.tableWrapper}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Quantidade</th>
                  <th>Medida</th>
                  <th>Data Inicial</th>
                  <th>Data Final</th>
                  <th>Atualizado em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {indicadoresFiltrados.map(ind => (
                  <tr key={ind.idIndicador}>
                    {/* COLUNA “Tipo” */}
                    <td
                      onClick={() =>
                        iniciarEdicao(ind.idIndicador, 'tipo', ind.tipo)
                      }
                      style={{ cursor: 'pointer' }}
                    >
                      {editando.id === ind.idIndicador &&
                      editando.campo === 'tipo' ? (
                        <input
                          type="text"
                          value={editando.valor}
                          onChange={e =>
                            aoDigitar(
                              ind.idIndicador,
                              'tipo',
                              e.target.value
                            )
                          }
                          onBlur={terminarEdicao}
                          onKeyDown={e => {
                            if (e.key === 'Enter') terminarEdicao();
                            if (e.key === 'Escape') terminarEdicao();
                          }}
                          autoFocus
                        />
                      ) : (
                        ind.tipo
                      )}
                    </td>

                    {/* COLUNA “Descrição” */}
                    <td
                      onClick={() =>
                        iniciarEdicao(
                          ind.idIndicador,
                          'descricao',
                          ind.descricao
                        )
                      }
                      style={{ cursor: 'pointer' }}
                    >
                      {editando.id === ind.idIndicador &&
                      editando.campo === 'descricao' ? (
                        <input
                          type="text"
                          value={editando.valor}
                          onChange={e =>
                            aoDigitar(
                              ind.idIndicador,
                              'descricao',
                              e.target.value
                            )
                          }
                          onBlur={terminarEdicao}
                          onKeyDown={e => {
                            if (e.key === 'Enter') terminarEdicao();
                            if (e.key === 'Escape') terminarEdicao();
                          }}
                          autoFocus
                        />
                      ) : (
                        ind.descricao
                      )}
                    </td>

                    {/* COLUNA “Quantidade” */}
                    <td
                      onClick={() =>
                        iniciarEdicao(
                          ind.idIndicador,
                          'quantidade',
                          ind.quantidade
                        )
                      }
                      style={{ cursor: 'pointer' }}
                    >
                      {editando.id === ind.idIndicador &&
                      editando.campo === 'quantidade' ? (
                        <input
                          type="number"
                          value={editando.valor}
                          onChange={e =>
                            aoDigitar(
                              ind.idIndicador,
                              'quantidade',
                              e.target.value
                            )
                          }
                          onBlur={terminarEdicao}
                          onKeyDown={e => {
                            if (e.key === 'Enter') terminarEdicao();
                            if (e.key === 'Escape') terminarEdicao();
                          }}
                          autoFocus
                        />
                      ) : (
                        ind.quantidade?.toLocaleString('pt-BR')
                      )}
                    </td>

                    {/* COLUNA “Medida” */}
                    <td
                      onClick={() =>
                        iniciarEdicao(ind.idIndicador, 'medida', ind.medida)
                      }
                      style={{ cursor: 'pointer' }}
                    >
                      {editando.id === ind.idIndicador &&
                      editando.campo === 'medida' ? (
                        <input
                          type="text"
                          value={editando.valor}
                          onChange={e =>
                            aoDigitar(ind.idIndicador, 'medida', e.target.value)
                          }
                          onBlur={terminarEdicao}
                          onKeyDown={e => {
                            if (e.key === 'Enter') terminarEdicao();
                            if (e.key === 'Escape') terminarEdicao();
                          }}
                          autoFocus
                        />
                      ) : (
                        ind.medida
                      )}
                    </td>

                    {/* COLUNA “Data Inicial” */}
                    <td
                      onClick={() =>
                        iniciarEdicao(
                          ind.idIndicador,
                          'dataInicial',
                          ind.dataInicial
                        )
                      }
                      style={{ cursor: 'pointer' }}
                    >
                      {editando.id === ind.idIndicador &&
                      editando.campo === 'dataInicial' ? (
                        <input
                          type="date"
                          value={editando.valor}
                          onChange={e =>
                            aoDigitar(
                              ind.idIndicador,
                              'dataInicial',
                              e.target.value
                            )
                          }
                          onBlur={terminarEdicao}
                          onKeyDown={e => {
                            if (e.key === 'Enter') terminarEdicao();
                            if (e.key === 'Escape') terminarEdicao();
                          }}
                          autoFocus
                        />
                      ) : (
                        ind.dataInicial
                      )}
                    </td>

                    {/* COLUNA “Data Final” */}
                    <td
                      onClick={() =>
                        iniciarEdicao(ind.idIndicador, 'dataFinal', ind.dataFinal)
                      }
                      style={{ cursor: 'pointer' }}
                    >
                      {editando.id === ind.idIndicador &&
                      editando.campo === 'dataFinal' ? (
                        <input
                          type="date"
                          value={editando.valor}
                          onChange={e =>
                            aoDigitar(
                              ind.idIndicador,
                              'dataFinal',
                              e.target.value
                            )
                          }
                          onBlur={terminarEdicao}
                          onKeyDown={e => {
                            if (e.key === 'Enter') terminarEdicao();
                            if (e.key === 'Escape') terminarEdicao();
                          }}
                          autoFocus
                        />
                      ) : (
                        ind.dataFinal
                      )}
                    </td>

                    {/* COLUNA “Atualizado em” */}
                    <td
                      onClick={() =>
                        iniciarEdicao(
                          ind.idIndicador,
                          'dataAtualizacao',
                          ind.dataAtualizacao.slice(0, 10)
                        )
                      }
                      style={{ cursor: 'pointer' }}
                    >
                      {editando.id === ind.idIndicador &&
                      editando.campo === 'dataAtualizacao' ? (
                        <input
                          type="date"
                          value={editando.valor}
                          onChange={e =>
                            aoDigitar(
                              ind.idIndicador,
                              'dataAtualizacao',
                              e.target.value
                            )
                          }
                          onBlur={terminarEdicao}
                          onKeyDown={e => {
                            if (e.key === 'Enter') terminarEdicao();
                            if (e.key === 'Escape') terminarEdicao();
                          }}
                          autoFocus
                        />
                      ) : (
                        new Date(ind.dataAtualizacao).toLocaleString('pt-BR')
                      )}
                    </td>

                    {/* COLUNA “Ações”: Alterar (verde) + Excluir (vermelho) */}
                    <td className={styles.colAcoes}>
                      <button
                        className={styles.btnAlterar}
                        onClick={() => handleAlterar(ind)}
                      >
                        Alterar
                      </button>
                      <button
                        className={styles.btnExcluir}
                        onClick={() => handleExcluir(ind.idIndicador)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
