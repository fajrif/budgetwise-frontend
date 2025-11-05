import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { LayoutDashboard, FolderKanban, Receipt, Settings, LogOut, TrendingUp, Calculator } from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      roles: ['admin', 'user']
    },
    {
      title: "Proyek",
      url: "/projects",
      icon: FolderKanban,
      roles: ['admin', 'user']
    },
    {
      title: "Transaksi",
      url: "/transactions",
      icon: Receipt,
      roles: ['admin', 'user']
    },
    {
      title: "Management Fee",
      url: "/management-fee",
      icon: Calculator,
      roles: ['admin']
    },
    {
      title: "Master Data",
      url: "/master-data",
      icon: Settings,
      roles: ['admin']
    },
  ];

  const filteredNavItems = navigationItems.filter(item =>
    !item.roles || item.roles.includes(user?.role)
  );

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Budget Monitor</h2>
              <p className="text-xs text-slate-500">Sistem Monitoring Anggaran</p>
            </div>
          </div>
        </div>
 
        <nav className="flex-1 p-3">
          <div className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <Link
                  key={item.url}
                  to={item.url}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                      : 'hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 text-sm truncate">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.role === 'admin' ? 'Administrator' : 'User'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full justify-start gap-2 text-slate-600 hover:text-red-600 hover:border-red-200"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
