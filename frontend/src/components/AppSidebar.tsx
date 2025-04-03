
import { useState } from 'react';
import { 
  Bell, 
  LayoutDashboard, 
  MapPin, 
  Settings, 
  Users,
  Search,
  Video
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";

const menuItems = [
  { 
    title: 'Dashboard', 
    icon: LayoutDashboard,
    url: '/'
  },
  { 
    title: 'Monitoring', 
    icon: Video,
    url: '/monitoring'
  },
  { 
    title: 'Crowd Map', 
    icon: MapPin,
    url: '/map'
  },
  { 
    title: 'Alerts', 
    icon: Bell,
    url: '/alerts'
  },
  { 
    title: 'Analytics', 
    icon: Search,
    url: '/analytics'
  },
  { 
    title: 'Personnel', 
    icon: Users,
    url: '/personnel'
  },
  { 
    title: 'Settings', 
    icon: Settings,
    url: '/settings'
  }
];

export function AppSidebar() {
  const [activeItem, setActiveItem] = useState('Dashboard');
  
  return (
    <Sidebar>
      <div className="flex flex-col items-center justify-center p-4 border-b border-border">
        <h2 className="text-lg font-bold">Crowd Guardian</h2>
        <p className="text-xs text-muted-foreground">Alert System</p>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    className={activeItem === item.title ? "bg-secondary" : ""}
                    onClick={() => setActiveItem(item.title)}
                    asChild
                  >
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
