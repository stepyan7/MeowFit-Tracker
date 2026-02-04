
import React from 'react';
import { NAVIGATION_TABS } from '../constants';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {NAVIGATION_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center w-full h-full relative group transition-all"
            >
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'text-violet-600 scale-110' : 'text-gray-400'}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold mt-0.5 transition-all ${isActive ? 'text-violet-600' : 'text-gray-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -top-0.5 w-1 h-1 bg-violet-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
