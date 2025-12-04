
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FLUXOCLEAN_API } from '../config';

interface Request {
    type: 'extension' | 'upgrade';
    status: 'pending' | 'waiting_payment' | 'approved' | 'rejected';
    requestedAt: string;
    amount: number;
    referenceCode?: string;
}

interface Owner {
    name: string;
    email: string;
    phone: string;
}

interface Tenant {
  _id: string;
  name: string;
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
}

const SuperAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'all'>('requests');
  
  // Modal State
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [provisioningTenantId, setProvisioningTenantId] = useState<string | null>(null);
  const [provisioningTenantName, setProvisioningTenantName] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState('');

  const fetchTenants = async () => {
      try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${FLUXOCLEAN_API}/admin/tenants`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.status === 401) {
              handleLogout();
              return;
          }

          if (response.ok) {
              const data = await response.json();
              setTenants(data);
          }
      } catch (error) {
          console.error("Erro ao buscar tenants", error);
      }
  };

  useEffect(() => {
    fetchTenants();
    const interval = setInterval(fetchTenants, 30000); 
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
      localStorage.removeItem('token');
      navigate('/login');
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
      try {
          await fetch(`${FLUXOCLEAN_API}/admin/tenants/${id}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ status: newStatus })
          });
          fetchTenants();
      } catch (error) {
          alert('Erro ao atualizar status');
      }
  }

  const handleOpenProvision = (id: string, name: string) => {
      setProvisioningTenantId(id);
      setProvisioningTenantName(name);
      setTargetUrl('');
      setIsProvisionModalOpen(true);
  };

  const handleCopyId = (id: string) => {
      navigator.clipboard.writeText(id);
      alert(`ID ${id} copiado!`);
  };

  const approveRequest = async (id: string, requestType: string, tenantName: string) => {
      if (requestType === 'upgrade') {
          // Open Modal for URL input
          handleOpenProvision(id, tenantName);
          return;
      }

      if (!window.confirm("Confirma a aprovação manual da extensão?")) return;
      
      const token = localStorage.getItem('token');
      try {
          const response = await fetch(`${FLUXOCLEAN_API}/admin/tenants/${id}/approve-request`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ requestType })
          });
          if(response.ok) fetchTenants();
          else alert('Erro ao processar solicitação');
      } catch (error) { alert('Erro de conexão'); }
  }

  const submitProvisioning = async () => {
      if (!provisioningTenantId || !targetUrl) return;
      
      const token = localStorage.getItem('token');
      try {
          const response = await fetch(`${FLUXOCLEAN_API}/admin/tenants/${provisioningTenantId}/approve-request`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ requestType: 'upgrade', targetUrl })
          });
          if (response.ok) {
              setIsProvisionModalOpen(false);
              fetchTenants();
          } else {
              alert('Erro no provisionamento.');
          }
      } catch (error) { alert('Erro de conexão'); }
  };

  const tenantsWithRequests = tenants.filter(t => t.requests && t.requests.some(r => r.status === 'pending'));
  const displayTenants = activeTab === 'requests' ? tenantsWithRequests : tenants;

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      
      {/* Provisioning Modal */}
      {isProvisionModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                  <h3 className="text-xl font-bold mb-2">Provisionar: {provisioningTenantName}</h3>
                  <div className="bg-gray-100 p-3 rounded mb-4 text-sm font-mono flex justify-between items-center">
                      <span>ID: {provisioningTenantId}</span>
                      <button onClick={() => provisioningTenantId && handleCopyId(provisioningTenantId)} className="text-blue-600 font-bold hover:underline">COPIAR ID</button>
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-6 space-y-2">
                      <p className="font-bold">Passo a Passo Manual:</p>
                      <ol className="list-decimal list-inside space-y-2">
                          <li>Crie o Banco de Dados Single-Tenant (ex: Docker Mongo 8.0).</li>
                          <li>
                              Faça a migração manual dos dados filtrando pelo TenantID acima.
                              <span className="block text-xs text-gray-500 italic ml-4">Ex: Usar Studio 3T ou scripts de mongodump/restore com query filter.</span>
                          </li>
                          <li>Suba o Backend e Frontend do cliente (Portas dedicadas).</li>
                          <li>Teste o acesso ao novo Frontend.</li>
                          <li>Cole a URL final abaixo para liberar o acesso ao cliente.</li>
                      </ol>
                  </div>

                  <label className="block text-sm font-bold mb-1">URL Final do Sistema:</label>
                  <input 
                      type="text" 
                      placeholder="http://localhost:3011 ou https://cliente.fluxoclean.com" 
                      value={targetUrl}
                      onChange={e => setTargetUrl(e.target.value)}
                      className="w-full border p-2 rounded mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setIsProvisionModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancelar</button>
                      <button onClick={submitProvisioning} className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Confirmar e Liberar</button>
                  </div>
              </div>
          </div>
      )}

      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">FluxoClean Admin</h1>
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors">Sair</button>
        </div>

        <div className="flex gap-2 mb-6">
            <button onClick={() => setActiveTab('requests')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'requests' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-50'}`}>Solicitações ({tenantsWithRequests.length})</button>
            <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'all' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-50'}`}>Todas as Empresas</button>
        </div>
      
        <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa / ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ciclo / Datas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitações</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {displayTenants.map(tenant => {
                    let pendingReq = tenant.requests?.find(r => r.status === 'pending');
                    const isSingleTenant = tenant.plan === 'single_tenant';
                    const dueDate = isSingleTenant ? (tenant.subscriptionEndsAt || 'N/A') : tenant.trialEndsAt;
                    
                    return (
                    <tr key={tenant._id} className="hover:bg-gray-50 transition-colors">
                        {/* Company Info */}
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="font-medium text-gray-900">{tenant.name}</div>
                                <button onClick={() => handleCopyId(tenant._id)} title="Copiar ID" className="text-gray-400 hover:text-indigo-600">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </button>
                            </div>
                            <div className="text-xs text-gray-500 font-mono mt-1">{tenant._id}</div>
                            <div className="text-xs text-gray-400">{tenant.systemType} | {tenant.singleTenantUrl ? <a href={tenant.singleTenantUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Single Tenant</a> : 'Multi-tenant'}</div>
                        </td>

                        {/* Owner Info */}
                        <td className="px-6 py-4">
                            {tenant.owner ? (
                                <>
                                    <div className="font-medium text-gray-900 text-sm">{tenant.owner.name}</div>
                                    <div className="text-xs text-gray-500">{tenant.owner.email}</div>
                                    <div className="text-xs text-indigo-600 mt-0.5">{tenant.owner.phone}</div>
                                </>
                            ) : <span className="text-gray-400 text-xs">Sem dados</span>}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                            <div className="flex flex-col items-start">
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {tenant.status.toUpperCase()}
                                </span>
                                <div className="text-xs text-gray-500 mt-1">
                                    {isSingleTenant ? 'Premium' : (
                                        <span>Trial <span className="font-bold text-gray-700">({tenant.extensionCount || 0}/2)</span></span>
                                    )}
                                </div>
                            </div>
                        </td>

                        {/* Dates */}
                        <td className="px-6 py-4 text-xs text-gray-600">
                            <div>
                                <span className="font-bold text-gray-400">Cadastro:</span>
                                <div className="font-mono">{new Date(tenant.createdAt).toLocaleDateString('pt-BR')}</div>
                            </div>
                            <div className="mt-1">
                                <span className="font-bold text-gray-400">Vencimento:</span>
                                <div className={`font-mono font-bold ${new Date(dueDate) < new Date() ? 'text-red-500' : 'text-green-600'}`}>
                                    {dueDate !== 'N/A' ? new Date(dueDate).toLocaleDateString('pt-BR') : '-'}
                                </div>
                            </div>
                        </td>

                        {/* Requests */}
                        <td className="px-6 py-4">
                            {pendingReq ? (
                                <div className="bg-orange-50 border border-orange-200 p-2 rounded-md w-32 shadow-sm">
                                    <p className="font-bold text-orange-700 text-xs uppercase mb-1">{pendingReq.type === 'extension' ? 'Extensão' : 'Upgrade'}</p>
                                    <button 
                                        onClick={() => approveRequest(tenant._id, pendingReq!.type, tenant.name)}
                                        className={`mt-1 w-full py-1 text-white text-xs font-bold rounded shadow transition-transform active:scale-95 ${pendingReq.type === 'upgrade' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                                    >
                                        {pendingReq.type === 'upgrade' ? 'Provisionar' : 'Aprovar'}
                                    </button>
                                </div>
                            ) : '-'}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                            <button onClick={() => toggleStatus(tenant._id, tenant.status)} className={`font-bold text-xs hover:underline ${tenant.status === 'blocked' ? 'text-green-600' : 'text-red-600'}`}>
                                {tenant.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                            </button>
                        </td>
                    </tr>
                    )
                })}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
