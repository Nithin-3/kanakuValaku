import { createMMKV } from 'react-native-mmkv';

const mmkv = createMMKV();

export const setItem = (key: string, value: string) => {
    mmkv.set(key, value);
};

export const getItem = (key: string) => {
    return mmkv.getString(key);
};

export const removeItem = (key: string) => {
    mmkv.remove(key);
};