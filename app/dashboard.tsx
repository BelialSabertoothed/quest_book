import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDashboardTasks } from '../context/useDashboardTasks';
import { Ionicons } from '@expo/vector-icons';
import { checkAndSyncCalendar } from '../utils/checkAndSyncCalendar';
import { Task, TaskType } from '../types/TaskType';
import { scheduleNotification } from '../utils/scheduleNotification';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Dashboard() {
  const router = useRouter();
  const { tasks, setTasks, xp, setXp } = useDashboardTasks();
  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState<Date | undefined>(undefined);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [repeatDays, setRepeatDays] = useState<string[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const { edit } = useLocalSearchParams();
  const [hasOpenedFromEdit, setHasOpenedFromEdit] = useState(false);

  const today = new Date();
  const weekday = WEEKDAYS[today.getDay() === 0 ? 6 : today.getDay() - 1];
  const todayKey = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchCalendar = async () => {
      console.log('🔁 Forcing calendar sync...');
      await checkAndSyncCalendar(setTasks);
    };
    fetchCalendar();
  }, []);

  useEffect(() => {
    if (!modalVisible && typeof edit === 'string' && !hasOpenedFromEdit) {
      const taskToEdit = tasks.find(t => t.id === edit);
      if (taskToEdit) {
        setEditingTaskId(taskToEdit.id);
        setNewTaskTitle(taskToEdit.title);
        setNewTaskTime(taskToEdit.time);
        setRepeatDays(taskToEdit.repeatDays || []);
        setModalVisible(true);
        setHasOpenedFromEdit(true);
        router.setParams({});
      }
    }
  }, [edit, tasks, modalVisible, hasOpenedFromEdit, router]);

  const getToday = () => new Date().toISOString().split('T')[0];

  const toggleDay = (day: string) => {
    setRepeatDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleTask = (id: string) => {
    const today = getToday();
    setTasks(prev =>
      prev.map(task => {
        if (task.id !== id) return task;

        const alreadyCompletedToday = task.lastCompletedAt === today;
        const isCurrentlyCompleted = task.completed;
        const shouldAddXp = !isCurrentlyCompleted && !alreadyCompletedToday;

        if (shouldAddXp) {
          setXp(prev => Math.min(prev + 10, 100));
        }

        return {
          ...task,
          completed: !isCurrentlyCompleted,
          lastCompletedAt: !isCurrentlyCompleted ? today : task.lastCompletedAt,
        };
      })
    );
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const addTask = () => {
    if (newTaskTitle.trim() === '') {
      Alert.alert('Enter a task title');
      return;
    }

    const updatedTask: Task = {
      id: editingTaskId || Math.random().toString(),
      title: newTaskTitle,
      completed: false,
      time: newTaskTime,
      repeatDays,
      type: TaskType.Custom,
    };

    setTasks(prev => {
      if (editingTaskId) {
        return prev.map(t => (t.id === editingTaskId ? updatedTask : t));
      } else {
        return [...prev, updatedTask];
      }
    });

    if (newTaskTime && !updatedTask.isAllDay) {
      scheduleNotification(updatedTask.title, newTaskTime);
    }

    setNewTaskTitle('');
    setNewTaskTime(undefined);
    setRepeatDays([]);
    setEditingTaskId(null);
    setModalVisible(false);
  };
  
  const todayTasks = tasks
  .filter(task => {
    const isTodayTime =
      task.time &&
      task.time.toISOString().split('T')[0] === today.toISOString().split('T')[0];

    const isTodayAllDay =
      task.date &&
      task.date.toISOString().split('T')[0] === today.toISOString().split('T')[0];

    const isRepeat = task.repeatDays?.includes(weekday);
    const isCustom = task.type === 'custom' || !task.type;

    const isCalendar = task.type === 'calendar' && (isTodayTime || isTodayAllDay);

    const isHoliday = /svátek|holiday|feiertag/i.test(task.title);

    return (isCalendar || isRepeat || isCustom) && !isHoliday;
  })
  .sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.time && b.time) return a.time.getTime() - b.time.getTime();
    if (a.time) return -1;
    if (b.time) return 1;
    return 0;
  });

  const renderItem = ({ item }: { item: Task }) => (
    <View style={[styles.taskRow, item.completed && styles.taskRowCompleted]}>
      <TouchableOpacity style={styles.taskItem} onPress={() => toggleTask(item.id)}>
      <Text style={[styles.taskText, item.completed && styles.taskCompleted]}>
        {item.completed ? '✅' : '☐'} {item.title}
        {item.time && !(item.time.getUTCHours() === 0 && item.time.getUTCMinutes() === 0)
          ? ` at ${formatTime(item.time)}`
          : ''}
      </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => editTask(item)}>
        <Ionicons name="pencil" size={20} color="#6c5ce7" style={{ marginRight: 12 }} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteTask(item.id)}>
        <Ionicons name="trash" size={20} color="#ff6b6b" />
      </TouchableOpacity>
    </View>
  );

  const editTask = (task: Task) => {
    setEditingTaskId(task.id);
    setNewTaskTitle(task.title);
    setNewTaskTime(task.time);
    setRepeatDays(task.repeatDays || []);
    setModalVisible(true);
  };

  const deleteTask = (id: string) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setTasks(prev => prev.filter(t => t.id !== id)),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Good to see you again! 👋</Text>
            <View style={styles.xpContainer}>
              <Text style={styles.xpText}>XP: {xp}/100</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${xp}%` }]} />
              </View>
            </View>
            <Text style={styles.sectionTitle}>Today’s Quests</Text>
          </>
        }
        data={todayTasks}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListFooterComponent={
          <>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/weekly-overview')}
            >
              <Text style={styles.linkText}>→ See full week overview</Text>
            </TouchableOpacity>
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.addButtonText}>+ Add New Task</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        contentContainerStyle={styles.container}
      />

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingTaskId ? 'Edit Task' : 'New Task'}</Text>

            <TextInput
              style={styles.input}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              placeholder="Task title"
            />

            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={{ color: 'white' }}>{newTaskTime ? formatTime(newTaskTime) : 'Set time'}</Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                mode="time"
                value={newTaskTime || new Date()}
                onChange={(event, selectedDate) => {
                  if (event.type === 'set' && selectedDate) {
                    setNewTaskTime(selectedDate);
                  }
                }}
              />
            )}

            <View style={styles.repeatContainer}>
              {WEEKDAYS.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayButton, repeatDays.includes(day) && styles.dayButtonSelected]}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={{ color: repeatDays.includes(day) ? 'white' : 'black' }}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={addTask}>
              <Text style={styles.saveButtonText}>{editingTaskId ? 'Save Changes' : 'Add Task'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: '#ccc', marginTop: 10 }]}
              onPress={() => {
                setModalVisible(false);
                setNewTaskTitle('');
                setNewTaskTime(undefined);
                setRepeatDays([]);
                setEditingTaskId(null);
              }}
            >
              <Text style={styles.saveButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fffaf3',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  xpContainer: {
    marginBottom: 20,
  },
  xpText: {
    fontSize: 16,
    marginBottom: 6,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#eee',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 12,
    backgroundColor: '#6c5ce7',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 6,
  },
  taskRowCompleted: {
    opacity: 0.5,
  },
  taskItem: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  linkButton: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  linkText: {
    fontSize: 14,
    color: '#6c5ce7',
    fontWeight: '600',
  },
  footer: {
    paddingBottom: 32,
  },
  addButton: {
    backgroundColor: '#00b894',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  timeButton: {
    backgroundColor: '#6c5ce7',
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  repeatContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 12,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
    marginBottom: 6,
  },
  dayButtonSelected: {
    backgroundColor: '#6c5ce7',
  },
  saveButton: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
