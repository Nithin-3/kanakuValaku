import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, TouchableWithoutFeedback, Platform, KeyboardAvoidingView, Alert, LayoutAnimation, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import { getVaralaru } from '@/services/realm';
import { Tvaralaru } from '@/types/type';

import { GlobalStyles } from '@/constants/Styles';



interface HistoryModalProps {
    visible: boolean;
    onClose: () => void;
    item: { key: string, label: string } | null;
}

export function HistoryModal({ visible, onClose, item }: HistoryModalProps) {
    const { theme } = useTheme();
    const [history, setHistory] = useState<Tvaralaru[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (item && visible) {
            loadHistory();
        }
    }, [item, visible]);

    const loadHistory = async () => {
        if (!item) return;
        setLoading(true);
        try {
            const results = await getVaralaru(item.key);
            // Convert Realm Results to array
            const historyArray = results.map(h => ({
                kanaku: String(h.kanaku),
                neram: h.neram as Date,
                matram: String(h.matram),
                ethu: h.ethu as "selavu" | "selavanathu" | "ethuku"
            }));
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setHistory(historyArray);
        } catch (error) {
            Alert.alert('Error', 'Failed to load history: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    const getFieldLabel = (field: string) => {
        switch (field) {
            case 'selavu': return 'செலவு';
            case 'selavanathu': return 'செலவானது';
            case 'ethuku': return 'தலைப்பு';
            default: return field;
        }
    };

    return (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.centeredView}>
                        <TouchableWithoutFeedback>
                            <View style={[styles.modalView, { backgroundColor: Colors[theme].cardBackground }]}>
                                <ThemedText style={styles.modalTitle}>{item?.label}</ThemedText>
                                <ThemedText style={styles.subTitle}>வரலாறு</ThemedText>

                                {loading ? (
                                    <View style={styles.loaderContainer}>
                                        <ActivityIndicator size="large" color={Colors[theme].tint} />
                                    </View>
                                ) : history.length === 0 ? (
                                    <View style={styles.emptyContainer}>
                                        <ThemedText style={styles.emptyText}>வரலாறு இல்லை</ThemedText>
                                    </View>
                                ) : (
                                    <FlatList
                                        data={history}
                                        keyExtractor={(_, index) => index.toString()}
                                        contentContainerStyle={styles.listContent}
                                        renderItem={({ item: historyItem }) => (
                                            <Pressable style={[styles.historyItem, { backgroundColor: Colors[theme].background, shadowColor: Colors[theme].text }]}>
                                                <View style={styles.historyHeader}>
                                                    <View style={[styles.tag, { backgroundColor: Colors[theme].tint + '20' }]}>
                                                        <ThemedText style={[styles.tagText, { color: Colors[theme].tint }]}>
                                                            {getFieldLabel(historyItem.ethu)}
                                                        </ThemedText>
                                                    </View>
                                                    <ThemedText style={styles.dateText}>{formatDate(historyItem.neram)}</ThemedText>
                                                </View>
                                                <ThemedText style={styles.changeText}>{historyItem.matram}</ThemedText>
                                            </Pressable>
                                        )}
                                        style={styles.list}
                                        showsVerticalScrollIndicator={false}
                                        showsHorizontalScrollIndicator={false}
                                    />
                                )}

                                <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: Colors[theme].tint }]}>
                                    <ThemedText style={styles.buttonText}>மூடு</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: GlobalStyles.modalOverlayBottom,
    modalView: {
        width: '100%',
        height: '70%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingTop: 16,
        ...GlobalStyles.shadowLarge,
    },
    dragHandleContainer: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: 16,
    },
    dragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        opacity: 0.3,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subTitle: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.6,
        marginBottom: 20,
    },
    list: {
        width: '100%',
        marginBottom: 16,
    },
    listContent: {
        paddingBottom: 20,
    },
    loaderContainer: GlobalStyles.center,
    emptyContainer: GlobalStyles.center,
    historyItem: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        ...GlobalStyles.shadowSmall,
    },
    historyHeader: GlobalStyles.rowBetween,
    dateText: {
        fontSize: 12,
        opacity: 0.5,
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '700',
    },
    changeText: {
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 22,
    },
    emptyText: {
        textAlign: 'center',
        opacity: 0.6,
        fontSize: 16,
    },
    closeButton: {
        ...GlobalStyles.button,
        width: '100%',
        marginTop: 'auto',
    },
    buttonText: GlobalStyles.buttonText,
});
