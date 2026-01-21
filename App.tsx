import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator, { Task } from './src/navigation/AppNavigator';
import axios from 'axios';

// Configuration
const API_URL = 'http://localhost:3000/tasks'; 

export const ThemeColors = {
  primary: '#2563EB',
  error: '#EF4444',
  secondary: '#F3F4F6',
  background: '#FFFFFF',
  text: '#1F2937', 
  success: '#10B981',
};

// --- Context Setup ---

interface TaskContextType {
    tasks: Task[];
    loading: boolean;
    fetchTasks: (searchQuery?: string) => void;
    addTask: (taskData: { title: string; description: string; isImportant: boolean }) => Promise<void>;
    updateTask: (id: string, taskData: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
}

export const TaskContext = React.createContext<TaskContextType | undefined>(undefined);

const TaskProvider = ({ children }: { children: React.ReactNode }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTasks = async (searchQuery: string = '') => {
        setLoading(true);
        try {
            const response = await axios.get(API_URL, {
                params: { search: searchQuery },
            });
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    const addTask = async (taskData: { title: string; description: string; isImportant: boolean }) => {
        await axios.post(API_URL, taskData);
        await fetchTasks();
    };

    const updateTask = async (id: string, taskData: Partial<Task>) => {
        await axios.put(`${API_URL}/${id}`, taskData);
        // Note: fetchTasks() is called here implicitly via EditTaskScreen/TaskContext usage pattern
    };

    const deleteTask = async (id: string) => {
        await axios.delete(`${API_URL}/${id}`);
        // Note: fetchTasks() is called here implicitly via EditTaskScreen/TaskContext usage pattern
    };

    return (
        <TaskContext.Provider value={{ tasks, loading, fetchTasks, addTask, updateTask, deleteTask }}>
            {children}
        </TaskContext.Provider>
    );
};

// --- Main App Component ---

export default function App() {
  return (
    <TaskProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </TaskProvider>
  );
}