
import React, { useState } from 'react';

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="container mx-auto p-6 relative z-50">
        <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-3">
                <div className="bg-indigo-600/20 p-2 rounded-lg border border-indigo-500/30">
                    <img src="/img/fluxoclean.svg" alt="FluxoClean Logo" className="w-6 h-6" />
                </div>
                FluxoClean
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
                <a href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Funcionalidades</a>
                <a href="#ecosystem" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Ecossistema</a>
                <a href="/login" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Login</a>
                <a href="/register" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm font-bold transition-all shadow-lg shadow-indigo-900/20">
                    Criar Conta
                </a>
            </div>

            {/* Mobile Menu Button */}
            <button 
                className="md:hidden text-gray-300 hover:text-white focus:outline-none"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
            <div className="md:hidden absolute top-20 left-0 w-full bg-gray-800/95 backdrop-blur-xl border-b border-gray-700 p-6 flex flex-col space-y-4 shadow-2xl animate-fade-in">
                <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-gray-200">Funcionalidades</a>
                <a href="#ecosystem" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-gray-200">Ecossistema</a>
                <hr className="border-gray-700"/>
                <a href="/login" className="text-lg font-medium text-indigo-400">Acessar Conta</a>
                <a href="/register" className="w-full py-3 bg-indigo-600 text-center rounded-lg font-bold text-white">Criar Conta Grátis</a>
            </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="container mx-auto px-6 pt-12 md:pt-24 pb-20 md:pb-32 text-center relative">
        {/* Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-indigo-600/20 rounded-full blur-[100px] md:blur-[120px] -z-10 animate-pulse"></div>
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 text-xs md:text-sm font-semibold mb-8 animate-fade-in backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Novo: IA Generativa para Varejo
        </div>

        <h1 className="text-4xl md:text-7xl font-bold mb-6 md:mb-8 leading-tight tracking-tight text-white">
          O Sistema Definitivo para <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
            Gestão de Lojas e Varejo
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed px-4">
          Abandone as planilhas. O <strong>Smart Store</strong> centraliza estoque, financeiro, vendas e clientes em uma única plataforma inteligente.
          <span className="block mt-4 text-gray-200 font-medium">Transforme dados em decisões precisas e impulsione seus resultados.</span>
        </p>
        
        <div className="flex flex-col md:flex-row justify-center gap-4 px-4">
            <a href="/register" className="px-8 py-4 bg-white text-indigo-900 text-lg font-bold rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-2">
                Começar Teste Grátis
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <a href="#features" className="px-8 py-4 bg-gray-800/50 border border-gray-700 backdrop-blur-md text-lg font-semibold rounded-xl hover:bg-gray-800 transition-all text-white flex items-center justify-center">
                Conhecer Recursos
            </a>
        </div>
        
        <p className="mt-8 text-xs md:text-sm text-gray-500 flex flex-col md:flex-row justify-center items-center gap-2 md:gap-6">
            <span className="flex items-center gap-1"><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Sem cartão de crédito</span>
            <span className="flex items-center gap-1"><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> 15 dias grátis</span>
            <span className="flex items-center gap-1"><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Cancelamento fácil</span>
        </p>
      </header>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-6 py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Tecnologia de ponta,<br/> <span className="text-indigo-400">simplicidade no uso.</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Ferramentas poderosas com design minimalista para que você foque no que importa: vender mais.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Feature 1 - POS */}
              <div className="bg-gray-800/50 border border-gray-700/50 p-8 rounded-3xl hover:border-indigo-500/50 transition-all hover:bg-gray-800 group">
                  <div className="w-14 h-14 bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-indigo-500/20">
                    <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">PDV Ágil</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">Frente de caixa ultrarrápida. Compatível com leitores de código de barras, emissão de comprovantes e controle de caixa em tempo real.</p>
              </div>

              {/* Feature 2 - Inventory */}
              <div className="bg-gray-800/50 border border-gray-700/50 p-8 rounded-3xl hover:border-cyan-500/50 transition-all hover:bg-gray-800 group">
                  <div className="w-14 h-14 bg-cyan-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-cyan-500/20">
                    <svg className="w-7 h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Estoque Inteligente</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">Controle total de entradas e saídas. Alertas automáticos de estoque baixo e análise de giro para evitar perdas.</p>
              </div>

              {/* Feature 3 - AI */}
              <div className="bg-gray-800/50 border border-gray-700/50 p-8 rounded-3xl hover:border-purple-500/50 transition-all hover:bg-gray-800 group">
                  <div className="w-14 h-14 bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-purple-500/20">
                    <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">IA Integrada</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">Nosso consultor virtual analisa seus dados e sugere promoções, compras e estratégias para maximizar seu lucro.</p>
              </div>

              {/* Feature 4 - Finance */}
              <div className="bg-gray-800/50 border border-gray-700/50 p-8 rounded-3xl hover:border-green-500/50 transition-all hover:bg-gray-800 group">
                  <div className="w-14 h-14 bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-green-500/20">
                    <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Financeiro Completo</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">Contas a pagar e receber, fluxo de caixa e DRE. Tenha clareza total sobre a saúde financeira do seu negócio.</p>
              </div>

              {/* Feature 5 - Customers */}
              <div className="bg-gray-800/50 border border-gray-700/50 p-8 rounded-3xl hover:border-orange-500/50 transition-all hover:bg-gray-800 group">
                  <div className="w-14 h-14 bg-orange-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-orange-500/20">
                    <svg className="w-7 h-7 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Fidelização</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">Cadastro de clientes com histórico de compras. Entenda quem compra mais e crie campanhas personalizadas.</p>
              </div>

               {/* Feature 6 - Service Order */}
               <div className="bg-gray-800/50 border border-gray-700/50 p-8 rounded-3xl hover:border-pink-500/50 transition-all hover:bg-gray-800 group">
                  <div className="w-14 h-14 bg-pink-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-pink-500/20">
                    <svg className="w-7 h-7 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Ordens de Serviço</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">Ideal para assistências técnicas e oficinas. Controle chamados, peças, mão de obra e status em um só lugar.</p>
              </div>
          </div>
      </section>

      {/* Ecosystem & Roadmap Section */}
      <section id="ecosystem" className="container mx-auto px-6 py-20 md:py-24 border-t border-gray-800">
        <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Ecossistema <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Smart</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Inteligência e fluxo limpo. Uma plataforma unificada projetada para escalar com o seu negócio.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Active Card - Smart Store */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-[24px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-gray-900 border border-gray-700 p-8 rounded-[22px] flex flex-col items-center text-center h-full">
                    <div className="absolute top-4 right-4 bg-green-500/10 text-green-400 text-[10px] font-bold px-3 py-1 rounded-full border border-green-500/20 uppercase tracking-wider">
                        Disponível
                    </div>
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-600/20 to-cyan-600/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30">
                         <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Smart Store</h3>
                    <p className="text-gray-400 mb-8 text-sm leading-relaxed">A solução completa para o varejo moderno. Simples, potente e inteligente.</p>
                    <a href="/register" className="mt-auto w-full py-3.5 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg transform hover:scale-[1.02] duration-200">
                        Acessar Sistema
                    </a>
                </div>
            </div>

            {/* Coming Soon - Smart Industry */}
            <div className="relative opacity-60 grayscale hover:grayscale-0 transition-all duration-500 group">
                <div className="bg-gray-800/40 border border-gray-700 h-full rounded-[22px] p-8 flex flex-col items-center text-center">
                    <div className="absolute top-4 right-4 bg-gray-700 text-gray-400 text-[10px] font-bold px-3 py-1 rounded-full border border-gray-600 tracking-wider">
                        EM BREVE
                    </div>
                    <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 text-cyan-500/50 group-hover:text-cyan-400 border border-gray-700 group-hover:border-cyan-500/30 transition-colors">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-300 group-hover:text-white mb-2 transition-colors">Smart Industry</h3>
                    <p className="text-gray-500 mb-6 text-sm leading-relaxed">PCP, gestão de chão de fábrica e manutenção industrial avançada.</p>
                    <div className="mt-auto w-full py-3 rounded-xl border border-dashed border-gray-600 text-xs font-semibold text-gray-500 uppercase tracking-widest">
                        Aguardem empreendedores da Indústria
                    </div>
                </div>
            </div>

            {/* Coming Soon - Smart Service */}
            <div className="relative opacity-60 grayscale hover:grayscale-0 transition-all duration-500 group">
                <div className="bg-gray-800/40 border border-gray-700 h-full rounded-[22px] p-8 flex flex-col items-center text-center">
                    <div className="absolute top-4 right-4 bg-gray-700 text-gray-400 text-[10px] font-bold px-3 py-1 rounded-full border border-gray-600 tracking-wider">
                        EM BREVE
                    </div>
                    <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 text-emerald-500/50 group-hover:text-emerald-400 border border-gray-700 group-hover:border-emerald-500/30 transition-colors">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-300 group-hover:text-white mb-2 transition-colors">Smart Service</h3>
                    <p className="text-gray-500 mb-6 text-sm leading-relaxed">Gestão de contratos, equipes de campo e recorrência para prestadores de serviço.</p>
                     <div className="mt-auto w-full py-3 rounded-xl border border-dashed border-gray-600 text-xs font-semibold text-gray-500 uppercase tracking-widest">
                        Aguardem empreendedores de Serviços
                    </div>
                </div>
            </div>
        </div>
      </section>
      
      {/* CTA Footer */}
      <section className="container mx-auto px-6 py-20 text-center">
          <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-[32px] p-8 md:p-16 relative overflow-hidden">
              <div className="relative z-10">
                  <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Pronto para revolucionar sua loja?</h2>
                  <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">Junte-se a centenas de lojistas que já simplificaram sua gestão com o sistema mais intuitivo do mercado.</p>
                  <a href="/register" className="inline-flex items-center px-10 py-4 bg-white text-indigo-900 text-lg font-bold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl">
                      Criar Conta Gratuita
                      <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </a>
              </div>
          </div>
      </section>

      <footer className="container mx-auto px-6 py-8 text-center text-gray-600 border-t border-gray-800 text-sm">
        <p>&copy; 2025 FluxoClean Sistemas. Feito com <span className="text-red-500">❤️</span> para o empreendedor brasileiro.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
