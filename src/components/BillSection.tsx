export default function BillSection() {
  return (
    <section 
      id="bill" 
      className="min-h-[145vh] relative z-10"
      data-chapter="3"
    >
      <div className="sticky top-[24vh] ml-[6.5%] w-[38%] max-w-[610px] p-3">
        <p className="text-[11px] font-semibold tracking-[1.4px] flex items-center gap-2.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#729844]"></span>
          02 — NHẸ ĐI CHUYỆN GIẤY TỜ
        </p>
        
        <h2 className="text-[clamp(40px,5.3vw,78px)] tracking-[-0.065em] leading-[1.16] font-medium mb-6">
          <span className="block whitespace-nowrap">Mọi khoản tiền.</span>
          <span className="block whitespace-nowrap">Một chỗ. <em className="not-italic text-[#74963e]">Rõ ràng.</em></span>
        </h2>
        
        <p className="text-base leading-[1.9] text-[#61715d] max-w-[385px] mb-7">
          Tiền phòng, điện, nước — dễ theo dõi.<br />
          Hóa đơn và lịch sử thanh toán được lưu trong ứng dụng, để bạn dành tâm trí cho những điều đáng sống hơn.
        </p>
        
        <div className="flex gap-2 flex-wrap mb-4">
          {['Tiền phòng', 'Điện nước', 'Lịch sử thanh toán'].map((item) => (
            <span 
              key={item}
              className="border border-[#c4cebb] rounded-[20px] px-3 py-2 text-xs"
            >
              {item}
            </span>
          ))}
        </div>
        
        <p className="text-xs text-[#66765c]">
          Hóa đơn trong câu chuyện là dữ liệu minh họa.
        </p>
      </div>
    </section>
  );
}
