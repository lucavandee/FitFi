@@ .. @@
-import { supabase } from "@/lib/supabaseClient";
+import supabase from "@/lib/supabase";
 
 export class DataService {
@@ .. @@
   async fetchUserData(userId: string) {
+    const sb = supabase;
     try {
-      const { data, error } = await supabase()
+      const { data, error } = await sb
         .from("users_legacy")