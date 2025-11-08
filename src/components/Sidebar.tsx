import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Scissors,
  Users,
  Calendar,
  BookOpen,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  tenantName?: string;
}

export default function Sidebar({ tenantName = 'Mi Negocio' }: SidebarProps) {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  
  const navItems = [
    { href: '/app', label: 'Resumen', icon: LayoutDashboard },
    { href: '/app/services', label: 'Servicios', icon: Scissors },
    { href: '/app/staff', label: 'Personal', icon: Users },
    { href: '/app/schedule', label: 'Horarios', icon: Calendar },
    { href: '/app/bookings', label: 'Reservas', icon: BookOpen },
    { href: '/app/settings', label: 'Configuración', icon: Settings },
  ];

  const handleNavigate = (href: string) => {
    // Extract tenant info from current path
    const match = currentPath.match(/^\/([^\/]+)\/([^\/]+)/);
    if (match) {
      window.location.href = `/${match[1]}/${match[2]}${href}`;
    }
  };

  return (
    <aside className="w-64 border-r bg-card flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">{tenantName}</h2>
      </div>
      <ScrollArea className="flex-1">
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath.endsWith(item.href) || 
                           (item.href === '/app' && currentPath.endsWith('/app'));
            
            return (
              <Button
                key={item.href}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-2',
                  isActive && 'bg-secondary'
                )}
                onClick={() => handleNavigate(item.href)}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
