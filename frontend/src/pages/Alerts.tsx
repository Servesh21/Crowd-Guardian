import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Bell, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState({
    High: true,
    Medium: true,
    Low: true,
  });

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/alerts/get_alerts");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        if (data.status === "success") {
          console.log("Fetched Alerts:", data.data);
          setAlerts(data.data);
        } else {
          console.error("Error: Unexpected API response", data);
        }
      } catch (error) {
        console.error("Error fetching alerts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " " + date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(alert.people_count).includes(searchQuery) ||
      alert.risk_level.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk = riskFilter[alert.risk_level] ?? false;

    return matchesSearch && matchesRisk;
  });

  const unreadCount = alerts.length; // Assuming all alerts are unread
  const highCount = filteredAlerts.filter((alert) => alert.risk_level === "High").length;
  const mediumCount = filteredAlerts.filter((alert) => alert.risk_level === "Medium").length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-alert-critical animate-pulse" />
          Crowd Alerts
        </h1>
        <Badge variant="outline" className="flex gap-1 animate-pulse-alert">
          <Bell className="h-3 w-3" /> {unreadCount} alerts
        </Badge>
      </div>

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
        <Button variant="outline" size="icon" onClick={() => setFilterOpen(!filterOpen)} className={filterOpen ? "bg-secondary" : ""}>
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Collapsible open={filterOpen} onOpenChange={setFilterOpen}>
        <CollapsibleContent className="border rounded-md p-3 mb-4 bg-muted/50">
          <h3 className="text-sm font-medium">Filter by Risk Level</h3>
          <div className="flex gap-4">
            {["High", "Medium", "Low"].map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={`filter-${level}`}
                  checked={riskFilter[level]}
                  onCheckedChange={(checked) => setRiskFilter({ ...riskFilter, [level]: !!checked })}
                />
                <label htmlFor={`filter-${level}`} className="text-sm font-medium capitalize">
                  {level}
                </label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Alerts</TabsTrigger>
          <TabsTrigger value="high" className="text-alert-critical">High ({highCount})</TabsTrigger>
          <TabsTrigger value="medium" className="text-alert-warning">Medium ({mediumCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <AlertList alerts={filteredAlerts} formatDate={formatDate} />
        </TabsContent>
        <TabsContent value="high">
          <AlertList alerts={filteredAlerts.filter((a) => a.risk_level === "High")} formatDate={formatDate} />
        </TabsContent>
        <TabsContent value="medium">
          <AlertList alerts={filteredAlerts.filter((a) => a.risk_level === "Medium")} formatDate={formatDate} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const AlertList = ({ alerts, formatDate }) => {
  if (alerts.length === 0) {
    return <p className="text-center text-muted-foreground">No alerts found.</p>;
  }

  return (
    <ScrollArea className="h-[600px] rounded-md border">
      {alerts.map((alert) => (
        <Card key={alert.id} className="p-4">
          <CardContent>
            <h3 className="font-medium">Location: {alert.location}</h3>
            <p className="text-sm">People Count: {alert.people_count}</p>
            <p className="text-sm">Density per sqm: {alert.density_per_sqm}</p>
            <p className="text-sm">Occupancy: {alert.occupancy}</p>
            <p className={`text-sm font-bold ${alert.risk_level === "High" ? "text-red-500" : alert.risk_level === "Medium" ? "text-yellow-500" : "text-green-500"}`}>
              Risk Level: {alert.risk_level}
            </p>
            <p className="text-xs text-muted-foreground">{formatDate(alert.timestamp)}</p>
          </CardContent>
        </Card>
      ))}
    </ScrollArea>
  );
};

export default Alerts;
