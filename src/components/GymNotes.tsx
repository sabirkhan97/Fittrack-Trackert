import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { DatePicker } from 'antd'
import moment from 'moment'

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"

const formSchema = z.object({
  exercise_name: z.string().min(1, {
    message: "Exercise name is required.",
  }),
  sets: z.number().min(1, {
    message: "Sets must be at least 1.",
  }),
  reps: z.number().min(1, {
    message: "Reps must be at least 1.",
  }),
  weight: z.number().min(0).optional(),
  exercise_date: z.date({
    required_error: "A date is required.",
  }),
})

export default function GymNotes() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exercise_name: "",
      sets: undefined,
      reps: undefined,
      weight: undefined,
      exercise_date: new Date(),
    },
  })

  useEffect(() => {
    fetchExercises()
  }, [])

  const fetchExercises = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login')
        navigate('/login')
        return
      }
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/exercises`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setExercises(response.data)
    } catch (error) {
      toast.error('Failed to fetch exercises')
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${import.meta.env.VITE_API_URL}/exercises`,
        {
          exercise_name: values.exercise_name,
          sets: values.sets,
          reps: values.reps,
          weight: values.weight,
          exercise_date: format(values.exercise_date, 'yyyy-MM-dd'),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Exercise added successfully!')
      form.reset()
      fetchExercises()
    } catch (error) {
      toast.error('Failed to add exercise')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Gym Notes</h1>
          <Button variant="outline" onClick={handleLogout}>
            <Icons.logout className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Add New Exercise</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="exercise_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exercise Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Bench Press" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="exercise_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            className="w-full"
                            format="YYYY-MM-DD"
                            value={field.value ? moment(field.value) : null}
                            onChange={(date) => field.onChange(date?.toDate())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sets"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sets</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="e.g., 3"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="reps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reps</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="e.g., 10"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="e.g., 50"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Exercise
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Your Exercises</CardTitle>
          </CardHeader>
          <CardContent>
            {exercises.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exercise</TableHead>
                    <TableHead>Sets</TableHead>
                    <TableHead>Reps</TableHead>
                    <TableHead>Weight (kg)</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exercises.map((exercise: any) => (
                    <TableRow key={exercise.id}>
                      <TableCell className="font-medium">
                        {exercise.exercise_name}
                      </TableCell>
                      <TableCell>{exercise.sets}</TableCell>
                      <TableCell>{exercise.reps}</TableCell>
                      <TableCell>{exercise.weight || '-'}</TableCell>
                      <TableCell>
                        {format(new Date(exercise.exercise_date), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No exercises recorded yet. Add your first exercise above!
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}