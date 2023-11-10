// Import required modules from Electron
import { contextBridge, ipcRenderer } from "electron";

// 1. Define an object with methods for sending and receiving IPC messages
const handler = {
  // Method to send IPC messages from the renderer process to the main process
  send(channel, value) {
    ipcRenderer.send(channel, value);
  },

  // Method to listen for IPC messages sent from the main process
  on(channel, callback) {
    // Create a subscription function that calls the provided callback with arguments
    const subscription = (_event, ...args) => callback(...args);

    // Add an event listener for the specified channel with the subscription function
    ipcRenderer.on(channel, subscription);

    // Return a cleanup function to remove the event listener when it's no longer needed
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
};

// Expose the defined IPC methods in the main world context of the renderer process
contextBridge.exposeInMainWorld("ipc", handler);

// 2. THEME COLOR
contextBridge.exposeInMainWorld("darkMode", {
  toggle: async () => {
    const response = await ipcRenderer.invoke("dark-mode:toggle");
    return response;
  },
  system: async () => {
    return await ipcRenderer.invoke("dark-mode:system");
  },
});

// 3. OPEN EXTERNAL LINKS
contextBridge.exposeInMainWorld("openLinkInWeb", {
  openLinkInWebPage: async (link) => {
    return ipcRenderer.invoke("externals-links:open", link);
  },
});
