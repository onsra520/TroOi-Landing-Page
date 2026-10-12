import { useEffect, useState } from 'react';
import Header from '../components/Header';
import LineChart from '../components/LineChart';
import { ApiError, logout, me, User } from '../utils/api';
import { POSTS, Post, SERIES, SOURCES, SUBSCRIBERS, WEEKS } from '../data/mockStats';

type View = 'overview' | 'posts' | 'subscribers';

const NAV: [View, string][] = [
  ['overview', 'Tổng quan'],
  ['posts', 'Bài đăng Facebook'],
  ['subscribers', 'Người đăng ký'],
];

const ROLE_LABEL: Record<User['role'], string> = {
  tenant: 'NGƯỜI THUÊ',
  landlord: 'CHỦ TRỌ',
};

const fmt = (n: number) => n.toLocaleString('vi-VN');
const sum = (a: number[]) => a.reduce((s, n) => s + n, 0);

function Kpi({ label, total, values }: { label: string; total: number; values: number[] }) {
  const [prev, cur] = values.slice(-2);
  const d = ((cur - prev) / prev) * 100;
  return (
    <li className="kpi dash-card">
      <span>{label}</span>
      <strong>{fmt(total)}</strong>
      <em className={d >= 0 ? 'up' : 'down'}>
        {d >= 0 ? '▲' : '▼'} {Math.abs(d).toFixed(1)}% so với tuần trước
      </em>
    </li>
  );
}

function PostsTable({ posts }: { posts: Post[] }) {
  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-label="Bảng thống kê bài đăng">
      <table>
        <thead>
          <tr>
            <th scope="col">Bài đăng</th>
            <th scope="col">Ngày</th>
            <th scope="col">Lượt xem</th>
            <th scope="col">Like</th>
            <th scope="col">Share</th>
            <th scope="col">Bình luận</th>
            <th scope="col">Tương tác</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id}>
              <th scope="row">{p.title}</th>
              <td>{p.date}</td>
              <td>{fmt(p.views)}</td>
              <td>{fmt(p.likes)}</td>
              <td>{fmt(p.shares)}</td>
              <td>{fmt(p.comments)}</td>
              <td>{(((p.likes + p.shares + p.comments) / p.views) * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubscribersTable() {
  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-label="Bảng người đăng ký mới">
      <table>
        <thead>
          <tr>
            <th scope="col">Họ tên</th>
            <th scope="col">Email</th>
            <th scope="col">Vai trò</th>
            <th scope="col">Nguồn</th>
            <th scope="col">Ngày</th>
          </tr>
        </thead>
        <tbody>
          {SUBSCRIBERS.map((s) => (
            <tr key={s.email}>
              <th scope="row">{s.name}</th>
              <td>{s.email}</td>
              <td>{s.role}</td>
              <td>{s.source}</td>
              <td>{s.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Sources() {
  return (
    <ul className="bars">
      {SOURCES.map(([name, pct]) => (
        <li key={name}>
          <span>{name}</span>
          <meter min={0} max={100} value={pct} aria-label={`${name}: ${pct}%`} />
          <b>{pct}%</b>
        </li>
      ))}
    </ul>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [view, setView] = useState<View>('overview');

  useEffect(() => {
    me()
      .then((r) => setUser(r.user))
      .catch((e: ApiError) => {
        if (e.status === 401) window.location.hash = '#/admin';
        else setError(e.message);
      });
  }, []);

  async function onLogout() {
    await logout().catch(() => {});
    window.location.hash = '#/admin';
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="dash">
          <p className="form-error" role="alert">
            {error}
          </p>
        </main>
      </>
    );
  }
  if (!user) return null;

  const { views, likes, shares, subscribers } = SERIES;
  const viewsChart = <LineChart title="Lượt xem theo tuần" labels={WEEKS} series={[{ name: 'Lượt xem', values: views }]} />;
  const engageChart = (
    <LineChart
      title="Like và share theo tuần"
      labels={WEEKS}
      series={[
        { name: 'Like', values: likes },
        { name: 'Share', values: shares },
      ]}
    />
  );
  const subsChart = (
    <LineChart title="Người đăng ký tích lũy" labels={WEEKS} series={[{ name: 'Người đăng ký', values: subscribers }]} />
  );

  return (
    <>
      <Header />
      <div className="dash">
        <aside className="dash-side" aria-label="Menu quản lý">
          <p className="dash-user">
            <strong>{user.name}</strong>
            <span>{ROLE_LABEL[user.role]}</span>
          </p>
          <ul>
            {NAV.map(([v, label]) => (
              <li key={v}>
                <button type="button" aria-current={view === v ? 'page' : undefined} onClick={() => setView(v)}>
                  {label}
                </button>
              </li>
            ))}
          </ul>
          <button className="dash-logout" type="button" onClick={onLogout}>
            Đăng xuất
          </button>
        </aside>

        <main className="dash-main">
          <div className="dash-top">
            <p className="eyebrow">
              <span></span> DỮ LIỆU MẪU · 12 TUẦN GẦN NHẤT
            </p>
            <h2>{NAV.find(([v]) => v === view)?.[1]}</h2>
          </div>

          {view === 'overview' && (
            <>
              <ul className="dash-grid">
                <Kpi label="Lượt xem" total={sum(views)} values={views} />
                <Kpi label="Like" total={sum(likes)} values={likes} />
                <Kpi label="Share" total={sum(shares)} values={shares} />
                <Kpi label="Người đăng ký" total={subscribers[subscribers.length - 1]} values={subscribers} />
              </ul>
              <div className="dash-cols">
                <section className="dash-card">
                  <h3>Lượt xem theo tuần</h3>
                  {viewsChart}
                </section>
                <section className="dash-card">
                  <h3>Like và share theo tuần</h3>
                  {engageChart}
                </section>
                <section className="dash-card">
                  <h3>Tăng trưởng người đăng ký</h3>
                  {subsChart}
                </section>
                <section className="dash-card">
                  <h3>Nguồn đăng ký</h3>
                  <Sources />
                </section>
              </div>
              <section className="dash-card">
                <h3>Bài đăng nổi bật</h3>
                <PostsTable posts={POSTS.slice(0, 3)} />
              </section>
            </>
          )}

          {view === 'posts' && (
            <>
              <section className="dash-card">
                <h3>Tương tác theo tuần</h3>
                {engageChart}
              </section>
              <section className="dash-card">
                <h3>Tất cả bài đăng</h3>
                <PostsTable posts={POSTS} />
              </section>
            </>
          )}

          {view === 'subscribers' && (
            <>
              <div className="dash-cols">
                <section className="dash-card">
                  <h3>Tăng trưởng người đăng ký</h3>
                  {subsChart}
                </section>
                <section className="dash-card">
                  <h3>Nguồn đăng ký</h3>
                  <Sources />
                </section>
              </div>
              <section className="dash-card">
                <h3>Đăng ký mới</h3>
                <SubscribersTable />
              </section>
            </>
          )}
        </main>
      </div>
    </>
  );
}
