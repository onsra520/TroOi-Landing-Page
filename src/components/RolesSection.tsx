import { useBranch } from '../hooks/useBranch';

export default function RolesSection() {
  const { branch, setBranch } = useBranch();

  return (
    <section 
      id="roles" 
      className="min-h-[145vh] relative z-10"
      data-chapter="1"
    >
      <div className="sticky top-[24vh] ml-[6.5%] w-[38%] max-w-[610px] p-3">
        <div className="mb-6">
          <h2 className="text-[clamp(40px,5.3vw,78px)] tracking-[-0.065em] leading-[1.16] font-medium mb-6">
            <span className="block whitespace-nowrap">Một ứng dụng.</span>
            <span className="block whitespace-nowrap">Đủ <em className="not-italic text-[#74963e]">hai vai trò.</em></span>
          </h2>
          <p className="text-base leading-[1.9] text-[#61715d] max-w-[385px]">
            Dù bạn đang tìm phòng hay có phòng cho thuê, Trọ Ơi hướng tới việc giúp mọi công việc trọ trở nên rõ ràng và thuận tiện.
          </p>
        </div>
        
        <div className="flex gap-3 mb-8" role="group" aria-label="Chọn vai trò">
          <button
            type="button"
            data-role="tenant"
            onClick={() => setBranch('tenant')}
            aria-pressed={branch === 'tenant'}
            className={`px-5 py-3 rounded-lg text-sm font-medium transition-colors ${
              branch === 'tenant'
                ? 'bg-ink text-lime'
                : 'bg-[#d8e7c6] text-ink hover:bg-[#c9dfb5]'
            }`}
          >
            Tôi là người thuê
          </button>
          <button
            type="button"
            data-role="landlord"
            onClick={() => setBranch('landlord')}
            aria-pressed={branch === 'landlord'}
            className={`px-5 py-3 rounded-lg text-sm font-medium transition-colors ${
              branch === 'landlord'
                ? 'bg-ink text-lime'
                : 'bg-[#d8e7c6] text-ink hover:bg-[#c9dfb5]'
            }`}
          >
            Tôi là chủ trọ
          </button>
        </div>

        {branch === 'landlord' && (
          <div className="text-sm">
            <strong>CHỦ TRỌ</strong>
            <p className="text-[#61715d]">Quản lý dãy trọ và các khoản thu rõ ràng hơn.</p>
          </div>
        )}
        
        {branch === 'tenant' && (
          <div className="text-sm">
            <strong>NGƯỜI THUÊ</strong>
            <p className="text-[#61715d]">Tìm phòng và theo dõi việc ở trọ dễ dàng hơn.</p>
          </div>
        )}
      </div>
    </section>
  );
}
