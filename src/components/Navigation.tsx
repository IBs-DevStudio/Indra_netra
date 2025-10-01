import { Link, useLocation } from 'react-router-dom';
import { Eye, Home, Camera, Image, Monitor, BarChart3, Settings, Shield } from 'lucide-react';

export function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/detection', label: 'Live Detection', icon: Camera },
    { path: '/analysis', label: 'Image Analysis', icon: Image },
    { path: '/surveillance', label: 'Surveillance', icon: Monitor },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/about', label: 'About Military', icon: Shield }
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Eye className="h-8 w-8 text-orange-500" />
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg">Indra-Netra</span>
                <span className="text-orange-300 text-xs">(इन्द्र नेत्र)</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-300 hover:text-white p-2">
              <Monitor className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className="md:hidden border-t border-slate-700 py-2">
          <div className="grid grid-cols-3 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`p-3 rounded-lg flex flex-col items-center space-y-1 transition-all duration-200 ${
                    isActive
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}