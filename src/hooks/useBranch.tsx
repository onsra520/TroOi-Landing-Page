import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Branch = 'pending' | 'tenant' | 'landlord';

interface BranchContextType {
  branch: Branch;
  setBranch: (branch: Branch) => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const [branch, setBranchState] = useState<Branch>('tenant');

  useEffect(() => {
    // Set initial branch based on URL hash
    const hash = window.location.hash.slice(1);
    const landlordChapters = ['post', 'utilities', 'messages'];
    const tenantChapters = ['room', 'bill', 'care'];
    
    if (landlordChapters.includes(hash)) {
      setBranchState('landlord');
    } else if (tenantChapters.includes(hash) || hash === 'app') {
      setBranchState('tenant');
    } else {
      setBranchState('tenant');
    }
  }, []);

  const setBranch = (newBranch: Branch) => {
    setBranchState(newBranch);
    document.body.dataset.branch = newBranch;
    
    // Toggle hidden attribute based on branch
    const tenantSections = ['room', 'bill', 'care'];
    const landlordSections = ['post', 'utilities', 'messages'];
    
    if (newBranch === 'landlord') {
      tenantSections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('hidden', '');
      });
      landlordSections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.removeAttribute('hidden');
      });
    } else if (newBranch === 'tenant') {
      landlordSections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('hidden', '');
      });
      tenantSections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.removeAttribute('hidden');
      });
    }
    
    // Dispatch event
    window.dispatchEvent(new Event('trooi:branch-change'));
  };

  useEffect(() => {
    document.body.dataset.branch = branch;
  }, [branch]);

  return (
    <BranchContext.Provider value={{ branch, setBranch }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within BranchProvider');
  }
  return context;
}
