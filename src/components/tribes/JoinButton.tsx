import React, { useState } from "react";
import { useTribeMembership } from "@/hooks/useTribeMembership";
import { useAddXp } from '@/hooks/useDashboard';
import { UserPlus, UserMinus, Loader, CheckCircle } from "lucide-react";
import { useUser } from "@/context/UserContext";
import Button from "../ui/Button";
import toast from "react-hot-toast";

type Props = { 
  tribeId: string; 
  userId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'ghost';
};

export const JoinButton: React.FC<Props> = ({ 
  tribeId, 
  userId,
  className = '',
  size = 'md',
  variant = 'primary'
}) => {
  const { user, status } = useUser();
  const actualUserId = userId || user?.id;
  const { isMember, onJoin, onLeave, loading } = useTribeMembership(tribeId, actualUserId);
  const addXp = useAddXp();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (!actualUserId || status !== 'authenticated') {
      toast.error("Log in om mee te doen met tribes", {
        id: 'tribe-login-required',
        duration: 3000
      });
      // Redirect to login
      window.location.href = `/inloggen?returnTo=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    
    setBusy(true);
    try {
      if (isMember) { 
        await onLeave();
        toast.success("Je hebt de tribe verlaten", {
          id: `tribe-leave-${tribeId}`,
          duration: 2000
        });
      } else { 
        await onJoin();
        await addXp.mutateAsync({ userId: actualUserId, amount: 10, reason: 'tribe_join' });
        toast.success("Tribe gejoined • +10 XP", {
          id: `tribe-join-${tribeId}`,
          duration: 3000
        });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Actie mislukt";
      
      // Handle specific error cases
      if (errorMessage.includes('Already a member')) {
        toast.error("Je bent al lid van deze tribe", {
          id: `tribe-already-member-${tribeId}`,
          duration: 2000
        });
      } else {
        toast.error(`Actie mislukt: ${errorMessage}`, {
          id: `tribe-error-${tribeId}`,
          duration: 3000
        });
      }
      
      console.error('[JoinButton] Action failed:', e);
    } finally {
      setBusy(false);
    }
  };

  const isLoading = loading || busy;
  const isDisabled = isLoading || status !== 'authenticated';
  
  // Show different states based on membership and loading
  const getButtonContent = () => {
    if (isLoading) {
      return {
        icon: <Loader className="w-4 h-4 animate-spin" />,
        text: "..."
      };
    }
    
    if (isMember) {
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        text: "Joined"
      };
    }
    
    return {
      icon: <UserPlus className="w-4 h-4" />,
      text: "Join Tribe"
    };
  };
  
  const buttonContent = getButtonContent();

  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      variant={isMember ? 'outline' : variant}
      size={size}
      className={`transition-all duration-200 ${
        isMember 
          ? 'border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400' 
          : 'bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]'
      } ${status !== 'authenticated' ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      icon={buttonContent.icon}
      iconPosition="left"
      aria-busy={isLoading}
      aria-label={isMember ? "Lid van tribe" : "Join tribe"}
      title={status !== 'authenticated' ? "Log in om mee te doen" : isMember ? "Je bent lid van deze tribe" : "Word lid van deze tribe"}
    >
      {buttonContent.text}
    </Button>
  );
};