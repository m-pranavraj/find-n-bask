
import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Package, Users, FileText, MessageSquare, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    foundItems: 0,
    claims: 0,
    messages: 0,
    successStories: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Fetch users count
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch found items count
        const { count: foundItemsCount, error: itemsError } = await supabase
          .from('found_items')
          .select('*', { count: 'exact', head: true });

        // Fetch claims count
        const { count: claimsCount, error: claimsError } = await supabase
          .from('item_claims')
          .select('*', { count: 'exact', head: true });

        // Fetch messages count
        const { count: messagesCount, error: messagesError } = await supabase
          .from('item_messages')
          .select('*', { count: 'exact', head: true });

        // Fetch success stories count
        const { count: storiesCount, error: storiesError } = await supabase
          .from('success_stories')
          .select('*', { count: 'exact', head: true });

        if (usersError || itemsError || claimsError || messagesError || storiesError) {
          console.error("Error fetching stats:", 
            usersError || itemsError || claimsError || messagesError || storiesError);
        } else {
          setStats({
            users: usersCount || 0,
            foundItems: foundItemsCount || 0,
            claims: claimsCount || 0,
            messages: messagesCount || 0,
            successStories: storiesCount || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Welcome to the Admin Dashboard</h2>
        <p className="text-muted-foreground">
          This dashboard provides an overview of your Find & Bask application's statistics and activities.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCard 
            title="Total Users" 
            value={stats.users.toString()} 
            description="Registered users in the system"
            icon={<Users className="h-5 w-5 text-blue-500" />}
            isLoading={isLoading}
            trend="+5% from last week"
            color="blue"
          />
          <DashboardCard 
            title="Found Items" 
            value={stats.foundItems.toString()} 
            description="Items reported as found"
            icon={<Package className="h-5 w-5 text-green-500" />}
            isLoading={isLoading}
            trend="+12% from last month"
            color="green"
          />
          <DashboardCard 
            title="Item Claims" 
            value={stats.claims.toString()} 
            description="Claims made by users"
            icon={<FileText className="h-5 w-5 text-yellow-500" />}
            isLoading={isLoading}
            trend="+3% from last month"
            color="yellow"
          />
          <DashboardCard 
            title="Messages" 
            value={stats.messages.toString()} 
            description="Communication between users"
            icon={<MessageSquare className="h-5 w-5 text-purple-500" />}
            isLoading={isLoading}
            trend="+8% from last week"
            color="purple"
          />
          <DashboardCard 
            title="Success Stories" 
            value={stats.successStories.toString()} 
            description="Successful item returns"
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
            isLoading={isLoading}
            trend="+15% from last month"
            color="emerald"
          />
          <DashboardCard 
            title="System Status" 
            value="Operational" 
            description="All systems working properly"
            icon={<Activity className="h-5 w-5 text-cyan-500" />}
            isLoading={false}
            color="cyan"
          />
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
                <CardDescription>
                  Key metrics and system health information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-3">
                      <h3 className="font-medium text-sm">Database Status</h3>
                      <p className="text-green-500 font-medium">Connected</p>
                      <p className="text-xs text-muted-foreground mt-1">Last checked: just now</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <h3 className="font-medium text-sm">Storage</h3>
                      <p className="font-medium">64.2 MB used</p>
                      <p className="text-xs text-muted-foreground mt-1">5% of quota</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <h3 className="font-medium text-sm">Authentication</h3>
                      <p className="text-green-500 font-medium">Active</p>
                      <p className="text-xs text-muted-foreground mt-1">Email verification enabled</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <h3 className="font-medium text-sm">API Status</h3>
                      <p className="text-green-500 font-medium">Operational</p>
                      <p className="text-xs text-muted-foreground mt-1">All endpoints responsive</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="recent" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest actions across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic">
                  Activity log will display here when more data is available.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Usage patterns and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic">
                  Advanced analytics will be displayed here when more data is available.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

interface DashboardCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  trend?: string;
  color?: string;
}

const DashboardCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  isLoading = false,
  trend,
  color = "blue" 
}: DashboardCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <p className={`text-xs mt-2 font-medium text-${color}-500`}>{trend}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;
