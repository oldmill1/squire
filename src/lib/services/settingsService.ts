import { pouchdbService } from './pouchdbService';

interface Setting {
  _id: string;
  type: 'setting';
  key: string;
  value: any;
  updated: string;
}

export const settingsService = {
  // Get a setting by key
  async getSetting(key: string, defaultValue: any = null) {
    try {
      const setting = await pouchdbService.get(`setting:${key}`);
      return setting.value;
    } catch (error: any) {
      // Setting doesn't exist (404 not_found is expected), return default
      if (error.status === 404 || error.name === 'not_found') {
        return defaultValue;
      }
      // Other unexpected errors
      console.error(`Error getting setting ${key}:`, error);
      return defaultValue;
    }
  },

  // Save a setting
  async setSetting(key: string, value: any) {
    try {
      const setting: Setting = {
        _id: `setting:${key}`,
        type: 'setting',
        key,
        value,
        updated: new Date().toISOString()
      };

      try {
        // Try to get existing document first to get _rev
        const existing = await pouchdbService.get(`setting:${key}`);
        setting._id = existing._id;
        // @ts-ignore
        setting._rev = existing._rev;
      } catch (error: any) {
        // Document doesn't exist yet (404 not_found is expected), create new one
        if (error.status !== 404 && error.name !== 'not_found') {
          console.error(`Error checking existing setting ${key}:`, error);
        }
      }

      return await pouchdbService.upsert(setting);
    } catch (error) {
      console.error(`Failed to save setting ${key}:`, error);
      throw error;
    }
  },

  // Get all settings
  async getAllSettings() {
    try {
      const allDocs = await pouchdbService.allDocs();
      return allDocs
        .filter((doc: any) => doc.type === 'setting')
        .reduce((acc: any, setting: any) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {});
    } catch (error) {
      console.error('Error loading all settings:', error);
      return {};
    }
  }
};

export default settingsService;
