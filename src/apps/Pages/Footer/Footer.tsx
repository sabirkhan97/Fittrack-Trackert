import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '@/components/icons';
import fitnessPattern from '@/assets/images/fitness-pattern.svg';
import appStoreBadge from '@/assets/images/app-store-badge.svg';
import playStoreBadge from '@/assets/images/play-store-badge.svg';

interface FooterLink {
  name: string;
  path?: string;
  href?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleNewsletterSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!email) {
      setEmailError('Please enter your email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email');
      return;
    }
    setEmailError('');
    setEmail('');
    // Implement newsletter subscription logic here
  };

  return (
    <footer className="relative bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0 bg-repeat"
          style={{
            backgroundImage: `url(${fitnessPattern})`,
            backgroundSize: '400px',
          }}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-transparent to-transparent" />

      <div className="relative container px-4 sm:px-6 lg:px-8 py-16 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600">
                <Icons.dumbbell />
              </div>
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                FitTrack Pro
              </span>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 max-w-md leading-relaxed">
              Your ultimate fitness companion. Track workouts, monitor progress, and achieve your goals with our AI-powered platform.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <a
                href="https://www.apple.com/app-store/"
                className="block"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download on the App Store"
              >
                <img
                  src={appStoreBadge}
                  alt="Download on the App Store"
                  className="h-10 transition-transform hover:scale-105 focus:scale-105"
                />
              </a>
              <a
                href="https://play.google.com/store"
                className="block"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get it on Google Play"
              >
                <img
                  src={playStoreBadge}
                  alt="Get it on Google Play"
                  className="h-10 transition-transform hover:scale-105 focus:scale-105"
                />
              </a>
            </div>
            <div className="flex gap-3 mt-6">
              {[
                { icon: Icons.twitter, label: 'Twitter', href: '#' },
                { icon: Icons.instagram, label: 'Instagram', href: '#' },
                { icon: Icons.facebook, label: 'Facebook', href: '#' },
                { icon: Icons.linkedin, label: 'LinkedIn', href: '#' },
                { icon: Icons.youtube, label: 'YouTube', href: '#' },
              ].map(({ icon: Icon, label, href }, index) => (
                <a
                  key={index}
                  href={href}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={`Follow us on ${label}`}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
              <span className="w-2 h-2 rounded-full bg-primary mr-2" />
              Navigation
            </h3>
            <nav className="mt-5 space-y-3">
              {[
                { name: 'Workouts', path: 'gym-notes' },
                { name: 'Progress', path: 'progress' },
                { name: 'Exercises', path: 'exercises' },
                { name: 'Nutrition', path: 'nutrition' },
                { name: 'Community', path: 'community' },
              ].map(({ name, path }) => (
                <button
                  key={path}
                  onClick={() => navigate(`/${path}`)}
                  className="block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:translate-x-1 transition-all duration-300 focus:outline-none focus:text-primary"
                >
                  {name}
                </button>
              ))}
            </nav>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
              <span className="w-2 h-2 rounded-full bg-primary mr-2" />
              Resources
            </h3>
            <nav className="mt-5 space-y-3">
              {[
                { name: 'Blog', icon: Icons.pen, href: '#' },
                { name: 'Guides', icon: Icons.book, href: '#' },
                { name: 'Tutorials', icon: Icons.video, href: '#' },
                { name: 'Support', icon: Icons.lifeBuoy, href: '#' },
                { name: 'FAQ', icon: Icons.helpCircle, href: '#' },
              ].map(({ name, icon: Icon, href }) => (
                <a
                  key={name}
                  href={href}
                  className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-all duration-300 group focus:outline-none focus:text-primary"
                >
                  <Icon className="w-4 h-4 mr-2 opacity-70 group-hover:opacity-100" />
                  {name}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
              <span className="w-2 h-2 rounded-full bg-primary mr-2" />
              Contact Us
            </h3>
            <address className="mt-5 space-y-4 not-italic">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <Icons.mail  />
                </div>
                <a
                  href="mailto:hello@fittrack.com"
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-300"
                >
                  hello@fittrack.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <Icons.phone  />
                </div>
                <a
                  href="tel:+1234567890"
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-300"
                >
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <Icons.mapPin  />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  123 Fitness St, Health City
                </span>
              </div>
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-3">Stay Updated</h4>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="flex-1 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    aria-label="Email for newsletter"
                  />
                  <button
                    onClick={handleNewsletterSubmit}
                    className="px-4 py-2.5 text-sm text-white bg-gradient-to-r from-primary to-indigo-600 rounded-r-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Subscribe to newsletter"
                  >
                    <Icons.send className="w-4 h-4" />
                  </button>
                </div>
                {emailError && (
                  <p className="mt-2 text-sm text-red-500 dark:text-red-400">{emailError}</p>
                )}
              </div>
            </address>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center sm:text-left">
              © {currentYear} FitTrack Pro. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {[
                { name: 'Privacy Policy', href: '#' },
                { name: 'Terms of Service', href: '#' },
                { name: 'Cookies', href: '#' },
                { name: 'Accessibility', href: '#' },
              ].map(({ name, href }) => (
                <a
                  key={name}
                  href={href}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-300 hover:underline focus:outline-none focus:underline"
                >
                  {name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
