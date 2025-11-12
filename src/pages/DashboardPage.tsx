import React from "react";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useUser } from "@/context/UserContext";

export default function DashboardPage() {
  console.log('✅ [DashboardPage] Component rendering');

  const { user, status } = useUser();

  console.log('✅ [DashboardPage] User state:', {
    status,
    hasUser: !!user,
    userId: user?.id?.substring(0, 8)
  });

  return (
    <main className="min-h-screen bg-[var(--color-bg)] p-8">
      <Helmet>
        <title>Dashboard - FitFi</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
          <h1 className="text-4xl font-bold mb-4">Dashboard</h1>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="font-semibold text-green-800 dark:text-green-200">
                ✅ Dashboard laadt succesvol!
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h2 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Auth Status:
              </h2>
              <pre className="text-sm text-blue-700 dark:text-blue-300">
                {JSON.stringify({ status, email: user?.email, id: user?.id }, null, 2)}
              </pre>
            </div>

            <div className="flex gap-4">
              <NavLink
                to="/onboarding"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Start Quiz
              </NavLink>

              <NavLink
                to="/results"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                View Results
              </NavLink>

              <NavLink
                to="/profile"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Profile
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
