
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Bell, Clock, Filter, MapPin, Search, X, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

const Alerts = () => {
  const { alerts, markAlertAsRead } = useData();
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<{[key: string]: boolean}>({
    critical: true,
    high: true,
    medium: true,
    low: true
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Filter alerts based on search and filters
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter[alert.level];
    
    return matchesSearch && matchesStatus;
  });

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const criticalCount = filteredAlerts.filter(alert => alert.level === "critical").length;
  const highCount = filteredAlerts.filter(alert => alert.level === "high").length;

  const getLevelClass = (level: string) => {
    switch(level) {
      case 'critical': return 'bg-alert-critical text-white';
      case 'high': return 'bg-alert-high text-white';
      case 'medium': return 'bg-alert-medium text-white';
      case 'low': return 'bg-alert-low text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-alert-critical animate-pulse" />
          <h1 className="text-2xl font-bold">Alert Management</h1>
        </div>
        <Badge variant="outline" className="flex gap-1 animate-pulse-alert">
          <Bell className="h-3 w-3" />
          {unreadCount} unread
        </Badge>
      </div>

      <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-alert-high/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-alert-high" />
            <div>
              <h3 className="font-medium">Crowd Management Priority</h3>
              <p className="text-sm text-muted-foreground">Monitor these alerts closely to prevent stampede situations</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center space-x-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="search"
            placeholder="Search alerts..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setFilterOpen(!filterOpen)}
          className={filterOpen ? "bg-secondary" : ""}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Collapsible open={filterOpen} onOpenChange={setFilterOpen}>
        <CollapsibleContent className="border rounded-md p-3 mb-4 bg-muted/50">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Filter by Status</h3>
            <div className="flex gap-4">
              {["critical", "high", "medium", "low"].map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`filter-${level}`} 
                    checked={statusFilter[level]}
                    onCheckedChange={(checked) => 
                      setStatusFilter({...statusFilter, [level]: !!checked})
                    }
                  />
                  <label htmlFor={`filter-${level}`} className="text-sm font-medium capitalize">
                    {level}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Alerts</TabsTrigger>
          <TabsTrigger value="critical" className="text-alert-critical">Critical ({criticalCount})</TabsTrigger>
          <TabsTrigger value="high" className="text-alert-high">High ({highCount})</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <AlertList 
            alerts={filteredAlerts} 
            formatDate={formatDate} 
            getLevelClass={getLevelClass} 
            markAlertAsRead={markAlertAsRead}
          />
        </TabsContent>

        <TabsContent value="critical" className="mt-4">
          <AlertList 
            alerts={filteredAlerts.filter(a => a.level === "critical")} 
            formatDate={formatDate} 
            getLevelClass={getLevelClass}
            markAlertAsRead={markAlertAsRead} 
          />
        </TabsContent>

        <TabsContent value="high" className="mt-4">
          <AlertList 
            alerts={filteredAlerts.filter(a => a.level === "high")} 
            formatDate={formatDate} 
            getLevelClass={getLevelClass}
            markAlertAsRead={markAlertAsRead}
          />
        </TabsContent>

        <TabsContent value="read" className="mt-4">
          <AlertList 
            alerts={filteredAlerts.filter(a => a.isRead)} 
            formatDate={formatDate} 
            getLevelClass={getLevelClass}
            markAlertAsRead={markAlertAsRead}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Alert list component with enhanced styling
const AlertList = ({ 
  alerts, 
  formatDate, 
  getLevelClass,
  markAlertAsRead 
}: {
  alerts: Array<{
    id: string;
    title: string;
    message: string;
    level: string;
    timestamp: string;
    location: string;
    isRead: boolean;
  }>;
  formatDate: (date: string) => string;
  getLevelClass: (level: string) => string;
  markAlertAsRead: (id: string) => void;
}) => {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Bell className="h-16 w-16 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No alerts found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[600px] rounded-md border">
      <div className="divide-y">
        {alerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`p-4 ${!alert.isRead ? 'bg-muted/30' : ''} hover:bg-muted/50 transition-colors`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-2">
                <div className={`${alert.level === 'critical' ? 'animate-pulse' : ''}`}>
                  <Badge className={`${getLevelClass(alert.level)} ${alert.level === 'critical' ? 'animate-pulse' : ''}`}>
                    {alert.level}
                  </Badge>
                  <h3 className="font-medium mt-1">{alert.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {alert.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(alert.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
              {!alert.isRead && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => markAlertAsRead(alert.id)}
                  className="hover:bg-secondary"
                >
                  Mark as read
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default Alerts;
