
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchLatestGrid, GridSnapshot } from "@/api";

type DensityPoint = {
  x: number;
  y: number;
  value: number; // 0-100
  id?: string;
};

type ZoneInfo = {
  id: string;
  name: string;
  status: 'safe' | 'warning' | 'danger';
  density: number;
};

const CrowdDensityMap = () => {
  // Real-time density points derived from backend grid
  const [densityData, setDensityData] = useState<DensityPoint[]>([]);
  const [timestamp, setTimestamp] = useState(new Date().toLocaleTimeString());
  const [selectedPoint, setSelectedPoint] = useState<DensityPoint | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<DensityPoint | null>(null);
  const [dangerZones, setDangerZones] = useState<ZoneInfo[]>([]);
  const [emergencyMode, setEmergencyMode] = useState(false);
  
  // Poll backend grid and map to points for display
  useEffect(() => {
    let isMounted = true;
    const toPoints = (snap: GridSnapshot): DensityPoint[] => {
      const rows = snap.grid_size.rows;
      const cols = snap.grid_size.cols;
      const points: DensityPoint[] = [];
      const maxCount = Math.max(1, ...snap.grid_counts.flat());
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const count = snap.grid_counts[r][c];
          // Map grid cell center to percentage positions
          const x = ((c + 0.5) / cols) * 100;
          const y = ((r + 0.5) / rows) * 100;
          // Normalize count to 0-100 scale for value
          const value = Math.min(100, Math.round((count / maxCount) * 100));
          points.push({ x, y, value, id: `r${r}c${c}` });
        }
      }
      return points;
    };

    const tick = async () => {
      const snap = await fetchLatestGrid();
      if (!isMounted) return;
      if (snap) {
        setDensityData(toPoints(snap));
        setTimestamp(new Date(snap.timestamp).toLocaleTimeString());
        // Emergency if global risk high or many high cells
        const highCells = snap.grid_counts.flat().filter((n) => n > 5).length;
        setEmergencyMode(snap.risk_level?.toLowerCase() === 'high' || highCells >= 3);
      }
    };

    // Initial and poll
    tick();
    const interval = setInterval(tick, 3000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  // Get color based on density value
  const getDensityColor = (value: number) => {
    if (value >= 70) return 'bg-alert-critical';
    if (value >= 50) return 'bg-alert-high';
    if (value >= 30) return 'bg-alert-medium';
    return 'bg-alert-low';
  };
  
  return (
    <Card className={`col-span-2 row-span-2 ${emergencyMode ? 'border-alert-critical animate-pulse' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle className="text-sm font-medium">Crowd Density Map</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {emergencyMode && (
              <Badge variant="destructive" className="animate-pulse flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                High Density Alert
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              Last updated: {timestamp}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {dangerZones.map(zone => (
            <div 
              key={zone.id}
              className={`rounded-md p-2 border ${
                zone.status === 'danger' ? 'bg-alert-critical/10 border-alert-critical/20' : 
                zone.status === 'warning' ? 'bg-alert-high/10 border-alert-high/20' : 
                'bg-alert-low/10 border-alert-low/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{zone.name}</span>
                <Badge 
                  className={
                    zone.status === 'danger' ? 'bg-alert-critical' : 
                    zone.status === 'warning' ? 'bg-alert-high' : 
                    'bg-alert-low'
                  }
                >
                  {zone.status}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Density: {zone.density}%</div>
            </div>
          ))}
        </div>
        
        <div className="relative border border-border rounded-md overflow-hidden bg-slate-100 w-full h-[400px]">
          {/* Map background */}
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10"></div>
          
          {/* Simulated venue outline */}
          <div className="absolute inset-5 border-2 border-dashed border-gray-400 rounded-lg"></div>
          
          {/* Entry/exit points */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-blue-500 w-16 h-4 -mt-2 rounded-sm flex items-center justify-center">
            <span className="text-[10px] text-white">MAIN ENTRY</span>
          </div>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-blue-500 w-16 h-4 -mb-2 rounded-sm flex items-center justify-center">
            <span className="text-[10px] text-white">EXIT</span>
          </div>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 bg-blue-500 w-4 h-16 -mr-2 rounded-sm flex items-center justify-center">
            <span className="text-[10px] text-white rotate-90">SIDE EXIT</span>
          </div>
          
          {/* Emergency routes */}
          {emergencyMode && (
            <>
              <div className="absolute inset-0 bg-alert-critical/5"></div>
              <div className="absolute top-1/3 left-1/3 right-1/3 border-2 border-green-500 border-dashed animate-pulse z-10 opacity-70">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                  Safe Zone
                </div>
              </div>
              <div className="absolute top-[40%] left-[60%] w-[30%] h-[20%] border-2 border-alert-critical animate-pulse z-10 opacity-70">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-alert-critical text-white text-xs px-2 py-0.5 rounded">
                  Evacuation Needed
                </div>
              </div>
              <div className="absolute h-0.5 bg-green-400 z-10 w-[30%] bottom-[20%] left-[60%] transform -rotate-45 animate-pulse"></div>
              <div className="absolute h-0.5 bg-green-400 z-10 w-[20%] top-[30%] right-[10%] transform -rotate-12 animate-pulse"></div>
            </>
          )}
          
          {/* Density points */}
          {densityData.map((point, index) => {
            const size = Math.max(10, (point.value / 10) + 10); // Size based on density
            const opacity = Math.min(0.8, (point.value / 100) + 0.3); // Opacity based on density
            const isHovered = hoveredPoint?.id === point.id;
            const isSelected = selectedPoint?.id === point.id;
            
            return (
              <div 
                key={index}
                className={`absolute rounded-full ${getDensityColor(point.value)} cursor-pointer`}
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  opacity: opacity,
                  transform: `translate(-50%, -50%) ${isHovered || isSelected ? 'scale(1.3)' : ''}`,
                  transition: 'all 1s ease-in-out, transform 0.2s ease-out',
                  filter: `blur(${size/3}px)`,
                  zIndex: isHovered || isSelected ? 20 : 1
                }}
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
                onClick={() => setSelectedPoint(point === selectedPoint ? null : point)}
              />
            );
          })}
          
          {/* Point info popup */}
          {(hoveredPoint || selectedPoint) && (
            <div 
              className="absolute bg-white p-2 rounded-md shadow-lg z-30 text-xs border transform -translate-x-1/2 -translate-y-[120%]"
              style={{
                left: `${(hoveredPoint || selectedPoint)?.x}%`,
                top: `${(hoveredPoint || selectedPoint)?.y}%`,
              }}
            >
              <div className="font-semibold">Density Point</div>
              <div>Value: {Math.round((hoveredPoint || selectedPoint)!.value)}%</div>
              <div className={
                (hoveredPoint || selectedPoint)!.value > 70 ? 'text-alert-critical' : 
                (hoveredPoint || selectedPoint)!.value > 50 ? 'text-alert-high' : 'text-alert-low'
              }>
                Status: {
                  (hoveredPoint || selectedPoint)!.value > 70 ? 'Critical' : 
                  (hoveredPoint || selectedPoint)!.value > 50 ? 'Warning' : 'Normal'
                }
              </div>
            </div>
          )}
          
          {/* Legend */}
          <div className="absolute bottom-2 right-2 bg-white/90 p-2 rounded text-xs flex flex-col gap-1 border border-border">
            <div className="font-bold">Crowd Density</div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-alert-critical"></div>
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-alert-high"></div>
              <span>High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-alert-medium"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-alert-low"></div>
              <span>Low</span>
            </div>
          </div>
          
          {/* Emergency actions */}
          {emergencyMode && (
            <div className="absolute bottom-2 left-2 flex gap-2">
              <Button size="sm" variant="destructive" className="flex items-center gap-1">
                Evacuate Area <ArrowRight className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" className="bg-background">
                Send Alert
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CrowdDensityMap;
