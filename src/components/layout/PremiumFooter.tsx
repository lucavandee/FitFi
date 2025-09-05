import { Link } from "react-router-dom";

export default function PremiumFooter() {
  return (
    <footer className="mt-20 border-t">
      <div className="ff-container py-10 grid gap-6 sm:grid-cols-3 text-sm">
        <div>
          <div className="font-heading text-[color:var(--ff-midnight)] font-extrabold">FitFi</div>
          <p className="mt-2 text-gray-600">AI-styling die bij je past — slim, persoonlijk en future-ready.</p>
        </div>
        <div>
          <div className="font-semibold text-gray-800">Legal</div>
          <div className="mt-2 flex flex-col gap-1">
            <Link to="/privacy" className="text-gray-600 hover:text-gray-900">Privacy</Link>
            <Link to="/terms" className="text-gray-600 hover:text-gray-900">Terms</Link>
            <Link to="/cookies" className="text-gray-600 hover:text-gray-900">Cookies</Link>
          </div>
        </div>
        <div>
          <div className="font-semibold text-gray-800">Product</div>
          <div className="mt-2 flex flex-col gap-1">
            <Link to="/results" className="text-gray-600 hover:text-gray-900">Demo resultaten</Link>
            <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Prijzen</Link>
            <Link to="/__health" className="text-gray-600 hover:text-gray-900">Health</Link>
          </div>
        </div>
      </div>
      <div className="ff-container pb-10 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} FitFi — Alle rechten voorbehouden.
      </div>
    </footer>
  );
}