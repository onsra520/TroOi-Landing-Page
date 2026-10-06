export default function RoomSection() {
  return (
    <section 
      id="room" 
      className="min-h-[145vh] relative z-10"
      data-chapter="2"
    >
      <div className="sticky top-[24vh] ml-[6.5%] w-[38%] max-w-[610px] p-3">
        <p className="text-[11px] font-semibold tracking-[1.4px] flex items-center gap-2.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#729844]"></span>
          01 — TÌM THẤY NƠI CỦA MÌNH
        </p>
        
        <h2 className="text-[clamp(40px,5.3vw,78px)] tracking-[-0.065em] leading-[1.16] font-medium mb-6">
          <span className="block whitespace-nowrap">Từ một căn phòng.</span>
          <span className="block whitespace-nowrap">Thành <em className="not-italic text-[#74963e]">góc riêng.</em></span>
        </h2>
        
        <p className="text-base leading-[1.9] text-[#61715d] max-w-[385px] mb-7">
          Chiếc giường để nghỉ. Góc bàn để mơ.<br />
          Thấy rõ không gian, tiện nghi và thông tin phòng trước khi bắt đầu một cuộc sống mới.
        </p>
        
        <div className="flex gap-2 flex-wrap">
          {['Không gian', 'Tiện nghi', 'Thông tin rõ ràng'].map((item) => (
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
