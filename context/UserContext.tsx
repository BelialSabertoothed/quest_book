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

const fetchUser = async () => {
  try {
    const res = await fetch('http://192.168.0.X:3000/api/profile');
    if (res.status === 404) {
      // user neexistuje → vytvoř
      const createRes = await fetch('http://192.168.0.X:3000/api/profile', {
        method: 'POST',
      });
      const newUser = await createRes.json();
      setUserData({
        user: {
          id: newUser.id,
          name: newUser.name,
          avatarIndex: newUser.avatarIndex ?? 0,
        },
        xp: newUser.xp,
        level: newUser.level,
        hydrationProgress: newUser.hydrationProgress,
        medicationProgress: newUser.medicationProgress,
        achievements: newUser.achievements,
        cards: newUser.cards,
      });
    } else {
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
    }
  } catch (error) {
    console.warn('❌ Failed to fetch or create user:', error);
  }
};

useEffect(() => {
  const initializeUser = async () => {
    try {
      // 1. POKUS O FETCH EXISTUJÍCÍHO UŽIVATELE
      const res = await fetch('http://localhost:3000/api/profile/guest');
      if (res.ok) {
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
        return;
      }

      // 2. VYTVOŘ NOVÉHO UŽIVATELE
      const avatarIndex = getRandomAvatar();
      const createRes = await fetch('http://localhost:3000/api/profile/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Guest', avatarIndex }),
      });

      if (!createRes.ok) throw new Error('User creation failed');

      const created = await createRes.json();
      setUserData({
        user: {
          id: created.id,
          name: created.name,
          avatarIndex: created.avatarIndex,
        },
        xp: created.xp,
        level: created.level,
        hydrationProgress: created.hydrationProgress,
        medicationProgress: created.medicationProgress,
        achievements: created.achievements,
        cards: created.cards,
      });
    } catch (error) {
      console.warn('❌ Failed to initialize user:', error);
    }
  };

  initializeUser();
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