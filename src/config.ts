const isProd = (import.meta as any).env.PROD;

export const FLUXOCLEAN_API = isProd 
  ? 'https://api-fluxoclean.onrender.com/api' 
  : 'http://localhost:4000/api';

export const FLUXOCLEAN_LOGIN = isProd 
  ? 'https://fluxoclean.com.br/login' 
  : 'http://localhost:3000/login';

