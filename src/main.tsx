import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './styles/auth-dashboard.css';
import Root from './Root';

const isDev = import.meta.env.DEV;
const basename = isDev ? '/' : '/TroOi-Landing-Page/';

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter basename={basename}>
        <Root />
      </BrowserRouter>
    </StrictMode>,
  );
} catch (error) {
  console.error('App initialization error:', error);
  document.body.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
      background: #eef3e9;
      color: #243c2c;
    ">
      <div style="text-align: center; max-width: 600px;">
        <h1>Lỗi khởi tạo ứng dụng</h1>
        <pre style="
          background: #f5f5f5;
          padding: 16px;
          border-radius: 8px;
          text-align: left;
          overflow-x: auto;
        ">${error}</pre>
        <p>Vui lòng kiểm tra console để xem chi tiết lỗi.</p>
      </div>
    </div>
  `;
}

