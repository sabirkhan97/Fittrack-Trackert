import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
// import { Label } from '@/components/ui/label';
import { Loader2, Search, X } from 'lucide-react';
import type { Exercise } from '@/apps/types/exercise';
import exerciseData from '../ExerciseSelector/data/exercise.json'


// interface Exercise {
//   id: string;
//   name: string;
//   muscleGroup: string;
//   category: string;
//   equipment: string;
//   difficulty: string;
// }

interface ExerciseSelectorProps {
  onSelect: (exercise: Exercise) => void;
  selectedExercises?: Exercise[];
}

export default function ExerciseSelector({ onSelect, selectedExercises = [] }: ExerciseSelectorProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Extract unique filter options
  const muscleGroups = [...new Set(exercises.map(ex => ex.muscleGroup))].sort();
  const equipmentTypes = [...new Set(exercises.map(ex => ex.equipment))].sort();
  const difficultyLevels = [...new Set(exercises.map(ex => ex.difficulty))].sort();

  // Fetch exercises on mount
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const formattedExercises: Exercise[] = exerciseData.exercises.map((ex: any) => ({
          id: ex.id,
          name: ex.name,
          muscleGroup: ex.muscle_group,
          category: ex.muscle_group,
          equipment: ex.equipment,
          difficulty: ex.difficulty,
        }));

        setExercises(formattedExercises);
        setFilteredExercises(formattedExercises);
      } catch (err) {
        console.error('Error loading exercises:', err);
        setError('Failed to load exercises. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, []);


  // Apply filters when any filter changes
  useEffect(() => {
    let results = exercises;

    // Apply search filter
    if (searchTerm) {
      results = results.filter(ex =>
        (ex.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ex.muscleGroup?.toLowerCase().includes(searchTerm.toLowerCase()))
       
      );
    }

    // Apply muscle group filter
    if (selectedMuscleGroup) {
      results = results.filter(ex => ex.muscleGroup === selectedMuscleGroup);
    }

    // Apply equipment filter
    if (selectedEquipment) {
      results = results.filter(ex => ex.equipment === selectedEquipment);
    }

    // Apply difficulty filter
    if (selectedDifficulty) {
      results = results.filter(ex => ex.difficulty === selectedDifficulty);
    }

    setFilteredExercises(results);
  }, [searchTerm, selectedMuscleGroup, selectedEquipment, selectedDifficulty, exercises]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedMuscleGroup('');
    setSelectedEquipment('');
    setSelectedDifficulty('');
  };

  const isExerciseSelected = (exerciseId: string) => {
    return selectedExercises.some(ex => ex.id === exerciseId);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Icons.dumbbell />
          Exercise Selector
        </CardTitle>
        <CardDescription>
          Browse and select exercises to add to your workout
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={selectedMuscleGroup || 'all'} onValueChange={val => setSelectedMuscleGroup(val === 'all' ? '' : val)}>
            <SelectTrigger>
              <SelectValue placeholder="Muscle Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Muscle Groups</SelectItem>
              {muscleGroups.map(group => (
                <SelectItem key={group} value={group}>{group}</SelectItem>
              ))}
            </SelectContent>
          </Select>



          <Select value={selectedEquipment || 'all'} onValueChange={val => setSelectedEquipment(val === 'all' ? '' : val)}>
            <SelectTrigger>
              <SelectValue placeholder="Equipment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Equipment</SelectItem>
              {equipmentTypes.map(equip => (
                <SelectItem key={equip} value={equip}>{equip}</SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={selectedDifficulty || 'all'} onValueChange={val => setSelectedDifficulty(val === 'all' ? '' : val)}>
            <SelectTrigger>
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {difficultyLevels.map(level => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>


          <Button
            variant="outline"
            onClick={resetFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>

          <div className="text-sm text-muted-foreground flex items-center justify-end">
            {filteredExercises.length} exercises found
          </div>
        </div>

        {/* Loading and Error States */}
        {isLoading && (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-destructive p-4 border rounded-lg bg-destructive/10 flex items-center gap-2">
            <Icons.warning className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* Exercise Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onClick={() => onSelect(exercise)}
                isSelected={isExerciseSelected(exercise.id)}
              />
            ))}

            {filteredExercises.length === 0 && (
              <div className="col-span-full text-center py-8">
                <Icons.Search className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No exercises found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ExerciseCardProps {
  exercise: Exercise;
  onClick: () => void;
  isSelected: boolean;
}

function ExerciseCard({ exercise, onClick, isSelected }: ExerciseCardProps) {
  return (
    <div
      className={`border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${isSelected
        ? 'border-primary bg-primary/5'
        : 'hover:border-primary bg-card'
        }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Icons.dumbbell />
          <h4 className="font-medium">{exercise.name}</h4>
        </div>
        <Badge variant={isSelected ? 'default' : 'outline'}>
          {isSelected ? 'Selected' : exercise.difficulty}
        </Badge>
      </div>

      <div className="mt-3 space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <Icons.muscle className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{exercise.muscleGroup}</span>
        </div>
        <div className="flex items-center gap-2">
          <Icons.equipment className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{exercise.equipment}</span>
        </div>
      </div>

      <Button
        variant={isSelected ? 'default' : 'outline'}
        size="sm"
        className="mt-4 w-full"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        {isSelected ? (
          <>
            <Icons.check className="mr-2 h-4 w-4" />
            Selected
          </>
        ) : (
          'Select Exercise'
        )}
      </Button>
    </div>
  );
}