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

const formSchema = z.object({
  email: z.string().email({ message: 'Valid email required' }),
  username: z
    .string()
    .min(3, { message: '3 characters minimum' })
    .max(20, { message: '20 characters maximum' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Letters, numbers, underscores only',
    }),
  password: z
    .string()
    .min(8, { message: '8 characters minimum' })
    .regex(/[A-Z]/, { message: 'Include uppercase letter' })
    .regex(/[0-9]/, { message: 'Include number' }),
});

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/api/auth/signup`, values);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        toast.success('Welcome to the FitTrack Family!', {
          description: 'Your fitness journey starts now!',
          duration: 3000,
          position: 'top-center',
          action: {
            label: 'Go to Dashboard',
            onClick: () => navigate('/dashboard')
          },
          icon: <Icons.dumbbell  />
        });
        await new Promise(resolve => setTimeout(resolve, 1500));
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.response) {
        if (error.response.status === 409) {
          if (error.response.data.error.includes('Email')) {
            form.setError('email', { 
              message: 'Email already in use',
              type: 'manual'
            });
            toast.error('Email Taken', {
              description: 'This email is already registered',
              position: 'top-center',
              action: {
                label: 'Login Instead',
                onClick: () => navigate('/login')
              }
            });
          } else if (error.response.data.error.includes('Username')) {
            form.setError('username', { 
              message: 'Username taken',
              type: 'manual'
            });
            toast.error('Username Unavailable', {
              description: 'Please choose another username',
              position: 'top-center'
            });
          }
        } else {
          toast.error('Registration Failed', {
            description: error.response.data.message || 'Could not complete signup',
            position: 'top-center'
          });
        }
      } else {
        toast.error('Connection Issue', {
          description: 'Could not reach our servers',
          position: 'top-center'
        });
      }
      form.resetField('password');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Modern fitness background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg" 
          alt="Fitness tracker and smartphone"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>
      
      <Toaster 
        position="top-center" 
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: 'border-0 shadow-lg rounded-xl',
            title: 'font-bold',
            description: 'text-sm opacity-90',
            actionButton: '!bg-primary !text-primary-foreground'
          }
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
              <Icons.dumbbell  />
              <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                FitTrack Pro
              </span>
            </motion.div>
            <CardTitle className="text-2xl font-bold mt-4">Start Your Journey</CardTitle>
            <p className="text-sm text-muted-foreground">
              Create your account and transform your fitness
            </p>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Icons.user className="w-4 h-4 mr-2" />
                        Username
                      </FormLabel>
                      <FormControl>
                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                          <Input 
                            placeholder="fitness_warrior" 
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Icons.mail  />
                        Email
                      </FormLabel>
                      <FormControl>
                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                          <Input 
                            placeholder="you@example.com" 
                            autoComplete="email" 
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
                            autoComplete="new-password" 
                            {...field} 
                            className="py-5"
                          />
                        </motion.div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full py-6 text-lg font-bold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Icons.plus className="w-5 h-5 mr-2" />
                        START TRAINING
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
                  Or sign up with
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
            <div className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto text-primary font-bold" 
                onClick={() => navigate('/login')}
              >
                Sign in now
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}