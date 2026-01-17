import React, { useEffect, useState, useMemo } from 'react';
import { FLUXOCLEAN_API } from '../config';

// --- Interfaces ---
interface RequestPayload {
    category?: string;
    description?: string;
    services?: string;
    openingHours?: string;
    socialLinks?: { website?: string; instagram?: string; tiktok?: string; };
    contactInfo?: { name?: string; phone?: string; fullAddress?: string; };
    images?: { name: string; data: string }[];
    hasExternalEcommerce?: boolean;
    isTrial?: boolean;
    generatedUrl?: string;
    websiteUrl?: string; // Campo novo
    plan?: 'basic' | 'bundle';
    domainPreferences?: { domain: string; priority: number }[];
    requestedAt?: string;
    legalAgreement?: { // Payload histórico de requests
        accepted: boolean;
        acceptedAt?: string;
        version: string;
        ipAddress: string;
        userAgent: string;
    };
    [key: string]: any; 
}

interface Request {
    type: 'extension' | 'upgrade' | 'migrate' | 'monthly' | 'google_maps' | 'ecommerce' | 'domain';
    status: 'pending' | 'waiting_payment' | 'approved' | 'rejected' | 'completed' | 'waiting_switch';
    requestedAt: string;
    amount: number;
    referenceCode?: string;
    payload?: RequestPayload;
}

interface Owner { name: string; email: string; phone: string; }
interface Address { cep: string; street: string; number: string; neighborhood: string; city: string; state: string; complement?: string; }

interface Telemetry {
    lastLoginAt?: string;
    salesCountMonth?: number;
    revenueMonth?: number;
    productsCount?: number;
    customersCount?: number;
    averageTicket?: number;
    activeModules?: { pos: boolean; services: boolean; financial: boolean; };
    appVersion?: string;
}

interface AuditLog {
    action: string;
    performedBy: string;
    details: string;
    timestamp: string;
}

interface LegalAgreement {
    accepted: boolean;
    acceptedAt: string;
    version: string;
    ipAddress: string;
    userAgent: string;
}

interface EcommerceLegalAgreement {
    accepted: boolean;
    acceptedAt: string;
    version: string;
    ipAddress: string;
    userAgent: string;
    domainRequested?: string;
}

interface Infrastructure {
    dbPort?: number;
    appPort?: number;
    createdAt?: string;
}

interface Tenant {
  _id: string;
  name: string;
  tenantName: string;
  systemType: string;
  status: string;
  plan: string;
  trialEndsAt: string;
  subscriptionEndsAt?: string;
  extensionCount?: number;
  requests?: Request[];
  singleTenantUrl?: string;
  createdAt: string;
  owner?: Owner;
  address?: Address;
  growthInfo?: { found: boolean; description: string; rating: number };
  telemetry?: Telemetry;
  auditLog?: AuditLog[];
  infrastructure?: Infrastructure;
  legalAgreement?: LegalAgreement; 
  ecommerceLegalAgreement?: EcommerceLegalAgreement; // Novo campo vindo do StoreConfig
  activeServices?: {
      googleMaps: boolean;
      ecommerce: boolean;
  };
}

interface BroadcastMessage {
    _id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success';
    targetRoles: string[];
    active: boolean;
    createdAt: string;
    expiresAt?: string;
}

// ===================================
// GLOBAL COMPONENTS & MODALS
// ===================================
// ... (NotificationModal and ActionConfirmationModal remain unchanged) ...
const NotificationModal: React.FC<{ isOpen: boolean; type: 'success' | 'error'; message: string; onClose: () => void }> = ({ isOpen, type, message, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full transform transition-all scale-100 border border-gray-200">
                <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {type === 'success' ? (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    )}
                </div>
                <h3 className={`text-lg leading-6 font-bold text-center mb-2 ${type === 'success' ? 'text-gray-900' : 'text-red-900'}`}>
                    {type === 'success' ? 'Sucesso!' : 'Atenção'}
                </h3>
                <p className="text-sm text-gray-500 text-center mb-6">{message}</p>
                <button onClick={onClose} className={`w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-colors ${type === 'success' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'}`}>
                    Entendi
                </button>
            </div>
        </div>
    );
};

const ActionConfirmationModal: React.FC<{ 
    isOpen: boolean; 
    title: string; 
    message: React.ReactNode; 
    onConfirm: () => void; 
    onCancel: () => void 
}> = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm animate-fade-in border border-gray-200">
                <h3 className="text-lg font-bold mb-3 text-gray-900">{title}</h3>
                <div className="text-sm text-gray-600 mb-6">{message}</div>
                <div className="flex justify-end space-x-3">
                    <button onClick={onCancel} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium">Cancelar</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md">Confirmar</button>
                </div>
            </div>
        </div>
    );
};

// ===================================
// HEALTH CHECK LOGIC & COMPONENTS
// ===================================
// ... (Unchanged) ...
type HealthStatus = 'critical' | 'warning' | 'opportunity' | 'healthy' | 'new';

const getTenantHealth = (tenant: Tenant): { status: HealthStatus; reason: string; diagnosis: string; action: string } => {
    const tel = tenant.telemetry || {};
    const lastLogin = tel.lastLoginAt ? new Date(tel.lastLoginAt).getTime() : 0;
    const createdAt = new Date(tenant.createdAt).getTime();
    const now = new Date().getTime();
    const daysSinceLogin = (now - lastLogin) / (1000 * 60 * 60 * 24);
    const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
    const sales = tel.salesCountMonth || 0;
    const revenue = tel.revenueMonth || 0;

    if (daysSinceCreation < 3 && sales === 0) 
        return { status: 'new', reason: 'Onboarding', diagnosis: 'Cliente recém-chegado. Ainda em fase de configuração inicial.', action: 'Acompanhar setup inicial.' };
    
    if (daysSinceLogin > 7) 
        return { status: 'critical', reason: `Inativo ${Math.floor(daysSinceLogin)}d`, diagnosis: `Risco Alto de Churn. O cliente não acessa o sistema há ${Math.floor(daysSinceLogin)} dias.`, action: 'Entrar em contato urgente (WhatsApp/Ligação).' };
    
    if (daysSinceLogin < 3 && sales === 0 && daysSinceCreation > 3) 
        return { status: 'warning', reason: 'Uso sem Vendas', diagnosis: 'Cliente acessa o sistema mas não está registrando vendas. Pode estar com dificuldades operacionais.', action: 'Oferecer treinamento ou verificar dúvidas.' };
    
    if (tenant.plan === 'trial' && (sales > 50 || revenue > 5000)) 
        return { status: 'opportunity', reason: 'Upsell', diagnosis: 'Alta performance de vendas no plano Trial. Cliente maduro para upgrade.', action: 'Oferecer plano Exclusive ou E-commerce.' };
    
    return { status: 'healthy', reason: 'Saudável', diagnosis: 'Uso constante e saudável do sistema.', action: 'Manter relacionamento.' };
};

const HealthIcon: React.FC<{ status: HealthStatus }> = ({ status }) => {
    switch (status) {
        case 'critical': return <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" title="Crítico"></span>;
        case 'warning': return <span className="w-3 h-3 rounded-full bg-yellow-400" title="Atenção"></span>;
        case 'opportunity': return <span className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" title="Oportunidade"></span>;
        case 'healthy': return <span className="w-3 h-3 rounded-full bg-green-500" title="Saudável"></span>;
        case 'new': return <span className="w-3 h-3 rounded-full bg-gray-300" title="Novo"></span>;
    }
};

const DetailRow: React.FC<{ label: string; value: React.ReactNode; tooltip?: string }> = ({ label, value, tooltip }) => (
    <div className="mb-2 last:mb-0" title={tooltip}>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</label>
        <div className="text-sm text-gray-700 font-medium break-words">
            {value || '-'}
        </div>
    </div>
);

// ===================================
// MODALS
// ===================================
// ... (TelemetryModal unchanged) ...
const TelemetryModal: React.FC<{ isOpen: boolean; tenant: Tenant | null; onClose: () => void }> = ({ isOpen, tenant, onClose }) => {
    if (!isOpen || !tenant) return null;

    const { status, diagnosis, action } = getTenantHealth(tenant);
    const tel = tenant.telemetry || {};
    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const whatsappLink = tenant.owner?.phone 
        ? `https://wa.me/55${tenant.owner.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${tenant.owner.name}, sou do suporte da FluxoClean. Notamos que...`)}`
        : '#';

    let headerColor = 'bg-gray-600';
    if(status === 'critical') headerColor = 'bg-red-600';
    if(status === 'warning') headerColor = 'bg-yellow-500';
    if(status === 'opportunity') headerColor = 'bg-blue-600';
    if(status === 'healthy') headerColor = 'bg-green-600';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-fade-in">
                <div className={`${headerColor} p-6 text-white flex justify-between items-start`}>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                             <HealthIcon status={status} />
                             <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-white">{status}</span>
                        </div>
                        <h2 className="text-2xl font-bold">{tenant.name}</h2>
                        <p className="text-sm opacity-90">{tenant.owner?.name} | {tenant.owner?.phone}</p>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white text-3xl">&times;</button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
                    {/* Vital Data Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                            <p className="text-xs text-gray-500 uppercase font-bold">Vendas Mês</p>
                            <p className="text-lg font-bold text-gray-800">{tel.salesCountMonth || 0}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                            <p className="text-xs text-gray-500 uppercase font-bold">Faturamento</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(tel.revenueMonth || 0)}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                            <p className="text-xs text-gray-500 uppercase font-bold">Produtos</p>
                            <p className="text-lg font-bold text-indigo-600">{tel.productsCount || 0}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                            <p className="text-xs text-gray-500 uppercase font-bold">Ticket Médio</p>
                            <p className="text-lg font-bold text-gray-800">{formatCurrency(tel.averageTicket || 0)}</p>
                        </div>
                    </div>

                    {/* Diagnosis */}
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                            🔍 Diagnóstico Automático
                        </h3>
                        <p className="text-sm text-indigo-800 leading-relaxed">
                            {diagnosis}
                            <br/><br/>
                            <span className="text-xs text-indigo-600">
                                Último Login: {tel.lastLoginAt ? new Date(tel.lastLoginAt).toLocaleString() : 'Nunca'} • 
                                Versão App: {tel.appVersion || 'Unknown'}
                            </span>
                        </p>
                    </div>

                    {/* Recommended Action */}
                    <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ação Recomendada</h4>
                        <div className="flex gap-3">
                            <a 
                                href={whatsappLink} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold text-center flex items-center justify-center gap-2 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg>
                                {action}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TenantDetailsModal: React.FC<{ isOpen: boolean; tenant: Tenant | null; onClose: () => void }> = ({ isOpen, tenant, onClose }) => {
    if(!isOpen || !tenant) return null;
    
    const [activeTab, setActiveTab] = useState<'general' | 'financial' | 'audit' | 'legal'>('general');
    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    
    const financialHistory = tenant.requests?.filter(r => ['approved', 'completed', 'waiting_switch'].includes(r.status)) || [];

    // Find historic legal agreements in requests if not present in main config
    const historicLegalRequests = tenant.requests?.filter(r => r.payload && r.payload.legalAgreement).reverse() || [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{tenant.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                             <span className="text-xs font-mono text-gray-500 bg-gray-200 px-2 py-0.5 rounded">{tenant._id}</span>
                             <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${tenant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{tenant.status}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl">&times;</button>
                </div>

                <div className="flex border-b border-gray-200 overflow-x-auto">
                    <button onClick={() => setActiveTab('general')} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap px-4 ${activeTab === 'general' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>Geral</button>
                    <button onClick={() => setActiveTab('financial')} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap px-4 ${activeTab === 'financial' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>Financeiro</button>
                    <button onClick={() => setActiveTab('audit')} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap px-4 ${activeTab === 'audit' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>Auditoria</button>
                    <button onClick={() => setActiveTab('legal')} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap px-4 ${activeTab === 'legal' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>Termos de Uso</button>
                </div>

                <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                <h3 className="font-bold text-gray-900 border-b pb-2 mb-2">🏢 Empresa</h3>
                                <DetailRow label="Slug" value={tenant.tenantName} />
                                <DetailRow label="Owner" value={tenant.owner?.name} />
                                <DetailRow label="E-mail" value={tenant.owner?.email} />
                                <DetailRow label="Telefone" value={tenant.owner?.phone} />
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailRow label="Início Trial" value={new Date(tenant.createdAt).toLocaleDateString()} />
                                    <DetailRow label="Fim Trial" value={new Date(tenant.trialEndsAt).toLocaleDateString()} />
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Infraestrutura</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="bg-gray-50 p-2 rounded">
                                            <span className="block text-gray-400 text-[10px]">API Port</span>
                                            <span className="font-mono">{tenant.infrastructure?.appPort || 'N/A'}</span>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded">
                                            <span className="block text-gray-400 text-[10px]">DB Port</span>
                                            <span className="font-mono">{tenant.infrastructure?.dbPort || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                <h3 className="font-bold text-gray-900 border-b pb-2 mb-2">📍 Endereço</h3>
                                {tenant.address ? (
                                    <>
                                        <DetailRow label="Logradouro" value={`${tenant.address.street}, ${tenant.address.number}`} />
                                        <DetailRow label="Bairro" value={tenant.address.neighborhood} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <DetailRow label="Cidade/UF" value={`${tenant.address.city}/${tenant.address.state}`} />
                                            <DetailRow label="CEP" value={tenant.address.cep} />
                                        </div>
                                    </>
                                ) : <p className="text-gray-400 text-sm">Endereço não cadastrado.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'financial' && (
                        <div className="space-y-4">
                             {financialHistory.length === 0 ? (
                                 <div className="text-center py-10 text-gray-400">Nenhum evento financeiro registrado.</div>
                             ) : (
                                 financialHistory.map((evt, idx) => (
                                     <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">
                                         <div>
                                             <p className="font-bold text-indigo-900 uppercase text-xs tracking-wider">{evt.type.replace('_', ' ')}</p>
                                             <p className="text-sm text-gray-600 mt-1">{new Date(evt.requestedAt).toLocaleDateString()} - <span className="font-mono text-xs">{evt.referenceCode}</span></p>
                                         </div>
                                         <div className="text-right">
                                             <p className="text-xl font-bold text-green-600">{formatCurrency(evt.amount)}</p>
                                             <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold uppercase">Pago</span>
                                         </div>
                                     </div>
                                 ))
                             )}
                        </div>
                    )}

                    {activeTab === 'audit' && (
                        <div className="space-y-3">
                            {(!tenant.auditLog || tenant.auditLog.length === 0) ? (
                                <div className="text-center py-10 text-gray-400">Nenhum log de auditoria encontrado.</div>
                            ) : (
                                [...tenant.auditLog].reverse().map((log, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded border border-gray-200 text-sm flex gap-3 items-start">
                                        <div className="text-xs text-gray-400 whitespace-nowrap pt-0.5">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">
                                                <span className="uppercase text-indigo-600 mr-2">[{log.performedBy}]</span>
                                                {log.action}
                                            </p>
                                            <p className="text-gray-600 mt-1">{log.details}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'legal' && (
                         <div className="space-y-6">
                            {/* Card 1: Termos Gerais (Acesso) */}
                            {tenant.legalAgreement && tenant.legalAgreement.accepted ? (
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4 text-green-600">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" clipRule="evenodd" /></svg>
                                        <h3 className="font-bold text-lg">Termos de Uso Gerais (Setup)</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                        <DetailRow label="Data do Aceite" value={new Date(tenant.legalAgreement.acceptedAt).toLocaleString()} />
                                        <DetailRow label="Versão do Contrato" value={tenant.legalAgreement.version || 'v1.0'} />
                                        <DetailRow label="IP de Origem" value={tenant.legalAgreement.ipAddress} />
                                        <DetailRow label="User Agent" value={tenant.legalAgreement.userAgent} tooltip={tenant.legalAgreement.userAgent} />
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 text-center">
                                    <p className="text-yellow-800 font-bold mb-2">Termos Gerais não aceitos</p>
                                    <p className="text-sm text-yellow-700">Este cliente ainda não completou o aceite dos termos de uso iniciais.</p>
                                </div>
                            )}

                            {/* Card 2: Termos E-commerce (Ativos) */}
                            {tenant.ecommerceLegalAgreement && tenant.ecommerceLegalAgreement.accepted && (
                                <div className="bg-white p-6 rounded-xl border border-indigo-200 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500"></div>
                                    <div className="flex items-center gap-2 mb-4 text-indigo-700">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 16 16"><path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/><path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/></svg>
                                        <h3 className="font-bold text-lg">Responsabilidade E-commerce (Atual)</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                        <DetailRow label="Data do Aceite" value={new Date(tenant.ecommerceLegalAgreement.acceptedAt || '').toLocaleString()} />
                                        <DetailRow label="Versão Específica" value={tenant.ecommerceLegalAgreement.version} />
                                        <DetailRow label="IP de Origem" value={tenant.ecommerceLegalAgreement.ipAddress} />
                                        <DetailRow label="Domínio Solicitado" value={tenant.ecommerceLegalAgreement.domainRequested || 'N/A'} />
                                    </div>
                                </div>
                            )}

                            {/* Histórico de Solicitações (Audit Trail) */}
                            {historicLegalRequests.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Histórico de Aceites (Eventos)</h4>
                                    <div className="space-y-3">
                                        {historicLegalRequests.map((req, idx) => (
                                            <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                                                <div className="flex justify-between mb-2">
                                                    <span className="font-bold text-gray-700">{req.type === 'ecommerce' ? 'Ativação Trial' : 'Migração Bundle'}</span>
                                                    <span className="text-gray-500">{new Date(req.payload!.legalAgreement!.acceptedAt!).toLocaleString()}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                                    <p>IP: {req.payload!.legalAgreement!.ipAddress}</p>
                                                    <p>Versão: {req.payload!.legalAgreement!.version}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};
// ... (Rest of SuperAdmin remains largely unchanged) ...
const BroadcastDetailsModal: React.FC<{ isOpen: boolean; broadcast: BroadcastMessage | null; onClose: () => void; onResend: (b: BroadcastMessage) => void }> = ({ isOpen, broadcast, onClose, onResend }) => {
    if (!isOpen || !broadcast) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                 <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{broadcast.title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
                     {broadcast.message}
                 </div>
                 <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                     <p>Enviado em: {new Date(broadcast.createdAt).toLocaleDateString()}</p>
                     <p>Expira em: {broadcast.expiresAt ? new Date(broadcast.expiresAt).toLocaleDateString() : 'Nunca'}</p>
                 </div>
                 <div className="mt-6 flex justify-end gap-3">
                     <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Fechar</button>
                     <button onClick={() => onResend(broadcast)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold">Usar como Modelo</button>
                 </div>
             </div>
        </div>
    );
};
const GoogleMapsExecutionModal: React.FC<any> = ({ isOpen, tenantId, tenantName, request, onClose, onComplete }) => {
    const [mapsLink, setMapsLink] = useState('');
    const payload = request?.payload || {};

    if (!isOpen || !request) return null;
    
    // VERIFICAÇÃO DE TIPO DE SERVIÇO: É APENAS ATUALIZAÇÃO DE LINK?
    // Se o payload tiver category='Atualização de Site', usamos a interface simplificada.
    const isWebsiteUpdate = payload.category === 'Atualização de Site';
    const websiteUrlToInsert = payload.websiteUrl || payload.generatedUrl; // Fallback se não vier explícito

    if (isWebsiteUpdate) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-fade-in border-4 border-green-500">
                    <div className="p-6 border-b bg-green-50 text-center">
                         <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                              <path fillRule="evenodd" d="M10.854 8.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L7.5 10.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
                              <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1m3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/>
                            </svg>
                         </div>
                        <h3 className="text-xl font-bold text-gray-800">Ativação de E-commerce</h3>
                        <p className="text-sm text-gray-600 mt-2">O cliente {tenantName} ativou a loja virtual. Atualize o Google Maps.</p>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Ação Necessária</p>
                            <p className="text-sm text-gray-800">
                                1. Acesse o perfil da empresa no Google.<br/>
                                2. No campo "Website", insira o link abaixo:
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Link da Loja (Copiar)</label>
                            <div className="flex gap-2">
                                <input type="text" readOnly value={websiteUrlToInsert || 'URL não encontrada'} className="flex-1 p-3 bg-white border border-gray-300 rounded font-mono text-sm text-indigo-600" />
                                <button 
                                    onClick={() => navigator.clipboard.writeText(websiteUrlToInsert)}
                                    className="px-3 bg-gray-200 hover:bg-gray-300 rounded text-gray-600"
                                    title="Copiar"
                                >
                                    📋
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded">Cancelar</button>
                        <button 
                            onClick={() => onComplete(tenantId, request.referenceCode, websiteUrlToInsert, true)} 
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow"
                        >
                            Feito
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Default Full Registration Modal (Existing Logic)
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b bg-indigo-600 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold">Execução de Serviço: Google Maps</h3>
                        <p className="text-sm opacity-80 mt-1">{tenantName}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">&times;</button>
                </div>
                
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Column: Request Details */}
                    <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-200 bg-gray-50">
                        <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Dados da Solicitação</h4>
                        
                        <div className="space-y-4 text-sm">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase">Nome / Categoria</label>
                                <p className="font-medium">{payload.contactInfo?.name || tenantName} - {payload.category}</p>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase">Endereço Completo</label>
                                <p className="bg-white p-2 rounded border border-gray-200 text-gray-700">{payload.contactInfo?.fullAddress || 'N/A'}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase">Horários</label>
                                <p className="text-gray-700">{payload.openingHours}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase">Contatos</label>
                                <p className="text-gray-700">Tel: {payload.contactInfo?.phone}</p>
                                {payload.socialLinks?.website && <p className="text-gray-700">Site: {payload.socialLinks.website}</p>}
                                {payload.socialLinks?.instagram && <p className="text-gray-700">Insta: {payload.socialLinks.instagram}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase">Descrição</label>
                                <p className="bg-white p-2 rounded border border-gray-200 text-gray-600 text-xs italic">{payload.description}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase">Serviços / Keywords</label>
                                <p className="bg-white p-2 rounded border border-gray-200 text-gray-600 text-xs italic">{payload.services}</p>
                            </div>

                            {/* Images Gallery */}
                            {payload.images && payload.images.length > 0 && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Imagens Enviadas</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {payload.images.map((img: any, idx: number) => (
                                            <div key={idx} className="relative group">
                                                <img src={img.data} alt={img.name} className="w-full h-24 object-cover rounded border border-gray-300" />
                                                <div className="absolute bottom-0 left-0 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-tr w-full truncate">
                                                    {img.name}
                                                </div>
                                                <a href={img.data} download={`${tenantName}-${img.name}.jpg`} className="absolute top-1 right-1 bg-white p-1 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Execution Form */}
                    <div className="w-1/2 p-6 flex flex-col">
                        <div className="bg-yellow-50 p-4 rounded border border-yellow-200 text-sm text-yellow-800 mb-6">
                            <p className="font-bold mb-2">Instruções de Execução:</p>
                            <ol className="list-decimal list-inside space-y-1 text-xs">
                                <li>Acesse o <strong>Google Business Profile Manager</strong>.</li>
                                <li>Use os dados ao lado para criar a ficha.</li>
                                <li>Baixe e faça upload das imagens fornecidas.</li>
                                <li>Realize a verificação (Postal/Telefone/Vídeo).</li>
                                <li>Após publicado, cole o link final abaixo.</li>
                            </ol>
                        </div>
                        
                        <div className="mt-auto">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Link do Google Maps (Resultado)</label>
                            <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://maps.google.com/..." value={mapsLink} onChange={e => setMapsLink(e.target.value)} />
                            <p className="text-xs text-gray-500 mt-2">Este link será enviado ao cliente e ativará o status "Confirmado".</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded">Cancelar</button>
                    <button onClick={() => onComplete(tenantId, request.referenceCode, mapsLink, false)} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow disabled:opacity-50" disabled={!mapsLink}>Concluir e Notificar Cliente</button>
                </div>
            </div>
        </div>
    );
};

// --- AUTOMATED PROVISIONING MODAL ---
const UnifiedProvisioningModal: React.FC<any> = ({ isOpen, tenant, request, onClose, onConfirm }) => {
    const [targetUrl, setTargetUrl] = useState('');
    const [step, setStep] = useState<'confirm' | 'provisioning' | 'success'>('confirm');

    // Auto-fill URL display (read-only expectation)
    useEffect(() => {
        if (isOpen && tenant && !targetUrl && tenant.tenantName) {
            setTargetUrl(`https://${tenant.tenantName}.fluxoclean.com.br`);
        }
    }, [tenant, isOpen]); // removed targetUrl from dep array to avoid loop, or keep it if logic is sound. Actually [tenant, isOpen] is enough usually. Or just [isOpen] if tenant is stable. Let's keep it safe.

    const isBundle = request?.payload?.plan === 'bundle';

    const handleProvisioning = async () => {
        if (!tenant) return;
        setStep('provisioning');

        try {
            // New Automated Endpoint (No ports needed manually)
            const response = await fetch(`${FLUXOCLEAN_API}/admin/tenants/${tenant._id}/provision`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({ 
                    type: isBundle ? 'bundle' : 'basic' 
                }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                setTargetUrl(data.data.targetUrl); 
                setStep('success');
            } else {
                alert("Erro no provisionamento: " + data.message);
                setStep('confirm');
            }
        } catch (e) {
            console.error(e);
            alert("Erro de conexão com o servidor.");
            setStep('confirm');
        }
    };

    // Render logic check - moved after hooks to prevent React Error #310
    if (!isOpen || !tenant || !request) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-6 border-b bg-purple-700 text-white">
                    <h3 className="text-xl font-bold">Provisionamento Automático</h3>
                    <p className="text-sm opacity-80 mt-1">{tenant.name}</p>
                </div>
                
                <div className="p-6 space-y-6">
                    {step === 'confirm' && (
                        <div className="text-center space-y-4">
                            <div className="bg-blue-50 p-4 rounded border border-blue-200 text-sm text-blue-800 text-left">
                                <p className="font-bold mb-2">Pronto para iniciar:</p>
                                <p>O sistema irá alocar automaticamente as portas e criar os containers isolados para este cliente.</p>
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-gray-500 uppercase font-bold">Tipo</p>
                                <p className="font-bold">{isBundle ? 'Exclusive + E-commerce' : 'Exclusive Básico'}</p>
                            </div>
                        </div>
                    )}

                    {step === 'provisioning' && (
                        <div className="text-center py-8">
                             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                             <p className="text-gray-600 font-bold">Provisionando Infraestrutura...</p>
                             <p className="text-xs text-gray-400 mt-2">Alocando portas, subindo DB e API.</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center space-y-4">
                             <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 mb-2">✓</div>
                             <h4 className="text-lg font-bold text-gray-800">Infraestrutura Criada!</h4>
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">URL do Ambiente</label>
                                <input type="text" className="w-full p-2 border rounded font-mono text-sm bg-gray-50 text-center" value={targetUrl} readOnly />
                            </div>
                            <p className="text-xs text-gray-500">O cliente receberá um e-mail para migrar.</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                    {step === 'confirm' && (
                        <>
                            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded">Cancelar</button>
                            <button onClick={handleProvisioning} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded shadow">🚀 Iniciar Provisionamento</button>
                        </>
                    )}
                    {step === 'provisioning' && (
                         <button disabled className="px-6 py-2 bg-gray-300 text-white font-bold rounded cursor-not-allowed">Aguarde...</button>
                    )}
                    {step === 'success' && (
                        <button onClick={() => onConfirm(targetUrl)} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow">Concluir Ordem</button>
                    )}
                </div>
             </div>
        </div>
    );
};

// ... (SuperAdmin Main Component remains as provided, no logic changes needed here as we updated the modal directly) ...
const SuperAdmin: React.FC = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [activeTab, setActiveTab] = useState<'financial' | 'tenants' | 'services' | 'communication'>('financial');
    
    // Financial Sub-View
    const [financialView, setFinancialView] = useState<'history' | 'forecast'>('history');
    
    // Communication State
    const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
    const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastMessage | null>(null);
    const [commForm, setCommForm] = useState({ title: '', message: '', type: 'info', expiresAt: '' });
    const [commPeriod, setCommPeriod] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
    
    // Modal States
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [modalType, setModalType] = useState<'details' | 'maps_exec' | 'provision' | 'telemetry' | 'broadcast_view' | null>(null);

    // New Modal States
    const [notification, setNotification] = useState<{isOpen: boolean; type: 'success' | 'error'; message: string}>({ isOpen: false, type: 'success', message: '' });
    const [confirmation, setConfirmation] = useState<{isOpen: boolean; title: string; message: React.ReactNode; onConfirm: () => void} | null>(null);


    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const fetchTenants = async () => {
        try {
            const response = await fetch(`${FLUXOCLEAN_API}/admin/tenants`, {
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            });

            if (response.status === 401) { 
                window.location.href = '/login'; 
                return; 
            }
            if (response.ok) { 
                const data = await response.json(); 
                setTenants(data); 
            }
        } catch (error) { console.error("Erro ao buscar tenants", error); }
    };
    
    const fetchBroadcasts = async () => {
        try {
            // Note: In real world, filter by period on backend. Here fetching all active for simplicity.
            // Using public endpoint as fallback or specific admin endpoint
            const response = await fetch(`${FLUXOCLEAN_API}/communication/broadcasts`, { 
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include' // Important!
            });
            if (response.ok) {
                const data = await response.json();
                setBroadcasts(data);
            }
        } catch(e) { console.error("Erro buscar broadcasts", e); }
    };

    useEffect(() => { fetchTenants(); const interval = setInterval(fetchTenants, 30000); return () => clearInterval(interval); }, []);
    
    useEffect(() => {
        if(activeTab === 'communication') fetchBroadcasts();
    }, [activeTab]);

    // Actions
    const handleLogout = () => { window.location.href = '/login'; };
    
    const toggleStatus = async (id: string, currentStatus: string) => { 
        const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked'; 
        try { 
            await fetch(`${FLUXOCLEAN_API}/admin/tenants/${id}/status`, { 
                method: 'PATCH', 
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, 
                body: JSON.stringify({ status: newStatus }), 
                credentials: 'include' 
            }); 
            fetchTenants(); 
            setNotification({ isOpen: true, type: 'success', message: `Tenant ${newStatus === 'blocked' ? 'bloqueado' : 'desbloqueado'} com sucesso.` });
        } catch (error) { 
            setNotification({ isOpen: true, type: 'error', message: 'Erro ao atualizar status.' });
        } 
    };

    const handleImpersonate = async (tenantId: string) => {
        setConfirmation({
            isOpen: true,
            title: "Confirmar Acesso",
            message: "ATENÇÃO: Você entrará no sistema como administrador desta loja. Deseja continuar?",
            onConfirm: async () => {
                 setConfirmation(null);
                 try {
                    const res = await fetch(`${FLUXOCLEAN_API}/admin/tenants/${tenantId}/impersonate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                        credentials: 'include'
                    });
                    const data = await res.json();
                    if (res.ok && data.redirectUrl) {
                        window.open(data.redirectUrl, '_blank');
                    } else {
                        setNotification({ isOpen: true, type: 'error', message: data.message || "Erro ao gerar acesso." });
                    }
                } catch (e) { 
                    setNotification({ isOpen: true, type: 'error', message: "Erro de conexão." });
                }
            }
        });
    };

    const closeModal = () => {
        setModalType(null);
        setSelectedTenant(null);
        setSelectedRequest(null);
        setSelectedBroadcast(null);
    };

    const handleExecuteService = (tenant: Tenant, request: Request) => {
        setSelectedTenant(tenant);
        setSelectedRequest(request);
        if (request.type === 'google_maps') {
            setModalType('maps_exec');
        } else if (['upgrade', 'ecommerce', 'migrate'].includes(request.type)) {
            setModalType('provision');
        }
    };

    const handleCompleteService = async (tenantId: string, referenceCode: string, resultLink: string, isEcommerce: boolean) => { 
        try { 
            const response = await fetch(`${FLUXOCLEAN_API}/admin/tenants/${tenantId}/complete-service`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, 
                body: JSON.stringify({ referenceCode, mapsLink: resultLink, isEcommerce }), 
                credentials: 'include' 
            }); 
            if (response.ok) { 
                closeModal(); 
                fetchTenants(); 
                setNotification({ isOpen: true, type: 'success', message: 'Serviço concluído com sucesso!' });
            } 
        } catch (e) { 
            setNotification({ isOpen: true, type: 'error', message: 'Erro ao completar serviço.' });
        } 
    };

    const handleProvisionConfirm = async (targetUrl: string) => {
        if (!selectedTenant || !selectedRequest) return;
        if (selectedRequest.type === 'upgrade' || selectedRequest.type === 'ecommerce') {
             try {
                const response = await fetch(`${FLUXOCLEAN_API}/admin/tenants/${selectedTenant._id}/complete-service`, { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, 
                    body: JSON.stringify({ 
                        referenceCode: selectedRequest.referenceCode, 
                        mapsLink: '', 
                        isEcommerce: selectedRequest.type === 'ecommerce',
                        targetUrl 
                    }), 
                    credentials: 'include' 
                });
                if (response.ok) { 
                    closeModal(); 
                    fetchTenants();
                    setNotification({ isOpen: true, type: 'success', message: 'Provisionamento iniciado/concluído.' });
                }
             } catch(e) { 
                 setNotification({ isOpen: true, type: 'error', message: 'Erro no provisionamento.' });
             }
        }
    };
    
    // Manual Payment Approval
    const handleManualPayment = async (tenantId: string, referenceCode: string) => {
        setConfirmation({
            isOpen: true,
            title: "Confirmar Pagamento",
            message: "Confirmar o recebimento manual deste pagamento?",
            onConfirm: async () => {
                setConfirmation(null);
                try {
                    const response = await fetch(`${FLUXOCLEAN_API}/admin/tenants/${tenantId}/payment/${referenceCode}/toggle`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                        body: JSON.stringify({ targetStatus: 'approved' }),
                        credentials: 'include'
                    });
                    if (response.ok) { 
                        fetchTenants(); 
                        setNotification({ isOpen: true, type: 'success', message: 'Pagamento confirmado manualmente.' });
                    } else { 
                        setNotification({ isOpen: true, type: 'error', message: "Erro ao processar." });
                    }
                } catch(e) { 
                    setNotification({ isOpen: true, type: 'error', message: "Erro de conexão." });
                }
            }
        });
    };
    
    // Communication Handlers
    const handleCreateBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${FLUXOCLEAN_API}/communication/admin/broadcasts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify(commForm),
                credentials: 'include'
            });
            if(response.ok) {
                setCommForm({ title: '', message: '', type: 'info', expiresAt: '' });
                fetchBroadcasts();
                setNotification({ isOpen: true, type: 'success', message: 'Mensagem enviada com sucesso!' });
            }
        } catch(e) { 
            setNotification({ isOpen: true, type: 'error', message: 'Erro ao enviar mensagem.' });
        }
    };

    const handleDeleteBroadcast = async (id: string) => {
        setConfirmation({
            isOpen: true,
            title: "Excluir Comunicado",
            message: "Tem certeza que deseja excluir este comunicado?",
            onConfirm: async () => {
                setConfirmation(null);
                try {
                    await fetch(`${FLUXOCLEAN_API}/communication/admin/broadcasts/${id}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                        credentials: 'include'
                    });
                    fetchBroadcasts();
                    setNotification({ isOpen: true, type: 'success', message: 'Comunicado excluído.' });
                } catch(e) { 
                    setNotification({ isOpen: true, type: 'error', message: 'Erro ao excluir.' });
                }
            }
        });
    };
    
    const handleResendBroadcast = (b: BroadcastMessage) => {
        setCommForm({
            title: b.title,
            message: b.message,
            type: b.type,
            expiresAt: ''
        });
        closeModal();
    };

    // Derived Data
    const saasFinancials = useMemo(() => {
        let mrr = 0;
        const counts = tenants.reduce((acc, t) => {
            if (t.status === 'blocked') acc.blocked++;
            if (t.plan === 'trial') acc.trial++;
            
            // Single Tenant Classification
            if (t.plan === 'single_tenant') {
                mrr += 197; // Base
                if (t.activeServices?.ecommerce) {
                     acc.bundle++;
                     mrr += 100; // Bundle extra approx
                } else {
                     acc.exclusive++;
                }
            }
            return acc;
        }, { trial: 0, exclusive: 0, bundle: 0, blocked: 0 });
        
        return { mrr, counts };
    }, [tenants]);

    const recentInvoices = useMemo(() => {
        const payments: any[] = [];
        tenants.forEach(t => {
            t.requests?.forEach(r => {
                if (['approved', 'completed', 'waiting_switch'].includes(r.status)) {
                    payments.push({
                        tenantId: t._id,
                        tenantName: t.name,
                        amount: r.amount,
                        date: r.requestedAt,
                        type: r.type,
                        reference: r.referenceCode,
                        status: 'paid'
                    });
                }
            });
        });
        return payments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15);
    }, [tenants]);

    const forecastInvoices = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const forecasts: any[] = [];
        tenants.forEach(t => {
            t.requests?.forEach(r => {
                const reqDate = new Date(r.requestedAt);
                if (['pending', 'waiting_payment'].includes(r.status) && reqDate.getMonth() === currentMonth && reqDate.getFullYear() === currentYear) {
                     forecasts.push({
                        tenantId: t._id,
                        tenantName: t.name,
                        plan: t.plan === 'single_tenant' ? 'Exclusive' : 'Trial',
                        amount: r.amount,
                        dueDate: r.requestedAt, // Using requestedAt as proxy for due date if not explicit
                        type: r.type,
                        reference: r.referenceCode,
                        status: 'pending'
                    });
                }
            });
        });
        return forecasts.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [tenants]);

    const serviceRequests = useMemo(() => {
        const list: { tenant: Tenant, request: Request }[] = [];
        tenants.forEach(t => {
            t.requests?.forEach(r => {
                // LÓGICA DE FILTRAGEM DE TAREFAS MANUAIS
                
                // 1. Solicitações Internas (Sistema -> Humano)
                // Ex: O sistema ativou o e-commerce e criou um ticket para o humano atualizar o link no Google Maps
                // Critério: Valor 0, Status Pendente, Tipo google_maps (usado para update de link)
                const isInternalTask = r.amount === 0 && r.status === 'pending' && r.type === 'google_maps';

                // 2. Serviços Pagos que exigem execução manual
                // Ex: Cliente pagou R$ 297 para cadastro no Google Maps ou Upgrade de Servidor
                // Critério: Valor > 0, Status Aprovado (Pago)
                // Tipos permitidos: 'google_maps' (Serviço Completo) e 'upgrade' (Provisionamento)
                // Tipos EXCLUÍDOS: 'extension' (Automático), 'ecommerce' (Automático), 'monthly' (Automático)
                const manualServiceTypes = ['google_maps', 'upgrade'];
                const isPaidManualTask = r.amount > 0 && r.status === 'approved' && manualServiceTypes.includes(r.type);

                if (isInternalTask || isPaidManualTask) {
                    list.push({ tenant: t, request: r });
                }
            });
        });
        return list.sort((a,b) => new Date(b.request.requestedAt).getTime() - new Date(a.request.requestedAt).getTime());
    }, [tenants]);
    
    // Communication Filter
    const filteredBroadcasts = useMemo(() => {
        if(!commPeriod) return broadcasts;
        const [year, month] = commPeriod.split('-').map(Number);
        return broadcasts.filter(b => {
            const d = new Date(b.createdAt);
            return d.getFullYear() === year && (d.getMonth() + 1) === month;
        });
    }, [broadcasts, commPeriod]);

    // Helpers for Display
    const getSystemTypeLabel = (type: string) => {
        switch(type) {
            case 'commerce': return 'Smart Store';
            case 'industry': return 'Indústria';
            case 'services': return 'Serviços';
            default: return type;
        }
    };


    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
            {/* Global Modals */}
            <NotificationModal 
                isOpen={notification.isOpen} 
                type={notification.type} 
                message={notification.message} 
                onClose={() => setNotification({ ...notification, isOpen: false })} 
            />
            {confirmation && (
                <ActionConfirmationModal 
                    isOpen={confirmation.isOpen}
                    title={confirmation.title}
                    message={confirmation.message}
                    onConfirm={confirmation.onConfirm}
                    onCancel={() => setConfirmation(null)}
                />
            )}

            {/* Feature Modals */}
            <TenantDetailsModal isOpen={modalType === 'details'} tenant={selectedTenant} onClose={closeModal} />
            <TelemetryModal isOpen={modalType === 'telemetry'} tenant={selectedTenant} onClose={closeModal} />
            
            <GoogleMapsExecutionModal isOpen={modalType === 'maps_exec'} tenantId={selectedTenant?._id} tenantName={selectedTenant?.name} request={selectedRequest} onClose={closeModal} onComplete={handleCompleteService} />
            <UnifiedProvisioningModal isOpen={modalType === 'provision'} tenant={selectedTenant} request={selectedRequest} onClose={closeModal} onConfirm={handleProvisionConfirm} />
            
            <BroadcastDetailsModal isOpen={modalType === 'broadcast_view'} broadcast={selectedBroadcast} onClose={closeModal} onResend={handleResendBroadcast} />

            {/* Top Bar */}
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 text-white font-black p-2 rounded-lg text-xl">FC</div>
                        <h1 className="text-xl font-bold tracking-tight">SuperAdmin <span className="text-indigo-600">FluxoClean</span></h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:text-red-700">Sair</button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 pb-24">
                
                {/* Module 1: Financial Control */}
                {activeTab === 'financial' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* KPI Cards Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">MRR (Recorrente)</h3>
                                <p className="text-2xl font-black text-green-600">{formatCurrency(saasFinancials.mrr)}</p>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Clientes Trial</h3>
                                <p className="text-2xl font-black text-indigo-600">{saasFinancials.counts.trial}</p>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Clientes Exclusive</h3>
                                <p className="text-2xl font-black text-blue-600">{saasFinancials.counts.exclusive}</p>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Exclusive + E-com</h3>
                                <p className="text-2xl font-black text-purple-600">{saasFinancials.counts.bundle}</p>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bloqueados</h3>
                                <p className="text-2xl font-black text-red-600">{saasFinancials.counts.blocked}</p>
                            </div>
                        </div>

                        {/* Financial Table with Toggle */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">
                                    {financialView === 'history' ? 'Últimos Faturamentos (Realizado)' : 'Previsão de Recebimentos (Mês Atual)'}
                                </h3>
                                <div className="flex bg-gray-200 p-1 rounded-lg">
                                    <button 
                                        onClick={() => setFinancialView('history')}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${financialView === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Realizado
                                    </button>
                                    <button 
                                        onClick={() => setFinancialView('forecast')}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${financialView === 'forecast' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Previsto
                                    </button>
                                </div>
                            </div>

                            {financialView === 'history' ? (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-3">Empresa</th>
                                            <th className="px-6 py-3">Serviço</th>
                                            <th className="px-6 py-3">Data</th>
                                            <th className="px-6 py-3 text-right">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {recentInvoices.map((inv, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="px-6 py-3 font-medium">{inv.tenantName}</td>
                                                <td className="px-6 py-3 capitalize">{inv.type.replace('_', ' ')}</td>
                                                <td className="px-6 py-3 text-gray-500">{new Date(inv.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-3 text-right font-bold text-green-600">{formatCurrency(inv.amount)}</td>
                                            </tr>
                                        ))}
                                        {recentInvoices.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Nenhum faturamento recente.</td></tr>}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-3">Empresa</th>
                                            <th className="px-6 py-3">Plano</th>
                                            <th className="px-6 py-3">Vencimento</th>
                                            <th className="px-6 py-3">Valor</th>
                                            <th className="px-6 py-3 text-center">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {forecastInvoices.map((inv, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="px-6 py-3 font-medium">{inv.tenantName}</td>
                                                <td className="px-6 py-3"><span className="px-2 py-0.5 rounded bg-gray-100 text-xs font-bold text-gray-600">{inv.plan}</span></td>
                                                <td className="px-6 py-3 text-gray-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                                                <td className="px-6 py-3 font-bold text-gray-700">{formatCurrency(inv.amount)}</td>
                                                <td className="px-6 py-3 text-center">
                                                    <button 
                                                        onClick={() => handleManualPayment(inv.tenantId, inv.reference)}
                                                        className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 transition-colors shadow-sm"
                                                    >
                                                        Confirmar Pagto
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {forecastInvoices.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Nenhum recebimento previsto pendente para este mês.</td></tr>}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* Module 2: Tenant Control */}
                {activeTab === 'tenants' && (
                    <div className="animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                             <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left whitespace-nowrap">
                                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-4">Empresa & Diagnóstico</th>
                                            <th className="px-6 py-4">Proprietário</th>
                                            <th className="px-6 py-4">Plano / Status</th>
                                            <th className="px-6 py-4 text-center">Serviços Ativos</th>
                                            <th className="px-6 py-4 text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {tenants.map(tenant => {
                                            const { status, reason } = getTenantHealth(tenant);
                                            return (
                                                <tr key={tenant._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="mt-1"><HealthIcon status={status} /></div>
                                                            <div>
                                                                <div className="font-bold text-gray-900">{tenant.name}</div>
                                                                <div className="text-xs text-gray-400 font-mono mb-1">{tenant.tenantName}</div>
                                                                <div className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded inline-block mb-2">{reason}</div>
                                                                <div>
                                                                    <button 
                                                                        onClick={() => { setSelectedTenant(tenant); setModalType('telemetry'); }}
                                                                        className="text-[10px] flex items-center gap-1 text-indigo-600 font-bold hover:underline"
                                                                    >
                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 01-2-2z" /></svg>
                                                                        Ver Telemetria
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900">{tenant.owner?.name}</div>
                                                        <div className="text-xs text-gray-500">{tenant.owner?.email}</div>
                                                        <div className="text-xs text-indigo-600">{tenant.owner?.phone}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${tenant.plan === 'single_tenant' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                            {tenant.plan === 'single_tenant' ? 'Exclusive' : 'Trial'}
                                                        </span>
                                                        <div className={`mt-1 text-xs font-bold uppercase ${tenant.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>{tenant.status}</div>
                                                        <div className="mt-2 text-[10px] text-gray-400">
                                                            <p>Início: {new Date(tenant.createdAt).toLocaleDateString()}</p>
                                                            <p>Fim: {new Date(tenant.trialEndsAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="mb-2">
                                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide border border-gray-200 px-2 py-0.5 rounded bg-gray-50">
                                                                {getSystemTypeLabel(tenant.systemType)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-center gap-2">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tenant.activeServices?.googleMaps ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-300 opacity-50'}`}>Maps</span>
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tenant.activeServices?.ecommerce ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-300 opacity-50'}`}>Loja</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex flex-col gap-2 items-center">
                                                            <button onClick={() => { setSelectedTenant(tenant); setModalType('details'); }} className="text-indigo-600 hover:text-indigo-800 font-bold text-xs uppercase hover:underline">
                                                                Detalhes
                                                            </button>
                                                            <button onClick={() => handleImpersonate(tenant._id)} className="text-gray-600 hover:text-gray-900 font-bold text-xs uppercase hover:underline border border-gray-200 px-3 py-1 rounded hover:bg-gray-50 w-full">
                                                                Acessar
                                                            </button>
                                                            <button onClick={() => toggleStatus(tenant._id, tenant.status)} className={`font-bold text-xs uppercase hover:underline ${tenant.status === 'blocked' ? 'text-green-600' : 'text-red-500'}`}>
                                                                {tenant.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Module 3: Service Requests */}
                {activeTab === 'services' && (
                    <div className="animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                             <div className="px-6 py-4 border-b border-gray-100 bg-orange-50 flex justify-between items-center">
                                <h3 className="font-bold text-orange-800">Fila de Solicitações Pendentes</h3>
                                <span className="bg-orange-200 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">{serviceRequests.length}</span>
                            </div>
                            {serviceRequests.length === 0 ? (
                                <div className="p-10 text-center text-gray-400">Nenhuma solicitação pendente no momento.</div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-3">Empresa</th>
                                            <th className="px-6 py-3">Proprietário</th>
                                            <th className="px-6 py-3">Data Solicitação</th>
                                            <th className="px-6 py-3">Serviço</th>
                                            <th className="px-6 py-3 text-right">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {serviceRequests.map((item, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">{item.tenant.name}</div>
                                                    <div className="text-xs text-gray-500">{item.tenant.tenantName}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium">{item.tenant.owner?.name}</div>
                                                    <div className="text-xs text-gray-500">{item.tenant.owner?.phone}</div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {new Date(item.request.requestedAt).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-indigo-700 uppercase text-xs tracking-wider">{item.request.type.replace('_', ' ')}</div>
                                                    <div className={`text-xs font-bold mt-0.5 ${item.request.amount > 0 ? 'text-green-600' : 'text-blue-600'}`}>
                                                        {item.request.amount > 0 ? `PAGO: ${formatCurrency(item.request.amount)}` : 'SOLICITAÇÃO INTERNA'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => handleExecuteService(item.tenant, item.request)}
                                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded shadow-sm text-xs uppercase tracking-wider transition-transform hover:scale-105"
                                                    >
                                                        Executar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Module 4: Communication */}
                {activeTab === 'communication' && (
                    <div className="animate-fade-in space-y-6">
                        {/* Creation Form */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                📣 Novo Comunicado
                            </h3>
                            <form onSubmit={handleCreateBroadcast} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
                                        <input 
                                            type="text" 
                                            required 
                                            className="w-full p-2 border rounded-lg bg-gray-50"
                                            value={commForm.title}
                                            onChange={e => setCommForm({...commForm, title: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                                            <select 
                                                className="w-full p-2 border rounded-lg bg-gray-50"
                                                value={commForm.type}
                                                onChange={e => setCommForm({...commForm, type: e.target.value as any})}
                                            >
                                                <option value="info">Informação (Azul)</option>
                                                <option value="warning">Aviso Importante (Amarelo)</option>
                                                <option value="success">Novidade/Sucesso (Verde)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Validade (Opcional)</label>
                                            <input 
                                                type="date" 
                                                className="w-full p-2 border rounded-lg bg-gray-50"
                                                value={commForm.expiresAt}
                                                onChange={e => setCommForm({...commForm, expiresAt: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mensagem</label>
                                    <textarea 
                                        required 
                                        className="w-full p-3 border rounded-lg bg-gray-50 h-24 resize-none"
                                        value={commForm.message}
                                        onChange={e => setCommForm({...commForm, message: e.target.value})}
                                    ></textarea>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md">
                                        Enviar Comunicado
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* History Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">Histórico de Envios</h3>
                                <input 
                                    type="month" 
                                    value={commPeriod}
                                    onChange={(e) => setCommPeriod(e.target.value)}
                                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-1.5 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3">Data Envio</th>
                                        <th className="px-6 py-3">Tipo</th>
                                        <th className="px-6 py-3">Título</th>
                                        <th className="px-6 py-3">Validade</th>
                                        <th className="px-6 py-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredBroadcasts.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum comunicado neste período.</td></tr>
                                    ) : (
                                        filteredBroadcasts.map(b => (
                                            <tr key={b._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                                        b.type === 'info' ? 'bg-blue-100 text-blue-700' : 
                                                        b.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                                    }`}>
                                                        {b.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium">{b.title}</td>
                                                <td className="px-6 py-4 text-gray-500">{b.expiresAt ? new Date(b.expiresAt).toLocaleDateString() : '-'}</td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <button 
                                                        onClick={() => { setSelectedBroadcast(b); setModalType('broadcast_view'); }}
                                                        className="text-indigo-600 hover:text-indigo-800 font-bold text-xs uppercase hover:underline"
                                                    >
                                                        Ver
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteBroadcast(b._id)}
                                                        className="text-red-500 hover:text-red-700 font-bold text-xs uppercase hover:underline"
                                                    >
                                                        Excluir
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </main>

            {/* Bottom Nav (Tabs Switcher) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-gray-200 p-1.5 rounded-full shadow-2xl flex gap-1 z-40">
                <button onClick={() => setActiveTab('financial')} className={`px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all ${activeTab === 'financial' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>Financeiro</button>
                <button onClick={() => setActiveTab('tenants')} className={`px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all ${activeTab === 'tenants' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>Tenants</button>
                <button onClick={() => setActiveTab('services')} className={`px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all ${activeTab === 'services' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>
                    Serviços {serviceRequests.length > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{serviceRequests.length}</span>}
                </button>
                <button onClick={() => setActiveTab('communication')} className={`px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all ${activeTab === 'communication' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>Comunicação</button>
            </div>
        </div>
    );
};

export default SuperAdmin;