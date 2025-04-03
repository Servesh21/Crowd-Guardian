
import { createContext, useState, useContext, useEffect, ReactNode } from "react";

// Define alert level types
export type AlertLevel = 'low' | 'medium' | 'high' | 'critical';

// Define data structure for alerts
export interface Alert {
  id: string;
  title: string;
  message: string;
  level: AlertLevel;
  timestamp: string;
  location: string;
  isRead: boolean;
}

// Define data structure for cameras
export interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  riskLevel: AlertLevel;
  lastUpdated: string;
}

// Define initial data state
interface DataContextType {
  alerts: Alert[];
  cameras: Camera[];
  metrics: {
    crowdDensity: number;
    riskLevel: AlertLevel;
    occupancy: number;
    maxCapacity: number;
    incidentCount: number;
  };
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'isRead'>) => void;
  markAlertAsRead: (id: string) => void;
  updateCamera: (id: string, data: Partial<Camera>) => void;
}

// Create context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider component
export const DataProvider = ({ children }: { children: ReactNode }) => {
  // Initialize alerts state
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      title: "High Density Alert",
      message: "Unusually high crowd density detected in Main Stage area",
      level: "high",
      timestamp: new Date().toISOString(),
      location: "Main Stage",
      isRead: false
    },
    {
      id: "2",
      title: "Entry Point Congestion",
      message: "Increasing congestion at North Gate entry point",
      level: "medium",
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      location: "North Gate",
      isRead: false
    }
  ]);

  // Initialize cameras state
  const [cameras, setCameras] = useState<Camera[]>([
    {
      id: "CAM001",
      name: "Main Entrance",
      location: "North Gate",
      status: "online",
      riskLevel: "medium",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "CAM002",
      name: "Central Plaza",
      location: "Main Stage",
      status: "online",
      riskLevel: "high",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "CAM003",
      name: "East Wing",
      location: "Food Court",
      status: "online",
      riskLevel: "low",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "CAM004",
      name: "West Exit",
      location: "Emergency Exit",
      status: "offline",
      riskLevel: "low",
      lastUpdated: new Date().toISOString()
    }
  ]);

  // Initialize metrics state
  const [metrics, setMetrics] = useState({
    crowdDensity: 65,
    riskLevel: "medium" as AlertLevel,
    occupancy: 1850,
    maxCapacity: 2500,
    incidentCount: 2
  });

  // Add new alert
  const addAlert = (alert: Omit<Alert, 'id' | 'timestamp' | 'isRead'>) => {
    const newAlert: Alert = {
      ...alert,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    setAlerts(prev => [newAlert, ...prev]);
  };

  // Mark alert as read
  const markAlertAsRead = (id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, isRead: true } : alert
      )
    );
  };

  // Update camera
  const updateCamera = (id: string, data: Partial<Camera>) => {
    setCameras(prev => 
      prev.map(camera => 
        camera.id === id ? { ...camera, ...data, lastUpdated: new Date().toISOString() } : camera
      )
    );
  };

  // Simulate data changes for demo purposes
  useEffect(() => {
    // Update metrics randomly every 10 seconds
    const metricsInterval = setInterval(() => {
      const newDensity = Math.floor(Math.random() * 30) + 50; // 50-80
      const newRiskLevel: AlertLevel = 
        newDensity > 75 ? 'high' : 
        newDensity > 60 ? 'medium' : 'low';
      
      const newOccupancy = 1500 + Math.floor(Math.random() * 800);
      
      setMetrics(prev => ({
        ...prev,
        crowdDensity: newDensity,
        riskLevel: newRiskLevel,
        occupancy: newOccupancy
      }));

      // Occasionally create new alerts
      if (Math.random() > 0.7) {
        // 30% chance to create a new alert
        const alertTypes = [
          {
            title: "Increasing Density",
            message: "Crowd density increasing rapidly in Food Court area",
            level: "medium" as AlertLevel,
            location: "Food Court"
          },
          {
            title: "Potential Bottleneck",
            message: "Potential bottleneck forming at East Corridor",
            level: "medium" as AlertLevel,
            location: "East Corridor"
          },
          {
            title: "Movement Anomaly",
            message: "Unusual crowd movement pattern detected near South Entry",
            level: "low" as AlertLevel,
            location: "South Entry"
          }
        ];

        const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        addAlert(randomAlert);
      }

      // Randomly update camera risk levels
      const randomCameraIndex = Math.floor(Math.random() * cameras.length);
      const riskLevels: AlertLevel[] = ['low', 'medium', 'high', 'critical'];
      const randomRisk = riskLevels[Math.floor(Math.random() * 3)]; // Mostly low-high, rarely critical
      
      if (cameras[randomCameraIndex]) {
        updateCamera(cameras[randomCameraIndex].id, { riskLevel: randomRisk });
      }
    }, 10000);

    // Critical alert simulation - 10% chance every 30 seconds
    const criticalAlertInterval = setInterval(() => {
      if (Math.random() > 0.9) {
        addAlert({
          title: "CRITICAL: High Density Risk",
          message: "Dangerous crowd density levels detected. Immediate action required.",
          level: "critical",
          location: "Main Stage"
        });
        
        setMetrics(prev => ({
          ...prev,
          crowdDensity: 90,
          riskLevel: "critical",
          incidentCount: prev.incidentCount + 1
        }));
        
        // Update a camera to critical
        if (cameras.length > 0) {
          updateCamera(cameras[0].id, { riskLevel: "critical" });
        }
      }
    }, 30000);

    return () => {
      clearInterval(metricsInterval);
      clearInterval(criticalAlertInterval);
    };
  }, [cameras]);

  const value = {
    alerts,
    cameras,
    metrics,
    addAlert,
    markAlertAsRead,
    updateCamera
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Hook for using the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
