
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
    websiteUrl?: string;
    plan?: 'basic' | 'bundle';
    domainPreferences?: { domain: string; priority: number }[];
    requestedAt?: string;
    legalAgreement?: {
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
    status: 'pending' | 'waiting_payment' | 'approved' | 'rejected' | 'completed';
    requestedAt: string;
    amount: number;
    referenceCode: string;
    preferenceId?: string;
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
  createdAt: string;
  owner?: Owner;
  address?: Address;
  growthInfo?: { found: boolean; description: string; rating: number };
  telemetry?: Telemetry;
  auditLog?: AuditLog[];
  legalAgreement?: LegalAgreement; 
  ecommerceLegalAgreement?: EcommerceLegalAgreement;
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

// ... (Components like NotificationModal, ActionConfirmationModal remain same) ...
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

const getTenantHealth = (tenant: Tenant): { status: string; reason: string; diagnosis: string; action: string } => {
    const tel = tenant.telemetry || {};
    const lastLogin = tel.lastLoginAt ? new Date(tel.lastLoginAt).getTime() : 0;
    const createdAt = new Date(tenant.createdAt).getTime();
    const now = new Date().getTime();
    const daysSinceLogin = (now - lastLogin) / (1000 * 60 * 60 * 24);
    const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
    const sales = tel.salesCountMonth || 0;

    if (daysSinceCreation < 3 && sales === 0) return { status: 'new', reason: 'Onboarding', diagnosis: 'Novo', action: 'Acompanhar' };
    if (daysSinceLogin > 7) return { status: 'critical', reason: 'Inativo', diagnosis: 'Risco Churn', action: 'Contatar' };
    return { status: 'healthy', reason: 'Ativo', diagnosis: 'OK', action: 'Manter' };
};

const HealthIcon: React.FC<{ status: string }> = ({ status }) => {
     switch (status) {
        case 'critical': return <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" title="Crítico"></span>;
        case 'warning': return <span className="w-3 h-3 rounded-full bg-yellow-400" title="Atenção"></span>;
        case 'healthy': return <span className="w-3 h-3 rounded-full bg-green-500" title="Saudável"></span>;
        default: return <span className="w-3 h-3 rounded-full bg-gray-300" title="Novo"></span>;
    }
};

const DetailRow: React.FC<{ label: string; value: React.ReactNode; tooltip?: string }> = ({ label, value, tooltip }) => (
    <div className="mb-2 last:mb-0" title={tooltip}>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</label>
        <div className="text-sm text-gray-700 font-medium wrap-break-word">
            {value || '-'}
        </div>
    </div>
);

const TenantDetailsModal: React.FC<{ isOpen: boolean; tenant: Tenant | null; onClose: () => void }> = ({ isOpen, tenant, onClose }) => {
    if(!isOpen || !tenant) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6">
                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-bold">{tenant.name}</h2>
                    <button onClick={onClose}>✕</button>
                </div>
                <div className="space-y-2">
                    <DetailRow label="ID" value={tenant._id} />
                    <DetailRow label="Slug" value={tenant.tenantName} />
                    <DetailRow label="Owner" value={tenant.owner?.name} />
                    <DetailRow label="Email" value={tenant.owner?.email} />
                    <DetailRow label="Status" value={tenant.status} />
                </div>
            </div>
        </div>
    );
};

const TelemetryModal: React.FC<{ isOpen: boolean; tenant: Tenant | null; onClose: () => void }> = ({ isOpen, tenant, onClose }) => {
    if(!isOpen || !tenant) return null;
    const tel = tenant.telemetry || {};
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-bold">Telemetria: {tenant.name}</h2>
                    <button onClick={onClose}>✕</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <DetailRow label="Vendas Mês" value={tel.salesCountMonth} />
                    <DetailRow label="Faturamento" value={tel.revenueMonth} />
                    <DetailRow label="Produtos" value={tel.productsCount} />
                    <DetailRow label="Último Login" value={tel.lastLoginAt ? new Date(tel.lastLoginAt).toLocaleString() : '-'} />
                </div>
             </div>
        </div>
    );
};

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
    
    // Identifica se é atualização ou cadastro novo para mudar o título
    const isWebsiteUpdate = payload.category === 'Atualização de Site';
    const websiteUrlToInsert = payload.websiteUrl || payload.generatedUrl;

    // Helper para download
    const downloadImage = (dataUrl: string, filename: string) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in">
                {/* Header */}
                <div className={`p-5 flex justify-between items-center ${isWebsiteUpdate ? 'bg-orange-600' : 'bg-green-600'} text-white`}>
                    <div>
                        <h3 className="text-xl font-bold">{isWebsiteUpdate ? 'Atualização de Site (Link)' : 'Cadastro Google Maps'}</h3>
                        <p className="text-sm opacity-90">Cliente: {tenantName}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col gap-6">
                    
                    {/* Seção 1: Instruções e Dados Rápidos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-gray-700 mb-3 border-b pb-2">Instruções de Execução</h4>
                            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                                {isWebsiteUpdate ? (
                                    <>
                                        <li>Acesse o perfil do cliente no <strong>Google Business Profile</strong>.</li>
                                        <li>Edite o campo <strong>Website</strong>.</li>
                                        <li>Insira a URL abaixo e salve.</li>
                                        <li>Copie o link público do perfil (Maps) e cole no campo ao final para concluir.</li>
                                    </>
                                ) : (
                                    <>
                                        <li>Use os dados abaixo para criar a ficha no Google.</li>
                                        <li>Baixe as fotos (Logo, Fachada, Interior) e faça o upload.</li>
                                        <li>Preencha descrição, horário e contatos exatamente como solicitado.</li>
                                        <li>Após criar, copie o link de compartilhamento do perfil e cole abaixo.</li>
                                    </>
                                )}
                            </ul>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-gray-700 mb-3 border-b pb-2">Dados de Contato</h4>
                            <div className="space-y-1 text-sm">
                                <p><span className="font-semibold">Responsável:</span> {payload.contactInfo?.name || '-'}</p>
                                <p><span className="font-semibold">Telefone:</span> {payload.contactInfo?.phone || '-'}</p>
                                <p><span className="font-semibold">Endereço Completo:</span></p>
                                <p className="bg-gray-100 p-2 rounded text-xs font-mono">{payload.contactInfo?.fullAddress || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Seção 2: URL do Site (Destaque se for atualização) */}
                    {isWebsiteUpdate && websiteUrlToInsert && (
                        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-center">
                            <p className="text-sm font-bold text-orange-800 uppercase mb-1">URL para inserir no Campo Website</p>
                            <code className="block text-lg font-mono bg-white border border-orange-300 p-3 rounded text-orange-900 select-all">
                                {websiteUrlToInsert}
                            </code>
                        </div>
                    )}

                    {/* Seção 3: Imagens (Apenas se houver) */}
                    {payload.images && payload.images.length > 0 && (
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Imagens para Upload
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {payload.images.map((img: any, idx: number) => (
                                    <div key={idx} className="border border-gray-200 rounded-lg p-2 flex flex-col items-center gap-2">
                                        <div className="h-32 w-full bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                                            <img src={img.data} alt={img.name} className="max-h-full max-w-full object-contain" />
                                        </div>
                                        <div className="w-full flex justify-between items-center px-1">
                                            <span className="text-xs font-bold text-gray-600 uppercase">{img.name}</span>
                                            <button 
                                                onClick={() => downloadImage(img.data, `${tenantName}-${img.name}.jpg`)}
                                                className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 font-bold"
                                            >
                                                Baixar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Seção 4: Dados Detalhados (Aparece se não for apenas update de link, ou se tiver dados) */}
                    {!isWebsiteUpdate && (
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                            <h4 className="font-bold text-gray-700 border-b pb-2">Ficha Técnica</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <DetailRow label="Categoria" value={payload.category} />
                                    <DetailRow label="Horário" value={payload.openingHours} />
                                    <DetailRow label="Descrição" value={payload.description} />
                                </div>
                                <div className="space-y-3">
                                    <DetailRow label="Serviços / Produtos" value={payload.services} />
                                    <DetailRow label="Site" value={payload.socialLinks?.website} />
                                    <DetailRow label="Instagram" value={payload.socialLinks?.instagram} />
                                    <DetailRow label="TikTok" value={payload.socialLinks?.tiktok} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer: Input do Link e Ação */}
                <div className="p-6 bg-white border-t border-gray-200 flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                            Link do Perfil no Google Maps (Obrigatório)
                        </label>
                        <input 
                            type="text" 
                            className="w-full border-2 border-indigo-100 rounded-lg p-3 text-sm focus:border-indigo-500 focus:ring-0 outline-none"
                            placeholder="Ex: https://maps.app.goo.gl/..." 
                            value={mapsLink} 
                            onChange={e => setMapsLink(e.target.value)} 
                        />
                        <p className="text-xs text-gray-500 mt-1">Este link será enviado ao cliente para ele ver o resultado (Modal Verde).</p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">
                            Cancelar
                        </button>
                        <button 
                            onClick={() => onComplete(tenantId, request.referenceCode, mapsLink, false)} 
                            disabled={!mapsLink}
                            className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Concluir Tarefa
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const SuperAdmin: React.FC = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [activeTab, setActiveTab] = useState<'financial' | 'tenants' | 'services' | 'communication'>('financial');
    const [financialView, setFinancialView] = useState<'history' | 'forecast'>('history');
    
    // Communication State
    const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
    const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastMessage | null>(null);
    const [commForm, setCommForm] = useState({ title: '', message: '', type: 'info', expiresAt: '' });
    const [commPeriod, setCommPeriod] = useState<string>(new Date().toISOString().slice(0, 7));
    
    // Modal States
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [modalType, setModalType] = useState<'details' | 'maps_exec' | 'telemetry' | 'broadcast_view' | null>(null);

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
            const response = await fetch(`${FLUXOCLEAN_API}/communication/broadcasts`, { 
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include' 
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
        } else if (['upgrade', 'ecommerce'].includes(request.type)) {
             // For upgrades/ecommerce, just mark as complete (logical switch)
             // No provision modal needed anymore
             handleCompleteService(tenant._id, request.referenceCode!, '', request.type === 'ecommerce');
        }
    };

    const handleCompleteService = async (tenantId: string, referenceCode: string, resultLink: string, isEcommerce: boolean) => { 
        try { 
            const response = await fetch(`${FLUXOCLEAN_API}/admin/tenants/${tenantId}/complete-service`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, 
                // Note: isEcommerce is passed but largely ignored by backend for 'google_maps' type which relies on type field
                body: JSON.stringify({ referenceCode, mapsLink: resultLink, isEcommerce }), 
                credentials: 'include' 
            }); 
            if (response.ok) { 
                closeModal(); 
                fetchTenants(); 
                setNotification({ isOpen: true, type: 'success', message: 'Serviço concluído/Liberado com sucesso!' });
            } 
        } catch (e) { 
            setNotification({ isOpen: true, type: 'error', message: 'Erro ao completar serviço.' });
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
            if (t.plan === 'single_tenant') {
                mrr += 197; 
                if (t.activeServices?.ecommerce) {
                     acc.bundle++;
                     mrr += 100;
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
                if (['approved', 'completed'].includes(r.status)) {
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
                        dueDate: r.requestedAt, 
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
                const isInternalTask = r.amount === 0 && r.status === 'pending' && r.type === 'google_maps';
                const manualServiceTypes = ['google_maps'];
                const isPaidManualTask = r.amount > 0 && r.status === 'approved' && manualServiceTypes.includes(r.type);
                // Also show paid upgrades so admin can click "Execute" which just completes it now
                const isPaidUpgrade = r.amount > 0 && r.status === 'approved' && r.type === 'upgrade';

                if (isInternalTask || isPaidManualTask || isPaidUpgrade) {
                    list.push({ tenant: t, request: r });
                }
            });
        });
        return list.sort((a,b) => new Date(b.request.requestedAt).getTime() - new Date(a.request.requestedAt).getTime());
    }, [tenants]);
    
    const filteredBroadcasts = useMemo(() => {
        if(!commPeriod) return broadcasts;
        const [year, month] = commPeriod.split('-').map(Number);
        return broadcasts.filter(b => {
            const d = new Date(b.createdAt);
            return d.getFullYear() === year && (d.getMonth() + 1) === month;
        });
    }, [broadcasts, commPeriod]);

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
                type={notification.type as any} 
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
                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 01-2-2z" /></svg>
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
                                                        Executar / Concluir
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
