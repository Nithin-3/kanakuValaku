const tintColorLight = '#4F46E5'; // Indigo 600
const tintColorDark = '#818CF8'; // Indigo 400

// Common semantic colors
const common = {
    success: '#10B981', // Emerald 500
    danger: '#EF4444', // Red 500
    warning: '#F59E0B', // Amber 500
    info: '#3B82F6', // Blue 500
};

export const Colors = {
    light: {
        text: '#1F2937', // Gray 800
        background: '#F9FAFB', // Gray 50
        tint: tintColorLight,
        icon: '#6B7280', // Gray 500
        tabIconDefault: '#9CA3AF',
        tabIconSelected: tintColorLight,
        cardBackground: '#FFFFFF',
        inputBackground: '#FFFFFF',
        borderColor: '#E5E7EB', // Gray 200
        ...common,
    },
    dark: {
        text: '#F3F4F6', // Gray 100
        background: '#111827', // Gray 900
        tint: tintColorDark,
        icon: '#9CA3AF', // Gray 400
        tabIconDefault: '#6B7280',
        tabIconSelected: tintColorDark,
        cardBackground: '#1F2937', // Gray 800
        inputBackground: '#374151', // Gray 700
        borderColor: '#374151', // Gray 700
        ...common,
    },
};
