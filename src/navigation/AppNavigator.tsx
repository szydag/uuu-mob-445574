import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import EditTaskScreen from '../screens/EditTaskScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Define types for navigation parameters and data structure
export interface Task {
    id: string;
    title: string;
    description?: string;
    isCompleted: boolean;
    isImportant: boolean;
    createdAt: string;
}

export type RootStackParamList = {
  Home: undefined;
  AddTask: undefined;
  EditTask: { taskId: string };
};

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} />
      <Stack.Screen name="EditTask" component={EditTaskScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
