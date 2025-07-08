import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '@/components/icons';
import { ChangePasswordForm } from '@/apps/Pages/ChangePasswordForm/ChangePasswordForm';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  username: string;
  email: string;
  avatar?: string;
  joinDate?: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data?.user || null);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen]);
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthenticated(false);
    navigate('/login');
  };
  const initial = profile?.username?.charAt(0).toUpperCase() || '';

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-modal-title"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-lg bg-white dark:bg-gray-950 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Close profile modal"
            >
              <Icons.x className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-8 gap-6 min-h-[400px]">
                <Icons.spinner className="w-10 h-10 animate-spin text-primary" />
                <p className="text-lg text-gray-600 dark:text-gray-300">Loading your profile...</p>
              </div>
            ) : !profile ? (
              <div className="flex flex-col items-center justify-center p-8 gap-6 min-h-[400px]">
                <Icons.userX className="w-12 h-12 text-gray-400" />
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">Profile Not Found</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center max-w-sm">
                  We couldn't load your profile information. Please try again later or contact support.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                {/* Header with Avatar */}
                <div className="relative pt-12 pb-8 px-6 bg-gradient-to-br from-indigo-600 to-purple-600 text-center">
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                    <div className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-950 bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center text-4xl font-bold shadow-xl">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={`${profile.username}'s avatar`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        initial
                      )}
                    </div>
                  </div>
                  <h1 id="profile-modal-title" className="mt-10 text-3xl font-bold text-white tracking-tight">
                    {profile.username}
                  </h1>
                  <p className="text-indigo-100 text-lg mt-1">{profile.email}</p>
                  {profile.joinDate && (
                    <p className="mt-2 text-sm text-indigo-200">
                      Member since {new Date(profile.joinDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex-1 py-4 px-6 font-medium text-base transition-colors ${activeTab === 'profile'
                      ? 'text-primary border-b-2 border-primary bg-white dark:bg-gray-950'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    aria-selected={activeTab === 'profile'}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex-1 py-4 px-6 font-medium text-base transition-colors ${activeTab === 'settings'
                      ? 'text-primary border-b-2 border-primary bg-white dark:bg-gray-950'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    aria-selected={activeTab === 'settings'}
                  >
                    Settings
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-6 max-h-[50vh] overflow-y-auto">
                  {activeTab === 'profile' ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-sm">
                        <Icons.user className="w-6 h-6 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
                          <p className="text-lg font-medium text-gray-800 dark:text-white">{profile.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-sm">
                        <Icons.mail />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                          <p className="text-lg font-medium text-gray-800 dark:text-white">{profile.email}</p>
                        </div>
                      </div>
                      {profile.joinDate && (
                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-sm">
                          <Icons.calendar className="w-6 h-6 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Member since</p>
                            <p className="text-lg font-medium text-gray-800 dark:text-white">
                              {new Date(profile.joinDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Password Change Accordion */}
                      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                        <button
                          onClick={() => toggleSection('password')}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                          aria-expanded={expandedSection === 'password'}
                          aria-controls="password-section"
                        >
                          <span className="flex items-center gap-3 text-lg font-medium text-gray-800 dark:text-white">
                            <Icons.lock className="w-6 h-6 text-gray-500" />
                            Change Password
                          </span>
                          <Icons.chevronDown
                            className={`w-6 h-6 text-gray-400 transition-transform ${expandedSection === 'password' ? 'rotate-180' : ''
                              }`}
                          />
                        </button>
                        {expandedSection === 'password' && (
                          <motion.div
                            id="password-section"
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
                          >
                            <ChangePasswordForm onSuccess={onClose} />
                          </motion.div>
                        )}
                      </div>

                      {/* Notification Settings */}
                      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                        <button
                          onClick={() => toggleSection('notifications')}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                          aria-expanded={expandedSection === 'notifications'}
                          aria-controls="notifications-section"
                        >
                          <span className="flex items-center gap-3 text-lg font-medium text-gray-800 dark:text-white">
                            <Icons.bell className="w-6 h-6 text-gray-500" />
                            Notification Preferences
                          </span>
                          <Icons.chevronDown
                            className={`w-6 h-6 text-gray-400 transition-transform ${expandedSection === 'notifications' ? 'rotate-180' : ''
                              }`}
                          />
                        </button>
                        {expandedSection === 'notifications' && (
                          <motion.div
                            id="notifications-section"
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
                          >
                            <div className="space-y-4">
                              <label className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  className="w-5 h-5 text-primary focus:ring-primary rounded"
                                  defaultChecked
                                />
                                <span className="text-gray-700 dark:text-gray-300">Email notifications</span>
                              </label>
                              <label className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  className="w-5 h-5 text-primary focus:ring-primary rounded"
                                  defaultChecked
                                />
                                <span className="text-gray-700 dark:text-gray-300">Push notifications</span>
                              </label>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Privacy Settings */}
                      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                        <button
                          onClick={() => toggleSection('privacy')}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                          aria-expanded={expandedSection === 'privacy'}
                          aria-controls="privacy-section"
                        >
                          <span className="flex items-center gap-3 text-lg font-medium text-gray-800 dark:text-white">
                            <Icons.shield className="w-6 h-6 text-gray-500" />
                            Privacy Settings
                          </span>
                          <Icons.chevronDown
                            className={`w-6 h-6 text-gray-400 transition-transform ${expandedSection === 'privacy' ? 'rotate-180' : ''
                              }`}
                          />
                        </button>
                        {expandedSection === 'privacy' && (
                          <motion.div
                            id="privacy-section"
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
                          >
                            <div className="space-y-4">
                              <label className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  className="w-5 h-5 text-primary focus:ring-primary rounded"
                                  defaultChecked
                                />
                                <span className="text-gray-700 dark:text-gray-300">Public profile</span>
                              </label>
                              <label className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  className="w-5 h-5 text-primary focus:ring-primary rounded"
                                />
                                <span className="text-gray-700 dark:text-gray-300">Share activity</span>
                              </label>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
                  <Button
                    onClick={onClose}
                    className="cursor-pointer px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    Close
                  </Button>
                  <Button
                    
                    onClick={handleLogout}
                    className='cursor-pointer  '
                  >
                    <Icons.logout className="h-4 w-4" />
                    Sign Out
                  </Button>
                  {activeTab === 'profile' && (
                    <Button className="cursor-pointer px-6 py-3 bg-primary  rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
                      Edit Profile
                    </Button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}