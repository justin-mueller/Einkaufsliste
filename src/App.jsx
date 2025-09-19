import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Menu from './Menu';
import Page1 from './pages/Vorbereitung';
import Page2 from './pages/Einkaufen';
import Page3 from './pages/Artikel';
import Page4 from './pages/Rezepte';

function App() {
  return (
    <Router>
      <Menu />
      <div style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/Vorbereitung" replace />} />
          <Route path="/Vorbereitung" element={<Page1 />} />
          <Route path="/Einkaufen" element={<Page2 />} />
          <Route path="/Artikel" element={<Page3 />} />
          <Route path="/Rezepte" element={<Page4 />} />
          <Route path="*" element={<Page1 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
