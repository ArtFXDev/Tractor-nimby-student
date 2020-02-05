import { app, ipcMain, Tray, autoUpdater } from 'electron';
import { hostname } from 'os';
import serve from 'electron-serve';
const path = require('path');
import {
  createWindow,
  exitOnChange,
} from './helpers';

const find = require('find-process');
import axios from 'axios';

const isProd = process.env.NODE_ENV === 'production';

let tray = null;
var checkProcessInterval;

var nimbyOn = false;
var processFound = false;
var softIndex = 0;
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
var hnm = undefined;

const server = "hazel-q9yefairz.now.sh";
const feed = `${server}/update/${process.platform}/${app.getVersion()}`;
autoUpdater.setFeedURL(feed);

setInterval(() => {
  autoUpdater.checkForUpdates()
}, 1000 * 60);

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  autoUpdater.quitAndInstall();
});

(async () => {
  await app.whenReady();

  const mainWindow = createWindow('main', {
    width: 300,
    height: 350,
    center: true,
    // skipTaskbar: true,
    frame: false,
    resizable: false,
    closable: false,
    maximizable: false,
  });

  const homeUrl = isProd ? 'app://./home.html' : 'http://localhost:8888/home';
  await mainWindow.loadURL(homeUrl);

  if (!isProd) {
    mainWindow.webContents.openDevTools();
  }

  tray = new Tray(path.join(__dirname, '../main/nimby.png'));
  tray.setToolTip('NIMBY');

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

  axios.get(`http://localhost:9005/blade/status`)
    .then(function (response) {
      // handle success
      console.log(response.data);
      hnm = response.data.hnm;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
      console.log("-------------------- ERROR ----------------------------");
    })

  checkForProcess();
})();

async function checkForProcess() {
  console.log("Check for Processes");
  console.log(softwares[softIndex]);
    find('name', softwares[softIndex], true).then(list => {
      console.log(list);
      if(list.length > 0) {
        processFound = true;
        if(!nimbyOn) {
          nimbyOn = true;
          axios.get(`http://localhost:9005/blade/ctrl?nimby=1`)
            .then(function (response) {
              // handle success
              console.log(response.data);
              if(hnm && tsid) {
                axios.get(`http://tractor/Tractor/queue?q=ejectall&blade=${hnm}&tsid=${tsid}`)
                  .then(function (response) {
                    // handle success
                    console.log(response.data);
                  })
                  .catch(function (error) {
                    // handle error
                    console.log(error);
                    console.log("-------------------- ERROR ----------------------------");
                  })
              }
            })
            .catch(function (error) {
              // handle error
              console.log(error);
              console.log("-------------------- ERROR ----------------------------");
            })
        }
      }

      softIndex += 1;
      if(softIndex == softwares.length) {
        if(!processFound) {
          if(nimbyOn) {
            nimbyOn = false;
            axios.get(`http://localhost:9005/blade/ctrl?nimby=0`)
              .then(function (response) {
                // handle success
                console.log(response.data);
              })
              .catch(function (error) {
                // handle error
                console.log(error);
                console.log("-------------------- ERROR ----------------------------");
              })
              .finally(function () {
                // always executed
              });
          }
        }
        processFound = false;
        softIndex = 0;
      }

      checkForProcess();
    });
};

app.on('window-all-closed', () => {
  app.quit();
});

app.setLoginItemSettings({
  openAtLogin: true,
})
