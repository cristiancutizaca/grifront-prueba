import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode, JwtPayload } from 'jwt-decode';

// Interfaz personalizada que incluye el campo "role"
interface MyJwtPayload extends JwtPayload {
  role: 'superadmin' | 'admin' | 'seller' | string;
}

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      });

      if (response.data.access_token) {
        const token = response.data.access_token;
        localStorage.setItem("authToken", response.data.access_token);
        toast.success('Inicio de sesión exitoso');

        // Decodificar el token con tipo
        const decodedToken = jwtDecode<MyJwtPayload>(token);
        const userRole = decodedToken.role;

        // Redireccionar según el rol
        switch (userRole) {
          case 'superadmin':
            navigate('/superadmin-dashboard');
            break;
          case 'admin':
            navigate('/admin-dashboard');
            break;
          case 'seller':
            navigate('/seller-dashboard');
            break;
          default:
            navigate('/dashboard');
            break;
        }
      } else {
        toast.error('Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      toast.error('Error de inicio de sesión');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form" method="post">
        <h2>Iniciar Sesión</h2>
        <div className="form-group">
          <label htmlFor="username">Usuario:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default Login;
