import React, { useState, useEffect } from 'react';
import { FileText, MessageCircle, Send, Image as ImageIcon, Lock, User, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, DollarSign, Download } from 'lucide-react';
import { useBranding } from '../contexts/BrandingContext';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const safeParseJSON = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export default function PortalTransparencia() {
  const { branding } = useBranding();
  const { user } = useAuth();
  const [items, setItems] = useState(() => {
    const saved = safeParseJSON(localStorage.getItem('portal_transparencia_itens'));
    const list = Array.isArray(saved) ? saved : [];
    // Filtrar apenas os visíveis para o público
    return list.filter(item => item.visible !== false);
  });
  const [chatMessages, setChatMessages] = useState(() => {
    const saved = safeParseJSON(localStorage.getItem('portal_transparencia_chat'));
    return Array.isArray(saved) ? saved : [];
  });
  const [chatName, setChatName] = useState('');
  const [chatText, setChatText] = useState('');
  const [exportingId, setExportingId] = useState(null);

  const exportPublicationPDF = async (item) => {
    setExportingId(item.id);
    try {
      const element = document.getElementById(`publication-${item.id}`);
      if (!element) throw new Error("Publicação não encontrada");

      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        backgroundColor: branding.isDark ? '#030712' : '#ffffff' // Ajustar para o tema atual
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`publicacao-${item.category || 'geral'}-${item.id}.pdf`);
    } catch (err) {
      console.error("Erro ao exportar PDF:", err);
      alert("Erro ao gerar PDF. Certifique-se de que o conteúdo carregou completamente.");
    } finally {
      setExportingId(null);
    }
  };

  // Sincronizar chat e itens: Robusto contra mudanças em outras abas e na mesma página
  useEffect(() => {
    const syncChat = () => {
      try {
        const raw = localStorage.getItem('portal_transparencia_chat');
        const saved = raw ? JSON.parse(raw) : [];
        if (Array.isArray(saved)) {
          setChatMessages(prev => {
            if (JSON.stringify(prev) === JSON.stringify(saved)) return prev;
            return saved;
          });
        }
      } catch (err) {
        console.error("Erro ao sincronizar chat:", err);
      }
    };

    const syncItems = () => {
      try {
        const raw = localStorage.getItem('portal_transparencia_itens');
        const saved = raw ? JSON.parse(raw) : [];
        if (Array.isArray(saved)) {
          // Filtrar apenas os visíveis para o público
          const visibleOnly = saved.filter(item => item.visible !== false);
          setItems(prev => {
            if (JSON.stringify(prev) === JSON.stringify(visibleOnly)) return prev;
            return visibleOnly;
          });
        }
      } catch (err) {
        console.error("Erro ao sincronizar itens:", err);
      }
    };
    
    const handleStorageChange = (e) => {
      if (e.key === 'portal_transparencia_chat') syncChat();
      if (e.key === 'portal_transparencia_itens') syncItems();
    };

    // Escutar mudanças externas (outras abas)
    window.addEventListener('storage', handleStorageChange);
    
    // Polling de segurança (mesma aba ou falhas de evento)
    const interval = setInterval(() => {
      syncChat();
      syncItems();
    }, 2000);

    syncChat(); // Carga inicial
    syncItems();
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Auto-scroll quando chegar mensagem (sua ou do admin)
  useEffect(() => {
    const container = document.getElementById('portal-chat-container');
    if (container) container.scrollTop = container.scrollHeight;
  }, [chatMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = chatText.trim();
    if (!text) return;
    const message = {
      id: Date.now().toString(),
      name: chatName.trim() || 'Visitante',
      text,
      createdAt: new Date().toISOString(),
    };
    
    // Resposta automática instantânea
    const autoReply = {
      id: (Date.now() + 1).toString(),
      name: 'Igreja (Suporte)',
      text: 'Olá! Recebemos sua mensagem. Para agilizar o atendimento, você também pode entrar em contato pelo WhatsApp (11) 99999-9999 ou vir nos visitar em nossos cultos aos domingos às 19h.',
      createdAt: new Date().toISOString(),
      isAuto: true
    };

    const nextMessages = [...chatMessages, message, autoReply];
    setChatMessages(nextMessages);
    localStorage.setItem('portal_transparencia_chat', JSON.stringify(nextMessages));
    localStorage.setItem('portal_unread_messages', 'true'); // Sinaliza para o administrador
    setChatText('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white p-2 flex items-center justify-center shadow-md overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800">
            <img src={branding.logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-black uppercase tracking-tighter italic leading-none">{branding.title || 'Portal da Transparência'}</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">Transparência e Gestão Eclesiástica</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-4xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
              <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-sm overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800">
                <img src={branding.logo} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest">Publicações</h2>
            </div>
            {items.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6">
                Nenhuma publicação liberada no momento.
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                             {item.category || 'Geral'}
                           </span>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                             {(() => {
                               try {
                                 const d = new Date(item.createdAt);
                                 return isNaN(d.getTime()) ? 'Data Indisponível' : new Intl.DateTimeFormat('pt-BR').format(d);
                               } catch {
                                 return 'Data Indisponível';
                               }
                             })()}
                           </p>
                        </div>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{item.text}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                              {item.adminPhoto ? <img src={item.adminPhoto} className="w-full h-full object-cover" /> : <User className="w-3 h-3 text-gray-400" />}
                           </div>
                           <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Responsável: {item.adminName}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 text-gray-900 dark:text-gray-100">
                        <div className="flex gap-2">
                           {item.locked && (
                             <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" title="Publicação Verificada/Bloqueada">
                               <Lock className="w-4 h-4" />
                             </div>
                           )}
                           {(user?.role === 'ADMIN' || user?.permissoes?.portal) && (
                             <button 
                               onClick={() => exportPublicationPDF(item)}
                               disabled={exportingId === item.id}
                               className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-500/20 font-black uppercase tracking-widest text-[9px] transition-all active:scale-95 disabled:opacity-50"
                             >
                               {exportingId === item.id ? (
                                 <div className="animate-spin h-3 w-3 border-2 border-white/30 border-t-white rounded-full"></div>
                               ) : <FileText className="w-3 h-3" />}
                               EXPORTAR PARA PDF
                             </button>
                           )}
                        </div>
                      </div>
                    </div>

                    <div id={`publication-${item.id}`} className="space-y-4">
                      <div className="p-1"> {/* Wrapper para garantir padding no canvas */}
                        <div className="space-y-4">
                          {(item.selectedData && item.selectedData.length > 0) && (
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                              <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Dados Consolidados</h3>
                                <div className="flex gap-4">
                                  <div className="flex items-center gap-1.5">
                                    <TrendingUp className="w-3 h-3 text-green-500" />
                                    <span className="text-[10px] font-black text-green-600">
                                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                        item.selectedData.reduce((acc, t) => {
                                          const v = t?.value ?? t?.valor;
                                          return acc + (t?._type === 'financeiro' && t?.type === 'entrada' && typeof v === 'number' ? v : 0);
                                        }, 0)
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <TrendingDown className="w-3 h-3 text-red-500" />
                                    <span className="text-[10px] font-black text-red-600">
                                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                        item.selectedData.reduce((acc, t) => {
                                          const v = t?.value ?? t?.valor;
                                          return acc + (t?._type === 'financeiro' && t?.type === 'saida' && typeof v === 'number' ? v : 0);
                                        }, 0)
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="overflow-x-auto text-gray-900 dark:text-gray-100">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Descrição</th>
                                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Categoria</th>
                                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Valor</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                     {item.selectedData.map((t, idx) => {
                                      if (!t) return null;
                                      const val = t.value ?? t.valor;
                                      const description = t.description || t.nome || 'Sem descrição';
                                      const category = t.category || t.estado || t._type || 'Geral';
                                      
                                      return (
                                        <tr key={idx} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-colors text-gray-900 dark:text-gray-100">
                                          <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                              {t._type === 'financeiro' ? (
                                                t.type === 'entrada' ? <ArrowUpRight className="w-3 h-3 text-green-500" /> : <ArrowDownRight className="w-3 h-3 text-red-500" />
                                              ) : (
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                              )}
                                              <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tighter">{description}</span>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{category}</td>
                                          <td className="px-4 py-3 text-xs font-black text-right tracking-widest text-gray-600">
                                            {typeof val === 'number' ? (
                                              <span className={t.type === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)}
                                              </span>
                                            ) : val !== undefined ? (
                                              <span>{val}</span>
                                            ) : (
                                              <span className="text-gray-300">-</span>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {(item.photos && item.photos.length > 0) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {item.photos.map((photo, idx) => (
                                <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                                  <img src={photo} alt={`Página ${idx + 1}`} className="w-full h-auto object-cover max-h-96" />
                                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[9px] font-bold text-white uppercase tracking-widest">
                                    Página {idx + 1}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

            <div className="bg-white dark:bg-gray-900 rounded-4xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <MessageCircle className="w-5 h-5 font-black uppercase tracking-widest" />
                <h2 className="text-sm font-black uppercase tracking-widest">Perguntas</h2>
              </div>
              <div id="portal-chat-container" className="h-80 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
                {chatMessages.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  Nenhuma pergunta enviada ainda.
                </div>
              ) : (
                chatMessages.map((message) => {
                  const isOfficial = message.isAdmin || message.isAuto;
                  return (
                    <div key={message.id} className={`flex flex-col ${isOfficial ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
                        isOfficial 
                          ? 'bg-blue-600/90 text-white rounded-tr-none' 
                          : 'bg-gray-50 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700'
                      }`}>
                        <div className={`flex items-center justify-between gap-4 mb-1 text-[9px] font-black uppercase tracking-widest ${
                          isOfficial ? 'opacity-70' : 'text-gray-400'
                        }`}>
                          <span>{message.name}</span>
                          <span className="opacity-40">{new Intl.DateTimeFormat('pt-BR').format(new Date(message.createdAt))}</span>
                        </div>
                        <p className="text-sm leading-relaxed">{message.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSend} className="space-y-3">
              <input
                type="text"
                placeholder="Seu nome (opcional)"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escreva sua pergunta"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
