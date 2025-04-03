import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Bell, Shield, Volume2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const Settings = () => {
  const { toast } = useToast();
  const [systemSettings, setSystemSettings] = useState({
    enableCriticalAlerts: true,
    enableHighAlerts: true,
    enableMediumAlerts: true,
    enableLowAlerts: false,
    audioAlerts: true,
    pushNotifications: true,
    emailAlerts: false,
    autoRefreshInterval: 10,
    densityThresholdCritical: 80,
    densityThresholdHigh: 65,
    densityThresholdMedium: 50
  });

  const handleSettingChange = (setting: string, value: boolean | number) => {
    setSystemSettings({
      ...systemSettings,
      [setting]: value
    });
    
    toast({
      title: "Setting Updated",
      description: `${setting} has been updated successfully.`
    });
  };

  const handleSaveSettings = () => {
    // This would typically save to a backend
    toast({
      title: "Settings Saved",
      description: "All settings have been saved successfully.",
    });
  };

  const handleResetSettings = () => {
    setSystemSettings({
      enableCriticalAlerts: true,
      enableHighAlerts: true,
      enableMediumAlerts: true,
      enableLowAlerts: false,
      audioAlerts: true,
      pushNotifications: true,
      emailAlerts: false,
      autoRefreshInterval: 10,
      densityThresholdCritical: 80,
      densityThresholdHigh: 65,
      densityThresholdMedium: 50
    });

    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">System Settings</h1>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Alert Settings
          </TabsTrigger>
          <TabsTrigger value="thresholds" className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alert Thresholds
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Volume2 className="h-4 w-4 mr-2" />
            Notification Settings
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Security Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alert Configuration</CardTitle>
              <CardDescription>Configure which alerts are enabled in the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="critical-alerts">Critical Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Dangerous crowd density levels requiring immediate action
                    </p>
                  </div>
                  <Switch
                    id="critical-alerts"
                    checked={systemSettings.enableCriticalAlerts}
                    onCheckedChange={(checked) => handleSettingChange('enableCriticalAlerts', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="high-alerts">High Risk Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Significant crowd density requiring monitoring
                    </p>
                  </div>
                  <Switch
                    id="high-alerts"
                    checked={systemSettings.enableHighAlerts}
                    onCheckedChange={(checked) => handleSettingChange('enableHighAlerts', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="medium-alerts">Medium Risk Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Moderate crowd density situations
                    </p>
                  </div>
                  <Switch
                    id="medium-alerts"
                    checked={systemSettings.enableMediumAlerts}
                    onCheckedChange={(checked) => handleSettingChange('enableMediumAlerts', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="low-alerts">Low Risk Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Minor changes in crowd density
                    </p>
                  </div>
                  <Switch
                    id="low-alerts"
                    checked={systemSettings.enableLowAlerts}
                    onCheckedChange={(checked) => handleSettingChange('enableLowAlerts', checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleResetSettings}>Reset to Defaults</Button>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="thresholds">
          <Card>
            <CardHeader>
              <CardTitle>Alert Thresholds</CardTitle>
              <CardDescription>Configure density thresholds for different alert levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-alert-critical/10 border-alert-critical">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Changing these thresholds may affect the system's ability to detect potential crowd incidents. 
                  Proceed with caution.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="critical-threshold">Critical Density Threshold (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="critical-threshold"
                      type="number"
                      value={systemSettings.densityThresholdCritical}
                      onChange={(e) => handleSettingChange('densityThresholdCritical', parseInt(e.target.value))}
                      min={0}
                      max={100}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Crowds above this density are considered at critical risk for incidents
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="high-threshold">High Density Threshold (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="high-threshold"
                      type="number"
                      value={systemSettings.densityThresholdHigh}
                      onChange={(e) => handleSettingChange('densityThresholdHigh', parseInt(e.target.value))}
                      min={0}
                      max={100}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Crowds above this density are considered at high risk
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="medium-threshold">Medium Density Threshold (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="medium-threshold"
                      type="number"
                      value={systemSettings.densityThresholdMedium}
                      onChange={(e) => handleSettingChange('densityThresholdMedium', parseInt(e.target.value))}
                      min={0}
                      max={100}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Crowds above this density are considered at medium risk
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleResetSettings}>Reset to Defaults</Button>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="audio-alerts" 
                    checked={systemSettings.audioAlerts}
                    onCheckedChange={(checked) => 
                      handleSettingChange('audioAlerts', checked === true)
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="audio-alerts">Audio Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Play sound alerts for critical and high risk events
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="push-notifications" 
                    checked={systemSettings.pushNotifications}
                    onCheckedChange={(checked) => 
                      handleSettingChange('pushNotifications', checked === true)
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive browser notifications for alerts
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="email-alerts" 
                    checked={systemSettings.emailAlerts}
                    onCheckedChange={(checked) => 
                      handleSettingChange('emailAlerts', checked === true)
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="email-alerts">Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for critical incidents
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="refresh-interval">Auto-Refresh Interval (seconds)</Label>
                  <Input
                    id="refresh-interval"
                    type="number"
                    value={systemSettings.autoRefreshInterval}
                    onChange={(e) => handleSettingChange('autoRefreshInterval', parseInt(e.target.value))}
                    min={1}
                    max={60}
                  />
                  <p className="text-xs text-muted-foreground">
                    How often the dashboard should automatically refresh data
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleResetSettings}>Reset to Defaults</Button>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage access and permission settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Current Access Level</h3>
                <div className="flex items-center gap-2">
                  <Badge>Administrator</Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Additional Security Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require 2FA for all admin logins
                      </p>
                    </div>
                    <Switch id="two-factor" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="session-timeout">Automatic Session Timeout</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically log out after 30 minutes of inactivity
                      </p>
                    </div>
                    <Switch id="session-timeout" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="activity-log">Activity Logging</Label>
                      <p className="text-sm text-muted-foreground">
                        Log all user actions in the system
                      </p>
                    </div>
                    <Switch id="activity-log" defaultChecked />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">API Access Keys</h3>
                <p className="text-sm text-muted-foreground">
                  For external integrations and services
                </p>
                
                <div className="p-3 bg-muted rounded-md font-mono text-sm">
                  api_key_•••••••••••••••••••••
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Copy Key</Button>
                  <Button variant="outline" size="sm">Regenerate</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="destructive">Revoke All Sessions</Button>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
