/**
 * App root met BrowserRouter en lazy routes.
 * 
 * Lazy route voor "/__health" → HealthPage (code-split).
 * 
 * Globale DEV-only console mount via <DevOnly><DevConsoleMount/></DevOnly>.
 * 
 * Behoudt alias @; default exports; Tailwind v3.
 */
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import DevOnly from "@/components/dev/DevOnly";
import DevConsoleMount from "@/components/dev/DevConsoleMount";

// Lazy pages
const HealthPage = lazy(() => import("@/pages/HealthPage"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="p-6">
              <div className="mx-auto max-w-xl animate-pulse space-y-3">
                <div className="h-6 w-40 rounded bg-surface" />
                <div className="h-4 w-64 rounded bg-surface" />
                <div className="h-4 w-56 rounded bg-surface" />
              </div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/__health" element={<HealthPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="*" element={<div className="p-10 text-center">Pagina niet gevonden</div>} />
          </Routes>

          {/* DEV-only tools (worden niet gebundeld/gerenderd in productie) */}
          <DevOnly>
            <DevConsoleMount />
          </DevOnly>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;