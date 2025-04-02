
import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { deleteFoundItem } from "@/components/admin/database/DatabaseService";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Download, 
  Eye, 
  Image, 
  Package, 
  Search, 
  SlidersHorizontal, 
  Trash2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Items = () => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is authenticated
    const adminAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
    if (!adminAuthenticated) {
      toast.error("Admin authentication required");
      navigate("/admin/login");
      return;
    }
    
    fetchItems();
  }, [navigate]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('found_items')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log("Fetched items:", data);
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to fetch items");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (item.item_name && item.item_name.toLowerCase().includes(searchLower)) ||
      (item.category && item.category.toLowerCase().includes(searchLower)) ||
      (item.location && item.location.toLowerCase().includes(searchLower)) ||
      (item.description && item.description.toLowerCase().includes(searchLower))
    );
  });

  const handleViewItem = (item: any) => {
    setSelectedItem(item);
    setViewDialogOpen(true);
  };

  const handleDeletePrompt = (itemId: string) => {
    setItemToDelete(itemId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    setDeleteDialogOpen(false);
    setViewDialogOpen(false);
    
    const success = await deleteFoundItem(itemToDelete);
    
    if (success) {
      // Remove the item from the local state to update UI immediately
      setItems(prevItems => prevItems.filter(item => item.id !== itemToDelete));
      setItemToDelete(null);
      setSelectedItem(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'claimed':
        return <Badge className="bg-blue-500">Claimed</Badge>;
      case 'completed':
        return <Badge className="bg-purple-500">Completed</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exportItems = () => {
    const exportData = items.map(item => ({
      ID: item.id,
      ItemName: item.item_name || 'N/A',
      Category: item.category || 'N/A',
      Location: item.location || 'N/A',
      PostedBy: item.profiles?.full_name || 'Unknown',
      Status: item.status || 'Unknown',
      PostedDate: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : 'N/A'
    }));

    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      "ID,ItemName,Category,Location,PostedBy,Status,PostedDate\n" +
      exportData.map(row => 
        Object.values(row).map(val => `"${val}"`).join(',')
      ).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "find-bask-items.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Items data exported successfully");
  };

  return (
    <AdminLayout title="Items Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Found Items</h2>
            <p className="text-muted-foreground mt-1">
              View and manage all items reported as found
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportItems} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={fetchItems} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Items Directory</CardTitle>
            <CardDescription>
              Total: {items.length} found items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Posted By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Posted Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                          <p className="mt-2 text-sm text-muted-foreground">Loading items...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-muted-foreground">No items found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <Package className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{item.item_name}</p>
                              <p className="text-xs text-muted-foreground">ID: {item.id.substring(0, 8)}...</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.profiles?.full_name || "Unknown"}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>{formatDate(item.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewItem(item)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive"
                              onClick={() => handleDeletePrompt(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Item Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Item Details</DialogTitle>
              <DialogDescription>
                Comprehensive information about the selected item
              </DialogDescription>
            </DialogHeader>
            
            {selectedItem && (
              <div className="space-y-4 mt-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedItem.item_name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedItem.category}</p>
                  </div>
                  {getStatusBadge(selectedItem.status)}
                </div>
                
                {selectedItem.images && selectedItem.images.length > 0 ? (
                  <div className="mt-4">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {selectedItem.images.map((image: string, index: number) => (
                          <CarouselItem key={index}>
                            <div className="p-1">
                              <div className="overflow-hidden rounded-lg">
                                <img 
                                  src={image} 
                                  alt={`Item image ${index + 1}`} 
                                  className="w-full h-56 object-cover"
                                />
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 bg-muted rounded-lg">
                    <Image className="h-10 w-10 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground mt-2">No images available</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Location Found</p>
                    <p className="text-sm text-muted-foreground">{selectedItem.location}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Date Posted</p>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedItem.created_at)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Posted By</p>
                    <p className="text-sm text-muted-foreground">{selectedItem.profiles?.full_name || "Unknown"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Contact Preference</p>
                    <p className="text-sm text-muted-foreground">{selectedItem.contact_preference}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {selectedItem.description}
                  </p>
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                    Close
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleDeletePrompt(selectedItem.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> 
                    Delete Item
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the item and all associated images from storage.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteItem}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default Items;
