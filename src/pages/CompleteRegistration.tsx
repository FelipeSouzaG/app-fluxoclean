
import React, { useState, useEffect } from 'react';
import { checkPasswordStrength, validateName, formatName } from '../validation';
import { FLUXOCLEAN_API, FLUXOCLEAN_HOME } from '../config';

interface ModalProps {
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
    onClose?: () => void;
}

const NotificationModal: React.FC<ModalProps> = ({ isOpen, type, message, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
                <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${type === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                    {type === 'success' ? '✓' : '!'}
                </div>
                <h3 className={`text-lg leading-6 font-bold text-center mb-2 ${type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {type === 'success' ? 'Sucesso!' : 'Erro'}
                </h3>
                <p className="text-sm text-gray-300 text-center mb-6">{message}</p>
                {onClose && (
                     <button onClick={onClose} className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">Fechar</button>
                )}
            </div>
        </div>
    );
};

const StrengthItem = ({ valid, text }: { valid: boolean, text: string }) => (
    <div className={`text-xs flex items-center gap-1 ${valid ? 'text-green-400' : 'text-gray-500'}`}>
        <span>{valid ? '✔' : '○'}</span> {text}
    </div>
);

const CompleteRegistration: React.FC = () => {
    const [token, setToken] = useState<string | null>(null);
    
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [tenantData, setTenantData] = useState<any>(null);
    
    // Form
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // Validation
    const [passwordStrength, setPasswordStrength] = useState(checkPasswordStrength(''));
    const [error, setError] = useState('');
    const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
        isOpen: false, type: 'success', message: ''
    });

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenParam = urlParams.get('token');
        setToken(tokenParam);

        if (!tokenParam) {
            setModalState({ isOpen: true, type: 'error', message: 'Link inválido ou token ausente.' });
            setLoading(false);
            return;
        }
        
        const validate = async () => {
            try {
                const res = await fetch(`${FLUXOCLEAN_API}/auth/validate-registration`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: tokenParam })
                });
                const data = await res.json();
                
                if (res.ok && data.valid) {
                    setTenantData(data.data);
                } else {
                    setModalState({ isOpen: true, type: 'error', message: data.message || 'Link expirado.' });
                }
            } catch (e) {
                setModalState({ isOpen: true, type: 'error', message: 'Erro de conexão.' });
            } finally {
                setLoading(false);
            }
        };
        validate();
    }, []);

    useEffect(() => {
        setPasswordStrength(checkPasswordStrength(password));
    }, [password]);

    const handleCloseModal = () => {
        setModalState({ ...modalState, isOpen: false });
        if (modalState.type === 'error' && !tenantData) {
            // Redirect to home if validation failed (token expired/invalid)
            window.location.href = FLUXOCLEAN_HOME;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!validateName(userName)) {
            setError('Nome inválido.');
            return;
        }
        
        const isPasswordValid = Object.values(passwordStrength).every(Boolean);
        if (!isPasswordValid) {
            setError('Senha não atende aos requisitos.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`${FLUXOCLEAN_API}/auth/complete-registration`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, userName: formatName(userName), password })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setModalState({ 
                    isOpen: true, 
                    type: 'success', 
                    message: 'Conta ativada! Redirecionando para o sistema...' 
                });
                setTimeout(() => {
                    window.location.href = `${data.redirectUrl}?code=${data.code}`;
                }, 2000);
            } else {
                setModalState({ isOpen: true, type: 'error', message: data.message || 'Erro ao criar conta.' });
                setSubmitting(false);
            }
        } catch (e) {
            setModalState({ isOpen: true, type: 'error', message: 'Erro ao conectar.' });
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Validando...</div>;

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 relative overflow-hidden">
             {/* Background Decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-green-600/10 rounded-full blur-[120px] -z-10"></div>

            <NotificationModal isOpen={modalState.isOpen} type={modalState.type} message={modalState.message} onClose={handleCloseModal} />
            
            {tenantData && (
                <div className="bg-gray-800 border border-gray-700 p-8 rounded-3xl shadow-2xl w-full max-w-lg">
                    <div className="flex items-center gap-3 justify-center mb-8">
                        <div className="bg-indigo-600/20 p-1.5 rounded-lg border border-indigo-500/30">
                            <img src='/img/fluxoclean.svg' alt="FluxoClean Logo" className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Finalizar Cadastro</h1>
                    </div>

                    <div className="bg-gray-900/50 p-4 rounded-xl mb-6 border border-gray-700 space-y-2">
                        <h3 className="text-gray-400 text-xs uppercase font-bold">Dados da Empresa (Validados)</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="block text-gray-500 text-xs">Empresa</span>
                                <span className="text-white font-medium">{tenantData.companyName}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 text-xs">CNPJ/CPF</span>
                                <span className="text-white font-medium">{tenantData.document}</span>
                            </div>
                             <div>
                                <span className="block text-gray-500 text-xs">E-mail</span>
                                <span className="text-white font-medium">{tenantData.email}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 text-xs">Endereço do Sistema</span>
                                <span className="text-cyan-400 font-mono">{tenantData.tenantName}.fluxoclean...</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Seu Nome Completo</label>
                            <input 
                                type="text" 
                                value={userName} 
                                onChange={e => setUserName(e.target.value)} 
                                required 
                                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Ex: João Silva"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Crie sua Senha de Acesso</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 pr-10 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Mínimo 8 caracteres"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-gray-500 hover:text-white"
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

                        {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}

                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Ativando...' : 'Ativar Minha Conta'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CompleteRegistration;
