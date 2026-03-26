/**
 * Validation utility functions
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // Minimum 8 characters, at least one uppercase, one lowercase, and one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

export const validateZipCode = (zipCode: string): boolean => {
  const zipRegex = /^[0-9]{5,6}$/;
  return zipRegex.test(zipCode);
};

export const validateProductData = (product: any): string[] => {
  const errors: string[] = [];

  if (!product.name || product.name.trim() === '') {
    errors.push('Product name is required');
  }

  if (!product.category || product.category.trim() === '') {
    errors.push('Category is required');
  }

  if (!product.price || product.price < 0) {
    errors.push('Valid price is required');
  }

  if (!product.description || product.description.trim() === '') {
    errors.push('Description is required');
  }

  if (product.stock == null || product.stock < 0) {
    errors.push('Valid stock quantity is required');
  }

  return errors;
};
