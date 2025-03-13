import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Search, X, Download, Plus, Edit, Trash, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TableName = 'profiles' | 'found_items' | 'item_claims' | 'item_messages' | 'lost_item_queries' | 'success_stories';

interface TableData {
  [key: string]: any;
}

const Database = () => {
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableName | ''>('');
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<TableData | null>(null);
  const [editedRow, setEditedRow] = useState<TableData>({});
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newRow, setNewRow] = useState<TableData>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [filterColumn, setFilterColumn] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const { data, error } = await supabase.rpc('get_tables');
        if (error) throw error;
        if (data) {
          const validTables = data.filter((table: { table_name: string }) => 
            ['profiles', 'found_items', 'item_claims', 'item_messages', 'lost_item_queries', 'success_stories'].includes(table.table_name)
          ).map((table: { table_name: string }) => table.table_name);
          setTables(validTables);
        }
      } catch (error) {
        console.error('Error fetching tables:', error);
        toast.error('Failed to load database tables');
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData();
    } else {
      setTableData([]);
      setColumns([]);
    }
  }, [selectedTable, page, rowsPerPage, filterColumn, filterValue]);

  const fetchTableData = async () => {
    if (!selectedTable) return;
    
    setLoading(true);
    try {
      let query = supabase.from(selectedTable).select('*', { count: 'exact' });
      
      if (filterColumn && filterValue) {
        query = query.ilike(filterColumn, `%${filterValue}%`);
      }
      
      const from = page * rowsPerPage;
      const to = from + rowsPerPage - 1;
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      if (data) {
        setTableData(data);
        
        if (data.length > 0) {
          setColumns(Object.keys(data[0]));
        }
        
        if (count !== null) {
          setTotalRows(count);
        }
      }
    } catch (error) {
      console.error(`Error fetching data from ${selectedTable}:`, error);
      toast.error('Failed to load table data');
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (tableName: string) => {
    if (['profiles', 'found_items', 'item_claims', 'item_messages', 'lost_item_queries', 'success_stories'].includes(tableName)) {
      setSelectedTable(tableName as TableName);
      setPage(0);
      setFilterColumn('');
      setFilterValue('');
    } else {
      setSelectedTable('');
    }
  };

  const handleEditClick = (row: TableData) => {
    setCurrentRow(row);
    setEditedRow({...row});
    setEditDialogOpen(true);
  };

  const handleUpdateRow = async () => {
    if (!selectedTable || !currentRow) return;
    
    try {
      const primaryKey = columns.includes('id') ? 'id' : columns[0];
      
      const { error } = await supabase
        .from(selectedTable)
        .update(editedRow)
        .eq(primaryKey, currentRow[primaryKey]);
        
      if (error) throw error;
      
      toast.success('Row updated successfully');
      setEditDialogOpen(false);
      fetchTableData();
    } catch (error) {
      console.error('Error updating row:', error);
      toast.error('Failed to update row');
    }
  };

  const handleAddClick = () => {
    const emptyRow: TableData = {};
    columns.forEach(col => {
      if (col !== 'id' && col !== 'created_at' && col !== 'updated_at') {
        emptyRow[col] = '';
      }
    });
    setNewRow(emptyRow);
    setAddDialogOpen(true);
  };

  const handleAddRow = async () => {
    if (!selectedTable) return;
    
    try {
      const { error } = await supabase
        .from(selectedTable)
        .insert([newRow]);
        
      if (error) throw error;
      
      toast.success('Row added successfully');
      setAddDialogOpen(false);
      fetchTableData();
    } catch (error) {
      console.error('Error adding row:', error);
      toast.error('Failed to add row');
    }
  };

  const handleDeleteRow = async (row: TableData) => {
    if (!selectedTable) return;
    
    if (!confirm('Are you sure you want to delete this row? This action cannot be undone.')) {
      return;
    }
    
    try {
      const primaryKey = columns.includes('id') ? 'id' : columns[0];
      
      const { error } = await supabase
        .from(selectedTable)
        .delete()
        .eq(primaryKey, row[primaryKey]);
        
      if (error) throw error;
      
      toast.success('Row deleted successfully');
      fetchTableData();
    } catch (error) {
      console.error('Error deleting row:', error);
      toast.error('Failed to delete row');
    }
  };

  const clearTableData = async (tableName: TableName) => {
    if (!confirm(`WARNING: This will delete ALL data from the ${tableName} table. This action cannot be undone. Are you sure?`)) {
      return;
    }
    
    try {
      const { error } = await supabase.rpc('admin_clear_table', { 
        table_name: tableName 
      });
      
      if (error) throw error;
      
      toast.success(`All data from ${tableName} has been cleared`);
      fetchTableData();
    } catch (error) {
      console.error(`Error clearing table ${tableName}:`, error);
      toast.error('Failed to clear table data');
    }
  };

  const exportToCSV = () => {
    if (!tableData.length || !columns.length) return;
    
    const csvContent = [
      columns.join(','),
      ...tableData.map(row => 
        columns.map(col => {
          const value = row[col];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedTable}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAllUserData = async () => {
    if (!confirm('WARNING: This will delete ALL user data from all tables. This action cannot be undone. Are you sure?')) {
      return;
    }
    
    setLoading(true);
    try {
      const tables: TableName[] = ['item_claims', 'item_messages', 'found_items', 'lost_item_queries', 'success_stories'];
      
      for (const table of tables) {
        await supabase.from(table).delete();
        toast.success(`Cleared ${table} data`);
      }
      
      const { error } = await supabase.rpc('admin_reset_profiles');
      
      if (error) throw error;
      
      toast.success('All user data has been reset successfully');
      
      if (selectedTable) {
        fetchTableData();
      }
    } catch (error) {
      console.error('Error resetting user data:', error);
      toast.error('Failed to reset user data');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = tableData.filter(row => {
    if (!searchTerm) return true;
    
    return Object.values(row).some(value => {
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  return (
    <AdminLayout title="Database Management">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Management</h1>
          <p className="text-muted-foreground mt-2">
            View and manage data in your Supabase database
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Database Tables</CardTitle>
            <CardDescription>
              Select a table to view and manage its data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="view" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="view">View & Edit Data</TabsTrigger>
                <TabsTrigger value="manage">Manage Database</TabsTrigger>
              </TabsList>
              
              <TabsContent value="view" className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="w-full md:w-1/4">
                    <Select
                      value={selectedTable}
                      onValueChange={handleTableSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a table" />
                      </SelectTrigger>
                      <SelectContent>
                        {tables.map((table) => (
                          <SelectItem key={table} value={table}>
                            {table}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="relative w-full md:w-1/2">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search data..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setSearchTerm('')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-auto">
                    {selectedTable && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchTableData()}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={exportToCSV}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export CSV
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleAddClick}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Row
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {selectedTable && columns.length > 0 && (
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="w-full md:w-auto">
                      <Select
                        value={filterColumn}
                        onValueChange={setFilterColumn}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Filter by column" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No filter</SelectItem>
                          {columns.map((col) => (
                            <SelectItem key={col} value={col}>
                              {col}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {filterColumn && (
                      <div className="w-full md:w-auto flex-1 max-w-xs">
                        <Input
                          placeholder={`Filter value for ${filterColumn}...`}
                          value={filterValue}
                          onChange={(e) => setFilterValue(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !selectedTable ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Select a table to view its data</p>
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No data found</p>
                  </div>
                ) : (
                  <div className="border rounded-md overflow-auto">
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
                        {filteredData.map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {columns.map((column) => (
                              <TableCell key={column} className="truncate max-w-[200px]">
                                {typeof row[column] === 'object' 
                                  ? JSON.stringify(row[column]) 
                                  : String(row[column] ?? '')}
                              </TableCell>
                            ))}
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditClick(row)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => handleDeleteRow(row)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                
                {selectedTable && totalRows > 0 && (
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, totalRows)} of {totalRows} entries
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => p + 1)}
                        disabled={(page + 1) * rowsPerPage >= totalRows}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="manage" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Management Tools</CardTitle>
                    <CardDescription>
                      Advanced tools for managing your database
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium mb-2">Reset User Data</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Clear all user-related data without affecting the database schema
                        </p>
                        <Button 
                          variant="destructive"
                          onClick={resetAllUserData}
                        >
                          Clear All User Data
                        </Button>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium mb-2">Backup Database</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Download a backup of all table data as CSV files
                        </p>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            toast.success('Initiated database backup. Files will download shortly.');
                            tables.forEach(table => {
                              setTimeout(() => {
                                if (['profiles', 'found_items', 'item_claims', 'item_messages', 'lost_item_queries', 'success_stories'].includes(table)) {
                                  handleTableSelect(table);
                                  setTimeout(() => exportToCSV(), 500);
                                }
                              }, 1000);
                            });
                          }}
                        >
                          Backup All Tables
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="font-medium mb-4">Clear Individual Tables</h3>
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {['profiles', 'found_items', 'item_claims', 'item_messages', 'lost_item_queries', 'success_stories'].map((table) => (
                          <div key={table} className="border rounded-lg p-3">
                            <h4 className="font-medium">{table}</h4>
                            <p className="text-xs text-muted-foreground mb-2">
                              Delete all data from this table
                            </p>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => clearTableData(table as TableName)}
                            >
                              Clear Table
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Row</DialogTitle>
              <DialogDescription>
                Edit the values for this row. Fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {currentRow && columns.map((column) => (
                <div key={column} className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right font-medium text-sm">
                    {column}
                    {!['id', 'created_at', 'updated_at'].includes(column) && ' *'}
                  </label>
                  <Input
                    className="col-span-3"
                    value={String(editedRow[column] ?? '')}
                    onChange={(e) => setEditedRow({...editedRow, [column]: e.target.value})}
                    disabled={['id', 'created_at', 'updated_at'].includes(column)}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRow}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Row</DialogTitle>
              <DialogDescription>
                Fill in the values for the new row. Fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {columns
                .filter(col => !['id', 'created_at', 'updated_at'].includes(col))
                .map((column) => (
                  <div key={column} className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right font-medium text-sm">
                      {column} *
                    </label>
                    <Input
                      className="col-span-3"
                      value={String(newRow[column] ?? '')}
                      onChange={(e) => setNewRow({...newRow, [column]: e.target.value})}
                    />
                  </div>
                ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRow}>
                Add Row
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Database;
