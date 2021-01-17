import {createEl} from '/static/js/createEl.js'

const template = document.createElement('template');
template.innerHTML = `
<link rel="stylesheet" href="/static/css/style.css">
<link rel="stylesheet" href="/static/css/game.css">
<style>
* {
    margin: 0;
}
button {
    height: 36px;
}
</style>
<div class="player-card">
    <div class="action-container">
        <button disabled id="buyESMBtn" class="action-btn">Купить ЕСМ</button>
        <button disabled id="produceBtn" class="action-btn">Производство продукции</button>
        <button disabled id="sellEGPBtn" class="action-btn">Продать ЕГП</button>
        <button disabled id="loanRequestBtn" class="action-btn">Заявка на получение ссуды</button>
        <button disabled id="buildRequestBtn" class="action-btn">Заявка на строительство</button>
    </div>
    <div class="horizontal-container">
        <div id="avatar-container" class="avatar-container">
        </div>
        <div class="vertical-content child-left">
            <span>ЕГП: <span id="EGP"></span></span>
            <span>ЕСМ: <span id="ESM"></span></span>
            <span>Капитал: <span id="capital"></span>$</span>
            <span>Взятые ссуды: <span id="loans"></span>$</span>
        </div>
        <div class="vertical-content child-left">
        <span>Имеющиеся фабрики: <span id="haveFabrics"></span></span>
        <span>Автоматизированные фабрики: <span id="autoFabrics"></span></span>
        <span>Обычные фабрики: <span id="simpleFabrics"></span></span>
            <span>Строящиеся фабрики: <span id="buildFabrics"></span></span>
        </div>
    </div>
    <div class="horizontal-container">
        <table hidden border="1" style="flex:9">
            <tr>
                <th>Вид единицы</th>
                <th>Количество</th>
                <th>Цена</th>
                <th>Итого</th>
            </tr>
            <tr>
                <td>Купленные единицы</td>
                <td id="boughtCount"></td>
                <td id="boughtCost"></td>
                <td id="boughtResult"></td>
            </tr>
            <tr>
                <td>Проданные единицы</td>
                <td id="soldCount"></td>
                <td id="soldCost"></td>
                <td id="soldResult"></td>
            </tr>
        </table>
        <span id="player_turn_span">Игрок совершает ход</span>
    </div>
</div>`

customElements.define('player-card',
    class PlayerCard extends HTMLElement {

        // #cash = null
        #EGP = 0
        #ESM = 0
        #haveFabrics = 0
        #autoFabrics = 0
        #simpleFabrics = 0
        #capital = 0
        #loans = 0
        #buildFabrics = 0
        #boughtCount = 0
        #boughtCost = 0
        #boughtResult = 0
        #soldCount = 0
        #soldCost = 0
        #soldResult = 0
        #seniorPlayer = false
        #playerTurn = false

        constructor() {
            super();
            const me = this;
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.appendChild(template.content.cloneNode(true));
            const avatarContainer = this.shadowRoot.getElementById('avatar-container');
            avatarContainer.appendChild(createEl('img', {
                src: me.getAttribute('avatarPath'),
                alt: ' ',
                className: 'avatar-icon'
            }));
            avatarContainer.appendChild(createEl('br'));
            avatarContainer.appendChild(createEl('b', {
                innerText: me.getAttribute('playerName')
            }));
            if (Number(window.USERID) === Number(me.getAttribute('id'))) {
                this.shadowRoot.querySelector('.player-card').style.boxShadow = '0 0 20px rgb(75, 255, 75)';
                this.shadowRoot.querySelector('.action-container').style.visibility = 'visible';
                me.initButtonsEvents();
            } else {
                this.shadowRoot.querySelector('.player-card').style.boxShadow = '0 0 20px rgb(255, 0, 0)';
            }

        }
        connectedCallback() {

        }
        disconnectedCallback() {

        }

        initButtonsEvents() {
            const me = this,
                buyESMBtn = this.shadowRoot.getElementById('buyESMBtn'),
                sellEGPBtn = this.shadowRoot.getElementById('sellEGPBtn'),
                produceBtn = this.shadowRoot.getElementById('produceBtn'),
                buildRequestBtn = this.shadowRoot.getElementById('buildRequestBtn'),
                // automatizationRequestBtn = this.shadowRoot.getElementById('automatizationRequestBtn'),
                loanRequestBtn = this.shadowRoot.getElementById('loanRequestBtn');

            buyESMBtn.onclick = () => {
                this.dispatchEvent(new CustomEvent('buyESMBtnClick'));
            };
            sellEGPBtn.onclick = () => {
                this.dispatchEvent(new CustomEvent('sellEGPBtnClick'));
            };
            produceBtn.onclick = () => {
                this.dispatchEvent(new CustomEvent('produceBtnClick'));
            };
            buildRequestBtn.onclick = () => {
                this.dispatchEvent(new CustomEvent('buildRequestBtnClick'));
            };
            // automatizationRequestBtn.onclick = () => {
            //     this.dispatchEvent(new CustomEvent('automatizationRequestBtnClick'));
            // };
            loanRequestBtn.onclick = () => {
                this.dispatchEvent(new CustomEvent('loanRequestBtnClick'));
            };
        }

        setDisabledActions(val) {
            this.shadowRoot.querySelector('.action-container').childNodes.forEach((el) => {
                if (el instanceof HTMLButtonElement) {
                    el.disabled = val;
                }
            })
        }

        enableBuyESM() {
            this.shadowRoot.querySelector('#buyESMBtn').disabled = false;
        }

        enableProduceEGP() {
            this.shadowRoot.querySelector('#produceBtn').disabled = false;
        }

        enableSellEGP() {
            this.shadowRoot.querySelector('#sellEGPBtn').disabled = false;
        }

        enableGetLoan() {
            this.shadowRoot.querySelector('#loanRequestBtn').disabled = false;
        }

        enableBuildFabrics() {
            this.shadowRoot.querySelector('#buildRequestBtn').disabled = false;
        }


        get EGP() {
            return this.#EGP;
        }
        set EGP(val) {
            this.#EGP = val;
            this.shadowRoot.getElementById('EGP').innerText = val;
        }

        get ESM() {
            return this.#ESM;
        }
        set ESM(val) {
            this.#ESM = val;
            this.shadowRoot.getElementById('ESM').innerText = val;
        }

        get haveFabrics() {
            return this.#haveFabrics;
        }
        set haveFabrics(val) {
            this.#haveFabrics = val;
            this.shadowRoot.getElementById('haveFabrics').innerText = val;
        }

        get autoFabrics() {
            return this.#autoFabrics;
        }
        set autoFabrics(val) {
            this.#autoFabrics = val;
            this.haveFabrics = val + this.simpleFabrics;
            this.shadowRoot.getElementById('autoFabrics').innerText = val;
        }

        get simpleFabrics() {
            return this.#simpleFabrics;
        }
        set simpleFabrics(val) {
            this.#simpleFabrics = val;
            this.shadowRoot.getElementById('simpleFabrics').innerText = val;
            this.haveFabrics = val + this.autoFabrics;
        }

        get capital() {
            return this.#capital;
        }
        set capital(val) {
            this.#capital = val;
            this.shadowRoot.getElementById('capital').innerText = val;
            this.haveFabrics = val + this.simpleFabrics;
        }

        get loans() {
            return this.#loans;
        }
        set loans(val) {
            this.#loans = val;
            this.shadowRoot.getElementById('loans').innerText = val || 0;
        }

        get buildFabrics() {
            return this.#buildFabrics
        }
        set buildFabrics(val) {
            this.#buildFabrics = val;
            this.shadowRoot.getElementById('buildFabrics').innerText = val;
        }

        get boughtCount() {
            return this.#boughtCount
        }
        set boughtCount(val) {
            this.#boughtCount = val;
            this.shadowRoot.getElementById('boughtCount').innerText = val;
        }

        get boughtCost() {
            return this.#boughtCost;
        }
        set boughtCost(val) {
            this.#boughtCost = val;
            this.shadowRoot.getElementById('boughtCost').innerText = val;
        }

        get boughtResult() {
            return this.#boughtResult
        }
        set boughtResult(val) {
            this.#boughtResult = val;
            this.shadowRoot.getElementById('boughtResult').innerText = val;
        }

        get soldCount() {
            return this.#soldCount;
        }
        set soldCount(val) {
            this.#soldCount = val;
            this.shadowRoot.getElementById('soldCount').innerText = val;
        }

        get soldCost() {
            return this.#soldCost;
        }
        set soldCost(val) {
            this.#soldCost = val;
            this.shadowRoot.getElementById('soldCost').innerText = val;
        }

        get soldResult() {
            return this.#soldResult;
        }
        set soldResult(val) {
            this.#soldResult = val;
            this.shadowRoot.getElementById('soldResult').innerText = val;
        }

        get seniorPlayer() {
            return this.#seniorPlayer;
        }
        set seniorPlayer(val) {
            this.#seniorPlayer = val;
            this.shadowRoot.querySelector('img').style.boxShadow = val ? '0 0 20px 0.7vh gold' : 'none';
        }

        get playerTurn() {
            return this.#playerTurn;
        }
        set playerTurn(val) {
            this.#playerTurn = val;
            this.shadowRoot.getElementById('player_turn_span').style.visibility = val ? 'visible' : 'hidden';
        }
})