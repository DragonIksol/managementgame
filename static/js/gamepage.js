import { createEl } from "/static/js/createEl.js"

class Game {
    #game_id = window.GAME_ID
    #playersCount = 0
    #step = 0
    #level = 0
    #ESMBank = 0
    #minBuyESM = 0
    #EGPBank = 0
    #maxSellEGP = 0

    playerCard = null

    constructor() {
        this.loadGame();
    }

    async loadGame() {
        const me = this;
        const playersData = await this.getPlayersData();
        playersData.forEach(el => {
            const playerCard = document.getElementById(el.player_id);
            playerCard.capital = el.capital;
            playerCard.ESM = el.esm;
            playerCard.EGP = el.egp;
            playerCard.autoFabrics = el.auto_fabric_count;
            playerCard.simpleFabrics = el.simple_fabric_count;
            playerCard.loans = el.loan;
            playerCard.seniorPlayer = el.senior_player;
            playerCard.buildFabrics = el.build_fabrics;
            playerCard.playerTurn = el.player_turn

            if (window.USERID === el.player_id) me.playerCard = playerCard;
        });
        const gameData = await this.getGameData();
        this.playersCount = gameData.players_count;
        this.step = gameData.step;
        this.level = gameData.level;
        this.ESMBank = gameData.esm_bank;
        this.minBuyESM = gameData.min_buy_esm;
        this.EGPBank = gameData.egp_bank;
        this.maxSellEGP = gameData.max_sell_egp;

        this.initListeners();
    }

    async getPlayersData() {
        const response = await fetch('players_data?' + new URLSearchParams({
            game_id: window.GAME_ID
        }), {
            method: 'GET'
        });
        const obj = await response.json();
        const data = obj.data;
        console.log(data);
        return data;
    }

    async getGameData() {
        const response = await fetch('game_data?' + new URLSearchParams({
            game_id: window.GAME_ID
        }), {
            method: 'GET'
        });
        const obj = await response.json();
        const data = obj.data;
        console.log(data);
        return data;
    }

    initListeners() {
        const me = this,
            playerCard = me.playerCard,
            surrenderBtn = document.getElementById('surrenderBtn');

        playerCard.addEventListener('buyESMBtnClick', (e) => {
            const wnd = createEl('base-window', {
                winTitle: 'Заявка на ЕСМ'
            })
            document.body.appendChild(wnd);
            const winContent = wnd.querySelector('#win-content');
            winContent.innerHTML = `
                <div>Условия банка</div>
                <table border="1">
                    <tr>
                        <td>Количество ЕСМ</td>
                        <td>Минимальная цена</td>
                    </tr>
                    <tr>
                        <td>${me.ESMBank}</td>
                        <td>${me.minBuyESM}</td>
                    </tr>
                </table>
                <div class="horizontal-container">Заявка</div>
                <div>Введите количество ЕСМ</div>
                <input type="number" min="0" max="${me.ESMBank}">
                <div>Введите цену</div>
                <input type="number" min="${me.minBuyESM}" max="${me.playerCard.capital}">
            `
            const bottomTools = wnd.querySelector('footer');

            bottomTools.append(
                createEl('button', {
                    innerText: 'Назад',
                    onclick: function () {
                        wnd.close();
                    }
                }),
                createEl('button', {
                    innerText: 'Отправить',
                    onclick: function () {
                        console.log('Send');;
                    }
                })
            )
        });
        playerCard.addEventListener('sellEGPBtnClick', (e) => {
            const wnd = createEl('base-window', {
                winTitle: 'Заявка на ЕГП'
            })
            document.body.appendChild(wnd);
            const winContent = wnd.querySelector('#win-content');
            winContent.innerHTML = `
                <div>Условия банка</div>
                <table border="1">
                    <tr>
                        <td>Количество ЕГП</td>
                        <td>Максимальная цена</td>
                    </tr>
                    <tr>
                        <td>${me.EGPBank}</td>
                        <td>${me.maxSellEGP}</td>
                    </tr>
                </table>
                <div class="horizontal-container">Заявка</div>
                <div>Введите количество ЕСМ</div>
                <input type="number" min="0" max="${me.ESMBank}">
                <div>Введите цену</div>
                <input type="number" max="${me.maxSellEGP}" min="0">
            `
            const bottomTools = wnd.querySelector('footer');

            bottomTools.append(
                createEl('button', {
                    innerText: 'Назад',
                    onclick: function () {
                        wnd.close();
                    }
                }),
                createEl('button', {
                    innerText: 'Отправить',
                    onclick: function () {
                        console.log('Send');;
                    }
                })
            )
        });
        playerCard.addEventListener('buildRequestBtnClick',(e) => {
            const wnd = createEl('base-window', {
                winTitle: 'Заявка на строительство фабрик'
            })
            document.body.appendChild(wnd);
            const winContent = wnd.querySelector('#win-content');
            winContent.innerHTML = `
                <div>Условия банка</div>
                <table border="1">
                    <tr>
                        <td>Вид фабрики</td>
                        <td>Количество</td>
                        <td>Стоимость</td>
                    </tr>
                    <tr>
                        <td>Обычная</td>
                        <td><input type="number" id="simpleFabricBuild" min="0" max="${Math.floor(me.playerCard.capital/10000)}"></td>
                        <td>10000$</td>
                    </tr>
                    <tr>
                        <td>Автоматизированная</td>
                        <td><input type="number" id="autoFabricBuild" min="0" max="${Math.floor(me.playerCard.capital/20000)}"></td>
                        <td>20000$</td>
                    </tr>
                </table>
            `
            const bottomTools = wnd.querySelector('footer');

            bottomTools.append(
                createEl('button', {
                    innerText: 'Назад',
                    onclick: function () {
                        wnd.close();
                    }
                }),
                createEl('button', {
                    innerText: 'Отправить',
                    onclick: function () {
                        console.log('Send');;
                    }
                })
            )
        });

        playerCard.addEventListener('produceBtnClick', (e) => {
            const wnd = createEl('base-window', {
                winTitle: 'Заявка на производство ЕГП из ЕСМ'
            })
            document.body.appendChild(wnd);
            const winContent = wnd.querySelector('#win-content');
            winContent.innerHTML = `
                <div>Количество доступных для переработки ЕСМ: ${me.playerCard.ESM}</div>
                <table border="1">
                    <tr>
                        <td>Вид фабрики</td>
                        <td>Количество ЕСМ</td>
                        <td>Расчёт стоимости</td>
                    </tr>
                    <tr>
                        <td>Обычная</td>
                        <td><input type="number" id="simpleFabricProduce" min="0" value="0"></td>
                        <td id="simpleProduceCost"></td>
                    </tr>
                    <tr>
                        <td>Автоматизированная</td>
                        <td><input type="number" id="autoFabricProduce" min="0" value="0"></td>
                        <td id="autoProduceCost"></td>
                    </tr>
                </table>
            `

            const bottomTools = wnd.querySelector('footer'),
                sendBtn = createEl('button', {
                    innerText: 'Отправить',
                    onclick: function () {
                        console.log('Send');;
                    }
                });


            bottomTools.append(
                createEl('button', {
                    innerText: 'Назад',
                    onclick: function () {
                        wnd.close();
                    }
                }),
                sendBtn
            );

            const simpleFabricProduce = winContent.querySelector('#simpleFabricProduce'),
                autoFabricProduce = winContent.querySelector('#autoFabricProduce'),
                simpleProduceCostTd = winContent.querySelector('#simpleProduceCost'),
                autoProduceCostTd = winContent.querySelector('#autoProduceCost');

            const calcAndValidate = () => {
                const simpleProduceCost = simpleFabricProduce.valueAsNumber * 2000,
                    autoProduceCost = Math.floor(autoFabricProduce.valueAsNumber/2) * 3000 + (autoFabricProduce.valueAsNumber % 2) * 2000,
                    resultProduceCost = simpleProduceCost + autoProduceCost;

                simpleProduceCostTd.innerText = simpleProduceCost;
                autoProduceCostTd.innerText = autoProduceCost;
                sendBtn.disabled = resultProduceCost > me.playerCard.capital;
            };

            simpleFabricProduce.oninput = () => {
                calcAndValidate();
            };

            autoFabricProduce.oninput = () => {
                calcAndValidate();
            };
        });
    }

    get playersCount() {
        return this.#playersCount;
    }
    set playersCount(val) {
        this.#playersCount = val;
    }

    get step() {
        return this.#step;
    }
    set step(val) {
        this.#step = val;
    }

    get level() {
        return this.#level;
    }
    set level(val) {
        this.#level = val;
    }

    get ESMBank() {
        return this.#ESMBank;
    }
    set ESMBank(val) {
        this.#ESMBank = val;
        document.getElementById('ESMBank').innerText = val;
    }

    get minBuyESM() {
        return this.#minBuyESM;
    }
    set minBuyESM(val) {
        this.#minBuyESM = val;
        document.getElementById('minBuyESM').innerText = val;
    }

    get EGPBank() {
        return this.#EGPBank;
    }
    set EGPBank(val) {
        this.#EGPBank = val;
        document.getElementById('EGPBank').innerText = val;
    }

    get maxSellEGP() {
        return this.#maxSellEGP;
    }
    set maxSellEGP(val) {
        this.#maxSellEGP = val;
        document.getElementById('maxSellEGP').innerText = val;
    }
}

const game = new Game();