export default function CareSection() {
  return (
    <section 
      id="care" 
      className="min-h-[145vh] relative z-10"
      data-chapter="4"
    >
      <div className="sticky top-[24vh] ml-[6.5%] w-[38%] max-w-[610px] p-3">
        <p className="text-[11px] font-semibold tracking-[1.4px] flex items-center gap-2.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#729844]"></span>
          03 — AN TÂM CẢ SAU KHI DỌN ĐẾN
        </p>
        
        <h2 className="text-[clamp(40px,5.3vw,78px)] tracking-[-0.065em] leading-[1.16] font-medium mb-6">
          <span className="block whitespace-nowrap">Có chút trục trặc?</span>
          <span className="block whitespace-nowrap"><em className="not-italic text-[#74963e]">Có người lo.</em></span>
        </h2>
        
        <p className="text-base leading-[1.9] text-[#61715d] max-w-[385px] mb-7">
          Máy lạnh không mát, vòi nước bị rò?<br />
          Gửi yêu cầu trên app. Kết nối chủ trọ và thợ dịch vụ, cùng theo dõi việc sửa chữa.
        </p>
        
        <div className="flex gap-2 flex-wrap">
          {['Báo sự cố', 'Kết nối thợ', 'Theo dõi xử lý'].map((item) => (
            <span 
              key={item}
              className="border border-[#c4cebb] rounded-[20px] px-3 py-2 text-xs"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
