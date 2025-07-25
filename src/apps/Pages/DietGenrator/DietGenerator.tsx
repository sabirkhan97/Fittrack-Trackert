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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Icons } from '@/components/icons';
import dayjs from 'dayjs';
import api from '@/api/api';
import Typewriter from 'typewriter-effect';


// Interface for diet plan
interface DietPlan {
  id: string;
  date: string;
  meals: {
    meal_time: string;
    items: string[];
  }[];
  notes?: string;
  prompt?: string;
  user_id?: string;
  created_at?: string;
  bodyMetrics?: {
    age?: number;
    sex?: string;
    height?: string;
    weight?: string;
    bodyFat?: string;
    waistHip?: string;
  };
  fitnessGoals?: {
    primaryGoal?: string;
    targetWeight?: string;
    timeframe?: string;
    motivation?: string;
  };
  currentRoutine?: {
    daysPerWeek?: number;
    workoutTypes?: string[];
    duration?: string;
    intensity?: string;
    program?: string;
  };
  dietaryHabits?: {
    mealsPerDay?: number;
    typicalFoods?: string;
    breakfastHabit?: string;
    prePostWorkout?: string;
    weekendPattern?: string;
  };
  macros?: {
    proteinIntake?: string;
    carbFatPref?: string;
    trackingApp?: string;
  };
  hydration?: {
    waterIntake?: string;
    electrolytes?: string;
    dehydrationSigns?: string;
  };
  supplements?: {
    current?: string;
    pastExperiences?: string;
    openTo?: boolean;
  };
  health?: {
    injuries?: string;
    medicalConditions?: string;
    digestion?: string;
    sleep?: string;
    energyLevels?: string;
  };
  lifestyle?: {
    jobType?: string;
    dailySteps?: string;
    mealPrepTime?: string;
    foodBudget?: string;
    country?: string;
    city?: string;
  };
}

// Interface for save payload (matches backend /api/diet-plans/save)
interface DietPlanPayload {
  date: string;
  meals: {
    meal_time: string;
    items: string[];
  }[];
  notes?: string;
  prompt?: string;
}

// Zod schema for validating diet plan payload
const DietPlanPayloadSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  meals: z.array(
    z.object({
      meal_time: z.string().min(1, 'Meal time cannot be empty'),
      items: z.array(z.string().min(1, 'Item cannot be empty')).min(1, 'At least one item required'),
    })
  ).min(1, 'At least one meal required'),
  notes: z.string().optional(),
  prompt: z.string().optional(),
});

export default function DietGenerator() {
  const [tabKey, setTabKey] = useState('diet');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [countdown, setCountdown] = useState(180); // Set to 3 minutes (180 seconds)
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingMessages] = useState([
    "Our AI nutritionists are crafting your perfect meal plan...",
    "Analyzing your dietary preferences and health goals...",
    "Optimizing macronutrient balance for your body type...",
    "Personalizing recipes based on your location and budget...",
    "Finalizing your customized nutrition plan..."
  ]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    message: '',
    age: '',
    sex: '',
    height: '',
    weight: '',
    bodyFat: '',
    waistHip: '',
    primaryGoal: '',
    targetWeight: '',
    timeframe: '',
    motivation: '',
    daysPerWeek: '',
    workoutTypes: '',
    duration: '',
    intensity: '',
    program: '',
    mealsPerDay: '',
    typicalFoods: '',
    breakfastHabit: '',
    prePostWorkout: '',
    weekendPattern: '',
    proteinIntake: '',
    carbFatPref: '',
    trackingApp: '',
    waterIntake: '',
    electrolytes: '',
    dehydrationSigns: '',
    currentSupplements: '',
    pastExperiences: '',
    openToSupplements: false,
    injuries: '',
    medicalConditions: '',
    digestion: '',
    sleep: '',
    energyLevels: '',
    jobType: '',
    dailySteps: '',
    mealPrepTime: '',
    foodBudget: '',
    country: '',
    city: '',
    foodPreferences: [] as string[],
    healthConditions: [] as string[],
    favoriteCuisines: [] as string[],
    snackPreferences: [] as string[],
    foodRestrictions: [] as string[],
    supplements: [] as string[],
    preferredMealTimes: [] as string[],
    previousDietExperience: [] as string[],
  });

  const navigate = useNavigate();

  // Fetch saved diet plans
  const { data: savedPlans, refetch } = useQuery<DietPlan[]>({
    queryKey: ['dietPlans'],
    queryFn: async () => {
      const res = await api.get('/api/diet-plans/my', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data.plans;
    },
  });

  // Define generateDiet mutation before useEffect
  const generateDiet = useMutation({
    mutationFn: async () => {
      const prompt = `
        Generate a personalized diet plan based on the following details. Ensure the plan uses ingredients and foods that are easily available in ${formData.country}${formData.city ? `, ${formData.city}` : ''}.
        ${formData.message ? `User Notes: ${formData.message}.` : ''}
        ${formData.age ? `Age: ${formData.age}.` : ''}
        ${formData.sex ? `Sex: ${formData.sex}.` : ''}
        ${formData.height ? `Height: ${formData.height} cm.` : ''}
        ${formData.weight ? `Weight: ${formData.weight} kg.` : ''}
        ${formData.bodyFat ? `Body Fat Percentage: ${formData.bodyFat}%.` : ''}
        ${formData.waistHip ? `Waist-to-Hip Ratio: ${formData.waistHip}.` : ''}
        ${formData.primaryGoal ? `Primary Goal: ${formData.primaryGoal}.` : ''}
        ${formData.targetWeight ? `Target Weight: ${formData.targetWeight} kg.` : ''}
        ${formData.timeframe ? `Timeframe: ${formData.timeframe}.` : ''}
        ${formData.motivation ? `Motivation: ${formData.motivation}.` : ''}
        ${formData.daysPerWeek ? `Training Days/Week: ${formData.daysPerWeek}.` : ''}
        ${formData.workoutTypes ? `Workout Types: ${formData.workoutTypes}.` : ''}
        ${formData.duration ? `Workout Duration: ${formData.duration}.` : ''}
        ${formData.intensity ? `Workout Intensity: ${formData.intensity}.` : ''}
        ${formData.program ? `Program: ${formData.program}.` : ''}
        ${formData.mealsPerDay ? `Meals Per Day: ${formData.mealsPerDay}.` : ''}
        ${formData.typicalFoods ? `Typical Foods: ${formData.typicalFoods}.` : ''}
        ${formData.breakfastHabit ? `Breakfast Habit: ${formData.breakfastHabit}.` : ''}
        ${formData.prePostWorkout ? `Pre/Post Workout Nutrition: ${formData.prePostWorkout}.` : ''}
        ${formData.weekendPattern ? `Weekend Eating Pattern: ${formData.weekendPattern}.` : ''}
        ${formData.proteinIntake ? `Protein Intake Preference: ${formData.proteinIntake}.` : ''}
        ${formData.carbFatPref ? `Carb/Fat Preference: ${formData.carbFatPref}.` : ''}
        ${formData.trackingApp ? `Tracking App: ${formData.trackingApp}.` : ''}
        ${formData.waterIntake ? `Water Intake: ${formData.waterIntake}.` : ''}
        ${formData.electrolytes ? `Electrolyte Strategy: ${formData.electrolytes}.` : ''}
        ${formData.dehydrationSigns ? `Dehydration Signs: ${formData.dehydrationSigns}.` : ''}
        ${formData.currentSupplements ? `Current Supplements: ${formData.currentSupplements}.` : ''}
        ${formData.pastExperiences ? `Past Supplement Experiences: ${formData.pastExperiences}.` : ''}
        ${formData.openToSupplements ? `Open to Supplements: ${formData.openToSupplements ? 'Yes' : 'No'}.` : ''}
        ${formData.injuries ? `Injuries: ${formData.injuries}.` : ''}
        ${formData.medicalConditions ? `Medical Conditions: ${formData.medicalConditions}.` : ''}
        ${formData.digestion ? `Digestive Health: ${formData.digestion}.` : ''}
        ${formData.sleep ? `Sleep Quality: ${formData.sleep}.` : ''}
        ${formData.energyLevels ? `Energy Levels: ${formData.energyLevels}.` : ''}
        ${formData.jobType ? `Job Type: ${formData.jobType}.` : ''}
        ${formData.dailySteps ? `Daily Steps: ${formData.dailySteps}.` : ''}
        ${formData.mealPrepTime ? `Meal Prep Time: ${formData.mealPrepTime}.` : ''}
        ${formData.foodBudget ? `Food Budget: ${formData.foodBudget}.` : ''}
        ${formData.country ? `Country: ${formData.country}.` : ''}
        ${formData.city ? `City: ${formData.city}.` : ''}
        ${formData.foodPreferences.length > 0 ? `Food Preferences: ${formData.foodPreferences.join(', ')}.` : ''}
        ${formData.healthConditions.length > 0 ? `Health Conditions: ${formData.healthConditions.join(', ')}.` : ''}
        ${formData.favoriteCuisines.length > 0 ? `Favorite Cuisines: ${formData.favoriteCuisines.join(', ')}.` : ''}
        ${formData.snackPreferences.length > 0 ? `Snack Preferences: ${formData.snackPreferences.join(', ')}.` : ''}
        ${formData.foodRestrictions.length > 0 ? `Food Restrictions: ${formData.foodRestrictions.join(', ')}.` : ''}
        ${formData.supplements.length > 0 ? `Supplements: ${formData.supplements.join(', ')}.` : ''}
        ${formData.preferredMealTimes.length > 0 ? `Preferred Meal Times: ${formData.preferredMealTimes.join(', ')}.` : ''}
        ${formData.previousDietExperience.length > 0 ? `Previous Diet Experience: ${formData.previousDietExperience.join(', ')}.` : ''}
      `;

      setShowLoadingModal(true);
      setCountdown(180); // Reset to 3 minutes

      const res = await api.post(
        '/api/diet-plans',
        { prompt },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      return res.data.dietPlan as DietPlan;
    },
    onSuccess: (data) => {
      toast.success('Diet plan generated!', {
        description: 'Your personalized nutrition plan is ready!',
      });
      refetch();
      setShowLoadingModal(false);
    },
    onError: (error: any) => {
      toast.error('Failed to generate diet plan', {
        description: error.response?.data?.error || 'Please try again or contact support',
      });
      setShowLoadingModal(false);
    },
  });

  // Countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showLoadingModal && countdown > 0 && !generateDiet.isSuccess) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
        if (countdown % 36 === 0) { // Update message every 36 seconds (180 / 5 messages = 36)
          setCurrentMessageIndex((prev) =>
            prev === loadingMessages.length - 1 ? 0 : prev + 1
          );
        }
      }, 1000);
    } else if (countdown === 0 || generateDiet.isSuccess) {
      setShowLoadingModal(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, showLoadingModal, loadingMessages, generateDiet.isSuccess]);

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

  const saveDietPlan = useMutation({
    mutationFn: async (plan: DietPlanPayload) => {
      const payload = DietPlanPayloadSchema.parse({
        date: plan.date,
        meals: plan.meals.map((meal: { meal_time: string; items: string[] }) => ({
          meal_time: meal.meal_time.trim(),
          items: meal.items.map((item: string) => item.trim()),
        })),
        notes: plan.notes?.trim(),
        prompt: plan.prompt?.trim(),
      });

      const res = await api.post(
        '/api/diet-plans/save',
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success('Diet plan saved!', {
        description: 'Your diet plan has been successfully saved to your profile.',
      });
      refetch();
      setTabKey('saved');
    },
    onError: (error: any) => {
      const errorMessage =
        error instanceof z.ZodError
          ? error.errors.map((e: any) => e.message).join(', ')
          : error.response?.data?.error || 'An unexpected error occurred';
      toast.error('Failed to save diet plan', {
        description: errorMessage,
      });
    },
  });

  const deleteDietPlan = useMutation({
    mutationFn: async (planId: string) => {
      await api.delete(`/api/diet-plans/${planId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    },
    onSuccess: () => {
      toast.success('Diet plan deleted');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete plan');
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen  ">

      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Icons.nutrition className="h-6 w-6 text-emerald-600" />
            <span className="text-lg font-semibold">DietGenAI</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-emerald-700 hover:bg-emerald-50"
          >
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container px-4 py-8">
        <Tabs value={tabKey} onValueChange={setTabKey} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-xs mx-auto mb-8 ">
            <TabsTrigger
              value="diet"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              Diet Generator
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              My Plans
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diet">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-lg overflow-hidden">

    <CardHeader className="bg-gradient-to-r from-emerald-600/90 to-teal-600/90 backdrop-blur-md border-b border-white/10 rounded-t-lg p-6 text-white shadow-lg">
  <CardTitle className="text-3xl font-bold tracking-tight drop-shadow-md">
    <Typewriter
      onInit={(typewriter) => {
        typewriter
          .typeString('Create Your Perfect Diet Plan')
          .start();
      }}
      options={{
        autoStart: true,
        cursor: '',
        delay: 50,
        loop: false, // Explicitly set to false
        skipAddStyles: false, // Ensure default styles are applied
      }}
    />
  </CardTitle>
  <CardDescription className="text-emerald-50/90 mt-2 text-lg font-light">
    <Typewriter
      onInit={(typewriter) => {
        typewriter
          .typeString('Get a nutrition plan tailored to your unique needs and preferences')
          .start();
      }}
      options={{
        autoStart: true,
        cursor: '|',
        delay: 50,
        loop: false, // Explicitly set to false
        skipAddStyles: false, // Ensure default styles are applied
      }}
    />
  </CardDescription>
</CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Details Column */}
                    <div className="space-y-4">
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
                            disabled={generateDiet.isPending}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sex">Sex</Label>
                          <Select
                            name="sex"
                            value={formData.sex}
                            onValueChange={(value) => handleInputChange({ name: 'sex', value })}
                            disabled={generateDiet.isPending}
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
                            disabled={generateDiet.isPending}
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
                            disabled={generateDiet.isPending}
                            className="bg-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bodyFat">Body Fat %</Label>
                          <Input
                            id="bodyFat"
                            name="bodyFat"
                            type="number"
                            value={formData.bodyFat}
                            onChange={handleInputChange}
                            placeholder="Optional"
                            disabled={generateDiet.isPending}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="waistHip">Waist-to-Hip Ratio</Label>
                          <Input
                            id="waistHip"
                            name="waistHip"
                            value={formData.waistHip}
                            onChange={handleInputChange}
                            placeholder="e.g., 0.85"
                            disabled={generateDiet.isPending}
                            className="bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="Your country"
                          disabled={generateDiet.isPending}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City (Optional)</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Your city"
                          disabled={generateDiet.isPending}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Primary Goal</Label>
                        <Select
                          name="primaryGoal"
                          value={formData.primaryGoal}
                          onValueChange={(value) => handleInputChange({ name: 'primaryGoal', value })}
                          disabled={generateDiet.isPending}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select your goal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fat Loss">Fat Loss</SelectItem>
                            <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
                            <SelectItem value="Endurance">Endurance</SelectItem>
                            <SelectItem value="Strength">Strength</SelectItem>
                            <SelectItem value="Recomposition">Recomposition</SelectItem>
                            <SelectItem value="Health Improvement">Health Improvement</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                        <Input
                          id="targetWeight"
                          name="targetWeight"
                          type="number"
                          value={formData.targetWeight}
                          onChange={handleInputChange}
                          placeholder="Your target weight"
                          disabled={generateDiet.isPending}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timeframe">Timeframe</Label>
                        <Input
                          id="timeframe"
                          name="timeframe"
                          value={formData.timeframe}
                          onChange={handleInputChange}
                          placeholder="e.g., 3 months"
                          disabled={generateDiet.isPending}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="motivation">Motivation</Label>
                        <Input
                          id="motivation"
                          name="motivation"
                          value={formData.motivation}
                          onChange={handleInputChange}
                          placeholder="Why is this important?"
                          disabled={generateDiet.isPending}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Food Preferences</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            'Low carb', 'Low fat', 'High fiber', 'Organic',
                            'Gluten-free', 'Dairy-free', 'Keto-friendly', 'Paleo'
                          ].map((pref) => (
                            <div key={pref} className="flex items-center space-x-2">
                              <Checkbox
                                id={pref}
                                checked={formData.foodPreferences.includes(pref)}
                                onCheckedChange={() => toggleArrayField('foodPreferences', pref)}
                                disabled={generateDiet.isPending}
                              />
                              <label
                                htmlFor={pref}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {pref}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Lifestyle and Health Column */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Health Conditions</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            'Diabetes', 'High blood pressure', 'High cholesterol',
                            'Heart disease', 'Food allergies', 'Digestive issues',
                            'Thyroid condition', 'Autoimmune disorder'
                          ].map((condition) => (
                            <div key={condition} className="flex items-center space-x-2">
                              <Checkbox
                                id={condition}
                                checked={formData.healthConditions.includes(condition)}
                                onCheckedChange={() => toggleArrayField('healthConditions', condition)}
                                disabled={generateDiet.isPending}
                              />
                              <label
                                htmlFor={condition}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {condition}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Favorite Cuisines</Label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            'Italian', 'Mexican', 'Asian', 'Mediterranean',
                            'Indian', 'Middle Eastern', 'Thai', 'Japanese',
                            'Chinese', 'Korean'
                          ].map((cuisine) => (
                            <Button
                              key={cuisine}
                              variant={formData.favoriteCuisines.includes(cuisine) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => toggleArrayField('favoriteCuisines', cuisine)}
                              disabled={generateDiet.isPending}
                              className={cn(
                                "rounded-full",
                                formData.favoriteCuisines.includes(cuisine) ? "bg-emerald-600 hover:bg-emerald-700" : "bg-white"
                              )}
                            >
                              {cuisine}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Snack Preferences</Label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            'Nuts', 'Fruits', 'Yogurt', 'Protein bars',
                            'Vegetables', 'Cheese', 'Dark chocolate', 'Smoothies'
                          ].map((snack) => (
                            <Button
                              key={snack}
                              variant={formData.snackPreferences.includes(snack) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => toggleArrayField('snackPreferences', snack)}
                              disabled={generateDiet.isPending}
                              className={cn(
                                "rounded-full",
                                formData.snackPreferences.includes(snack) ? "bg-emerald-600 hover:bg-emerald-700" : "bg-white"
                              )}
                            >
                              {snack}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Food Restrictions</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            'Vegetarian', 'Vegan', 'Pescatarian', 'Halal',
                            'Kosher', 'Nut allergy', 'Lactose intolerant', 'Diabetic'
                          ].map((restriction) => (
                            <div key={restriction} className="flex items-center space-x-2">
                              <Checkbox
                                id={restriction}
                                checked={formData.foodRestrictions.includes(restriction)}
                                onCheckedChange={() => toggleArrayField('foodRestrictions', restriction)}
                                disabled={generateDiet.isPending}
                              />
                              <label
                                htmlFor={restriction}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {restriction}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Current Routine</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            name="daysPerWeek"
                            type="number"
                            value={formData.daysPerWeek}
                            onChange={handleInputChange}
                            placeholder="Days/Week Training"
                            disabled={generateDiet.isPending}
                            className="bg-white"
                          />
                          <Input
                            name="workoutTypes"
                            value={formData.workoutTypes}
                            onChange={handleInputChange}
                            placeholder="e.g., Weightlifting, Cardio"
                            disabled={generateDiet.isPending}
                            className="bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Workout Intensity</Label>
                        <Select
                          name="intensity"
                          value={formData.intensity}
                          onValueChange={(value) => handleInputChange({ name: 'intensity', value })}
                          disabled={generateDiet.isPending}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select intensity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Moderate">Moderate</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Meals Per Day</Label>
                        <Select
                          name="mealsPerDay"
                          value={formData.mealsPerDay}
                          onValueChange={(value) => handleInputChange({ name: 'mealsPerDay', value })}
                          disabled={generateDiet.isPending}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 meals/day</SelectItem>
                            <SelectItem value="3">3 meals/day</SelectItem>
                            <SelectItem value="4">4 meals/day</SelectItem>
                            <SelectItem value="5+">5+ meals/day</SelectItem>
                            <SelectItem value="Intermittent fasting">Intermittent fasting</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Food Budget</Label>
                        <Select
                          name="foodBudget"
                          value={formData.foodBudget}
                          onValueChange={(value) => handleInputChange({ name: 'foodBudget', value })}
                          disabled={generateDiet.isPending}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select budget" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low ($50-100)">Low ($50-100)</SelectItem>
                            <SelectItem value="Medium ($100-150)">Medium ($100-150)</SelectItem>
                            <SelectItem value="High ($150+)">High ($150+)</SelectItem>
                            <SelectItem value="Flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-medium">Advanced Options</Label>
                      <Switch
                        checked={showAdvanced}
                        onCheckedChange={setShowAdvanced}
                        disabled={generateDiet.isPending}
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Protein Intake Preference</Label>
                            <Select
                              name="proteinIntake"
                              value={formData.proteinIntake}
                              onValueChange={(value) => handleInputChange({ name: 'proteinIntake', value })}
                              disabled={generateDiet.isPending}
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Carb/Fat Preference</Label>
                            <Select
                              name="carbFatPref"
                              value={formData.carbFatPref}
                              onValueChange={(value) => handleInputChange({ name: 'carbFatPref', value })}
                              disabled={generateDiet.isPending}
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select preference" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Low Carb">Low Carb</SelectItem>
                                <SelectItem value="Low Fat">Low Fat</SelectItem>
                                <SelectItem value="Balanced">Balanced</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Water Intake (L/day)</Label>
                            <Input
                              name="waterIntake"
                              value={formData.waterIntake}
                              onChange={handleInputChange}
                              placeholder="e.g., 2.5"
                              disabled={generateDiet.isPending}
                              className="bg-white"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Supplements</Label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              'Protein powder', 'Multivitamin', 'Creatine', 'Omega-3',
                              'Vitamin D', 'Pre-workout', 'BCAAs', 'Probiotics'
                            ].map((supplement) => (
                              <Button
                                key={supplement}
                                variant={formData.supplements.includes(supplement) ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleArrayField('supplements', supplement)}
                                disabled={generateDiet.isPending}
                                className={cn(
                                  "rounded-full",
                                  formData.supplements.includes(supplement) ? "bg-emerald-600 hover:bg-emerald-700" : "bg-white"
                                )}
                              >
                                {supplement}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Preferred Meal Times</Label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              'Early breakfast', 'Late breakfast', 'Early lunch',
                              'Late lunch', 'Early dinner', 'Late dinner', 'Snacks'
                            ].map((time) => (
                              <Button
                                key={time}
                                variant={formData.preferredMealTimes.includes(time) ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleArrayField('preferredMealTimes', time)}
                                disabled={generateDiet.isPending}
                                className={cn(
                                  "rounded-full",
                                  formData.preferredMealTimes.includes(time) ? "bg-emerald-600 hover:bg-emerald-700" : "bg-white"
                                )}
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Previous Diet Experience</Label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              'Keto', 'Paleo', 'Vegan', 'Vegetarian',
                              'Intermittent fasting', 'Low carb', 'Mediterranean', 'DASH'
                            ].map((diet) => (
                              <Button
                                key={diet}
                                variant={formData.previousDietExperience.includes(diet) ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleArrayField('previousDietExperience', diet)}
                                disabled={generateDiet.isPending}
                                className={cn(
                                  "rounded-full",
                                  formData.previousDietExperience.includes(diet) ? "bg-emerald-600 hover:bg-emerald-700" : "bg-white"
                                )}
                              >
                                {diet}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Sleep Quality</Label>
                            <Select
                              name="sleep"
                              value={formData.sleep}
                              onValueChange={(value) => handleInputChange({ name: 'sleep', value })}
                              disabled={generateDiet.isPending}
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select quality" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Poor">Poor</SelectItem>
                                <SelectItem value="Average">Average</SelectItem>
                                <SelectItem value="Good">Good</SelectItem>
                                <SelectItem value="Excellent">Excellent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Energy Levels</Label>
                            <Select
                              name="energyLevels"
                              value={formData.energyLevels}
                              onValueChange={(value) => handleInputChange({ name: 'energyLevels', value })}
                              disabled={generateDiet.isPending}
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Moderate">Moderate</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Medical Conditions</Label>
                          <Textarea
                            name="medicalConditions"
                            value={formData.medicalConditions}
                            onChange={handleInputChange}
                            placeholder="List any medical conditions"
                            disabled={generateDiet.isPending}
                            className="bg-white min-h-[100px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Typical Foods Eaten</Label>
                          <Textarea
                            name="typicalFoods"
                            value={formData.typicalFoods}
                            onChange={handleInputChange}
                            placeholder="Describe foods you typically eat"
                            disabled={generateDiet.isPending}
                            className="bg-white min-h-[100px]"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="mt-6 space-y-2">
                    <Label>Additional Notes</Label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us more about your dietary needs, preferences, or any special requirements..."
                      className="min-h-[100px] bg-white"
                      disabled={generateDiet.isPending}
                    />
                  </div>

                  <div className="mt-8 flex justify-center">
                    <Button
                      size="lg"
                      onClick={() => generateDiet.mutate()}
                      disabled={generateDiet.isPending || !formData.age || !formData.sex || !formData.primaryGoal}
                      className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                      {generateDiet.isPending ? (
                        <div className="flex items-center gap-2">
                          <Icons.spinner className="h-5 w-5 animate-spin" />
                          <span>Generating...</span>
                        </div>
                      ) : (
                        'Generate My Diet Plan'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {generateDiet.data && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6"
                >
                  <Card className="border-0 shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                      <CardTitle className="text-2xl">Your Custom Diet Plan</CardTitle>
                      <CardDescription className="text-emerald-100">
                        Generated on {dayjs(generateDiet.data.date).format('MMMM D, YYYY')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        {generateDiet.data.meals.map((meal, index) => (
                          <div key={index} className="space-y-2">
                            <h3 className="text-lg font-semibold text-emerald-800">
                              {meal.meal_time}
                            </h3>
                            <ul className="list-disc pl-5 space-y-1">
                              {meal.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="text-gray-700">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        {generateDiet.data.notes && (
                          <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                            <h4 className="font-medium text-emerald-800">Nutritionist's Notes:</h4>
                            <p className="text-gray-700 mt-1">{generateDiet.data.notes}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-6 flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => generateDiet.reset()}
                          disabled={saveDietPlan.isPending}
                        >
                          Close
                        </Button>
                        <Button
                          onClick={() => {
                            if (generateDiet.data) {
                              saveDietPlan.mutate({
                                date: generateDiet.data.date,
                                meals: generateDiet.data.meals,
                                notes: generateDiet.data.notes,
                                prompt: generateDiet.data.prompt,
                              });
                            }
                          }}
                          disabled={saveDietPlan.isPending || !generateDiet.data}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          {saveDietPlan.isPending ? (
                            <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Icons.save className="h-4 w-4 mr-2" />
                          )}
                          Save This Plan
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
    <Card key={plan.id} className="border-0 shadow-lg overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
<CardHeader className="bg-gradient-to-br from-emerald-500 to-teal-600 backdrop-blur-lg border-b border-white/20 rounded-t-xl p-4 md:p-5 text-white relative overflow-hidden group transition-all duration-300 hover:shadow-lg">
  {/* Dynamic background elements (lightweight) */}
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-70" />
  
  {/* Content container with responsive spacing */}
  <div className="relative z-10 flex flex-col space-y-1.5 md:space-y-2">
    <div className="flex justify-between items-start gap-2">
      <div className="space-y-0.5">
        {/* Date with responsive sizing */}
        <CardTitle className="text-xl md:text-2xl font-medium tracking-tight text-white">
          {dayjs(plan.date).format('MMMM D')}
          <span className="ml-2 text-sm md:text-base font-normal text-white/80">
            {dayjs(plan.date).format('YYYY')}
          </span>
        </CardTitle>
        
        {/* Contextual info row */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-xs px-2 py-1 bg-white/10 rounded-full backdrop-blur-sm flex items-center">
            <Icons.calendar className="h-3 w-3 mr-1" />
            {dayjs(plan.date).format('ddd')}
          </span>
          <span className="text-xs text-white/70 flex items-center">
            <Icons.clock className="h-3 w-3 mr-1" />
            Created {dayjs(plan.created_at).format('MMM D')}
          </span>
        </div>
      </div>

      {/* Delete button with elegant touch target */}
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          deleteDietPlan.mutate(plan.id);
        }}
        className="h-8 w-8 md:h-9 md:w-9 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-all"
        aria-label="Delete plan"
      >
        <Icons.trash className="h-3.5 w-3.5 md:h-4 md:w-4" />
      </Button>
    </div>

    {/* Minimal progress indicator (discreet) */}
    <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
      <div 
        className="h-full bg-white/80 rounded-full transition-all duration-700 ease-out"
        style={{ width: '65%' }} // Dynamic width
      />
    </div>
  </div>

  {/* Subtle hover effect (works on touch devices) */}
  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
</CardHeader>
  
 <CardContent className="p-4 md:p-6 bg-white/95 backdrop-blur-sm">
  <div className="space-y-5">
    {plan.meals.map((meal, index) => (
      <div key={index} className="group">
        {/* Meal time header with interactive marker */}
        <div className="flex items-center mb-2 -ml-1">
          <div className="h-2 w-2 rounded-full bg-emerald-500 mr-3 transition-all duration-300 group-hover:w-3 group-hover:h-3" />
          <h3 className="font-medium text-emerald-800 text-base md:text-lg tracking-tight">
            {meal.meal_time}
          </h3>
          <span className="ml-2 text-xs text-emerald-500/80 font-mono">
            {meal.items.length} {meal.items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Food items with animated list */}
        <ul className="space-y-1.5 pl-5 border-l border-emerald-100/70">
          {meal.items.map((item, itemIndex) => (
            <li 
              key={itemIndex}
              className="text-gray-800 relative pl-3 before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-emerald-400/80 hover:before:bg-emerald-500 transition-colors duration-200"
            >
              <span className="hover:text-emerald-700 transition-colors cursor-default">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    ))}
    
    {/* Notes section with elegant reveal effect */}
    {plan.notes && (
      <div className="mt-5 p-3 md:p-4 bg-gradient-to-br from-emerald-50/70 to-white rounded-lg border border-emerald-100/50 shadow-[0_1px_2px_rgba(5,150,105,0.05)]">
        <div className="flex items-center text-emerald-700 mb-1">
          <Icons.note className="h-4 w-4 mr-2 opacity-80" />
          <h4 className="text-sm font-medium tracking-wide">CHEF'S NOTES</h4>
        </div>
        <p className="text-gray-700 text-sm md:text-base pl-6 leading-snug">
          {plan.notes}
        </p>
      </div>
    )}
  </div>
</CardContent>
  
  {/* <CardFooter className="bg-gray-50 px-6 py-3 border-t border-gray-100">
    <div className="text-xs text-gray-500 flex items-center">
      <Icons.info className="h-3 w-3 mr-1" />
      <span>Tap items to edit or mark as completed</span>
    </div>
  </CardFooter> */}
</Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto h-24 w-24 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                    <Icons.fileText className="h-12 w-12 text-emerald-600" />
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-gray-900">No saved plans yet</h3>
                  <p className="mt-2 text-gray-600 max-w-md mx-auto">
                    Generate your first personalized diet plan to see it appear here
                  </p>
                  <Button
                    onClick={() => setTabKey('diet')}
                    className="mt-6 bg-emerald-600 hover:bg-emerald-700"
                  >
                    Create New Plan
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
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center overflow-hidden"
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
                  <Icons.nutrition className="h-16 w-16 text-emerald-600 animate-pulse" />
                </div>
              </div>

              <p>{loadingMessages[currentMessageIndex]}</p>

              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Estimated time remaining:</span>
                  <span className="font-medium text-emerald-600">
                    {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                  </span>
                </div>

                <Progress
                  value={100 - (countdown / 180 * 100)}
                  className="h-2 bg-gray-200"
                />

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Icons.sparkles className="h-4 w-4 text-yellow-500" />
                  <span>Powered by AI Nutrition Experts</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}