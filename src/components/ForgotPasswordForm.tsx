import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { useNAuth } from '../contexts/NAuthContext';
import { useNAuthTranslation } from '../i18n';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { ForgotPasswordFormProps } from '../types';
import { cn } from '../utils/cn';

function createForgotPasswordSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email(t('validation.emailInvalid')),
  });
}

type ForgotPasswordFormData = z.infer<ReturnType<typeof createForgotPasswordSchema>>;

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSuccess,
  onError,
  className,
}) => {
  const { sendRecoveryEmail } = useNAuth();
  const { t } = useNAuthTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const forgotPasswordSchema = useMemo(() => createForgotPasswordSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await sendRecoveryEmail(data.email);
      setIsSuccess(true);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error('Failed to send recovery email'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={cn('text-center space-y-6', className)}>
        <div className="space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">{t('forgotPassword.checkYourEmail')}</h2>
            <p className="text-muted-foreground">
              {t('forgotPassword.recoverySent')}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('forgotPassword.didntReceive')}
        </p>
        <div className="flex flex-col space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsSuccess(false)}
          >
            {t('forgotPassword.tryAnotherEmail')}
          </Button>
          <a href="/login" className="text-sm text-primary hover:underline">
            {t('forgotPassword.backToLogin')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <Label htmlFor="email">{t('forgotPassword.emailAddress')}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder={t('forgotPassword.emailPlaceholder')}
            className="pl-10"
            {...register('email')}
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
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
            {t('forgotPassword.sending')}
          </>
        ) : (
          t('forgotPassword.sendRecoveryEmail')
        )}
      </Button>
    </form>
  );
};
