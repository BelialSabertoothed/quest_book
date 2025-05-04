import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDashboardTasks } from '../../context/useDashboardTasks';
import { useRouter } from 'expo-router';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ReminderSetupScreen() {
  const { setTasks } = useDashboardTasks();
  const router = useRouter();
  const [taskType, setTaskType] = useState<'medication' | 'hydration'>('medication');
  const [taskTitle, setTaskTitle] = useState('');
  const [times, setTimes] = useState<Date[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editTimeIndex, setEditTimeIndex] = useState<number | null>(null);
  const [repeatDays, setRepeatDays] = useState<string[]>([]);
  const [addedTasks, setAddedTasks] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const toggleRepeatDay = (day: string) => {
    setRepeatDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleAddTime = (time: Date) => {
    if (editTimeIndex !== null) {
      const updated = [...times];
      updated[editTimeIndex] = time;
      setTimes(updated);
      setEditTimeIndex(null);
    } else {
      const exists = times.find(
        t => t.getHours() === time.getHours() && t.getMinutes() === time.getMinutes()
      );
      if (!exists) {
        setTimes(prev => [...prev, time]);
      }
    }
  };

  const handleAddTask = () => {
    if (!taskTitle || times.length === 0 || !taskType) return;

    const tasksFromTimes = times.map(time => ({
      id: Math.random().toString(),
      title: taskTitle,
      completed: false,
      time,
      repeatDays,
      type: taskType,
    }));

    if (editingIndex !== null) {
      const updated = [...addedTasks];
      updated.splice(editingIndex, 1, ...tasksFromTimes);
      setAddedTasks(updated);
      setEditingIndex(null);
    } else {
      setAddedTasks(prev => [...prev, ...tasksFromTimes]);
    }

    setTaskTitle('');
    setTimes([]);
    setRepeatDays([]);
  };

  const handleSaveAll = () => {
    setTasks(prev => [...prev, ...addedTasks]);
    router.push('/onboarding/planner');
  };

  const selectType = (type: 'medication' | 'hydration') => {
    setTaskType(type);
    setTaskTitle('');
    setTimes([]);
    setRepeatDays([]);
    setEditingIndex(null);
  };

  const handleEdit = (index: number) => {
    const task = addedTasks[index];
    setTaskTitle(task.title);
    setTimes([task.time]);
    setRepeatDays(task.repeatDays);
    setTaskType(task.type);
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    Alert.alert('Delete Reminder', 'Are you sure you want to delete this reminder?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setAddedTasks(prev => prev.filter((_, i) => i !== index));
          if (editingIndex === index) {
            setTaskTitle('');
            setTimes([]);
            setRepeatDays([]);
            setEditingIndex(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{editingIndex !== null ? 'Edit' : 'Create'} {taskType || 'reminder'} task</Text>

      <View style={styles.typeSwitchRow}>
        <TouchableOpacity
          style={[styles.switchButton, taskType === 'medication' && styles.selected]}
          onPress={() => selectType('medication')}
        >
          <Text style={styles.switchText}>💊 Medication</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchButton, taskType === 'hydration' && styles.selected]}
          onPress={() => selectType('hydration')}
        >
          <Text style={styles.switchText}>💧 Hydration</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder={`e.g. ${taskType === 'medication' ? 'Take vitamin C' : 'Drink a glass of water'}`}
        value={taskTitle}
        onChangeText={setTaskTitle}
      />

      <View style={styles.timeListRow}>
        {times.map((t, i) => (
          <TouchableOpacity
            key={i}
            style={styles.timeChip}
            onPress={() => {
              setEditTimeIndex(i);
              setShowTimePicker(true);
            }}
          >
            <Text style={styles.timeText}>{t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            <Text style={styles.chipClose} onPress={() => setTimes(prev => prev.filter((_, j) => j !== i))}>✕</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.timeChip, styles.timeAdd]}
          onPress={() => {
            setEditTimeIndex(null);
            setShowTimePicker(true);
          }}
        >
          <Text style={styles.timeText}>+ Add Time</Text>
        </TouchableOpacity>
      </View>

      {showTimePicker && (
        <DateTimePicker
          mode="time"
          value={times[editTimeIndex ?? 0] || new Date()}
          onChange={(event, selectedTime) => {
            if (event.type === 'set' && selectedTime) {
              handleAddTime(selectedTime);
            }
            setShowTimePicker(false);
          }}
        />
      )}

      {/* Repeat days */}
      <Text style={styles.subtitle}>Repeat on:</Text>
      <View style={styles.repeatRow}>
        {WEEKDAYS.map(day => (
          <TouchableOpacity
            key={day}
            onPress={() => toggleRepeatDay(day)}
            style={[styles.repeatButton, repeatDays.includes(day) && styles.repeatButtonSelected]}
          >
            <Text style={styles.repeatButtonText}>{day.slice(0, 2)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: taskType === 'medication' ? '#fdcb6e' : '#74b9ff' }]}
        onPress={handleAddTask}
      >
        <Text style={styles.buttonText}>
          {editingIndex !== null ? 'Update' : 'Add'} {taskType === 'medication' ? 'Medication' : 'Hydration'} Reminder
        </Text>
      </TouchableOpacity>

      <Text style={[styles.subtitle, { marginTop: 32 }]}>Added Reminders:</Text>
      {addedTasks.map((task, index) => (
        <View key={task.id} style={styles.taskBox}>
          <Text style={styles.taskText}>• {task.title} – {new Date(task.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          <View style={styles.taskActions}>
            <TouchableOpacity onPress={() => handleEdit(index)}>
              <Text style={styles.edit}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(index)}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.button, { marginTop: 24, backgroundColor: '#6c5ce7' }]}
        onPress={handleSaveAll}
      >
        <Text style={styles.buttonText}>Save and Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
      backgroundColor: '#fffef6',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 16,
    },
    typeSwitchRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16,
      marginBottom: 12,
    },
    switchButton: {
      borderWidth: 1,
      borderColor: '#dfe6e9',
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    selected: {
      backgroundColor: '#a29bfe',
    },
    switchText: {
      fontSize: 16,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 10,
      padding: 12,
      fontSize: 16,
      backgroundColor: '#fff',
      marginBottom: 16,
    },
    timeButton: {
      padding: 12,
      backgroundColor: '#dfe6e9',
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 16,
    },
    timeButtonText: {
      fontSize: 16,
      color: '#2d3436',
    },
    timeText: {
        fontSize: 14,
        color: '#2d3436',
      },
    timeListItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    subtitle: {
      fontSize: 16,
      marginBottom: 8,
    },
    repeatRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 12,
    },
    repeatButton: {
      borderWidth: 1,
      borderColor: '#b2bec3',
      borderRadius: 8,
      padding: 6,
      marginRight: 6,
    },
    repeatButtonSelected: {
      backgroundColor: '#a29bfe',
      borderColor: '#6c5ce7',
    },
    repeatButtonText: {
      color: '#2d3436',
    },
    button: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
    },
    taskBox: {
      padding: 10,
      backgroundColor: '#f1f2f6',
      borderRadius: 8,
      marginTop: 8,
    },
    taskText: {
      fontSize: 16,
      marginBottom: 4,
    },
    taskActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
    },
    edit: {
      color: '#0984e3',
    },
    delete: {
      color: '#d63031',
    },
    timeListRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginVertical: 12,
      },
      timeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#dfe6e9',
        borderRadius: 20,
      },
      chipClose: {
        marginLeft: 6,
        color: '#d63031',
      },
      timeAdd: {
        backgroundColor: '#b2bec3',
      },
  });
  
