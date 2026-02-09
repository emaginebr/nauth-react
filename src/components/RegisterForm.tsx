import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNAuth } from '../contexts/NAuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { RegisterFormProps } from '../types';
import { cn } from '../utils/cn';
import { validatePasswordStrength } from '../utils/validators';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onError,
  className,
}) => {
  const { register: registerUser } = useNAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');
  const passwordStrength = password ? validatePasswordStrength(password) : null;

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const registerData = {
        name: data.name,
        email: data.email,
        password: data.password,
      };

      const user = await registerUser(registerData);
      
      if (onSuccess) {
        onSuccess(user);
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error('Registration failed'));
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
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                className="pr-10"
                {...register('password')}
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
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
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
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
    </form>
  );
};
