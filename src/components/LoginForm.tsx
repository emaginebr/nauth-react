import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNAuth } from '../contexts/NAuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { LoginFormProps } from '../types';
import { cn } from '../utils/cn';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  showRememberMe = false,
  customSubmitText = 'Sign In',
  className,
  styles = {},
}) => {
  const { login } = useNAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const user = await login(data);

      if (onSuccess) {
        onSuccess(user);
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error('Login failed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', styles.container, className)}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          className={styles.input}
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
            placeholder="Enter your password"
            className={cn('pr-10', styles.input)}
            {...register('password')}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {showRememberMe && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="remember"
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="remember" className="text-sm font-normal">
            Remember me
          </Label>
        </div>
      )}

      <Button
        type="submit"
        className={cn('w-full', styles.button)}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          customSubmitText
        )}
      </Button>
    </form>
  );
};
