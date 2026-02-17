import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNAuth } from '../contexts/NAuthContext';
import { useNAuthTranslation } from '../i18n';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { LoginFormProps } from '../types';
import { cn } from '../utils/cn';

type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

function createLoginSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email(t('validation.emailInvalid')),
    password: z.string().min(1, t('validation.passwordRequired')),
  });
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  showRememberMe = false,
  customSubmitText,
  className,
  styles = {},
}) => {
  const { login } = useNAuth();
  const { t } = useNAuthTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginSchema = useMemo(() => createLoginSchema(t), [t]);

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
        <Label htmlFor="email">{t('common.email')}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t('login.emailPlaceholder')}
          className={styles.input}
          {...register('email')}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t('common.password')}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('login.passwordPlaceholder')}
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
            {t('login.rememberMe')}
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
            {t('login.signingIn')}
          </>
        ) : (
          customSubmitText || t('login.signIn')
        )}
      </Button>
    </form>
  );
};
