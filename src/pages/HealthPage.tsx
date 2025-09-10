import React from "react";
import { Helmet } from "react-helmet-async";

export default function HealthPage() {
  const buildTag = import.meta.env.VITE_BUILD_TAG ?? "dev";
  const chatStyle = import.meta.env.VITE_CHAT_STYLE ?? "normal";
  const telemetryEnabled = import.meta.env.VITE_ENABLE_TELEMETRY ?? "1";

  return (
    <>
      <Helmet>
        <title>Health Check - FitFi</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-surface p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-heading font-bold text-midnight mb-8">
            System Health Check
          </h1>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-heading font-semibold text-midnight mb-4">
                Build Information
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Build Tag:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-midnight">
                    {buildTag}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chat Style:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-midnight">
                    {chatStyle}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Telemetry:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-midnight">
                    {telemetryEnabled === "1" ? "enabled" : "disabled"}
                  </code>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-heading font-semibold text-midnight mb-4">
                Nova Chat Status
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mount Status:</span>
                  <span className="text-green-600 font-medium">
                    {document.body?.getAttribute("data-nova-mount") === "true" ? "✅ Mounted" : "❌ Not Mounted"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Environment:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-midnight">
                    {import.meta.env.MODE}
                  </code>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-heading font-semibold text-midnight mb-4">
                System Status
              </h2>
              <div className="text-green-600 font-medium">
                ✅ All systems operational
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}