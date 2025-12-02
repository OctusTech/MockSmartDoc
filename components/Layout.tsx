import React, { useState } from 'react';
import { LOGO_URL } from '../constants';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onChangeView: (view: string) => void;
  onLogout: () => void;
  userRole: UserRole;
  userName: string;
}

const MenuItem = ({ 
  label, 
  active, 
  onClick, 
  icon 
}: { 
  label: string; 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 group relative
      ${active 
        ? 'text-smart-darkest' 
        : 'text-gray-400 hover:text-white'
      }`}
  >
    {/* Active Background Indicator - mimicking the white pill shape */}
    {active && (
      <div className="absolute left-4 right-4 top-2 bottom-2 bg-smart-lightest rounded-xl -z-10 shadow-lg" />
    )}

    <div className={`transition-transform duration-300 ${active ? 'scale-110 text-smart-darkest' : 'group-hover:scale-110'}`}>
      {icon}
    </div>
    <span className={`font-medium tracking-wide ${active ? 'font-bold' : ''}`}>{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeView, 
  onChangeView, 
  onLogout,
  userRole,
  userName
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#E8F3F1] font-sans overflow-hidden">
      {/* Sidebar - Rounded Edge Design */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-smart-darkest transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0
        flex flex-col rounded-r-[3rem] shadow-2xl my-0 md:my-0
      `}>
        {/* Logo Area */}
        <div className="h-32 flex items-center justify-center p-6">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
             <img src={LOGO_URL} alt="Logo" className="h-8 w-auto object-contain" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-2">
          <MenuItem 
            label="Dashboard" 
            active={activeView === 'dashboard'} 
            onClick={() => onChangeView('dashboard')}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
          />
          <MenuItem 
            label="Conhecimento" 
            active={activeView === 'knowledge'} 
            onClick={() => onChangeView('knowledge')}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
          />
          <MenuItem 
            label="Configurações" 
            active={activeView === 'config'} 
            onClick={() => onChangeView('config')}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
        </nav>

        {/* Logout */}
        <div className="p-8">
           <div className="bg-white/5 rounded-2xl p-4">
              <button 
                onClick={onLogout}
                className="flex items-center gap-3 text-gray-400 hover:text-white w-full transition-colors"
              >
                <div className="bg-white/10 p-2 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </div>
                <span className="font-medium">Sair da Conta</span>
              </button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="flex items-center justify-between px-8 py-6">
           {/* Search Bar */}
           <div className="flex-1 max-w-xl">
             <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </span>
                <input 
                  type="text" 
                  placeholder="Pesquisar documentos, cláusulas ou análises..." 
                  className="w-full py-3 pl-12 pr-4 bg-white/60 backdrop-blur-md border-none rounded-full text-gray-700 shadow-sm focus:ring-2 focus:ring-smart-primary/50 outline-none transition-all placeholder-gray-400"
                />
             </div>
           </div>

           {/* User Profile */}
           <div className="flex items-center gap-6 ml-4">
              <div className="flex items-center gap-4 text-gray-500">
                 <button className="relative p-2 hover:bg-white/50 rounded-full transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                 </button>
                 <button className="relative p-2 hover:bg-white/50 rounded-full transition-colors">
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border border-white"></span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                 </button>
              </div>
              
              <div className="flex items-center gap-3 pl-6 border-l border-gray-300">
                  <div className="text-right hidden md:block">
                     <p className="text-sm font-bold text-smart-darkest">{userName}</p>
                     <p className="text-xs text-smart-primary">{userRole}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-smart-primary to-smart-accent flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                     {userName.charAt(0)}
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
           </div>

           {/* Mobile Toggle */}
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden ml-4">
              <svg className="w-6 h-6 text-smart-darkest" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
           </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto px-8 pb-8 custom-scrollbar">
          {children}
        </div>
      </main>
      
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};