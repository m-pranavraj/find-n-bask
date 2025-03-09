
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Calendar, ChevronRight } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [foundItems, setFoundItems] = useState([]);
  const [claimedItems, setClaimedItems] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!user) return;
    
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Fetch found items posted by user
        const { data: foundItemsData } = await supabase
          .from('found_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        setFoundItems(foundItemsData || []);
        
        // Fetch claims made by user
        const { data: claimsData } = await supabase
          .from('item_claims')
          .select(`
            *,
            found_items (*)
          `)
          .eq('claimer_id', user.id)
          .order('created_at', { ascending: false });
        
        setClaimedItems(claimsData || []);
        
        // Fetch recent messages
        const { data: messagesData } = await supabase
          .from('item_messages')
          .select(`
            *,
            found_items!inner (item_name, id)
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(10);
        
        setMessages(messagesData || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-16">
        <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>
        
        <Tabs defaultValue="found" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="found">Found Items</TabsTrigger>
            <TabsTrigger value="claimed">Claimed Items</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="found" className="space-y-6">
            {foundItems.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">You haven't posted any found items yet.</p>
                  <Link to="/post-found-item">
                    <Button>Post a Found Item</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Your Posted Items</h2>
                  <Link to="/post-found-item">
                    <Button variant="outline">Post New Item</Button>
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {foundItems.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-0">
                        <div className="grid grid-cols-3 h-full">
                          <div className="col-span-1 h-full">
                            {item.images && item.images.length > 0 ? (
                              <img 
                                src={item.images[0]} 
                                alt={item.item_name} 
                                className="h-full w-full object-cover aspect-square"
                              />
                            ) : (
                              <div className="h-full w-full bg-muted flex items-center justify-center">
                                <p className="text-muted-foreground text-xs">No image</p>
                              </div>
                            )}
                          </div>
                          <div className="col-span-2 p-4 flex flex-col justify-between">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">{item.item_name}</h3>
                              <div className="flex items-center text-sm text-muted-foreground mb-2">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span className="truncate">{item.location}</span>
                              </div>
                              <div className="text-xs flex gap-2 mb-2">
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  {item.category}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full ${
                                  item.status === 'active' ? 'bg-green-100 text-green-800' : 
                                  item.status === 'claimed' ? 'bg-orange-100 text-orange-800' : 
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {item.status === 'active' ? 'Active' : 
                                   item.status === 'claimed' ? 'Claimed' : 
                                   item.status === 'completed' ? 'Completed' : 
                                   'Archived'}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                              <Link to={`/item-details/${item.id}`} className="text-primary text-sm flex items-center">
                                View Details
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="claimed" className="space-y-6">
            {claimedItems.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">You haven't claimed any items yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {claimedItems.map((claim) => (
                  <Card key={claim.id}>
                    <CardContent className="p-0">
                      <div className="grid grid-cols-3 h-full">
                        <div className="col-span-1 h-full">
                          {claim.found_items.images && claim.found_items.images.length > 0 ? (
                            <img 
                              src={claim.found_items.images[0]} 
                              alt={claim.found_items.item_name} 
                              className="h-full w-full object-cover aspect-square"
                            />
                          ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center">
                              <p className="text-muted-foreground text-xs">No image</p>
                            </div>
                          )}
                        </div>
                        <div className="col-span-2 p-4 flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{claim.found_items.item_name}</h3>
                            <div className="text-xs flex gap-2 mb-2">
                              <span className={`px-2 py-0.5 rounded-full ${
                                claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                claim.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                claim.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {claim.status === 'pending' ? 'Pending Approval' : 
                                 claim.status === 'approved' ? 'Approved' : 
                                 claim.status === 'rejected' ? 'Rejected' : 
                                 'Completed'}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <Link to={`/item-details/${claim.item_id}`} className="text-primary text-sm flex items-center">
                              View Details
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="messages" className="space-y-6">
            {messages.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">You don't have any messages yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <Card key={message.id}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm font-medium">
                        Re: {message.found_items.item_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p className="text-sm">{message.content}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                        <Link to={`/item-details/${message.found_items.id}`} className="text-primary text-xs flex items-center">
                          View Conversation
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
