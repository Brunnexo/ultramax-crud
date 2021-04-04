const { remote, ipcRenderer } = require('electron');
const path = require('path');

const { PageLoader } = require(path.resolve(__dirname, '../plugins/PageLoader'));
const HTML = new PageLoader();

var searchQuery;

window.onload = function (ev) {
    document.getElementById('btn-close').onclick = function(ev) {
        remote.getCurrentWindow().close();
    }
    Page.summary();

    let btnSearch = document.getElementById('btn-search'),
        inputSearch = document.getElementById('input-search');

    btnSearch.onclick = function(ev) {
        searchQuery = inputSearch.value;
        if (searchQuery) Page.query();
    }

    inputSearch.onkeydown = function(ev) {
        if (ev.key === 'Enter') btnSearch.onclick(null);
    }
}

const Page = {
    summary: function () {
        HTML.loadScript('summary', function () {
            let h = new Date().getUTCHours() - 3;
            document.getElementById('greetings').innerHTML = (h <= 12 ? "Bom dia!" : h <= 18 ? "Boa tarde!" : "Boa noite!");

            let label = document.getElementById('label');

            let container = document.getElementById('summary-table');

            let btnShow = document.getElementById('btn-show-all');

            function showLast(ev) {
                label.innerHTML = 'Últimos 5 registros';

                container.innerHTML = '';


                let data = ipcRenderer.sendSync('read').slice(-5);

                if (data.length != 0) {
                    let table = document.createElement('table');
                    table.classList.add('table');
                    table.innerHTML = `
                    <thead>
                        <tr>
                        <th scope="col">Código</th>
                        <th scope="col">Nome</th>
                        <th scope="col">Telefone</th>
                        </tr>
                    </thead>`;
                    let tbody = document.createElement('tbody');
                    data.forEach((d) => {
                        let tr = document.createElement('tr');
                        tr.innerHTML = `
                        <th scope="row">${d['codigo']}</th>
                        <td>${d['nome']}</td>
                        <td>${d['telefone']}</td>`;
                        tbody.appendChild(tr);
                    });
                    table.appendChild(tbody);
                    container.appendChild(table);
                } else {
                    container.innerHTML = `
                    <h1 class="display-3">Não há cadastros ainda!</h1>`;
                }

                btnShow.onclick = showAll;
                btnShow.innerHTML = 'Exibir todos'
            }

            function showAll(ev) {
                label.innerHTML = 'Todos os registros';

                container.innerHTML = '';

                let data = ipcRenderer.sendSync('read');

                if (data.length != 0) {
                    let table = document.createElement('table');
                    table.classList.add('table');
                    table.innerHTML = `
                    <thead>
                        <tr>
                        <th scope="col">Código</th>
                        <th scope="col">Nome</th>
                        <th scope="col">Telefone</th>
                        </tr>
                    </thead>`;
                    let tbody = document.createElement('tbody');
                    data.forEach((d) => {
                        let tr = document.createElement('tr');
                        tr.innerHTML = `
                        <th scope="row">${d['codigo']}</th>
                        <td>${d['nome']}</td>
                        <td>${d['telefone']}</td>`;
                        tbody.appendChild(tr);
                    });
                    table.appendChild(tbody);
                    container.appendChild(table);
                } else {
                    container.innerHTML = `
                    <h1 class="display-3">Não há cadastros ainda!</h1>`;
                }

                btnShow.onclick = showLast;
                btnShow.innerHTML = 'Exibir últimos 5'
            }

            showLast(null);
        });

        HTML.load('summary');
    },
    register: function () {
        HTML.loadScript('register', function () {
            let inputCode = document.getElementById('input-code'),
                inputName = document.getElementById('input-name'),
                inputTelephone = document.getElementById('input-telephone');

            let regCode = document.getElementById('reg-code'),
                regName = document.getElementById('reg-name'),
                regTel = document.getElementById('reg-tel');

            let btnRegister = document.getElementById('btn-register');

            inputCode.onblur =
            inputName.onblur =
            inputTelephone.onblur =
            validate;

            function validate(ev) {
                let target = document.getElementById(ev.currentTarget.id);
                let type = target.getAttribute('type');

                const validations = {
                    tel: val => {
                        let validLength = (val.length >= 8 && val.length <= 11);
                        let isNumber = !isNaN(Number(val));

                        return (validLength && isNumber);
                    },
                    number: val => {
                        return !isNaN(Number(val)) & val.length > 0;
                    },
                    text: val => {
                        return val.length > 0;
                    }
                }

                if (validations[type](target.value)) {
                    if (target.hasAttribute('for')) document.getElementById(target.getAttribute('for')).innerHTML = target.value;
                    target.classList.add('is-valid');
                    target.classList.remove('is-invalid');
                } else {
                    if (target.hasAttribute('for')) document.getElementById(target.getAttribute('for')).innerHTML = '';
                    target.classList.add('is-invalid');
                    target.classList.remove('is-valid');
                }
                regName.innerHTML = inputName.value;
            }

            document.getElementById('btn-clear').onclick = function (ev) {
                inputCode.value = '';
                inputName.value = '';
                inputTelephone.value = '';

                regTel.innerHTML = '';
                regName.innerHTML = '';
                regCode.innerHTML = '';

                document.querySelectorAll('.is-valid, .is-invalid').forEach(e => {
                    e.classList.remove('is-valid');
                    e.classList.remove('is-invalid');
                });
            }

            btnRegister.onclick = function (ev) {
                let validations = document.querySelectorAll('.is-valid').length;
                let invalidations = document.querySelectorAll('.is-invalid').length;

                if (!validations && !invalidations) {
                    remote.dialog.showMessageBoxSync({
                        title: 'Aviso',
                        message: `Preencha os campos primeiro!`,
                        type: 'warning'
                    });
                } else if (invalidations > 0 && validations > 0) {
                    remote.dialog.showMessageBoxSync({
                        title: 'Erro',
                        message: `Há campos não preenchidos!`,
                        type: 'error'
                    });
                } else if (invalidations > 0) {
                    remote.dialog.showMessageBoxSync({
                        title: 'Erro',
                        message: `Há campos com valores inválidos!`,
                        type: 'error'
                    });
                } else if (validations == 3) {
                    let confirmation = remote.dialog.showMessageBoxSync({
                        title: 'Confirmação',
                        defaultId: 1,
                        message: `Confirmar cadastro?`,
                        type: 'question',
                        buttons: ['Não', 'Sim']
                    });

                    console.log(confirmation);

                    if (confirmation == 1) {
                        let req = ipcRenderer.sendSync('insert', {
                            codigo: inputCode.value,
                            nome: inputName.value,
                            telefone: inputTelephone.value
                        });

                        remote.dialog.showMessageBoxSync({
                            title: req.status ? 'Sucesso' : 'Erro',
                            message: req.message,
                            type: req.status ? 'info' : 'error'
                        });

                        if (req.status) Page.summary();
                    }

                }
            }
        });

        HTML.load('register')
    },
    alter: function () {
        HTML.loadScript('alter', function () {
            let inputCode = document.getElementById('input-code'),
                inputName = document.getElementById('input-name'),
                inputTelephone = document.getElementById('input-telephone');

            let btnChange = document.getElementById('btn-change');
            let btnDelete = document.getElementById('btn-delete');

            inputName.onblur =
            inputTelephone.onblur =
            validate;

            function validate(ev) {
                let target = document.getElementById(ev.currentTarget.id);
                let type = target.getAttribute('type');

                const validations = {
                    tel: val => {
                        let validLength = (val.length >= 8 && val.length <= 11);
                        let isNumber = !isNaN(Number(val));

                        return (validLength && isNumber);
                    },
                    number: val => {
                        return !isNaN(Number(val)) & val.length > 0;
                    },
                    text: val => {
                        return val.length > 0;
                    }
                }

                if (validations[type](target.value)) {
                    target.classList.add('is-valid');
                    target.classList.remove('is-invalid');
                } else {
                    target.classList.add('is-invalid');
                    target.classList.remove('is-valid');
                }
            }
            
            let selData = document.getElementById('sel-data');
            let data = ipcRenderer.sendSync('read');

            data.forEach(e => {
                let option = document.createElement('option');
                option.setAttribute('name', e['nome']);
                option.setAttribute('code', e['codigo']);
                option.setAttribute('telephone', e['telefone'])
                option.innerHTML = `${e['codigo']} - ${e['nome']}`;
                selData.appendChild(option);
            });

            selData.onchange = function(ev) {
                inputCode.value = selData.options[selData.selectedIndex].getAttribute('code');
                inputName.value = selData.options[selData.selectedIndex].getAttribute('name');
                inputTelephone.value = selData.options[selData.selectedIndex].getAttribute('telephone');
            }

            selData.onchange(null);

            btnChange.onclick = function (ev) {
                let invalidations = document.querySelectorAll('.is-invalid').length;

                if (invalidations > 0) {
                    remote.dialog.showMessageBoxSync({
                        title: 'Erro',
                        message: `Há campos com valores inválidos!`,
                        type: 'error'
                    });
                } else if (invalidations == 0) {
                    let confirmation = remote.dialog.showMessageBoxSync({
                        title: 'Confirmação',
                        defaultId: 1,
                        message: `Confirmar alterações?`,
                        type: 'question',
                        buttons: ['Não', 'Sim']
                    });

                    if (confirmation == 1) {
                        let req = ipcRenderer.sendSync('update', {
                            codigo: inputCode.value,
                            nome: inputName.value,
                            telefone: inputTelephone.value
                        });

                        remote.dialog.showMessageBoxSync({
                            title: req.status ? 'Sucesso' : 'Erro',
                            message: req.message,
                            type: req.status ? 'info' : 'error'
                        });

                        if (req.status) HTML.update();
                    }

                }
            }

            btnDelete.onclick = function (ev) {
                let confirmation = remote.dialog.showMessageBoxSync({
                    title: 'Confirmação',
                    defaultId: 1,
                    message: `Confirmar remoção de ${selData.options[selData.selectedIndex].getAttribute('name')}?`,
                    detail: 'Esta operação não poderá ser desfeita!',
                    type: 'question',
                    buttons: ['Não', 'Sim']
                });

                if (confirmation == 1) {
                    let req = ipcRenderer.sendSync('delete', selData.options[selData.selectedIndex].getAttribute('code'));

                    remote.dialog.showMessageBoxSync({
                        title: req.status ? 'Sucesso' : 'Erro',
                        message: req.message,
                        type: req.status ? 'info' : 'error'
                    });

                    if (req.status) HTML.update();
                }
            } 
        });

        HTML.load('alter');
    },
    query: function() {
        HTML.loadScript('query', function() {
            let label = document.getElementById('label-query');
            label.innerHTML = `"${searchQuery}"`;

            let result = ipcRenderer.sendSync('query', searchQuery);
            let container = document.getElementById('result-container');

            container.innerHTML = '';

            if (!result.length) {
                container.innerHTML = `
                <div class="text-center">
                    <h1 class="display-3">Não houve resultados</h1>
                    <h5>Verifique o termo de busca</h5>
                </div>
                `;
            } else {
                let table = document.createElement('table');
                table.classList.add('table');
                table.innerHTML = `
                <thead>
                    <tr>
                    <th scope="col">Código</th>
                    <th scope="col">Nome</th>
                    <th scope="col">Telefone</th>
                    </tr>
                </thead>`;
                let tbody = document.createElement('tbody');
                result.forEach((d) => {
                    let tr = document.createElement('tr');
                    tr.innerHTML = `
                    <th scope="row">${d['codigo']}</th>
                    <td>${d['nome']}</td>
                    <td>${d['telefone']}</td>`;
                    tbody.appendChild(tr);
                });
                table.appendChild(tbody);
                container.appendChild(table);
            }

            document.getElementById('input-search').value = '';
            searchQuery = '';
        });

        HTML.load('query');
    }
}