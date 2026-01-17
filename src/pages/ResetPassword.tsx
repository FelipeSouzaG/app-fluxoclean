
import React, { useState, useEffect, useMemo } from 'react';
import { checkPasswordStrength } from '../validation';
import NotificationModal from '../components/NotificationModal';
import { FLUXOCLEAN_API } from '../config';

const InvalidTokenModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 max-w-sm w-full text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 mb-4">
                    <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-red-400 mb-2">Token Inválido</h3>
                <p className="text-gray-300 text-sm mb-6">O link de recuperação expirou, é inválido ou já foi utilizado. Por favor, solicite uma nova recuperação.</p>
                <button onClick={onClose} className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                    OK
                </button>
            </div>
        </div>
    );
};

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showInvalidModal, setShowInvalidModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
      isOpen: false,
      type: 'success',
      message: ''
  });

  const token = window.location.pathname.split('/reset-password/')[1];

  useEffect(() => {
      const validate = async () => {
          try {
              const response = await fetch(`${FLUXOCLEAN_API}/auth/reset-password/${token}`);
              if (!response.ok) {
                  setShowInvalidModal(true);
              }
          } catch (error) {
              setShowInvalidModal(true);
          } finally {
              setLoading(false);
          }
      };
      if (token) validate();
      else setShowInvalidModal(true);
  }, [token]);

  // Validação de força da senha (Derivado, sem useEffect para evitar lag de estado)
  const passwordStrength = useMemo(() => checkPasswordStrength(password), [password]);
  const isPasswordValid = useMemo(() => Object.values(passwordStrength).every(Boolean), [passwordStrength]);
  
  // Validação de confirmação (Derivado)
  const passwordsMatch = useMemo(() => {
      if (!confirmPassword) return null; // Campo vazio
      return password === confirmPassword;
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setModalState({ isOpen: true, type: 'error', message: 'As senhas não coincidem. Verifique e tente novamente.' });
        return;
    }
    if (!isPasswordValid) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${FLUXOCLEAN_API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      
      const data = await response.json();
      if (response.ok) {
        setModalState({ isOpen: true, type: 'success', message: 'Sua senha foi redefinida com sucesso! Você será redirecionado para o login.' });
      } else {
        setModalState({ isOpen: true, type: 'error', message: data.message || 'Erro ao redefinir a senha.' });
      }
    } catch (error) {
      setModalState({ isOpen: true, type: 'error', message: 'Erro de conexão. Tente novamente.' });
    } finally {
        setSubmitting(false);
    }
  };

  const handleFeedbackClose = () => {
      setModalState({ ...modalState, isOpen: false });
      if (modalState.type === 'success') {
          window.location.href = '/login';
      }
  };

  const StrengthItem = ({ valid, text }: { valid: boolean, text: string }) => (
      <div className={`text-xs flex items-center gap-1 ${valid ? 'text-green-400' : 'text-gray-500'}`}>
          <span>{valid ? '✔' : '○'}</span> {text}
      </div>
  );

  const handleModalClose = () => {
      window.location.href = '/login';
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Verificando Token...</div>;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 relative">
      <a href="/" className="absolute top-6 left-6 flex items-center gap-2 hover:opacity-80 transition-opacity z-10">
         <div className="bg-indigo-600/20 p-1.5 rounded-lg border border-indigo-500/30">
            <img src='/img/fluxoclean.svg' alt="FluxoClean Logo" className="w-6 h-6" />
        </div>
        <span className="text-xl font-bold text-white">FluxoClean</span>
      </a>

      <InvalidTokenModal isOpen={showInvalidModal} onClose={handleModalClose} />
      
      <NotificationModal 
        isOpen={modalState.isOpen}
        type={modalState.type}
        message={modalState.message}
        onClose={handleFeedbackClose}
      />
      
      {!showInvalidModal && (
          <div className="bg-gray-800 border border-gray-700 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white">Nova Senha</h2>
                <p className="text-gray-400 mt-2">Defina sua nova senha segura.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="relative">
                    <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Nova Senha" 
                        required
                        className="bg-gray-900 border border-gray-600 text-white p-3.5 rounded-xl w-full focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-12 transition-all placeholder-gray-500"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
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
                <div className="mt-3 grid grid-cols-2 gap-2 bg-gray-700/30 p-3 rounded-lg border border-gray-700/50">
                    <StrengthItem valid={passwordStrength.length} text="Mín. 8 caracteres" />
                    <StrengthItem valid={passwordStrength.uppercase} text="Letra Maiúscula" />
                    <StrengthItem valid={passwordStrength.lowercase} text="Letra Minúscula" />
                    <StrengthItem valid={passwordStrength.number} text="Número" />
                    <StrengthItem valid={passwordStrength.symbol} text="Símbolo (!@#)" />
                </div>
              </div>

              <div>
                <div className="relative">
                    <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="Confirmar Nova Senha" 
                        required
                        className={`bg-gray-900 border text-white p-3.5 rounded-xl w-full focus:outline-none focus:ring-1 transition-all placeholder-gray-500 pr-12 
                            ${passwordsMatch === false ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-indigo-500 focus:ring-indigo-500'}
                            ${passwordsMatch === true ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : ''}
                        `}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-indigo-400 transition-colors"
                    >
                        {showConfirmPassword ? (
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
                {/* Validação Visual em tempo real */}
                {confirmPassword && (
                    <div className={`text-xs mt-1.5 font-bold flex items-center gap-1 ${passwordsMatch ? 'text-green-500' : 'text-red-500'}`}>
                        {passwordsMatch ? (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                As senhas conferem
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                As senhas não conferem
                            </>
                        )}
                    </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={submitting || !isPasswordValid || passwordsMatch !== true} 
                className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {submitting ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Atualizando...
                    </>
                ) : 'Atualizar Senha'}
              </button>
            </form>
          </div>
      )}
    </div>
  );
};

export default ResetPassword;
