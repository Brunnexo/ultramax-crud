"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs = require("fs");
const path = require("path");
const DB_PATH = `${electron_1.app.getPath('userData')}\\Ultramax`;
if (!fs.existsSync(DB_PATH))
    fs.mkdirSync(DB_PATH);
if (!fs.existsSync(`${DB_PATH}/db.json`))
    fs.writeFileSync(`${DB_PATH}/db.json`, '[]', { encoding: 'utf-8' });
var index;
electron_1.app.on('ready', function (event) {
    index = new electron_1.BrowserWindow({
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
    index.on('ready-to-show', function (event) {
        index.show();
    });
});
electron_1.app.on('window-all-closed', function (event) {
    electron_1.app.exit();
});
electron_1.ipcMain.on('insert', function (evt, args) {
    let tempData = [];
    try {
        tempData = JSON.parse(fs.readFileSync(`${DB_PATH}/db.json`, 'utf-8'));
    }
    catch (e) {
        tempData = [];
    }
    if (tempData.some(e => { return e.codigo == args.codigo; })) {
        evt.returnValue = {
            status: false,
            message: 'Não é possível cadastrar dois códigos iguais!'
        };
    }
    else {
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
        }
        catch (e) {
            evt.returnValue = {
                status: false,
                message: `Erro desconhecido ao cadastrar!`
            };
        }
    }
});
electron_1.ipcMain.on('read', function (evt, args) {
    let data = [];
    try {
        data = JSON.parse(fs.readFileSync(`${DB_PATH}/db.json`, 'utf-8'));
    }
    catch (e) {
        evt.returnValue = [];
    }
    evt.returnValue = data;
});
electron_1.ipcMain.on('query', function (evt, args) {
    let data = [];
    try {
        data = JSON.parse(fs.readFileSync(`${DB_PATH}/db.json`, 'utf-8'));
    }
    catch (e) {
        evt.returnValue = [];
    }
    let result = data.filter(e => {
        return (e.codigo == Number(args)) || (e.nome.split(' ').includes(args)) || (e.telefone == args);
    });
    evt.returnValue = result;
});
electron_1.ipcMain.on('update', function (evt, args) {
    let data = [];
    try {
        data = JSON.parse(fs.readFileSync(`${DB_PATH}/db.json`, 'utf-8'));
    }
    catch (e) {
        data = [];
    }
    let tempData = data.filter(e => { return e.codigo != args.codigo; });
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
    }
    catch (e) {
        evt.returnValue = {
            status: false,
            message: `Erro desconhecido ao alterar!`
        };
    }
});
electron_1.ipcMain.on('delete', function (evt, args) {
    let data = [];
    try {
        data = JSON.parse(fs.readFileSync(`${DB_PATH}/db.json`, 'utf-8'));
    }
    catch (e) {
        data = [];
    }
    let tempData = data.filter(e => { return e.codigo != args; });
    try {
        fs.writeFileSync(`${DB_PATH}/db.json`, JSON.stringify(tempData, null, '\t'));
        evt.returnValue = {
            status: true,
            message: `Remoção realizada!`
        };
    }
    catch (e) {
        evt.returnValue = {
            status: false,
            message: `Erro desconhecido ao remover!`
        };
    }
});
function sortData(a, b) {
    return Number(a.codigo) > Number(b.codigo) ? 1 : -1;
}
electron_1.ipcMain.on('console', function (evt, arg) {
    console.log(arg);
});
