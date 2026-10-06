import { useBranch } from '../hooks/useBranch';

export default function MessagesSection() {
  const { branch } = useBranch();
  
  if (branch !== 'landlord') return null;

  return (
    <section 
      id="messages" 
      className="min-h-[145vh] relative z-10"
      data-chapter="4"
    >
      <div className="sticky top-[24vh] ml-[6.5%] w-[38%] max-w-[610px] p-3">
        <p className="text-[11px] font-semibold tracking-[1.4px] flex items-center gap-2.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#729844]"></span>
          03 — KẾT NỐI KHÁCH THUÊ
        </p>
        
        <h2 className="text-[clamp(40px,5.3vw,78px)] tracking-[-0.065em] leading-[1.16] font-medium mb-6">
          <span className="block whitespace-nowrap">Mọi phản hồi.</span>
          <span className="block whitespace-nowrap">Gom <em className="not-italic text-[#74963e]">một mối.</em></span>
        </h2>
        
        <p className="text-base leading-[1.9] text-[#61715d] max-w-[385px] mb-7">
          Kênh trao đổi riêng biệt. Tiếp nhận phản ánh và thông báo nội quy khu trọ tập trung, không còn lo thất lạc tin nhắn riêng.
        </p>
        
        <div className="flex gap-2 flex-wrap">
          {['Chat nội bộ', 'Báo sửa chữa', 'Thông báo chung'].map((item) => (
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
