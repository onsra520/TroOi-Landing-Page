import { useTheme } from '../hooks/useTheme';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const isForest = theme === 'forest';

  return (
    <header className="fixed top-0 left-0 w-full z-20 flex items-center justify-between px-[4.5%] py-6">
      <style>{`
        header {
          background: linear-gradient(${isForest ? '#102a20' : '#eef3e9'} 15%, ${isForest ? '#102a20cc' : '#eef3e9cc'} 75%, transparent);
        }
      `}</style>
      
      <a 
        href="#start" 
        className="text-[43px] font-black tracking-[-4px] leading-tight"
        aria-label="Trọ Ơi, về đầu trang"
      >
        Trọ <span className="text-[#729844]">Ơi</span>
        <i className="text-[13px] not-italic align-top tracking-normal ml-1">®</i>
        <div className="w-6 border-b-[3px] border-current rounded-full -mt-1.5 ml-[42px] h-[5px]"></div>
      </a>

      <div className="flex gap-9">
        <button
          id="theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label={isForest ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          title={isForest ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          aria-pressed={isForest}
          className="text-2xl"
        >
          {isForest ? '☀' : '☾'}
        </button>
        
        <a 
          href="#app" 
          className="text-sm border border-[#bac7b6] px-5 py-3 rounded-[30px] flex gap-7 hover:bg-lime transition-colors"
        >
          Gặp Trọ Ơi <span>↗</span>
        </a>
      </div>
    </header>
  );
}
