import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNAuth } from '../contexts/NAuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { ChangePasswordFormProps } from '../types';
import { cn } from '../utils/cn';
import { validatePasswordStrength } from '../utils/validators';

const changePasswordSchema = z
  .object({
    oldPassword: z.string().optional(),
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

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  onSuccess,
  onError,
  className,
}) => {
  const { changePassword, hasPassword } = useNAuth();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userHasPassword, setUserHasPassword] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const password = watch('newPassword');
  const passwordStrength = password ? validatePasswordStrength(password) : null;

  useEffect(() => {
    const checkPassword = async () => {
      try {
        const hasPass = await hasPassword();
        setUserHasPassword(hasPass);
      } catch (error) {
        console.error('Failed to check password status:', error);
      }
    };
    checkPassword();
  }, [hasPassword]);

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    try {
      await changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error('Failed to change password'));
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
          {userHasPassword && (
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="oldPassword"
                  type={showOldPassword ? 'text' : 'password'}
                  placeholder="Enter your current password"
                  className="pr-10"
                  {...register('oldPassword')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.oldPassword && (
                <p className="text-sm text-destructive">{errors.oldPassword.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                className="pr-10"
                {...register('newPassword')}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
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
                Changing password...
              </>
            ) : (
              'Change Password'
            )}
          </Button>
    </form>
  );
};
