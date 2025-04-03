
import { useState, useEffect } from "react";
import { Video, VideoOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface CameraFeedProps {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  imgSrc?: string;
}

const CameraFeed = ({
  id,
  name,
  location,
  status,
  riskLevel,
  imgSrc
}: CameraFeedProps) => {
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(status === 'online');
  
  const getRiskColor = () => {
    switch (riskLevel) {
      case 'critical':
        return 'border-alert-critical bg-alert-critical/10';
      case 'high':
        return 'border-alert-high bg-alert-high/10';
      case 'medium':
        return 'border-alert-medium bg-alert-medium/10';
      case 'low':
      default:
        return 'border-alert-low bg-alert-low/10';
    }
  };

  const getRiskBadgeColor = () => {
    switch (riskLevel) {
      case 'critical':
        return 'bg-alert-critical animate-pulse-alert';
      case 'high':
        return 'bg-alert-high';
      case 'medium':
        return 'bg-alert-medium';
      case 'low':
      default:
        return 'bg-alert-low';
    }
  };

  const handleStreamToggle = () => {
    if (isActive) {
      setIsActive(false);
      toast({
        title: "Stream Paused",
        description: `Camera feed ${name} has been paused`,
      });
    } else {
      setIsActive(true);
      toast({
        title: "Stream Resumed",
        description: `Camera feed ${name} is now active`,
      });
    }
  };

  // For demo purposes - fake timestamps
  const [timestamp, setTimestamp] = useState(new Date().toLocaleTimeString());
  
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setTimestamp(new Date().toLocaleTimeString());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  return (
    <Card className={`border-2 ${getRiskColor()}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {name}
            <Badge variant="outline" className="ml-2 text-xs">
              {location}
            </Badge>
          </CardTitle>
          <Badge className={`${getRiskBadgeColor()} text-white`}>
            {riskLevel.toUpperCase()} RISK
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <div className="relative bg-black rounded-md overflow-hidden">
          {isActive ? (
            <>
              <div className="aspect-video bg-black flex items-center justify-center">
                {imgSrc ? (
                  <img 
                    src={imgSrc} 
                    alt={`Camera feed from ${location}`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="animate-pulse">
                      <Video className="h-16 w-16 text-gray-500" />
                    </div>
                    <p className="text-gray-400 mt-2">Simulated video feed</p>
                  </div>
                )}
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                <span className="text-xs bg-black/70 text-white px-2 py-1 rounded">
                  ID: {id}
                </span>
                <span className="text-xs bg-black/70 text-white px-2 py-1 rounded">
                  {timestamp}
                </span>
              </div>
            </>
          ) : (
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <div className="flex flex-col items-center justify-center">
                <VideoOff className="h-16 w-16 text-gray-500" />
                <p className="text-gray-400 mt-2">Feed paused</p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-2 flex justify-between items-center">
          <div className="flex items-center">
            <span className={`inline-block h-2 w-2 rounded-full mr-2 ${isActive ? 'bg-alert-low' : 'bg-gray-400'}`}></span>
            <span className="text-xs">{isActive ? 'Online' : 'Paused'}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleStreamToggle}>
            {isActive ? 'Pause' : 'Resume'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraFeed;
