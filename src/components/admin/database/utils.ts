
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Define a const array of valid table names to use with Supabase
export const VALID_TABLES = [
  'found_items',
  'item_claims',
  'item_messages',
  'lost_item_queries',
  'profiles',
  'success_stories'
] as const;

// Create a type from the array values
export type ValidTableName = typeof VALID_TABLES[number];

// Type guard function to validate if a string is a valid table name
export function isValidTable(table: string): table is ValidTableName {
  return (VALID_TABLES as readonly string[]).includes(table);
}

export interface TableNameResponse {
  table_name: string;
}

export interface TableData {
  [key: string]: any;
}

// Fetch available tables from Supabase
export const fetchTables = async (): Promise<string[]> => {
  try {
    // Fix: Properly type the RPC call
    const { data, error } = await supabase.rpc<TableNameResponse>('get_tables');
    
    if (error) throw error;

    if (data) {
      // Since data is now properly typed as TableNameResponse[], .map is valid
      return data.map(item => item.table_name);
    }
    return [];
  } catch (error) {
    console.error("Error fetching tables:", error);
    toast.error("Failed to load database tables");
    return [];
  }
};

// Format cell value for display
export const formatCellValue = (value: any): string => {
  if (value === null) return "NULL";
  if (value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

// Truncate text for table cells
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};
