import React from "react";
import {
  Users,
  TrendingUp,
  Target,
  ShoppingBag,
  Clock,
  Eye,
  MousePointer,
  Zap,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend,
  icon,
}) => {
  const trendColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
        ? "text-red-600"
        : "text-gray-600";
  const trendBg =
    trend === "up"
      ? "bg-green-50"
      : trend === "down"
        ? "bg-red-50"
        : "bg-gray-50";

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-[#89CFF0]/10 rounded-xl flex items-center justify-center">
          <div className="text-[#89CFF0]">{icon}</div>
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${trendBg} ${trendColor}`}
        >
          {change}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-[#0D1B2A] mb-1">{value}</h3>
      <p className="text-gray-600 text-sm">{title}</p>
    </div>
  );
};

const AnalyticsDashboard: React.FC = () => {
  const metrics = [
    {
      title: "Totaal gebruikers",
      value: "2,847",
      change: "+12.5%",
      trend: "up" as const,
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "Quiz voltooiingen",
      value: "1,923",
      change: "+8.3%",
      trend: "up" as const,
      icon: <Target className="w-6 h-6" />,
    },
    {
      title: "Conversie rate",
      value: "67.5%",
      change: "+2.1%",
      trend: "up" as const,
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      title: "Shop clicks",
      value: "1,247",
      change: "-3.2%",
      trend: "down" as const,
      icon: <ShoppingBag className="w-6 h-6" />,
    },
    {
      title: "Gem. sessietijd",
      value: "4m 32s",
      change: "+15.7%",
      trend: "up" as const,
      icon: <Clock className="w-6 h-6" />,
    },
    {
      title: "Pagina views",
      value: "18,492",
      change: "+22.1%",
      trend: "up" as const,
      icon: <Eye className="w-6 h-6" />,
    },
    {
      title: "CTR outfits",
      value: "34.2%",
      change: "+5.8%",
      trend: "up" as const,
      icon: <MousePointer className="w-6 h-6" />,
    },
    {
      title: "Nova interacties",
      value: "892",
      change: "+41.3%",
      trend: "up" as const,
      icon: <Zap className="w-6 h-6" />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div>
        <h2 className="text-xl font-medium text-[#0D1B2A] mb-6">
          Kernmetrieken
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-[#0D1B2A] mb-4">
          Recente activiteit
        </h3>
        <div className="space-y-3">
          {[
            {
              time: "2 min geleden",
              event: "Nieuwe gebruiker voltooide quiz",
              type: "success",
            },
            {
              time: "5 min geleden",
              event: "Shop click via outfit recommendation",
              type: "conversion",
            },
            {
              time: "8 min geleden",
              event: "Nova chat sessie gestart",
              type: "engagement",
            },
            {
              time: "12 min geleden",
              event: "Gebruiker deelde stijlresultaat",
              type: "social",
            },
            {
              time: "15 min geleden",
              event: "Premium upgrade voltooid",
              type: "revenue",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.type === "success"
                      ? "bg-green-500"
                      : activity.type === "conversion"
                        ? "bg-[#89CFF0]"
                        : activity.type === "engagement"
                          ? "bg-purple-500"
                          : activity.type === "social"
                            ? "bg-pink-500"
                            : "bg-yellow-500"
                  }`}
                />
                <span className="text-gray-900 text-sm">{activity.event}</span>
              </div>
              <span className="text-gray-500 text-xs">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-[#0D1B2A] mb-4">
            Top performing outfits
          </h3>
          <div className="space-y-3">
            {[
              { name: "Casual Chic Mix", clicks: 234, ctr: "42.1%" },
              { name: "Business Casual Pro", clicks: 198, ctr: "38.7%" },
              { name: "Weekend Warrior", clicks: 167, ctr: "35.2%" },
              { name: "Date Night Elegance", clicks: 143, ctr: "31.8%" },
            ].map((outfit, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {outfit.name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {outfit.clicks} clicks
                  </p>
                </div>
                <div className="text-[#89CFF0] font-medium text-sm">
                  {outfit.ctr}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-[#0D1B2A] mb-4">
            Quiz insights
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">
                Gemiddelde voltooitijd
              </span>
              <span className="font-medium text-gray-900">3m 24s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Meest gekozen stijl</span>
              <span className="font-medium text-gray-900">Casual Chic</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Drop-off punt</span>
              <span className="font-medium text-gray-900">
                Vraag 7 (kleurvoorkeur)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Herhaalde quiz</span>
              <span className="font-medium text-gray-900">23.4%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
