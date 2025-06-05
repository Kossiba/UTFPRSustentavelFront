import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/LoginPage.module.css';
import logoImage from '../assets/UTFPR - ID VISUAL HORIZONTAL-COLORIDA.png';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  const isFormValid = username.trim() !== '' && password.trim() !== '';

  const handleLogin = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch(
        'https://utfprsustentavel.onrender.com/api/users/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: username.trim(),
            password: password.trim()
          })
        }
      );

      if (response.status === 200) {
        const user = await response.json(); 
        console.log('Login efetuado:', user);
        alert('Login efetuado');
        navigate('/');
      } else if (response.status === 401) {
        setErrorMsg('Usuário ou senha inválidos.');
      } else {
        throw new Error(`Erro inesperado: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao autenticar:', error);
      setErrorMsg('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <img src={logoImage} alt="UTFPR Logo" className={styles.logo} />

        <div className={styles.inputGroup}>
          <label htmlFor="username">Usuário</label>
          <input
            id="username"
            type="text"
            value={username}
            placeholder="Digite seu usuário"
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            placeholder="Digite sua senha"
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}

        <button
          className={`${styles.button} ${
            isFormValid ? styles.buttonEnabled : styles.buttonDisabled
          }`}
          disabled={!isFormValid || isLoading}
          onClick={handleLogin}
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </div>
    </div>
  );
}
