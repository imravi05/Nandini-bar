import {app, BrowserWindow} from 'electron'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

function createWindow(){
    const win = new BrowserWindow({
        width:1200,
        height :800,
        webPreferences : {
            contextIsolation:true,
        }
    })
    win.loadURL(process.env.FRONTEND_URL);
};

app.whenReady().then(()=>{
    createWindow(); 

});