((document) => {
    
    const DOMAIN_SYMBOL = 1;

    let state = [];
    let matrixSize = [];
    tableState = [];

    const createMatrixButton = document.querySelector('.create-matrix-button');

    const mInput = document.querySelector('.mInput');
    const nInput = document.querySelector('.nInput');
    const rInput = document.querySelector('.fill-random');

    const matrix = document.querySelector('.matrix');
    const fillMatrixButton = document.querySelector('.fill-button');

    const searchButton = document.querySelector('.find-domain');

    const table = document.querySelector('.table-body');

    createMatrixButton.addEventListener('click', event => {
            
        const m = mInput.value;
        const n = nInput.value;

        if(m === '' || n === '') {
            return alert('Pleae enter value');
        }

        if(m <= 0 || n <= 0 || m > 41 || n> 41) {
            return alert('M and N from 1 to 40');
        }

        matrixSize[0] = m;
        matrixSize[1] = n;

        generate(m, n);
    });

    fillMatrixButton.addEventListener('click', () => {
        const prob = rInput.value;
        if (prob === '' || prob < 0.01 || prob > 0.99) {
            return alert('Probability from 0.01 to 0.99');
        }
        resetState();
        fillMatrix(matrixSize[0], matrixSize[1], prob);

        const elements = document.querySelectorAll('.matrix-column__element');
        elements.forEach(el => el.style.backgroundColor = 'white');
    });

    searchButton.addEventListener('click', () => {
        let ready = true;

        state.forEach(item => {
            if(item.value === '*'){
                ready = false;
            }
        });

        if(!ready) {
            return alert('Matrix not complite');
        }

        const m = createMatrixArray();
        const domains = searchDomain(m, DOMAIN_SYMBOL);

        const elements = document.querySelectorAll('.matrix-column__element');

        for(let i = 0; i < domains.length; i++) {
            randomColor = '#' + Math.round((Math.random() * (999999 - 100000) + 100000));
            domains[i].coords.forEach(d => {
                elements.forEach(el => {
                    const x = parseInt(el.getAttribute('state-x'), 10);
                    const y = parseInt(el.getAttribute('state-y'), 10);
                    if(x === d.x && y === d.y) {
                        el.style.backgroundColor = randomColor;
                    }
                });
            });
        }

        updateTable(domains.length);
        
    });

    function updateTable(domensCount) {
        const elements = document.querySelectorAll('.matrix-column__element');
        let oneCounter = 0;
        elements.forEach(el => {
            if(el.textContent === '1') {
                oneCounter++;
            }
        });

        if (tableState.length >= 9) {
            tableState.splice(0, 1);
        }

        tableState.push({ 
            prob: oneCounter / state.length,
            domains: domensCount,
            cellsCount: state.length
        });
        
        purgeTable();

        tableState.forEach(row => {
            const tr = document.createElement('tr');
            const tdProb = document.createElement('td');
            const tdDomen = document.createElement('td');
            const tdCells = document.createElement('td');
            tdProb.textContent = row.prob;
            tdDomen.textContent = row.domains;
            tdCells.textContent = row.cellsCount;
            tr.appendChild(tdProb);
            tr.appendChild(tdDomen);
            tr.appendChild(tdCells);
            table.appendChild(tr);
        });
    }

    function purgeTable(){
        while(table.firstChild){
            table.removeChild(table.firstChild);
        }
    }

    function setState(action, data) {
        const { x, y, value } = data;
        switch(action.type){
            case 'ADD_VALUE':
                state = [...state, { x, y, value } ];
                break;
            case 'EDIT_VALUE':
                state = state.map( (cell) => {
                    if (cell.x === parseInt(x, 10) && cell.y === parseInt(y, 10)) {
                        return { x: cell.x, y: cell.y, value };
                    } else {
                        return cell;
                    }
                });
            break;
        }
        //console.log(state);
    }

    function resetState(){
        state.forEach(el => el.value = '*');
    }

    function generate(m, n) {
        purgeMatrix();
        
        for (let i = 0; i < m; i++) {
            const row = document.createElement('div');
            const column = document.createElement('div');

            row.classList.add('matrix-row');
            column.classList.add('matrix-column');

            for(let j = 0; j < n; j++) {
                const item = document.createElement('div');

                item.classList.add('matrix-column__element');
                item.setAttribute('state-x', i);
                item.setAttribute('state-y', j);
                item.textContent = '';
                item.addEventListener('click', itemHandler);

                column.appendChild(item);

                setState({ type: 'ADD_VALUE' }, { x: i, y: j, value: '*' });
            }

            row.appendChild(column);
            matrix.appendChild(row);
        }

        const hidden = document.querySelectorAll('.hidden-element');
        hidden.forEach(el => el.classList.remove('hidden-element'));

    }

    function purgeMatrix(){
        while(matrix.firstChild){
            matrix.removeChild(matrix.firstChild);
        }
        state = [];
    }

    function itemHandler(event) {
        const element = event.target;
        const x = element.getAttribute('state-x');
        const y = element.getAttribute('state-y');

        if (element.textContent === '0'){
            element.textContent = '1';
            setState({ type: 'EDIT_VALUE' }, { x, y, value: 1 });
        } else {
            element.textContent = '0';
            setState({ type: 'EDIT_VALUE' }, { x, y, value: 0 });
        }
    }

    function createMatrixArray() {
        let arr = [];
        for(let i = 0; i < matrixSize[0]; i++) {
            arr.push([]);
            for(let j = 0; j < matrixSize[1]; j++) {
                arr[i].push(2);
            }
        }

        for(let i = 0; i < state.length; i++){;
            arr[state[i].x][state[i].y] = state[i].value;
        }
        return arr;
    }

    /**
     * @param {number} r 0.01 - 0.99
     */
    function expectdedArr(a, b, r) {
        const arr = [];
        const size = state.length;
        let one = Math.round(r * size);
        
        if (one === 0) {
            one = 1;
        }
    
        for (let i = 0; i < size; i++) {
            if(one > 0) {
                arr.push(1);
                one--;
            } else {
                arr.push(0);
            }
        }
    
        return arr;
    }

    function checkMatrix(s) {
        for (let i = 0; i < s.length; i++) {
            if (s[i].value === '*') {
                return false;
            }
        }
        return true;
    }

    function fillMatrix(m, n, r) {
        
        const expArr = expectdedArr(m, n, r);
        const matrixArr = [...state];
        let count = 0;

        while(!checkMatrix(matrixArr)) {

            let random = Math.round(Math.random() * (expArr.length - 1));
            if (matrixArr[random].value === '*'){
                matrixArr[random].value = expArr[count++];
            }
        }

        const elements = document.querySelectorAll('.matrix-column__element');
        elements.forEach( el => {
            const x = parseInt(el.getAttribute('state-x'), 10);
            const y = parseInt(el.getAttribute('state-y'), 10);
            
            for (let i = 0; i < matrixArr.length; i++) {
                if(x === matrixArr[i].x && y === matrixArr[i].y) {
                    el.textContent = matrixArr[i].value;
                }
            }
        });

    }

    function matrixToString(m = []) {
        let matrixString = '';
        for (let i = 0; i < m.length; i++) {
            matrixString += '['
            for(let j = 0; j < m.length; j++) {
                if (j !== m.length - 1)
                    matrixString += matrix[i][j] + ' ';
                else
                    matrixString += matrix[i][j];
            }
            matrixString += '] \n';
        }
        return matrixString;
    }

    function isRecorded(point, domains) {
        let result = false;

        domains.forEach( element => {
            
            if (!result) {
                element.coords.forEach(obj => {
                     if ( obj.x === point.x && obj.y === point.y) {
                        result = true;
                     };
                });     
            }
        });

        return result;
    }

    function isDomain(element, domainSymbol) {
        return element === domainSymbol;
    }

    function checkArrayDomains(point, arr){
        let check = false;
        arr.forEach(item => {
            if(item.x === point.x && item.y === point.y){
                check = true;
            }
        });
        return check;
    }

    function checkAround(point, m, domains, domainSymbol, direction) {

        let arrayInn = [];
        
        if (point.y + 1 < m.length && isDomain(m[point.x][point.y + 1], domainSymbol) && !checkArrayDomains({x: point.x, y: point.y + 1}, arrayInn) && !isRecorded({x: point.x, y: point.y + 1}, domains)) {
            arrayInn.push({x: point.x, y: point.y + 1});
            let rightArr = checkAround({x: point.x, y: point.y + 1}, m, domains, domainSymbol, 'right');
            if (rightArr.length > 0) {
                arrayInn = [...arrayInn, ...rightArr];
            }
        }

        if (point.y - 1 > 0 && direction !== 'right' && isDomain(m[point.x][point.y - 1], domainSymbol) && !checkArrayDomains({x: point.x, y: point.y - 1}, arrayInn) && !isRecorded({x: point.x, y: point.y - 1}, domains)) {
            arrayInn.push({x: point.x, y: point.y - 1});
            let leftArr = checkAround({x: point.x, y: point.y - 1}, m, domains, domainSymbol);
            if (leftArr.length > 0) {
                arrayInn = [...arrayInn, ...leftArr];
            }
        }
    
        if (point.x + 1 < m.length && isDomain(m[point.x + 1][point.y], domainSymbol) && !checkArrayDomains({x: point.x + 1, y: point.y}, arrayInn) && !isRecorded({x: point.x + 1, y: point.y}, domains)) {
            arrayInn.push({x: point.x + 1, y: point.y});
            let downArr = checkAround({x: point.x + 1, y: point.y}, m, domains, domainSymbol);
            if (downArr.length > 0) {
                arrayInn = [...arrayInn, ...downArr];
            }
        }
    
        return arrayInn;
    }
    
    function searchDomain(m, domainSymbol) {
        let domains = [];
        for (let i = 0; i < m.length; i++) {
            for(let j = 0; j < m[i].length; j++) {
                if(isDomain(m[i][j], domainSymbol) && !isRecorded({ x: i, y: j }, domains)) {
                    let coords = [{ x: i, y: j}];
                    
                    let around = checkAround({ x: i, y: j}, m, domains, domainSymbol);
                    
                    coords = [...coords, ...around];
    
                    domains.push({ coords });
                }
            }
        }
        return domains;
    }

})(document);