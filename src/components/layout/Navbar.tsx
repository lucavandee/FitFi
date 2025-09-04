import React, { useState } from 'react';
import { Link, useLocation, useInRouterContext } from 'react-router-dom';
import { ReactNode } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/context/UserContext';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

function SmartLink({ to, href, children, className }: { to?: string; href?: string; children: ReactNode; className?: string; }) {
  const inRouter = useInRouterContext();
  if (to && inRouter) return <Link to={to} className={className}>{children}</Link>;
  return <a href={to || href || "#"} className={className}>{children}</a>;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <SmartLink to="/" className="flex items-center space-x-2">
              <Logo className="h-8 w-8" />
              <span className="text-xl font-bold text-[#0D1B2A]">FitFi</span>
            </SmartLink>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <SmartLink
                to="/home"
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === "/home"
                    ? "bg-[#89CFF0] text-white"
                    : "text-gray-700 hover:text-[#0D1B2A] hover:bg-gray-50"
                )}
              >
                Home
              </SmartLink>
              <SmartLink
                to="/tribes"
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === "/tribes"
                    ? "bg-[#89CFF0] text-white"
                    : "text-gray-700 hover:text-[#0D1B2A] hover:bg-gray-50"
                )}
              >
                Tribes
              </SmartLink>
              <SmartLink
                to="/pricing"
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === "/pricing"
                    ? "bg-[#89CFF0] text-white"
                    : "text-gray-700 hover:text-[#0D1B2A] hover:bg-gray-50"
                )}
              >
                Pricing
              </SmartLink>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <SmartLink
              to="/login"
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === "/login"
                  ? "bg-[#89CFF0] text-white"
                  : "text-gray-700 hover:text-[#0D1B2A] hover:bg-gray-50"
              )}
            >
              Login
            </SmartLink>
            <SmartLink
              to="/onboarding"
              className="bg-[#89CFF0] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#7BB8E0] transition-colors"
            >
              Start Quiz
            </SmartLink>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#0D1B2A] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#89CFF0]"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <SmartLink
                to="/home"
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                  location.pathname === "/home"
                    ? "bg-[#89CFF0] text-white"
                    : "text-gray-700 hover:text-[#0D1B2A] hover:bg-gray-50"
                )}
                onClick={() => setIsOpen(false)}
              >
                Home
              </SmartLink>
              <SmartLink
                to="/tribes"
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                  location.pathname === "/tribes"
                    ? "bg-[#89CFF0] text-white"
                    : "text-gray-700 hover:text-[#0D1B2A] hover:bg-gray-50"
                )}
                onClick={() => setIsOpen(false)}
              >
                Tribes
              </SmartLink>
              <SmartLink
                to="/pricing"
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                  location.pathname === "/pricing"
                    ? "bg-[#89CFF0] text-white"
                    : "text-gray-700 hover:text-[#0D1B2A] hover:bg-gray-50"
                )}
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </SmartLink>
              <SmartLink
                to="/login"
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                  location.pathname === "/login"
                    ? "bg-[#89CFF0] text-white"
                    : "text-gray-700 hover:text-[#0D1B2A] hover:bg-gray-50"
                )}
                onClick={() => setIsOpen(false)}
              >
                Login
              </SmartLink>
              <SmartLink
                to="/onboarding"
                className="block px-3 py-2 bg-[#89CFF0] text-white rounded-md text-base font-medium hover:bg-[#7BB8E0] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Start Quiz
              </SmartLink>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}