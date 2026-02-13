import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';

export function Header() {
    const { theme, toggleTheme } = useTheme();



    return (
        <ThemedView style={[styles.headerContainer, { borderBottomColor: Colors[theme].borderColor }]}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <View style={styles.contentContainer}>
                    <ThemedText type="title">கணக்கு வழக்கு</ThemedText>
                    <View style={styles.switchContainer}>
                        <ThemedText style={styles.themeLabel}>{theme === 'dark' ? 'இருட்டு' : 'ஒளிர்வு'}</ThemedText>
                        <Switch
                            value={theme === 'dark'}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#767577', true: Colors['dark'].tint }}
                            thumbColor={theme === 'dark' ? '#5aff2cff' : '#f4f3f4'}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    safeArea: {
        width: '100%',
    },
    contentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    themeLabel: {
        fontSize: 14,
    }
});
