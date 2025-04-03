import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";
import { AreaChart as AreaChartIcon, BarChart3, TrendingUp, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Analytics = () => {
  const [crowdData, setCrowdData] = useState([]);
  const [timeRange, setTimeRange] = useState("today");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8000/crowd_data");
        const data = await response.json();
        if (data.status === "success") {
          setCrowdData(data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Crowd Analytics</h1>
        <Select defaultValue={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {crowdData.map((entry, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{entry.location}</CardTitle>
              <CardDescription>Real-time crowd data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{entry.people_count} people</div>
              <p className="text-xs text-muted-foreground">
                Density: {entry.density_per_sqm.toFixed(2)} /sqm
              </p>
              <p className={`text-xs ${entry.risk_level === 'High' ? 'text-red-500' : 'text-green-500'}`}>
                {entry.risk_level} Risk Level
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="density" className="space-y-4">
        <TabsList>
          <TabsTrigger value="density" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Density Trends
          </TabsTrigger>
          <TabsTrigger value="occupancy" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Occupancy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="density" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Density Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={crowdData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="density_per_sqm" stroke="#8884d8" name="Density" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
