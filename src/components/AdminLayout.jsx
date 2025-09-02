// src/pages/admin/AdminLayout.jsx
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Package2, Users, BusFront, Route, CalendarCheck, LogOut, LayoutDashboard,Building2,Map ,Handshake} from 'lucide-react';
import { Button } from '../../src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle ,} from '../../src/components/ui/card';
import { useAuth } from '../../src/context/AuthContext';
import { useToast } from '../../src/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Rediriger si l'utilisateur n'est pas admin ou n'est pas connecté
  if (!user || user.role !== 'admin') {
    toast({
      title: t('unauthorized_access'),
      description: t('admin_access_required'),
      variant: 'destructive',
    });
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    toast({
      title: t('logged_out'),
      description: t('successfully_logged_out'),
    });
    navigate('/login');
  };

  const navItems = [
    { name: t('dashboard'), icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: t('users'), icon: Users, path: '/admin/users' },
     { name: t('companies'), icon: Building2, path: '/admin/companies' }, 
    { name: t('routes'), icon: Route, path: '/admin/routes' },
    { name: t('buses'), icon: BusFront, path: '/admin/buses' },
    { name: t('bookings'), icon: CalendarCheck, path: '/admin/bookings' },
    { name: t('cities'), icon: Map, path: '/admin/cities' },
    { name: t('partners'), icon: Handshake, path: '/admin/partners' }
  ];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] font-inter">
      {/* Sidebar */}
      <div className="hidden border-r bg-white md:block dark:bg-gray-900 shadow-lg">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 bg-white dark:bg-gray-900">
            <Link to="/admin" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6 text-[#e85805]" />
              <span className="text-gray-900 dark:text-gray-100">Adjamegare Admin</span>
            </Link>
          </div>
          <div className="flex-1 bg-white dark:bg-gray-900">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-[#e85805] hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4 bg-white dark:bg-gray-900">
            <Card className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">{t('admin_panel')}</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  {t('manage_app_data')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full bg-[#e85805] hover:bg-[#F46A21] text-white" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('logout')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-white px-4 lg:h-[60px] lg:px-6 dark:bg-gray-900 shadow-sm">
          <Link to="#" className="md:hidden">
            <Package2 className="h-6 w-6" />
            <span className="sr-only">Home</span>
          </Link>
          <div className="w-full flex-1">
            {/* Vous pouvez ajouter une barre de recherche ou d'autres éléments ici si nécessaire */}
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('welcome')}, {user?.firstName} ({user?.role})
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gray-100 dark:bg-gray-800">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;