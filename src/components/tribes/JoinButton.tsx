import React, { useState } from 'react';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useTribeMembership } from '@/hooks/useTribeMembership';
import toast from 'react-hot-toast';

interface JoinButtonProps {
  tribeId: string;
  userId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'ghost';
}

export const JoinButton: React.FC<JoinButtonProps> = ({
  tribeId,
  userId,
  className = '',
  size = 'md',
  variant = 'primary'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { isMember, joinTribe, leaveTribe } = useTribeMembership(tribeId, userId);

  const handleToggleMembership = async () => {
    if (!userId) {
      toast.error('Log in om lid te worden van deze tribe');
      return;
    }

    setIsLoading(true);
    try {
      if (isMember) {
        await leaveTribe();
        toast.success('Je hebt de tribe verlaten');
      } else {
        await joinTribe();
        toast.success('Welkom bij de tribe! 🎉');
      }
    } catch (error) {
      console.error('Membership toggle error:', error);
      toast.error(isMember ? 'Verlaten mislukt' : 'Lid worden mislukt');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId) {
    return (
      <Button
        variant="outline"
        size={size}
        className={`border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white ${className}`}
        disabled
      >
        Log in om lid te worden
      </Button>
    );
  }

  return (
    <Button
      onClick={handleToggleMembership}
      disabled={isLoading}
      variant={isMember ? 'outline' : variant}
      size={size}
      className={className}
      icon={
        isLoading ? (
          <Loader2 className="animate-spin" size={16} />
        ) : isMember ? (
          <UserMinus size={16} />
        ) : (
          <UserPlus size={16} />
        )
      }
      iconPosition="left"
    >
      {isLoading ? 'Bezig...' : isMember ? 'Verlaten' : 'Lid worden'}
    </Button>
  );
};