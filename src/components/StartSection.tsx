export default function StartSection() {
  return (
    <section 
      id="start" 
      className="min-h-[145vh] relative z-10 pt-[clamp(165px,21vh,230px)]"
      data-chapter="0"
    >
      <div className="mx-auto w-[min(970px,92%)] text-center isolate">
        <p className="flex justify-center items-center gap-2.5 text-[#476b32] text-[11px] font-bold tracking-[2px] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#648c37]"></span>
          MỘT NỀN TẢNG. HAI NHU CẦU.
        </p>
        
        <h1 className="relative isolate w-auto max-w-full text-[clamp(53px,6.2vw,102px)] font-bold tracking-[-0.065em] leading-[1.1] mb-7 text-[#203b2a]">
          <style>{`
            h1 {
              text-shadow: 2px 0 0 #fff, -2px 0 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff,
                          2px 2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, -2px -2px 0 #fff,
                          0 0 12px #ffffffeb, 0 0 22px #ffffffa6;
            }
          `}</style>
          <span className="block whitespace-nowrap">Bạn có trọ.</span>
          <span className="block whitespace-nowrap">Tôi có <em className="not-italic text-[#50762f]">nơi về.</em></span>
        </h1>
        
        <p className="relative isolate max-w-[690px] mx-auto mb-7 text-[17px] leading-[1.8] text-[#304b36]">
          <style>{`
            section p.intro {
              text-shadow: 0 1px 2px #fff, 0 0 7px #ffffffc7;
            }
          `}</style>
          <span className="intro">
            Tìm một nơi ở phù hợp hay quản lý dãy trọ của riêng mình — Trọ Ơi kết nối người thuê và chủ trọ trên cùng một nền tảng.
          </span>
        </p>
        
        <div className="flex justify-center items-center gap-3 flex-wrap">
          <a 
            href="#roles" 
            className="min-h-[55px] text-[13px] font-semibold bg-ink text-[#f1f6e9] rounded-[40px] px-5 py-4 inline-flex items-center gap-8 hover:bg-[#425a32] transition-colors shadow-[0_7px_22px_#243c2c17]"
          >
            Khám phá ngay <span className="text-xl text-[#d3f786]">↗</span>
          </a>
          <a 
            href="#app" 
            className="min-h-[55px] text-[13px] font-semibold text-ink border border-[#9eb794] bg-[#eef3e9b8] rounded-[40px] px-5 py-4 inline-flex items-center gap-8 hover:bg-[#dce9d1] transition-colors"
          >
            Tìm hiểu ứng dụng <span className="text-xl text-[#557f34]">↓</span>
          </a>
        </div>
        
        <div className="flex justify-center items-center gap-3 mt-8 text-[#345038] text-[11px]">
          <style>{`
            .scroll-cue {
              text-shadow: 0 1px 2px #fff, 0 0 6px #ffffffc9;
            }
          `}</style>
          <span className="scroll-cue h-8 w-6 border border-[#abb7a2] rounded-[20px] grid place-items-center text-base">↓</span>
          <span className="scroll-cue">Cuộn để mở câu chuyện</span>
        </div>
      </div>
    </section>
  );
}
