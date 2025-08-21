// src/utils/auth.ts
export const getToken = () => sessionStorage.getItem('token');
export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const { jwtDecode } = require('jwt-decode');
    const decoded: any = jwtDecode(token);
    return decoded.role || decoded.rol || 'seller';
  } catch {
    return null;
  }
};


// Nuevo: obtener user_id del JWT
export const getUserId = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const { jwtDecode } = require("jwt-decode");
    const decoded: any = jwtDecode(token);
    // Soporta varias claims comunes
    return decoded.user_id ?? decoded.id ?? decoded.sub ?? null;
  } catch {
    return null;
  }
};

