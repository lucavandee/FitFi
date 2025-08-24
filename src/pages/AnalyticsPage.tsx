import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  Target,
  AlertCircle,
  RefreshCw,
  Download,
  Filter,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useIsAdmin } from "../hooks/useIsAdmin";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import FunnelVisualizer from "@/components/analytics/FunnelVisualizer";
import Button from "../components/ui/Button";
import LoadingFallback from "../components/ui/LoadingFallback";
import { ErrorBoundary } from "../components/ErrorBoundary";

const AnalyticsPage: React.FC = () => {
  const { user, isLoading: userLoading } = useUser();
  const { isAdmin } = useIsAdmin();
  const [activeView, setActiveView] = useState<
    "overview" | "funnels" | "heatmaps" | "predictions"
  >("overview");

  if (userLoading) {
    return <LoadingFallback fullScreen message="Analytics laden..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md">
          <h2 className="text-2xl font-light text-gray-900 mb-4">
            Inloggen vereist
          </h2>
          <p className="text-gray-600 mb-6">
            Je moet ingelogd zijn om analytics te bekijken.
          </p>
          <Button as={Link} to="/inloggen" variant="primary" fullWidth>
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-light text-gray-900 mb-4">
            Toegang geweigerd
          </h2>
          <p className="text-gray-600 mb-6">
            Je hebt geen toegang tot de analytics dashboard.
          </p>
          <Button as={Link} to="/dashboard" variant="primary" fullWidth>
            Terug naar Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Helmet>
        <title>Analytics Dashboard - Data Inzichten | FitFi</title>
        <meta
          name="description"
          content="Bekijk uitgebreide analytics en data inzichten voor het FitFi platform."
        />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        {/* Header */}
        <ErrorBoundary>
          <div className="mb-8">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-[#89CFF0] hover:text-[#89CFF0]/80 transition-colors mb-6"
            >
              <ArrowLeft size={20} className="mr-2" />
              Terug naar dashboard
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-light text-[#0D1B2A] mb-4">
                  Analytics Dashboard
                </h1>
                <p className="text-xl text-gray-600">
                  Real-time inzichten in gebruikersgedrag en platform
                  performance
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Download size={16} />}
                  iconPosition="left"
                  className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
                >
                  Export Data
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<RefreshCw size={16} />}
                  iconPosition="left"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </ErrorBoundary>

        {/* Navigation Tabs */}
        <ErrorBoundary>
          <div className="bg-white rounded-2xl p-1 shadow-sm mb-8">
            <div className="flex space-x-1">
              {[
                {
                  id: "overview",
                  label: "Overzicht",
                  icon: <BarChart3 className="w-4 h-4" />,
                },
                {
                  id: "funnels",
                  label: "Funnels",
                  icon: <Target className="w-4 h-4" />,
                },
                {
                  id: "heatmaps",
                  label: "Heatmaps",
                  icon: <TrendingUp className="w-4 h-4" />,
                },
                {
                  id: "predictions",
                  label: "Predictions",
                  icon: <Sparkles className="w-4 h-4" />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-200 ${
                    activeView === tab.id
                      ? "bg-[#89CFF0] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </ErrorBoundary>

        {/* Content */}
        <ErrorBoundary>
          <div className="animate-fade-in">
            {activeView === "overview" && <AnalyticsDashboard />}

            {activeView === "funnels" && (
              <div className="space-y-8">
                <FunnelVisualizer
                  funnelName="onboarding"
                  metrics={{
                    total_entries: 1247,
                    completion_rate: 0.73,
                    drop_off_points: [
                      { step: "gender_select", rate: 0.15 },
                      { step: "quiz_start", rate: 0.08 },
                      { step: "quiz_complete", rate: 0.04 },
                    ],
                    avg_completion_time: 180000,
                    conversion_value: 2340.5,
                  }}
                  steps={[
                    { id: "landing", name: "Landing Page", order: 1 },
                    { id: "gender_select", name: "Gender Selection", order: 2 },
                    { id: "quiz_start", name: "Quiz Start", order: 3 },
                    { id: "quiz_complete", name: "Quiz Complete", order: 4 },
                    { id: "results_view", name: "Results View", order: 5 },
                  ]}
                />
              </div>
            )}

            {activeView === "heatmaps" && (
              <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  Heatmaps komen binnenkort
                </h3>
                <p className="text-gray-600">
                  We werken aan geavanceerde heatmap visualisaties voor
                  gebruikersinteracties.
                </p>
              </div>
            )}

            {activeView === "predictions" && (
              <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  Predictive Analytics komen binnenkort
                </h3>
                <p className="text-gray-600">
                  AI-powered voorspellingen voor churn, conversie en
                  gebruikersgedrag.
                </p>
              </div>
            )}
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default AnalyticsPage;
