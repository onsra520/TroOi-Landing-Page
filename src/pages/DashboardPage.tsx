import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { ApiError, logout, me, User } from '../utils/api';

// Các tính năng lấy từ nội dung landing page; backend nghiệp vụ chưa có nên đánh dấu "Sắp ra mắt".
const FEATURES: Record<User['role'], [string, string][]> = {
  tenant: [
    ['Căn phòng', 'Xem không gian, tiện nghi và thông tin phòng rõ ràng.'],
    ['Hóa đơn', 'Tiền phòng, điện, nước và lịch sử thanh toán một chỗ.'],
    ['Sự cố', 'Gửi yêu cầu sửa chữa và theo dõi xử lý.'],
  ],
  landlord: [
    ['Đăng tin', 'Đăng phòng trống, tiếp cận người thuê nhanh.'],
    ['Điện nước', 'Chốt số công tơ, tính tiền tự động.'],
    ['Tin nhắn', 'Gom phản hồi và thông báo khu trọ về một mối.'],
  ],
};

const ROLE_LABEL: Record<User['role'], string> = {
  tenant: 'NGƯỜI THUÊ',
  landlord: 'CHỦ TRỌ',
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    me()
      .then((r) => setUser(r.user))
      .catch((e: ApiError) => {
        if (e.status === 401) window.location.hash = '#/login';
        else setError(e.message);
      });
  }, []);

  async function onLogout() {
    await logout().catch(() => {});
    window.location.hash = '#/login';
  }

  return (
    <>
      <Header minimal />
      <main className="dash">
        {error && (
          <p className="form-error" role="alert">
            {error} <a href="#/login">Về trang đăng nhập</a>
          </p>
        )}
        {!user && !error && <p role="status">Đang tải…</p>}

        {user && (
          <>
            <div className="dash-top">
              <div>
                <p className="eyebrow">
                  <span></span> {ROLE_LABEL[user.role]}
                </p>
                <h2>
                  Xin chào, <em>{user.name}.</em>
                </h2>
                <p className="intro">{user.email}</p>
              </div>
              <button className="dash-logout" type="button" onClick={onLogout}>
                Đăng xuất <span aria-hidden="true">↗</span>
              </button>
            </div>

            <ul className="dash-grid">
              {FEATURES[user.role].map(([title, text]) => (
                <li className="dash-card" key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <div className="details">
                    <span>Sắp ra mắt</span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </>
  );
}
