// Import required modules and functions from Electron and helpers file
import path from "path";
import serve from "electron-serve";
import { app, ipcMain, Notification, dialog } from "electron";
import { Menu, globalShortcut, Tray, nativeTheme } from "electron";
import { createWindow, ownMenu, customCtxMenu } from "./helpers";

// For web-socket connection
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const appExpress = express();
const httpServer = createServer(appExpress);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// Check if the application is in production mode
const isProd = process.env.NODE_ENV === "production";
const TITLE = "Starter kit electron-next";

// Variable Used for Tray application
let tray;

// Serve the app directory in production mode
if (isProd) {
  serve({ directory: "app" });
} else {
  // In development mode, modify user data path and add a label to indicate it's in development
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

var mainWindow = "";
var currentTheme = "";
// Main asynchronous function
(async () => {
  // Wait until Electron app is ready
  await app.whenReady();

  // Create a main window with specified options
  const mainWindowObject = createWindow("main", {
    width: 950,
    height: 600,
    title: TITLE,
    show: false,
    webPreferences: {
      // Specify a preload script to be injected into the web page
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow = mainWindowObject.win;
  currentTheme = mainWindowObject.currentTheme;

  // Code for Menu
  const menu = Menu.buildFromTemplate(ownMenu);
  Menu.setApplicationMenu(menu);

  // Code for customCtxMenu
  mainWindow.webContents.on("context-menu", function (e, params) {
    customCtxMenu.popup(mainWindow, params.x, params.y);
  });

  // Code for globalShortcut
  globalShortcut.register("Alt+Z", () => {
    mainWindow.show();
  });
  globalShortcut.register("Alt+X", () => {
    mainWindow.hide();
  });

  // Code for Tray and nativeImage
  const iconPath = path.join(__dirname, "..\\resources\\desktop-logo.png");
  tray = new Tray(iconPath);
  const contexttrayMenu = Menu.buildFromTemplate(ownMenu);
  tray.setToolTip(TITLE);
  tray.setContextMenu(contexttrayMenu);

  // Load the appropriate URL based on the environment
  if (isProd) {
    await mainWindow.loadURL("app://./home");
  } else {
    // In development mode, get port from command line arguments and load URL with localhost
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);

    showNotification();
    // Open DevTools for debugging in development mode
    mainWindow.webContents.openDevTools();
  }
})();

// Event handler when all windows are closed, quit the application
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Event handler when all windows are closed, quit the application
app.on("will-quit", () => {
  globalShortcut.unregister("Alt+Z");
  globalShortcut.unregister("Alt+X");
  globalShortcut.unregisterAll();
});

// 1. Event listener for IPC (Inter-Process Communication) messages from the renderer process
ipcMain.on("message", async (event, arg) => {
  // Reply to the renderer process with a modified message
  const options = {
    type: "info",
    title: "Information",
    message: "This is an information message box.",
    buttons: ["OK", "CANCEL"],
  };
  dialog.showMessageBox(options).then((response) => {
    event.reply(
      "message",
      `User clicked button index: ${response.response}, ${arg} next-electron!`
    );
  });
});

// 2. EXTRA FUNCTION FOR DARK-MODE AND LIGHT-MODE
ipcMain.handle("dark-mode:toggle", () => {
  const currentColor = nativeTheme.shouldUseDarkColors;
  nativeTheme.themeSource = currentColor ? "light" : "dark";
  currentTheme = currentColor ? "light" : "dark";
  return currentColor ? false : true;
});

ipcMain.handle("dark-mode:system", () => {
  if (currentTheme == undefined) nativeTheme.themeSource = "system";
  else nativeTheme.themeSource = currentTheme;
  return nativeTheme.themeSource == "dark" ? true : false;
});

// 3.. Notification
function showNotification() {
  const NOTIFICATION_TITLE = TITLE;
  const currentTime = new Date().toLocaleTimeString();
  const NOTIFICATION_BODY = `Your ${TITLE} has started.\nEnjoy your work! Current time: ${currentTime}`;
  new Notification({
    title: NOTIFICATION_TITLE,
    body: NOTIFICATION_BODY,
  }).show();
}

// 4. OPEN EXTERNAL LINKS
const { shell } = require("electron");
ipcMain.handle("externals-links:open", async (event, link) => {
  await shell.openExternal(link);
  return "opened!";
});

// 5. Socket.IO
io.on("connection", async (socket) => {
  console.log("Connecting for the user!");

  const response = "Ok recivied First call!";
  socket.emit("messagesForYou", response);

  socket.on("postMessage", async ({ text }) => {
    const response = `Ok recivied messages Updated call! ${text}`;
    io.emit("messagesUpdated", response);
  });

  socket.on("serialData", (data) => {
    console.log("Received serial data:", data);
  });

  socket.on("disconnect", () => {
    console.log("Client Disconnected!");
  });
});

httpServer.listen(8000);
