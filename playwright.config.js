@@ -1,4 +1,5 @@
 // @ts-check
+const AxeBuilder = require('@axe-core/playwright').default;
 const { defineConfig, devices } = require('@playwright/test');
 
 /**
@@ -25,6 +26,9 @@
     /* Record video on failure */
     video: 'retain-on-failure',
     
+    /* Accessibility testing */
+    use: { ...devices['Desktop Chrome'], axeBuilder: AxeBuilder },
+    
     /* Timeout for each action */
     actionTimeout: 10000,
     
@@ -35,6 +39,7 @@
   /* Configure projects for major browsers */
   projects: [
     {
       name: 'chromium',
       use: { ...devices['Desktop Chrome'] },
     },
   ]