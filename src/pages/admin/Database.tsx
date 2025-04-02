
import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";
import TableSelector from "@/components/admin/database/TableSelector";
import DataTable from "@/components/admin/database/DataTable";
import { fetchTableData, clearTable, insertTestData } from "@/components/admin/database/DatabaseService";
import { TableData } from "@/components/admin/database/utils";
import { useNavigate } from "react-router-dom";

const Database = () => {
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is authenticated
    const adminAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
    if (!adminAuthenticated) {
      toast.error("Admin authentication required");
      navigate("/admin/login");
      return;
    }
    
    if (selectedTable) {
      handleFetchTableData(selectedTable);
    } else {
      setIsLoading(false);
    }
  }, [selectedTable, navigate]);

  const handleFetchTableData = async (tableName: string) => {
    if (!tableName) return;
    
    setIsLoading(true);
    try {
      console.log("Fetching data for table:", tableName);
      const result = await fetchTableData(tableName);
      console.log("Data fetched:", result);
      setColumns(result.columns);
      setTableData(result.data);
    } catch (error) {
      console.error("Error fetching table data:", error);
      toast.error(`Failed to fetch data for ${tableName}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearTable = async () => {
    if (!selectedTable) return;
    
    setIsLoading(true);
    try {
      const success = await clearTable(selectedTable);
      if (success) {
        handleFetchTableData(selectedTable);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertTestData = async () => {
    if (!selectedTable) return;
    
    setIsLoading(true);
    try {
      const success = await insertTestData(selectedTable);
      if (success) {
        handleFetchTableData(selectedTable);
      }
    } finally {
      setIsLoading(false);
    }
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
          <TableSelector 
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
            onRefresh={() => selectedTable && handleFetchTableData(selectedTable)}
            onClear={handleClearTable}
            onInsertTestData={handleInsertTestData}
            isLoading={isLoading}
          />
          
          <DataTable 
            selectedTable={selectedTable}
            tableData={tableData}
            columns={columns}
            isLoading={isLoading}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Database;
