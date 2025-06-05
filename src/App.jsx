// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import IndicadoresPage from './pages/IndicadoresPage';
import GraficoPorTipoPage from './pages/GraficoPorTipoPage';
import IndicadoresListPage from './pages/IndicadoresListPage';
import NovoIndicadorPage from './pages/NovoIndicadorPage';

export default function App() {
  return (
    <>
      <Header />
      <main className="p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/indicadores" element={<IndicadoresPage />} />
          <Route path="/indicadores/lista" element={<IndicadoresListPage />} />
          <Route path="/indicadores/grafico" element={<GraficoPorTipoPage />} />
          <Route path="/indicadores/novo" element={<NovoIndicadorPage />} />

          <Route path="*" element={<h2>Página não encontrada</h2>} />
        </Routes>
      </main>
    </>
  );
}
