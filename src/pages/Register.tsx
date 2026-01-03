
import React, { useState } from 'react';
import { formatName, formatRegister, validateRegister, validateEmail, validateName } from '../validation';
import { FLUXOCLEAN_API, FLUXOCLEAN_HOME } from '../config';

// Simple Modal Component
interface ModalProps {
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
    onClose: () => void;
}

const NotificationModal: React.FC<ModalProps> = ({ isOpen, type, message, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6 max-w-sm w-full transform transition-all scale-100">
                <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${type === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                    {type === 'success' ? (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    ) : (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                </div>
                <h3 className={`text-lg leading-6 font-bold text-center mb-2 ${type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {type === 'success' ? 'Email Enviado!' : 'Atenção'}
                </h3>
                <p className="text-sm text-gray-300 text-center mb-6">
                    {message}
                </p>
                <button
                    onClick={onClose}
                    className={`w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-colors ${
                         type === 'success' 
                         ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                         : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                >
                    {type === 'success' ? 'Entendi, vou checar' : 'Fechar'}
                </button>
            </div>
        </div>
    );
};

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    document: '',
    systemType: 'commerce', // Default
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ companyName?: string; document?: string; email?: string }>({});
  
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
      isOpen: false,
      type: 'success',
      message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      
      if (name === 'document') {
          const formatted = formatRegister(value);
          setFormData(prev => ({ ...prev, [name]: formatted }));
          if (errors.document) setErrors(prev => ({ ...prev, document: undefined }));
      } else {
          setFormData(prev => ({ ...prev, [name]: value }));
          if (name in errors) setErrors(prev => ({ ...prev, [name]: undefined }));
      }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      if (name === 'companyName') {
          const formatted = formatName(value);
          setFormData(prev => ({ ...prev, [name]: formatted }));
          if (!validateName(formatted) && value.trim() !== '') {
               setErrors(prev => ({ ...prev, [name]: 'Nome muito curto ou inválido.' }));
          }
      }

      if (name === 'document') {
          if (!validateRegister(value) && value.trim() !== '') {
              setErrors(prev => ({ ...prev, document: 'CPF ou CNPJ inválido.' }));
          }
      }

      if (name === 'email') {
          if (!validateEmail(value) && value.trim() !== '') {
              setErrors(prev => ({ ...prev, email: 'Formato de e-mail inválido.' }));
          }
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: any = {};
    if (!validateName(formData.companyName)) newErrors.companyName = 'Nome da empresa inválido.';
    if (!validateRegister(formData.document)) newErrors.document = 'CPF/CNPJ inválido.';
    if (!validateEmail(formData.email)) newErrors.email = 'E-mail inválido.';
    
    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${FLUXOCLEAN_API}/auth/pre-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (response.ok) {
        setModalState({ 
            isOpen: true, 
            type: 'success', 
            message: 'Verifique sua caixa de entrada (e spam) para confirmar seu cadastro e criar sua senha.' 
        });
        // Form is conceptually "done", user must check email.
      } else {
        setModalState({ isOpen: true, type: 'error', message: data.message || 'Erro ao iniciar cadastro.' });
      }
    } catch (error) {
      setModalState({ isOpen: true, type: 'error', message: 'Erro ao conectar com o servidor central.' });
    } finally {
        setLoading(false);
    }
  };

  const handleCloseModal = () => {
      if (modalState.type === 'success') {
          // Clean form and redirect to landing page
          setFormData({ companyName: '', document: '', systemType: 'commerce', email: '' });
          window.location.href = FLUXOCLEAN_HOME;
      }
      setModalState({ ...modalState, isOpen: false });
  };

  const systemOptions = [
      {
          id: 'commerce', 
          label: 'Smart Store', 
          active: true,
          icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
      }, 
      {
          id: 'industry', 
          label: 'Indústria', 
          active: false,
          icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
      }, 
      {
          id: 'services', 
          label: 'Serviços', 
          active: false,
          icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] -z-10"></div>

      <a href="/" className="relative mb-8 self-start md:absolute md:top-6 md:left-6 md:mb-0 md:self-auto flex items-center gap-3 hover:opacity-80 transition-opacity z-20">
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

      <div className="bg-gray-800 border border-gray-700 p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-lg relative">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Criar Conta</h2>
            <p className="text-gray-400">Passo 1: Identificação da Empresa</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Selecione o Sistema</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {systemOptions.map(type => (
                <button
                  key={type.id}
                  type="button"
                  disabled={!type.active}
                  onClick={() => type.active && setFormData({...formData, systemType: type.id})}
                  className={`py-4 px-3 rounded-xl border flex flex-col items-center justify-center transition-all relative overflow-hidden group ${
                    formData.systemType === type.id
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/50 ring-1 ring-indigo-400' 
                    : type.active 
                        ? 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                        : 'bg-gray-800/50 border-gray-700/50 text-gray-600 cursor-not-allowed opacity-60'
                  }`}
                >
                  {!type.active && (
                    <div className="absolute top-2 right-2 bg-gray-800 text-[8px] px-1.5 py-0.5 rounded text-gray-500 font-bold border border-gray-700 tracking-tight">EM BREVE</div>
                  )}
                  <span className={`mb-2 ${formData.systemType === type.id ? 'text-white' : type.active ? 'text-indigo-400' : 'text-gray-600'}`}>
                      {type.icon}
                  </span>
                  <span className="text-sm font-bold">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
             <div>
                <input 
                  type="text" name="companyName" placeholder="Nome da Empresa" required
                  className={`bg-gray-900 border ${errors.companyName ? 'border-red-500' : 'border-gray-600'} text-white p-3.5 rounded-xl w-full focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-gray-500`}
                  value={formData.companyName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                {errors.companyName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.companyName}</p>}
             </div>
             
             <div>
                <input 
                  type="text" name="document" placeholder="CPF ou CNPJ" required
                  className={`bg-gray-900 border ${errors.document ? 'border-red-500' : 'border-gray-600'} text-white p-3.5 rounded-xl w-full focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-gray-500`}
                  value={formData.document}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                {errors.document && <p className="text-red-500 text-xs mt-1 ml-1">{errors.document}</p>}
             </div>

            <div>
                <input 
                    type="email" name="email" placeholder="Seu Melhor E-mail" required
                    className={`bg-gray-900 border ${errors.email ? 'border-red-500' : 'border-gray-600'} text-white p-3.5 rounded-xl w-full focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-gray-500`}
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
            </div>
            
            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30 text-xs text-blue-300">
                <p><strong>Importante:</strong> Enviaremos um link para este e-mail para validar seu cadastro e criar sua senha de acesso.</p>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 text-white text-lg font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center">
            {loading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verificando...
                </>
            ) : 'Continuar'}
          </button>
        </form>
        
        <p className="text-center text-gray-500 mt-8 text-sm">
            Já tem uma conta? <a href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline transition-all">Fazer Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
