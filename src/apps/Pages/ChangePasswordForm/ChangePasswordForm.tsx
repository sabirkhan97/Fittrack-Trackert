import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { motion } from 'framer-motion';

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmPassword?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!newPassword) newErrors.newPassword = 'New password is required';
    if (!confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expired. Please log in again.');
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Error changing password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border border-gray-200 dark:border-gray-800 shadow-lg rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
            Change Password
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Update your password securely
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Current Password
              </Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`rounded-lg bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 ${
                  errors.currentPassword ? 'border-red-500' : ''
                }`}
                placeholder="Enter current password"
                required
                aria-invalid={!!errors.currentPassword}
                aria-describedby={errors.currentPassword ? 'current-password-error' : undefined}
              />
              {errors.currentPassword && (
                <p id="current-password-error" className="text-sm text-red-500 dark:text-red-400">
                  {errors.currentPassword}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`rounded-lg bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 ${
                  errors.newPassword ? 'border-red-500' : ''
                }`}
                placeholder="Enter new password"
                required
                aria-invalid={!!errors.newPassword}
                aria-describedby={errors.newPassword ? 'new-password-error' : undefined}
              />
              {errors.newPassword && (
                <p id="new-password-error" className="text-sm text-red-500 dark:text-red-400">
                  {errors.newPassword}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`rounded-lg bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 ${
                  errors.confirmPassword ? 'border-red-500' : ''
                }`}
                placeholder="Confirm new password"
                required
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
              />
              {errors.confirmPassword && (
                <p id="confirm-password-error" className="text-sm text-red-500 dark:text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg py-2 flex items-center justify-center gap-2 shadow-md"
            >
              {loading && <Icons.spinner className="w-4 h-4 animate-spin" />}
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}