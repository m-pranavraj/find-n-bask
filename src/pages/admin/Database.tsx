
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import {
  DatabaseIcon,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";

interface TableData {
  [key: string]: any;
}

interface TableNameResponse {
  table_name: string;
}

// Define valid table names as a const array to use with Supabase
const VALID_TABLES = [
  'found_items',
  'item_claims',
  'item_messages',
  'lost_item_queries',
  'profiles',
  'success_stories'
] as const;

// Use a type union for valid table names
type ValidTableName = typeof VALID_TABLES[number];

// Type guard to validate table names
const isValidTable = (table: string): table is ValidTableName => {
  return VALID_TABLES.includes(table as ValidTableName);
};

// Strongly typed test data interfaces
interface TestFoundItem {
  item_name: string;
  category: string;
  location: string;
  description: string;
  contact_preference: string;
  user_id: string;
  images: string[];
}

interface TestProfile {
  full_name: string;
  email: string;
  location: string;
  bio: string;
}

const Database = () => {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

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
      const { data, error } = await supabase.rpc('get_tables') as { data: TableNameResponse[] | null, error: any };
      
      if (error) throw error;

      if (data) {
        const tableNames = data.map(item => item.table_name);
        setTables(tableNames);
        
        if (tableNames.length > 0 && !selectedTable) {
          setSelectedTable(tableNames[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("Failed to load database tables");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTableData = async (tableName: string) => {
    setIsLoading(true);
    try {
      // Type guard to ensure tableName is a valid table before using it with supabase
      if (!isValidTable(tableName)) {
        throw new Error(`Invalid table name: ${tableName}`);
      }
      
      // Now tableName is narrowed to ValidTableName type
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(100);

      if (error) throw error;

      if (data) {
        const columnList = data.length > 0 
          ? Object.keys(data[0]).filter(col => col !== 'raw_user_meta_data') 
          : [];
        
        setColumns(columnList);
        setTableData(data);
      } else {
        setColumns([]);
        setTableData([]);
      }
    } catch (error) {
      console.error(`Error fetching data for table ${tableName}:`, error);
      toast.error(`Failed to load data for table: ${tableName}`);
      setColumns([]);
      setTableData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearTable = async () => {
    if (!selectedTable) return;
    
    setIsLoading(true);
    try {
      if (selectedTable === 'profiles') {
        const { error } = await supabase.rpc('admin_reset_profiles');
        
        if (error) throw error;
        
        toast.success("Profiles reset successfully (admin users preserved)");
      } else {
        const { error } = await supabase.rpc('admin_clear_table', { 
          table_name: selectedTable 
        });
        
        if (error) throw error;
        
        toast.success(`Table ${selectedTable} cleared successfully`);
      }
      
      // Validate the table name again before fetching data
      if (isValidTable(selectedTable)) {
        fetchTableData(selectedTable);
      }
    } catch (error) {
      console.error(`Error clearing table ${selectedTable}:`, error);
      toast.error("Failed to clear table data");
    } finally {
      setIsLoading(false);
      setIsClearConfirmOpen(false);
    }
  };

  const handleInsertTestData = async () => {
    if (!selectedTable) return;
    
    setIsLoading(true);
    try {
      // Validate the table name before proceeding
      if (!isValidTable(selectedTable)) {
        throw new Error(`Invalid table name: ${selectedTable}`);
      }
      
      if (selectedTable === 'found_items') {
        const testData: TestFoundItem = {
          item_name: "Test Laptop",
          category: "Electronics",
          location: "Library",
          description: "Black Dell laptop found in the library",
          contact_preference: "email",
          user_id: "00000000-0000-0000-0000-000000000000",
          images: []
        };
        
        const { error } = await supabase
          .from('found_items')
          .insert(testData);
          
        if (error) throw error;
      } 
      else if (selectedTable === 'profiles') {
        const testData: TestProfile = {
          full_name: "Test User",
          email: "test@example.com",
          location: "Test Location",
          bio: "This is a test user"
        };
        
        const { error } = await supabase
          .from('profiles')
          .insert(testData);
          
        if (error) throw error;
      }
      else {
        toast.error("Test data not available for this table");
        setIsLoading(false);
        return;
      }
      
      toast.success(`Test data inserted into ${selectedTable}`);
      
      // Refresh table data
      fetchTableData(selectedTable);
    } catch (error) {
      console.error(`Error inserting test data into ${selectedTable}:`, error);
      toast.error("Failed to insert test data");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCellValue = (value: any): string => {
    if (value === null) return "NULL";
    if (value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const truncateText = (text: string, maxLength: number = 50): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <AdminLayout title="Database Management">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Database Management</h2>
          <p className="text-muted-foreground mt-1">
            View and manage database tables and records
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <Card className="md:w-1/4">
            <CardHeader>
              <CardTitle>Tables</CardTitle>
              <CardDescription>Select a table to view or manage</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && tables.length === 0 ? (
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  <Select
                    value={selectedTable}
                    onValueChange={setSelectedTable}
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

                  <div className="flex flex-col gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => fetchTableData(selectedTable)}
                      disabled={!selectedTable || isLoading}
                      className="w-full"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Data
                    </Button>

                    <AlertDialog
                      open={isClearConfirmOpen}
                      onOpenChange={setIsClearConfirmOpen}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          disabled={!selectedTable || isLoading}
                          className="w-full"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Clear Table
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will delete {selectedTable === 'profiles' 
                              ? 'all non-admin user profiles' 
                              : `all records from the "${selectedTable}" table`}. 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={clearTable}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button
                      variant="outline"
                      onClick={handleInsertTestData}
                      disabled={
                        !selectedTable ||
                        isLoading ||
                        !["found_items", "profiles"].includes(selectedTable)
                      }
                      className="w-full"
                    >
                      <DatabaseIcon className="mr-2 h-4 w-4" />
                      Insert Test Data
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle>
                {selectedTable ? `${selectedTable} Data` : "Table Data"}
              </CardTitle>
              <CardDescription>
                {tableData.length} records found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedTable ? (
                <div className="text-center py-16">
                  <DatabaseIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    Select a table to view its data
                  </p>
                </div>
              ) : isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : tableData.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No records found</p>
                </div>
              ) : (
                <div className="border rounded-md overflow-auto max-h-[70vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map((column) => (
                          <TableHead key={column}>{column}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableData.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {columns.map((column) => (
                            <TableCell key={`${rowIndex}-${column}`}>
                              {truncateText(formatCellValue(row[column]))}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Database;
