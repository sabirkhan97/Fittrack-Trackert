import { useNavigate } from 'react-router-dom';
import  ExerciseSelector  from './ExerciseSelector';

import type { Exercise } from '@/apps/types/exercise';


// interface Exercise {
//   name: string;
//   muscle_group: string;
// }

export function Exercises() {
  const navigate = useNavigate();

  const handleSelectExercise = (exercise: Exercise) => {
    navigate('/gym-notes', { state: { selectedExercise: exercise } });
  };
  

  return (
    <div className="container mx-auto px-4 py-8">
      <ExerciseSelector onSelect={handleSelectExercise} />
    </div>
  );
}

export default Exercises