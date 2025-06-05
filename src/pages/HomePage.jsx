import React, { useEffect, useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/HomePage.module.css';
import logo from '../assets/UTFPR - ID VISUAL HORIZONTAL-COLORIDA.png';

export default function HomePage() {
  const { campus, setCampus } = useCampus();  
  const navigate = useNavigate();
  const [campusList, setCampusList] = useState([]);

  useEffect(() => {
    fetch('https://utfprsustentavel.onrender.com/api/campuses')
      .then((response) => {
        if (!response.ok) throw new Error(`Erro ao buscar campi: ${response.status}`);
        return response.json();
      })
      .then((data) => setCampusList(data))
      .catch((err) => console.error('Erro no fetch dos campi:', err));
  }, []);

  const handleSelect = (e) => {
    const selectedId = e.target.value;
    const foundCampus = campusList.find((c) => c.idCampus === selectedId);

    if (foundCampus) {
      setCampus(foundCampus);
    } else {
      setCampus(null);
    }
  };

  const handleConfirm = () => {
    if (campus) {
      navigate('/indicadores', {
        state: {
          idCampus: campus.idCampus,
          nomeCampus: campus.nome
        }
      });
    } else {
      alert('Por favor, selecione um campus antes de confirmar.');
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <img src={logo} alt="UTFPR Logo" className={styles.logo} />

        <select
          value={campus?.idCampus || ''}
          onChange={handleSelect}
          className={styles.select}
        >
          <option value="">— Escolha um campus —</option>
          {campusList.map((c) => (
            <option key={c.idCampus} value={c.idCampus}>
              {c.nome}
            </option>
          ))}
        </select>

        <button
          className={`
            ${styles.button} 
            ${campus ? styles.buttonEnabled : styles.buttonDisabled}
          `}
          disabled={!campus}
          onClick={handleConfirm}
        >
          Confirmar
        </button>
      </main>
    </div>
  );
}
