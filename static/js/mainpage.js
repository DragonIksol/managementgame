import { roomNameRegExp } from '/static/js/fieldsRegExps.js';
import { createEl } from '/static/js/createEl.js';

let backBtn = document.getElementById('back-btn'),
    createRoomBtn = document.getElementById('create-room-btn'),
    searchRoomBtn = document.getElementById('search-room-btn');

let createRoomWnd, searchRoomWnd;

backBtn.onclick = (e) => {
    window.location.href = '/accounts/login/'
}

createRoomBtn.onclick = (e) => {
    createRoomWnd = document.createElement('base-window');
    createRoomWnd.setAttribute('winTitle', 'Создание комнаты');
    document.body.appendChild(createRoomWnd);

    let createRoomContent = createRoomWnd.querySelector('#win-content');
    createRoomContent.innerHTML = `
        <label for="roomName">Введите название комнаты:</label>
        <input id="roomName" title="От 1 до 25 символов: буквы, цифры, _, -">
        <label>Выберете количество игроков:</label>
        <div class="horizontal-container">
            <button class="round-btn count-players">2</button>
            <button class="round-btn count-players">3</button>
            <button class="round-btn count-players">4</button>
        </div>
    `;

    let createRoomBottomTools = createRoomWnd.querySelector('footer');
    createRoomBottomTools.innerHTML = `
        <button id="cancel">Отмена</button>
        <button id="create" disabled>Создать</button>
    `;
    let cancelBtn = createRoomBottomTools.querySelector('#cancel');
    cancelBtn.onclick = (e) => {
        createRoomWnd.close();
    }
    let createBtn = createRoomBottomTools.querySelector('#create');

    let currentCountBtn;
    let countBtns = createRoomContent.querySelectorAll('.count-players');
    let roomName = createRoomWnd.querySelector('#roomName');
    countBtns.forEach((el) => {
        el.onclick = (e) => {
            currentCountBtn && (currentCountBtn.style.borderColor = 'black');
            el.style.borderColor = 'green';
            currentCountBtn = el;

            createBtn.disabled = !(
                roomNameRegExp.test(roomName.value) &&
                currentCountBtn
            )
        }
    })

    roomName.onchange = () => {
        createBtn.disabled = !(
            roomNameRegExp.test(roomName.value) &&
            currentCountBtn
        )
        roomName.style.outline = roomNameRegExp.test(roomName.value) ? "none" : "2px solid red";
    }
    createBtn.onclick = async (e) => {
        let playersCount = Number(currentCountBtn.textContent);
        let startBtn = null;
        roomName = roomName.value;

        try {
            let response = await fetch('createRoom/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    players_count: playersCount,
                    room_name: roomName,
                })
            });
            let obj = await response.json();

            if (obj.error) throw new Error(obj.error);

            createRoomWnd.close();

            let roomId = obj.room_id;

            let roomWnd = document.createElement('base-window');
            roomWnd.setAttribute('winTitle', `Созданная вами комната: ${roomName}\t 1/${playersCount}`);
            document.body.appendChild(roomWnd);

            let roomContent = roomWnd.querySelector('#win-content');

            roomContent.innerHTML = `
                <table border="1">
                <tbody>
                    <tr>
                        <td>№</td>
                        <td>Никнейм участника</td>
                    </tr>
                    <tr>
                        <td>0</td>
                        <td>${window.USERNAME}</td>
                    </tr>
                </tbody>
                </table>
            `;

            let roomTableBody = roomContent.querySelector('tbody');

            let updateTableInterval = setInterval(async () => {
                let response = await fetch('createRoom?' + new URLSearchParams({
                    room_id: roomId
                }), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    }
                });
                let obj = await response.json();
                if (obj.error) throw new Error(obj.error);
                let data = obj.data;
                while (roomTableBody.firstChild) roomTableBody.removeChild(roomTableBody.lastChild);
                roomTableBody.innerHTML = `
                    <tr>
                        <td>№</td>
                        <td>Никнейм участника</td>
                    </tr>
                `;
                roomWnd.setAttribute('winTitle', `Созданная вами комната: ${roomName}\t ${data.length}/${playersCount}`);
                data.forEach((el, index) => {
                    roomTableBody.innerHTML += `
                        <tr player_id=${el.player_id}>
                            <td>${index}</td>
                            <td>${el.player_name}</td>
                        </tr>
                    `
                });
                if (startBtn) {
                    startBtn.disabled = data.length !== playersCount;
                }

            }, 1000);

            let roomBottomTools = roomWnd.querySelector('footer');
            roomBottomTools.innerHTML = `
                <button id="cancel2">Отмена</button>
                <button id="start" disabled>Старт</button>
            `;
            let cancelBtn2 = roomBottomTools.querySelector('#cancel2');
            startBtn = roomBottomTools.querySelector('#start');
            cancelBtn2.onclick = async (e) => {
                roomWnd.close();
            }
            roomWnd.addEventListener('close', async () => {
                let response = await fetch('createRoom/', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify({
                        room_id: roomId,
                        is_creator: true
                    })
                });
                let obj = await response.json();

                if (obj.error) throw new Error(obj.error);
                clearInterval(updateTableInterval)
            });
            startBtn.onclick = async (e) => {
                let response = await fetch('startGame/', {
                    method: 'POST',
                    body: JSON.stringify({
                        room_id: roomId
                    })
                });
                let obj = await response.json();
                if (obj.error) throw new Error(obj.error);
                window.location.href = '/game/';
            };
        } catch (e) {
            console.log(e.stack);
            alert('Не удалось создать комнату');
            return;
        }
    }
}

searchRoomBtn.onclick = (e) => {
    let searchRoomWnd = document.createElement('base-window');
    searchRoomWnd.setAttribute('winTitle', 'Выберите комнату');
    document.body.appendChild(searchRoomWnd);
    let checkedRoom = null;
    let selectBtn;
    let onCheckRoom = (e) => {
        if (e.target.checked) {
            checkedRoom = Number(e.target.value);
            selectBtn.disabled = false;
        }
    };

    let roomContent = searchRoomWnd.querySelector('#win-content');

    roomContent.innerHTML = `
        <table border="1">
        <tbody>
        </tbody>
        </table>
    `;

    let roomTableBody = roomContent.querySelector('tbody');

    let updateTableInterval = setInterval(async () => {
        let response = await fetch('searchRooms/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        });
        let obj = await response.json();
        if (obj.error) throw new Error(obj.error);
        let data = obj.data;

        while (roomTableBody.firstChild) roomTableBody.removeChild(roomTableBody.lastChild);
        roomTableBody.innerHTML = `
            <tr>
                <td>Количество мест</td>
                <td>Название комнаты</td>
                <td></td>
            </tr>
        `;
        data.forEach((el) => {
            let tr = createEl('tr', {
                room_id: el.room_id,
                children: [
                    createEl('td', {
                        textContent: `${el.number_of_seats}/${el.players_count}`
                    }),
                    createEl('td', {
                        textContent: el.room_name
                    }),
                    createEl('td', {
                        children: [
                            (() => {
                                let input = createEl('input', {
                                    type: 'radio',
                                    name: 'room',
                                    value: el.room_id
                                });
                                if (checkedRoom == el.room_id) input.setAttribute('checked', true);
                                input.onchange = onCheckRoom;
                                return input;
                            })()
                        ]
                    })
                ]
            });
            roomTableBody.appendChild(tr);
        });
    }, 1000);
    let clearIntervalWnd = async () => {
        if (checkedRoom) {
            let response = await fetch('createRoom/', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    room_id: checkedRoom,
                    is_creator: false
                })
            });
            let obj = await response.json();

            if (obj.error) throw new Error(obj.error);
        }
        clearInterval(updateTableInterval)
    }
    searchRoomWnd.addEventListener('close', clearIntervalWnd);

    let roomBottomTools = searchRoomWnd.querySelector('footer');

    roomBottomTools.innerHTML = `
        <button id="cancel-search">Отмена</button>
        <button id="select-search" disabled>Выбрать</button>
    `;

    let cancelBtn = roomBottomTools.querySelector('#cancel-search');
    cancelBtn.onclick = async () => {
        searchRoomWnd.close()
    }
    selectBtn = roomBottomTools.querySelector('#select-search');
    selectBtn.onclick = async () => {
        clearInterval(updateTableInterval);
        searchRoomWnd.removeEventListener('close', clearIntervalWnd);
        // let checkedRadio = roomTableBody.querySelector('input[name="room"]:checked');
        let response = await fetch('createRoom/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                room_id: checkedRoom
            })
        });
        let obj = await response.json();
        if (obj.error) throw new Error(obj.error);
        let isDeletedRoom = false;
        let waitGame = setInterval(async () => {
            let response = await fetch('startGame?' + new URLSearchParams({
                room_id: checkedRoom
            }), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                }
            });
            let obj = await response.json();
            if (obj.game_started) {
                window.location.href = '/game/';
            };
            if (obj.room_closed) {
                alert('Комната удалена');
                isDeletedRoom = true;
                searchRoomWnd.close();
            };
        }, 1000);
        searchRoomWnd.addEventListener('close', async () => {
            if (!isDeletedRoom) {
                let response = await fetch('createRoom/', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify({
                        room_id: checkedRoom,
                        is_creator: false
                    })
                });
                let obj = await response.json();

                if (obj.error) throw new Error(obj.error);
            };
            clearInterval(waitGame)
        });
    }

    // let searchRoomContent = searchRoomWnd.querySelector('#win-content');
    // searchRoomContent.innerHTML = `
    //     <span for="roomName">Нет доступных комнат</span>
    // `;
}











/* let roomTable = createEl('table', {
            border: 1,
            children: [
                {
                    type: 'tbody',
                    children: [
                        {
                            type: 'tr',
                            children: [
                                { type: 'td', textContent: '№' },
                                { type: 'td', textContent: 'Никнейм участника'},
                                { type: 'td', textContent: 'Удалить'}
                            ]
                        },
                        {
                            type: 'tr',
                            children: [
                                { type: 'td', textContent: '1' },
                                { type: 'td', textContent: window.USERNAME},
                                { type: 'td', textContent: 'X'}
                            ]
                        }
                    ]
                }
            ]
        })

        roomContent.appendChild(roomTable); */