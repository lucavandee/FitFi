import { ReactNode } from "react";
import { Link, useInRouterContext } from "react-router-dom";
import { cn } from "@/utils/cn";

type Props = {
  to?: string;          // interne route
  href?: string;        // externe link fallback
  title: string;
  children?: ReactNode;
  className?: string;
};

function SmartLink({ to, href, children, className }: { to?: string; href?: string; children: ReactNode; className?: string }) {
  const inRouter = useInRouterContext();
  if (to && inRouter) return <Link to={to} className={className}>{children}</Link>;
  const url = to || href || "#";
  return <a href={url} className={className}>{children}</a>;
}

// ⚠️ Geen BrowserRouter/Router/RouterProvider hier
export default function StyleCard({ to, href, title, children, className }: Props) {
  return (
    <div className={cn("rounded-2xl p-4 bg-white shadow-sm", className)}>
      <h3 className="font-heading text-xl mb-2">{title}</h3>
      <div className="text-sm text-gray-600 mb-3">{children}</div>
      {(to || href) && (
        <SmartLink to={to} href={href} className="text-accent underline underline-offset-4">
          Bekijk
        </SmartLink>
      )}
    </div>
  );
}