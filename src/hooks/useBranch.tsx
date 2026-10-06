import { createContext, useContext, useState, ReactNode } from 'react';

type Branch = 'tenant' | 'landlord' | 'pending';

interface BranchContextType {
  branch: Branch;
  setBranch: (branch: Branch) => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const [branch, setBranch] = useState<Branch>('pending');

  return (
    <BranchContext.Provider value={{ branch, setBranch }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (!context) throw new Error('useBranch must be used within BranchProvider');
  return context;
}
