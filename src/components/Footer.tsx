export default function Footer() {
  return (
    <footer>
      <span className="footer-name">TÌM ĐƯỢC TRỌ. CHẠM ĐƯỢC NHÀ.</span>
      
      <div className="chapter-nav" aria-label="Chọn chương">
        <a href="#start" className="active" aria-label="Mở đầu">01</a>
        <a href="#roles" aria-label="Hai vai trò">02</a>
        <a href="#room" aria-label="Căn phòng">03</a>
        <a href="#bill" aria-label="Hóa đơn">04</a>
        <a href="#care" aria-label="Sửa chữa">05</a>
        <a href="#app" aria-label="Ứng dụng">06</a>
      </div>
      
      <span className="footer-spacer" aria-hidden="true"></span>
    </footer>
  );
}
