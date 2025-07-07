"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, parseISO, subDays } from "date-fns";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Search, X, Plus, Dumbbell, Loader2 } from "lucide-react";
import axios from "axios";
import type { AxiosResponse } from "axios";
import { useTheme } from "@/context/theme-provider";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

// Import and register Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
  LineController,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Chart } from "chart.js/auto";

// Register all components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
  LineController
);

interface Exercise {
  _id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight?: number;
  exercise_date: string;
  workout_type?: string;
  muscle_group?: string;
}

interface ApiResponse {
  exercises: Exercise[];
  workoutTypes?: string[];
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    borderWidth?: number;
    tension?: number;
    fill?: boolean;
    yAxisID?: string;
  }[];
}

// Normalize string for comparison (remove extra spaces, parentheses, and case)
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[\(\)]/g, "")
    .trim();
};

// Debounce hook to delay search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Custom Chart Component with proper cleanup
const ExerciseChart = ({ data, options }: { data: ChartData; options: any }) => {
  const chartRef = useRef<ChartJS | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        if (chartRef.current) {
          chartRef.current.destroy();
        }
        chartRef.current = new ChartJS(ctx, {
          type: "line",
          data,
          options,
        });
      }
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, options]);

  return <canvas ref={canvasRef} />;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [filters, setFilters] = useState({
    dateRange: { from: subDays(new Date(), 30), to: new Date() },
    workoutType: "all",
    exerciseName: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isClient, setIsClient] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !localStorage.getItem("token")) {
      toast.error("Session expired. Please log in again.");
      navigate("/login");
    }
  }, [isClient, navigate]);

  const { data, isLoading, error } = useQuery<
    { exercises: Exercise[]; workoutTypes: string[]; exerciseNames: string[] },
    Error
  >({
    queryKey: ["dashboard", filters, debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("date_start", format(filters.dateRange.from, "yyyy-MM-dd"));
      params.append("date_end", format(filters.dateRange.to, "yyyy-MM-dd"));
      if (filters.workoutType !== "all")
        params.append("workout_type", filters.workoutType);
      if (filters.exerciseName !== "all")
        params.append("exercise_name", filters.exerciseName);
      if (debouncedSearchTerm) params.append("exercise_name", debouncedSearchTerm);

      const res: AxiosResponse<ApiResponse> = await axios.get(
        `/api/exercises?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Log exercise names for debugging
      console.log("Exercise Names:", [
        "all",
        ...new Set(res.data.exercises.map((ex) => ex.exercise_name)),
      ]);

      return {
        exercises: res.data.exercises || [],
        workoutTypes: [
          "all",
          ...new Set(
            res.data.exercises
              .map((ex) => ex.workout_type)
              .filter((type): type is string => type !== undefined) || []
          ),
        ],
        exerciseNames: [
          "all",
          ...new Set(res.data.exercises.map((ex) => ex.exercise_name)),
        ],
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/exercises/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    },
    onSuccess: () => {
      toast.success("Exercise deleted");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to delete exercise");
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    },
  });

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      dateRange: { from: subDays(new Date(), 30), to: new Date() },
      workoutType: "all",
      exerciseName: "all",
    });
    setIsFilterOpen(false);
  };

  const metrics = useMemo(() => {
    if (!data?.exercises.length)
      return {
        totalWorkouts: 0,
        totalSets: 0,
        totalVolume: 0,
        uniqueExercises: 0,
        workoutFrequency: 0,
      };

    const result = data.exercises.reduce(
      (acc, ex) => ({
        totalWorkouts: acc.totalWorkouts + 1,
        totalSets: acc.totalSets + ex.sets,
        totalVolume: acc.totalVolume + ex.sets * ex.reps * (ex.weight || 0),
      }),
      { totalWorkouts: 0, totalSets: 0, totalVolume: 0 }
    );

    const days =
      Math.ceil(
        (filters.dateRange.to.getTime() - filters.dateRange.from.getTime()) /
        (1000 * 60 * 60 * 24)
      ) || 1;

    return {
      ...result,
      uniqueExercises: new Set(data.exercises.map((ex) => ex.exercise_name)).size,
      workoutFrequency: (result.totalWorkouts / (days / 7)).toFixed(1),
    };
  }, [data?.exercises, filters.dateRange]);

  const filteredExercises = useMemo(() => {
    return (
      data?.exercises.filter((ex) =>
        debouncedSearchTerm
          ? normalizeString(ex.exercise_name).includes(
            normalizeString(debouncedSearchTerm)
          )
          : filters.exerciseName === "all" ||
          normalizeString(ex.exercise_name) ===
          normalizeString(filters.exerciseName)
      ) || []
    );
  }, [data?.exercises, debouncedSearchTerm, filters.exerciseName]);

  const exerciseTrendData: ChartData = useMemo(() => {
    if (!filteredExercises.length) return { labels: [], datasets: [] };

    const filtered = filteredExercises.sort(
      (a, b) =>
        new Date(a.exercise_date).getTime() - new Date(b.exercise_date).getTime()
    );

    return {
      labels: filtered.map((ex) => format(parseISO(ex.exercise_date), "MMM d")),
      datasets: [
        {
          label: "Reps",
          data: filtered.map((ex) => ex.reps),
          borderColor: isDarkMode ? "#f97316" : "#e86c11",
          backgroundColor: isDarkMode
            ? "rgba(249, 115, 22, 0.2)"
            : "rgba(232, 108, 17, 0.2)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          yAxisID: "y",
        },
        {
          label: "Weight (kg)",
          data: filtered.map((ex) => ex.weight || 0),
          borderColor: isDarkMode ? "#3b82f6" : "#2563eb",
          backgroundColor: isDarkMode
            ? "rgba(59, 130, 246, 0.2)"
            : "rgba(37, 99, 235, 0.2)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          yAxisID: "y1",
        },
      ],
    };
  }, [filteredExercises, isDarkMode]);

  const exerciseTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: isDarkMode ? "#e5e7eb" : "#374151",
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
        titleColor: isDarkMode ? "#f3f4f6" : "#111827",
        bodyColor: isDarkMode ? "#d1d5db" : "#4b5563",
      },
    },
    scales: {
      x: {
        type: "category",
        grid: { display: false },
        ticks: {
          color: isDarkMode ? "#9ca3af" : "#6b7280",
          font: { size: 10 },
        },
      },
      y: {
        position: "left" as const,
        ticks: {
          color: isDarkMode ? "#9ca3af" : "#6b7280",
          font: { size: 10 },
        },
        grid: {
          color: isDarkMode
            ? "rgba(156, 163, 175, 0.1)"
            : "rgba(107, 114, 128, 0.1)",
        },
      },
      y1: {
        position: "right" as const,
        grid: { drawOnChartArea: false },
        ticks: {
          color: isDarkMode ? "#9ca3af" : "#6b7280",
          font: { size: 10 },
        },
      },
    },
  };

  if (!isClient) return null;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4"
      >
        <div className="container mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md border-0 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">
              Error Loading Data
            </CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button
              onClick={() => queryClient.refetchQueries({ queryKey: ["dashboard"] })}
              className="flex-1 rounded-full"
            >
              Retry
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              className="flex-1 rounded-full"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-background to-background/80"
    >
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">WorkoutTracker</span>
          </motion.div>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/gym-notes")}
              className="rounded-full text-sm font-medium"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Workout
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              className="rounded-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Mobile Filter Toggle */}
          <div className="flex items-center justify-between md:hidden">
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="rounded-full"
            >
              Filters
              {isFilterOpen ? (
                <X className="ml-2 h-4 w-4" />
              ) : (
                <Search className="ml-2 h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {isFilterOpen || window.innerWidth >= 768 ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="md:block overflow-hidden"
              >
                <Card className="border-0 shadow-lg rounded-2xl bg-background/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold">Filters</CardTitle>
                      <CardDescription>Refine your workout data</CardDescription>
                    </div>
                    {(searchTerm ||
                      filters.workoutType !== "all" ||
                      filters.exerciseName !== "all") && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                          Clear All
                        </Button>
                      )}
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Search Exercises
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search exercises (e.g., Bench Press)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 rounded-full bg-background/50"
                          />
                          {searchTerm && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSearchTerm("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                            >
                              <X size={14} />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Exercise Name
                        </label>
                        <Select
                          value={filters.exerciseName}
                          onValueChange={(value) =>
                            setFilters({ ...filters, exerciseName: value })
                          }
                        >
                          <SelectTrigger className="rounded-full bg-background/50">
                            <SelectValue placeholder="Select exercise" />
                          </SelectTrigger>
                          <SelectContent>
                            {data?.exerciseNames.map((name) => (
                              <SelectItem key={name} value={name}>
                                {name === "all" ? "All Exercises" : name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Workout Type
                        </label>
                        <Select
                          value={filters.workoutType}
                          onValueChange={(value) =>
                            setFilters({ ...filters, workoutType: value })
                          }
                        >
                          <SelectTrigger className="rounded-full bg-background/50">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {data?.workoutTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type === "all" ? "All Types" : type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Date Range
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative">
                            <Input
                              type="date"
                              value={format(filters.dateRange.from, "yyyy-MM-dd")}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  dateRange: {
                                    from: e.target.value
                                      ? new Date(e.target.value)
                                      : subDays(new Date(), 30),
                                    to: filters.dateRange.to,
                                  },
                                })
                              }
                              className="pl-10 rounded-full bg-background/50"
                              max={format(filters.dateRange.to, "yyyy-MM-dd")}
                            />
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="relative">
                            <Input
                              type="date"
                              value={format(filters.dateRange.to, "yyyy-MM-dd")}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  dateRange: {
                                    from: filters.dateRange.from,
                                    to: e.target.value
                                      ? new Date(e.target.value)
                                      : new Date(),
                                  },
                                })
                              }
                              className="pl-10 rounded-full bg-background/50"
                              min={format(filters.dateRange.from, "yyyy-MM-dd")}
                            />
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Total Workouts",
                value: metrics.totalWorkouts,
                subtext: `${metrics.workoutFrequency} workouts/week`,
                icon: Icons.activity,
                color: "text-emerald-600",
              },
              {
                title: "Total Sets",
                value: metrics.totalSets,
                subtext: "",
                icon: Icons.layers,
                color: "text-blue-600",
              },
              {
                title: "Total Volume",
                value: `${metrics.totalVolume.toLocaleString()} kg`,
                subtext: "",
                icon: Icons.dumbbell,
                color: "text-orange-600",
              },
              {
                title: "Unique Exercises",
                value: metrics.uniqueExercises,
                subtext: "",
                icon: Icons.list,
                color: "text-purple-600",
              },
            ].map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg rounded-2xl bg-background/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2 text-sm font-medium">
                      <metric.icon className={`h-5 w-5 ${metric.color}`} />
                      {metric.title}
                    </CardDescription>
                    <CardTitle className="text-2xl font-bold">
                      {metric.value}
                    </CardTitle>
                  </CardHeader>
                  {metric.subtext && (
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        {metric.subtext}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Exercise Progress Chart */}
          {filteredExercises.length > 0 &&
            (debouncedSearchTerm || filters.exerciseName !== "all") && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg rounded-2xl bg-background/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                      {debouncedSearchTerm ||
                        filters.exerciseName === "all"
                        ? "Exercise"
                        : filters.exerciseName}{" "}
                      Progress
                    </CardTitle>
                    <CardDescription>
                      Track your reps and weight over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ExerciseChart
                      data={exerciseTrendData}
                      options={exerciseTrendOptions}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

          {/* Recent Workouts */}
          {filteredExercises.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg rounded-2xl bg-background/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold">
                        Recent Workouts
                      </CardTitle>
                      <CardDescription>Your exercise history</CardDescription>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      {metrics.uniqueExercises} exercises
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-border/50">
                          <TableHead className="text-sm font-semibold">
                            Date
                          </TableHead>
                          <TableHead className="text-sm font-semibold">
                            Exercise
                          </TableHead>
                          <TableHead className="text-sm font-semibold">
                            Sets
                          </TableHead>
                          <TableHead className="text-sm font-semibold">
                            Reps
                          </TableHead>
                          <TableHead className="text-sm font-semibold">
                            Weight
                          </TableHead>
                          <TableHead className="text-sm font-semibold">
                            Type
                          </TableHead>
                          <TableHead className="text-sm font-semibold">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredExercises.slice(0, 10).map((ex) => (
                          <TableRow
                            key={ex._id}
                            className="group hover:bg-background/50 transition-colors"
                          >
                            <TableCell className="text-sm">
                              {format(parseISO(ex.exercise_date), "MMM d")}
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              {ex.exercise_name}
                            </TableCell>
                            <TableCell className="text-sm">{ex.sets}</TableCell>
                            <TableCell className="text-sm">{ex.reps}</TableCell>
                            <TableCell className="text-sm">
                              {ex.weight ? `${ex.weight} kg` : "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {ex.workout_type || "-"}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteMutation.mutate(ex._id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                disabled={deleteMutation.isPending}
                              >
                                {deleteMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Icons.trash className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg rounded-2xl bg-background/80 backdrop-blur-sm">
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    No exercises found for the selected filters.
                  </p>
                  <Button
                    variant="link"
                    onClick={() => navigate("/gym-notes")}
                    className="mt-2 text-primary"
                  >
                    Add a new workout
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </motion.div>
  );
};

export default Dashboard;
