import React from "react";

type Props = {
  className?: string;
  children: React.ReactNode;
};

function Root({ className = "", children }: Props) {
  return <div className={`ff-card ${className}`}>{children}</div>;
        'bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-soft)]',

function Header({ className = "", children }: Props) {
  return (
    <div className={`px-5 py-4 flex items-center justify-between border-b border-white/10 ${className}`}>
      {children}
    </div>
  );
}

function Body({ className = "", children }: Props) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}

function Footer({ className = "", children }: Props) {
  return <div className={`px-5 py-4 border-t border-white/10 ${className}`}>{children}</div>;
}

const Card = Object.assign(Root, { Header, Body, Footer });
export default Card;