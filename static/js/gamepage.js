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
    #playerTurn = false
    #log = ''

    playerCard = null
    watchGameStateInterval = null

    constructor() {
        this.loadGame();
    }

    async loadGame() {
        const gameData = await this.getGameData();
        this.setGameState(gameData);
        this.watchGameState();

        this.initListeners();
    }

    watchGameState() {
        var me = this,
            finalTurnBtn = document.getElementById('finalTurnBtn');;
        me.watchGameStateInterval = setInterval(async () => {
            const gameData = await me.getGameData();
            me.setGameState(gameData);
        }, 1000)
    }

    setGameState(gameData) {
        const me = this,
            finalTurnBtn = document.getElementById('finalTurnBtn');
        this.playersCount = gameData.players_count;
        this.step = gameData.step;
        this.level = gameData.level;
        this.ESMBank = gameData.esm_bank;
        this.minBuyESM = gameData.min_buy_esm;
        this.EGPBank = gameData.egp_bank;
        this.maxSellEGP = gameData.max_sell_egp;
        this.log = gameData.game_log.replaceAll();

        const playersData = gameData.players_data;
        const playersCards = document.querySelectorAll('player-card');
        const playerIds = playersData.map((el) => {
            return el.player_id;
        })
        playersCards.forEach((card) => {
            if (!playerIds.includes(Number(card.id))) card.parentNode.removeChild(card);
        });
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
            playerCard.playerTurn = !el.player_turn_finish

            if (window.USERID === el.player_id) {
                me.playerCard = playerCard;


                if (playerCard.playerTurn) {
                    playerCard.setDisabledActions(true);
                    switch (gameData.game_stage) {
                        case 1: //Купить ЕСМ
                            playerCard.enableBuyESM()
                            break;
                        case 2: //Произвести ЕГП
                            playerCard.enableProduceEGP()
                            break;
                        case 3: //Продать ЕГП
                            playerCard.enableSellEGP()
                            break;
                        case 4: //Получить ссуду
                            playerCard.enableGetLoan()
                            break;
                        case 5: //Строительство и обновление
                            playerCard.enableBuildFabrics()
                            break;
                        default:
                            break;
                    }
                } else {
                    playerCard.setDisabledActions(true);
                    // finalTurnBtn.disabled = true;
                }
            }
        });

    }

    correctInputIntValue(input, min, max) {
        if (input.valueAsNumber > max) {
            input.value = max;
        } else if (input.valueAsNumber < min) {
            input.value = min;
        }
        input.value = Math.floor(input.valueAsNumber);
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
            surrenderBtn = document.getElementById('surrenderBtn'),
            finalTurnBtn = document.getElementById('finalTurnBtn');

        playerCard.addEventListener('buyESMBtnClick', (e) => {
            const wnd = createEl('base-window', {
                winTitle: 'Заявка на покупку ЕСМ'
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
                <input id="ESMCountInput" placeholder="Введите количество ЕСМ" type="number" min="0" max="${me.ESMBank}">
                <input id="costInput" placeholder="Введите цену" type="number" min="${me.minBuyESM}" max="${me.playerCard.capital}">
            `
            const bottomTools = wnd.querySelector('footer');

            const sendBtn = createEl('button', {
                innerText: 'Отправить',
                className: 'middle-button',
                onclick: async () => {
                    const ESMCount = winContent.querySelector('#ESMCountInput').valueAsNumber;
                    const cost = winContent.querySelector('#costInput').valueAsNumber;
                    await me.sendBuyESM(wnd, ESMCount, cost);
                }
            })

            bottomTools.append(
                createEl('button', {
                    innerText: 'Назад',
                    className: 'middle-button',
                    onclick: function () {
                        wnd.close();
                    }
                }),
                sendBtn
            )

            const ESMCountInput = winContent.querySelector('#ESMCountInput'),
                costInput = winContent.querySelector('#costInput');

            const inputListenerHandler = () => {
                sendBtn.disabled = ESMCountInput.valueAsNumber > me.ESMBank || (costInput.valueAsNumber * ESMCountInput.valueAsNumber) > me.playerCard.capital;
            }

            ESMCountInput.oninput = inputListenerHandler;
            ESMCountInput.onchange = me.correctInputIntValue.bind(me, ESMCountInput, 0, me.ESMBank)
            costInput.oninput = inputListenerHandler;
            costInput.onchange = () => {
                me.correctInputIntValue(costInput, me.minBuyESM, me.playerCard.capital/ESMCountInput.valueAsNumber)
            };
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
                        <td><input placeholder="Введите количество ЕСМ" type="number" id="simpleFabricProduce" min="0" value="0"></td>
                        <td id="simpleProduceCost"></td>
                    </tr>
                    <tr>
                        <td>Автоматизированная</td>
                        <td><input placeholder="Введите количество ЕСМ" type="number" id="autoFabricProduce" min="0" value="0"></td>
                        <td id="autoProduceCost"></td>
                    </tr>
                </table>
            `

            const simpleFabricProduce = winContent.querySelector('#simpleFabricProduce'),
                autoFabricProduce = winContent.querySelector('#autoFabricProduce'),
                simpleProduceCostTd = winContent.querySelector('#simpleProduceCost'),
                autoProduceCostTd = winContent.querySelector('#autoProduceCost');

            const bottomTools = wnd.querySelector('footer'),
                sendBtn = createEl('button', {
                    innerText: 'Отправить',
                    className: 'middle-button',
                    onclick: async () => {
                        await me.sendProduceBtn(wnd, simpleFabricProduce.valueAsNumber, autoFabricProduce.valueAsNumber);
                    }
                });


            bottomTools.append(
                createEl('button', {
                    innerText: 'Назад',
                    className: 'middle-button',
                    onclick: function () {
                        wnd.close();
                    }
                }),
                sendBtn
            );

            const calcAndValidate = () => {
                const simpleProduceCost = simpleFabricProduce.valueAsNumber * 2000,
                    autoProduceCost = Math.floor(autoFabricProduce.valueAsNumber / 2) * 3000 + (autoFabricProduce.valueAsNumber % 2) * 2000,
                    resultCost = simpleProduceCost + autoProduceCost;

                simpleProduceCostTd.innerText = simpleProduceCost;
                autoProduceCostTd.innerText = autoProduceCost;
                sendBtn.disabled = resultCost > me.playerCard.capital;
            };

            simpleFabricProduce.oninput = () => {
                calcAndValidate();
            };
            simpleFabricProduce.onchange = () => {
                const autoProduceCost = Math.floor(autoFabricProduce.valueAsNumber / 2) * 3000 + (autoFabricProduce.valueAsNumber % 2) * 2000;
                const maxSimpleFabricProduce = Math.min(
                    me.playerCard.simpleFabrics,
                    (me.playerCard.capital - autoProduceCost) / 2000,
                    me.playerCard.ESM
                );
                me.correctInputIntValue(simpleFabricProduce, 0, maxSimpleFabricProduce);
                calcAndValidate();
            }

            autoFabricProduce.oninput = () => {
                calcAndValidate();
            };
            autoFabricProduce.onchange = () => {
                const simpleProduceCost = simpleFabricProduce.valueAsNumber * 2000;
                const capital = me.playerCard.capital - simpleProduceCost;
                const minValueByCapital = capital % 3000 < 2000 ? Math.floor(capital / 3000) : Math.floor(capital / 3000) + 1;
                const maxSimpleFabricProduce = Math.min(
                    me.playerCard.autoFabrics,
                    minValueByCapital,
                    me.playerCard.ESM
                );
                me.correctInputIntValue(autoFabricProduce, 0, maxSimpleFabricProduce);
                calcAndValidate();
            }
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
                <input id="EGPCountInput" placeholder="Введите количество ЕГП" type="number" min="0" max="${me.EGPBank}">
                <input id="costInput" placeholder="Введите цену" type="number" max="${me.maxSellEGP}" min="0">
            `
            const bottomTools = wnd.querySelector('footer');

            const sendBtn = createEl('button', {
                innerText: 'Отправить',
                className: 'middle-button',
                onclick: async () => {
                    const EGPCount = winContent.querySelector('#EGPCountInput').valueAsNumber;
                    const cost = winContent.querySelector('#costInput').valueAsNumber;
                    await me.sendSellEGP(wnd, EGPCount, cost);
                }
            })

            bottomTools.append(
                createEl('button', {
                    innerText: 'Назад',
                    className: 'middle-button',
                    onclick: function () {
                        wnd.close();
                    }
                }),
                sendBtn
            );

            const EGPCountInput = winContent.querySelector('#EGPCountInput'),
                costInput = winContent.querySelector('#costInput');

            const inputListenerHandler = () => {
                sendBtn.disabled = EGPCountInput.valueAsNumber > me.EGPBank;
            }

            EGPCountInput.oninput = inputListenerHandler;
            EGPCountInput.onchange = me.correctInputIntValue.bind(me, EGPCountInput, 0, Math.min(me.EGPBank, me.playerCard.EGP));
            costInput.oninput = inputListenerHandler;
            costInput.onchange = () => {
                me.correctInputIntValue(costInput, 0, me.maxSellEGP)
            };
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
                        <td><input type="number" id="simpleFabricBuildInput" min="0" max="${Math.floor(me.playerCard.capital/10000)}"></td>
                        <td>10000$</td>
                    </tr>
                    <tr>
                        <td>Автоматизированная</td>
                        <td><input type="number" id="autoFabricBuildInput" min="0" max="${Math.floor(me.playerCard.capital/20000)}"></td>
                        <td>20000$</td>
                    </tr>
                </table>
                <div>Количество доступных для автоматизации фабрик: ${me.playerCard.simpleFabrics}</div>
                <hr>
                <input id="fabricCountAutomatizationInput" type="number" placeholder="Введите количество фабрик">
                <div>Стоимость автоматизации: <span id="autoCostSpan"></span></div>
            `
            const bottomTools = wnd.querySelector('footer');

            const simpleFabricBuildInput = winContent.querySelector('#simpleFabricBuildInput'),
                autoFabricBuildInput = winContent.querySelector('#autoFabricBuildInput'),
                fabricCountAutomatizationInput = winContent.querySelector('#fabricCountAutomatizationInput'),
                autoCostSpan = winContent.querySelector('#autoCostSpan');

            const sendBtn = createEl('button', {
                innerText: 'Отправить',
                className: 'middle-button',
                onclick: function () {
                    me.sendBuidAutoRequest(
                        wnd,
                        simpleFabricBuildInput.valueAsNumber,
                        autoFabricBuildInput.valueAsNumber,
                        fabricCountAutomatizationInput.valueAsNumber,
                    )
                }
            });

            bottomTools.append(
                createEl('button', {
                    innerText: 'Назад',
                    className: 'middle-button',
                    onclick: function () {
                        wnd.close();
                    }
                }),
                sendBtn
            );

            const inputListenerHandler = () => {
                const automatizationCost = fabricCountAutomatizationInput.valueAsNumber * 7000,
                    resultCost = (simpleFabricBuildInput.valueAsNumber || 0) * 10000 + (autoFabricBuildInput.valueAsNumber || 0) * 20000 + automatizationCost;
                const allFabricsCount = me.playerCard.haveFabrics + simpleFabricBuildInput.valueAsNumber || 0 + autoFabricBuildInput.valueAsNumber || 0;
                autoCostSpan.innerText = Number.isNaN(automatizationCost) ? '' : automatizationCost + '$';
                sendBtn.disabled = allFabricsCount > 6 || resultCost > me.playerCard.capital;
                if (me.playerCard.haveFabrics > 6) {
                    sendBtn.title = 'Не может быть больше 6 имеющихся и строящихся фабрик';
                } else if (resultCost > me.playerCard.capital) {
                    sendBtn.title = 'Стоимость строительства превышает капитал';
                } else {
                    sendBtn.title = '';
                }
            }

            simpleFabricBuildInput.oninput = inputListenerHandler;
            simpleFabricBuildInput.onchange = onchange = () => {
                me.correctInputIntValue(simpleFabricBuildInput, 0, Math.floor((me.playerCard.capital - ((autoFabricBuildInput.valueAsNumber || 0) * 20000)) / 10000));
            };
            autoFabricBuildInput.oninput = inputListenerHandler;
            autoFabricBuildInput.onchange = () => {
                me.correctInputIntValue(autoFabricBuildInput, 0, Math.floor((me.playerCard.capital - ((simpleFabricBuildInput.valueAsNumber || 0) * 10000)) / 20000));
            };
            fabricCountAutomatizationInput.oninput = inputListenerHandler;
            fabricCountAutomatizationInput.onchange = () => {
                me.correctInputIntValue(fabricCountAutomatizationInput, 0, me.playerCard.haveFabrics);
                inputListenerHandler();
            };
        });

        playerCard.addEventListener('loanRequestBtnClick',(e) => {
            const wnd = createEl('base-window', {
                winTitle: 'Заявка на получение ссуды'
            })
            document.body.appendChild(wnd);
            const winContent = wnd.querySelector('#win-content');
            winContent.innerHTML = `
                <div>Выберите сумму ссуды, которую хотите взять</div>
                <div class="horizontal-container" style="justify-content: flex-start">
                    <label class="big-label"for="loan5000">5000</label>
                    <input class="big-input"id="loan5000" name="loan" type="radio" value="5000" checked>
                    <label class="big-label"for="loan10000">10000</label>
                    <input class="big-input"id="loan10000" name="loan" type="radio" value="10000">
                </div>
            `
            const bottomTools = wnd.querySelector('footer');
            const loan = 5000,
                loan5000 = winContent.querySelector('#loan5000'),
                loan10000 = winContent.querySelector('#loan10000');

            const setLoan = (e) => {
                if (e.target.cheched) {
                    loan = Number(e.target.value);
                }
            }

            loan5000.oninput = setLoan;
            loan10000.oninput = setLoan;
            const sendBtn = createEl('button', {
                innerText: 'Отправить',
                className: 'middle-button',
                onclick: function () {
                    me.sendLoan(wnd, loan);
                }
            })

            bottomTools.append(
                createEl('button', {
                    innerText: 'Назад',
                    className: 'middle-button',
                    onclick: function () {
                        wnd.close();
                    }
                }),
                sendBtn
            );
        });

        surrenderBtn.onclick = async () => {
            await me.surrender();
        }

        finalTurnBtn.onclick = async () => {
            await me.finalTurn()
        }
    }

    async surrender() {
        const response = await fetch('surrender', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                game_id: window.GAME_ID
            })
        });
        const obj = await response.json();
        if (obj.success) {
            window.location.href = window.location.origin;
        }
    }

    async sendBuyESM(wnd, ESMCount, cost) {
        const response = await fetch('buyESM', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                esm_count: ESMCount,
                cost: cost,
                game_id: window.GAME_ID
            })
        });
        const obj = await response.json();
        if (obj.success) {
            wnd.close();
        }
    }

    async sendProduceBtn(wnd, simpleFabricProduce, autoFabricProduce) {
        const response = await fetch('produceEGP', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                simple_fabric_produce: simpleFabricProduce || 0,
                auto_fabric_produce: autoFabricProduce || 0,
                game_id: window.GAME_ID
            })
        });
        const obj = await response.json();
        if (obj.success) {
            wnd.close();
        }
    }

    async sendSellEGP(wnd, EGPCount, cost) {
        const response = await fetch('sellEGP', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                egp_count: EGPCount,
                cost: cost,
                game_id: window.GAME_ID
            })
        });
        const obj = await response.json();
        if (obj.success) {
            wnd.close();
        }
    }

    async sendLoan(wnd, loan) {
        const response = await fetch('loan', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                loan: loan,
                game_id: window.GAME_ID
            })
        });
        const obj = await response.json();
        if (obj.success) {
            wnd.close();
        }
    }

    async sendBuidAutoRequest(wnd, simple_build, auto_build, automatization) {
        const response = await fetch('build_automatization_request', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                simple_build: simple_build,
                auto_build: auto_build,
                automatization: automatization,
                game_id: window.GAME_ID
            })
        });
        const obj = await response.json();
        if (obj.success) {
            wnd.close();
        }
    }

    async finalTurn() {
        const response = await fetch('finalTurn', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                game_id: window.GAME_ID
            })
        });
        const obj = await response.json();
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

    get playerTurn() {
        return this.#playerTurn;
    }
    set playerTurn(val) {
        this.#playerTurn = val;
        document.getElementById('maxSellEGP').innerText = val;
    }

    get log() {
        return this.#log;
    }
    set log(val) {
        this.#log = val;
        document.getElementById('log').innerHTML = val;
    }
}

const game = new Game();