import React from "react";

type Props = {
  className?: string;
  children: React.ReactNode;
};

export default function Container({ className = "", children }: Props) {
  return <div className={`ff-container ${className}`}>{children}</div>;
}