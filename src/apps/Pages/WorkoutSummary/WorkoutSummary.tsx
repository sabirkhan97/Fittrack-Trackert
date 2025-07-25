import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format, isValid, isAfter, isBefore, subDays } from "date-fns";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  Trash2,
  Search,
  Filter,
  X,
  Plus,
  Dumbbell,
  Calendar,
  Activity,
  Armchair,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as DatePicker } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";


interface Workout {
  _id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight?: number;
  workout_type?: string;
  muscle_group?: string;
  exercise_date: string;
  set_type?: string;
  additional_exercises?: string[];
  notes?: string;
}

const WorkoutSummary = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedMuscle, setSelectedMuscle] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  const navigate = useNavigate();


  // Data fetching
  const { data: workouts = [], isLoading, error } = useQuery<Workout[]>({
    queryKey: ["workouts"],
    queryFn: async () => {
      const res = await axios.get("/api/exercises", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.exercises || [];
    },
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/exercises/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success("Workout deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
    onError: () => {
      toast.error("Failed to delete workout");
    },
    onSettled: () => {
      setDeleteDialogOpen(false);
    },
  });

  // Derived data
  const workoutTypes = useMemo(() => {
    const types = new Set<string>();
    workouts.forEach((w) => w.workout_type && types.add(w.workout_type));
    return ["all", ...Array.from(types)];
  }, [workouts]);

  const muscleGroups = useMemo(() => {
    const groups = new Set<string>();
    workouts.forEach((w) => w.muscle_group && groups.add(w.muscle_group));
    return ["all", ...Array.from(groups)];
  }, [workouts]);

  // Filtering logic
  const filtered = useMemo(() => {
    return workouts.filter((w) => {
      const workoutDate = w.exercise_date ? new Date(w.exercise_date) : null;

      // Date range filter
      if (dateRange?.from && workoutDate && isBefore(workoutDate, dateRange.from)) {
        return false;
      }
      if (dateRange?.to && workoutDate && isAfter(workoutDate, dateRange.to)) {
        return false;
      }

      // Type and muscle filters
      if (selectedType !== "all" && w.workout_type !== selectedType) return false;
      if (selectedMuscle !== "all" && w.muscle_group !== selectedMuscle) return false;

      // Search term filter
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        return (
          w.exercise_name?.toLowerCase().includes(s) ||
          w.notes?.toLowerCase().includes(s) ||
          (w.additional_exercises ?? []).some((ex) =>
            ex.toLowerCase().includes(s)
          )
        );
      }
      return true;
    });
  }, [workouts, searchTerm, selectedType, selectedMuscle, dateRange]);

  // Grouping logic
  const grouped = useMemo(() => {
    const groups: Record<string, Workout[]> = {};
    filtered.forEach((w) => {
      const dateObj = w.exercise_date ? new Date(w.exercise_date) : null;
      const formattedDate =
        dateObj && !isNaN(dateObj.getTime())
          ? format(dateObj, "MMMM d, yyyy")
          : "-";
      const key = `${formattedDate} - ${w.workout_type || "Other"} - ${w.muscle_group || "General"
        }`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(w);
    });
    return groups;
  }, [filtered]);

  // Stats calculation
  const stats = useMemo(() => {
    return filtered.reduce(
      (acc, workout) => {
        acc.totalWorkouts += 1;
        acc.totalSets += workout.sets || 0;
        acc.totalReps += (workout.sets || 0) * (workout.reps || 0);
        acc.totalVolume +=
          (workout.sets || 0) * (workout.reps || 0) * (workout.weight || 0);
        return acc;
      },
      {
        totalWorkouts: 0,
        totalSets: 0,
        totalReps: 0,
        totalVolume: 0,
      }
    );
  }, [filtered]);

  // Helper functions
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedMuscle("all");
    setDateRange({
      from: subDays(new Date(), 30),
      to: new Date(),
    });
  };

  const handleDeleteClick = (id: string) => {
    setWorkoutToDelete(id);
    setDeleteDialogOpen(true);
  };

  const hasFilters =
    searchTerm ||
    selectedType !== "all" ||
    selectedMuscle !== "all" ||
    dateRange?.from !== subDays(new Date(), 30) ||
    dateRange?.to !== new Date();

  // Loading and error states
  if (isLoading) {
    return (
      <div className="container mx-auto my-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto my-6 text-center py-12">
        <div className="text-destructive bg-destructive/10 p-4 rounded-lg inline-block">
          <p className="font-medium">Error loading workouts</p>
          <p className="text-sm mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Workout History</h2>
          <p className="text-muted-foreground text-sm">
            Track and analyze your fitness journey
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/gym-notes")}>
          <Plus size={16} />
          Add Workout
        </Button>

      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workouts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">+10% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sets</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSets}</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reps</CardTitle>
            <Armchair className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReps}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume (kg)</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVolume}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="list" className="mb-6">
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="list" onClick={() => setActiveTab("list")}>
            List View
          </TabsTrigger>
          <TabsTrigger value="stats" onClick={() => setActiveTab("stats")}>
            Analytics
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
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

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger>
            <SelectValue placeholder="Workout type" />
          </SelectTrigger>
          <SelectContent>
            {workoutTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type === "all" ? "All Types" : type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedMuscle} onValueChange={setSelectedMuscle}>
          <SelectTrigger>
            <SelectValue placeholder="Muscle group" />
          </SelectTrigger>
          <SelectContent>
            {muscleGroups.map((m) => (
              <SelectItem key={m} value={m}>
                {m === "all" ? "All Muscles" : m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}

              <input type="date" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <DatePicker
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover> */}
        {/* Date range inputs */}
       {/* Date range inputs */}

<div className="flex items-center gap-3 w-full">
  {/* From Date */}
  <div className="flex-1">
    <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      From
    </label>
    <div className="relative">
      <Input
        id="start-date"
        type="date"
        value={dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
        onChange={(e) =>
          setDateRange((prev) => ({
            from: e.target.value ? new Date(e.target.value) : undefined,
            to: prev?.to && e.target.value ? 
              (new Date(e.target.value) > prev.to ? undefined : prev.to) : 
              prev?.to,
          }))
        }
        className="w-full pl-10"
        max={dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined}
      />
      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
    </div>
  </div>

  <div className="flex items-center justify-center pt-5">
    <span className="text-gray-400 dark:text-gray-500">→</span>
  </div>

  {/* To Date */}
  <div className="flex-1">
    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      To
    </label>
    <div className="relative">
      <Input
        id="end-date"
        type="date"
        value={dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
        onChange={(e) =>
          setDateRange((prev) => ({
            from: prev?.from,
            to: e.target.value ? new Date(e.target.value) : undefined,
          }))
        }
        className="w-full pl-10"
        min={dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined}
      />
      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
    </div>
  </div>

  {/* Clear button (conditionally shown) */}
  {(dateRange?.from || dateRange?.to) && (
    <button
      onClick={() => setDateRange({ from: undefined, to: undefined })}
      className="mt-6 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      aria-label="Clear dates"
    >
      <X className="h-4 w-4" />
    </button>
  )}
</div>



      </div>

      {/* Active filters indicator */}
      <AnimatePresence>
        {hasFilters && (
          <motion.div
            className="flex items-center gap-2 mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Badge variant="outline" className="gap-1 bg-accent/50 text-xs">
              <Filter size={12} /> Filters applied
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-primary h-8 px-2"
            >
              Clear all
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
          <Dumbbell className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">No workouts found</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {hasFilters
              ? "Try adjusting your filters or add a new workout"
              : "You haven't logged any workouts yet. Start tracking your progress!"}
          </p>
          <Button className="mt-2 gap-2" onClick={() => navigate("/gym-notes")}>
            <Plus size={16} />
            Add Workout
          </Button>
        </div>
      )}

      {/* Workout List */}
      {activeTab === "list" && filtered.length > 0 && (
        <Accordion type="multiple" className="space-y-4">
          {Object.entries(grouped).map(([group, groupWorkouts]) => (
            <motion.div
              key={group}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AccordionItem
                value={group}
                className="border rounded-lg overflow-hidden bg-background hover:shadow-sm transition-shadow"
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex justify-between items-center w-full">
                    <div className="text-left">
                      <p className="font-semibold text-base">{group.split(" - ")[0]}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs font-normal">
                          {group.split(" - ")[1]}
                        </Badge>
                        <Badge variant="outline" className="text-xs font-normal">
                          {group.split(" - ")[2]}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {groupWorkouts.length} exercises
                      </Badge>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="overflow-x-auto px-0">
                  <Table className="min-w-[800px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">Exercise</TableHead>
                        <TableHead>Sets</TableHead>
                        <TableHead>Reps</TableHead>
                        <TableHead>Weight</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Extras</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="pr-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupWorkouts.map((w) => (
                        <TableRow key={w._id} className="hover:bg-muted/50">
                          <TableCell className="pl-6 font-medium">
                            {w.exercise_name}
                          </TableCell>
                          <TableCell>{w.sets}</TableCell>
                          <TableCell>{w.reps}</TableCell>
                          <TableCell>
                            {w.weight ? (
                              <Badge variant="outline">{w.weight} kg</Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {w.set_type ? (
                              <Badge variant="secondary">{w.set_type}</Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {["superset", "alternate"].includes(
                              (w.set_type || "").toLowerCase()
                            ) && w.additional_exercises?.length ? (
                              <div className="flex flex-wrap gap-1 max-w-[150px]">
                                {w.additional_exercises.map((ex, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="truncate text-xs"
                                  >
                                    {ex}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {w.notes || "-"}
                          </TableCell>
                          <TableCell className="pr-6">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(w._id)}
                              disabled={deleteMutation.isPending}
                              className="hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      )}

      {/* Analytics View */}
      {activeTab === "stats" && filtered.length > 0 && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Workout Volume Over Time</CardTitle>
              <CardDescription>
                Track your progress by total workout volume
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">Volume chart coming soon</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Muscle Group Distribution</CardTitle>
                <CardDescription>
                  Which muscle groups you're focusing on
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">Muscle group chart coming soon</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workout Type Breakdown</CardTitle>
                <CardDescription>
                  Distribution of your workout types
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">Workout type chart coming soon</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              workout record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => workoutToDelete && deleteMutation.mutate(workoutToDelete)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkoutSummary;