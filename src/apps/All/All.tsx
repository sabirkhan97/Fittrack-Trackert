import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { lazy, Suspense } from 'react';
import { Header } from '@/apps/Pages/Header/Header';
import { Footer } from '@/apps/Pages/Footer/Footer';
import ForgotPassword from '../Pages/ForgotPassword/ForgotPassword';


const Login = lazy(() => import('@/apps/Pages/Login/Login'));
const Signup = lazy(() => import('@/apps/Pages/SignUp/Signup'));
const GymNotes = lazy(() => import('@/apps/Pages/GymNotes/GymNotes'));
const WorkoutSummary = lazy(() => import('@/apps/Pages/WorkoutSummary/WorkoutSummary'));
const Exercises = lazy(() => import('@/apps/Pages/ExerciseSelector/Exercises'));
const About = lazy(() => import('@/apps/Pages/About/About'))
const SavedExercises = lazy(() => import('@/apps/Pages/savedExercise/SavedExercise'))
const WorkoutGenerator = lazy(() => import('@/apps/Pages/WorkoutGenerator/WorkoutGenerator'))
const DietGenerator = lazy(() => import('../Pages/DietGenrator/DietGenerator'));
const Dashboard = lazy(() => import('@/apps/Pages/Dashboard/Dashboard'));
const AdminPage = lazy(() => import('../Pages/admin/Admin'));

export default function All() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="flex space-x-2"> loading ....
            <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce"></div>
            <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce delay-100"></div>
            <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce delay-200"></div>
          </div>
        </div>
      }>
           <Toaster 
          position="top-center"
          richColors
          expand={true}
          closeButton
          toastOptions={{
            classNames: {
              toast: 'group toast',
              title: 'group-[.toast]:text-md font-semibold',
              description: 'group-[.toast]:text-sm',
              actionButton: 'group-[.toast]:bg-blue-500',
              cancelButton: 'group-[.toast]:bg-gray-500',
            },
          }}
        />

        {/* Your components */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/gym-notes" element={<GymNotes />} />
          <Route path="/workout-summary" element={<WorkoutSummary />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path='/about' element={<About />} />
          <Route path="/savedExercise" element={<SavedExercises />} />
          <Route path="/generate-workout" element={<WorkoutGenerator />} />
          <Route path="/diet-generator" element={<DietGenerator />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />


          {/* <Route path="/profile" element={<ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
} /> */}


        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}
