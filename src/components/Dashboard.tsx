import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  const isTenant = user.role === 'tenant';

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Trọ Ơi</h2>
          <span className="role-badge" data-role={user.role}>
            {isTenant ? '👤 Người thuê' : '🏠 Chủ trọ'}
          </span>
        </div>

        <nav className="sidebar-nav">
          <a href="/dashboard" className="nav-item active">
            📊 Tổng quan
          </a>
          {isTenant ? (
            <>
              <a href="/dashboard/rooms" className="nav-item">
                🔍 Tìm phòng
              </a>
              <a href="/dashboard/my-rooms" className="nav-item">
                🏠 Phòng của tôi
              </a>
              <a href="/dashboard/bills" className="nav-item">
                💰 Hóa đơn
              </a>
              <a href="/dashboard/issues" className="nav-item">
                🔧 Báo sự cố
              </a>
            </>
          ) : (
            <>
              <a href="/dashboard/my-rooms" className="nav-item">
                🏢 Quản lý phòng
              </a>
              <a href="/dashboard/tenants" className="nav-item">
                👥 Quản lý khách thuê
              </a>
              <a href="/dashboard/bills" className="nav-item">
                💼 Quản lý hóa đơn
              </a>
              <a href="/dashboard/messages" className="nav-item">
                💬 Tin nhắn
              </a>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <a href="/dashboard/settings" className="nav-item">
            ⚙️ Cài đặt
          </a>
          <button onClick={handleLogout} className="logout-button">
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Xin chào, {user.name}!</h1>
          <p className="header-subtitle">
            {isTenant ? 'Quản lý thông tin và tìm phòng của bạn' : 'Quản lý dãy trọ của bạn'}
          </p>
        </header>

        <div className="dashboard-content">
          <section className="content-section">
            <h2>Tổng quan</h2>

            <div className="stats-grid">
              {isTenant ? (
                <>
                  <div className="stat-card">
                    <div className="stat-number">1</div>
                    <div className="stat-label">Phòng hiện tại</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">3</div>
                    <div className="stat-label">Hóa đơn chưa thanh toán</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">0</div>
                    <div className="stat-label">Báo sự cố</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="stat-card">
                    <div className="stat-number">5</div>
                    <div className="stat-label">Tổng phòng</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">4</div>
                    <div className="stat-label">Phòng cho thuê</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">12</div>
                    <div className="stat-label">Khách thuê</div>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="content-section">
            <h2>Hoạt động gần đây</h2>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">📝</div>
                <div className="activity-text">
                  <p className="activity-title">Cập nhật hóa đơn tháng 10</p>
                  <p className="activity-time">2 giờ trước</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">✅</div>
                <div className="activity-text">
                  <p className="activity-title">Thanh toán thành công</p>
                  <p className="activity-time">1 ngày trước</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">💬</div>
                <div className="activity-text">
                  <p className="activity-title">Tin nhắn mới từ Nguyễn Văn A</p>
                  <p className="activity-time">3 ngày trước</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
