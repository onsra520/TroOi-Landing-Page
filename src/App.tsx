import { ThemeProvider } from './hooks/useTheme';
import { BranchProvider } from './hooks/useBranch';
import Header from './components/Header';
import Footer from './components/Footer';
import StoryScene from './components/StoryScene';
import RolesScene from './components/RolesScene';
import LandlordScene from './components/LandlordScene';
import RoleSwitch from './components/RoleSwitch';
import BranchUI from './components/BranchUI';

function App() {
  return (
    <ThemeProvider>
      <BranchProvider>
        <div className="min-h-screen">
          <a href="#start" className="skip">
            Bỏ qua đến nội dung chính
          </a>

          <Header />

          <StoryScene />
          <LandlordScene />

          <div className="ambient-label" aria-hidden="true">
            <span id="scene-number">01 / 05</span>
            <span id="scene-label">MỘT THÀNH PHỐ. NGÀN KHỞI ĐẦU.</span>
          </div>

          <main id="journey">
            {/* Hero Chapter */}
            <section id="start" className="chapter" data-chapter="0">
              <div className="copy">
                <p className="eyebrow">
                  <span></span> MỘT NỀN TẢNG. HAI NHU CẦU.
                </p>
                <h1>
                  <span>Bạn có trọ.</span>
                  <span>Tôi có <em>nơi về.</em></span>
                </h1>
                <p className="intro">
                  Tìm một nơi ở phù hợp hay quản lý dãy trọ của riêng mình — Trọ Ơi kết nối người thuê và chủ trọ trên cùng một nền tảng.
                </p>
                <div className="hero-actions">
                  <a className="pill" href="#roles">
                    Khám phá ngay <span>↗</span>
                  </a>
                </div>
                <div className="scroll-cue">
                  <span>↓</span> Cuộn để mở câu chuyện
                </div>
              </div>
            </section>

            {/* Role Selection */}
            <section id="roles" className="chapter" data-chapter="1">
              <div className="copy">
                <div className="roles-heading">
                  <h2>
                    <span>Một ứng dụng.</span>
                    <span><em>Đủ hai vai trò.</em></span>
                  </h2>
                  <p className="roles-summary">
                    Dù bạn đang tìm phòng hay có phòng cho thuê, Trọ Ơi hướng tới việc giúp mọi công việc trọ trở nên rõ ràng và thuận tiện.
                  </p>
                </div>

                <RoleSwitch />

                <div className="role-context role-context--landlord">
                  <strong>CHỦ TRỌ</strong>
                  <p>Quản lý dãy trọ và các khoản thu rõ ràng hơn.</p>
                </div>

                <RolesScene />

                <div className="role-context role-context--tenant">
                  <strong>NGƯỜI THUÊ</strong>
                  <p>Tìm phòng và theo dõi việc ở trọ dễ dàng hơn.</p>
                </div>
              </div>
            </section>

            {/* Tenant Branch: Room */}
            <section id="room" className="chapter" data-chapter="2">
              <div className="copy">
                <p className="eyebrow">01 — TÌM THẤY NƠI CỦA MÌNH</p>
                <h2>
                  <span>Từ một căn phòng.</span>
                  <span>Thành <em>góc riêng.</em></span>
                </h2>
                <p className="intro">
                  Chiếc giường để nghỉ. Góc bàn để mơ.<br />
                  Thấy rõ không gian, tiện nghi và thông tin phòng trước khi bắt đầu một cuộc sống mới.
                </p>
                <div className="details">
                  <span>Không gian</span>
                  <span>Tiện nghi</span>
                  <span>Thông tin rõ ràng</span>
                </div>
                <a className="story-to-top" href="#start" aria-label="Về đầu trang" title="Về đầu trang">↑</a>
              </div>
            </section>

            {/* Tenant Branch: Bill */}
            <section id="bill" className="chapter" data-chapter="3">
              <div className="copy">
                <p className="eyebrow">02 — NHẸ ĐI CHUYỆN GIẤY TỜ</p>
                <h2>
                  <span>Mọi khoản tiền.</span>
                  <span>Một chỗ. <em>Rõ ràng.</em></span>
                </h2>
                <p className="intro">
                  Tiền phòng, điện, nước — dễ theo dõi.<br />
                  Hóa đơn và lịch sử thanh toán được lưu trong ứng dụng, để bạn dành tâm trí cho những điều đáng sống hơn.
                </p>
                <div className="details">
                  <span>Tiền phòng</span>
                  <span>Điện nước</span>
                  <span>Lịch sử thanh toán</span>
                </div>
                <p className="small-note">Hóa đơn trong câu chuyện là dữ liệu minh họa.</p>
                <a className="story-to-top" href="#roles" aria-label="Về trang chọn vai trò" title="Về trang chọn vai trò">↑</a>
              </div>
            </section>

            {/* Tenant Branch: Care */}
            <section id="care" className="chapter" data-chapter="4">
              <div className="copy">
                <p className="eyebrow">03 — AN TÂM CẢ SAU KHI DỌN ĐẾN</p>
                <h2>
                  <span>Có chút trục trặc?</span>
                  <span><em>Có người lo.</em></span>
                </h2>
                <p className="intro">
                  Máy lạnh không mát, vòi nước bị rò?<br />
                  Gửi yêu cầu trên app. Kết nối chủ trọ và thợ dịch vụ, cùng theo dõi việc sửa chữa.
                </p>
                <div className="details">
                  <span>Báo sự cố</span>
                  <span>Kết nối thợ</span>
                  <span>Theo dõi xử lý</span>
                </div>
                <a className="story-to-top" href="#roles" aria-label="Về trang chọn vai trò" title="Về trang chọn vai trò">↑</a>
              </div>
            </section>

            {/* Landlord Branch: Post */}
            <section id="post" hidden className="chapter" data-chapter="2">
              <div className="copy">
                <p className="eyebrow">01 — LẤP ĐẦY PHÒNG TRỐNG</p>
                <h2>
                  <span>Phòng vừa trống.</span>
                  <span>Khách vào <em>ngay.</em></span>
                </h2>
                <p className="intro">
                  Đăng tin một lần, tiếp cận người thuê thực tế tức thì. Hình ảnh rõ ràng, thông tin minh bạch giúp chốt khách nhanh chóng.
                </p>
                <div className="details">
                  <span>Đăng tin nhanh</span>
                  <span>Đúng khách</span>
                  <span>Không trôi bài</span>
                </div>
                <a className="story-to-top" href="#start" aria-label="Về đầu trang" title="Về đầu trang">↑</a>
              </div>
            </section>

            {/* Landlord Branch: Utilities */}
            <section id="utilities" hidden className="chapter" data-chapter="3">
              <div className="copy">
                <p className="eyebrow">02 — CHỐT SỐ ĐIỆN NƯỚC</p>
                <h2>
                  <span>Quét công tơ.</span>
                  <span>"bơ" luôn <em>sổ sách!</em></span>
                </h2>
                <p className="intro">
                  Chốt số một giây — "bơ" luôn sổ sách. Mọi hóa đơn và lịch sử thanh toán được ứng dụng tự động lo liệu, trả lại cho bạn sự bình yên không cần cộng trừ nhân chia.
                </p>
                <div className="details">
                  <span>Quét công tơ</span>
                  <span>Tính tiền tự động</span>
                  <span>Hóa đơn tức thì</span>
                  <span>Theo dõi thanh toán</span>
                </div>
                <p className="small-note">Hóa đơn trong câu chuyện là dữ liệu minh họa.</p>
                <a className="story-to-top" href="#roles" aria-label="Về trang chọn vai trò" title="Về trang chọn vai trò">↑</a>
              </div>
            </section>

            {/* Landlord Branch: Messages */}
            <section id="messages" hidden className="chapter" data-chapter="4">
              <div className="copy">
                <p className="eyebrow">03 — KẾT NỐI KHÁCH THUÊ</p>
                <h2>
                  <span>Mọi phản hồi.</span>
                  <span>Gom <em>một mối.</em></span>
                </h2>
                <p className="intro">
                  Kênh trao đổi riêng biệt. Tiếp nhận phản ánh và thông báo nội quy khu trọ tập trung, không còn lo thất lạc tin nhắn riêng.
                </p>
                <div className="details">
                  <span>Chat nội bộ</span>
                  <span>Báo sửa chữa</span>
                  <span>Thông báo chung</span>
                </div>
                <a className="story-to-top" href="#roles" aria-label="Về trang chọn vai trò" title="Về trang chọn vai trò">↑</a>
              </div>
            </section>

            {/* App Download */}
            <section id="app" className="chapter" data-chapter="5">
              <div className="copy">
                <p className="eyebrow">TRỌ ƠI — MỘT ỨNG DỤNG, CẢ HÀNH TRÌNH</p>
                <h2>
                  <span>Mọi việc ở trọ.</span>
                  <span><em>Gọn trong một nơi.</em></span>
                </h2>
                <p className="intro">
                  Từ tìm phòng, quản lý khoản thu đến báo và theo dõi sự cố — Trọ Ơi kết nối người thuê, chủ trọ và thợ dịch vụ trong một hành trình rõ ràng.
                </p>
                <div className="coming">
                  <span>Ứng dụng đang được phát triển</span>
                  <strong>Hẹn gặp bạn tại Trọ Ơi.</strong>
                </div>
                <div className="store-options" aria-label="Ứng dụng sắp ra mắt">
                  <div className="store-badge">
                    <small>SẮP RA MẮT TRÊN</small>
                    <strong>Google Play</strong>
                  </div>
                  <div className="store-badge">
                    <small>SẮP RA MẮT TRÊN</small>
                    <strong>App Store</strong>
                  </div>
                </div>
                <a className="story-to-top" href="#roles" aria-label="Về trang chọn vai trò" title="Về trang chọn vai trò">↑</a>
              </div>
            </section>
          </main>

          <Footer />
          <BranchUI />
        </div>
      </BranchProvider>
    </ThemeProvider>
  );
}

export default App;
