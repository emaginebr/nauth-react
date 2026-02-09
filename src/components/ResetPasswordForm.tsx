import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { useNAuth } from '../contexts/NAuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { ResetPasswordFormProps } from '../types';
import { cn } from '../utils/cn';
import { validatePasswordStrength } from '../utils/validators';

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  recoveryHash,
  onSuccess,
  onError,
  className,
}) => {
  const { resetPassword } = useNAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch('newPassword');
  const passwordStrength = password ? validatePasswordStrength(password) : null;

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!recoveryHash) {
      if (onError) {
        onError(new Error('Invalid recovery link'));
      }
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({
        recoveryHash,
        newPassword: data.newPassword,
      });
      
      setIsSuccess(true);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error('Failed to reset password'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-red-500';
    if (score <= 2) return 'bg-orange-500';
    if (score <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (isSuccess) {
    return (
      <div className={cn('text-center space-y-4', className)}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Password Reset Complete</h2>
          <p className="text-muted-foreground">
            Your password has been successfully reset. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  if (!recoveryHash) {
    return (
      <div className={cn('space-y-6', className)}>
        <div>
          <h2 className="text-2xl font-bold mb-2">Invalid Reset Link</h2>
          <p className="text-muted-foreground">
            This password reset link is invalid or has expired.
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => (window.location.href = '/forgot-password')}
        >
          Request New Link
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                className="pr-10"
                {...register('newPassword')}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {password && passwordStrength && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1 flex-1 rounded-full',
                        i < passwordStrength.score
                          ? getPasswordStrengthColor(passwordStrength.score)
                          : 'bg-muted'
                      )}
                    />
                  ))}
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {passwordStrength.feedback[0]}
                  </p>
                )}
              </div>
            )}
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                className="pr-10"
                {...register('confirmPassword')}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting password...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
    </form>
  );
};
