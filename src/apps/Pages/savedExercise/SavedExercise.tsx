import { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Button,
  Select,
  Typography,
  Space,
  message,
  Collapse,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

interface PlanRow {
  key: string;
  exercise_name: string;
  sets: string;
  reps: string;
  notes: string;
}

interface SavedPlan {
  id: string;
  workout_type: string;
  target_muscle: string;
  created_at: string;
  plan: Omit<PlanRow, 'key'>[];
}

export default function WorkoutPlan() {
  const [rows, setRows] = useState<PlanRow[]>([
    { key: '1', exercise_name: '', sets: '', reps: '', notes: '' },
  ]);
  const [workoutType, setWorkoutType] = useState<string>('Push');
  const [targetMuscle, setTargetMuscle] = useState<string>('Chest');
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);

  const exerciseOptions = [
    'Bench Press',
    'Incline Dumbbell Press',
    'Push Ups',
    'Squats',
    'Deadlifts',
    'Lat Pulldown',
    'Bicep Curl',
    'Tricep Pushdown',
    'Shoulder Press',
  ];

  const workoutTypes = ['Push', 'Pull', 'Legs', 'Bro Split', 'Full Body'];
  const targetMuscles = ['Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core'];

  // ✅ Load saved plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.get('/api/plans', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedPlans(res.data);
      } catch (err) {
        console.error('Failed to fetch plans:', err);
      }
    };
    fetchPlans();
  }, []);

  // ✅ Add a row
  const handleAddRow = () => {
    const newRow: PlanRow = {
      key: Date.now().toString(),
      exercise_name: '',
      sets: '',
      reps: '',
      notes: '',
    };
    setRows([...rows, newRow]);
  };

  // ✅ Delete a row
  const handleDeleteRow = (key: string) => {
    setRows(rows.filter((row) => row.key !== key));
  };

  // ✅ Update input fields
  const handleInputChange = (key: string, field: keyof PlanRow, value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, [field]: value } : row))
    );
  };

  // ✅ Save plan to backend & local state
  const handleSavePlan = async () => {
    const token = localStorage.getItem('token');
    if (!token) return message.error('Login required');

    const payload = {
      workout_type: workoutType,
      target_muscle: targetMuscle,
      plan: rows.map(({ exercise_name, sets, reps, notes }) => ({
        exercise_name,
        sets,
        reps,
        notes,
      })),
    };

    try {
      const res = await axios.post('/api/plans', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Add the newly saved plan to local state
      const newSavedPlan: SavedPlan = {
        id: res.data.id || Date.now().toString(),
        workout_type: workoutType,
        target_muscle: targetMuscle,
        created_at: res.data.created_at || new Date().toISOString(),
        plan: payload.plan,
      };

      setSavedPlans((prev) => [newSavedPlan, ...prev]);
      message.success('Workout plan saved!');

      // Optionally reset form:
      setRows([{ key: '1', exercise_name: '', sets: '', reps: '', notes: '' }]);

    } catch (err) {
      console.error(err);
      message.error('Failed to save plan');
    }
  };

  const columns = [
    {
      title: 'Exercise Name',
      dataIndex: 'exercise_name',
      render: (text: string, record: PlanRow) => (
        <Select
          value={text}
          style={{ width: 200 }}
          onChange={(value) =>
            handleInputChange(record.key, 'exercise_name', value)
          }
        >
          {exerciseOptions.map((ex) => (
            <Option key={ex} value={ex}>
              {ex}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Sets',
      dataIndex: 'sets',
      render: (text: string, record: PlanRow) => (
        <Input
          placeholder="e.g. 4"
          value={text}
          onChange={(e) => handleInputChange(record.key, 'sets', e.target.value)}
        />
      ),
    },
    {
      title: 'Reps',
      dataIndex: 'reps',
      render: (text: string, record: PlanRow) => (
        <Input
          placeholder="e.g. 12"
          value={text}
          onChange={(e) => handleInputChange(record.key, 'reps', e.target.value)}
        />
      ),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      render: (text: string, record: PlanRow) => (
        <Input
          placeholder="Optional notes"
          value={text}
          onChange={(e) => handleInputChange(record.key, 'notes', e.target.value)}
        />
      ),
    },
    {
      title: '',
      render: (_: any, record: PlanRow) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteRow(record.key)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Workout Plan</Title>

      <Space style={{ marginBottom: 16 }}>
        <Select
          value={workoutType}
          onChange={(value) => setWorkoutType(value)}
          style={{ width: 200 }}
        >
          {workoutTypes.map((type) => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>

        <Select
          value={targetMuscle}
          onChange={(value) => setTargetMuscle(value)}
          style={{ width: 200 }}
        >
          {targetMuscles.map((muscle) => (
            <Option key={muscle} value={muscle}>
              {muscle}
            </Option>
          ))}
        </Select>
      </Space>

      <Table
        dataSource={rows}
        columns={columns}
        pagination={false}
        rowKey="key"
      />

      <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
        <Button icon={<PlusOutlined />} onClick={handleAddRow}>
          Add Exercise
        </Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSavePlan}
        >
          Save Plan
        </Button>
      </div>

      {savedPlans.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <Title level={4}>Saved Plans</Title>
          <Collapse accordion>
            {savedPlans.map((plan) => (
              <Panel
                key={plan.id}
                header={`${plan.workout_type} - ${plan.target_muscle} (${dayjs(
                  plan.created_at
                ).format('DD MMM YYYY, hh:mm A')})`}
              >
                <Table
                  size="small"
                  dataSource={plan.plan.map((p, index) => ({
                    ...p,
                    key: index.toString(),
                  }))}
                  pagination={false}
                  columns={[
                    { title: 'Exercise Name', dataIndex: 'exercise_name' },
                    { title: 'Sets', dataIndex: 'sets' },
                    { title: 'Reps', dataIndex: 'reps' },
                    { title: 'Notes', dataIndex: 'notes' },
                  ]}
                />
              </Panel>
            ))}
          </Collapse>
        </div>
      )}
    </div>
  );
}
