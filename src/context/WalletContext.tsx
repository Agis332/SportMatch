import { createContext, useContext, useState, type ReactNode } from 'react';

export interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
}

export interface BankAccount {
  id: string;
  holder: string;
  maskedIban: string;
  bankName: string;
}

interface WalletContextValue {
  cards: SavedCard[];
  bankAccounts: BankAccount[];
  addCard: (card: Omit<SavedCard, 'id'>) => SavedCard;
  removeCard: (id: string) => void;
  addBankAccount: (account: Omit<BankAccount, 'id'>) => void;
  removeBankAccount: (id: string) => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const INITIAL_CARDS: SavedCard[] = [
  { id: 'c1', brand: 'Visa',       last4: '4242', expiry: '08/26' },
  { id: 'c2', brand: 'Mastercard', last4: '8888', expiry: '11/25' },
];

const INITIAL_ACCOUNTS: BankAccount[] = [
  { id: 'b1', holder: 'Mantas Petrauskas', maskedIban: 'LT•• •••• •••• •••• 4412', bankName: 'Swedbank' },
];

export function WalletProvider({ children }: { children: ReactNode }) {
  const [cards,        setCards]        = useState<SavedCard[]>(INITIAL_CARDS);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(INITIAL_ACCOUNTS);

  function addCard(card: Omit<SavedCard, 'id'>): SavedCard {
    const newCard = { ...card, id: `c${Date.now()}` };
    setCards(prev => [...prev, newCard]);
    return newCard;
  }

  function removeCard(id: string) {
    setCards(prev => prev.filter(c => c.id !== id));
  }

  function addBankAccount(account: Omit<BankAccount, 'id'>) {
    setBankAccounts(prev => [...prev, { ...account, id: `b${Date.now()}` }]);
  }

  function removeBankAccount(id: string) {
    setBankAccounts(prev => prev.filter(a => a.id !== id));
  }

  return (
    <WalletContext.Provider value={{ cards, bankAccounts, addCard, removeCard, addBankAccount, removeBankAccount }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
