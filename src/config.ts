const isProd =
  window.location.hostname === 'fluxoclean.com.br' ||
  window.location.hostname === 'www.fluxoclean.com.br';

export const FLUXOCLEAN_API = isProd
  ? 'https://api.fluxoclean.com.br/api'
  : 'https://api.local.fluxoclean.com.br/api';

export const FLUXOCLEAN_LOGIN = isProd
  ? 'https://fluxoclean.com.br/login'
  : 'https://app.local.fluxoclean.com.br/login';

export const FLUXOCLEAN_HOME = isProd
  ? 'https://fluxoclean.com.br'
  : 'https://app.local.fluxoclean.com.br';
