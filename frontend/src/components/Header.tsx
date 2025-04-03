
import { Bell, User, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useData } from "@/context/DataContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Header = () => {
  const { alerts } = useData();
  const [showNotifications, setShowNotifications] = useState(false);

  // Count unread notifications
  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  
  // Get recent alerts for dropdown
  const recentAlerts = alerts
    .filter(alert => !alert.isRead)
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className="h-16 px-4 border-b border-border flex justify-between items-center sticky top-0 bg-background z-10">
      <div className="flex items-center">
        <SidebarTrigger className="mr-3">
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold">Crowd Guardian</span>
        </div>
      </div>
      <div className="flex-1 px-6 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            type="search" 
            placeholder="Search..." 
            className="w-full bg-secondary pl-8"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu onOpenChange={setShowNotifications} open={showNotifications}>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] bg-alert-high text-white text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold">Notifications</h2>
                {unreadCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {unreadCount} unread
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {recentAlerts.length > 0 ? (
                recentAlerts.map(alert => (
                  <DropdownMenuItem key={alert.id} className="py-3">
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex justify-between items-center">
                        <Badge className={`${
                          alert.level === 'critical' 
                            ? 'bg-alert-critical' 
                            : alert.level === 'high'
                              ? 'bg-alert-high'
                              : alert.level === 'medium'
                                ? 'bg-alert-medium'
                                : 'bg-alert-low'
                          } text-white`}
                        >
                          {alert.level}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(alert.timestamp)}
                        </span>
                      </div>
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="py-6 text-center">
                  <p className="text-sm text-muted-foreground">No new notifications</p>
                </div>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="justify-center">
              <a href="/alerts" className="text-center text-sm">
                View all notifications
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
