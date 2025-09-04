import { ReactNode } from "react";
import { Link, useInRouterContext } from "react-router-dom";
import { cn } from "@/utils/cn";

function SmartLink({ to, href, children, className }: { to?: string; href?: string; children: ReactNode; className?: string; }) {
  const inRouter = useInRouterContext();
  if (to && inRouter) return <Link to={to} className={className}>{children}</Link>;
  return <a href={to || href || "#"} className={className}>{children}</a>;
}

type Props = {
  to?: string;          // interne route
  href?: string;        // externe link fallback
  title: string;
  children?: ReactNode;
  className?: string;
};

function SmartLink({ to, href, children, className }: { to?: string; href?: string; children: ReactNode; className?: string }) {
  if (to) return <Link to={to} className={className}>{children}</Link>;
  const url = to || href || "#";
    <div
      className={cn(
        "bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105",
        className
      )}
      onClick={onClick}
    >
      <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      )}
    </div>
  );
}
}