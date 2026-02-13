import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import DraggableFlatList, {
    RenderItemParams,
    ScaleDecorator,
    ShadowDecorator,
    OpacityDecorator
} from 'react-native-draggable-flatlist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TodoItem } from './TodoItem';
import { useTheme } from '@/context/ThemeContext';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';

type Todo = {
    key: string;
    label: string;
    selave: number;
    selavanathu: number;
    completed: boolean;
};

const STORAGE_KEY = 'kanakuValaku_todos';
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

    // Load todos from storage on mount
    useEffect(() => {
        const loadTodos = async () => {
            try {
                const storedTodos = await AsyncStorage.getItem(STORAGE_KEY);
                if (storedTodos) {
                    setData(JSON.parse(storedTodos));
                }
                const storedVaravu = await AsyncStorage.getItem(VARAVU_KEY);
                if (storedVaravu) {
                    setVaravu(storedVaravu);
                }
            } catch (error) {
                console.error('Failed to load todos', error);
            } finally {
                setLoading(false);
            }
        };
        loadTodos();
    }, []);

    useEffect(() => {
        if (!loading) {
            const saveTodos = async () => {
                try {
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                } catch (error) {
                    console.error('Failed to save todos', error);
                }
            };
            saveTodos();
        }
    }, [data, loading]);

    useEffect(() => {
        if (!loading) {
            const handler = setTimeout(async () => {
                try {
                    await AsyncStorage.setItem(VARAVU_KEY, varavu);
                } catch (error) {
                    console.error('Failed to save varavu', error);
                }
            }, 1000);

            return () => {
                clearTimeout(handler);
            };
        }
    }, [varavu, loading]);

    const toggleTodo = useCallback((key: string) => {
        setData(prev => {
            const updatedList = prev.map(item =>
                item.key === key ? { ...item, completed: !item.completed } : item
            );
            return [...updatedList.filter(item => !item.completed), ...updatedList.filter(item => item.completed)];
        });
    }, []);

    const updateTodo = useCallback((key: string, field: 'selave' | 'selavanathu', value: number) => {
        setData(prev => prev.map(item =>
            item.key === key ? { ...item, [field]: value } : item
        ));
    }, []);

    const addTodo = () => {
        if (text.trim() && selave.trim()) {
            setData(prev => [
                ...prev,
                {
                    key: Date.now().toString(),
                    label: text.trim(),
                    selave: parseInt(selave) || 0,
                    selavanathu: parseInt(selavanathu) || 0,
                    completed: false,
                },
            ]);
            setText('');
            setSelave('');
            setSelavanathu('');
            setAddModalVisible(false);
        } else {
            Alert.alert('Error', 'Task name and Selavu are required');
        }
    };

    const deleteTodo = useCallback((key: string) => {
        Alert.alert(
            "பணியை நீக்கு",
            "இந்த பணியை நிச்சயமாக நீக்க விரும்புகிறீர்களா?",
            [
                { text: "ரத்து", style: "cancel" },
                {
                    text: "நீக்கு", style: "destructive", onPress: () => {
                        setData(prev => prev.filter(item => item.key !== key));
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
                        <TodoItem
                            item={item}
                            drag={drag}
                            isActive={isActive}
                            onToggle={toggleTodo}
                            onUpdate={updateTodo}
                            onDelete={deleteTodo}
                        />
                    </ShadowDecorator>
                </OpacityDecorator>
            </ScaleDecorator>
        );
    }, [toggleTodo, updateTodo, deleteTodo]);

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={theme === 'dark' ? '#fff' : '#000'} />
            </View>
        );
    }



    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: Colors[theme].background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.summaryContainer}>
                        <View style={[styles.summaryCard, styles.fullWidthCard, { backgroundColor: Colors[theme].cardBackground }]}>
                            <ThemedText style={styles.summaryLabel}>வரவு</ThemedText>
                            <View style={styles.amountInputContainer}>
                                <TextInput
                                    style={[styles.summaryInput, { color: Colors[theme].text }]}
                                    value={varavu}
                                    onChangeText={setVaravu}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    placeholderTextColor={Colors[theme].icon}
                                />
                            </View>
                        </View>
                        <View style={[styles.summaryCard, styles.halfWidthCard, { backgroundColor: Colors[theme].cardBackground }]}>
                            <ThemedText style={styles.summaryLabel}>செலவு</ThemedText>
                            <ThemedText style={[styles.summaryValue, { color: Colors[theme].danger }]}>
                                {data.reduce((acc, item) => acc + (item.selave || 0), 0).toLocaleString('en-IN')}
                            </ThemedText>
                        </View>
                        <View style={[styles.summaryCard, styles.halfWidthCard, { backgroundColor: Colors[theme].cardBackground }]}>
                            <ThemedText style={styles.summaryLabel}>செலவானது</ThemedText>
                            <ThemedText style={[styles.summaryValue, { color: Colors[theme].danger }]}>
                                {data.reduce((acc, item) => acc + (item.selavanathu || 0), 0).toLocaleString('en-IN')}
                            </ThemedText>
                        </View>
                        <View style={[styles.summaryCard, styles.halfWidthCard, { backgroundColor: Colors[theme].cardBackground }]}>
                            <ThemedText style={styles.summaryLabel}>சேமிப்பு</ThemedText>
                            <ThemedText style={[styles.summaryValue, { color: (parseInt(varavu) || 0) - data.reduce((acc, item) => acc + (item.selave || 0), 0) >= 0 ? Colors[theme].success : Colors[theme].danger }]}>
                                {((parseInt(varavu) || 0) - data.reduce((acc, item) => acc + (item.selave || 0), 0)).toLocaleString('en-IN')}
                            </ThemedText>
                        </View>
                        <View style={[styles.summaryCard, styles.halfWidthCard, { backgroundColor: Colors[theme].cardBackground }]}>
                            <ThemedText style={styles.summaryLabel}>இருப்பு</ThemedText>
                            <ThemedText style={[styles.summaryValue, { color: (parseInt(varavu) || 0) - data.reduce((acc, item) => acc + (item.selavanathu || 0), 0) >= 0 ? Colors[theme].success : Colors[theme].danger }]}>
                                {((parseInt(varavu) || 0) - data.reduce((acc, item) => acc + (item.selavanathu || 0), 0)).toLocaleString('en-IN')}
                            </ThemedText>
                        </View>
                    </View>
                    <DraggableFlatList data={data} onDragEnd={({ data }) => setData(data)} keyExtractor={(item) => item.key} renderItem={renderItem} containerStyle={styles.listContainer} />

                    <TouchableOpacity style={[styles.fab, { backgroundColor: Colors[theme].tint }]} onPress={() => setAddModalVisible(true)}>
                        <ThemedText style={styles.fabText}>+</ThemedText>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>

            <Modal
                animationType="slide"
                transparent={true}
                visible={addModalVisible}
                onRequestClose={() => setAddModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <TouchableWithoutFeedback onPress={() => setAddModalVisible(false)}>
                        <View style={styles.centeredView}>
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View style={[styles.modalView, { backgroundColor: Colors[theme].cardBackground }]} onStartShouldSetResponder={() => true}>
                                    <ThemedText style={styles.modalTitle}>புதிய பணி சேர்</ThemedText>

                                    <TextInput
                                        style={[styles.modalInput, { color: Colors[theme].text, borderColor: Colors[theme].borderColor, backgroundColor: Colors[theme].inputBackground }]}
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
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    fabText: {
        fontSize: 32,
        color: '#fff',
        fontWeight: 'bold',
        marginTop: -4,
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
        padding: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '85%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    modalInput: {
        width: '100%',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 12,
        gap: 12,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    listContainer: {
        flex: 1,
        width: '100%',
    },
    summaryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    summaryCard: {
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    fullWidthCard: {
        width: '100%',
        marginBottom: 4,
    },
    halfWidthCard: {
        width: '48%', // Approx half with gap
        flexGrow: 1,
    },
    summaryLabel: {
        fontSize: 12,
        opacity: 0.7,
        marginBottom: 4,
        textAlign: 'center',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    currencySymbol: {
        fontSize: 16,
        fontWeight: '700',
        marginRight: 2,
    },
    summaryInput: {
        fontSize: 16,
        fontWeight: '700',
        minWidth: 40,
        textAlign: 'center',
        padding: 0,
    },
});
