import './styles/global.css';
import { bootstrap } from './bootstrap';
import { Experience } from './core/Experience';

bootstrap(() => {
  const host = document.querySelector<HTMLElement>('#app');
  if (!host) throw new Error('Missing #app host');
  return new Experience(host);
});
