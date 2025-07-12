import React, { createContext, useEffect, useState, useContext } from 'react';
import { avatarList } from '../utils/avatars';

interface User {
  id: string;
  name: string;
  avatarIndex: number;
}

interface UserContextType {
  user: User;
  xp: number;
  level: number;
  hydrationProgress: number;
  medicationProgress: number;
  achievements: any[];
  cards: any[];
  setUser: (updater: (prev: User) => User) => void;
  setUserData: React.Dispatch<React.SetStateAction<UserContextState>>;
}

type UserContextState = Omit<UserContextType, 'setUser' | 'setUserData'>;

const getRandomAvatar = () => Math.floor(Math.random() * avatarList.length);

const defaultUserData: UserContextState = {
  user: { id: 'guest', name: 'Guest',  avatarIndex: getRandomAvatar(),
  },
  xp: 0,
  level: 1,
  hydrationProgress: 0,
  medicationProgress: 0,
  achievements: [],
  cards: [],
};

export const UserContext = createContext<UserContextType>({
  ...defaultUserData,
  setUser: () => {},
  setUserData: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserContextState>(defaultUserData);

  const setUser = (updater: (prev: User) => User) => {
    setUserData(prev => ({
      ...prev,
      user: updater(prev.user),
    }));
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/profile');
        const data = await res.json();
        setUserData({
          user: {
            id: data.id,
            name: data.name,
            avatarIndex: data.avatarIndex ?? 0,          
            },
          xp: data.xp,
          level: data.level,
          hydrationProgress: data.hydrationProgress,
          medicationProgress: data.medicationProgress,
          achievements: data.achievements,
          cards: data.cards,
        });
      } catch (error) {
        console.warn('❌ Failed to fetch user profile:', error);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ ...userData, setUser, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};