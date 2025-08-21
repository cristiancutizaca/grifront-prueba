'use client';

import React, { useState, useEffect } from 'react';
import {
  Home, Users, ShoppingCart, CreditCard, Package, BarChart3, User, Clock,
  Settings, Menu, ChevronLeft, ChevronRight, Fuel
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

// Definir los menús según los roles que devuelve el backend
const MENU_ITEMS = {
  superadmin: [
    { name: 'Dashboard', icon: Home, path: '/grifo' },
    { name: 'Clientes', icon: Users, path: '/grifo-clientes' },
    { name: 'Configuración', icon: Settings, path: '/grifo-configuracion' },
    { name: 'Créditos', icon: CreditCard, path: '/grifo-creditos' },
    { name: 'Empleados', icon: Users, path: '/grifo-empleados' },
    { name: 'Inventario', icon: Package, path: '/grifo-inventario' },
    { name: 'Reportes', icon: BarChart3, path: '/grifo-reportes' },
    { name: 'Turnos', icon: Clock, path: '/grifo-turnos' },
    { name: 'Ventas', icon: ShoppingCart, path: '/grifo-ventas' },
    { name: 'Usuarios', icon: Clock, path: '/grifo-usuario' },
    { name: 'Super Admin', icon: User, path: '/super-admin' },
  ],
  admin: [
    { name: 'Dashboard', icon: Home, path: '/grifo' },
    { name: 'Clientes', icon: Users, path: '/grifo-clientes' },
    { name: 'Configuración', icon: Settings, path: '/grifo-configuracion' },
    { name: 'Créditos', icon: CreditCard, path: '/grifo-creditos' },
    { name: 'Empleados', icon: Users, path: '/grifo-empleados' },
    { name: 'Inventario', icon: Package, path: '/grifo-inventario' },
    { name: 'Reportes', icon: BarChart3, path: '/grifo-reportes' },
    { name: 'Turnos', icon: Clock, path: '/grifo-turnos' },
    { name: 'Usuarios', icon: Clock, path: '/grifo-usuario' },
    { name: 'Ventas', icon: ShoppingCart, path: '/grifo-ventas' },
  ],
  seller: [
    { name: 'Dashboard', icon: Home, path: '/grifo' },
    { name: 'Clientes', icon: Users, path: '/grifo-clientes' },
    { name: 'Ventas', icon: ShoppingCart, path: '/grifo-ventas' },
    { name: 'Inventario', icon: Package, path: '/grifo-inventario' },
  ]
};

interface NavItem {
  name: string;
  icon: any;
  path: string;
}

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
        
        if (!token) {
          router.push("/");
          return;
        }

        let role = "seller";

        // Decodificar el JWT real
        const { jwtDecode } = await import("jwt-decode");
        const decoded: any = jwtDecode(token);
        role = decoded.role || decoded.rol || "seller";
        
        setUserRole(role);
        setIsLoading(false);
        
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        sessionStorage.removeItem("token");
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <span className="text-xl">Cargando...</span>
        </div>
      </div>
    );
  }

  // Si no hay rol después de la carga, no renderizar nada (se redirigirá al login)
  if (!userRole) {
    return null;
  }

  const navItems: NavItem[] = MENU_ITEMS[userRole as keyof typeof MENU_ITEMS] || MENU_ITEMS['seller'];

  // Función para obtener el nombre del rol para mostrar
  const getRoleDisplayName = (role: string) => {
    const baseName = (() => {
      switch (role) {
        case 'superadmin':
          return 'Super Admin';
        case 'admin':
          return 'Administrador';
        case 'seller':
          return 'Vendedor';
        default:
          return 'Usuario';
      }
    })();
    
    return baseName;
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    router.push("/");
  };



  return (
    <div className="flex h-screen bg-slate-900 text-white">
      {/* Sidebar */}
      <aside
        className={`bg-slate-800 p-4 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col justify-between`}
      >
        <div>
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-3">
              <Fuel size={24} />
            </div>
            {sidebarOpen && <h1 className="text-xl font-bold">Gas Station</h1>}
          </div>
          <nav>
            <ul>
              {navItems.map((item) => (
                <li key={item.name} className="mb-2">
                  <Link
                    href={item.path}
                    className={`w-full flex items-center p-2 rounded-lg hover:bg-slate-700 transition-colors
                      ${pathname === item.path
                        ? 'bg-orange-500 text-white'
                        : 'text-slate-300'
                      }`}
                  >
                    <item.icon size={20} className="mr-3" />
                    {sidebarOpen && <span>{item.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-auto">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full p-2 rounded-lg text-slate-300 hover:bg-slate-700 flex items-center justify-center transition-colors mb-2"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            {sidebarOpen && <span className="ml-2">Colapsar</span>}
          </button>
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="w-full p-2 rounded-lg text-slate-300 hover:bg-red-600 transition-colors text-sm"
            >
              Cerrar Sesión
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-0 overflow-y-auto bg-slate-900">
        <header className="flex justify-between items-center p-4 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-white">
              {getRoleDisplayName(userRole)}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              10
            </div>
            <span className="text-slate-300 text-sm">{getRoleDisplayName(userRole)}</span>
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
