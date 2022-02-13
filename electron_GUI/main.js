const electron = require('electron');
const url = require('url');
const path = require('path');

const tf = require('@tensorflow/tfjs');
const tfn = require('@tensorflow/tfjs-node');  // '@tensorflow/tfjs-node-gpu' if running with GPU.
// import * as utils from './utils/functions.js';

function _calDegree(degree){
    const pi = Math.PI;
    let angle =  degree * (180/pi);
    if (angle < 0)
       angle = angle +360;
    return angle;
}

var calAngleForHand = (land1, land2) => {
    let degree = _calDegree(Math.atan2(land1[2] - land2[2],land1[1] - land2[1]));
    return parseInt(degree);
};

var calAngleForHandLandmark = (land1, land2, land3) => {
    let degree = _calDegree(Math.atan2(land3[2] - land2[2],land3[1]-land2[1]) - Math.atan2(land1[2] - land2[2],land1[1] - land2[1]));
    return parseInt(degree);
};

Math.degrees = function(radians) {
	return radians * 180 / Math.PI;
}

function wrist_angle_calculator(hand_lmlist) {
    let radian = Math.atan2(hand_lmlist[17][2]-hand_lmlist[0][2],hand_lmlist[17][1]-hand_lmlist[0][1])-Math.atan2(hand_lmlist[5][2]-hand_lmlist[0][2],hand_lmlist[5][1]-hand_lmlist[0][1])
    let wrist_angle = 360 - parseInt(Math.degrees(radian));
    if (wrist_angle < 0){
        wrist_angle += 360;
    }
    return wrist_angle
}

function similar_text_res_calculator(hand_lmlist){
    let radian_1 = Math.atan2(hand_lmlist[9][2]-hand_lmlist[12][2],hand_lmlist[9][1]-hand_lmlist[12][1])
    let wrist_angle_1 = parseInt(Math.degrees(radian_1))
    if (wrist_angle_1 < 0){
        wrist_angle_1 += 360;
    }
    let radian_2 = Math.atan2(hand_lmlist[13][2]-hand_lmlist[16][2],hand_lmlist[13][1]-hand_lmlist[16][1])
    let wrist_angle_2 = parseInt(Math.degrees(radian_2))
    if (wrist_angle_2 < 0){
        wrist_angle_2 += 360;
    }
    let similar_text_res = wrist_angle_2 - wrist_angle_1
    return similar_text_res
}

var model;
var model1;
var model2;
var model3;
var model4;
var check_moving_model;
let check_moving_action = ["Stop", "Move", "Move", "Move"];
let actions_m1 = ['ㅁ','ㅂ','ㅍ','ㅇ','ㅇ','ㅎ','ㅏ','ㅐ','ㅑ','ㅒ','ㅣ','ㅓ'];
let actions_m2 = ['ㅇ','ㅎ','ㅗ','ㅚ','ㅛ'];
let actions_m3 = ['ㄱ','ㅈ','ㅊ','ㅋ','ㅅ','ㅜ','ㅟ'];
let actions_m4 = ['ㅎ','ㅓ','ㅔ','ㅕ','ㅖ','ㄴ','ㄷ','ㄹ','ㅡ','ㅢ'];
async function loadModel(model_path){
    const handler = tfn.io.fileSystem(model_path);
    return await tf.loadLayersModel(handler);
}
loadModel('./jsModel/model.json').then(loaded_model => model = loaded_model).then(console.log('==model loaded=='));
loadModel('./jsModel/frame5/model1/model1.json').then(loaded_model => model1 = loaded_model).then(console.log('==model1 loaded=='));
loadModel('./jsModel/frame5/model2/model2.json').then(loaded_model => model2 = loaded_model).then(console.log('==model2 loaded=='));
loadModel('./jsModel/frame5/model3/model3.json').then(loaded_model => model3 = loaded_model).then(console.log('==model3 loaded=='));
loadModel('./jsModel/frame5/model4/model4.json').then(loaded_model => model4 = loaded_model).then(console.log('==model4 loaded=='));
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


var batch = new Array(285);
var index = 0;
// catch toMain (landmark infos)
ipcMain.on('toMain', (e, item) => {
    let hand_lmlist = item[0];
    let d = item[1];
    let hand_angle = calAngleForHand(hand_lmlist[0], hand_lmlist[9]);
    let action = '';
    let select_model = '';
    let thumb_index_angle = calAngleForHandLandmark(hand_lmlist[4], hand_lmlist[2], hand_lmlist[5]);
    
    let wrist_angle = wrist_angle_calculator(hand_lmlist);
    let similar_text_res = similar_text_res_calculator(hand_lmlist);

    for(let i=0 ; i<57 ; i++) {  // 21 landmarks fixed (just in case some are hidden)
        batch[index++] = d[i];
    }
    if(index > 284) index = 0;
    let input = tf.tensor(batch, [1, 5, 57]);

    if (hand_lmlist[5][1] > hand_lmlist[17][1] && hand_lmlist[5][2] < hand_lmlist[0][2] && hand_lmlist[17][2] < hand_lmlist[0][2] && hand_angle < 300) {
        select_model = 'm1';
        const preds = model1.predict(input);
        const i_pred = preds.argMax(-1).arraySync()[0];
        const conf = preds.arraySync()[0][i_pred];
        if (conf > 0.9){ 
            action = actions_m1[i_pred];
            if (action == 'ㅑ'){
                if (hand_lmlist[8][2] > hand_lmlist[7][2] || hand_lmlist[12][2] > hand_lmlist[11][2]) { action = 'ㅁ'; }
            }
        } else {action = '';}
    } 
    else if (hand_lmlist[5][1] < hand_lmlist[17][1] && hand_lmlist[5][2] < hand_lmlist[0][2] && hand_lmlist[17][2] < hand_lmlist[0][2] && hand_angle < 300) {
        select_model = 'm2';
        const preds = model2.predict(input);
        const i_pred = preds.argMax(-1).arraySync()[0];
        const conf = preds.arraySync()[0][i_pred];
        if (conf > 0.9){ 
            action = actions_m2[i_pred];
        } else {action = '';}
    } 
    else if (hand_lmlist[5][1] > hand_lmlist[17][1] && hand_lmlist[0][2] < hand_lmlist[5][2] && hand_lmlist[0][2] < hand_lmlist[17][2]) {
        select_model = 'm3';
        const preds = model3.predict(input);
        const i_pred = preds.argMax(-1).arraySync()[0];
        const conf = preds.arraySync()[0][i_pred];
        if (conf > 0.9){ 
            action = actions_m3[i_pred];
            if (action == 'ㄱ'){
                if (thumb_index_angle > 250){ action = 'ㅜ'; }    
            }else if (action == 'ㅜ'){
                if (35 < thumb_index_angle < 90){ action = 'ㄱ'; }
            }
        } else {action = '';}
        
    } else {
        select_model = 'm4';
        const preds = model4.predict(input);
        const i_pred = preds.argMax(-1).arraySync()[0];
        const conf = preds.arraySync()[0][i_pred];
        if (conf > 0.9){ 
            action = actions_m4[i_pred];
            if (action == 'ㄹ'){
                if (similar_text_res < 0){ action = 'ㅌ'; }
                else if (0 < similar_text_res < 20){ action = 'ㄹ'; }
            }
            if (action == 'ㅓ'){
                if (wrist_angle > 300){ action = 'ㅡ'; }
            }
            if (action == 'ㅕ'){
                if (wrist_angle > 300){ action = 'ㄷ'; }            
            }
        } else {action = '';}
        
    }
    
    if (action != '') {console.log(action);}
    
    // const preds = check_moving_model.predict(input).argMax(-1);
    // preds.array().then(array => console.log(check_moving_action[array[0]]));

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