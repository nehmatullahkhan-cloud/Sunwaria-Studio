const STORAGE_KEY_TIME_OFFSET = 'sunwarian_time_offset';
let isSyncedInSession = false;

export interface TimeSyncResult {
  networkTime: number;
  offset: number;
}

export const getStoredOffset = (): number => {
  const stored = localStorage.getItem(STORAGE_KEY_TIME_OFFSET);
  return stored ? parseFloat(stored) : 0;
};

export const saveOffset = (offset: number) => {
  localStorage.setItem(STORAGE_KEY_TIME_OFFSET, offset.toString());
};

export const isTimeSynced = () => isSyncedInSession;

/**
 * Fetches accurate time from multiple public APIs.
 */
export const syncTimeWithNetwork = async (): Promise<TimeSyncResult | null> => {
  const startTime = Date.now();
  
  const services = [
    { url: 'https://worldtimeapi.org/api/ip', key: 'datetime' },
    { url: 'https://timeapi.io/api/time/current/zone?timeZone=UTC', key: 'dateTime' }
  ];

  for (const service of services) {
    try {
      const response = await fetch(service.url, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        const endTime = Date.now();
        const latency = (endTime - startTime) / 2;
        
        const networkTime = new Date(data[service.key]).getTime() + latency;
        const offset = networkTime - endTime;
        
        saveOffset(offset);
        isSyncedInSession = true;
        console.log(`Verified Network Time. Offset: ${offset}ms`);
        return { networkTime, offset };
      }
    } catch (e) {
      console.warn(`Sync failed for ${service.url}`);
    }
  }

  // Fallback to server header
  try {
    const response = await fetch(window.location.href, { method: 'HEAD', cache: 'no-store' });
    const serverDateStr = response.headers.get('date');
    if (serverDateStr) {
      const networkTime = new Date(serverDateStr).getTime();
      const endTime = Date.now();
      const offset = networkTime - endTime;
      saveOffset(offset);
      isSyncedInSession = true;
      return { networkTime, offset };
    }
  } catch (e) {
    console.error('All time sync methods failed');
  }

  return null;
};

/**
 * Returns the corrected Date object.
 */
export const getTrueDate = (): Date => {
  const offset = getStoredOffset();
  return new Date(Date.now() + offset);
};
