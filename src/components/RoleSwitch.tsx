import { useBranch } from '../hooks/useBranch';
import { useEffect, useRef } from 'react';

export default function RoleSwitch() {
  const { branch, setBranch } = useBranch();
  const switchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (switchRef.current) {
      switchRef.current.style.setProperty(
        '--thumb-position',
        branch === 'landlord' ? '100%' : '0%'
      );
    }
  }, [branch]);

  const handleClick = (role: 'tenant' | 'landlord') => {
    setBranch(role);
    
    // Scroll to first content section of the selected branch
    if (role === 'landlord') {
      setTimeout(() => {
        const postSection = document.getElementById('post');
        if (postSection) {
          postSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      setTimeout(() => {
        const roomSection = document.getElementById('room');
        if (roomSection) {
          roomSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <div
      ref={switchRef}
      className="role-switch"
      role="group"
      aria-label="Chọn vai trò"
    >
      <button
        type="button"
        data-role="tenant"
        onClick={() => handleClick('tenant')}
        aria-pressed={branch === 'tenant'}
      >
        Tôi là người thuê
      </button>
      <button
        type="button"
        data-role="landlord"
        onClick={() => handleClick('landlord')}
        aria-pressed={branch === 'landlord'}
      >
        Tôi là chủ trọ
      </button>
    </div>
  );
}
