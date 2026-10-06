import { useEffect } from 'react';
import { useBranch } from '../hooks/useBranch';

export default function BranchUI() {
  const { branch, setBranch } = useBranch();

  useEffect(() => {
    const secondChapter = document.querySelector('#roles');
    if (!secondChapter) return;

    let wasHero = false;
    let wasRoles = false;
    let wasBranch = branch;

    function syncHeroLayout() {
      const page = window.scrollY / (secondChapter as HTMLElement).offsetTop;
      const chosen = branch !== 'pending';

      const smoothStep = (value: number) => {
        const t = Math.max(0, Math.min(1, value));
        return t * t * (3 - 2 * t);
      };

      const mapExit = smoothStep((page - 0.72) / 0.42);
      const roleEnter = smoothStep((page - 0.66) / 0.33);
      const roleExit = chosen ? smoothStep((page - 1.7) / 0.2) : 0;
      const roomEnter = chosen ? smoothStep((page - 1.7) / 0.3) : 0;

      document.body.style.setProperty('--map-exit-opacity', String(1 - mapExit));
      document.body.style.setProperty('--role-scene-opacity', String(roleEnter * (1 - roleExit)));
      document.body.style.setProperty('--role-scene-y', `${(1 - roleEnter) * 46 + roleExit * 82}px`);
      document.body.style.setProperty('--role-scene-scale', String((0.91 + 0.09 * roleEnter) * (1 - 0.16 * roleExit)));
      document.body.style.setProperty('--role-copy-opacity', String(1 - roleExit));
      document.body.style.setProperty('--role-copy-y', `${-18 * roleExit}px`);
      document.body.style.setProperty('--room-enter-opacity', String(roomEnter));
      document.body.style.setProperty(
        '--landlord-scene-opacity',
        String(
          branch === 'landlord' && document.body.dataset.activeChapter !== 'app'
            ? roomEnter * (1 - smoothStep((page - 4.58) / 0.3))
            : 0
        )
      );

      const hero = page < 1.16;
      const roles = page >= 0.65 && page < 2;

      document.body.classList.toggle('map-exited', page >= 1.14);
      document.body.classList.toggle('room-entering', branch === 'tenant' && page >= 1.7 && page < 2);
      document.body.classList.toggle('app-view', branch === 'landlord' && page >= 4.85);

      if (hero === wasHero && roles === wasRoles && branch === wasBranch) return;

      const canvasSizeChanged = hero !== wasHero;
      wasHero = hero;
      wasRoles = roles;
      wasBranch = branch;

      document.body.classList.toggle('hero-view', hero);
      document.body.classList.toggle('roles-view', roles);
      document.getElementById('stage')?.setAttribute(
        'aria-hidden',
        String(roles || (branch === 'landlord' && !document.body.classList.contains('app-view')))
      );

      if (canvasSizeChanged && document.querySelector('#stage canvas')) {
        requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
      }
    }

    window.addEventListener('scroll', syncHeroLayout, { passive: true });
    window.addEventListener('resize', syncHeroLayout);
    syncHeroLayout();

    return () => {
      window.removeEventListener('scroll', syncHeroLayout);
      window.removeEventListener('resize', syncHeroLayout);
    };
  }, [branch]);

  const handleRoleClick = (role: 'tenant' | 'landlord') => {
    setBranch(role);
    
    // Update visibility
    const storyIds = {
      tenant: ['room', 'bill', 'care'],
      landlord: ['post', 'utilities', 'messages']
    };
    
    for (const [name, ids] of Object.entries(storyIds)) {
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el) el.hidden = name !== role;
      }
    }
    
    const appEl = document.getElementById('app');
    if (appEl) appEl.hidden = false;
  };

  return null;
}
