let baseWindowTemplate = document.createElement('template');

customElements.define('base-window',
    class BaseWindow extends HTMLElement {
        constructor() {
            super();
        }
        hide(){
            this.style.display = 'none';
        }
        close() {
            this.dispatchEvent(new Event('close'));
            this.parentNode.removeChild(this);
        }
        connectedCallback() {
            this.innerHTML = `
                <style>
                .modal {
                    position: absolute;
                    top: 0px;
                    left: 0px;
                    width: 100vw;
                    height: 100vh;
                    background-color: rgba(0, 0, 0, 0.2);
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    margin: 0;
                    padding: 0;
                }
                .window {
                    width: 50vw;
                    height: 75vh;
                    font-size: 14pt;
                    background-color: rgba(0, 0, 0, 1);
                    border-radius: 20px;
                    padding: 20px;
                    box-shadow: 0 0 20px rgb(0,255,255);
                }
                .window header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .win-content {
                    height: 75%;
                    display: flex;
                    flex-direction: column;
                    overflow: auto
                }
                .window footer {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                }
                </style>
                <div class="modal">
                    <div class= "window">
                        <header>
                            <div id="base-window-title">${this.getAttribute('winTitle')}</div>
                            <div
                                id="close-window"
                                style="
                                    cursor: pointer;
                                    font-size: 12pt;
                                    background-color: red;
                                    color: white;
                                    width: 20px;
                                    height: 20px;
                                    border-radius: 50%;
                                    text-align: center;
                                    box-shadow: 0 0 10px 5px red;
                                "
                            >x</div>
                        </header>
                        <hr>
                        <div id="win-content" class="win-content">
                            <slot name="content">
                                <div></div>
                            </slot>
                        </div>
                        <hr>
                        <footer>
                            <slot name="bottom-tools">
                                <div></div>
                            </slot>
                        </footer>
                    </div>
                </div>
            `
            this.querySelector('#close-window').onclick = () => { this.close() };
        }

        disconnectedCallback() {
            
        }

        static get observedAttributes() {
            return ['winTitle'];
          }

        attributeChangedCallback(name, oldValue, newValue) {
            switch (name) {
                case 'winTitle':
                    this.querySelector('#base-window-title').innerHTML = newValue;
                    break;
            
                default:
                    break;
            }
          }

        get winTitle() {
            return this.querySelector('#base-window-title');
        }

        set winTitle(val) {
            this.querySelector('#base-window-title').innerHTML = val;
        }
    }
)