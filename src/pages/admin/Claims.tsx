
import AdminLayout from "@/components/layout/AdminLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Loader2 } from "lucide-react";

interface ClaimerInfo {
  full_name: string;
  email: string;
}

interface ItemInfo {
  item_name: string;
  category: string;
}

interface Claim {
  id: string;
  item_id: string;
  claimer_id: string;
  owner_description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  claimer?: ClaimerInfo;
  item?: ItemInfo;
}

const Claims = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [claimStatus, setClaimStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  
  useEffect(() => {
    fetchClaims();
  }, [claimStatus]);
  
  const fetchClaims = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('item_claims')
        .select(`
          *,
          claimer:profiles!item_claims_claimer_id_fkey(full_name, email),
          item:found_items!item_claims_item_id_fkey(item_name, category)
        `)
        .eq('status', claimStatus)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        // Convert and ensure types match the Claim interface
        const typedClaims = data.map(claim => ({
          ...claim,
          status: claim.status as 'pending' | 'approved' | 'rejected',
          claimer: claim.claimer as ClaimerInfo,
          item: claim.item as ItemInfo
        }));
        
        setClaims(typedClaims);
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast.error('Failed to load claims');
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewClaim = (claim: Claim) => {
    setSelectedClaim(claim);
    setViewDialogOpen(true);
  };
  
  const updateClaimStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('item_claims')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success(`Claim ${status}`);
      setViewDialogOpen(false);
      fetchClaims();
    } catch (error) {
      console.error('Error updating claim:', error);
      toast.error('Failed to update claim status');
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <AdminLayout title="Item Claims">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Item Claims</h2>
          <p className="text-muted-foreground mt-1">
            Manage and review claims made by users for found items
          </p>
        </div>
        
        <Tabs defaultValue="pending" onValueChange={(value) => setClaimStatus(value as 'pending' | 'approved' | 'rejected')}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <TabsContent value={claimStatus} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{claimStatus.charAt(0).toUpperCase() + claimStatus.slice(1)} Claims</CardTitle>
                <CardDescription>
                  {claimStatus === 'pending' 
                    ? 'Claims awaiting review' 
                    : claimStatus === 'approved' 
                      ? 'Claims that have been approved'
                      : 'Claims that have been rejected'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : claims.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No {claimStatus} claims found</p>
                  </div>
                ) : (
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Claimer</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {claims.map((claim) => (
                          <TableRow key={claim.id}>
                            <TableCell>{claim.item?.item_name || 'Unknown item'}</TableCell>
                            <TableCell>{claim.claimer?.full_name || 'Unknown user'}</TableCell>
                            <TableCell>{formatDate(claim.created_at)}</TableCell>
                            <TableCell>{getStatusBadge(claim.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleViewClaim(claim)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* View Claim Dialog */}
        {selectedClaim && (
          <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Claim Details</DialogTitle>
                <DialogDescription>
                  Review the claim information and update status if needed
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <div className="font-medium">Item:</div>
                  <div>{selectedClaim.item?.item_name || 'Unknown item'}</div>
                  
                  <div className="font-medium">Category:</div>
                  <div>{selectedClaim.item?.category || 'N/A'}</div>
                  
                  <div className="font-medium">Claimer:</div>
                  <div>{selectedClaim.claimer?.full_name || 'Unknown user'}</div>
                  
                  <div className="font-medium">Email:</div>
                  <div>{selectedClaim.claimer?.email || 'N/A'}</div>
                  
                  <div className="font-medium">Submitted:</div>
                  <div>{formatDate(selectedClaim.created_at)}</div>
                  
                  <div className="font-medium">Status:</div>
                  <div>{getStatusBadge(selectedClaim.status)}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="font-medium">Owner Description:</div>
                  <div className="p-3 bg-muted rounded-md whitespace-pre-wrap">
                    {selectedClaim.owner_description || 'No description provided'}
                  </div>
                </div>
                
                {selectedClaim.status === 'pending' && (
                  <div className="space-y-2 mt-4">
                    <div className="font-medium">Update Status:</div>
                    <div className="flex gap-4 flex-wrap">
                      <Button 
                        variant="default" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => updateClaimStatus(selectedClaim.id, 'approved')}
                      >
                        Approve Claim
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => updateClaimStatus(selectedClaim.id, 'rejected')}
                      >
                        Reject Claim
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setViewDialogOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
};

export default Claims;
