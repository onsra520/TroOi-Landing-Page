import { useBranch } from '../hooks/useBranch';

export default function UtilitiesSection() {
  const { branch } = useBranch();
  
  if (branch !== 'landlord') return null;

  return (
    <section 
      id="utilities" 
      className="min-h-[145vh] relative z-10"
      data-chapter="3"
    >
      <div className="sticky top-[24vh] ml-[6.5%] w-[38%] max-w-[610px] p-3">
        <p className="text-[11px] font-semibold tracking-[1.4px] flex items-center gap-2.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#729844]"></span>
          02 — CHỐT SỐ ĐIỆN NƯỚC
        </p>
        
        <h2 className="text-[clamp(40px,5.3vw,78px)] tracking-[-0.065em] leading-[1.16] font-medium mb-6">
          <span className="block whitespace-nowrap">Quét công tơ,</span>
          <span className="block whitespace-nowrap">"bơ" luôn <em className="not-italic text-[#74963e]">sổ sách!</em></span>
        </h2>
        
        <p className="text-base leading-[1.9] text-[#61715d] max-w-[385px] mb-7">
          Chốt số một giây — "bơ" luôn sổ sách. Mọi hóa đơn và lịch sử thanh toán được ứng dụng tự động lo liệu, trả lại cho bạn sự bình yên không cần cộng trừ nhân chia.
        </p>
        
        <div className="flex gap-2 flex-wrap mb-4">
          {['Quét công tơ', 'Tính tiền tự động', 'Hóa đơn tức thì', 'Theo dõi thanh toán'].map((item) => (
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
