import React from "react";
import { cn } from "@/utils/cn";

type SectionProps = React.HTMLAttributes<HTMLDivElement>;

function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return <div className={cn("bg-surface border border-border rounded-lg shadow-md", className)} {...rest} />;
}

function CardHeader({ className, ...rest }: SectionProps) {
  return <div className={cn("px-5 pt-5 pb-3", className)} {...rest} />;
}

function CardContent({ className, ...rest }: SectionProps) {
  return <div className={cn("px-5 pb-5", className)} {...rest} />;
}

function CardFooter({ className, ...rest }: SectionProps) {
  return <div className={cn("px-5 pb-5 pt-3 border-t border-border", className)} {...rest} />;
}

const _Card = Object.assign(Card, { Header: CardHeader, Content: CardContent, Footer: CardFooter });
export default _Card;