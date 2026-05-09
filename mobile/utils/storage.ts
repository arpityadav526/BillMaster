import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  async set(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },

  async get(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  },

  async remove(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },

  async setJSON(key: string, value: any): Promise<void> {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  },

  async getJSON<T>(key: string): Promise<T | null> {
    const value = await SecureStore.getItemAsync(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },
};
