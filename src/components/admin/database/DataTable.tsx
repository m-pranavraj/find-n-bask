
import { TableData, formatCellValue, truncateText } from "./utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DatabaseIcon, Loader2, AlertCircle } from "lucide-react";

interface DataTableProps {
  selectedTable: string;
  tableData: TableData[];
  columns: string[];
  isLoading: boolean;
}

const DataTable = ({
  selectedTable,
  tableData,
  columns,
  isLoading
}: DataTableProps) => {
  return (
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
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading table data...</p>
            </div>
          </div>
        ) : tableData.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground mt-4">No records found in {selectedTable}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try inserting test data or check your database connection
            </p>
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
  );
};

export default DataTable;
