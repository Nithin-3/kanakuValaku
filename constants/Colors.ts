const tintColorLight = '#4F46E5'; // Indigo 600
const tintColorDark = '#7aa2f7'; // Tokyo Night Blue

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
        text: '#c0caf5', // Tokyo Night Foreground
        background: '#1a1b26', // Tokyo Night Background
        tint: tintColorDark,
        icon: '#787c99', // Tokyo Night Comments/Dark Text
        tabIconDefault: '#565f89',
        tabIconSelected: tintColorDark,
        cardBackground: '#24283b', // Tokyo Night Dark (Lighter than bg)
        inputBackground: '#1f2335', // Tokyo Night Black/Input
        borderColor: '#414868', // Tokyo Night Terminal Black
        success: '#9ece6a', // Tokyo Night Green
        danger: '#f7768e', // Tokyo Night Red
        warning: '#e0af68', // Tokyo Night Orange
        info: '#7dcfff', // Tokyo Night Cyan
    },
};
