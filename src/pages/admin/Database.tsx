
import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";
import TableSelector from "@/components/admin/database/TableSelector";
import DataTable from "@/components/admin/database/DataTable";
import { fetchTableData, clearTable, insertTestData } from "@/components/admin/database/DatabaseService";
import { TableData } from "@/components/admin/database/utils";

const Database = () => {
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (selectedTable) {
      handleFetchTableData(selectedTable);
    }
  }, [selectedTable]);

  const handleFetchTableData = async (tableName: string) => {
    setIsLoading(true);
    try {
      const result = await fetchTableData(tableName);
      setColumns(result.columns);
      setTableData(result.data);
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
            onRefresh={() => handleFetchTableData(selectedTable)}
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
