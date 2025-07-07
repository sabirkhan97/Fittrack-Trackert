"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Icons } from '@/components/icons';
import dayjs from 'dayjs';
import api from '@/api/api';

// Interface for exercise
interface Exercise {
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
  rest: string;
  rpe?: number;
  tempo?: string;
  superset?: string;
  notes?: string;
}

// Interface for workout plan
interface WorkoutPlan {
  id: string;
  date: string;
  created_at: string;
  title: string;
  exercises: Exercise[];
  notes?: string;
  prompt?: string;
  duration?: number;
  weeklySchedule?: {
    day1?: string;
    day2?: string;
    day3?: string;
    day4?: string;
    day5?: string;
    day6?: string;
    day7?: string;
  };
  bodyMetrics?: {
    age?: number;
    sex?: string;
    height?: string;
    weight?: string;
    bodyFat?: string;
    muscleMass?: string;
    waistCircumference?: string;
    hipCircumference?: string;
    restingHeartRate?: string;
    bloodPressure?: string;
  };
  fitnessProfile?: {
    experienceLevel?: string;
    primaryGoal?: string;
    secondaryGoals?: string[];
    targetAreas?: string[];
    avoidAreas?: string[];
    injuries?: string[];
    medicalConditions?: string[];
    currentFitnessLevel?: string;
    workoutHistory?: string;
    recentPerformance?: string;
  };
  equipment?: {
    available?: string[];
    homeGym?: boolean;
    resistanceBands?: boolean;
    dumbbells?: boolean;
    barbell?: boolean;
    kettlebells?: boolean;
    pullUpBar?: boolean;
    cardioMachine?: boolean;
    weightMachine?: boolean;
    cableMachine?: boolean;
    yogaMat?: boolean;
    stabilityBall?: boolean;
    foamRoller?: boolean;
    trx?: boolean;
    medicineBall?: boolean;
  };
  preferences?: {
    workoutTime?: string;
    daysPerWeek?: number;
    intensity?: string;
    favoriteExercises?: string[];
    dislikedExercises?: string[];
    preferredTrainingStyle?: string[];
    workoutEnvironment?: string;
    musicPreference?: string;
    trainingPartner?: boolean;
    progressTrackingMethod?: string;
  };
  nutritionPreferences?: {
    dietaryRestrictions?: string[];
    supplements?: string[];
    mealTiming?: string;
    hydrationLevel?: string;
  };
  recoveryPreferences?: {
    sleepQuality?: string;
    sleepDuration?: string;
    stressLevel?: string;
    recoveryActivities?: string[];
    stretchingRoutine?: string;
  };
}

// Zod schema for validating workout plan payload
const WorkoutPlanPayloadSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  title: z.string().min(1, 'Title cannot be empty'),
  exercises: z.array(
    z.object({
      exercise_name: z.string().min(1, 'Exercise name cannot be empty'),
      sets: z.number().min(1, 'Sets must be at least 1'),
      reps: z.number().min(1, 'Reps must be at least 1'),
      weight: z.number().min(0, 'Weight cannot be negative'),
      rest: z.string().optional(),
      rpe: z.number().optional(),
      tempo: z.string().optional(),
      superset: z.string().optional(),
      notes: z.string().optional(),
    })
  ).min(1, 'At least one exercise required'),
  notes: z.string().optional(),
  prompt: z.string().optional(),
  duration: z.number().optional(),
  weeklySchedule: z.object({
    day1: z.string().optional(),
    day2: z.string().optional(),
    day3: z.string().optional(),
    day4: z.string().optional(),
    day5: z.string().optional(),
    day6: z.string().optional(),
    day7: z.string().optional(),
  }).optional(),
});

export default function WorkoutGenerator() {
  const [tabKey, setTabKey] = useState('generate');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [countdown, setCountdown] = useState(180);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingMessages] = useState([
    "Designing your workout plan...",
    "Analyzing your goals...",
    "Tailoring exercises...",
    "Optimizing schedule...",
    "Finalizing program..."
  ]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    planTitle: '',
    age: '',
    sex: '',
    height: '',
    weight: '',
    bodyFat: '',
    muscleMass: '',
    waistCircumference: '',
    hipCircumference: '',
    restingHeartRate: '',
    bloodPressure: '',
    experienceLevel: '',
    primaryGoal: '',
    secondaryGoals: [] as string[],
    targetAreas: [] as string[],
    avoidAreas: [] as string[],
    injuries: [] as string[],
    medicalConditions: [] as string[],
    currentFitnessLevel: '',
    workoutHistory: '',
    recentPerformance: '',
    availableEquipment: [] as string[],
    homeGym: false,
    resistanceBands: false,
    dumbbells: false,
    barbell: false,
    kettlebells: false,
    pullUpBar: false,
    cardioMachine: false,
    weightMachine: false,
    cableMachine: false,
    yogaMat: false,
    stabilityBall: false,
    foamRoller: false,
    trx: false,
    medicineBall: false,
    workoutTime: '',
    daysPerWeek: '',
    intensity: '',
    favoriteExercises: '',
    dislikedExercises: '',
    preferredTrainingStyle: [] as string[],
    workoutEnvironment: '',
    musicPreference: '',
    trainingPartner: false,
    progressTrackingMethod: '',
    dietaryRestrictions: [] as string[],
    supplements: [] as string[],
    mealTiming: '',
    hydrationLevel: '',
    sleepQuality: '',
    sleepDuration: '',
    stressLevel: '',
    recoveryActivities: [] as string[],
    stretchingRoutine: '',
    day1: '',
    day2: '',
    day3: '',
    day4: '',
    day5: '',
    day6: '',
    day7: '',
    additionalNotes: '',
  });

  const navigate = useNavigate();

  // Fetch saved workout plans
  const { data: savedPlans, refetch } = useQuery<WorkoutPlan[]>({
    queryKey: ['workoutPlans'],
    queryFn: async () => {
      const res = await api.get('/api/workout-plans/my', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data.plans;
    },
    enabled: !!localStorage.getItem('token'),
  });

  // Generate workout plan mutation
  const generateWorkout = useMutation({
    mutationFn: async () => {
      const prompt = `
Design a personalized ${formData.daysPerWeek}-day workout plan titled "${formData.planTitle}" for a ${formData.age}-year-old ${formData.sex}.

Goals:
- Primary: ${formData.primaryGoal}
- Secondary: ${formData.secondaryGoals.length ? formData.secondaryGoals.join(', ') : 'N/A'}

Target Muscle Areas:
- ${formData.targetAreas.length ? formData.targetAreas.join(', ') : 'None'}

Injuries or Areas to Avoid:
- ${formData.avoidAreas.length ? formData.avoidAreas.join(', ') : 'None'}

Available Equipment:
- ${(() => {
          const equipmentKeys = [
            'homeGym', 'resistanceBands', 'dumbbells', 'barbell', 'kettlebells',
            'pullUpBar', 'cardioMachine', 'weightMachine', 'cableMachine',
            'yogaMat', 'stabilityBall', 'foamRoller', 'trx', 'medicineBall'
          ];
          const selected = equipmentKeys.filter(k => formData[k as keyof typeof formData]);
          return selected.length ? selected.join(', ') : 'None';
        })()}

Workout Preferences:
- Time per session: ${formData.workoutTime}
- Intensity: ${formData.intensity}
- Environment: ${formData.workoutEnvironment}

Additional Notes:
- ${formData.additionalNotes || 'None'}
`;

      setShowLoadingModal(true);
      setCountdown(180);

      const res = await api.post(
        '/api/workout-plans',
        { prompt },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      return res.data.workoutPlan as WorkoutPlan;
    },
    onSuccess: (data) => {
      toast.success('Workout plan generated!');
      setWorkoutPlan(data);
      setShowLoadingModal(false);
    },
    onError: (error: any) => {
      toast.error('Failed to generate plan', {
        description: error.response?.data?.error || 'Try again later',
      });
      setShowLoadingModal(false);
    },
  });

  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);

  // Countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showLoadingModal && countdown > 0 && !generateWorkout.isSuccess) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
        if (countdown % 36 === 0) {
          setCurrentMessageIndex((prev) =>
            prev === loadingMessages.length - 1 ? 0 : prev + 1
          );
        }
      }, 1000);
    } else if (countdown === 0 || generateWorkout.isSuccess) {
      setShowLoadingModal(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, showLoadingModal, loadingMessages, generateWorkout.isSuccess]);

  // Save workout plan mutation
  const saveWorkoutPlan = useMutation({
    mutationFn: async (plan: WorkoutPlan) => {
      const payload = WorkoutPlanPayloadSchema.parse({
        date: plan.date,
        title: plan.title || `Workout Plan ${dayjs(plan.date).format('MMM D, YYYY')}`,
        exercises: plan.exercises.map((exercise) => ({
          exercise_name: exercise.exercise_name.trim(),
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          rest: exercise.rest?.trim(),
          rpe: exercise.rpe,
          tempo: exercise.tempo?.trim(),
          superset: exercise.superset?.trim(),
          notes: exercise.notes?.trim(),
        })),
        notes: plan.notes?.trim(),
        prompt: plan.prompt?.trim(),
        duration: plan.duration,
        weeklySchedule: plan.weeklySchedule,
      });

      const res = await api.post(
        '/api/workout-plans/save',
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success('Workout plan saved!');
      refetch();
      setTabKey('saved');
    },
    onError: (error: any) => {
      const errorMessage =
        error instanceof z.ZodError
          ? error.errors.map((e: any) => e.message).join(', ')
          : error.response?.data?.error || 'An unexpected error occurred';
      toast.error('Failed to save plan', {
        description: errorMessage,
      });
    },
  });

  // Delete workout plan mutation
  const deleteWorkoutPlan = useMutation({
    mutationFn: async (planId: string) => {
      await api.delete(`/api/workout-plans/${planId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    },
    onSuccess: () => {
      toast.success('Workout plan deleted');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete plan');
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | { name: string; value: any }
  ) => {
    if ('target' in e) {
      const { name, value, type } = e.target;
      const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    } else {
      setFormData({
        ...formData,
        [e.name]: e.value,
      });
    }
  };

  const toggleArrayField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => {
      const current = prev[field] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((item) => item !== value) };
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Options for select inputs
  const goalOptions = [
    'Muscle Gain', 'Fat Loss', 'Strength', 'Endurance', 'Mobility',
    'Rehabilitation', 'Sports Performance', 'General Fitness'
  ];

  const targetAreaOptions = [
    'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Glutes', 'Full Body'
  ];

  const experienceLevels = ['Beginner', 'Intermediate', 'Advanced'];

  const intensityLevels = ['Low', 'Moderate', 'High'];

  const workoutTimes = ['Morning', 'Afternoon', 'Evening'];

  const trainingStyles = [
    'Bodybuilding', 'Powerlifting', 'CrossFit', 'Calisthenics', 'Functional'
  ];

  const workoutEnvironments = ['Gym', 'Home', 'Outdoor'];

  const musicPreferences = ['Upbeat', 'Rock', 'Hip-Hop', 'None'];

  const trackingMethods = ['App', 'Journal', 'Spreadsheet'];

  const dietaryRestrictions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'];

  const supplements = ['Protein', 'Creatine', 'Pre-Workout', 'None'];

  const recoveryActivities = ['Foam Rolling', 'Massage', 'Yoga', 'Stretching'];

  const sleepQualities = ['Poor', 'Fair', 'Good'];

  const stressLevels = ['Low', 'Moderate', 'High'];

  return (
    <div className="min-h-screen ">

      <div className="container px-4 py-8">
        <Tabs value={tabKey} onValueChange={setTabKey} className="w-full">
          <TabsList className="flex w-full max-w-md mx-auto mb-8 bg-gray-100 p-1.5 rounded-xl border border-gray-200 shadow-inner">
            <TabsTrigger
              value="generate"
              className="w-full py-2.5 text-sm font-medium transition-all duration-200
             data-[state=active]:bg-white data-[state=active]:text-emerald-600
             data-[state=active]:shadow-sm data-[state=active]:ring-1 ring-emerald-100
             rounded-lg hover:text-emerald-600"
            >
              <div className="flex items-center justify-center gap-2">
                <Icons.bolt className="h-4 w-4" />
                Workout Generator
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="w-full py-2.5 text-sm font-medium transition-all duration-200
             data-[state=active]:bg-white data-[state=active]:text-emerald-600
             data-[state=active]:shadow-sm data-[state=active]:ring-1 ring-emerald-100
             rounded-lg hover:text-emerald-600"
            >
              <div className="flex items-center justify-center gap-2">
                <Icons.bookmark className="h-4 w-4" />
                My Plans
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-indigo-700 to-violet-600 text-white relative overflow-hidden group p-8 rounded-t-[2rem] hover:shadow-lg transition-shadow duration-300">
                  {/* Enhanced curved corners */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-inherit">
                    <div className="absolute -top-8 left-0 w-8 h-8 bg-white/10 rounded-br-full transition-all duration-500 group-hover:bg-white/20" />
                    <div className="absolute -top-8 right-0 w-8 h-8 bg-white/10 rounded-bl-full transition-all duration-500 group-hover:bg-white/20" />
                  </div>

                  {/* Dynamic particle background */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-white/20 animate-float-delay" />
                    <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-white/15 animate-float" />
                    <div className="absolute bottom-1/4 left-1/5 w-3 h-3 rounded-full bg-white/25 animate-float-delay-slow" />
                  </div>

                  {/* Content with enhanced typography */}
                  <div className="relative z-10 space-y-2 mt-2">
                    <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight leading-tight drop-shadow-md">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-100 hover:bg-gradient-to-r hover:from-white hover:to-indigo-200 transition-all duration-500">
                        Create Your Workout Plan
                      </span>
                    </CardTitle>

                    <div className="flex items-center space-x-3">
                      <div className="h-1.5 w-6 bg-white/40 rounded-full animate-pulse hover:bg-white/60 transition-colors duration-300" />
                      <CardDescription className="text-indigo-100/90 text-lg font-light tracking-wide flex items-center hover:text-white transition-colors duration-300">
                        <Icons.sparkle className="h-4 w-4 mr-2 animate-float hover:animate-spin" />
                        <span className="hover:translate-x-1 transition-transform duration-300">
                          Fill in details for a personalized workout
                        </span>
                      </CardDescription>
                    </div>
                  </div>

                  {/* Enhanced animated border */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 [background-size:200%_auto] group-hover:animate-shine" />
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="planTitle">Plan Title</Label>
                        <Input
                          id="planTitle"
                          name="planTitle"
                          value={formData.planTitle}
                          onChange={handleInputChange}
                          placeholder="e.g., Summer Shred"
                          disabled={generateWorkout.isPending}
                          className="bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="age">Age</Label>
                          <Input
                            id="age"
                            name="age"
                            type="number"
                            value={formData.age}
                            onChange={handleInputChange}
                            placeholder="Your age"
                            disabled={generateWorkout.isPending}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sex">Sex</Label>
                          <Select
                            name="sex"
                            value={formData.sex}
                            onValueChange={(value) => handleInputChange({ name: 'sex', value })}
                            disabled={generateWorkout.isPending}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select sex" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="height">Height (cm)</Label>
                          <Input
                            id="height"
                            name="height"
                            type="number"
                            value={formData.height}
                            onChange={handleInputChange}
                            placeholder="Your height"
                            disabled={generateWorkout.isPending}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="weight">Weight (kg)</Label>
                          <Input
                            id="weight"
                            name="weight"
                            type="number"
                            value={formData.weight}
                            onChange={handleInputChange}
                            placeholder="Your weight"
                            disabled={generateWorkout.isPending}
                            className="bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Primary Goal</Label>
                        <Select
                          name="primaryGoal"
                          value={formData.primaryGoal}
                          onValueChange={(value) => handleInputChange({ name: 'primaryGoal', value })}
                          disabled={generateWorkout.isPending}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select goal" />
                          </SelectTrigger>
                          <SelectContent>
                            {goalOptions.map((goal) => (
                              <SelectItem key={goal} value={goal.toLowerCase().replace(' ', '-')}>{goal}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Secondary Goals</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {goalOptions.map((goal) => (
                            <div key={goal} className="flex items-center space-x-2">
                              <Checkbox
                                id={goal}
                                checked={formData.secondaryGoals.includes(goal)}
                                onCheckedChange={() => toggleArrayField('secondaryGoals', goal)}
                                disabled={generateWorkout.isPending}
                              />
                              <label htmlFor={goal} className="text-sm">{goal}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Target Areas</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {targetAreaOptions.map((area) => (
                            <div key={area} className="flex items-center space-x-2">
                              <Checkbox
                                id={area}
                                checked={formData.targetAreas.includes(area)}
                                onCheckedChange={() => toggleArrayField('targetAreas', area)}
                                disabled={generateWorkout.isPending}
                              />
                              <label htmlFor={area} className="text-sm">{area}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Areas to Avoid</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {targetAreaOptions.map((area) => (
                            <div key={area} className="flex items-center space-x-2">
                              <Checkbox
                                id={`avoid-${area}`}
                                checked={formData.avoidAreas.includes(area)}
                                onCheckedChange={() => toggleArrayField('avoidAreas', area)}
                                disabled={generateWorkout.isPending}
                              />
                              <label htmlFor={`avoid-${area}`} className="text-sm">{area}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Experience Level</Label>
                        <Select
                          name="experienceLevel"
                          value={formData.experienceLevel}
                          onValueChange={(value) => handleInputChange({ name: 'experienceLevel', value })}
                          disabled={generateWorkout.isPending}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {experienceLevels.map((level) => (
                              <SelectItem key={level} value={level.toLowerCase()}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Workout Time</Label>
                        <Select
                          name="workoutTime"
                          value={formData.workoutTime}
                          onValueChange={(value) => handleInputChange({ name: 'workoutTime', value })}
                          disabled={generateWorkout.isPending}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {workoutTimes.map((time) => (
                              <SelectItem key={time} value={time.toLowerCase()}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Days Per Week</Label>
                        <Input
                          name="daysPerWeek"
                          type="number"
                          min="1"
                          max="7"
                          value={formData.daysPerWeek}
                          onChange={handleInputChange}
                          placeholder="1-7"
                          disabled={generateWorkout.isPending}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Intensity</Label>
                        <Select
                          name="intensity"
                          value={formData.intensity}
                          onValueChange={(value) => handleInputChange({ name: 'intensity', value })}
                          disabled={generateWorkout.isPending}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select intensity" />
                          </SelectTrigger>
                          <SelectContent>
                            {intensityLevels.map((level) => (
                              <SelectItem key={level} value={level.toLowerCase()}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Favorite Exercises</Label>
                        <Input
                          name="favoriteExercises"
                          value={formData.favoriteExercises}
                          onChange={handleInputChange}
                          placeholder="e.g., Squats, Pull-ups"
                          disabled={generateWorkout.isPending}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Exercises to Avoid</Label>
                        <Input
                          name="dislikedExercises"
                          value={formData.dislikedExercises}
                          onChange={handleInputChange}
                          placeholder="e.g., Burpees"
                          disabled={generateWorkout.isPending}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Training Style</Label>
                        <div className="flex flex-wrap gap-2">
                          {trainingStyles.map((style) => (
                            <Button
                              key={style}
                              variant={formData.preferredTrainingStyle.includes(style) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => toggleArrayField('preferredTrainingStyle', style)}
                              disabled={generateWorkout.isPending}
                              className={cn(
                                "rounded-full",
                                formData.preferredTrainingStyle.includes(style) ? "bg-emerald-600" : "bg-white"
                              )}
                            >
                              {style}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Workout Environment</Label>
                        <Select
                          name="workoutEnvironment"
                          value={formData.workoutEnvironment}
                          onValueChange={(value) => handleInputChange({ name: 'workoutEnvironment', value })}
                          disabled={generateWorkout.isPending}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select environment" />
                          </SelectTrigger>
                          <SelectContent>
                            {workoutEnvironments.map((env) => (
                              <SelectItem key={env} value={env.toLowerCase()}>{env}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-medium">Advanced Options</Label>
                      <Switch
                        checked={showAdvanced}
                        onCheckedChange={setShowAdvanced}
                        disabled={generateWorkout.isPending}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    </div>

                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 space-y-4 overflow-hidden"
                      >
                        <Separator className="my-4" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="bodyFat">Body Fat %</Label>
                            <Input
                              id="bodyFat"
                              name="bodyFat"
                              type="number"
                              value={formData.bodyFat}
                              onChange={handleInputChange}
                              placeholder="Optional"
                              disabled={generateWorkout.isPending}
                              className="bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="muscleMass">Muscle Mass (kg)</Label>
                            <Input
                              id="muscleMass"
                              name="muscleMass"
                              type="number"
                              value={formData.muscleMass}
                              onChange={handleInputChange}
                              placeholder="Optional"
                              disabled={generateWorkout.isPending}
                              className="bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="waistCircumference">Waist (cm)</Label>
                            <Input
                              id="waistCircumference"
                              name="waistCircumference"
                              type="number"
                              value={formData.waistCircumference}
                              onChange={handleInputChange}
                              placeholder="Optional"
                              disabled={generateWorkout.isPending}
                              className="bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="hipCircumference">Hip (cm)</Label>
                            <Input
                              id="hipCircumference"
                              name="hipCircumference"
                              type="number"
                              value={formData.hipCircumference}
                              onChange={handleInputChange}
                              placeholder="Optional"
                              disabled={generateWorkout.isPending}
                              className="bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="restingHeartRate">Heart Rate (bpm)</Label>
                            <Input
                              id="restingHeartRate"
                              name="restingHeartRate"
                              type="number"
                              value={formData.restingHeartRate}
                              onChange={handleInputChange}
                              placeholder="Optional"
                              disabled={generateWorkout.isPending}
                              className="bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bloodPressure">Blood Pressure</Label>
                            <Input
                              id="bloodPressure"
                              name="bloodPressure"
                              value={formData.bloodPressure}
                              onChange={handleInputChange}
                              placeholder="e.g., 120/80"
                              disabled={generateWorkout.isPending}
                              className="bg-white"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Injuries</Label>
                          <Input
                            name="injuries"
                            value={formData.injuries.join(', ')}
                            onChange={(e) => setFormData({ ...formData, injuries: e.target.value.split(',').map(i => i.trim()) })}
                            placeholder="e.g., Lower back pain"
                            disabled={generateWorkout.isPending}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Medical Conditions</Label>
                          <Input
                            name="medicalConditions"
                            value={formData.medicalConditions.join(', ')}
                            onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value.split(',').map(i => i.trim()) })}
                            placeholder="e.g., Hypertension"
                            disabled={generateWorkout.isPending}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Fitness Level</Label>
                          <Textarea
                            name="currentFitnessLevel"
                            value={formData.currentFitnessLevel}
                            onChange={handleInputChange}
                            placeholder="Current fitness capabilities"
                            disabled={generateWorkout.isPending}
                            className="bg-white min-h-[100px]"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Equipment Available</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'homeGym', label: 'Home Gym' },
                            { id: 'resistanceBands', label: 'Resistance Bands' },
                            { id: 'dumbbells', label: 'Dumbbells' },
                            { id: 'barbell', label: 'Barbell' },
                            { id: 'kettlebells', label: 'Kettlebells' },
                            { id: 'pullUpBar', label: 'Pull-up Bar' },
                            { id: 'cardioMachine', label: 'Cardio Machine' },
                            { id: 'weightMachine', label: 'Weight Machine' },
                            { id: 'cableMachine', label: 'Cable Machine' },
                            { id: 'yogaMat', label: 'Yoga Mat' },
                            { id: 'stabilityBall', label: 'Stability Ball' },
                            { id: 'foamRoller', label: 'Foam Roller' },
                            { id: 'trx', label: 'TRX' },
                            { id: 'medicineBall', label: 'Medicine Ball' },
                          ].map(({ id, label }) => (
                            <div key={id} className="flex items-center space-x-2">
                              <Checkbox
                                id={id}
                                checked={formData[id as keyof typeof formData] as boolean}
                                onCheckedChange={(checked) => handleInputChange({ name: id, value: checked })}
                                disabled={generateWorkout.isPending}
                              />
                              <label htmlFor={id} className="text-sm">{label}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Additional Notes</Label>
                        <Textarea
                          name="additionalNotes"
                          value={formData.additionalNotes}
                          onChange={handleInputChange}
                          placeholder="Specific goals or preferences..."
                          className="min-h-[100px] bg-white"
                          disabled={generateWorkout.isPending}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-center">
                    <Button
                      size="lg"
                      onClick={() => generateWorkout.mutate()}
                      disabled={generateWorkout.isPending || !formData.age || !formData.sex || !formData.primaryGoal}
                      className="px-8 py-6 text-lg bg-gradient-to-r from-emerald-600 to-teal-600"
                    >
                      {generateWorkout.isPending ? (
                        <div className="flex items-center gap-2">
                          <Icons.spinner className="h-5 w-5 animate-spin" />
                          <span>Generating...</span>
                        </div>
                      ) : (
                        'Generate Workout'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {workoutPlan && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6"
                >
                  <Card className="border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {/* Header */}
                    <CardHeader className="bg-white p-5 border-b border-gray-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl font-semibold text-gray-900">
                            {workoutPlan.title}
                          </CardTitle>
                          <CardDescription className="text-gray-500 text-sm mt-1 flex items-center">
                            <Icons.calendar className="h-3.5 w-3.5 mr-1.5" />
                            Generated {dayjs(workoutPlan.created_at).format('MMM D, YYYY')}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setWorkoutPlan(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Icons.x className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    {/* Content */}
                    <CardContent className="p-5 bg-gray-50/50">
                      {/* Weekly Schedule */}
                      {workoutPlan.weeklySchedule && Object.values(workoutPlan.weeklySchedule).some(val => val) && (
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                            <Icons.calendarDays className="h-4 w-4 mr-2 text-emerald-500" />
                            WEEKLY SCHEDULE
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7'].map((day, idx) => {
                              const dayValue = workoutPlan.weeklySchedule?.[day as keyof typeof workoutPlan.weeklySchedule];
                              if (!dayValue) return null;
                              return (
                                <div key={day} className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs">
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                                  </h4>
                                  <p className="text-sm text-gray-800 mt-1">{dayValue}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Exercises */}
                      <div className="space-y-5">
                        {workoutPlan.exercises.map((exercise, index) => (
                          <div key={index} className="bg-white p-4 rounded-lg border border-gray-100 shadow-xs">
                            <div className="flex items-start gap-3">
                              <div className="bg-emerald-100/50 p-2 rounded-full">
                                <Icons.dumbbell />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{exercise.exercise_name}</h4>

                                {/* Exercise Details */}
                                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                                  <div className="flex items-center text-gray-600">
                                    <Icons.repeat className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                    {exercise.sets}×{exercise.reps}
                                  </div>
                                  {exercise.weight > 0 && (
                                    <div className="flex items-center text-gray-600">
                                      <Icons.weight className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                      {exercise.weight} kg
                                    </div>
                                  )}
                                  {exercise.rest && (
                                    <div className="flex items-center text-gray-600">
                                      <Icons.clock className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                      Rest: {exercise.rest}
                                    </div>
                                  )}
                                  {exercise.rpe && (
                                    <div className="flex items-center text-gray-600">
                                      <Icons.gauge className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                      RPE: {exercise.rpe}
                                    </div>
                                  )}
                                  {exercise.tempo && (
                                    <div className="flex items-center text-gray-600">
                                      <Icons.timer className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                      Tempo: {exercise.tempo}
                                    </div>
                                  )}
                                </div>

                                {/* Notes and Supersets */}
                                {(exercise.notes || exercise.superset) && (
                                  <div className="mt-3 space-y-2">
                                    {exercise.superset && (
                                      <div className="flex items-start text-sm text-emerald-700 bg-emerald-50/50 px-3 py-2 rounded">
                                        <Icons.link className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                                        <span>Superset with {exercise.superset}</span>
                                      </div>
                                    )}
                                    {exercise.notes && (
                                      <div className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded border-l-2 border-emerald-300">
                                        {exercise.notes}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Trainer Notes */}
                      {workoutPlan.notes && (
                        <div className="mt-6 bg-white p-4 rounded-lg border border-gray-100 shadow-xs">
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Icons.clipboard className="h-4 w-4 mr-2 text-emerald-500" />
                            TRAINER NOTES
                          </h4>
                          <p className="text-gray-700">{workoutPlan.notes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-6 flex justify-end gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setWorkoutPlan(null)}
                          disabled={saveWorkoutPlan.isPending}
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          Close
                        </Button>
                        <Button
                          onClick={() => saveWorkoutPlan.mutate(workoutPlan)}
                          disabled={saveWorkoutPlan.isPending || !workoutPlan}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          {saveWorkoutPlan.isPending ? (
                            <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Icons.save className="h-4 w-4 mr-2" />
                          )}
                          Save Plan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="saved">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {savedPlans && savedPlans.length > 0 ? (
                savedPlans.map((plan) => (
                  <Card key={plan.id} className="border-0 shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-br from-indigo-700 to-violet-600 text-white relative overflow-hidden p-6 rounded-t-3xl">
                      {/* Floating particles */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-white/20 animate-float" />
                        <div className="absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-white/15 animate-float-delay" />
                      </div>

                      {/* Content */}
                      <div className="relative z-10">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold tracking-tight">
                              {plan.title}
                            </CardTitle>
                            <CardDescription className="text-indigo-100/90 flex items-center">
                              <Icons.calendar className="h-4 w-4 mr-2" />
                              Created {dayjs(plan.created_at).format('MMM D, YYYY')}
                            </CardDescription>
                          </div>

                          {/* Minimal delete button */}
                          <button
                            onClick={() => deleteWorkoutPlan.mutate(plan.id)}
                            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                          >
                            <Icons.trash className="h-4 w-4 text-white/80 hover:text-white" />
                          </button>
                        </div>
                      </div>

                      {/* Animated bottom border */}
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </CardHeader>
            <CardContent className="p-6 bg-white">
  {/* Weekly Schedule */}
  {plan.weeklySchedule && Object.values(plan.weeklySchedule).some(val => val) && (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-emerald-100 p-1.5 rounded-lg">
          <Icons.calendarDays className="h-5 w-5 text-emerald-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-800">Weekly Schedule</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7'].map((day, idx) => {
          const dayValue = plan.weeklySchedule?.[day as keyof typeof plan.weeklySchedule];
          if (!dayValue) return null;
          return (
            <div key={day} className="border border-gray-200 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-emerald-600">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{dayValue}</p>
            </div>
          );
        })}
      </div>
    </div>
  )}

  {/* Exercises */}
  <div className="space-y-6">
    {plan.exercises.map((exercise, index) => (
      <div key={index} className="border-b border-gray-100 pb-6 last:border-0">
        <div className="flex items-start gap-4">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Icons.dumbbell />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {exercise.exercise_name}
            </h3>
            
            {/* Exercise Details */}
            <div className="flex flex-wrap gap-3 mb-3">
              <div className="flex items-center text-sm text-gray-600">
                <Icons.repeat className="h-4 w-4 mr-1.5 text-gray-400" />
                {exercise.sets} × {exercise.reps}
              </div>
              
              {exercise.weight > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <Icons.weight className="h-4 w-4 mr-1.5 text-gray-400" />
                  {exercise.weight} kg
                </div>
              )}
              
              {exercise.rest && (
                <div className="flex items-center text-sm text-gray-600">
                  <Icons.clock className="h-4 w-4 mr-1.5 text-gray-400" />
                  {exercise.rest}
                </div>
              )}
            </div>
            
            {/* Notes */}
            {exercise.notes && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                {exercise.notes}
              </div>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>

  {/* Trainer Notes */}
  {plan.notes && (
    <div className="mt-8 bg-gray-50 p-4 rounded-lg">
      <h4 className="text-sm font-medium text-gray-500 mb-2">Trainer Notes</h4>
      <p className="text-gray-700">{plan.notes}</p>
    </div>
  )}
</CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto h-24 w-24 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                    <Icons.fileText className="h-12 w-12 text-emerald-600" />
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-gray-900">No saved plans</h3>
                  <p className="mt-2 text-gray-600">Generate a workout plan to save it here</p>
                  <Button
                    onClick={() => setTabKey('generate')}
                    className="mt-6 bg-emerald-600"
                  >
                    Create Plan
                  </Button>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      <AnimatePresence>
        {showLoadingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center"
            >
              <div className="relative h-32 w-32 mx-auto mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <Icons.loader className="h-full w-full text-emerald-200" />
                </motion.div>
                <div className="absolute inset-4 flex items-center justify-center">
                  <Icons.dumbbell />
                </div>
              </div>
              <p>{loadingMessages[currentMessageIndex]}</p>
              <div className="space-y-4 mt-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Time remaining:</span>
                  <span className="font-medium text-emerald-600">
                    {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                  </span>
                </div>
                <Progress
                  value={100 - (countdown / 180 * 100)}
                  className="h-2 bg-gray-200"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
