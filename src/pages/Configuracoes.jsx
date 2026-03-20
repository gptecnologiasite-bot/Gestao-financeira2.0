import React, { useState, useEffect } from 'react';
import { Save, Church, Bell, Shield, Palette, FileText, Image, Eye, EyeOff, Lock, Unlock, Trash2, Edit2, PlusCircle, User, Check, Search, Filter, X, UserCheck, Package, Send, MessageSquare } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useBranding } from '../contexts/BrandingContext';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';

export default function Configuracoes() {
  const { isDark, toggleTheme } = useTheme();
  const { branding, updateBranding } = useBranding();
  const { user } = useAuth();
  const { finances, demoEnabled } = useFinance();
  
  useEffect(() => {
    // Limpar notificação de novas mensagens ao entrar nas configurações
    localStorage.removeItem('portal_unread_messages');
  }, []);
  const [saved, setSaved] = useState(false);
  const [logoFileName, setLogoFileName] = useState('');
  const [config, setConfig] = useState({
    nomeIgreja: 'Igreja Evangélica',
    cnpj: '',
    endereco: '',
    telefone: '',
    email: '',
    notificacoes: true,
  });
  const [portalText, setPortalText] = useState('');
  const [portalCategory, setPortalCategory] = useState('Geral');
  const [portalPhotos, setPortalPhotos] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [isSelectingData, setIsSelectingData] = useState(false);
   const [dataSearchTerm, setDataSearchTerm] = useState('');
   const [selectedModule, setSelectedModule] = useState('financeiro');
   const [membrosData, setMembrosData] = useState([]);
   const [visitantesData, setVisitantesData] = useState([]);
   const [patrimonioData, setPatrimonioData] = useState([]);
   const [chatMessages, setChatMessages] = useState(() => {
     try {
       return JSON.parse(localStorage.getItem('portal_transparencia_chat') || '[]');
     } catch (e) {
       return [];
     }
   });
   const [adminReplyText, setAdminReplyText] = useState('');

  const [portalItems, setPortalItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('portal_transparencia_itens'));
      if (Array.isArray(saved) && saved.length > 0) return saved;
      
      const isDemo = localStorage.getItem('finance_demo_enabled') === '1';
      if (isDemo) {
        return [{
          id: 'demo-1',
          text: 'Relatório Mensal de Transparência - Fevereiro 2024',
          category: 'Financeiro',
          photos: [],
          selectedData: [
            { id: 101, type: 'entrada', value: 3500, category: 'Oferta', date: '2024-03-01', description: 'Oferta culto de domingo', _type: 'financeiro' },
            { id: 103, type: 'saida', value: 450, category: 'Energia', date: '2024-03-06', description: 'Conta de luz', _type: 'financeiro' }
          ],
          adminName: 'Sistema',
          adminPhoto: '',
          visible: true,
          locked: true,
          createdAt: new Date('2024-03-01').toISOString()
        }];
      }
      return [];
    } catch {
      return [];
    }
  });

  const categories = [
    { id: 'geral', label: 'Geral', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    { id: 'financeiro', label: 'Financeiro', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { id: 'patrimonio', label: 'Patrimônio', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    { id: 'membros', label: 'Membros', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
    { id: 'eventos', label: 'Eventos', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (result) {
        updateBranding({ logo: result });
        setLogoFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isSelectingData) {
      const savedMembros = JSON.parse(localStorage.getItem('igreja_membros') || '[]');
      const savedVisitantes = JSON.parse(localStorage.getItem('igreja_visitantes') || '[]');
      const savedBens = JSON.parse(localStorage.getItem('igreja_patrimonio_bens') || '[]');
      
      let m = Array.isArray(savedMembros) ? savedMembros : [];
      let v = Array.isArray(savedVisitantes) ? savedVisitantes : [];
      let p = Array.isArray(savedBens) ? savedBens : [];

      if (demoEnabled) {
        if (m.length === 0) m = [
          { id: 1001, nome: 'Maria Silva', telefone: '(11) 98888-7777', email: 'maria@email.com', endereco: 'Rua das Flores, 123', ministerio: 'Louvor' },
          { id: 1002, nome: 'João Santos', telefone: '(11) 97777-6666', email: 'joao@email.com', endereco: 'Av. Brasil, 500', ministerio: 'Infantil' }
        ];
        if (v.length === 0) v = [
          { id: 2001, nome: 'Ricardo Santos', dataVisita: '2024-03-15', observacoes: 'Gostou do louvor, mora no bairro.' },
          { id: 2002, nome: 'Alice Ferreira', dataVisita: '2024-03-10', observacoes: 'Visitando com a família do João.' }
        ];
        if (p.length === 0) p = [
          { id: 3001, nome: 'Mesa de Som Yamaha 16ch', valor: 4500, dataAquisicao: '2022-05-10', estado: 'Bom' },
          { id: 3002, nome: 'Projetor Epson', valor: 3200, dataAquisicao: '2023-01-15', estado: 'Novo' }
        ];
      }

      setMembrosData(m);
      setVisitantesData(v);
      setPatrimonioData(p);
    }
  }, [isSelectingData, demoEnabled]);

  // Capturar item enviado de outros módulos (Membros, Visitantes, etc)
  useEffect(() => {
    const pending = localStorage.getItem('portal_pending_selection');
    if (pending) {
      try {
        const item = JSON.parse(pending);
        if (item && item.id) {
          // Adicionar sem apagar os outros já selecionados
          setSelectedTransactions(prev => {
            const exists = prev.some(p => p.id === item.id && p._type === item._type);
            if (exists) return prev;
            return [...prev, item];
          });
          
          setPortalCategory(item._type === 'membros' ? 'Membros' : item._type === 'patrimonio' ? 'Patrimônio' : 'Geral');
          setPortalText(`Publicação de ${item.nome || item.description || 'Item'}`);
          
          // Rolar até a área do Portal com id específico
          setTimeout(() => {
            const element = document.getElementById('portal-section');
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
              element.classList.add('ring-4', 'ring-emerald-500/20', 'duration-1000');
              setTimeout(() => element.classList.remove('ring-4', 'ring-emerald-500/20'), 3000);
            }
          }, 300);
        }
      } catch (e) {
        console.error("Error parsing pending portal item", e);
      }
      localStorage.removeItem('portal_pending_selection');
    }
  }, []);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (result) {
        setPortalPhotos(prev => [...prev, result]);
      }
    };
    reader.readAsDataURL(file);
  };

  const removePortalPhoto = (index) => {
    setPortalPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handlePublishPortal = () => {
    const text = portalText.trim();
    if (!text && portalPhotos.length === 0 && selectedTransactions.length === 0) return;
    const newItem = {
      id: Date.now().toString(),
      text,
      category: portalCategory,
      photos: portalPhotos,
      selectedData: selectedTransactions, // Inclui as transações selecionadas
      adminName: user?.nome || 'Administrador',
      adminPhoto: user?.foto || '',
      visible: true,
      locked: false,
      createdAt: new Date().toISOString()
    };
    const next = [newItem, ...portalItems];
    setPortalItems(next);
    localStorage.setItem('portal_transparencia_itens', JSON.stringify(next));
    setPortalText('');
    setPortalCategory('Geral');
    setPortalPhotos([]);
    setSelectedTransactions([]);
  };

  // Sincronizar chat e notificações
  useEffect(() => {
    const loadChat = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('portal_transparencia_chat') || '[]');
        setChatMessages(saved);
      } catch (e) {
        setChatMessages([]);
      }
    };
    
    // Escutar mudanças de outro no storage (Portal)
    window.addEventListener('storage', (e) => {
      if (e.key === 'portal_transparencia_chat') loadChat();
    });
    
    loadChat();
    
    // Limpar notificações ao entrar nas configurações
    localStorage.removeItem('portal_unread_messages');
    
    const interval = setInterval(loadChat, 3000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadChat);
    };
  }, []);

  // Auto-scroll no chat administrativo quando chegar nova mensagem
  useEffect(() => {
    const container = document.getElementById('admin-chat-container');
    if (container) container.scrollTop = container.scrollHeight;
  }, [chatMessages]);

  const handleAdminReply = (e) => {
    e.preventDefault();
    if (!adminReplyText.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      name: user?.nome || 'Administrador',
      text: adminReplyText.trim(),
      createdAt: new Date().toISOString(),
      isAdmin: true
    };
    
    const next = [...chatMessages, newMessage];
    setChatMessages(next);
    localStorage.setItem('portal_transparencia_chat', JSON.stringify(next));
    localStorage.removeItem('portal_unread_messages'); // Garante que limpou ao responder
    setAdminReplyText('');
    
    // Scroll para o fim
    setTimeout(() => {
      const container = document.getElementById('admin-chat-container');
      if (container) container.scrollTop = container.scrollHeight;
    }, 100);
  };

  const toggleDataSelection = (item, type = selectedModule) => {
    const itemWithType = { ...item, _type: type };
    const isAlreadySelected = selectedTransactions.some(t => t.id === item.id && t._type === type);
    if (isAlreadySelected) {
      setSelectedTransactions(prev => prev.filter(t => !(t.id === item.id && t._type === type)));
    } else {
      setSelectedTransactions(prev => [...prev, itemWithType]);
    }
  };

  const filteredData = React.useMemo(() => {
    let base = [];
    if (selectedModule === 'financeiro') base = finances?.transactions || [];
    else if (selectedModule === 'membros') base = membrosData;
    else if (selectedModule === 'visitantes') base = visitantesData;
    else if (selectedModule === 'patrimonio') base = patrimonioData;

    return base.filter(t =>
      (t.description || t.nome || '').toLowerCase().includes((dataSearchTerm || '').toLowerCase()) ||
      (t.category || t.estado || '').toLowerCase().includes((dataSearchTerm || '').toLowerCase())
    );
  }, [finances, dataSearchTerm, selectedModule, membrosData, visitantesData, patrimonioData]);

  const toggleItemVisibility = (id) => {
    const next = portalItems.map(item =>
      item.id === id ? { ...item, visible: !item.visible } : item
    );
    setPortalItems(next);
    localStorage.setItem('portal_transparencia_itens', JSON.stringify(next));
  };

  const toggleItemLock = (id) => {
    const next = portalItems.map(item =>
      item.id === id ? { ...item, locked: !item.locked } : item
    );
    setPortalItems(next);
    localStorage.setItem('portal_transparencia_itens', JSON.stringify(next));
  };

  const deletePortalItem = (id) => {
    const next = portalItems.filter(item => item.id !== id);
    setPortalItems(next);
    localStorage.setItem('portal_transparencia_itens', JSON.stringify(next));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Configurações</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gerencie as preferências do sistema.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Dados da Igreja */}
        <div className="bg-white dark:bg-gray-900 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <Church className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Dados da Igreja</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Igreja</label>
              <input
                type="text"
                value={config.nomeIgreja}
                onChange={(e) => setConfig({ ...config, nomeIgreja: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CNPJ</label>
              <input
                type="text"
                placeholder="00.000.000/0000-00"
                value={config.cnpj}
                onChange={(e) => setConfig({ ...config, cnpj: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
              <input
                type="text"
                placeholder="(11) 99999-9999"
                value={config.telefone}
                onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
              <input
                type="email"
                placeholder="contato@igreja.com"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endereço</label>
              <input
                type="text"
                placeholder="Rua Exemplo, 100"
                value={config.endereco}
                onChange={(e) => setConfig({ ...config, endereco: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Aparência */}
        <div className="bg-white dark:bg-gray-900 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
              <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Aparência</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tema escuro</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Alterna entre tema claro e escuro</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                isDark ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                isDark ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Notificações */}
        <div className="bg-white dark:bg-gray-900 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Notificações</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Alertas financeiros</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Receber alertas de movimentações</p>
            </div>
            <button
              type="button"
              onClick={() => setConfig(c => ({ ...c, notificacoes: !c.notificacoes }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                config.notificacoes ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                config.notificacoes ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
        {/* Identidade Visual */}
        <div className="bg-white dark:bg-gray-900 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
              <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Identidade Visual</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título do Sistema</label>
              <input
                type="text"
                value={branding.title}
                onChange={(e) => updateBranding({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL da Logo (ou Favicon)</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={branding.logo}
                  onChange={(e) => updateBranding({ logo: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://exemplo.com/logo.png"
                />
                <div className="w-10 h-10 rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden shrink-0 bg-gray-50 dark:bg-gray-800 p-1">
                  <img src={branding.logo} alt="Preview" className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                  Subir imagem
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>
                {logoFileName ? (
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]" title={logoFileName}>
                    {logoFileName}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500">Nenhum arquivo selecionado</span>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-1 italic">Dica: Use uma imagem quadrada para melhores resultados no favicon e sidebar.</p>
            </div>
          </div>
        </div>

        {user?.role === 'ADMIN' || user?.permissoes?.portal ? (
          <div id="portal-section" className="bg-white dark:bg-gray-900 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Portal da Transparência</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                  <select
                    value={portalCategory}
                    onChange={(e) => setPortalCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.label}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título/Descrição Curta</label>
                  <input
                    type="text"
                    value={portalText}
                    onChange={(e) => setPortalText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ex: Balancete Mensal - Maio"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dados do Sistema (Opcional)</label>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setIsSelectingData(true)}
                    className="w-full flex items-center justify-between px-4 py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm font-bold text-gray-500"
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      {selectedTransactions.length > 0
                        ? `${selectedTransactions.length} itens selecionados`
                        : 'Selecionar dados do sistema (Financeiro, Membros...)'
                      }
                    </div>
                    <PlusCircle className="w-4 h-4" />
                  </button>

                  {selectedTransactions.length > 0 && (
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                      {selectedTransactions.map(t => (
                        <div key={`${t._type}_${t.id}`} className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-[10px] font-bold uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">[{t._type}]</span>
                            <span className="text-blue-700 dark:text-blue-300 truncate max-w-[150px]">{t.description || t.nome}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {t.value !== undefined && <span className="text-gray-500">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.value)}</span>}
                            {t.valor !== undefined && <span className="text-gray-500">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.valor)}</span>}
                            <button onClick={() => toggleDataSelection(t, t._type)} className="text-red-500 hover:text-red-700"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Páginas da Publicação (Fotos)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                  {portalPhotos.map((photo, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800">
                      <img src={photo} alt={`Página ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePortalPhoto(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] py-0.5 text-center font-bold uppercase">Página {index + 1}</div>
                    </div>
                  ))}
                  <label className="cursor-pointer aspect-square rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                    <PlusCircle className="w-6 h-6 text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Adicionar</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>
                <p className="text-[10px] text-gray-400 italic">Você pode adicionar várias páginas para esta transparência.</p>
              </div>

              <button
                type="button"
                onClick={handlePublishPortal}
                className="w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md active:scale-95"
              >
                <FileText className="w-4 h-4" />
                Publicar no Portal
              </button>

              {portalItems.length > 0 && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Gerenciar Publicações</h3>
                  <div className="space-y-3">
                    {portalItems.map((item) => (
                      <div key={item.id} className="group p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-900 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                {new Intl.DateTimeFormat('pt-BR').format(new Date(item.createdAt))}
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${
                                categories.find(c => c.label === item.category)?.color || 'bg-gray-100 text-gray-600'
                              }`}>
                                {item.category || 'Geral'}
                              </span>
                              {!item.visible && (
                                <span className="text-[9px] font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Oculto</span>
                              )}
                              {item.locked && (
                                <span className="text-[9px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Bloqueado</span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">{item.text}</p>
                            <div className="flex items-center gap-1.5 py-1">
                               <div className="w-4 h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                                  {item.adminPhoto ? <img src={item.adminPhoto} className="w-full h-full object-cover" /> : <User className="w-2.5 h-2.5 text-gray-400" />}
                               </div>
                               <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Publicado por: {item.adminName}</span>
                            </div>
                            {item.photos && item.photos.length > 0 && (
                              <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-hide">
                                {item.photos.map((photo, idx) => (
                                  <div key={idx} className="w-10 h-10 rounded-md bg-gray-200 overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
                                    <img src={photo} className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => toggleItemVisibility(item.id)}
                              className={`p-2 rounded-lg transition-colors ${item.visible ? 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'}`}
                              title={item.visible ? "Ocultar" : "Mostrar"}
                            >
                              {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleItemLock(item.id)}
                              className={`p-2 rounded-lg transition-colors ${!item.locked ? 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'}`}
                              title={item.locked ? "Desbloquear" : "Bloquear"}
                            >
                              {item.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>
                            <button
                              type="button"
                              className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deletePortalItem(item.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Mensagens e Suporte do Portal</h3>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div id="admin-chat-container" className="h-64 overflow-y-auto p-4 space-y-4 font-medium scrollbar-hide">
                    {chatMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-xs uppercase font-black italic tracking-widest">Nenhuma mensagem ainda</p>
                      </div>
                    ) : (
                      chatMessages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.isAdmin ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                            msg.isAdmin 
                              ? 'bg-blue-600 text-white rounded-tr-none' 
                              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-600'
                          }`}>
                            <div className="flex items-center justify-between gap-4 mb-1">
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{msg.name}</span>
                              <span className="text-[9px] opacity-50">{new Date(msg.createdAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                    <input
                      type="text"
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdminReply(e)}
                      placeholder="Escreva sua resposta..."
                      className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 outline-none transition-all dark:text-white"
                    />
                    <button 
                      type="button"
                      onClick={handleAdminReply}
                      className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 italic">* Visitantes do portal verão suas respostas instantaneamente.</p>
              </div>
            </div>
          </div>
        ) : null}

      {/* Salvar */}
        <div className="flex justify-end">
          <button
            type="submit"
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm transition-all duration-200 ${
              saved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Save className="w-4 h-4" />
            {saved ? 'Configurações salvas!' : 'Salvar Configurações'}
          </button>
        </div>
      </form>

      {/* Modal de Seleção de Dados */}
      {isSelectingData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-4xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-100 dark:border-gray-800">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic">Selecionar Dados</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Marque os lançamentos para o portal</p>
              </div>
              <button onClick={() => setIsSelectingData(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all text-gray-400"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar descrição ou categoria..."
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  value={dataSearchTerm}
                  onChange={(e) => setDataSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex p-2 bg-gray-50 dark:bg-gray-800/50 gap-1 overflow-x-auto border-b border-gray-100 dark:border-gray-800 no-scrollbar">
               {[
                 { id: 'financeiro', label: 'Financeiro' },
                 { id: 'membros', label: 'Membros' },
                 { id: 'visitantes', label: 'Visitantes' },
                 { id: 'patrimonio', label: 'Patrimônio' }
               ].map(mod => (
                 <button 
                   key={mod.id} 
                   onClick={() => setSelectedModule(mod.id)}
                   className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedModule === mod.id ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                   {mod.label}
                 </button>
               ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredData.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm font-bold uppercase tracking-widest italic">Nenhum dado encontrado em {selectedModule}</div>
              ) : (
                filteredData.map(t => {
                  const isSelected = selectedTransactions.some(item => item.id === t.id && item._type === selectedModule);
                  return (
                    <button
                      key={`${selectedModule}_${t.id}`}
                      onClick={() => toggleDataSelection(t)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ring-2 ring-blue-500/20'
                          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                          {isSelected ? <Check className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full border-2 border-current" />}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black uppercase tracking-tighter text-gray-900 dark:text-white">{t.description || t.nome}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t.category || t.estado || selectedModule}</span>
                            <span className="text-[10px] font-bold text-gray-400">•</span>
                            <span className="text-[10px] font-bold text-gray-400">{t.date || t.dataVisita || t.dataAquisicao ? new Intl.DateTimeFormat('pt-BR').format(new Date(t.date || t.dataVisita || t.dataAquisicao)) : 'Sem data'}</span>
                          </div>
                        </div>
                      </div>
                      {(t.value !== undefined || t.valor !== undefined) && (
                        <span className={`text-sm font-black tracking-widest ${t.type === 'entrada' ? 'text-green-600' : t.type === 'saida' ? 'text-red-500' : 'text-gray-600'}`}>
                          {t.type === 'entrada' ? '+' : t.type === 'saida' ? '-' : ''} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.value || t.valor)}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end">
              <button
                onClick={() => setIsSelectingData(false)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 font-black uppercase tracking-widest text-xs"
              >
                Concluir Seleção
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
