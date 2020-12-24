customElements.define('base-window',
    class BaseWindow extends HTMLElement {
        constructor() {
            super();
        }
        hide(){
          this.style.display = 'none';
        }
        close(){
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
                }
                .window {
                    width: 50vw;
                    height: 50vh;
                    background-color: rgba(255, 255, 255, 1);
                    border-radius: 20px;
                    padding: 20px
                }
                .window header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .win-content {
                    height: 75%;
                    display: flex;
                    flex-direction: column
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
                            <span>${this.getAttribute('winTitle')}</span>
                            <span
                                id="close-window"
                                style="cursor: pointer; font-size: 16pt;">x</span>
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
            this.querySelector('#close-window').onclick = () => {this.close()}
        }
    }
)