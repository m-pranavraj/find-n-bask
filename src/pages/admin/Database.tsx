
import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Database as DatabaseIcon,
  Download,
  Edit,
  Eye,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

// Define valid table names as a type for type safety
type TableName = "profiles" | "found_items" | "item_claims" | "item_messages" | "lost_item_queries" | "success_stories";

const Database = () => {
  const [tables, setTables] = useState<TableName[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableName | "">("");
  const [tableData, setTableData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editRow, setEditRow] = useState<any>(null);
  const [newRow, setNewRow] = useState<any>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [viewRow, setViewRow] = useState<any>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
    }
  }, [selectedTable]);

  const fetchTables = async () => {
    setIsLoading(true);
    try {
      // Define default tables to use if RPC fails
      const defaultTables: TableName[] = ['profiles', 'found_items', 'item_claims', 'item_messages', 'lost_item_queries', 'success_stories'];
      
      try {
        const { data, error } = await supabase.rpc('get_tables');
        
        if (error) {
          console.error("Error fetching tables:", error);
          setTables(defaultTables);
          if (defaultTables.length > 0 && !selectedTable) {
            setSelectedTable(defaultTables[0]);
          }
        } else {
          // Format data if needed
          const tableNames = Array.isArray(data) ? 
            data.map(t => typeof t === 'string' ? t : t.table_name) as TableName[] : 
            defaultTables;
          
          // Filter to only include valid table names
          const validTableNames = tableNames.filter((name): name is TableName => 
            defaultTables.includes(name as TableName)
          );
          
          setTables(validTableNames);
          if (validTableNames.length > 0 && !selectedTable) {
            setSelectedTable(validTableNames[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch tables:", error);
        setTables(defaultTables);
        if (defaultTables.length > 0 && !selectedTable) {
          setSelectedTable(defaultTables[0]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTableData = async (tableName: TableName) => {
    setIsLoading(true);
    try {
      // Use auth.uid() bypass function to avoid RLS for admin
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Extract columns from first row or set empty array
      const cols = data && data.length > 0 ? Object.keys(data[0]) : [];
      setColumns(cols);
      setTableData(data || []);
      
      // Initialize new row with empty values for each column
      const emptyRow = cols.reduce((acc, col) => {
        acc[col] = '';
        return acc;
      }, {} as Record<string, any>);
      setNewRow(emptyRow);
      
    } catch (error) {
      console.error(`Error fetching ${tableName} data:`, error);
      toast.error(`Failed to fetch ${tableName} data`);
      setTableData([]);
      setColumns([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!selectedTable || !searchQuery.trim()) {
      fetchTableData(selectedTable);
      return;
    }

    const filtered = tableData.filter(row => {
      return Object.values(row).some(value => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      });
    });

    setTableData(filtered);
  };

  const handleEdit = (row: any) => {
    setEditRow({ ...row });
  };

  const handleSaveEdit = async () => {
    if (!selectedTable || !editRow) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from(selectedTable)
        .update(editRow)
        .eq('id', editRow.id);

      if (error) throw error;

      toast.success(`Row updated successfully`);
      fetchTableData(selectedTable);
      setEditRow(null);
    } catch (error) {
      console.error("Error updating row:", error);
      toast.error("Failed to update row");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditRow(null);
  };

  const handleInputChange = (key: string, value: any) => {
    if (editRow) {
      setEditRow({
        ...editRow,
        [key]: value
      });
    }
  };

  const handleNewRowChange = (key: string, value: any) => {
    setNewRow({
      ...newRow,
      [key]: value
    });
  };

  const handleAddRow = async () => {
    if (!selectedTable) return;

    setIsLoading(true);
    try {
      // Remove empty fields
      const rowToInsert = { ...newRow };
      Object.keys(rowToInsert).forEach(key => {
        if (rowToInsert[key] === '' || rowToInsert[key] === null) {
          delete rowToInsert[key];
        }
      });

      const { error } = await supabase
        .from(selectedTable)
        .insert(rowToInsert);

      if (error) throw error;

      toast.success(`New row added successfully`);
      fetchTableData(selectedTable);
      setShowAddDialog(false);
      
      // Reset new row
      const emptyRow = columns.reduce((acc, col) => {
        acc[col] = '';
        return acc;
      }, {} as Record<string, any>);
      setNewRow(emptyRow);
    } catch (error) {
      console.error("Error adding row:", error);
      toast.error("Failed to add row");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRow = async () => {
    if (!selectedTable || !deleteRowId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from(selectedTable)
        .delete()
        .eq('id', deleteRowId);

      if (error) throw error;

      toast.success(`Row deleted successfully`);
      fetchTableData(selectedTable);
      setShowDeleteDialog(false);
      setDeleteRowId(null);
    } catch (error) {
      console.error("Error deleting row:", error);
      toast.error("Failed to delete row");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRow = (row: any) => {
    setViewRow(row);
    setShowViewDialog(true);
  };

  const exportTableData = () => {
    if (!tableData.length) return;

    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      columns.join(',') + '\n' +
      tableData.map(row => 
        columns.map(col => {
          const value = row[col];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      ).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedTable}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${selectedTable} data exported to CSV`);
  };

  const formatValue = (value: any, columnName: string) => {
    if (value === null || value === undefined) return "N/A";
    
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return JSON.stringify(value);
    }
    
    if (columnName.includes('_at') || columnName.includes('date')) {
      try {
        return new Date(value).toLocaleString();
      } catch (e) {
        return value;
      }
    }
    
    return String(value);
  };

  const renderEditField = (columnName: string, value: any) => {
    if (columnName === 'id' || columnName.endsWith('_id')) {
      return (
        <Input 
          value={value || ''} 
          onChange={(e) => handleInputChange(columnName, e.target.value)}
          readOnly={columnName === 'id'} // Make ID field read-only
          className={columnName === 'id' ? "bg-muted" : ""}
        />
      );
    }
    
    if (columnName.includes('description') || columnName.includes('content')) {
      return (
        <Textarea 
          value={value || ''} 
          onChange={(e) => handleInputChange(columnName, e.target.value)}
          rows={3}
        />
      );
    }
    
    if (typeof value === 'boolean' || columnName.startsWith('is_')) {
      return (
        <Select 
          value={value ? "true" : "false"} 
          onValueChange={(val) => handleInputChange(columnName, val === "true")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    
    if (columnName.includes('status')) {
      return (
        <Select 
          value={value || ''} 
          onValueChange={(val) => handleInputChange(columnName, val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    
    return (
      <Input 
        value={value || ''} 
        onChange={(e) => handleInputChange(columnName, e.target.value)}
      />
    );
  };

  const renderNewRowField = (columnName: string, value: any) => {
    if (columnName === 'id') {
      return (
        <Input 
          value="Auto-generated"
          readOnly
          className="bg-muted"
        />
      );
    }
    
    if (columnName.includes('_at') || columnName === 'created_at' || columnName === 'updated_at') {
      return (
        <Input 
          value="Current timestamp" 
          readOnly
          className="bg-muted"
        />
      );
    }
    
    if (columnName.includes('description') || columnName.includes('content')) {
      return (
        <Textarea 
          value={value || ''} 
          onChange={(e) => handleNewRowChange(columnName, e.target.value)}
          placeholder={`Enter ${columnName.replace(/_/g, ' ')}`}
          rows={3}
        />
      );
    }
    
    if (typeof value === 'boolean' || columnName.startsWith('is_')) {
      return (
        <Select 
          value={value ? "true" : "false"} 
          onValueChange={(val) => handleNewRowChange(columnName, val === "true")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    
    if (columnName.includes('status')) {
      return (
        <Select 
          value={value || ''} 
          onValueChange={(val) => handleNewRowChange(columnName, val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    
    return (
      <Input 
        value={value || ''} 
        onChange={(e) => handleNewRowChange(columnName, e.target.value)}
        placeholder={`Enter ${columnName.replace(/_/g, ' ')}`}
      />
    );
  };

  return (
    <AdminLayout title="Database Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Database Management</h2>
            <p className="text-muted-foreground mt-1">
              View and edit database tables directly
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchTables}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue={selectedTable} onValueChange={(value) => setSelectedTable(value as TableName)}>
          <div className="flex justify-between items-center mb-4">
            <ScrollArea className="w-full max-w-3xl">
              <TabsList className="flex flex-nowrap">
                {tables.map((table) => (
                  <TabsTrigger key={table} value={table} className="whitespace-nowrap">
                    {table}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
          </div>

          {tables.map((table) => (
            <TabsContent key={table} value={table} className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center">
                        <DatabaseIcon className="h-5 w-5 mr-2" />
                        {table}
                      </CardTitle>
                      <CardDescription>
                        {tableData.length} records
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={exportTableData}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => setShowAddDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Row
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4 gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search data..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                    <Button variant="secondary" size="sm" onClick={handleSearch}>
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSearchQuery('');
                        fetchTableData(table);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>

                  <div className="border rounded-md">
                    <ScrollArea className="h-[calc(100vh-400px)]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {columns.map((column) => (
                              <TableHead key={column}>{column}</TableHead>
                            ))}
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoading ? (
                            <TableRow>
                              <TableCell colSpan={columns.length + 1} className="text-center py-8">
                                <div className="flex flex-col items-center justify-center">
                                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                  <p className="mt-2 text-sm text-muted-foreground">Loading data...</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : tableData.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={columns.length + 1} className="text-center py-8">
                                <p className="text-muted-foreground">No data found</p>
                              </TableCell>
                            </TableRow>
                          ) : (
                            tableData.map((row, index) => (
                              <TableRow key={index}>
                                {columns.map((column) => (
                                  <TableCell key={column} className="max-w-[200px] truncate">
                                    {formatValue(row[column], column)}
                                  </TableCell>
                                ))}
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleViewRow(row)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleEdit(row)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => {
                                        setDeleteRowId(row.id);
                                        setShowDeleteDialog(true);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Edit Row Dialog */}
        {editRow && (
          <Dialog open={!!editRow} onOpenChange={(open) => !open && handleCancelEdit()}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Row</DialogTitle>
                <DialogDescription>
                  Make changes to the row data. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                {columns.map((column) => (
                  <div key={column} className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm font-medium">
                      {column}
                    </label>
                    <div className="col-span-3">
                      {renderEditField(column, editRow[column])}
                    </div>
                  </div>
                ))}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                <Button onClick={handleSaveEdit}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Add New Row Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Row</DialogTitle>
              <DialogDescription>
                Enter data for the new row. Required fields are marked.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {columns.map((column) => (
                <div key={column} className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm font-medium">
                    {column}
                  </label>
                  <div className="col-span-3">
                    {renderNewRowField(column, newRow[column])}
                  </div>
                </div>
              ))}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={handleAddRow}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Row'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the selected row and remove its data from the database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteRow} className="bg-destructive text-destructive-foreground">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* View Row Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>View Row Details</DialogTitle>
              <DialogDescription>
                Detailed view of the selected row data.
              </DialogDescription>
            </DialogHeader>
            
            {viewRow && (
              <ScrollArea className="h-[60vh]">
                <div className="grid gap-4 py-4">
                  {columns.map((column) => (
                    <div key={column} className="space-y-1">
                      <h4 className="text-sm font-medium">{column}</h4>
                      <div className="rounded-md bg-muted p-3 text-sm">
                        {typeof viewRow[column] === 'object' ? (
                          <pre className="whitespace-pre-wrap break-all">
                            {JSON.stringify(viewRow[column], null, 2)}
                          </pre>
                        ) : (
                          formatValue(viewRow[column], column)
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            
            <DialogFooter>
              <Button onClick={() => setShowViewDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Database;
