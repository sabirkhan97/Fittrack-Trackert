import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ModeToggle } from '@/context/ModeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ProfileModal } from '@/apps/Pages/Profile/Profile';
import path from 'path';

interface MobileMenuProps {
  isActive: (path: string) => boolean;
  navigate: (path: string) => void;
  setMobileMenuOpen: (open: boolean) => void;
  handleLogout: () => void;
  isAuthenticated: boolean;
  usernameInitial: string;
  setIsProfileOpen: (open: boolean) => void;
}

function MobileMenu({
  isActive,
  navigate,
  setMobileMenuOpen,
  handleLogout,
  isAuthenticated,
  usernameInitial,
  setIsProfileOpen,
}: MobileMenuProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 md:hidden"
      >
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-16 right-0 w-72 h-[calc(100vh-4rem)] bg-background/95 backdrop-blur-lg border-l p-4 space-y-2"
        >
          {isAuthenticated && (
            <div
              className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => {
                setIsProfileOpen(true);
                setMobileMenuOpen(false);
              }}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src="/avatars/default.png" />
                <AvatarFallback className="bg-gradient-to-r from-primary to-purple-600 text-white">
                  {usernameInitial}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">My Profile</p>
                <p className="text-sm text-muted-foreground">View account details</p>
              </div>
            </div>
          )}

          <nav className="space-y-1">
            {[
              { path: '/dashboard', label: 'Home', icon: <Icons.home className="h-5 w-5" /> },
              { path: '/gym-notes', label: 'Workouts', icon: <Icons.dumbbell /> },
              { path: '/generate-workout', label: 'Generate Workout', icon: <Icons.sparkles className="h-5 w-5" /> },
              { path: '/diet-generator', label: 'Generate Diet', icon: <Icons.sparkles className="h-4 w-4" /> },
              { path: '/workout-summary', label: 'History', icon: <Icons.history className="h-5 w-5" /> },
              { path: '/exercises', label: 'Exercises', icon: <Icons.list className="h-5 w-5" /> },
              // { path: '/progress', label: 'Progress', icon: <Icons.trendingUp className="h-5 w-5" /> },
              { path: '/savedExercise', label: 'Saved', icon: <Icons.save className="h-5 w-5" /> },
              { path: '/about', label: 'About' },

            ].map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 h-12 ${isActive(item.path) ? 'bg-accent' : ''}`}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  disabled={item.path === '/progress'}
                >
                  <span className="text-primary">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.path === '/progress' && (
                    <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                      Soon
                    </span>
                  )}
                </Button>
              </motion.div>
            ))}
          </nav>

          <div className="pt-4 border-t space-y-2">
            {isAuthenticated ? (
              <>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12"
                    onClick={() => {
                      setIsProfileOpen(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Icons.user className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Profile Settings</span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12 text-red-600 hover:text-red-600 dark:text-red-400 dark:hover:text-red-400"
                    onClick={handleLogout}
                  >
                    <Icons.logout className="h-5 w-5" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12"
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Icons.login className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Sign In</span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="default"
                    className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-primary to-primary/90"
                    onClick={() => {
                      navigate('/signup');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Icons.userPlus className="h-5 w-5" />
                    <span className="text-sm font-medium">Get Started</span>
                  </Button>
                </motion.div>
              </>
            )}
            <div className="flex justify-center pt-2">
              <ModeToggle />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInitial, setUsernameInitial] = useState('U');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    if (token) {
      const fetchProfile = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const username = res.data?.user?.username ?? '';
          if (username && typeof username === 'string') {
            setUsernameInitial(username.charAt(0).toUpperCase());
          } else {
            setUsernameInitial('U');
          }
        } catch (error: any) {
          console.error('Fetch profile error:', error.response?.data || error.message);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          navigate('/login');
        }
      };

      fetchProfile();
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUsernameInitial('U');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${scrolled
          ? 'bg-background/95 backdrop-blur-lg shadow-sm'
          : 'bg-background/90 backdrop-blur-sm'
          }`}
      >
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Logo/Brand */}
          <div className="flex items-center gap-4 md:gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(isAuthenticated ? '/gym-notes' : '/')}
              className="flex items-center gap-2 group"
              aria-label="Home"
            >
              <motion.div
                className="p-1.5 rounded-lg bg-gradient-to-r from-primary to-purple-600 group-hover:opacity-90 transition-opacity"
                whileHover={{ rotate: 10 }}
              >
                <Icons.dumbbell />
              </motion.div>
              <span className="text-xl font-bold tracking-tighter bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                FitTrack Pro
              </span>
            </motion.button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { path: '/dashboard', label: 'Home', icon: <Icons.home className="h-5 w-5" /> },
                { path: '/gym-notes', label: 'Workouts', icon: <Icons.dumbbell /> },
                { path: '/generate-workout', label: 'Generate Workout', icon: <Icons.sparkles className="h-4 w-4" /> },
                { path: '/diet-generator', label: 'Generate Diet', icon: <Icons.sparkles className="h-4 w-4" /> },
                { path: '/workout-summary', label: 'History', icon: <Icons.history className="h-4 w-4" /> },
                { path: '/exercises', label: 'Exercises', icon: <Icons.list className="h-4 w-4" /> },
                // { path: '/progress', label: 'Progress', icon: <Icons.trendingUp className="h-4 w-4" /> },
                { path: '/savedExercise', label: 'Saved', icon: <Icons.save className="h-4 w-4" /> },
                { path: '/about', label: 'About' },


              ].map((item) => (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`px-3 font-medium rounded-lg gap-2 ${isActive(item.path)
                          ? 'bg-gradient-to-r from-primary/10 to-purple-600/10 text-accent-foreground border border-primary/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                          }`}
                        onClick={() => navigate(item.path)}
                        disabled={item.path === '/progress'}
                      >
                        {item.icon}
                        {item.label}
                        {item.path === '/progress' && (
                          <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                            Soon
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-background/95 backdrop-blur-lg border">
                    {item.label} {item.path === '/progress' && '(Coming Soon)'}
                  </TooltipContent>
                </Tooltip>
              ))}
            </nav>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex">
              <ModeToggle />
            </div>

            {isAuthenticated ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex rounded-full"
                        onClick={() => setIsProfileOpen(true)}
                        aria-label="User profile"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/avatars/default.png" />
                          <AvatarFallback className="bg-gradient-to-r from-primary to-purple-600 text-white">
                            {usernameInitial}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-background/95 backdrop-blur-lg border">
                    View Profile
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hidden md:flex gap-2"
                        onClick={handleLogout}
                      >
                        <Icons.logout className="h-4 w-4" />
                        <span>Sign Out</span>
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-background/95 backdrop-blur-lg border">
                    Sign Out
                  </TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="default"
                    size="sm"
                    className="hidden md:flex bg-gradient-to-r from-primary to-purple-600 shadow-lg"
                    onClick={() => navigate('/signup')}
                  >
                    Get Started
                  </Button>
                </motion.div>
              </>
            )}

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <Icons.close className="h-5 w-5" />
                ) : (
                  <Icons.menu className="h-5 w-5" />
                )}
              </Button>
            </motion.div>
          </div>
        </div>

        {mobileMenuOpen && (
          <MobileMenu
            isActive={isActive}
            navigate={navigate}
            setMobileMenuOpen={setMobileMenuOpen}
            handleLogout={handleLogout}
            isAuthenticated={isAuthenticated}
            usernameInitial={usernameInitial}
            setIsProfileOpen={setIsProfileOpen}
          />
        )}
      </header>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
}