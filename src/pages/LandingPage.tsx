
import React, { useState } from 'react';

// Componente Visual do Mockup do Dashboard (CSS Puro)
const DashboardMockup = () => (
    <div className="relative mx-auto max-w-5xl mt-12 mb-20 animate-fade-in-up">
        {/* Glow Effect Behind */}
        <div className="absolute -inset-1 bg-linear-to-r from-indigo-600 to-cyan-500 rounded-2xl blur opacity-30"></div>
        
        {/* Window Container */}
        <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
            {/* Window Header */}
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="ml-4 bg-gray-900 rounded-md px-3 py-1 text-[10px] text-gray-500 font-mono w-64 border border-gray-700 flex justify-between items-center">
                    <span>app.fluxoclean.com.br/dashboard</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </div>
            </div>

            {/* Dashboard Content Mock */}
            <div className="flex">
                {/* Sidebar Mock */}
                <div className="w-48 bg-gray-800/50 border-r border-gray-700 p-4 hidden md:block h-[400px]">
                    <div className="space-y-3">
                        <div className="h-2 w-20 bg-gray-700 rounded mb-6"></div>
                        <div className="h-8 w-full bg-indigo-600/20 border border-indigo-500/30 rounded-lg flex items-center px-2"><div className="h-2 w-16 bg-indigo-400/50 rounded"></div></div>
                        <div className="h-8 w-full rounded flex items-center px-2"><div className="h-2 w-24 bg-gray-700 rounded"></div></div>
                        <div className="h-8 w-full rounded flex items-center px-2"><div className="h-2 w-20 bg-gray-700 rounded"></div></div>
                        <div className="h-8 w-full rounded flex items-center px-2"><div className="h-2 w-16 bg-gray-700 rounded"></div></div>
                    </div>
                </div>

                {/* Main Area Mock */}
                <div className="flex-1 bg-gray-900 p-6 grid grid-cols-3 gap-4">
                    {/* KPI Cards */}
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <div className="h-2 w-12 bg-gray-600 rounded mb-2"></div>
                        <div className="h-6 w-24 bg-green-500/80 rounded"></div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <div className="h-2 w-12 bg-gray-600 rounded mb-2"></div>
                        <div className="h-6 w-24 bg-indigo-500/80 rounded"></div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <div className="h-2 w-12 bg-gray-600 rounded mb-2"></div>
                        <div className="h-6 w-24 bg-purple-500/80 rounded"></div>
                    </div>

                    {/* Chart Area */}
                    <div className="col-span-3 bg-gray-800/50 border border-gray-700 rounded-lg p-4 h-48 flex items-end justify-between gap-2">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                            <div key={i} className="w-full bg-indigo-600/40 hover:bg-indigo-500/60 transition-colors rounded-t-sm" style={{height: `${h}%`}}></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-800">
            <button 
                className="w-full py-4 text-left flex justify-between items-center focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-gray-200 font-medium">{question}</span>
                <span className={`text-indigo-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 pb-4' : 'max-h-0'}`}>
                <p className="text-gray-400 text-sm leading-relaxed pr-8">{answer}</p>
            </div>
        </div>
    );
};

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="container mx-auto p-6 relative z-50">
        <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-400 flex items-center gap-3">
                <div className="bg-indigo-600/20 p-2 rounded-lg border border-indigo-500/30">
                    <img src='/img/fluxoclean.svg' alt="FluxoClean Logo" className="w-6 h-6" />
                </div>
                FluxoClean
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Recursos</a>
                <a href="#ecosystem" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Planos</a>
                <a href="#faq" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Dúvidas</a>
                <div className="flex items-center gap-3 ml-4 border-l border-gray-700 pl-6">
                    <a href="/login" className="text-sm font-bold text-white hover:text-indigo-300 transition-colors">Entrar</a>
                    <a href="/register" className="px-5 py-2.5 bg-white text-indigo-900 rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105">
                        Começar Agora
                    </a>
                </div>
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
            <div className="md:hidden absolute top-20 left-0 w-full bg-gray-900/95 backdrop-blur-xl border-b border-gray-700 p-6 flex flex-col space-y-4 shadow-2xl animate-fade-in z-50">
                <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-gray-200">Recursos</a>
                <a href="#ecosystem" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-gray-200">Planos</a>
                <hr className="border-gray-700"/>
                <a href="/login" className="text-lg font-medium text-indigo-400">Login</a>
                <a href="/register" className="w-full py-3 bg-indigo-600 text-center rounded-lg font-bold text-white">Criar Conta Grátis</a>
            </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="container mx-auto px-6 pt-12 md:pt-20 pb-10 text-center relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-800/80 border border-gray-700 text-indigo-300 text-xs font-semibold mb-8 animate-fade-in backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            IA Generativa integrada ao seu negócio
        </div>

        <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight tracking-tight text-white max-w-4xl mx-auto">
          Gestão Inteligente que <br/>
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-400 to-cyan-400">
            Escala com Você
          </span>
        </h1>
        
        <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
           Controle estoque, financeiro e vendas em uma única plataforma intuitiva, projetada para o varejo moderno.
        </p>
        
        <div className="flex flex-col md:flex-row justify-center gap-4 px-4 mb-16">
            <a href="/register" className="px-8 py-4 bg-white text-indigo-900 text-lg font-bold rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transform hover:-translate-y-1 flex items-center justify-center gap-2">
                Começar Grátis
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <a href="#features" className="px-8 py-4 bg-gray-800/50 border border-gray-700 backdrop-blur-md text-lg font-semibold rounded-xl hover:bg-gray-800 transition-all text-white flex items-center justify-center">
                Ver na Prática
            </a>
        </div>

        <DashboardMockup />

        {/* Trust Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-gray-800 py-8 max-w-5xl mx-auto">
            <div className="text-center">
                <p className="text-2xl font-bold text-white">99.9%</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Uptime Garantido</p>
            </div>
            <div className="text-center">
                <p className="text-2xl font-bold text-white">LGPD</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Dados Seguros</p>
            </div>
            <div className="text-center">
                <p className="text-2xl font-bold text-white">SSL</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Criptografia Ponta-a-Ponta</p>
            </div>
            <div className="text-center">
                <p className="text-2xl font-bold text-white">24/7</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Monitoramento</p>
            </div>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Tudo o que sua loja precisa</h2>
            <p className="text-gray-400">Sem inchaço, sem complexidade. Apenas as ferramentas essenciais.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                  { title: "PDV Ágil", desc: "Frente de caixa rápida compatível com leitores de código de barras.", icon: "zap", color: "indigo" },
                  { title: "Estoque em Tempo Real", desc: "Alertas automáticos de ruptura e sugestão de compras.", icon: "box", color: "cyan" },
                  { title: "IA Consultiva", desc: "Receba insights diários sobre onde cortar custos e como vender mais.", icon: "brain", color: "purple" },
                  { title: "Financeiro DRE", desc: "Visão clara de lucro líquido, margem de contribuição e ponto de equilíbrio.", icon: "chart", color: "green" },
                  { title: "Ordens de Serviço", desc: "Controle status, peças e mão de obra para assistências.", icon: "tool", color: "pink" },
                  { title: "E-commerce Integrado", desc: "Transforme seu estoque físico em uma loja virtual em um clique.", icon: "shop", color: "orange" },
              ].map((feature, idx) => (
                  <div key={idx} className="bg-gray-800/40 border border-gray-700/50 p-8 rounded-2xl hover:bg-gray-800 hover:border-gray-600 transition-all group cursor-default">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-${feature.color}-900/20 text-${feature.color}-400 border border-${feature.color}-500/20 group-hover:scale-110 transition-transform`}>
                        {/* Simple Icon Placeholder based on feature list */}
                        <div className={`h-6 w-6 bg-${feature.color}-500 rounded-sm opacity-80`}></div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
              ))}
          </div>
      </section>

      {/* Ecosystem Section */}
      <section id="ecosystem" className="bg-gray-800/30 py-20 border-y border-gray-800">
        <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/2">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Comece Pequeno,<br/><span className="text-indigo-400">Cresça Gigante.</span></h2>
                    <p className="text-gray-400 mb-8 text-lg">
                        O FluxoClean não é apenas um software, é uma plataforma evolutiva. Comece com nossa versão Trial gratuita e migre para um ambiente exclusivo (Single-Tenant) quando sua operação escalar, sem perder dados.
                    </p>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-gray-300">
                            <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">✓</span>
                            Banco de Dados Isolado (Plano Exclusive)
                        </li>
                        <li className="flex items-center gap-3 text-gray-300">
                            <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">✓</span>
                            Domínio Próprio (sua-loja.com.br)
                        </li>
                        <li className="flex items-center gap-3 text-gray-300">
                            <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">✓</span>
                            API Aberta para Integrações
                        </li>
                    </ul>
                    <a href="/register" className="text-indigo-400 font-bold hover:text-indigo-300 inline-flex items-center gap-2">
                        Ver planos disponíveis <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </a>
                </div>
                <div className="md:w-1/2 relative">
                     <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full"></div>
                     <div className="relative bg-gray-900 border border-gray-700 p-8 rounded-2xl shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-white">Smart Store Exclusive</h3>
                            <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded font-bold uppercase">Recomendado</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                                <span className="text-gray-400">Infraestrutura Dedicada</span>
                                <span className="text-white font-bold">Incluso</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                                <span className="text-gray-400">Loja Virtual Integrada</span>
                                <span className="text-white font-bold">Incluso</span>
                            </div>
                            <div className="flex justify-between items-center pb-2">
                                <span className="text-gray-400">Suporte Prioritário</span>
                                <span className="text-white font-bold">WhatsApp</span>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                            <p className="text-sm text-gray-500 mb-1">A partir de</p>
                            <p className="text-3xl font-black text-white">R$ 197<span className="text-sm font-normal text-gray-500">/mês</span></p>
                            <p className="text-xs text-green-500 mt-2 font-bold">Teste grátis por 15 dias. Sem compromisso.</p>
                        </div>
                     </div>
                </div>
            </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="container mx-auto px-6 py-20 max-w-3xl">
          <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Perguntas Frequentes</h2>
              <p className="text-gray-400">Tire suas dúvidas antes de começar.</p>
          </div>
          <div className="space-y-2">
              <FAQItem 
                question="Preciso de cartão de crédito para testar?" 
                answer="Não. Você tem 15 dias de acesso total gratuito sem precisar informar nenhum dado de pagamento. Só pagará se decidir continuar." 
              />
              <FAQItem 
                question="O sistema funciona em celular e tablet?" 
                answer="Sim! O FluxoClean é 100% responsivo e funciona perfeitamente em qualquer dispositivo com navegador, seja PC, Mac, Android ou iOS." 
              />
              <FAQItem 
                question="Meus dados estão seguros?" 
                answer="Absolutamente. Utilizamos criptografia de ponta a ponta e backups automáticos diários. No plano Exclusive, você tem um banco de dados isolado apenas para sua empresa." 
              />
              <FAQItem 
                question="Posso cancelar a qualquer momento?" 
                answer="Sim. Não há fidelidade ou multa de cancelamento. Você é livre para ir e vir quando quiser." 
              />
          </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-6 py-20 text-center border-t border-gray-800">
          <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Sua loja merece uma gestão profissional.</h2>
              <p className="text-lg text-gray-400 mb-10">Junte-se a centenas de lojistas que transformaram o caos em lucro.</p>
              <a href="/register" className="inline-flex items-center px-10 py-5 bg-white text-indigo-900 text-xl font-bold rounded-xl hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-xl shadow-indigo-900/20">
                  Criar Minha Conta Agora
              </a>
              <p className="mt-6 text-sm text-gray-600">Configuração em menos de 2 minutos.</p>
          </div>
      </section>

      <footer className="bg-gray-900 border-t border-gray-800 py-10">
        <div className="container mx-auto px-6 text-center">
            <div className="flex justify-center items-center gap-2 mb-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                <img src='./src/img/fluxoclean.svg' alt="FluxoClean Logo" className="w-6 h-6" />
                <span className="font-bold text-lg">FluxoClean</span>
            </div>
            <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} FluxoClean Sistemas Ltda. <br className="md:hidden"/> Feito com <span className="text-red-500">❤️</span> para o empreendedor brasileiro.
            </p>
            <div className="flex justify-center gap-6 mt-6 text-xs text-gray-600">
                <a href="/contract" className="hover:text-white transition-colors">Termos de Uso</a>
                <a href="/contract" className="hover:text-white transition-colors">Privacidade</a>
                <a href="mailto:suporte@fluxoclean.com.br" className="hover:text-white transition-colors">Suporte</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
