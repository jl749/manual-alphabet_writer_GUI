const electron = require('electron');
const url = require('url');
const path = require('path');

const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');  // '@tensorflow/tfjs-node-gpu' if running with GPU.
var model;
var check_moving_model;

async function loadModel(model_path){
    const handler = tfn.io.fileSystem(model_path);
    return await tf.loadLayersModel(handler);
}
loadModel('./jsModel/model.json').then(loaded_model => model = loaded_model).then(console.log('==model loaded=='));
loadModel('./jsModel/point_history_classifier/point_history_classifier.json').then(loaded_model => check_moving_model = loaded_model).then(console.log('==check_moving_model loaded=='));

const {app, BrowserWindow, Menu, ipcMain} = electron;
let mainWindow;

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


var batch = new Array(570);
var index = 0;
// catch toMain (landmark infos)
ipcMain.on('toMain', (e, item) => {
    // console.log(item);  // 0,0 normalised landmarks
    // model.summary();
    for(let i=0 ; i<57 ; i++) {  // 21 landmarks fixed (just in case some are hidden)
        batch[index++] = item[i];
        // batch[index++] = item[i].y;
    }

    // for(let i=0 ; i<15 ; i++)  // angle tmp padding
    //     batch[index++] = 0;
    if(index > 569) index = 0;
    
    let input = tf.tensor(batch, [1, 10, 57]);
    // console.log(input.dataSync());
    const preds = model.predict(input);
    tf.print(preds);

    // let input = tf.tensor(arr, [1, 224, 224, 4]);  // reshape
    // input = input.slice([0, 0, 0, 0], [1, 224, 224, 3]);  // 4 channel -> 3 channel

    // const preds = model.predict(input);
    // // console.log(preds.dataSync());  // tf.print(preds);
    // let index = preds.argMax(1).dataSync()[0];
    // let new_command = CLASSES[index];
    // // command ... new_command
    // let prob = preds.dataSync()[index];

    // if(prob > 0.7){
    //     console.log(new_command, prob);
    // }
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