import React from "react";

type Props = {
  className?: string;
  children: React.ReactNode;
};

export const Container = ({ className = "", children }: Props) => {
  return <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
};