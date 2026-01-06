const hostname = window.location.hostname;

// Considera produção se for o domínio oficial OU o domínio técnico do Cloudflare Pages
const isProd = hostname === 'fluxoclean.com.br' || 
               hostname === 'www.fluxoclean.com.br' || 
               hostname.endsWith('.pages.dev');

export const FLUXOCLEAN_API = isProd
  ? 'https://api.fluxoclean.com.br/api'
  : 'https://api.local.fluxoclean.com.br/api';

export const FLUXOCLEAN_LOGIN = isProd
  ? 'https://fluxoclean.com.br/login'
  : 'https://app.local.fluxoclean.com.br/login';

export const FLUXOCLEAN_HOME = isProd
  ? 'https://fluxoclean.com.br'
  : 'https://app.local.fluxoclean.com.br';
