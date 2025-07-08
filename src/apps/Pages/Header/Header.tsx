import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ModeToggle } from '@/context/ModeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ProfileModal } from '@/apps/Pages/Profile/Profile';

const navItems = [
  { path: '/dashboard', label: 'Home', icon: <Icons.home /> },
  { path: '/gym-notes', label: 'Workouts', icon: <Icons.dumbbell /> },
  { path: '/generate-workout', label: 'Generate Workout', icon: <Icons.sparkles /> },
  { path: '/diet-generator', label: 'Genrate Diet', icon: <Icons.sparkles /> },
  { path: '/workout-summary', label: 'History', icon: <Icons.history /> },
  { path: '/exercises', label: 'Exercises', icon: <Icons.list /> },
  { path: '/savedExercise', label: 'Saved', icon: <Icons.save /> },
  { path: '/about', label: 'About' },
];

export function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [userInitial, setUserInitial] = useState('U');
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setAuthenticated(!!token);

    if (token) {
      const fetchProfile = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const username = res.data?.user?.username || '';
          setUserInitial(username.charAt(0).toUpperCase() || 'U');
        } catch {
          localStorage.removeItem('token');
          setAuthenticated(false);
          navigate('/login');
        }
      };
      fetchProfile();
    }

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigate]);

  

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <header
        className={`flex justify-between sticky top-0 z-50 w-full border-b backdrop-blur-sm transition-all ${scrolled ? 'bg-background/95 shadow-sm' : 'bg-background/90'}`}
        >
        <div className=" w-full flex h-16 items-center justify-between px-4 sm:px-6">


          <div
            className="flex items-center gap-4"
          >
            <div
              onClick={() => navigate(authenticated ? '/gym-notes' : '/')}
              className="flex items-center gap-2"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-primary to-purple-600">
                <Icons.dumbbell />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                FitTrackt Trackert
              </span>
            </div>



            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  className={`px-3 gap-2 ${isActive(item.path) ? 'bg-accent' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </nav>

          </div>

          {/* Desktop Nav */}

          {/* Auth Controls */}
          <div className="flex items-center gap-2 ">
            <ModeToggle />

            {authenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setProfileOpen(true)}
                  className="hidden md:flex"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-primary to-purple-600 text-white">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="hidden md:flex"
                >
                  Sign In
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate('/signup')}
                  className="hidden md:flex bg-gradient-to-r from-primary to-purple-600"
                >
                  Get Started
                </Button>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden"
            >
              {mobileOpen ? <Icons.close /> : <Icons.menu />}
            </Button>
          </div>
        </div>


        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-16 right-0 w-72 h-[calc(100vh-4rem)] bg-background border-l p-4 space-y-4"
            >
              {authenticated && (
                <div
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted cursor-pointer"
                  onClick={() => {
                    setProfileOpen(true);
                    setMobileOpen(false);
                  }}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-r from-primary to-purple-600 text-white">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">My Profile</p>
                    <p className="text-sm text-muted-foreground">View account</p>
                  </div>
                </div>
              )}

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className={`w-full justify-start gap-3 h-12 ${isActive(item.path) ? 'bg-accent' : ''}`}
                    onClick={() => {
                      navigate(item.path);
                      setMobileOpen(false);
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                ))}
              </nav>

              <div className="pt-4 border-t space-y-2">
                {authenticated ? (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => {
                        setProfileOpen(true);
                        setMobileOpen(false);
                      }}
                    >
                      <Icons.user className="h-5 w-5" />
                      Profile Settings
                    </Button>
                    {/* <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12 text-red-600"
                      onClick={handleLogout}
                    >
                      <Icons.logout className="h-5 w-5" />
                      Sign Out
                    </Button> */}
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => {
                        navigate('/login');
                        setMobileOpen(false);
                      }}
                    >
                      <Icons.login className="h-5 w-5" />
                      Sign In
                    </Button>
                    <Button
                      variant="default"
                      className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-primary to-purple-600"
                      onClick={() => {
                        navigate('/signup');
                        setMobileOpen(false);
                      }}
                    >
                      <Icons.userPlus className="h-5 w-5" />
                      Get Started
                    </Button>
                  </>
                )}
                <div className="flex justify-center pt-2">
                  <ModeToggle />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </header>

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}