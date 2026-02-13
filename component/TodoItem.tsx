
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, TextInput, Modal, Button, Text, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useTheme } from '@/context/ThemeContext';
import Checkbox from 'expo-checkbox';
import { Colors } from '@/constants/Colors';

interface TodoItemProps {
    item: {
        key: string;
        label: string;
        selave: number;
        selavanathu: number;
        completed: boolean;
    };
    drag: () => void;
    isActive: boolean;
    onToggle: (key: string) => void;
    onUpdate: (key: string, field: 'selave' | 'selavanathu', value: number) => void;
    onDelete: (key: string) => void;
}

export function TodoItem({ item, drag, isActive, onToggle, onUpdate, onDelete }: TodoItemProps) {
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
        <TouchableOpacity onLongPress={drag} disabled={isActive} style={[styles.container, isActive && { backgroundColor: Colors[theme].inputBackground }, { borderBottomColor: Colors[theme].borderColor }]}>
            <ThemedView style={styles.itemContent}>
                <Checkbox value={item.completed} onValueChange={() => onToggle(item.key)} color={item.completed ? Colors[theme].tint : undefined} style={styles.checkbox} />
                <View style={styles.textContainer}>
                    <ThemedText style={[styles.text, item.completed && styles.completedText]} numberOfLines={1}>{item.label}</ThemedText>

                    <View style={styles.statsContainer}>
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
                <TouchableOpacity onPress={() => onDelete(item.key)} style={styles.deleteButton}>
                    <Text style={styles.deleteButtonText}>✕</Text>
                </TouchableOpacity>
            </ThemedView>

            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <View style={styles.centeredView}>
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View style={[styles.modalView, { backgroundColor: Colors[theme].cardBackground }]} onStartShouldSetResponder={() => true}>
                                    <ThemedText type='default'>{item.label}</ThemedText>
                                    <ThemedText style={styles.modalText}>
                                        {editingField === 'selave' ? 'செலவில்' : 'செலவானதில்'} மாற்றம் செய்
                                    </ThemedText>
                                    <TextInput
                                        style={[styles.modalInput, { color: Colors[theme].text, borderColor: Colors[theme].borderColor }]}
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

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderBottomWidth: 1,
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    textContainer: {
        flex: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        justifyContent: 'space-between',
        paddingRight: 8,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 10,
        opacity: 0.6,
        marginBottom: 2,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    verticalDivider: {
        width: 1,
        height: '80%',
        marginHorizontal: 4,
    },
    checkbox: {
        marginRight: 12,
    },
    text: {
        fontSize: 16,
    },
    completedText: {
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 0,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalView: {
        margin: 20,
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalInput: {
        height: 40,
        width: '100%',
        margin: 12,
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 15,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    closeButton: {
        marginTop: 16,
    },
    closeButtonText: {
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    deleteButton: {
        padding: 8,
        marginLeft: 8,
    },
    deleteButtonText: {
        color: '#ff5c5c', // Keep explicit red for delete logic or use Colors[theme].danger if specific
        fontSize: 18,
        fontWeight: 'bold',
    },
});
