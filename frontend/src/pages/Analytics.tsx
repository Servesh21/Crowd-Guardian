
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";
import { AreaChart as AreaChartIcon, BarChart3, TrendingUp, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Sample data for the analytics charts
const hourlyData = [
  { time: '6AM', density: 25, occupancy: 500 },
  { time: '7AM', density: 30, occupancy: 750 },
  { time: '8AM', density: 40, occupancy: 1000 },
  { time: '9AM', density: 55, occupancy: 1250 },
  { time: '10AM', density: 70, occupancy: 1650 },
  { time: '11AM', density: 60, occupancy: 1500 },
  { time: '12PM', density: 75, occupancy: 1850 },
  { time: '1PM', density: 80, occupancy: 2000 },
  { time: '2PM', density: 65, occupancy: 1600 },
  { time: '3PM', density: 50, occupancy: 1300 },
  { time: '4PM', density: 45, occupancy: 1100 },
  { time: '5PM', density: 55, occupancy: 1400 },
];

const weeklyData = [
  { day: 'Mon', incidents: 2, avgDensity: 45 },
  { day: 'Tue', incidents: 1, avgDensity: 40 },
  { day: 'Wed', incidents: 3, avgDensity: 55 },
  { day: 'Thu', incidents: 0, avgDensity: 35 },
  { day: 'Fri', incidents: 5, avgDensity: 75 },
  { day: 'Sat', incidents: 8, avgDensity: 85 },
  { day: 'Sun', incidents: 4, avgDensity: 60 },
];

// Area distribution data
const areaData = [
  { name: 'Main Entrance', density: 65, capacity: 80 },
  { name: 'Central Plaza', density: 85, capacity: 90 },
  { name: 'Food Court', density: 45, capacity: 60 },
  { name: 'East Wing', density: 30, capacity: 50 },
  { name: 'West Exit', density: 25, capacity: 40 },
];

const Analytics = () => {
  const { metrics } = useData();
  const [timeRange, setTimeRange] = useState("today");

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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Density</CardTitle>
            <CardDescription>Average crowd density</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.crowdDensity}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.crowdDensity > 60 ? 
                "⚠️ Above safe threshold" : 
                "✅ Within safe limits"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Occupancy</CardTitle>
            <CardDescription>People in the venue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.occupancy}/{metrics.maxCapacity}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((metrics.occupancy / metrics.maxCapacity) * 100)}% of capacity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Peak Time</CardTitle>
            <CardDescription>Highest crowd density</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1:00 PM</div>
            <p className="text-xs text-muted-foreground">85% density recorded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Incidents</CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.incidentCount}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.incidentCount > 0 ? 
                `Last incident: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 
                "No incidents recorded"}
            </p>
          </CardContent>
        </Card>
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
          <TabsTrigger value="areas" className="flex items-center">
            <AreaChartIcon className="h-4 w-4 mr-2" />
            Areas
          </TabsTrigger>
          <TabsTrigger value="incidents" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Incidents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="density" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crowd Density Over Time</CardTitle>
              <CardDescription>Hourly crowd density percentage</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="density" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Crowd Density (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Levels</CardTitle>
              <CardDescription>Number of people over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="occupancy" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                    name="Total Occupancy"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="areas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Area Distribution</CardTitle>
              <CardDescription>Crowd density by location</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={areaData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="density" fill="#8884d8" name="Current Density (%)" />
                  <Bar dataKey="capacity" fill="#82ca9d" name="Capacity Limit (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incident Analysis</CardTitle>
              <CardDescription>Daily incidents and average density correlation</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="incidents" fill="#ff8042" name="Incidents" />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="avgDensity" 
                    stroke="#8884d8" 
                    name="Avg. Density (%)" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
