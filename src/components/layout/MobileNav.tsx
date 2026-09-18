import React from 'react';
import { navItems } from './Sidebar';
import { cn } from '../../lib/utils';
import { Languages } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { NotificationCenter } from './NotificationCenter';
import { useGlobal } from '../../context/GlobalContext';
import { useLanguage } from '../../context/LanguageContext';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  const { currentUserRole, businessSettings } = useGlobal();
  const { language, setLanguage, t } = useLanguage();

  const filteredNavItems = navItems.filter(item => {
    if (currentUserRole === 'staff' && (item.id === 'hr' || item.id === 'settings')) {
      return false;
    }
    return true;
  });

  return (
    <div className="md:hidden">
      {/* Top Bar (Glassmorphism) */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200/50 bg-white/70 backdrop-blur-xl px-4 dark:border-white/10 dark:bg-black/50 sticky top-0 z-10">
        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
          {businessSettings.businessName}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            className="flex items-center justify-center w-10 h-10 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10"
            title="Toggle Language"
          >
            <Languages className="w-5 h-5" />
          </button>
          <NotificationCenter />
          <div className="flex items-center justify-center w-10 h-10">
            <ThemeToggle isCollapsed={true} />
          </div>
        </div>
      </div>

      {/* Floating Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 w-full border-t border-slate-200/50 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-black/50 z-50 pb-safe">
        <nav className="flex justify-around items-center h-16 px-1 overflow-x-auto no-scrollbar">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex flex-col items-center justify-center min-w-[4rem] h-14 rounded-xl transition-colors shrink-0',
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50'
                )}
              >
                <div className={cn(
                  "p-1 rounded-full mb-0.5 transition-all duration-200", 
                  isActive ? "bg-indigo-100 dark:bg-indigo-500/20" : "bg-transparent"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium tracking-tight truncate w-full text-center px-1">
                  {t(item.label)}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
