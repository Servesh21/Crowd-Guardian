
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface AlertBannerProps {
  title: string;
  message: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  time: string;
}

const AlertBanner = ({ title, message, level, time }: AlertBannerProps) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const getBgColor = () => {
    switch (level) {
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

  return (
    <Alert className={`${getBgColor()} text-white mb-4`}>
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <div className="flex-grow">
          <AlertTitle className="text-white">{title}</AlertTitle>
          <AlertDescription className="text-white/90">
            {message} - {time}
          </AlertDescription>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setVisible(false)}
          className="text-white hover:text-white/70 hover:bg-white/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
};

export default AlertBanner;
