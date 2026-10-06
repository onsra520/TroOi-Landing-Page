interface FooterProps {
  activeChapter: number;
}

export default function Footer({ activeChapter }: FooterProps) {
  const chapters = [
    { href: '#start', label: 'Mở đầu' },
    { href: '#roles', label: 'Hai vai trò' },
    { href: '#room', label: 'Căn phòng' },
    { href: '#bill', label: 'Hóa đơn' },
    { href: '#care', label: 'Sửa chữa' },
    { href: '#app', label: 'Ứng dụng' },
  ];

  return (
    <footer className="fixed bottom-0 left-0 w-full px-[4.5%] py-6 z-20 flex items-center justify-between gap-3.5">
      <style>{`
        footer {
          background: linear-gradient(transparent, #eef3e9e8 50%);
        }
      `}</style>
      
      <span className="text-[10px] tracking-[1.5px]">
        TÌM ĐƯỢC TRỌ. CHẠM ĐƯỢC NHÀ.
      </span>
      
      <nav className="flex gap-2" aria-label="Chọn chương">
        {chapters.map((chapter, i) => (
          <a
            key={i}
            href={chapter.href}
            className={`grid place-items-center rounded-full w-[30px] h-[30px] text-[11px] transition-all ${
              i === activeChapter
                ? 'bg-ink text-lime'
                : 'text-[#819173]'
            }`}
            aria-label={chapter.label}
            aria-current={i === activeChapter ? 'step' : undefined}
          >
            {String(i + 1).padStart(2, '0')}
          </a>
        ))}
      </nav>
      
      <span className="flex-1" aria-hidden="true"></span>
    </footer>
  );
}
