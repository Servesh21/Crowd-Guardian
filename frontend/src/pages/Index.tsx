import { useState, useEffect } from "react";
 import { Megaphone } from "lucide-react";
import { toast } from "@/components/ui/toast";
import {
  Users,
  AlertTriangle,
  Bell,
  MapPin,
  ArrowRight,
  BarChart4,

} from "lucide-react";
import StatusCard from "@/components/StatusCard";
import AlertBanner from "@/components/AlertBanner";
import CameraFeed from "@/components/CameraFeed";
import CrowdDensityMap from "@/components/CrowdDensityMap";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

// Supabase init
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const formatDate = (date: Date) => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [crowdData, setCrowdData] = useState<any>({});

  // Fetch camera data from backend

  // Fetch latest crowd data from Supabase
  useEffect(() => {
    const fetchCrowdData = async () => {
      try {
        const { data, error } = await supabase
          .from("crowd_data")
          .select("*")
          .order("timestamp", { ascending: false })
          .limit(1);
        if (error) throw error;
        if (data.length > 0) {
          setCrowdData(data[0]);
        }
      } catch (error) {
        console.error("Error fetching crowd data:", error);
      }
    };

    fetchCrowdData();
  }, []);

  const isValidAlertLevel = (level: string): level is "low" | "medium" | "high" | "critical" =>
    ["low", "medium", "high", "critical"].includes(level);



  useEffect(() => {
    const criticalOrHigh = alerts.filter(
      (alert) => (alert.level === "critical" || alert.level === "high") && !alert.isRead
    );

    if (criticalOrHigh.length > 0) {
      const mostRecent = criticalOrHigh[0];
      setCurrentAlert({
        title: mostRecent.title,
        message: mostRecent.message,
        level: mostRecent.level,
        time: formatDate(new Date(mostRecent.timestamp)),
      });

      if (mostRecent.level === "critical") {
        toast({
          title: "CRITICAL ALERT",
          description: mostRecent.message,
          variant: "destructive",
        });
      }
    } else {
      setCurrentAlert(null);
    }
  }, [alerts]);

  const occupancyPercentage = Math.round(
    ((crowdData.occupancy || 0) / (crowdData.maxCapacity || 100)) * 100
  );

  const handleEmergencyBroadcast = () => {
  // Show Toast Notification
  toast({
    title: "Broadcasting System",
    description: "Emergency message broadcast initiated",
  });

  // Speech Synthesis
  if ("speechSynthesis" in window) {
    const message = new SpeechSynthesisUtterance("सभी नागरिकों को सूचित किया जाता है कि यह एक आपातकालीन स्थिति है। कृपया संयम बनाए रखें और आधिकारिक निर्देशों का पालन करें। सुरक्षा प्रोटोकॉल का पालन करते हुए निकटतम सुरक्षित स्थान पर पहुँचें। किसी भी अफवाह पर ध्यान न दें और आवश्यक सहायता के लिए संबंधित अधिकारियों से संपर्क करें।");

    // Optional: Adjust Voice Settings
    message.lang = "hi-IN"; // Set English language
    message.rate = 1; // Normal speed
    message.pitch = 1.2; // Normal pitch
    message.volume = 1; // Max volume

    // Chrome Fix: Stop previous speech before speaking
    window.speechSynthesis.cancel();

    // Speak the message
    window.speechSynthesis.speak(message);
  } else {
    console.error("Speech Synthesis not supported in this browser.");
  }
};

// // Inside your emergency button
// <button onClick={handleEmergencyBroadcast} className="bg-red-500 text-white p-2 rounded">
//   Emergency Broadcast
// </button>


  const quickActions = [
    {
      title: "Monitor Cameras",
      description: "View all camera feeds",
      icon: <Bell className="h-5 w-5" />,
      action: () => navigate("/monitoring"),
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      title: "View Analytics",
      description: "Check crowd patterns",
      icon: <BarChart4 className="h-5 w-5" />,
      action: () => navigate("/analytics"),
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      title: "Emergency Broadcast",
      description: "Send public announcements",
      icon: <Megaphone className="h-5 w-5" />,
      action: () => {
        handleEmergencyBroadcast();
        toast({
          title: "Broadcasting System",
          description: "Emergency message broadcast initiated",
        });
      },
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <span>Crowd Guardian Dashboard</span>
        </h1>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-background/50">
            System Status: Active
          </Badge>
          <Button
            size="sm"
            variant="outline"
            className="gap-1 group"
            onClick={() => navigate("/alerts")}
          >
            View All Alerts
            <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      {currentAlert && (
        <AlertBanner
          title={currentAlert.title}
          message={currentAlert.message}
          level={
            isValidAlertLevel(currentAlert.level) ? currentAlert.level : "low"
          }
          time={currentAlert.time}
        />
      )}

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-muted-foreground/20 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50 dark:bg-gray-900/50 pb-1">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-alert-high" />
              Crowd Management Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatusCard
                title="Current Crowd Density"
                value={`${crowdData.density_per_sqm || 0}`}
                description="Per Square Meter"
                status={crowdData.riskLevel as "low" | "medium" | "high" | "critical"}
                icon={<Users className="h-4 w-4" />}
              />

              <StatusCard
                title="Risk Level"
                value={crowdData.risk_level?.toUpperCase()}
                description="Based on crowd density and movement"
                status={crowdData.riskLevel as "low" | "medium" | "high" | "critical"}
                icon={<AlertTriangle className="h-4 w-4" />}
              />

              <div
                className="relative"
                onMouseEnter={() => setHoveredCard("occupancy")}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <StatusCard
                  title="Current Occupancy"
                  value={`${crowdData.occupancy || 0}`}

                  status={
                    occupancyPercentage > 90
                      ? "critical"
                      : occupancyPercentage > 75
                      ? "high"
                      : occupancyPercentage > 50
                      ? "medium"
                      : "low"
                  }
                  icon={<Users className="h-4 w-4" />}
                />
                {hoveredCard === "occupancy" && (
                  <div className="absolute -bottom-2 left-0 right-0 px-6 pb-4 transition-all">
                    <Progress
                      value={occupancyPercentage}
                      className={`h-2 ${
                        occupancyPercentage > 90
                          ? "bg-alert-critical/20"
                          : occupancyPercentage > 75
                          ? "bg-alert-high/20"
                          : occupancyPercentage > 50
                          ? "bg-alert-medium/20"
                          : "bg-alert-low/20"
                      }`}
                    />
                  </div>
                )}
              </div>

              <StatusCard
                title="Recent Incidents"
                value={crowdData.incidentCount || 0}
                description="In the last 24 hours"
                status={
                  (crowdData.incidentCount || 0) > 5
                    ? "critical"
                    : (crowdData.incidentCount || 0) > 3
                    ? "high"
                    : (crowdData.incidentCount || 0) > 1
                    ? "medium"
                    : "low"
                }
                icon={<Bell className="h-4 w-4" />}
              />
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    onClick={action.action}
                    className={`${action.color} p-4 rounded-lg cursor-pointer hover:bg-opacity-20 flex items-center gap-3 transition-all hover:scale-[1.02]`}
                  >
                    <div className="p-2 bg-background rounded-full">{action.icon}</div>
                    <div>
                      <h3 className="font-medium text-sm">{action.title}</h3>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
        <CrowdDensityMap />

        <div className="col-span-1 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {/*<span>Active Camera Feeds</span>*/}
          </h2>

          <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2">
            {cameras.map((camera) => (
              <CameraFeed
                key={camera.id}
                id={camera.id}
                name={camera.name}
                location={camera.location}
                status={camera.status}
                riskLevel={camera.riskLevel}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4 mt-6">
        <h3 className="text-sm text-muted-foreground">
          Crowd Guardian Alert System • Last updated: {new Date().toLocaleTimeString()}
        </h3>
      </div>
    </div>
  );
};

export default Index;