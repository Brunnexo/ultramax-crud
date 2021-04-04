## Instalação

Necessário [Node.js](https://nodejs.org/en/) e [Yarn](https://yarnpkg.com/) para funcionar

```bash
npm install -g yarn
```

## Criação do instalador

```bash
yarn dist
```

Após o comando, será criado um instalador na pasta **dist** do projeto.

Instale-o usando **Ultramax Setup 1.0.0** ou execute através do **win-unpacked/Ultramax.exe**

### Informações adicionais

1. O programa executa **Electron.js** como base
2. Os dados são armazenados na pasta:

```bash
%appdata%\crud-ultramax\Ultramax\db.json