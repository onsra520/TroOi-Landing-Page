import { useEffect, useState } from 'react';

export type Route = 'landing' | 'login' | 'dashboard';

const read = (): Route => {
  const hash = window.location.hash;
  return hash === '#/login' ? 'login' : hash === '#/dashboard' ? 'dashboard' : 'landing';
};

export function useRoute() {
  const [route, setRoute] = useState<Route>(read);

  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}
