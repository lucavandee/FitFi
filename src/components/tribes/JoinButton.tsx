import React, { useState } from "react";
import { useTribeMembership } from "@/hooks/useTribeMembership";
import { UserPlus, UserMinus, Loader } from "lucide-react";
import { useUser } from "@/context/UserContext";
import Button from "../ui/Button";
import toast from "react-hot-toast";

type Props = { 
  tribeId: string; 
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'ghost';
};

export const JoinButton: React.FC<Props> = ({ 
  tribeId, 
  className = '',
  size = 'md',
  variant = 'primary'
}) => {
  const { user } = useUser();
  const { isMember, onJoin, onLeave, loading } = useTribeMembership(tribeId, user?.id);
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (!user?.id) {
      toast.error("Log in om mee te doen met tribes");
      return;
    }
    
    setBusy(true);
    try {
      if (isMember) { 
        await onLeave();
        toast.success("Je hebt de tribe verlaten");
      } else { 
        await onJoin();
        toast.success("Welkom in de tribe! 🎉");
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Actie mislukt";
      toast.error(errorMessage);
      console.error('[JoinButton] Action failed:', e);
    } finally {
      setBusy(false);
    }
  };

  const isLoading = loading || busy;
  const isDisabled = isLoading || !user?.id;

  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      variant={isMember ? 'outline' : variant}
      size={size}
      className={`transition-all duration-200 ${
        isMember 
          ? 'border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400' 
          : 'bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]'
      } ${!user?.id ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      icon={
        isLoading ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : isMember ? (
          <UserMinus className="w-4 h-4" />
        ) : (
          <UserPlus className="w-4 h-4" />
        )
      }
      iconPosition="left"
      aria-busy={isLoading}
      aria-label={isMember ? "Verlaat tribe" : "Join tribe"}
    >
      {isLoading ? "..." : isMember ? "Verlaten" : "Join Tribe"}
    </Button>
  );
};