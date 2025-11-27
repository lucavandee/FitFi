import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { OAuthService } from '@/services/auth/oauthService';

interface SocialLoginButtonsProps {
  onSuccess?: () => void;
  mode?: 'login' | 'register';
}

export function SocialLoginButtons({ onSuccess, mode = 'register' }: SocialLoginButtonsProps) {
  return null;
}
