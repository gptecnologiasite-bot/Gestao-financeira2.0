/* eslint react-refresh/only-export-components: off */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const FinanceContext = createContext();

const baseFinances = {
  categories: ['Dízimo', 'Oferta', 'Energia', 'Água', 'Internet', 'Patrimônio', 'Outros'],
  ministries: ['Louvor', 'Infantil', 'Jovens', 'Mulheres', 'Homens', 'Missões'],
};

const demoTransactions = [
  { id: 101, type: 'entrada', value: 3500, category: 'Oferta', date: '2024-03-01', description: 'Oferta culto de domingo' },
  { id: 102, type: 'entrada', value: 12000, category: 'Dízimo', date: '2024-03-05', description: 'Dízimo mensal' },
  { id: 103, type: 'saida', value: 450, category: 'Energia', date: '2024-03-06', description: 'Conta de luz' },
  { id: 104, type: 'saida', value: 800, category: 'Água', date: '2024-03-10', description: 'Conta de água' },
  { id: 105, type: 'saida', value: 700, category: 'Internet', date: '2024-03-12', description: 'Internet secretaria' },
  { id: 106, type: 'entrada', value: 900, category: 'Patrimônio', date: '2024-03-15', description: 'Contribuição manutenção' },
];

const demoTransactionIds = new Set(demoTransactions.map((t) => t.id));

const defaultRealTransactions = [
  { id: 1, type: 'entrada', value: 5000, category: 'Dízimo', date: '2023-10-01', description: 'Dízimo culto de domingo' },
  { id: 2, type: 'saida', value: 150.5, category: 'Energia', date: '2023-10-02', description: 'Conta de luz da congregação' },
];

const safeParseJSON = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const buildFinancesFromTransactions = (transactions) => {
  const totalEntradas = transactions.reduce((acc, t) => acc + (t.type === 'entrada' ? Number(t.value) : 0), 0);
  const totalSaidas = transactions.reduce((acc, t) => acc + (t.type === 'saida' ? Number(t.value) : 0), 0);
  const saldoAtual = totalEntradas - totalSaidas;

  return {
    ...baseFinances,
    totalEntradas,
    totalSaidas,
    saldoAtual,
    transactions,
  };
};

export function FinanceProvider({ children }) {
  const [demoEnabled, setDemoEnabled] = useState(() => localStorage.getItem('finance_demo_enabled') === '1');

  // Transações reais SEM as transações de demo.
  // Mantemos no localStorage para não perder o que o usuário cadastrar.
  const [realTransactions, setRealTransactions] = useState(() => {
    const savedReal = localStorage.getItem('finance_real_transactions');
    const parsedReal = safeParseJSON(savedReal);
    if (Array.isArray(parsedReal) && parsedReal.length > 0) {
      return parsedReal.filter((t) => !demoTransactionIds.has(t.id));
    }

    // Migração: versões anteriores salvavam tudo em `finance_finances`.
    const saved = localStorage.getItem('finance_finances');
    const parsed = safeParseJSON(saved);
    if (parsed?.transactions && Array.isArray(parsed.transactions)) {
      return parsed.transactions.filter((t) => !demoTransactionIds.has(t.id));
    }

    return defaultRealTransactions;
  });

  useEffect(() => {
    localStorage.setItem('finance_real_transactions', JSON.stringify(realTransactions));
  }, [realTransactions]);

  useEffect(() => {
    localStorage.setItem('finance_demo_enabled', demoEnabled ? '1' : '0');
  }, [demoEnabled]);

  const finances = useMemo(() => {
    const displayTransactions = demoEnabled
      ? [...demoTransactions, ...realTransactions]
      : [...realTransactions];

    return buildFinancesFromTransactions(displayTransactions);
  }, [demoEnabled, realTransactions]);

  const addTransaction = (transaction) => {
    setRealTransactions((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...transaction,
      },
    ]);
  };

  const deleteTransaction = (id) => {
    if (demoTransactionIds.has(id)) return;
    setRealTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTransaction = (updated) => {
    if (demoTransactionIds.has(updated.id)) return;
    setRealTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const toggleFinanceDemo = () => setDemoEnabled((prev) => !prev);

  return (
    <FinanceContext.Provider
      value={{
        finances,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        demoEnabled,
        toggleFinanceDemo,
        isDemoTransactionId: (id) => demoTransactionIds.has(id),
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => useContext(FinanceContext);
