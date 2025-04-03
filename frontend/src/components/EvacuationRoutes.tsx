
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, CornerDownRight, ArrowRight, Users } from "lucide-react";

interface Route {
  id: string;
  name: string;
  status: 'clear' | 'congested' | 'blocked';
  capacityPerMinute: number;
  distance: number;
  crowdDensity: number;
}

const EvacuationRoutes = () => {
  const [routes, setRoutes] = useState<Route[]>([
    {
      id: 'route1',
      name: 'Main Exit Route',
      status: 'clear',
      capacityPerMinute: 200,
      distance: 150,
      crowdDensity: 25
    },
    {
      id: 'route2',
      name: 'East Wing Exit',
      status: 'congested',
      capacityPerMinute: 150,
      distance: 120,
      crowdDensity: 65
    },
    {
      id: 'route3',
      name: 'Emergency Exit A',
      status: 'clear',
      capacityPerMinute: 180,
      distance: 90,
      crowdDensity: 15
    },
    {
      id: 'route4',
      name: 'South Gate',
      status: 'blocked',
      capacityPerMinute: 0,
      distance: 200,
      crowdDensity: 85
    }
  ]);
  
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clear': return 'bg-green-500 text-white';
      case 'congested': return 'bg-orange-500 text-white';
      case 'blocked': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  const getCrowdDensityColor = (density: number) => {
    if (density > 70) return 'text-alert-critical';
    if (density > 50) return 'text-alert-high';
    if (density > 30) return 'text-alert-medium';
    return 'text-alert-low';
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <CardTitle className="text-sm font-medium">Evacuation Routes</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">Updated: {new Date().toLocaleTimeString()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid gap-3">
          {routes.map(route => (
            <div 
              key={route.id}
              className={`border rounded-md overflow-hidden transition-all ${
                selectedRoute === route.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    route.status === 'clear' ? 'bg-green-500' : 
                    route.status === 'congested' ? 'bg-orange-500' : 
                    'bg-red-500'
                  }`}></div>
                  <div>
                    <h3 className="font-medium text-sm">{route.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{route.distance}m</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span className={getCrowdDensityColor(route.crowdDensity)}>
                          {route.crowdDensity}% occupied
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(route.status)}>
                    {route.status}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => setSelectedRoute(selectedRoute === route.id ? null : route.id)}
                  >
                    <CornerDownRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {selectedRoute === route.id && (
                <div className="bg-muted/30 p-3 border-t">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Capacity Per Minute</div>
                      <div className="font-medium">{route.capacityPerMinute} people</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Estimated Time</div>
                      <div className="font-medium">{Math.round(route.distance / 10)} min</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-between">
                    <Button size="sm" variant="outline" className="text-xs">View on Map</Button>
                    {route.status !== 'blocked' && (
                      <Button size="sm" className="text-xs flex items-center gap-1">
                        Direct Crowd <ArrowRight className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EvacuationRoutes;
