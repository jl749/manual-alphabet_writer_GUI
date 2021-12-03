const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;
let mainWindow;
let addWindow;

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// listen for the app to be ready
app.on('ready', () => {
    // create new window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: false, // is default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            enableRemoteModule: false, // turn off remote
            preload: path.join(__dirname, "preload.js")
        },
    });  // empty conf
    // load html into window
    mainWindow.loadFile('mainWindow.html');  // loadURL

    // quit app when closed
    mainWindow.on('closed', () => {
        app.quit();
    });

    // build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

// handle create add window
function createAddWindow() {
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        /**
         * nodeIntegration: true is a security risk 
         * only when you're executing some untrusted remote code on your application. 
         * For example, suppose your application opens up a third party webpage. 
         * That would be a security risk because the third party webpage will have access to node runtime 
         * and can run some malicious code on your user's filesystem
         */
    });

    addWindow.loadFile(path.join(__dirname, 'addWindow.html'));

    // garbage collection handle
    addWindow.on('close', () => {
        addWindow = null;
    });
}

// catch item:add
ipcMain.on('item:add', (e, item) => {
    mainWindow.webContents.send('item:add', item);  // hand it over to mainWindow
    addWindow.close();  // after addWindow emit this event close it
});

// create menu template
const mainMenuTemplate = [  // array of obj
    {
        label: 'File',
        submenu:[
            {
                label: 'Add Item',
                click() {
                    createAddWindow()
                }
            },
            {
                label: 'Clear Item'
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+W' : 'Ctrl+W',
                click() {
                    app.quit();
                }
            },
        ]
    }
];

if(process.platform == 'darwin') {
    mainMenuTemplate.unshift({});  // add on to the beginning of the array
}

// Add dev tool item if not in production
if(process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push(
        {
            label: 'Developer Tools',
            submenu: [
                {
                    label: 'Toggle DevTools',
                    accelerator: (process.platform == 'darwin') ? 'Command+I' : 'Ctrl+I',
                    click(item, focusedWindow) {
                        focusedWindow.toggleDevTools();
                    }
                },
                {role: 'reload'}
            ]
        }
    );
}