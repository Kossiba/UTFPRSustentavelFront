// src/pages/NovoIndicadorPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/NovoIndicadorPage.module.css';

export default function NovoIndicadorPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Pega idCampus e nomeCampus que vieram no state
  const idCampus = location.state?.idCampus;
  const nomeCampus = location.state?.nomeCampus || '—';

  // Estados para cada campo do formulário
  const [tipo, setTipo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [medida, setMedida] = useState('');
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');

  const [submetendo, setSubmetendo] = useState(false);
  const [erro, setErro] = useState('');

  // Se não tiver idCampus no state, volta para a lista
  useEffect(() => {
    if (!idCampus) {
      navigate('/indicadores');
    }
  }, [idCampus, navigate]);

  // Handler para enviar o novo indicador ao backend
  const handleCriar = async (e) => {
    e.preventDefault();

    // Validações mínimas
    if (
      !tipo.trim() ||
      !descricao.trim() ||
      quantidade === '' ||
      !medida.trim() ||
      !dataInicial ||
      !dataFinal
    ) {
      setErro('Todos os campos são obrigatórios.');
      return;
    }

    setErro('');
    setSubmetendo(true);

    const payload = {
      idCampus: idCampus,
      tipo: tipo.trim(),
      descricao: descricao.trim(),
      quantidade: Number(quantidade),
      medida: medida.trim(),
      dataInicial,
      dataFinal
    };

    try {
      const res = await fetch('https://utfprsustentavel.onrender.com/api/indicadores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }

      // Ao criar com sucesso, redireciona para a lista daquele campus
      navigate('/indicadores/', {
        state: { idCampus, nomeCampus }
      });
    } catch (err) {
      console.error('Erro ao criar indicador:', err);
      setErro('Falha ao criar. Tente novamente.');
      setSubmetendo(false);
    }
  };

  const handleCancelar = () => {
    navigate('/indicadores/', {
      state: { idCampus, nomeCampus }
    });
  };

  return (
    <div className={styles.container}>
      <button className={styles.btnVoltar} onClick={handleCancelar}>
        ← Voltar
      </button>

      <h2 className={styles.title}>
        Novo indicador – {nomeCampus}
      </h2>

      <form className={styles.formWrapper} onSubmit={handleCriar}>
        {erro && <p className={styles.errorMessage}>{erro}</p>}

        <div className={styles.formGroup}>
          <label htmlFor="tipo">Tipo</label>
          <input
            id="tipo"
            type="text"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            placeholder="Ex.: energia, papel, copo..."
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="descricao">Descrição</label>
          <input
            id="descricao"
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva brevemente o indicador"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="quantidade">Quantidade</label>
          <input
            id="quantidade"
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            placeholder="Ex.: 1000"
            min="0"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="medida">Medida</label>
          <input
            id="medida"
            type="text"
            value={medida}
            onChange={(e) => setMedida(e.target.value)}
            placeholder="Ex.: kWh, Resma, Tonelada..."
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="dataInicial">Data Inicial</label>
          <input
            id="dataInicial"
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="dataFinal">Data Final</label>
          <input
            id="dataFinal"
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
            required
          />
        </div>

        <div className={styles.buttonsContainer}>
          <button
            type="button"
            className={styles.btnCancelar}
            onClick={handleCancelar}
            disabled={submetendo}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.btnCriar}
            disabled={submetendo}
          >
            {submetendo ? 'Criando...' : 'Criar indicador'}
          </button>
        </div>
      </form>
    </div>
  );
}
