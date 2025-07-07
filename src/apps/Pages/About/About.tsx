import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Feature {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export default function About() {
  const features: Feature[] = [
    {
      title: 'Custom Workout Plans',
      description: 'Tailored plans for your fitness goals and level.',
      icon: Icons.dumbbell,
    },
    {
      title: 'Personalized Diet Generator',
      description: 'Enter your details for a custom diet plan.',
      icon: Icons.apple,
    },
    {
      title: 'Smart Workout Generator',
      description: 'Fill in preferences for a personalized workout.',
      icon: Icons.sparkles,
    },
    {
      title: 'Exercise Library',
      description: '80+ exercises with clear form instructions.',
      icon: Icons.list,
    },
    {
      title: 'Progress Charts',
      description: 'Track workouts with clear, visual charts.',
      icon: Icons.trendingUp,
    },
    {
      title: 'Secure Data',
      description: 'Protected with JWT-based authentication.',
      icon: Icons.shield,
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-900/70" />
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80"
          />
          <source
            media="(min-width: 768px)"
            srcSet="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=2070&q=80"
          />
          <img
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=2070&q=80"
            alt="Fitness background"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </picture>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center py-8 px-4 sm:py-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-2xl mx-auto"
        >
          <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-0 shadow-lg md:shadow-xl rounded-xl">
            <CardHeader className="text-center space-y-3 px-4 sm:px-6 py-6">
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  About FitTrack Tracker
                </CardTitle>
              </motion.div>
              <CardDescription className="text-base text-gray-600 dark:text-gray-300">
                Your partner for a healthier lifestyle
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 px-4 sm:px-6 pb-6">
              {/* Mission Section */}
              <motion.section
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                    <Icons.target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Our Mission</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base pl-12 leading-relaxed">
                  FitTrack Tracker empowers you to achieve your fitness goals with intuitive tools for workout planning, nutrition, and progress tracking. We're here to make fitness simple, effective, and secure.
                </p>
              </motion.section>

              {/* Features Section */}
              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                    <Icons.dumbbell  />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Why FitTrack Tracker?</h2>
                </div>
                <ul className="space-y-2 pl-12">
                  {features.map((feature, idx) => (
                    <motion.li
                      key={idx}
                      whileHover={{ x: 5, scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                    >
                      <feature.icon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-800 dark:text-white text-sm sm:text-base">{feature.title}:</strong>
                        <span className="text-gray-600 dark:text-gray-300 text-sm ml-1">{feature.description}</span>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </motion.section>

              {/* Team Section */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                    <Icons.users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Who We Are</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base pl-12 leading-relaxed">
                  Created by fitness enthusiasts and developers, FitTrack Tracker is designed to simplify your fitness journey with intuitive, secure, and effective tools.
                </p>
              </motion.section>

              {/* Call-to-Action */}
              <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="text-center space-y-4 pt-4"
              >
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Start Your Journey</h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                    Join users transforming their lives with FitTrack Tracker.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Button
                    asChild
                    variant="default"
                    size="sm"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md rounded-lg"
                  >
                    <Link to="/signup" className="flex items-center gap-1.5">
                      <Icons.userPlus className="h-4 w-4" />
                      Get Started
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 shadow-md rounded-lg"
                  >
                    <Link to="/login" className="flex items-center gap-1.5">
                      <Icons.logIn className="h-4 w-4" />
                      Log In
                    </Link>
                  </Button>
                </div>
              </motion.section>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}