
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  status?: 'low' | 'medium' | 'high' | 'critical';
}

const StatusCard = ({ title, value, icon, description, status = 'low' }: StatusCardProps) => {
  // Determine background color based on status
  const getStatusColor = () => {
    switch (status) {
      case 'critical':
        return 'bg-alert-critical/10 border-alert-critical/30';
      case 'high':
        return 'bg-alert-high/10 border-alert-high/30';
      case 'medium':
        return 'bg-alert-medium/10 border-alert-medium/30';
      case 'low':
      default:
        return 'bg-alert-low/10 border-alert-low/30';
    }
  };

  // Determine text color based on status
  const getTextColor = () => {
    switch (status) {
      case 'critical':
        return 'text-alert-critical';
      case 'high':
        return 'text-alert-high';
      case 'medium':
        return 'text-alert-medium';
      case 'low':
      default:
        return 'text-alert-low';
    }
  };

  return (
    <Card className={`${getStatusColor()} border `}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`${getTextColor()} opacity-80`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
};

export default StatusCard;
