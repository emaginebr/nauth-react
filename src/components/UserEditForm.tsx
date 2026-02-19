import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Upload, X, Plus, Trash2, MapPin, AlertCircle } from 'lucide-react';
import { useNAuth } from '../contexts/NAuthContext';
import { useNAuthTranslation } from '../i18n';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { UserEditFormProps, RoleInfo, UserInfo } from '../types';
import { cn } from '../utils/cn';
import { validateCPF, validateCNPJ, validatePhone, formatPhone } from '../utils/validators';

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

function createUserEditSchemas(t: (key: string) => string) {
  const phoneSchema = z.object({
    phone: z.string().min(10, t('validation.phoneMinDigits')).refine(validatePhone, {
      message: t('validation.phoneInvalid'),
    }),
  });

  const addressSchema = z.object({
    zipCode: z.string().min(8, t('validation.zipCodeLength')).max(8, t('validation.zipCodeLength')),
    address: z.string().min(3, t('validation.addressMinLength')),
    complement: z.string().min(1, t('validation.complementRequired')),
    neighborhood: z.string().min(2, t('validation.neighborhoodMinLength')),
    city: z.string().min(2, t('validation.cityMinLength')),
    state: z.string().length(2, t('validation.stateLength')),
  });

  const baseSchema = z.object({
    name: z.string().min(2, t('validation.nameMinLength')).max(100, t('validation.nameMaxLength')),
    email: z.string().email(t('validation.emailInvalid')),
    password: z.string().optional(),
    status: z.number().int().min(1).max(4),
    isAdmin: z.boolean(),
    birthDate: z.string().optional().nullable(),
    idDocument: z.string().optional().refine((val) => {
      if (!val || val.length === 0) return true;
      const cleaned = val.replace(/[^\d]/g, '');
      return validateCPF(cleaned) || validateCNPJ(cleaned);
    }, {
      message: t('validation.invalidCpfCnpj'),
    }),
    pixKey: z.string().optional(),
    selectedRoleIds: z.array(z.number()).min(1, t('validation.rolesRequired')),
    phones: z.array(phoneSchema).optional(),
    addresses: z.array(addressSchema).optional(),
  });

  const createSchema = baseSchema.extend({
    password: z
      .string()
      .min(8, t('validation.passwordMinLength'))
      .regex(/[A-Z]/, t('validation.passwordUppercase'))
      .regex(/[a-z]/, t('validation.passwordLowercase'))
      .regex(/[0-9]/, t('validation.passwordNumber')),
  });

  return { baseSchema, createSchema };
}

type UserEditFormData = z.infer<ReturnType<typeof createUserEditSchemas>['baseSchema']>;

export const UserEditForm: React.FC<UserEditFormProps> = ({
  userId,
  onSuccess,
  onError,
  onCancel,
  className,
}) => {
  const { getUserById, updateUser, createUser, uploadImage, fetchRoles } = useNAuth();
  const { t } = useNAuthTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableRoles, setAvailableRoles] = useState<RoleInfo[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const isEditMode = userId !== undefined && userId > 0;

  const { baseSchema, createSchema } = useMemo(() => createUserEditSchemas(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm<UserEditFormData>({
    resolver: zodResolver(isEditMode ? baseSchema : createSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      status: 1,
      isAdmin: false,
      birthDate: '',
      idDocument: '',
      pixKey: '',
      selectedRoleIds: [],
      phones: [],
      addresses: [],
    },
  });

  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({
    control,
    name: 'phones',
  });

  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress,
  } = useFieldArray({
    control,
    name: 'addresses',
  });

  const selectedRoleIds = watch('selectedRoleIds');

  useEffect(() => {
    const loadRoles = async () => {
      setIsLoadingRoles(true);
      try {
        const roles = await fetchRoles();
        setAvailableRoles(roles);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('userEdit.failedToLoadRoles');
        setError(errorMessage);
        if (onError) {
          onError(err instanceof Error ? err : new Error(errorMessage));
        }
      } finally {
        setIsLoadingRoles(false);
      }
    };

    loadRoles();
  }, [fetchRoles, onError, t]);

  useEffect(() => {
    if (isEditMode) {
      const loadUser = async () => {
        setIsLoadingUser(true);
        setError(null);

        try {
          const user = await getUserById(userId);

          setValue('name', user.name || '');
          setValue('email', user.email || '');
          setValue('status', user.status || 1);
          setValue('isAdmin', user.isAdmin || false);
          setValue('birthDate', user.birthDate ? user.birthDate.split('T')[0] : '');
          setValue('idDocument', user.idDocument || '');
          setValue('pixKey', user.pixKey || '');
          setValue('selectedRoleIds', user.roles?.map(r => r.roleId) || []);

          if (user.imageUrl) {
            setImageUrl(user.imageUrl);
            setImagePreview(user.imageUrl);
          }

          if (user.phones && user.phones.length > 0) {
            setValue('phones', user.phones.map(p => ({ phone: p.phone })));
          }

          if (user.addresses && user.addresses.length > 0) {
            setValue('addresses', user.addresses.map(a => ({
              zipCode: a.zipCode,
              address: a.address,
              complement: a.complement || '',
              neighborhood: a.neighborhood,
              city: a.city,
              state: a.state,
            })));
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : t('userEdit.failedToLoadUser');
          setError(errorMessage);
          if (onError) {
            onError(err instanceof Error ? err : new Error(errorMessage));
          }
        } finally {
          setIsLoadingUser(false);
        }
      };

      loadUser();
    }
  }, [userId, isEditMode, setValue, onError, getUserById, t]);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(t('userEdit.selectImageFile'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t('userEdit.imageTooLarge'));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploadingImage(true);
    setError(null);

    try {
      const uploadedUrl = await uploadImage(file);
      setImageUrl(uploadedUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('userEdit.failedToUploadImage');
      setError(errorMessage);
      setImagePreview(null);
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImageUrl('');
    setImagePreview(null);
  };

  const handleRoleToggle = (roleId: number) => {
    const currentRoles = selectedRoleIds || [];
    const newRoles = currentRoles.includes(roleId)
      ? currentRoles.filter(id => id !== roleId)
      : [...currentRoles, roleId];
    setValue('selectedRoleIds', newRoles);
  };

  const formatIdDocument = (value: string): string => {
    const cleaned = value.replace(/[^\d]/g, '');

    if (cleaned.length <= 11) {
      return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      return cleaned
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
  };

  const formatCEP = (value: string): string => {
    const cleaned = value.replace(/[^\d]/g, '');
    return cleaned.replace(/(\d{5})(\d{1,3})/, '$1-$2');
  };

  const onSubmit = async (data: UserEditFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload: Partial<UserInfo> = {
        userId: isEditMode ? userId : 0,
        slug: '',
        imageUrl: imageUrl,
        name: data.name,
        email: data.email,
        hash: '',
        isAdmin: data.isAdmin,
        birthDate: data.birthDate || '',
        idDocument: data.idDocument || '',
        pixKey: data.pixKey || '',
        password: isEditMode ? '' : data.password || '',
        status: data.status,
        roles: data.selectedRoleIds.map(roleId => ({
          roleId: roleId,
          slug: '',
          name: '',
        })),
        phones: data.phones?.map(p => ({ phone: p.phone.replace(/[^\d]/g, '') })) || [],
        addresses: data.addresses?.map(a => ({
          zipCode: a.zipCode.replace(/[^\d]/g, ''),
          address: a.address,
          complement: a.complement,
          neighborhood: a.neighborhood,
          city: a.city,
          state: a.state,
        })) || [],
        createAt: new Date().toISOString(),
        updateAt: new Date().toISOString(),
      };

      const result = isEditMode ? await updateUser(payload) : await createUser(payload);

      if (onSuccess) {
        onSuccess(result);
      }

      if (!isEditMode) {
        reset();
        setImageUrl('');
        setImagePreview(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : isEditMode ? t('userEdit.failedToUpdateUser') : t('userEdit.failedToCreateUser');
      setError(errorMessage);
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleReset = () => {
    reset();
    setImageUrl('');
    setImagePreview(null);
    setError(null);
  };

  if (isLoadingUser || isLoadingRoles) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Basic Information and User Image */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('userEdit.basicInformation')}</h3>

          <div className="space-y-2">
            <Label htmlFor="name">
              {t('common.name')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder={t('userEdit.namePlaceholder')}
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              {t('common.email')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t('userEdit.emailPlaceholder')}
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="password">
                {t('common.password')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={t('userEdit.passwordPlaceholder')}
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {t('userEdit.passwordHint')}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="status">
              {t('userEdit.statusLabel')} <span className="text-destructive">*</span>
            </Label>
            <select
              id="status"
              {...register('status', { valueAsNumber: true })}
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value={1}>{t('status.active')}</option>
              <option value={2}>{t('status.inactive')}</option>
              <option value={3}>{t('status.suspended')}</option>
              <option value={4}>{t('status.blocked')}</option>
            </select>
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="isAdmin"
              type="checkbox"
              {...register('isAdmin')}
              disabled={isLoading}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="isAdmin" className="font-normal cursor-pointer">
              {t('userEdit.isAdministrator')}
            </Label>
          </div>
        </div>

        {/* User Image */}
        <div className="col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('userEdit.userImage')}</h3>
          <div className="flex flex-col items-center gap-4">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="User preview"
                  className="h-32 w-32 rounded-full object-cover border-2 border-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={removeImage}
                  disabled={uploadingImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
            )}
            <div className="w-full">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={uploadingImage || isLoading}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
                {t('userEdit.imageMaxSize')}
              </p>
            </div>
          </div>
          {uploadingImage && (
            <div className="flex flex-col items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t('userEdit.uploading')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('userEdit.personalInformation')}</h3>

        <div className="space-y-2">
          <Label htmlFor="birthDate">{t('userEdit.birthDate')}</Label>
          <Input
            id="birthDate"
            type="date"
            {...register('birthDate')}
            disabled={isLoading}
          />
          {errors.birthDate && (
            <p className="text-sm text-destructive">{errors.birthDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="idDocument">{t('userEdit.idDocument')}</Label>
          <Input
            id="idDocument"
            placeholder={t('userEdit.idDocumentPlaceholder')}
            {...register('idDocument')}
            onChange={(e) => {
              const formatted = formatIdDocument(e.target.value);
              e.target.value = formatted;
            }}
            disabled={isLoading}
            maxLength={18}
          />
          {errors.idDocument && (
            <p className="text-sm text-destructive">{errors.idDocument.message}</p>
          )}
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {t('userEdit.idDocumentHint')}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pixKey">{t('userEdit.pixKey')}</Label>
          <Input
            id="pixKey"
            placeholder={t('userEdit.pixKeyPlaceholder')}
            {...register('pixKey')}
            disabled={isLoading}
          />
          {errors.pixKey && (
            <p className="text-sm text-destructive">{errors.pixKey.message}</p>
          )}
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {t('userEdit.pixKeyHint')}
          </p>
        </div>
      </div>

      {/* Roles */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('userEdit.rolesSection')} <span className="text-destructive">*</span>
        </h3>
        <div className="space-y-2">
          {availableRoles.map((role) => (
            <div key={role.roleId} className="flex items-center space-x-2">
              <input
                id={`role-${role.roleId}`}
                type="checkbox"
                checked={selectedRoleIds?.includes(role.roleId)}
                onChange={() => handleRoleToggle(role.roleId)}
                disabled={isLoading}
                className="h-4 w-4 rounded border-input"
              />
              <Label
                htmlFor={`role-${role.roleId}`}
                className="font-normal cursor-pointer"
              >
                {role.name}
              </Label>
            </div>
          ))}
        </div>
        {errors.selectedRoleIds && (
          <p className="text-sm text-destructive">{errors.selectedRoleIds.message}</p>
        )}
      </div>

      {/* Phone Numbers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('userEdit.phoneNumbers')}</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendPhone({ phone: '' })}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-1" />
            {t('userEdit.addPhone')}
          </Button>
        </div>

        {phoneFields.length === 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('userEdit.noPhones')}</p>
        )}

        {phoneFields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-start">
            <div className="flex-1 space-y-2">
              <Label htmlFor={`phone-${index}`} className="text-gray-700 dark:text-gray-300">
                {t('userEdit.phoneLabel', { index: index + 1 })}
              </Label>
              <Input
                id={`phone-${index}`}
                placeholder={t('userEdit.phonePlaceholder')}
                {...register(`phones.${index}.phone`)}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  e.target.value = formatted;
                }}
                disabled={isLoading}
                maxLength={15}
              />
              {errors.phones?.[index]?.phone && (
                <p className="text-sm text-destructive">
                  {errors.phones[index]?.phone?.message}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removePhone(index)}
              disabled={isLoading}
              className="mt-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Addresses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('userEdit.addresses')}</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendAddress({
                zipCode: '',
                address: '',
                complement: '',
                neighborhood: '',
                city: '',
                state: '',
              })
            }
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-1" />
            {t('userEdit.addAddress')}
          </Button>
        </div>

        {addressFields.length === 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('userEdit.noAddresses')}</p>
        )}

        {addressFields.map((field, index) => (
          <div key={field.id} className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <MapPin className="h-4 w-4" />
                {t('userEdit.addressLabel', { index: index + 1 })}
              </h4>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeAddress(index)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`address-${index}-zipCode`}>{t('userEdit.zipCode')}</Label>
                <Input
                  id={`address-${index}-zipCode`}
                  placeholder={t('userEdit.zipCodePlaceholder')}
                  {...register(`addresses.${index}.zipCode`)}
                  onChange={(e) => {
                    const formatted = formatCEP(e.target.value);
                    e.target.value = formatted;
                  }}
                  disabled={isLoading}
                  maxLength={9}
                />
                {errors.addresses?.[index]?.zipCode && (
                  <p className="text-sm text-destructive">
                    {errors.addresses[index]?.zipCode?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`address-${index}-state`}>{t('userEdit.state')}</Label>
                <select
                  id={`address-${index}-state`}
                  {...register(`addresses.${index}.state`)}
                  disabled={isLoading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">{t('userEdit.selectState')}</option>
                  {BRAZILIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.addresses?.[index]?.state && (
                  <p className="text-sm text-destructive">
                    {errors.addresses[index]?.state?.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`address-${index}-address`}>{t('userEdit.addressField')}</Label>
              <Input
                id={`address-${index}-address`}
                placeholder={t('userEdit.addressPlaceholder')}
                {...register(`addresses.${index}.address`)}
                disabled={isLoading}
              />
              {errors.addresses?.[index]?.address && (
                <p className="text-sm text-destructive">
                  {errors.addresses[index]?.address?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`address-${index}-complement`}>{t('userEdit.complement')}</Label>
              <Input
                id={`address-${index}-complement`}
                placeholder={t('userEdit.complementPlaceholder')}
                {...register(`addresses.${index}.complement`)}
                disabled={isLoading}
              />
              {errors.addresses?.[index]?.complement && (
                <p className="text-sm text-destructive">
                  {errors.addresses[index]?.complement?.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`address-${index}-neighborhood`}>{t('userEdit.neighborhood')}</Label>
                <Input
                  id={`address-${index}-neighborhood`}
                  placeholder={t('userEdit.neighborhoodPlaceholder')}
                  {...register(`addresses.${index}.neighborhood`)}
                  disabled={isLoading}
                />
                {errors.addresses?.[index]?.neighborhood && (
                  <p className="text-sm text-destructive">
                    {errors.addresses[index]?.neighborhood?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`address-${index}-city`}>{t('userEdit.city')}</Label>
                <Input
                  id={`address-${index}-city`}
                  placeholder={t('userEdit.cityPlaceholder')}
                  {...register(`addresses.${index}.city`)}
                  disabled={isLoading}
                />
                {errors.addresses?.[index]?.city && (
                  <p className="text-sm text-destructive">
                    {errors.addresses[index]?.city?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Required Fields Note */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        <span className="text-destructive">*</span> {t('common.requiredFields')}
      </p>

      {/* Form Actions */}
      <div className="flex gap-2 justify-end pt-4 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
        )}

        {!isEditMode && (
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
          >
            {t('common.reset')}
          </Button>
        )}

        <Button type="submit" disabled={isLoading || uploadingImage}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? t('userEdit.updateUser') : t('userEdit.createUser')}
        </Button>
      </div>
    </form>
  );
};
