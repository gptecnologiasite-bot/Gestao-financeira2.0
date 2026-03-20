import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { X } from 'lucide-react';

export default function TransactionModal({ isOpen, onClose }) {
  const { finances, addTransaction } = useFinance();
  const [formData, setFormData] = useState({
    type: 'entrada',
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: finances.categories[0],
    value: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    addTransaction({
      ...formData,
      value: parseFloat(formData.value)
    });
    // Reset form
    setFormData({
      type: 'entrada',
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: finances.categories[0],
      value: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Novo Lançamento</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex gap-4 mb-6">
            <label className={`flex-1 flex justify-center items-center py-2 px-4 rounded-lg cursor-pointer border ${formData.type === 'entrada' ? 'bg-green-50 border-green-200 text-green-700 font-medium' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              <input type="radio" className="hidden" name="type" value="entrada" checked={formData.type === 'entrada'} onChange={(e) => setFormData({...formData, type: e.target.value})} />
              Entrada
            </label>
            <label className={`flex-1 flex justify-center items-center py-2 px-4 rounded-lg cursor-pointer border ${formData.type === 'saida' ? 'bg-red-50 border-red-200 text-red-700 font-medium' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              <input type="radio" className="hidden" name="type" value="saida" checked={formData.type === 'saida'} onChange={(e) => setFormData({...formData, type: e.target.value})} />
              Saída
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input 
              required
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Ex: Oferta do culto"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
              <input 
                required
                type="number" 
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="0,00"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input 
                required
                type="date" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {finances.categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none shadow-sm">
              Salvar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
