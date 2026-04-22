import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);    

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#11212D' }}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />  
      
      <main 
        className={`transition-all duration-300 min-h-screen flex flex-col ${     
          isSidebarOpen ? 'ml-[280px]' : 'ml-[88px]'
        }`}
      >
        <TopBar />   
        
        <div className="flex-1 p-8 animate-fade-in-up">
          {children}
        </div>

        {/* Footer */}
        <footer className="p-8 text-center text-sm" style={{ borderTop: '1px solid #253745', color: '#4A5C6A' }}>
          <p>© 2026 Smart Campus Operations Hub - PAF Assignment</p>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
