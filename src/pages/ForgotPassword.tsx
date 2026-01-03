
import React, { useState } from 'react';
import NotificationModal from '../components/NotificationModal';
import { FLUXOCLEAN_API } from '../config';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
      isOpen: false,
      type: 'success',
      message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${FLUXOCLEAN_API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setModalState({ isOpen: true, type: 'error', message: data.message || 'Erro ao processar solicitação.' });
      }
    } catch (error) {
      setModalState({ isOpen: true, type: 'error', message: 'Erro ao conectar com o servidor. Verifique sua internet.' });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 relative">
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
        onClose={() => setModalState({ ...modalState, isOpen: false })}
      />

      <div className="bg-gray-800 border border-gray-700 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Recuperar Senha</h2>
            <p className="text-gray-400 mt-2">Insira seu e-mail para receber o link de redefinição.</p>
        </div>
        
        {submitted ? (
            <div className="text-center space-y-6 animate-fade-in">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-900/30 mb-4 border border-green-500/30">
                    <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <div className="bg-green-900/10 border border-green-800 text-green-200 p-4 rounded-xl text-sm leading-relaxed">
                    <p>Se o e-mail <strong>{email}</strong> estiver cadastrado, você receberá um link com o token de segurança em instantes.</p>
                </div>
                <a href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hover:underline">
                    Voltar para o Login
                </a>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
            <input 
                type="email" placeholder="Seu E-mail" required
                className="bg-gray-900 border border-gray-600 text-white p-3.5 rounded-xl w-full focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-gray-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />

            <button type="submit" disabled={loading} className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50 flex justify-center items-center">
                {loading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                    </>
                ) : 'Enviar Link de Recuperação'}
            </button>
            
            <div className="text-center">
                <a href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Cancelar e voltar</a>
            </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
