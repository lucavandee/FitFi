import { Brain, Sparkles } from "lucide-react";

export default function NovaInsightCard() {
  const insights = [
    "Je stijl evolueert naar meer minimalistische looks",
    "Casual outfits presteren 23% beter dan formele",
    "Aardtinten passen perfect bij jouw seizoensvoorkeur"
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Nova Insights</h3>
        </div>
        <Sparkles className="w-5 h-5 text-purple-500" />
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>

      <button className="mt-4 w-full bg-white text-blue-600 border border-blue-200 rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-50 transition-colors">
        <div className="flex items-center justify-center space-x-2">
          <span>Meer insights</span>
          <Brain className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
}