
import { useState, useEffect } from "react";
import { fetchTables, VALID_TABLES } from "./utils";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatabaseIcon, Loader2, RefreshCw, Trash2 } from "lucide-react";
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
import { toast } from "sonner";

interface TableSelectorProps {
  selectedTable: string;
  setSelectedTable: (table: string) => void;
  onRefresh: () => void;
  onClear: () => void;
  onInsertTestData: () => void;
  isLoading: boolean;
}

const TableSelector = ({
  selectedTable,
  setSelectedTable,
  onRefresh,
  onClear,
  onInsertTestData,
  isLoading
}: TableSelectorProps) => {
  const [tables, setTables] = useState<string[]>([]);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(true);

  useEffect(() => {
    const loadTables = async () => {
      setIsLoadingTables(true);
      try {
        console.log("Fetching available tables...");
        const tableNames = await fetchTables();
        console.log("Tables fetched:", tableNames);
        setTables(tableNames);
        
        if (tableNames.length > 0 && !selectedTable) {
          setSelectedTable(tableNames[0]);
        }
      } catch (error) {
        console.error("Error loading tables:", error);
        toast.error("Failed to load database tables");
      } finally {
        setIsLoadingTables(false);
      }
    };
    
    loadTables();
  }, [setSelectedTable, selectedTable]);

  return (
    <Card className="md:w-1/4">
      <CardHeader>
        <CardTitle>Tables</CardTitle>
        <CardDescription>Select a table to view or manage</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingTables ? (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : tables.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No tables available</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => loadTables()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
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
                onClick={onRefresh}
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
                    <AlertDialogAction 
                      onClick={() => {
                        onClear();
                        setIsClearConfirmOpen(false);
                      }}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                variant="outline"
                onClick={onInsertTestData}
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
  );
};

export default TableSelector;
