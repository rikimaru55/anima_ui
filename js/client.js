//Constants and variables
const url = 'ws://localhost:8181'
let connections = [];
const connectionElement = document.getElementById('connections');

//Functions
function openConnection()
{
    let connection = new WebSocket(url)
    connection.onopen = () => {
        handshakeMessage = {
            type: 'handshake'
        };
        connection.send(JSON.stringify(handshakeMessage));
    }
    connection.onmessage = e => {
        console.log(e.data)
        const response = JSON.parse(e.data);
        switch(response.type){
            case 'handshake':
                const playerId = response.playerId;
                const connectionCard = generateConnectionCard(connection, playerId);
                connectionElement.appendChild(connectionCard);
                connections.push({
                        playerId : playerId,
                        connection : connection
                    });
                break;
            case 'notification':
                notifyConnections(response.message);
                break;
        }
    }
}

function notifyConnections(notification){
    const playerCards = document.getElementsByClassName('player-card');
    for (let index = 0; index < playerCards.length; index++) {
        const element = playerCards[index];
        const notificationElem = element.getElementsByClassName('notifications')[0];
        notificationElem.innerText = notification;
        notificationElem.animate({
            opacity: [ 1,0,1],
            backgroundColor: ['#fff','#FFF944','#fff']
        },2000);
        
    }
}

function updateAction(connection, playerId, action){
    const actionMessage = {
        playerId: playerId,
        type: 'actionChange',
        action: action
    };
    connection.send(JSON.stringify(actionMessage));
}

function updateRoom(connection, playerId, room){
    const roomMessage = {
        playerId: playerId,
        type: 'roomChange',
        room: room
    }
    connection.send(JSON.stringify(roomMessage))
}

function closeConnection(connection, playerId)
{
    connections = connections.filter(function(value){
        return value.playerId !== playerId
    });
    connection.close(1000, "requested by user");
    document.getElementById(playerId).remove();
}

function generateConnectionCard(connection, newPlayerId)
{
    const connectionCard = document.createElement('div');
    connectionCard.id = newPlayerId;
    connectionCard.className = 'card player-card';

    const playerId = document.createElement('p');
    playerId.innerText = newPlayerId;

    const notifications = document.createElement('p');
    notifications.className = 'notifications';

    const actions = document.createElement('div');
    const shoutButton = generateActionButton('shout', 'Shout', connection, newPlayerId);
    const wailButton = generateActionButton('wail', 'Wail', connection, newPlayerId);

    actions.appendChild(shoutButton);
    actions.appendChild(wailButton);

    const killConnectionButton = document.createElement('button');
    killConnectionButton.innerText = "Kill Connection";
    killConnectionButton.className = 'button-danger';
    killConnectionButton.onclick = function(){
        closeConnection(connection, newPlayerId);
    }

    connectionCard.appendChild(playerId);
    connectionCard.appendChild(notifications);
    connectionCard.appendChild(actions);
    connectionCard.appendChild(killConnectionButton);

    return connectionCard;
}

function generateActionButton(action, text, connection, playerId){
    const actionButton = document.createElement('button');
    actionButton.className = 'button-primary';
    actionButton.setAttribute('data-action', action);
    actionButton.innerText = text;
    actionButton.onclick = function(){
        updateAction(connection, playerId, this.getAttribute('data-action'))
    }
    return actionButton;
}

function generateRoomButton(room, text, connection, playerId){
    const roomButton = document.createElement('button');
    roomButton.className = 'button-primary-outlined';
    roomButton.setAttribute('data-room', room);
    roomButton.innerText = text;
    roomButton.onclick = function(){
        updateRoom(connection, playerId, this.getAttribute('data-action'))
    }
    return roomButton;
}

//Events
document.getElementById('connectionButton').onclick = function (){openConnection();};
