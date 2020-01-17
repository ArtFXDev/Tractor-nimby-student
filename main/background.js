import { app, ipcMain, Tray } from 'electron';
import serve from 'electron-serve';
import {
  createWindow,
  exitOnChange,
} from './helpers';

const find = require('find-process');
import axios from 'axios';

const isProd = process.env.NODE_ENV === 'production';

let tray = null

const softwares = [
  "3dsmax",
  "Adobe Premiere Pro",
  "AutopanoPro_x64",
  "clarisse",
  "Designer",
  "Dragonframe",
  "Godot_v3.1.1-stable_win64",
  "houdini",
  "houdinifx",
  "Instant Terra",
  "krita",
  "Mari3.2v1",
  "mari4.1v1",
  "Mari4.2v1",
  "Mari4.2v2",
  "MarvelousDesigner7_Enterprise_OnleAuth_x64",
  "maya",
  "Nuke11.3",
  "Photo",
  "Photoshop",
  "Spine",
  "Substance Designer",
  "Substance Painter",
  "SynthEyes64",
  "TVPaint Animation 10 (32bits)",
  "Unity",
  "UE4Editor",
  "ZBrush",
];

if (isProd) {
  serve({ directory: 'app' });
} else {
  exitOnChange();
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

var tsid = undefined;

(async () => {
  await app.whenReady();

  tray = new Tray('./main/nimby.png')
  tray.setToolTip('NIMBY')

  find('name', 'TVPaint Animation 10 (32bits)', true)
  .then(function (list) {
    console.log(list);
  });

  axios.get('http://tractor/Tractor/monitor?q=login&user=root')
  .then(function (response) {
    // handle success
    tsid = response.data.tsid;
    console.log(tsid);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
    console.log("-------------------- ERROR ----------------------------");
  })
  .finally(function () {
    // always executed
  });

  // "http://ENGINE/Tractor/monitor?q=login&user=UUUU"

  // const mainWindow = createWindow('main', {
  //   width: 1000,
  //   height: 600,
  //   center: true,
  //   skipTaskbar: true,
  //   frame: false,
  //   resizable: false,
  //   closable: false,
  //   maximizable: false,
  // });
  //
  // const homeUrl = isProd ? 'app://./home.html' : 'http://localhost:8888/home';
  // await mainWindow.loadURL(homeUrl);
  //
  // if (!isProd) {
  //   mainWindow.webContents.openDevTools();
  // }
})();

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('get-base-url', (event) => {
  event.returnValue = isProd ? 'app://./' : 'http://localhost:8888';
});
