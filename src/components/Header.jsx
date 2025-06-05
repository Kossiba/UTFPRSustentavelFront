import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Header.module.css';
import logo from '../assets/UTFPR - ID VISUAL HORIZONTAL-COLORIDA.png';

export default function Header() {
  return (
    <header className={styles.container}>
      <Link to="/">
        <img src={logo} alt="UTFPR Logo" className={styles.logo} />
      </Link>
      <h1 className={styles.title}>
        Portal de Indicadores de Sustentabilidade
      </h1>
      <nav>
        <Link to="/login" className={styles.login}>
          ENTRAR
        </Link>
      </nav>
    </header>
  );
}
