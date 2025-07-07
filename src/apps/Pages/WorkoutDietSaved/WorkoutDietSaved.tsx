import { useQuery } from '@tanstack/react-query';
import api from '@/api/api';
import { Card, Typography, Spin, Tabs } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

export default function WorkoutDietSaved() {
  const { data: savedWorkouts, isLoading: loadingWorkouts } = useQuery({
    queryKey: ['savedWorkouts'],
    queryFn: async () => {
      const res = await api.get('/api/workout-plans/my');
      return res.data.plans;
    },
  });

  const { data: savedDiets, isLoading: loadingDiets } = useQuery({
    queryKey: ['savedDiets'],
    queryFn: async () => {
      const res = await api.get('/api/diet-plans/my');
      return res.data.plans;
    },
  });

  return (
    <Tabs defaultActiveKey="workout">
      <Tabs.TabPane tab="Saved Workouts" key="workout">
        {loadingWorkouts ? (
          <Spin />
        ) : (
          savedWorkouts?.map((plan: any) => (
            <Card key={plan._id} style={{ marginBottom: 16 }}>
              <Text>
                Date: {dayjs(plan.date).format('DD MMM YYYY')}
              </Text>
              <ul>
                {plan.exercises.map((ex: any, idx: number) => (
                  <li key={idx}>
                    {ex.exercise_name} — {ex.sets} sets × {ex.reps} reps{' '}
                    {ex.weight ? `@ ${ex.weight} kg` : ''}
                  </li>
                ))}
              </ul>
            </Card>
          ))
        )}
      </Tabs.TabPane>

      <Tabs.TabPane tab="Saved Diets" key="diet">
        {loadingDiets ? (
          <Spin />
        ) : (
          savedDiets?.map((plan: any) => (
            <Card key={plan._id} style={{ marginBottom: 16 }}>
              <Text>
                Date: {dayjs(plan.date).format('DD MMM YYYY')}
              </Text>
              <ul>
                {plan.meals.map((meal: any, idx: number) => (
                  <li key={idx}>
                    <strong>{meal.meal_time}:</strong> {meal.items.join(', ')}
                  </li>
                ))}
              </ul>
              {plan.notes && (
                <p>
                  <strong>Notes:</strong> {plan.notes}
                </p>
              )}
            </Card>
          ))
        )}
      </Tabs.TabPane>
    </Tabs>
  );
}
