import { toast } from "sonner";
import type { ReactNode } from "react";

export const showToast = {
  success: (message: string) => {
    toast.success(message);
  },
  
  error: (message: string) => {
    toast.error(message);
  },
  
  custom: (content: React.ReactNode) => {
    toast.custom((t: any): ReactNode => (
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-md">
        {content}
      </div>
    ));
  },

  xp: (points: number, message?: string) => {
    toast.custom((t: any): ReactNode => (
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-lg p-4 max-w-md flex items-center gap-3">
        <div className="text-2xl">✨</div>
        <div>
          <div className="font-bold">+{points} XP</div>
          {message && <div className="text-sm opacity-90">{message}</div>}
        </div>
      </div>
    ));
  }
};