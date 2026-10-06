export default function AppSection() {
  return (
    <section 
      id="app" 
      className="min-h-[160vh] relative z-10"
      data-chapter="5"
    >
      <div className="sticky top-[24vh] ml-[6.5%] w-[38%] max-w-[610px] p-3">
        <p className="text-[11px] font-semibold tracking-[1.4px] flex items-center gap-2.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#729844]"></span>
          TRỌ ƠI — MỘT ỨNG DỤNG, CẢ HÀNH TRÌNH
        </p>
        
        <h2 className="text-[clamp(40px,5.3vw,78px)] tracking-[-0.065em] leading-[1.16] font-medium mb-6">
          <span className="block whitespace-nowrap">Mọi việc ở trọ.</span>
          <span className="block whitespace-nowrap">Gọn trong <em className="not-italic text-[#74963e]">một nơi.</em></span>
        </h2>
        
        <p className="text-base leading-[1.9] text-[#61715d] max-w-[385px] mb-7">
          Từ tìm phòng, quản lý khoản thu đến báo và theo dõi sự cố — Trọ Ơi kết nối người thuê, chủ trọ và thợ dịch vụ trong một hành trình rõ ràng.
        </p>
        
        <div className="flex flex-col gap-2.5 mb-7 text-[13px]">
          <span className="text-[#6d7e62]">Ứng dụng đang được phát triển</span>
          <strong className="text-[17px] font-medium">Hẹn gặp bạn tại Trọ Ơi.</strong>
        </div>
        
        <div className="flex gap-3 flex-wrap mb-5">
          <div className="bg-ink text-white rounded-xl px-5 py-3 min-w-[160px]">
            <small className="block text-[#d5e8bb] text-[10px] tracking-[0.7px] mb-1">
              SẮP RA MẮT TRÊN
            </small>
            <strong className="text-xl font-medium">Google Play</strong>
          </div>
          <div className="bg-ink text-white rounded-xl px-5 py-3 min-w-[160px]">
            <small className="block text-[#d5e8bb] text-[10px] tracking-[0.7px] mb-1">
              SẮP RA MẮT TRÊN
            </small>
            <strong className="text-xl font-medium">App Store</strong>
          </div>
        </div>
        
        <a 
          href="#start" 
          className="inline-block text-4xl text-ink hover:text-[#729844] transition-colors"
          aria-label="Kể lại câu chuyện từ đầu"
          title="Kể lại câu chuyện"
        >
          ↑
        </a>
      </div>
    </section>
  );
}
