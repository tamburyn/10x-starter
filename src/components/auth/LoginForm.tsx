import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { SignInData } from '../../lib/auth';

interface LoginFormProps {
  onSubmit: (data: SignInData) => Promise<{ success: boolean; error?: string }>;
  isLoading?: boolean;
  className?: string;
}

export function LoginForm({ onSubmit, isLoading = false, className }: LoginFormProps) {
  const [formData, setFormData] = useState<SignInData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<SignInData>>({});
  const [submitError, setSubmitError] = useState<string>('');

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<SignInData> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email jest wymagany';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Nieprawidłowy format email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Hasło jest wymagane';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((field: keyof SignInData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear submit error
    if (submitError) {
      setSubmitError('');
    }
  }, [errors, submitError]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await onSubmit(formData);
      
      if (!result.success && result.error) {
        setSubmitError(result.error);
      }
    } catch (error) {
      setSubmitError('Nieoczekiwany błąd podczas logowania');
      console.error('Login error:', error);
    }
  }, [formData, validateForm, onSubmit]);

  return (
    <Card className={className}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Logowanie</CardTitle>
        <CardDescription className="text-center">
          Wprowadź swoje dane, aby uzyskać dostęp do platformy B2B
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Adres email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nazwa@firma.pl"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'border-red-500' : ''}
              disabled={isLoading}
              required
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              type="password"
              placeholder="Wprowadź hasło"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={errors.password ? 'border-red-500' : ''}
              disabled={isLoading}
              required
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Logowanie...' : 'Zaloguj się'}
          </Button>
          
          <div className="text-center text-sm text-gray-600">
            Nie masz konta?{' '}
            <a 
              href="/register" 
              className="text-blue-600 hover:text-blue-500 font-medium hover:underline"
            >
              Zarejestruj się
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
} 