import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal, Text, TouchableWithoutFeedback, Keyboard, LayoutAnimation } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator, ShadowDecorator, OpacityDecorator } from 'react-native-draggable-flatlist';
import { TodoItem } from './TodoItem';
import { useTheme } from '@/context/ThemeContext';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { getKanaku, addKanaku, updateKanaku, deleteKanaku, toggleKanaku, updateOrder, closeRealm } from '@/services/realm';
import { getItem, setItem } from '@/services/mmkv';
import { HistoryModal } from './HistoryModal';


interface Todo {
    key: string;
    label: string;
    selave: number;
    selavanathu: number;
    completed: boolean;
    order: number;
}

const VARAVU_KEY = 'kanakuValaku_varavu';

export function TodoList() {
    const { theme } = useTheme();
    const [data, setData] = useState<Todo[]>([]);
    const [text, setText] = useState('');
    const [selave, setSelave] = useState('');
    const [selavanathu, setSelavanathu] = useState('');
    const [loading, setLoading] = useState(true);
    const [varavu, setVaravu] = useState('0');
    const [addModalVisible, setAddModalVisible] = useState(false);

    const [selectedHistoryItem, setSelectedHistoryItem] = useState<{ key: string, label: string } | null>(null);
    const [historyModalVisible, setHistoryModalVisible] = useState(false);

    // Initial Load
    useEffect(() => {
        let kanakuResults: any = null;

        const loadData = async () => {
            try {
                // Load Varavu from MMKV
                const storedVaravu = getItem(VARAVU_KEY);
                if (storedVaravu) {
                    setVaravu(storedVaravu);
                }

                // Initialize Realm listener
                kanakuResults = await getKanaku();

                const updateState = () => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setData(kanakuResults.map((k: any) => ({
                        key: k.uid,
                        label: k.ethuku,
                        selave: k.selavu,
                        selavanathu: k.selavanathu,
                        completed: k.completed || false,
                        order: k.order || 0,
                    })));
                    setLoading(false);
                };

                // Initial fetch
                updateState();

                // Add listener for live updates
                kanakuResults.addListener(updateState);
            } catch (error) {
                console.error('Failed to load data', error);
                setLoading(false);
            }
        };

        loadData();

        return () => {
            if (kanakuResults) {
                kanakuResults.removeAllListeners();
            }
            closeRealm();
        };
    }, []);

    // Save Varavu to MMKV
    useEffect(() => {
        const handler = setTimeout(() => {
            setItem(VARAVU_KEY, varavu);
        }, 1000); // Debounce save

        return () => clearTimeout(handler);
    }, [varavu]);

    const toggleTodo = useCallback((key: string) => {
        toggleKanaku(key);
    }, []);

    const updateTodo = useCallback((key: string, field: 'selave' | 'selavanathu' | 'ethuku', value: number) => {
        if (field === 'ethuku') {
            // @ts-ignore - Handle potential string value for ethuku if needed in future
            updateKanaku(key, String(value), 'ethuku').catch(e => Alert.alert('Error', e.message));
        } else if (field === 'selave') {
            updateKanaku(key, value, 'selavu').catch(e => Alert.alert('Error', e.message));
        } else {
            updateKanaku(key, value, 'selavanathu').catch(e => Alert.alert('Error', e.message));
        }
    }, []);

    const viewHistory = useCallback((item: { key: string, label: string }) => {
        setSelectedHistoryItem(item);
        setHistoryModalVisible(true);
    }, []);

    const addTodo = useCallback(async () => {
        if (text.trim() && selave.trim()) {
            try {
                await addKanaku(text.trim(), parseInt(selave) || 0, parseInt(selavanathu) || 0);
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setText('');
                setSelave('');
                setSelavanathu('');
                setAddModalVisible(false);
            } catch (error) {
                Alert.alert('Error', 'Failed to add task: ' + (error as Error).message);
            }
        } else {
            Alert.alert('Error', 'Task name and Selavu are required');
        }
    }, [text, selave, selavanathu]);

    const deleteTodo = useCallback((key: string) => {
        Alert.alert(
            "பணியை நீக்கு",
            "இந்த பணியை நிச்சயமாக நீக்க விரும்புகிறீர்களா?",
            [
                { text: "ரத்து", style: "cancel" },
                {
                    text: "நீக்கு", style: "destructive", onPress: () => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        deleteKanaku(key).catch(e => Alert.alert('Error', e.message));
                    }
                }
            ]
        );
    }, []);

    const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<Todo>) => {
        return (
            <ScaleDecorator>
                <OpacityDecorator>
                    <ShadowDecorator>
                        <TodoItem item={item} drag={drag} isActive={isActive} onToggle={toggleTodo} onUpdate={updateTodo} onDelete={deleteTodo} onViewHistory={viewHistory} />
                    </ShadowDecorator>
                </OpacityDecorator>
            </ScaleDecorator>
        );
    }, [toggleTodo, updateTodo, deleteTodo, viewHistory]);


    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={theme === 'dark' ? '#fff' : '#000'} />
            </View>
        );
    }



    return (
        <KeyboardAvoidingView style={[styles.container, { backgroundColor: Colors[theme].background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.summaryContainer}>
                        <View style={[styles.summaryCard, styles.fullWidthCard, { backgroundColor: Colors[theme].cardBackground }]}>
                            <ThemedText style={styles.summaryLabel}>வரவு</ThemedText>
                            <View style={styles.amountInputContainer}>
                                <TextInput style={[styles.summaryInput, { color: Colors[theme].text }]} value={varavu} onChangeText={setVaravu} placeholder="0" keyboardType="numeric" placeholderTextColor={Colors[theme].icon} />
                            </View>
                        </View>
                        <View style={[styles.summaryCard, styles.halfWidthCard, { backgroundColor: Colors[theme].cardBackground }]}>
                            <ThemedText style={styles.summaryLabel}>செலவு</ThemedText>
                            <ThemedText style={[styles.summaryValue, { color: Colors[theme].danger }]}>{data.reduce((acc, item) => acc + (item.selave || 0), 0).toLocaleString('en-IN')}</ThemedText>
                        </View>
                        <View style={[styles.summaryCard, styles.halfWidthCard, { backgroundColor: Colors[theme].cardBackground }]}>
                            <ThemedText style={styles.summaryLabel}>செலவானது</ThemedText>
                            <ThemedText style={[styles.summaryValue, { color: Colors[theme].danger }]}>{data.reduce((acc, item) => acc + (item.selavanathu || 0), 0).toLocaleString('en-IN')}</ThemedText>
                        </View>
                        <View style={[styles.summaryCard, styles.halfWidthCard, { backgroundColor: Colors[theme].cardBackground }]}>
                            <ThemedText style={styles.summaryLabel}>சேமிப்பு</ThemedText>
                            <ThemedText style={[styles.summaryValue, { color: (parseInt(varavu) || 0) - data.reduce((acc, item) => acc + (item.selave || 0), 0) >= 0 ? Colors[theme].success : Colors[theme].danger }]}>{((parseInt(varavu) || 0) - data.reduce((acc, item) => acc + (item.selave || 0), 0)).toLocaleString('en-IN')}</ThemedText>
                        </View>
                        <View style={[styles.summaryCard, styles.halfWidthCard, { backgroundColor: Colors[theme].cardBackground }]}>
                            <ThemedText style={styles.summaryLabel}>இருப்பு</ThemedText>
                            <ThemedText style={[styles.summaryValue, { color: (parseInt(varavu) || 0) - data.reduce((acc, item) => acc + (item.selavanathu || 0), 0) >= 0 ? Colors[theme].success : Colors[theme].danger }]}>{((parseInt(varavu) || 0) - data.reduce((acc, item) => acc + (item.selavanathu || 0), 0)).toLocaleString('en-IN')}</ThemedText>
                        </View>
                    </View>
                    <DraggableFlatList data={data} onDragEnd={({ data }) => {
                        setData(data); // Immediate UI update
                        // Optimization: Only update items whose order has actually changed
                        const updates = data.reduce((acc, item, index) => {
                            if (item.order !== index) {
                                acc.push({ key: item.key, order: index });
                            }
                            return acc;
                        }, [] as { key: string, order: number }[]);

                        if (updates.length > 0) {
                            updateOrder(updates).catch(e => Alert.alert('Error', e.message));
                        }
                    }} keyExtractor={(item) => item.key} renderItem={renderItem} containerStyle={styles.listContainer} />

                    <TouchableOpacity style={[styles.fab, { backgroundColor: Colors[theme].tint }]} onPress={() => setAddModalVisible(true)}>
                        <ThemedText style={styles.fabText}>+</ThemedText>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>

            <Modal animationType="slide" transparent={true} visible={addModalVisible} onRequestClose={() => setAddModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <TouchableWithoutFeedback onPress={() => setAddModalVisible(false)}>
                        <View style={styles.centeredView}>
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View style={[styles.modalView, { backgroundColor: Colors[theme].cardBackground }]} onStartShouldSetResponder={() => true}>
                                    <View style={styles.dragHandleContainer}>
                                        <View style={[styles.dragHandle, { backgroundColor: Colors[theme].icon }]} />
                                    </View>
                                    <ThemedText style={styles.modalTitle}>புதிய பணி சேர்</ThemedText>

                                    <TextInput style={[styles.modalInput, { color: Colors[theme].text, borderColor: Colors[theme].borderColor, backgroundColor: Colors[theme].inputBackground }]}
                                        value={text}
                                        onChangeText={setText}
                                        placeholder="பணி பெயர்"
                                        keyboardType="default"
                                        placeholderTextColor={Colors[theme].icon}
                                    />
                                    <TextInput
                                        style={[styles.modalInput, { color: Colors[theme].text, borderColor: Colors[theme].borderColor, backgroundColor: Colors[theme].inputBackground }]}
                                        value={selave}
                                        onChangeText={setSelave}
                                        placeholder="செலவு தொகை"
                                        keyboardType="numeric"
                                        placeholderTextColor={Colors[theme].icon}
                                    />
                                    <TextInput
                                        style={[styles.modalInput, { color: Colors[theme].text, borderColor: Colors[theme].borderColor, backgroundColor: Colors[theme].inputBackground }]}
                                        value={selavanathu}
                                        onChangeText={setSelavanathu}
                                        placeholder="செலவான தொகை"
                                        keyboardType="numeric"
                                        placeholderTextColor={Colors[theme].icon}
                                    />

                                    <View style={styles.modalButtons}>
                                        <TouchableOpacity onPress={() => setAddModalVisible(false)} style={[styles.modalButton, { backgroundColor: Colors[theme].danger }]}>
                                            <Text style={styles.buttonText}>ரத்து</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={addTodo} style={[styles.modalButton, { backgroundColor: Colors[theme].tint }]}>
                                            <Text style={styles.buttonText}>சேர்</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>
            <HistoryModal visible={historyModalVisible} onClose={() => setHistoryModalVisible(false)} item={selectedHistoryItem} />

        </KeyboardAvoidingView>
    );
}

import { GlobalStyles } from '@/constants/Styles';
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    center: GlobalStyles.center,
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        ...GlobalStyles.shadowMedium, // Use shadowMedium instead of manual shadow
    },
    fabText: {
        fontSize: 32,
        color: '#fff',
        fontWeight: 'bold',
        marginTop: -4,
    },
    centeredView: GlobalStyles.modalOverlayBottom,
    modalView: {
        width: '100%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        alignItems: "center",
        ...GlobalStyles.shadowLarge,
    },
    dragHandleContainer: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: 20,
    },
    dragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        opacity: 0.3,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalInput: {
        ...GlobalStyles.input,
        marginBottom: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
        gap: 16,
    },
    modalButton: {
        flex: 1,
        ...GlobalStyles.button,
    },
    buttonText: GlobalStyles.buttonText,
    listContainer: {
        flex: 1,
        width: '100%',
    },
    summaryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 0,
        paddingVertical: 8,
        gap: 8,
    },
    summaryCard: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        ...GlobalStyles.shadowMedium,
    },
    fullWidthCard: {
        width: '100%',
        marginBottom: 4,
    },
    halfWidthCard: {
        width: '48%',
        flexGrow: 1,
    },
    summaryLabel: {
        fontSize: 12,
        opacity: 0.6,
        marginBottom: 6,
        textAlign: 'center',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
    },
    amountInputContainer: GlobalStyles.row,
    currencySymbol: {
        fontSize: 16,
        fontWeight: '700',
        marginRight: 2,
    },
    summaryInput: {
        fontSize: 24,
        fontWeight: '700',
        minWidth: 40,
        textAlign: 'center',
        padding: 0,
    },
});
