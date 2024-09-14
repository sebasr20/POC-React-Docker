import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './components/Login';
import GestionViaje from './components/GestionViaje';
import RegistrarViaje from './components/RegistrarViaje';

const App = () => {
  const [token, setToken] = useState(null);

  const handleLoginSuccess = (token) => {
    setToken(token); // Guarda el token en el estado
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/gestion-viaje">Gestionar Viaje</Link>
            </li>
            <li>
              <Link to="/registrar-viaje">Registrar Viaje</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/gestion-viaje" element={<GestionViaje token={token}/>} />
          <Route path="/registrar-viaje" element={<RegistrarViaje />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
