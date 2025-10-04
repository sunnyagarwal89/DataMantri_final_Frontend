import React, { useState, ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  title: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, title, onNavigate }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-200 ease-in-out z-30`}
      >
        <a href="#" className="text-white text-2xl font-semibold px-4">DataMantri</a>
        <nav>
                    <a href="#" onClick={() => onNavigate('dashboard')} className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Dashboard</a>
          <a href="#" onClick={() => onNavigate('data-sources')} className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Data Sources</a>
          <a href="#" onClick={() => onNavigate('create-dashboard-ai')} className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Create Dashboard - AI</a>
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-white border-b-2 border-gray-200">
          <div className="md:hidden">
            <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <div></div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
