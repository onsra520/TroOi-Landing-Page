import { Suspense, lazy, useState } from 'react';
import { BranchProvider } from './hooks/useBranch';
import { ThemeProvider } from './hooks/useTheme';
import Header from './components/Header';
import Footer from './components/Footer';
import StartSection from './components/StartSection';
import RolesSection from './components/RolesSection';
import RoomSection from './components/RoomSection';
import BillSection from './components/BillSection';
import CareSection from './components/CareSection';
import PostSection from './components/PostSection';
import UtilitiesSection from './components/UtilitiesSection';
import MessagesSection from './components/MessagesSection';
import AppSection from './components/AppSection';

// Lazy load Three.js scene to reduce initial bundle size
const ThreeScene = lazy(() => import('./components/ThreeScene'));

function App() {
  const [activeChapter] = useState(0);

  return (
    <ThemeProvider>
      <BranchProvider>
        <div className="min-h-screen bg-[#eef3e9] text-ink">
          <a 
            href="#journey" 
            className="fixed -top-24 left-2 z-50 bg-white p-4 focus:top-2"
          >
            Đi đến câu chuyện
          </a>
          
          <Suspense fallback={null}>
            <ThreeScene />
          </Suspense>
          
          <Header />
          
          <main id="journey">
            <StartSection />
            <RolesSection />
            <RoomSection />
            <BillSection />
            <CareSection />
            <PostSection />
            <UtilitiesSection />
            <MessagesSection />
            <AppSection />
          </main>

          <Footer activeChapter={activeChapter} />
        </div>
      </BranchProvider>
    </ThemeProvider>
  );
}

export default App;
