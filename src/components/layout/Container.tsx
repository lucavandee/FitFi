import React from "react";

type Props = {
  className?: string;
  children: React.ReactNode;
};

export const Container = ({ className = "", children }: Props) => {
  return <div className={`ff-container ${className}`}>{children}</div>;
};