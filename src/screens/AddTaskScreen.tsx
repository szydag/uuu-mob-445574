import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, Alert, TouchableOpacity } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ThemeColors, TaskContext } from '../../App';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

type AddTaskScreenProps = StackScreenProps<RootStackParamList, 'AddTask'>;

// --- Components ---

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

interface InputProps { label: string; placeholder?: string; value: string; onChange: (text: string) => void; }
const AppInput: React.FC<InputProps> = ({ label, placeholder, value, onChange }) => (
    <View style={formStyles.fieldContainer}>
        <Text style={formStyles.label}>{label}</Text>
        <TextInput
            style={formStyles.input}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            value={value}
            onChangeText={onChange}
        />
    </View>
);

const AppTextarea: React.FC<InputProps> = ({ label, placeholder, value, onChange }) => (
    <View style={formStyles.fieldContainer}>
        <Text style={formStyles.label}>{label}</Text>
        <TextInput
            style={[formStyles.input, formStyles.textarea]}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
        />
    </View>
);

interface ToggleProps { label: string; value: boolean; onChange: (value: boolean) => void; }
const AppToggle: React.FC<ToggleProps> = ({ label, value, onChange }) => (
    <View style={formStyles.toggleContainer}>
        <Text style={formStyles.label}>{label}</Text>
        <Switch
            trackColor={{ false: ThemeColors.secondary, true: ThemeColors.primary }}
            thumbColor={ThemeColors.background}
            onValueChange={onChange}
            value={value}
        />
    </View>
);

interface ButtonProps { label: string; color: string; onPress: () => void; disabled?: boolean; }
const AppButton: React.FC<ButtonProps> = ({ label, color, onPress, disabled }) => (
    <TouchableOpacity
        style={[formStyles.button, { backgroundColor: color }, disabled && { opacity: 0.6}]}
        onPress={onPress}
        disabled={disabled}
    >
        <Text style={formStyles.buttonText}>{label}</Text>
    </TouchableOpacity>
);

// --- Screen Logic ---

const AddTaskScreen: React.FC<AddTaskScreenProps> = ({ navigation }) => {
    const context = useContext(TaskContext);
    if (!context) throw new Error("TaskContext must be used within a TaskProvider");
    const { addTask } = context;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isImportant, setIsImportant] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Hata', 'Başlık alanı boş bırakılamaz.');
            return;
        }

        setIsSaving(true);
        try {
            await addTask({
                title,
                description,
                isImportant,
            });
            Alert.alert('Başarılı', 'Görev başarıyla kaydedildi.');
            // action: "goBack"
            navigation.goBack(); 
        } catch (error) {
            Alert.alert('Hata', 'Görevi kaydederken bir sorun oluştu.');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={formStyles.screen}>
            <AppHeader 
                color={ThemeColors.primary} 
                title="Yeni Görev" 
                showBackButton={true}
                onBack={() => navigation.goBack()}
            />

            <View style={formStyles.content}>
                <AppInput 
                    label="Başlık" 
                    placeholder="Görevin kısa adı" 
                    value={title} 
                    onChange={setTitle} 
                />
                <AppTextarea 
                    label="Açıklama" 
                    placeholder="Detaylı açıklama ve notlar" 
                    value={description} 
                    onChange={setDescription} 
                />
                <AppToggle 
                    label="Önemli (Yüksek Öncelik)" 
                    value={isImportant} 
                    onChange={setIsImportant} 
                />
                
                <View style={{ marginTop: 30 }}>
                    <AppButton 
                        color={ThemeColors.primary} 
                        label={isSaving ? "Kaydediliyor..." : "Görevi Kaydet"} 
                        onPress={handleSave} 
                        disabled={isSaving}
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
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
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

export default AddTaskScreen;
