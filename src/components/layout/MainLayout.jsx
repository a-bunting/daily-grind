import { useApp } from '../AppProvider';
import { DemoNotice } from '../DemoNotice';

export const MainLayout = ({ children }) => {
  const { colors, isMobile, isTablet } = useApp();

  return (
    <div 
      className="min-h-screen flex relative"
      style={{ background: colors.background }}
    >
      {/* Trendy overlay pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 0%, transparent 50%)`
        }}
      ></div>

      {children}

      {/* Demo Notice */}
      <DemoNotice />
    </div>
  );
};

export default MainLayout;