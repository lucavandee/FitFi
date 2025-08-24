import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@/context/UserContext";

type Props = {
  children: React.ReactNode;
  cta?: string;
  className?: string;
};

export default function RequireAuth({
  children,
  cta = "Inloggen om verder te gaan",
  className,
}: Props) {
  const { user } = useUser();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  if (user) return <>{children}</>;

  const goLogin = () => {
    const returnTo = `${pathname}${search}`;
    navigate(`/inloggen?returnTo=${encodeURIComponent(returnTo)}`);
  };

  return (
    <button
      type="button"
      onClick={goLogin}
      className={
        className ??
        "btn-outline px-3 py-2 border border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white rounded-xl text-xs font-medium transition-colors"
      }
      aria-label="Inloggen vereist"
      title="Inloggen vereist"
    >
      {cta}
    </button>
  );
}
