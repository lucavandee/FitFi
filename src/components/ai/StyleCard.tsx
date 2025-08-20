@@ .. @@
 import React from 'react';
 import ImageWithFallback from '@/components/ui/ImageWithFallback';
 import { track } from '@/utils/analytics';
+import { useSavedOutfit } from '@/hooks/useSavedOutfit';

 export type StyleProduct = {
@@ .. @@
 export default function StyleCard({
   outfit,
   onShopClick,
 }: {
   outfit: StyleOutfit;
   onShopClick?: (product: StyleProduct, outfit: StyleOutfit) => void;
 }) {
   const score = clamp(outfit.matchScore);
   const main = outfit.products?.[0];
+  const { saved, toggle: toggleSave, busy: saveBusy } = useSavedOutfit(outfit);

   return (
@@ .. @@
           )}
           <button
-            onClick={() => track('style_preview_save_click', { outfitId: outfit.id })}
-            className="rounded-2xl px-4 py-3 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
+            onClick={() => {
+              track('style_preview_save_click', { outfitId: outfit.id, saved: !saved });
+              toggleSave();
+            }}
+            disabled={saveBusy}
+            className={`rounded-2xl px-4 py-3 font-semibold transition ${
+              saved 
+                ? 'text-red-600 bg-red-50 hover:bg-red-100' 
+                : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
+            } ${saveBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
             aria-label="Bewaar outfit"
-            title="Bewaar outfit"
+            title={saved ? "Verwijder uit favorieten" : "Bewaar outfit"}
           >
-            ♡
+            {saveBusy ? '...' : saved ? '♥' : '♡'}
           </button>
         </div>
       </div>