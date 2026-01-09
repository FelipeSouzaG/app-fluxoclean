
import React from 'react';

const Contract: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <a href="/" className="flex items-center gap-3">
                        <div className="bg-indigo-600/20 p-1.5 rounded-lg border border-indigo-500/30">
                            <img src='./src/img/fluxoclean.svg' alt="FluxoClean Logo" className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold text-indigo-900">FluxoClean</span>
                    </a>
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">Versão 1.1 (2026)</span>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 max-w-4xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Termos de Uso e Política de Privacidade</h1>
                <p className="text-gray-500 mb-8">Última atualização: 01 de Janeiro de 2026</p>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-8 text-sm leading-relaxed">
                    
                    <section>
                        <h2 className="text-lg font-bold text-indigo-900 mb-3 uppercase tracking-wide">1. Definições e Aceite</h2>
                        <p>Ao utilizar a plataforma <strong>FluxoClean/Smart-Store</strong> ("SERVIÇO"), você ("CONTRATANTE" ou "LOJISTA") concorda integralmente com os termos aqui descritos. O serviço é provido na modalidade SaaS (Software como Serviço), concedendo uma licença de uso revogável, não exclusiva e intransferível.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-indigo-900 mb-3 uppercase tracking-wide">2. Limitação de Responsabilidade</h2>
                        <p className="mb-2"><strong>2.1 Natureza do Serviço:</strong> O software é uma ferramenta de gestão ("meio") e não garante o sucesso comercial ("fim").</p>
                        <p className="mb-2"><strong>2.2 Responsabilidade Fiscal:</strong> O sistema não substitui a contabilidade formal. Recibos e relatórios são para controle gerencial. O Lojista é o único responsável pela emissão de Notas Fiscais e recolhimento de tributos.</p>
                        <p className="mb-2"><strong>2.3 Inteligência Artificial:</strong> As sugestões geradas por IA no painel são baseadas em estatísticas e <strong>não constituem consultoria financeira ou de investimento</strong>. A FluxoClean não se responsabiliza por prejuízos decorrentes de decisões tomadas com base nessas sugestões.</p>
                        <p><strong>2.4 Falhas de Terceiros:</strong> Não nos responsabilizamos por instabilidades, bloqueios ou falhas em serviços integrados como WhatsApp, Mercado Pago ou Google.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-indigo-900 mb-3 uppercase tracking-wide">3. Conteúdo e E-commerce</h2>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-900">
                            <p className="font-bold mb-2">⚠ Responsabilidade pelo Conteúdo</p>
                            <p>O CONTRATANTE declara ser o único e exclusivo responsável por todo o conteúdo, ofertas, imagens, preços e descrições inseridos na plataforma.</p>
                        </div>
                        <p className="mt-4"><strong>3.1 Produtos Proibidos:</strong> É estritamente proibida a venda de produtos ilícitos, falsificados, drogas, armas ou conteúdo adulto não regulamentado.</p>
                        <p><strong>3.2 Banimento:</strong> A FluxoClean reserva-se o direito de suspender imediatamente qualquer loja que viole estas regras, sem direito a reembolso, e colaborar com as autoridades competentes.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-indigo-900 mb-3 uppercase tracking-wide">4. Pagamentos e Bloqueio</h2>
                        <p className="mb-2"><strong>4.1 Inadimplência:</strong> O serviço opera em modelo pré-pago ou assinatura recorrente. O não pagamento na data de vencimento resultará no <strong>bloqueio automático</strong> do acesso administrativo e suspensão da loja virtual.</p>
                        <p><strong>4.2 Restauração:</strong> O acesso será restabelecido somente após a confirmação da compensação bancária do pagamento pendente.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-indigo-900 mb-3 uppercase tracking-wide">5. Proteção de Dados (LGPD)</h2>
                        <p className="mb-2"><strong>5.1 Controlador e Operador:</strong> A FluxoClean atua como Controladora dos dados cadastrais do Lojista e como Operadora dos dados dos clientes finais do Lojista.</p>
                        <p><strong>5.2 Garantia de Licitude:</strong> O Lojista garante que possui base legal (consentimento ou legítimo interesse) para inserir dados de terceiros na plataforma.</p>
                        <p><strong>5.3 Segurança:</strong> Utilizamos criptografia e isolamento lógico para proteger seus dados, mas nenhuma transmissão pela internet é 100% segura.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-indigo-900 mb-3 uppercase tracking-wide">6. Google Business Profile</h2>
                        <p>Ao solicitar a gestão ou cadastro no Google Maps através de nossa plataforma, você outorga poderes à FluxoClean para editar e atualizar os dados da sua empresa em seu nome. A aprovação, verificação e permanência da ficha dependem exclusivamente das diretrizes do Google.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-indigo-900 mb-3 uppercase tracking-wide">7. Termos Específicos: E-commerce e Domínios</h2>
                        <p className="mb-2"><strong>7.1 Mandato de Registro:</strong> Ao contratar planos que incluem "Domínio Próprio" (ex: Bundle), o CONTRATANTE outorga à FluxoClean poderes para adquirir e gerenciar o domínio (URL) em seu nome junto aos órgãos competentes (Registro.br, etc). O domínio será registrado com os dados do CONTRATANTE sempre que possível.</p>
                        <p className="mb-2"><strong>7.2 Subdomínios (Trial):</strong> Em planos de degustação (Trial), o endereço fornecido é um subdomínio de propriedade da FluxoClean. O uso indevido deste subdomínio para práticas de spam, phishing ou atividades ilegais resultará no cancelamento imediato e banimento da conta.</p>
                        <p className="mb-2"><strong>7.3 Chargebacks e Fraudes:</strong> O Lojista é inteiramente responsável pela gestão de risco de suas vendas. A FluxoClean fornece a tecnologia, mas não intermedeia financeiramente as vendas entre Lojista e Consumidor final, não se responsabilizando por chargebacks, fraudes de cartão ou disputas comerciais.</p>
                    </section>

                    <hr className="border-gray-200" />
                    
                    <footer className="text-center text-gray-400 text-xs">
                        <p>FluxoClean Sistemas</p>
                        <p>Dúvidas? Entre em contato: contato@fluxoclean.com.br</p>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default Contract;
