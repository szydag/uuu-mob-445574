import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, Task } from '../navigation/AppNavigator';
import { ThemeColors, TaskContext } from '../../App'; 
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;

// --- Components definition for HomeScreen ---

interface AppHeaderProps {
    title: string;
    color: string;
}
const AppHeader: React.FC<AppHeaderProps> = ({ title, color }) => (
    <View style={[styles.headerContainer, { backgroundColor: color }]}>
        <Text style={styles.headerTitle}>{title}</Text>
    </View>
);

interface SearchBarProps {
    placeholder: string;
    onSearch: (query: string) => void;
}
const SearchBar: React.FC<SearchBarProps> = ({ placeholder, onSearch }) => {
    const [query, setQuery] = useState('');

    useEffect(() => {
        // Debounce search input (simple delay implementation)
        const timeoutId = setTimeout(() => {
            onSearch(query);
        }, 300); 

        return () => clearTimeout(timeoutId);
    }, [query, onSearch]);

    return (
        <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
                style={styles.searchInput}
                placeholder={placeholder}
                placeholderTextColor="#6B7280"
                value={query}
                onChangeText={setQuery}
            />
        </View>
    );
};

interface TaskCardProps {
    task: Task;
    onPress: (task: Task) => void;
}
const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
    const statusColor = task.isCompleted ? ThemeColors.success : ThemeColors.error;
    const statusText = task.isCompleted ? 'Tamamlandı' : 'Beklemede';

    return (
        <TouchableOpacity style={styles.taskCard} onPress={() => onPress(task)}>
            <View style={styles.cardContent}>
                <Text 
                    style={[
                        styles.taskTitle, 
                        task.isCompleted && styles.completedTaskTitle
                    ]} 
                    numberOfLines={1}
                >
                    {task.title}
                </Text>
                {task.isImportant && (
                    <Text style={styles.importanceBadge}>ÖNEMLİ</Text>
                )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            </View>
        </TouchableOpacity>
    );
};

interface FabProps {
    icon: string;
    color: string;
    onPress: () => void;
}
const FloatingActionButton: React.FC<FabProps> = ({ icon, color, onPress }) => (
    <TouchableOpacity style={[styles.fab, { backgroundColor: color }]} onPress={onPress}>
        <Icon name={icon} size={28} color={ThemeColors.background} />
    </TouchableOpacity>
);

// --- HomeScreen Implementation ---

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const context = useContext(TaskContext);
    if (!context) throw new Error("TaskContext must be used within a TaskProvider");
    const { tasks, loading, fetchTasks } = context;

    const [searchQuery, setSearchQuery] = useState('');

    // Fetch tasks on screen focus
    useFocusEffect(
        useCallback(() => {
            fetchTasks(searchQuery);
        }, [searchQuery, fetchTasks])
    );

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleTaskPress = (task: Task) => {
        // action: "navigate:edit_task"
        navigation.navigate('EditTask', { taskId: task.id });
    };

    return (
        <SafeAreaView style={styles.screen}>
            {/* Header */}
            <AppHeader color={ThemeColors.primary} title="Yapılacaklar" />
            
            <View style={styles.contentPadding}>
                {/* Search Bar */}
                <SearchBar placeholder="Görev Ara..." onSearch={handleSearch} />

                {loading && tasks.length === 0 ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color={ThemeColors.primary} />
                    </View>
                ) : (
                    <>
                        <Text style={styles.listTitle}>Görevler ({tasks.length})</Text>
                        {/* List */}
                        <FlatList
                            data={tasks}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TaskCard task={item} onPress={handleTaskPress} />
                            )}
                            contentContainerStyle={styles.listContent}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>Henüz görev yok.</Text>
                            }
                        />
                    </>
                )}
            </View>

            {/* FAB */}
            <FloatingActionButton 
                icon="add" 
                color={ThemeColors.primary} 
                onPress={() => navigation.navigate('AddTask')} 
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: ThemeColors.background,
    },
    contentPadding: {
        paddingHorizontal: 16,
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Header Styles
    headerContainer: {
        paddingTop: 10,
        paddingBottom: 15,
        paddingHorizontal: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: ThemeColors.background,
    },

    // Search Bar Styles
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ThemeColors.secondary,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
        marginTop: 5,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        color: ThemeColors.text,
    },

    // List Styles
    listTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: ThemeColors.text,
        marginBottom: 10,
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: ThemeColors.text,
    },

    // Task Card Styles
    taskCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: ThemeColors.background,
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 10,
        elevation: 1,
    },
    cardContent: {
        flex: 1,
        marginRight: 10,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: ThemeColors.text,
    },
    completedTaskTitle: {
        textDecorationLine: 'line-through',
        color: '#6B7280',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    importanceBadge: {
        fontSize: 10,
        fontWeight: 'bold',
        color: ThemeColors.error,
        marginTop: 4,
    },

    // FAB Styles
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
});

export default HomeScreen;
