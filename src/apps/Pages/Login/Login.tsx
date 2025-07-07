import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast, Toaster } from 'sonner';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { PasswordInput } from '@/components/PasswordInput';

const API = import.meta.env.VITE_API_URL;

// ✅ Correct schema: use 'identifier' instead of 'email'
const formSchema = z.object({
  identifier: z.string().min(1, { message: 'Username or Email is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/api/auth/login`, {
        identifier: values.identifier,
        password: values.password,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);

        // Decode token to get is_admin
        const payload = JSON.parse(atob(response.data.token.split('.')[1]));
        const isAdmin = payload.is_admin;

        toast.success('Welcome back, warrior! 💪', {
          description: isAdmin ? 'Admin access granted!' : 'Ready to crush your workout goals?',
          duration: 3000,
          position: 'top-center',
          action: {
            label: "Let's Go",
            onClick: () => navigate(isAdmin ? '/admin' : '/dashboard'),
          },
        });

        await new Promise(resolve => setTimeout(resolve, 1500));
        navigate(isAdmin ? '/admin' : '/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response) {
        if (error.response.status === 400) {
          toast.error('Access Denied!', {
            description: 'Invalid username/email or password.',
            position: 'top-center',
          });
        } else {
          toast.error('Login Failed!', {
            description: error.response.data.message || 'Server error.',
            position: 'top-center',
          });
        }
      } else {
        toast.error('Connection Error', {
          description: 'Server is resting. Try again later!',
          position: 'top-center',
        });
      }
      form.resetField('password');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Gym background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: 'border-0 shadow-lg',
            title: 'font-bold',
            description: 'text-sm opacity-90',
            actionButton: '!bg-primary !text-primary-foreground',
          },
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        <Card className="w-full border-0 bg-background/90 backdrop-blur-md shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <motion.div
              className="flex justify-center items-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Icons.dumbbell />
              <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                FitTrack Pro
              </span>
            </motion.div>
            <CardTitle className="text-2xl font-bold mt-4">Welcome Back, Athlete!</CardTitle>
            <p className="text-sm text-muted-foreground">
              Log in to track your workouts and see your gains
            </p>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Icons.user className="w-4 h-4 mr-2" />
                        Username or Email
                      </FormLabel>
                      <FormControl>
                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                          <Input
                            placeholder="yourname or your@email.com"
                            autoComplete="username"
                            {...field}
                            className="py-5"
                          />
                        </motion.div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Icons.lock className="w-4 h-4 mr-2" />
                        Password
                      </FormLabel>
                      <FormControl>
                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                          <PasswordInput
                            placeholder="••••••••"
                            {...field}
                            className="py-5"
                          />
                        </motion.div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full py-6 text-lg font-bold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <Icons.login className="w-5 h-5 mr-2" />
                        LET'S WORKOUT
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </Form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background/90 px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="py-5">
                <Icons.google className="w-5 h-5 mr-2" />
                Google
              </Button>
              <Button variant="outline" className="py-5">
                <Icons.apple className="w-5 h-5 mr-2" />
                Apple
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              variant="link"
              className="text-sm text-muted-foreground hover:text-primary"
              onClick={() => navigate('/reset-password')}
            >
              <a href="/forgot-password">Forgot Password?</a>
            </Button>
            <div className="text-sm text-muted-foreground">
              New to FitTrack?{' '}
              <Button
                variant="link"
                className="p-0 h-auto text-primary font-bold"
                onClick={() => navigate('/signup')}
              >
                Join the gains journey
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
