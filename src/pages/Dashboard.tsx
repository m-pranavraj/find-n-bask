
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();

  const { data: foundItems, isLoading: itemsLoading, error: itemsError } = useQuery({
    queryKey: ["foundItems", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("found_items")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: successStories, isLoading: storiesLoading, error: storiesError } = useQuery({
    queryKey: ["successStories", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("success_stories")
        .select("*")
        .eq("finder_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: queries, isLoading: queriesLoading, error: queriesError } = useQuery({
    queryKey: ["lostQueries", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lost_item_queries")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const isLoading = itemsLoading || storiesLoading || queriesLoading;
  const hasError = itemsError || storiesError || queriesError;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        {hasError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              An error occurred loading your dashboard data. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center my-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="found" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="found">Found Items ({foundItems?.length || 0})</TabsTrigger>
              <TabsTrigger value="lost">Lost Queries ({queries?.length || 0})</TabsTrigger>
              <TabsTrigger value="success">Success Stories ({successStories?.length || 0})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="found" className="space-y-4">
              {foundItems?.length === 0 ? (
                <EmptyState 
                  title="No found items yet"
                  description="You haven't reported any found items yet. Help return lost items to their owners."
                  actionLabel="Report a found item"
                  actionLink="/post-found-item"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {foundItems?.map((item) => (
                    <Card key={item.id}>
                      <CardHeader>
                        <CardTitle className="truncate">{item.item_name}</CardTitle>
                        <CardDescription>Found at {item.location}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {item.description}
                        </p>
                        <Button asChild size="sm">
                          <Link to={`/item-details/${item.id}`}>View Details</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="lost" className="space-y-4">
              {queries?.length === 0 ? (
                <EmptyState 
                  title="No lost item queries"
                  description="You haven't created any searches for lost items yet."
                  actionLabel="Search for lost items"
                  actionLink="/search-lost-items"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {queries?.map((query) => (
                    <Card key={query.id}>
                      <CardHeader>
                        <CardTitle>Lost Item Query</CardTitle>
                        <CardDescription>Location: {query.location || "Not specified"}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {query.query_text}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            {new Date(query.created_at).toLocaleDateString()}
                          </span>
                          <Button asChild size="sm" variant="outline">
                            <Link to="/search-lost-items">Search Again</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="success" className="space-y-4">
              {successStories?.length === 0 ? (
                <EmptyState 
                  title="No success stories yet"
                  description="You haven't reunited any items with their owners yet. Keep helping!"
                  actionLabel="Report a found item"
                  actionLink="/post-found-item"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {successStories?.map((story) => (
                    <Card key={story.id}>
                      <CardHeader>
                        <CardTitle>{story.title}</CardTitle>
                        <CardDescription>
                          {story.is_verified ? "Verified Success Story" : "Waiting Verification"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {story.description}
                        </p>
                        <Button asChild size="sm">
                          <Link to={`/success-stories`}>View All Stories</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
};

const EmptyState = ({ title, description, actionLabel, actionLink }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 bg-muted/50 rounded-lg">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 text-center max-w-md">{description}</p>
      <Button asChild>
        <Link to={actionLink}>{actionLabel}</Link>
      </Button>
    </div>
  );
};

export default Dashboard;
