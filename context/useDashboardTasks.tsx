import React, { createContext, useContext, useState } from 'react';
import { Task, TaskType } from '../types/TaskType';

interface DashboardContextProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  xp: number;
  setXp: React.Dispatch<React.SetStateAction<number>>;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [xp, setXp] = useState<number>(0);

  return (
    <DashboardContext.Provider value={{ tasks, setTasks, xp, setXp }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardTasks = (): DashboardContextProps => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardTasks must be used within a DashboardProvider');
  }
  return context;
};