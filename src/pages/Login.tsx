
import React, { useState } from 'react';
import { FLUXOCLEAN_API } from '../config';
import NotificationModal from '../components/NotificationModal';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
      isOpen: false,
      type: 'success',
      message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${FLUXOCLEAN_API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include' // Important for Superadmin Cookie
      });
      const data = await response.json();
      
      if (response.ok) {
        // Redirecionamento baseado na role
        if (data.user.role === 'superadmin') {
            window.location.href = '/superadmin';
        } else {
            // Fluxo Tenant: Redireciona com CODE (Handshake)
            window.location.href = `${data.redirectUrl}?code=${data.code}`;
        }
      } else {
        setModalState({ isOpen: true, type: 'error', message: data.message || 'Falha no login.' });
      }
    } catch (error) {
      setModalState({ isOpen: true, type: 'error', message: 'Erro ao conectar com o servidor.' });
    } finally {
        setLoading(false);
    }
  };

  const handleCloseModal = () => {
      setModalState({ ...modalState, isOpen: false });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 relative">
      {/* Back to Home */}
      <a href="/" className="absolute top-6 left-6 flex items-center gap-2 hover:opacity-80 transition-opacity z-10">
        <div className="bg-indigo-600/20 p-1.5 rounded-lg border border-indigo-500/30">
            <img src='./src/img/fluxoclean.svg' alt="FluxoClean Logo" className="w-6 h-6" />
        </div>
        <span className="text-xl font-bold text-white">FluxoClean</span>
      </a>

      <NotificationModal 
        isOpen={modalState.isOpen} 
        type={modalState.type} 
        message={modalState.message} 
        onClose={handleCloseModal} 
      />

      <div className="bg-gray-800 border border-gray-700 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Acessar Painel</h2>
            <p className="text-gray-400 mt-2">Gerencie seu negócio de qualquer lugar</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input 
                type="email" placeholder="Seu E-mail" required
                className="bg-gray-900 border border-gray-600 text-white p-3.5 rounded-xl w-full focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-gray-500"
                onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <div className="relative">
              <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Sua Senha" 
                  required
                  className="bg-gray-900 border border-gray-600 text-white p-3.5 rounded-xl w-full focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-12 transition-all placeholder-gray-500"
                  onChange={e => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-indigo-400 transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zM9 4.803A7.968 7.968 0 0110 5c3.453 0 6.545 2.057 7.938 5.127a9.406 9.406 0 01-1.394 2.531l-1.493-1.493A3.013 3.013 0 0012.015 9.5l-1.07-1.071A5.004 5.004 0 009 4.803zM4.83 5.06A9.95 9.95 0 00.458 10c1.274 4.057 5.064 7 9.542 7a9.95 9.95 0 004.18-1.031l-1.424-1.424A5.013 5.013 0 0110.01 13a5 5 0 01-4.242-4.242l-1.939-1.94z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
            <div className="text-right">
                <a href="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">Esqueci minha senha</a>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
            {loading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Entrando...
                </>
            ) : 'Entrar'}
          </button>
        </form>
        
        <p className="text-center text-gray-500 mt-8 text-sm">
            Ainda não tem conta? <a href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline transition-colors">Teste Grátis</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
