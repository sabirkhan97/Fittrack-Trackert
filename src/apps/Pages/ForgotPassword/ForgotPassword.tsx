import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Key, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { requestReset, verifyResetCode, resetPassword, resetLogin } from '@/api/authApi';

const emailSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

const codeSchema = z.object({
  code: z.string().min(6, { message: 'OTP must be 6 digits' }).max(6, { message: 'OTP must be 6 digits' }),
});

const passwordSchema = z.object({
  newPassword: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'verify' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const handleRequestReset = async (values: z.infer<typeof emailSchema>) => {
    setIsLoading(true);
    try {
      await requestReset(values.email);
      setEmail(values.email);
      setStep('verify');
      toast.success('OTP sent successfully', {
        description: 'Check your email for the 6-digit verification code',
        position: 'top-center',
      });
    } catch (err: any) {
      toast.error('Failed to send OTP', {
        description: err.response?.data?.error || 'Please try again later',
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (values: z.infer<typeof codeSchema>) => {
    setIsLoading(true);
    try {
      await verifyResetCode(email, values.code);
      setCode(values.code);
      setStep('reset');
      toast.success('OTP verified', {
        description: 'You can now reset your password',
        position: 'top-center',
      });
    } catch (err: any) {
      toast.error('Verification failed', {
        description: err.response?.data?.error || 'Invalid OTP code',
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (values: z.infer<typeof passwordSchema>) => {
    setIsLoading(true);
    try {
      await resetPassword(email, code, values.newPassword);
      toast.success('Password reset successfully', {
        description: 'You can now login with your new password',
        position: 'top-center',
      });
      navigate('/login');
    } catch (err: any) {
      toast.error('Reset failed', {
        description: err.response?.data?.error || 'Please try again',
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetLogin = async () => {
    setIsLoading(true);
    try {
      const res = await resetLogin(email, code);
      localStorage.setItem('token', res.data.token);
      toast.success('Logged in successfully', {
        position: 'top-center',
      });
      navigate('/dashboard');
    } catch (err: any) {
      toast.error('Login failed', {
        description: err.response?.data?.error || 'Please try resetting your password',
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-900"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="border border-slate-200 dark:border-slate-700 shadow-md rounded-xl bg-white/90 dark:bg-slate-800/90">
            <CardHeader className="text-center space-y-2 px-4 sm:px-6">
              <motion.div
                className="flex justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Key className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
              </motion.div>
              <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {step === 'email' && 'Reset Your Password'}
                {step === 'verify' && 'Verify Your Email'}
                {step === 'reset' && 'Create New Password'}
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300 text-sm">
                {step === 'email' && 'Enter your email to receive a verification code'}
                {step === 'verify' && `We sent a code to ${email}`}
                {step === 'reset' && 'Set a new password for your account'}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-4 sm:px-6 py-4">
              {step === 'email' && (
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(handleRequestReset)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300">
                            <Mail className="w-4 h-4 mr-2" />
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="your@email.com"
                              type="email"
                              autoComplete="email"
                              className="rounded-lg bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 py-2 text-sm transition-all focus:ring-2 focus:ring-indigo-500"
                              aria-label="Email address"
                              aria-describedby={emailForm.formState.errors.email ? 'email-error' : undefined}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-sm text-red-500 dark:text-red-400" id="email-error" />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className={cn(
                        'w-full bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-400 dark:hover:bg-indigo-500 text-white rounded-lg py-2 text-sm font-semibold transition-all',
                        isLoading && 'opacity-70'
                      )}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <Icons.send className="mr-2 h-4 w-4" />
                          Send Reset Code
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}

              {step === 'verify' && (
                <Form {...codeForm}>
                  <form onSubmit={codeForm.handleSubmit(handleVerifyCode)} className="space-y-4">
                    <FormField
                      control={codeForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300">
                            <Icons.key className="w-4 h-4 mr-2" />
                            Verification Code
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="123456"
                              maxLength={6}
                              className="rounded-lg bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 py-2 text-sm text-center font-mono tracking-widest transition-all focus:ring-2 focus:ring-indigo-500"
                              aria-label="Verification code"
                              aria-describedby={codeForm.formState.errors.code ? 'code-error' : undefined}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-sm text-red-500 dark:text-red-400" id="code-error" />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className={cn(
                        'w-full bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-400 dark:hover:bg-indigo-500 text-white rounded-lg py-2 text-sm font-semibold transition-all',
                        isLoading && 'opacity-70'
                      )}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Code'
                      )}
                    </Button>
                    <Button
                      variant="link"
                      className="w-full text-sm text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                      onClick={() => setStep('email')}
                      disabled={isLoading}
                    >
                      Back to Email
                    </Button>
                  </form>
                </Form>
              )}

              {step === 'reset' && (
                <div className="space-y-4">
                  <Button
                    onClick={handleResetLogin}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-400 dark:hover:bg-indigo-500 text-white rounded-lg py-2 text-sm font-semibold transition-all"
                    disabled={isLoading}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Login Without Password
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white/90 dark:bg-slate-800/90 px-2 text-slate-600 dark:text-slate-300">
                        Or reset password
                      </span>
                    </div>
                  </div>

                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(handleResetPassword)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300">
                              <Lock className="w-4 h-4 mr-2" />
                              New Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="At least 8 characters"
                                className="rounded-lg bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 py-2 text-sm transition-all focus:ring-2 focus:ring-indigo-500"
                                aria-label="New password"
                                aria-describedby={passwordForm.formState.errors.newPassword ? 'new-password-error' : undefined}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-sm text-red-500 dark:text-red-400" id="new-password-error" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300">
                              <Lock className="w-4 h-4 mr-2" />
                              Confirm Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Re-enter your password"
                                className="rounded-lg bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 py-2 text-sm transition-all focus:ring-2 focus:ring-indigo-500"
                                aria-label="Confirm password"
                                aria-describedby={passwordForm.formState.errors.confirmPassword ? 'confirm-password-error' : undefined}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-sm text-red-500 dark:text-red-400" id="confirm-password-error" />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className={cn(
                          'w-full bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-400 dark:hover:bg-indigo-500 text-white rounded-lg py-2 text-sm font-semibold transition-all',
                          isLoading && 'opacity-70'
                        )}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            Resetting...
                          </>
                        ) : (
                          'Reset Password'
                        )}
                      </Button>
                    </form>
                  </Form>
                  <Button
                    variant="link"
                    className="w-full text-sm text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                    onClick={() => setStep('verify')}
                    disabled={isLoading}
                  >
                    Back to Verification
                  </Button>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-center px-4 sm:px-6">
              <Button
                variant="link"
                className="text-sm text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                onClick={() => navigate('/login')}
                disabled={isLoading}
              >
                Remember your password? Sign in
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}