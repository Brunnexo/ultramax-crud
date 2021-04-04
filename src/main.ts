import { app, BrowserWindow, ipcMain as ipc } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

const DB_PATH = `${app.getPath('userData')}\\Ultramax`;

if (!fs.existsSync(DB_PATH)) fs.mkdirSync(DB_PATH);
if (!fs.existsSync(`${DB_PATH}/db.json`)) fs.writeFileSync(`${DB_PATH}/db.json`, '[]', {encoding: 'utf-8'});

var index: BrowserWindow;

app.on('ready', function(event: Electron.Event) {
    index = new BrowserWindow({
        "show": false,
        "frame": false,
        "width": 840,
        "minWidth": 840,
        "minHeight": 640,
        "resizable": true,
        "maximizable": false,
        "transparent": true,
        "skipTaskbar": false,
        "webPreferences": {
            "nodeIntegration": true,
            "enableRemoteModule": true,
            "contextIsolation": false
        }
    });

    index.loadURL(path.resolve(__dirname, 'renderer-processes/index.html'));
    index.on('ready-to-show', function(event: Electron.Event) {
        index.show();
    });
});

app.on('window-all-closed', function(event: Electron.Event) {
    app.exit();
})

interface Data {
    "codigo": number,
    "nome": string,
    "telefone": string
}

ipc.on('insert', function(evt: Electron.IpcMainEvent, args: Data) {
    let tempData: Array<Data> = [];
    try {
        tempData = JSON.parse(fs.readFileSync(`${DB_PATH}/db.json`, 'utf-8'));
    } catch (e) {
        tempData = [];
    }

    if (tempData.some(e => {return e.codigo == args.codigo})) {
        evt.returnValue = {
            status: false,
            message: 'Não é possível cadastrar dois códigos iguais!'
        };
    } else {
        tempData.push({
            codigo: Number(args.codigo),
            nome: args.nome,
            telefone: args.telefone
        });

        tempData = tempData.sort(sortData);

        try {
            fs.writeFileSync(`${DB_PATH}/db.json`, JSON.stringify(tempData, null, '\t'));
            evt.returnValue = {
                status: true,
                message: `${args.nome} foi cadastrado com sucesso!`
            };
        } catch(e) {
            evt.returnValue = {
                status: false,
                message: `Erro desconhecido ao cadastrar!`
            };
        }
    }
});

ipc.on('read', function(evt: Electron.IpcMainEvent, args: any[]) {
    let data = [];
    try {
        data = JSON.parse(fs.readFileSync(`${DB_PATH}/db.json`, 'utf-8'));
    } catch (e) {
        evt.returnValue = [];
    }
    evt.returnValue = data;
})

ipc.on('query', function(evt: Electron.IpcMainEvent, args: string) {
    let data: Array<Data> = [];
    
    try {
        data = JSON.parse(fs.readFileSync(`${DB_PATH}/db.json`, 'utf-8'));
    } catch (e) {
        evt.returnValue = [];
    }

    let result = data.filter(e => {
        return (e.codigo == Number(args)) || (e.nome.split(' ').includes(args)) || (e.telefone == args);
    });

    evt.returnValue = result;
})

ipc.on('update', function(evt: Electron.IpcMainEvent, args: Data) {
    let data: Array<Data> = [];
    try {
        data = JSON.parse(fs.readFileSync(`${DB_PATH}/db.json`, 'utf-8'));
    } catch (e) {
        data = [];
    }

    let tempData = data.filter(e => { return e.codigo != args.codigo});

    tempData.push({
        codigo: Number(args.codigo),
        nome: args.nome,
        telefone: args.telefone
    });
    
    tempData = tempData.sort(sortData);

    try {
        fs.writeFileSync(`${DB_PATH}/db.json`, JSON.stringify(tempData, null, '\t'));

        evt.returnValue = {
            status: true,
            message: `Alteração realizada!`
        };
    } catch (e) {
        evt.returnValue = {
            status: false,
            message: `Erro desconhecido ao alterar!`
        };
    }
});

ipc.on('delete', function(evt: Electron.IpcMainEvent, args: number) {
    let data: Array<Data> = [];
    try {
        data = JSON.parse(fs.readFileSync(`${DB_PATH}/db.json`, 'utf-8'));
    } catch (e) {
        data = [];
    }

    let tempData = data.filter(e => { return e.codigo != args });

    try {
        fs.writeFileSync(`${DB_PATH}/db.json`, JSON.stringify(tempData, null, '\t'));

        evt.returnValue = {
            status: true,
            message: `Remoção realizada!`
        };
    } catch (e) {
        evt.returnValue = {
            status: false,
            message: `Erro desconhecido ao remover!`
        };
    }
});

function sortData(a: any, b: any): number {
    return Number(a.codigo) > Number(b.codigo) ? 1 : -1;
}

ipc.on('console', function(evt: Electron.IpcMainEvent, arg: string) {
    console.log(arg);
});