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
            roomWnd.setAttribute('winTitle', `Созданная вами комната: ${roomName}\t 1/${playersNumber}`);
            document.body.appendChild(roomWnd);

            let roomContent = roomWnd.querySelector('#win-content');

            roomContent.innerHTML = `
                <table border="1">
                <tbody>
                    <tr>
                        <td>№</td>
                        <td>Никнейм участника</td>
                        <td>Удалить</td>
                    </tr>
                    <tr>
                        <td>1</td>
                        <td>${window.USERNAME}</td>
                        <td>X</td>
                    </tr>
                </tbody>
                </table>
            `;

            let roomBottomTools = roomWnd.querySelector('footer');
            roomBottomTools.innerHTML = `
                <button id="cancel2">Отмена</button>
                <button id="create" disabled>Старт</button>
            `;
            let cancelBtn2 = roomBottomTools.querySelector('#cancel2');
            cancelBtn2.onclick = (e) => {

                let response = await fetch('createRoom/', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify({
                        room_id: roomId,
                    })
                });
                let obj = await response.json();

                if (obj.error) throw new Error(obj.error);

                roomWnd.close();
            }
        } catch (e) {
            console.log(e.stack);
            alert('Не удалось создать комнату');
            return;
        }
    }
}

searchRoomBtn.onclick = (e) => {
    searchRoomWnd = document.createElement('base-window');
    searchRoomWnd.setAttribute('winTitle', 'Поиск комнаты');
    document.body.appendChild(searchRoomWnd);

    let searchRoomContent = searchRoomWnd.querySelector('#win-content');
    searchRoomContent.innerHTML = `
        <span for="roomName">Нет доступных комнат</span>
    `;
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