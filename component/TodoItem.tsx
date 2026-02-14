
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, TextInput, Modal, Text, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { GlobalStyles } from '@/constants/Styles';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useTheme } from '@/context/ThemeContext';
import Checkbox from 'expo-checkbox';
import { Colors } from '@/constants/Colors';

type item = {
    key: string;
    label: string;
    selave: number;
    selavanathu: number;
    completed: boolean;
    order: number;
}

interface TodoItemProps {
    item: item;
    drag: () => void;
    isActive: boolean;
    onToggle: (key: string) => void;
    onUpdate: (key: string, field: 'selave' | 'selavanathu' | 'ethuku', value: number) => void;
    onDelete: (key: string) => void;
    onViewHistory: (item: item) => void;
}

const TodoItemComponent = ({ item, drag, isActive, onToggle, onUpdate, onDelete, onViewHistory }: TodoItemProps) => {
    const { theme } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingField, setEditingField] = useState<'selave' | 'selavanathu' | null>(null);
    const [tempValue, setTempValue] = useState('');

    const openEditModal = (field: 'selave' | 'selavanathu') => {
        setEditingField(field);
        setTempValue(''); // Clear input for new value
        setModalVisible(true);
    };

    const handleUpdate = (operation: 'add' | 'sub') => {
        if (editingField) {
            const inputVal = parseInt(tempValue) || 0;
            const currentVal = item[editingField];
            const newVal = operation === 'add' ? currentVal + inputVal : currentVal - inputVal;

            onUpdate(item.key, editingField, newVal < 0 ? 0 : newVal);
            setModalVisible(false);
            setEditingField(null);
            setTempValue('');
        }
    };

    return (
        <TouchableOpacity
            onPress={() => onViewHistory(item)}
            onLongPress={drag}
            disabled={isActive}
            style={[
                styles.container,
                { backgroundColor: Colors[theme].cardBackground },
                isActive && { opacity: 0.8, transform: [{ scale: 1.02 }] }
            ]}
        >
            <View style={styles.itemContent}>
                <View style={styles.topRow}>
                    <Checkbox
                        value={item.completed}
                        onValueChange={() => onToggle(item.key)}
                        color={item.completed ? Colors[theme].tint : Colors[theme].icon}
                        style={styles.checkbox}
                    />
                    <ThemedText style={[styles.title, item.completed && styles.completedText]} numberOfLines={1}>
                        {item.label}
                    </ThemedText>
                    <TouchableOpacity onPress={() => onDelete(item.key)} style={styles.deleteButton}>
                        <Text style={[styles.deleteButtonText, { color: Colors[theme].danger }]}>✕</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.statsContainer, { backgroundColor: Colors[theme].background }]}>
                    <TouchableOpacity onPress={() => openEditModal('selave')} style={styles.statItem}>
                        <ThemedText style={styles.statLabel}>செலவு</ThemedText>
                        <ThemedText style={styles.statValue}>{item.selave.toLocaleString('en-IN')}</ThemedText>
                    </TouchableOpacity>

                    <View style={[styles.verticalDivider, { backgroundColor: Colors[theme].borderColor }]} />

                    <TouchableOpacity onPress={() => openEditModal('selavanathu')} style={styles.statItem}>
                        <ThemedText style={styles.statLabel}>செலவானது</ThemedText>
                        <ThemedText style={[styles.statValue, { color: Colors[theme].text }]}>{item.selavanathu.toLocaleString('en-IN')}</ThemedText>
                    </TouchableOpacity>

                    <View style={[styles.verticalDivider, { backgroundColor: Colors[theme].borderColor }]} />

                    <View style={styles.statItem}>
                        <ThemedText style={styles.statLabel}>மீதி</ThemedText>
                        <ThemedText style={[
                            styles.statValue,
                            { color: (item.selave - item.selavanathu) >= 0 ? Colors[theme].success : Colors[theme].danger }
                        ]}>
                            {(item.selave - item.selavanathu).toLocaleString('en-IN')}
                        </ThemedText>
                    </View>
                </View>
            </View>

            <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <View style={styles.centeredView}>
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View style={[styles.modalView, { backgroundColor: Colors[theme].cardBackground }]} onStartShouldSetResponder={() => true}>
                                    <ThemedText style={styles.modalHeader}>{item.label}</ThemedText>
                                    <ThemedText style={styles.modalSubHeader}>
                                        {editingField === 'selave' ? 'செலவு மாற்றவும்' : 'செலவானதை மாற்றவும்'}
                                    </ThemedText>

                                    <TextInput
                                        style={[styles.modalInput, { color: Colors[theme].text, borderColor: Colors[theme].borderColor, backgroundColor: Colors[theme].inputBackground }]}
                                        onChangeText={setTempValue}
                                        value={tempValue}
                                        keyboardType="numeric"
                                        autoFocus={true}
                                        placeholder="தொகை"
                                        placeholderTextColor={Colors[theme].icon}
                                    />

                                    <View style={styles.modalButtons}>
                                        <TouchableOpacity onPress={() => handleUpdate('sub')} style={[styles.actionButton, { backgroundColor: Colors[theme].danger }]}>
                                            <Text style={styles.buttonText}>- குறை</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleUpdate('add')} style={[styles.actionButton, { backgroundColor: Colors[theme].success }]}>
                                            <Text style={styles.buttonText}>+ கூட்டு</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                        <Text style={[styles.closeButtonText, { color: Colors[theme].icon }]}>மூடு</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>
        </TouchableOpacity>
    );
}

const arePropsEqual = (prevProps: TodoItemProps, nextProps: TodoItemProps) => {
    return (
        prevProps.isActive === nextProps.isActive &&
        prevProps.item.key === nextProps.item.key &&
        prevProps.item.label === nextProps.item.label &&
        prevProps.item.selave === nextProps.item.selave &&
        prevProps.item.selavanathu === nextProps.item.selavanathu &&
        prevProps.item.completed === nextProps.item.completed &&
        prevProps.item.order === nextProps.item.order
    );
};

export const TodoItem = React.memo(TodoItemComponent, arePropsEqual);

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 8,
        ...GlobalStyles.card,
        ...GlobalStyles.shadowMedium,
    },
    itemContent: {
        justifyContent: 'center',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        marginLeft: 12,
    },
    completedText: {
        textDecorationLine: 'line-through',
        opacity: 0.5,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
    },
    deleteButton: {
        padding: 8,
        backgroundColor: 'rgba(255,0,0,0.1)',
        borderRadius: 8,
    },
    deleteButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 12,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
        paddingVertical: 4,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '600',
        opacity: 0.6,
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    verticalDivider: {
        width: 1,
        height: '60%',
        marginHorizontal: 8,
    },
    centeredView: GlobalStyles.modalOverlay,
    modalView: {
        ...GlobalStyles.modalView,
        ...GlobalStyles.shadowLarge,
    },
    modalHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubHeader: {
        fontSize: 14,
        opacity: 0.6,
        marginBottom: 20,
        textAlign: 'center',
    },
    modalInput: {
        ...GlobalStyles.input,
        textAlign: 'center',
        fontWeight: 'bold',
        height: 50,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
        gap: 16,
    },
    actionButton: {
        flex: 1,
        ...GlobalStyles.button,
        elevation: 2,
    },
    buttonText: GlobalStyles.buttonText,
    closeButton: {
        marginTop: 16,
        padding: 8,
    },
    closeButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
