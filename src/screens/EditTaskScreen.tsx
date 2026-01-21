import React, { useState, useContext, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, Task } from '../navigation/AppNavigator';
import { ThemeColors, TaskContext } from '../../App';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

type EditTaskScreenProps = StackScreenProps<RootStackParamList, 'EditTask'>;

const API_URL = 'http://localhost:3000/tasks';

// --- Shared Components ---

interface AppHeaderProps {
    title: string;
    color: string;
    showBackButton: boolean;
    onBack: () => void;
}
const AppHeader: React.FC<AppHeaderProps> = ({ title, color, showBackButton, onBack }) => (
    <View style={[headerStyles.container, { backgroundColor: color }]}>
        {showBackButton && (
            <TouchableOpacity onPress={onBack} style={headerStyles.backButton}>
                <Icon name="arrow-back" size={24} color={ThemeColors.background} />
            </TouchableOpacity>
        )}
        <Text style={headerStyles.title}>{title}</Text>
    </View>
);

const headerStyles = StyleSheet.create({
    container: {
        paddingVertical: 15,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: ThemeColors.background,
    },
});

interface InputProps { label: string; value: string; onChange: (text: string) => void; }
const AppInput: React.FC<InputProps> = ({ label, value, onChange }) => (
    <View style={formStyles.fieldContainer}>
        <Text style={formStyles.label}>{label}</Text>
        <TextInput
            style={formStyles.input}
            value={value}
            onChangeText={onChange}
            placeholderTextColor="#9CA3AF"
        />
    </View>
);

const AppTextarea: React.FC<InputProps> = ({ label, value, onChange }) => (
    <View style={formStyles.fieldContainer}>
        <Text style={formStyles.label}>{label}</Text>
        <TextInput
            style={[formStyles.input, formStyles.textarea]}
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#9CA3AF"
        />
    </View>
);

interface CheckboxProps { label: string; checked: boolean; onChange: (checked: boolean) => void; }
const AppCheckbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => (
    <TouchableOpacity style={formStyles.checkboxContainer} onPress={() => onChange(!checked)}>
        <View style={[formStyles.checkbox, checked && formStyles.checkedBox]}>
            {checked && <Icon name="check" size={16} color={ThemeColors.background} />}
        </View>
        <Text style={formStyles.label}>{label}</Text>
    </TouchableOpacity>
);

interface ButtonProps { 
    label: string; 
    color: string; 
    onPress: () => void; 
    style?: 'fill' | 'outline'; 
    fullWidth?: boolean;
    marginTop?: number;
    disabled?: boolean;
}
const AppButton: React.FC<ButtonProps> = ({ label, color, onPress, style = 'fill', fullWidth = true, marginTop = 0, disabled = false }) => {
    const isOutline = style === 'outline';
    return (
        <TouchableOpacity
            style={[
                formStyles.button, 
                fullWidth && { width: '100%' },
                isOutline 
                    ? { backgroundColor: ThemeColors.background, borderColor: color, borderWidth: 2, marginTop } 
                    : { backgroundColor: color, marginTop },
                disabled && { opacity: 0.6 }
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={[formStyles.buttonText, isOutline && { color: color }]}>{label}</Text>
        </TouchableOpacity>
    );
};

// --- Screen Logic ---

const EditTaskScreen: React.FC<EditTaskScreenProps> = ({ route, navigation }) => {
    const { taskId } = route.params;
    const context = useContext(TaskContext);
    if (!context) throw new Error("TaskContext must be used within a TaskProvider");
    const { updateTask, deleteTask, fetchTasks } = context;

    const [task, setTask] = useState<Task | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchTaskDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get<Task>(`${API_URL}/${taskId}`);
            const fetchedTask = response.data;
            setTask(fetchedTask);
            setTitle(fetchedTask.title);
            setDescription(fetchedTask.description || '');
            setIsCompleted(fetchedTask.isCompleted);
        } catch (error) {
            Alert.alert('Hata', 'Görev detayları yüklenemedi.');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    }, [taskId, navigation]);

    useFocusEffect(fetchTaskDetails);

    const handleUpdate = async () => {
        if (!title.trim()) {
            Alert.alert('Hata', 'Başlık alanı boş bırakılamaz.');
            return;
        }

        setIsProcessing(true);
        try {
            await updateTask(taskId, {
                title,
                description,
                isCompleted,
            });
            // Since updateTask calls fetchTasks in context, we only need navigation logic here
            Alert.alert('Başarılı', 'Görev başarıyla güncellendi.');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Hata', 'Görevi güncellerken bir sorun oluştu.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Görevi Sil",
            "Bu görevi silmek istediğinizden emin misiniz?",
            [
                { text: "İptal", style: "cancel" },
                { 
                    text: "Sil", 
                    style: "destructive", 
                    onPress: async () => {
                        setIsProcessing(true);
                        try {
                            await deleteTask(taskId);
                            Alert.alert('Başarılı', 'Görev silindi.');
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Hata', 'Görevi silerken bir sorun oluştu.');
                        } finally {
                            setIsProcessing(false);
                        }
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={formStyles.screen}>
                <AppHeader color={ThemeColors.primary} title="Görevi Düzenle" showBackButton={true} onBack={() => navigation.goBack()} />
                <View style={formStyles.loadingContainer}>
                    <ActivityIndicator size="large" color={ThemeColors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!task) return null;

    return (
        <SafeAreaView style={formStyles.screen}>
            <AppHeader 
                color={ThemeColors.primary} 
                title="Görevi Düzenle" 
                showBackButton={true}
                onBack={() => navigation.goBack()}
            />

            <View style={formStyles.content}>
                <AppInput 
                    label="Başlık" 
                    value={title} 
                    onChange={setTitle} 
                />
                <AppTextarea 
                    label="Açıklama" 
                    value={description} 
                    onChange={setDescription} 
                />
                <AppCheckbox
                    label="Tamamlandı olarak işaretle"
                    checked={isCompleted}
                    onChange={setIsCompleted}
                />
                
                <View style={{ marginTop: 30 }}>
                    <AppButton 
                        color={ThemeColors.primary} 
                        label={isProcessing ? "Güncelleniyor..." : "Güncelle"} 
                        onPress={handleUpdate} 
                        fullWidth={true}
                        disabled={isProcessing}
                    />
                    <AppButton 
                        color={ThemeColors.error} 
                        label="Görevi Sil" 
                        onPress={handleDelete} 
                        style="outline" 
                        fullWidth={true}
                        marginTop={10}
                        disabled={isProcessing}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const formStyles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: ThemeColors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 16,
    },
    fieldContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: ThemeColors.text,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
        fontSize: 16,
        backgroundColor: ThemeColors.background,
        color: ThemeColors.text,
    },
    textarea: {
        height: 100,
        paddingTop: 10,
    },
    // Checkbox Specific Styles
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: ThemeColors.primary,
        borderRadius: 4,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: ThemeColors.background,
    },
    checkedBox: {
        backgroundColor: ThemeColors.primary,
    },
    // Button Styles
    button: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: ThemeColors.background,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default EditTaskScreen;