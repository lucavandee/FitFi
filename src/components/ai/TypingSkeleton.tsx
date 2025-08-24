import React from "react";

export default function TypingSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3">
      <div className="w-6 h-6 rounded-full bg-[#ECF7FF]" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-4/5 bg-gray-100 rounded" />
        <div className="h-3 w-3/5 bg-gray-100 rounded" />
      </div>
    </div>
  );
}
