
import { useState } from "react";
import { useData } from "@/context/DataContext";
import CrowdDensityMap from "@/components/CrowdDensityMap";
import EvacuationRoutes from "@/components/EvacuationRoutes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, MapPin, Map as MapIcon, Eye, Route, Users, CalendarClock, ArrowDownUp } from "lucide-react";
import StatusCard from "@/components/StatusCard";
import AlertBanner from "@/components/AlertBanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MapPage = () => {
  const { cameras, metrics, alerts } = useData();
  const [mapView, setMapView] = useState<string>("heatmap");
  const { toast } = useToast();
  
  // Get the most recent high or critical alert
  const criticalAlert = alerts
    .filter(alert => alert.level === "critical" || alert.level === "high")
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Time periods for historical view
  const timePeriods = [
    "Current", "Last hour", "Today", "Yesterday", "Last week"
  ];
  
  const [selectedTime, setSelectedTime] = useState("Current");
  
  const handleEmergencySimulation = () => {
    toast({
      title: "Emergency Simulation Started",
      description: "Simulating high crowd density near Main Gate area",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MapIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Crowd Density Map</h1>
        </div>
        
        <Button 
          variant="destructive" 
          size="sm" 
          className="gap-1"
          onClick={handleEmergencySimulation}
        >
          <AlertCircle className="h-4 w-4" />
          Simulate Emergency
        </Button>
      </div>
      
      {criticalAlert && (
        <AlertBanner
          title={criticalAlert.title}
          message={criticalAlert.message}
          level={criticalAlert.level}
          time={formatDate(criticalAlert.timestamp)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatusCard
          title="Current Crowd Density"
          value={`${metrics.crowdDensity}%`}
          description="Percentage of maximum safe density"
          status={metrics.riskLevel}
          icon={<MapPin className="h-4 w-4" />}
        />
        
        <Card className="bg-muted/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Map Visualization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="view-type" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="view-type" className="flex-1">View Type</TabsTrigger>
                <TabsTrigger value="time-period" className="flex-1">Time Period</TabsTrigger>
              </TabsList>
              <TabsContent value="view-type" className="mt-2">
                <Select defaultValue={mapView} onValueChange={setMapView}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>View Types</SelectLabel>
                      <SelectItem value="heatmap">Heat Map</SelectItem>
                      <SelectItem value="flow">Flow Pattern</SelectItem>
                      <SelectItem value="risk">Risk Zones</SelectItem>
                      <SelectItem value="evacuation">Evacuation Routes</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </TabsContent>
              <TabsContent value="time-period" className="mt-2">
                <Select defaultValue={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Time Period</SelectLabel>
                      {timePeriods.map((period) => (
                        <SelectItem key={period} value={period}>
                          {period}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <StatusCard
          title="Hotspot Areas"
          value={criticalAlert ? "Detected" : "None"}
          description="Areas with high crowd concentration"
          status={criticalAlert ? "high" : "low"}
          icon={<AlertCircle className="h-4 w-4" />}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CrowdDensityMap />
        </div>
        
        <div className="space-y-6">
          <EvacuationRoutes />
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowDownUp className="h-4 w-4" />
                Flow Analysis
              </CardTitle>
              <CardDescription>Movement patterns and bottlenecks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Route className="h-4 w-4 text-primary" />
                    <span>Main Entrance to Central Area</span>
                  </div>
                  <Badge className="bg-alert-medium">Medium Flow</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Route className="h-4 w-4 text-primary" />
                    <span>Central Area to East Wing</span>
                  </div>
                  <Badge className="bg-alert-high">High Flow</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Route className="h-4 w-4 text-primary" />
                    <span>Food Court to Exit B</span>
                  </div>
                  <Badge className="bg-alert-critical">Bottleneck</Badge>
                </div>
                
                <div className="mt-2">
                  <Button size="sm" className="w-full gap-1">
                    <Users className="h-3 w-3" />
                    Rebalance Crowd Flow
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                Predicted Crowd Peaks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <div>12:30 PM - 1:30 PM</div>
                  <Badge className="bg-alert-high">Lunch Rush</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div>3:00 PM - 4:00 PM</div>
                  <Badge className="bg-alert-medium">Mid Afternoon</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div>5:30 PM - 7:00 PM</div>
                  <Badge className="bg-alert-critical">Peak Evening</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="text-sm text-muted-foreground mt-2">
        <div className="flex gap-3">
          <div className="flex items-center">
            <div className="h-3 w-3 bg-alert-low rounded-full mr-1"></div>
            <span>Low Density</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 bg-alert-medium rounded-full mr-1"></div>
            <span>Medium Density</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 bg-alert-high rounded-full mr-1"></div>
            <span>High Density</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 bg-alert-critical rounded-full mr-1"></div>
            <span>Critical Density</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;