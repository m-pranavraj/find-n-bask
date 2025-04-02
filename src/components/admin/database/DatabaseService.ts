
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isValidTable, TableData, ValidTableName } from "./utils";

// Type definitions for test data
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

export const fetchTableData = async (tableName: string): Promise<{
  columns: string[];
  data: TableData[];
}> => {
  try {
    // Validate the table name before using it with supabase
    if (!isValidTable(tableName)) {
      throw new Error(`Invalid table name: ${tableName}`);
    }
    
    // Since isValidTable is a type guard, tableName is now ValidTableName
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(100);

    if (error) throw error;

    if (data) {
      const columnList = data.length > 0 
        ? Object.keys(data[0]).filter(col => col !== 'raw_user_meta_data') 
        : [];
      
      return {
        columns: columnList,
        data: data
      };
    } else {
      return {
        columns: [],
        data: []
      };
    }
  } catch (error) {
    console.error(`Error fetching data for table ${tableName}:`, error);
    toast.error(`Failed to load data for table: ${tableName}`);
    return {
      columns: [],
      data: []
    };
  }
};

export const clearTable = async (tableName: string): Promise<boolean> => {
  if (!tableName) return false;
  
  try {
    if (tableName === 'profiles') {
      const { error } = await supabase.rpc('admin_reset_profiles');
      
      if (error) throw error;
      
      toast.success("Profiles reset successfully (admin users preserved)");
    } else {
      // Validate table name before using in RPC call
      if (!isValidTable(tableName)) {
        throw new Error(`Invalid table name: ${tableName}`);
      }
      
      // Use a type assertion after validation to satisfy TypeScript
      const validTableName = tableName as ValidTableName;
      
      const { error } = await supabase.rpc('admin_clear_table', { 
        table_name: validTableName
      });
      
      if (error) throw error;
      
      toast.success(`Table ${tableName} cleared successfully`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error clearing table ${tableName}:`, error);
    toast.error("Failed to clear table data");
    return false;
  }
};

export const insertTestData = async (tableName: string): Promise<boolean> => {
  if (!tableName) return false;
  
  try {
    // Validate table name before proceeding
    if (!isValidTable(tableName)) {
      throw new Error(`Invalid table name: ${tableName}`);
    }
    
    if (tableName === 'found_items') {
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
    else if (tableName === 'profiles') {
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
      return false;
    }
    
    toast.success(`Test data inserted into ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Error inserting test data into ${tableName}:`, error);
    toast.error("Failed to insert test data");
    return false;
  }
};

// Add new function to delete an item from found_items table
export const deleteFoundItem = async (itemId: string): Promise<boolean> => {
  try {
    // First, try to delete the images from storage
    const { data: item, error: fetchError } = await supabase
      .from('found_items')
      .select('images')
      .eq('id', itemId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // If the item has images, delete them from storage
    if (item && item.images && item.images.length > 0) {
      console.log("Removing images:", item.images);
      
      for (const imageUrl of item.images) {
        // Extract the path from the URL
        // Format is typically: https://[project-ref].supabase.co/storage/v1/object/public/[bucket]/[path]
        try {
          const bucket = 'found-item-images';
          const urlParts = imageUrl.split('/');
          const pathIndex = urlParts.indexOf('public');
          
          if (pathIndex >= 0 && pathIndex < urlParts.length - 2) {
            const path = urlParts.slice(pathIndex + 2).join('/');
            console.log(`Deleting file: ${bucket}/${path}`);
            
            const { error: storageError } = await supabase
              .storage
              .from(bucket)
              .remove([path]);
              
            if (storageError) {
              console.error("Error deleting image:", storageError);
            }
          }
        } catch (imgError) {
          console.error("Error processing image URL:", imgError);
        }
      }
    }
    
    // Now delete the item from the database
    const { error: deleteError } = await supabase
      .from('found_items')
      .delete()
      .eq('id', itemId);
      
    if (deleteError) throw deleteError;
    
    toast.success("Item deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting item:", error);
    toast.error("Failed to delete item");
    return false;
  }
};
