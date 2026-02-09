/**
 * Validate CPF (Brazilian individual taxpayer registry)
 */
export function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;

  return true;
}

/**
 * Validate CNPJ (Brazilian company taxpayer registry)
 */
export function validateCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  const digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
}

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Brazilian phone number
 */
export function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  // Brazilian phone: 10 or 11 digits (with area code)
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

/**
 * Format phone number to Brazilian format
 */
export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  if (cleanPhone.length === 11) {
    // (99) 99999-9999
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 10) {
    // (99) 9999-9999
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

/**
 * Format document (CPF or CNPJ)
 */
export function formatDocument(document: string): string {
  const cleanDoc = document.replace(/[^\d]/g, '');
  
  if (cleanDoc.length === 11) {
    // CPF: 999.999.999-99
    return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (cleanDoc.length === 14) {
    // CNPJ: 99.999.999/9999-99
    return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return document;
}

/**
 * Format ZIP code (CEP)
 */
export function formatZipCode(zipCode: string): string {
  const cleanZip = zipCode.replace(/[^\d]/g, '');
  
  if (cleanZip.length === 8) {
    // 99999-999
    return cleanZip.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  
  return zipCode;
}

/**
 * Validate password strength
 */
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

export function validatePasswordStrength(
  password: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  } = {}
): PasswordStrength {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
  } = options;

  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length < minLength) {
    feedback.push(`Password must be at least ${minLength} characters long`);
  } else {
    score++;
    if (password.length >= 12) score++;
  }

  // Uppercase check
  if (requireUppercase && !/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  } else if (/[A-Z]/.test(password)) {
    score++;
  }

  // Lowercase check
  if (requireLowercase && !/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  } else if (/[a-z]/.test(password)) {
    score++;
  }

  // Numbers check
  if (requireNumbers && !/\d/.test(password)) {
    feedback.push('Password must contain at least one number');
  } else if (/\d/.test(password)) {
    score++;
  }

  // Special characters check
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Password must contain at least one special character');
  } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++;
  }

  const isValid = feedback.length === 0;

  return { score: Math.min(score, 4), feedback, isValid };
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
