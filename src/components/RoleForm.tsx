import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, AlertCircle } from 'lucide-react';
import { useNAuth } from '../contexts/NAuthContext';
import { useNAuthTranslation } from '../i18n';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { RoleFormProps } from '../types';
import { cn } from '../utils/cn';

function createRoleSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(1, t('validation.roleNameRequired')),
    slug: z.string().optional(),
  });
}

type RoleFormData = z.infer<ReturnType<typeof createRoleSchema>>;

export const RoleForm: React.FC<RoleFormProps> = ({
  roleId,
  onSuccess,
  onError,
  onCancel,
  className,
}) => {
  const { user, getRoleById, createRole, updateRole } = useNAuth();
  const { t } = useNAuthTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRole, setIsLoadingRole] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = roleId !== undefined && roleId > 0;

  const roleSchema = useMemo(() => createRoleSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  const nameValue = watch('name');
  const slugValue = watch('slug');

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  useEffect(() => {
    if (isEditMode) {
      const loadRole = async () => {
        setIsLoadingRole(true);
        setError(null);

        try {
          const data = await getRoleById(roleId);
          setValue('name', data.name);
          setValue('slug', data.slug);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : t('roles.failedToLoadRole');
          setError(errorMessage);
          if (onError) {
            onError(err instanceof Error ? err : new Error(errorMessage));
          }
        } finally {
          setIsLoadingRole(false);
        }
      };

      loadRole();
    }
  }, [roleId, isEditMode, setValue, onError, getRoleById, t]);

  const onSubmit = async (data: RoleFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        roleId: isEditMode ? roleId : 0,
        name: data.name,
        slug: data.slug || '',
      };

      const result = isEditMode
        ? await updateRole(payload)
        : await createRole(payload);

      if (onSuccess) {
        onSuccess(result);
      }

      if (!isEditMode) {
        reset();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('roles.failedToSaveRole');
      setError(errorMessage);
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setError(null);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const isAdmin = user?.isAdmin ?? false;

  if (!isAdmin) {
    return (
      <div className={cn('flex items-center gap-2 text-destructive', className)}>
        <AlertCircle size={20} />
        <p>{t('roles.permissionDeniedManage')}</p>
      </div>
    );
  }

  if (isLoadingRole) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  const previewSlug = slugValue || generateSlug(nameValue);

  return (
    <div className={cn('space-y-6', className)}>
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 flex items-center gap-2">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">
            {t('roles.roleName')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder={t('roles.enterRoleName')}
            {...register('name')}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">
            {t('roles.slugLabel')} <span className="text-sm text-muted-foreground">{t('roles.slugOptional')}</span>
          </Label>
          <Input
            id="slug"
            type="text"
            placeholder={t('roles.slugPlaceholder')}
            {...register('slug')}
            disabled={isLoading}
          />
          {errors.slug && (
            <p className="text-sm text-destructive">{errors.slug.message}</p>
          )}
          {previewSlug && (
            <p className="text-sm text-muted-foreground">
              {t('roles.slugPreview')} <span className="font-mono">{previewSlug}</span>
            </p>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          <span className="text-destructive">*</span> {t('common.requiredFields')}
        </p>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                {t('common.cancel')}
              </Button>
            )}
            {!isEditMode && (
              <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading}>
                {t('common.reset')}
              </Button>
            )}
          </div>
          <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
            {isLoading && <Loader2 className="animate-spin" size={16} />}
            {isEditMode ? t('roles.updateRole') : t('roles.createRole')}
          </Button>
        </div>
      </form>
    </div>
  );
};
