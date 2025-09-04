import { useState } from "react";
import { Users, Gift, Copy, Check } from "lucide-react";

export default function ReferralCard() {
  const [copied, setCopied] = useState(false);
  const referralCode = "FITFI2024";
  const referralCount = 3;
  const referralUrl = `https://fitfi.nl/join?ref=${referralCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Referrals</h3>
        </div>
        <div className="flex items-center space-x-1">
          <Gift className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-green-600">{referralCount} vrienden</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">Jouw referral code:</p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-white rounded-lg px-3 py-2 border border-gray-200">
              <code className="text-sm font-mono text-gray-800">{referralCode}</code>
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center justify-center w-10 h-10 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-green-600" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Verdien rewards</p>
              <p className="text-xs text-gray-500">Voor elke vriend die zich aanmeldt</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">+50 XP</p>
              <p className="text-xs text-gray-500">per referral</p>
            </div>
          </div>
        </div>

        <button className="w-full bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-700 transition-colors">
          Deel je link
        </button>
      </div>
    </div>
  );
}