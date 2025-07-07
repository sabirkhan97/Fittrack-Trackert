import { Button } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/api/api';

interface SavePlanProps {
  plan: any;
  type: 'workout' | 'diet';
}

export default function SavePlan({ plan, type }: SavePlanProps) {
  const queryClient = useQueryClient();

  const savePlan = useMutation({
    mutationFn: async () => {
      if (!plan || Object.keys(plan).length === 0) {
        throw new Error('Plan data is missing');
      }

      const endpoint = type === 'workout' ? '/api/workout-plans' : '/api/diet-plans';

      const res = await api.post(endpoint, plan, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      return res.data;
    },
    onSuccess: () => {
      toast.success(`${type === 'workout' ? 'Workout' : 'Diet'} plan saved successfully!`);
      queryClient.invalidateQueries({
        queryKey: [type === 'workout' ? 'savedWorkouts' : 'savedDiets'],
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to save ${type} plan: ${error.message}`);
    },
  });

  return (
    <Button
      type="primary"
      icon={<SaveOutlined />}
      onClick={() => savePlan.mutate()}
      disabled={!plan}
      loading={savePlan.isPending}
      style={{ marginLeft: 8 }}
    >
      Save Plan
    </Button>
  );
}
