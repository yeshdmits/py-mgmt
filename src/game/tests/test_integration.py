import pytest
from flask import Flask
from flask_socketio import SocketIO, send
from main import GameNamespace


def create_app():
    app = Flask(__name__)
    socketio = SocketIO(app)
    socketio.on_namespace(GameNamespace('/game'))
    return app, socketio


@pytest.fixture
def client1():
    app, socketio = create_app()
    client1 = socketio.test_client(app, namespace="/game")
    yield client1

@pytest.fixture
def client2():
    app, socketio = create_app()
    client2 = socketio.test_client(app, namespace="/game")
    yield client2


def createGame_loadGame(client1, client2):
    # create game with [client1]
    client1.emit('create_game', namespace="/game")
    received = client1.get_received(namespace="/game")
    assert len(received) == 1
    assert received[0]['name'] == 'created'

    # get game id context
    game_id = received[0]['args'][0]

    # connect players
    client2.emit('load_game', game_id, namespace="/game")
    client1.emit('load_game', game_id, namespace="/game")
    client2.emit('load_game', game_id, namespace="/game")

    receivedClient1 = client1.get_received(namespace="/game")
    receivedClient2 = client2.get_received(namespace="/game")
    # asserts client2
    assert len(receivedClient2) == 1
    assert receivedClient2[0]['name'] == 'bothConnected'
    assert 'args' in receivedClient2[0]
    assert len(receivedClient2[0]['args']) == 1
    assert game_id == receivedClient2[0]['args'][0]['id']
    assert receivedClient2[0]['args'][0]['step'] == 1
    assert receivedClient2[0]['args'][0]['nextMove'] == None
    assert receivedClient2[0]['args'][0]['status'] == 'In Progress'
    assert receivedClient2[0]['args'][0]['winner'] == 0
    assert receivedClient2[0]['args'][0]['player']['move'] == True


    assert len(receivedClient1) == 1
    assert receivedClient1[0]['name'] == 'bothConnected'
    assert 'args' in receivedClient1[0]
    assert len(receivedClient1[0]['args']) == 1
    assert game_id == receivedClient1[0]['args'][0]['id']
    assert receivedClient1[0]['args'][0]['step'] == 1
    assert receivedClient1[0]['args'][0]['nextMove'] == None
    assert receivedClient1[0]['args'][0]['status'] == 'In Progress'
    assert receivedClient1[0]['args'][0]['winner'] == 0
    assert receivedClient1[0]['args'][0]['player']['move'] == False

    return game_id

def move_player_and_return(client1, data, gameId):
    client1.emit('move', {
        "gameId": gameId, 
        "move": {"row": data[0], "column": data[1], "innerRow": data[2], "innerColumn": data[3]}
    }, namespace="/game")
    received = client1.get_received(namespace="/game")
    assert received[0]['name'] == 'playerMoved'
    assert received[0]['args'][0]
    return received[0]['args'][0]

def move_player(client, data, step, gameId):
    client.emit('move', {
        "gameId": gameId, 
        "move": {"row": data[0], "column": data[1], "innerRow": data[2], "innerColumn": data[3]}
    }, namespace="/game")
    received = client.get_received(namespace="/game")
    assert received[0]['name'] == 'playerMoved'
    assert received[0]['args'][0]
    gameData = received[0]['args'][0]
    assert gameData['state'][data[0]][data[1]][data[2]][data[3]] == step
    assert gameData['nextMove'] == {'row':data[2], 'column': data[3]}
    assert gameData['step'] != step and not gameData['player']['move']
    assert gameData['status'] == 'In Progress'


def test_create_load_proceed_game(client1, client2):
    gameId = createGame_loadGame(client1, client2)
    # 1st move player1 X
    move_player(client2, [0,0,0,0], 1, gameId)

    # 2nd move player2 O
    move_player(client1, [0,0,1,0], -1, gameId)

    # 3rd move player1 (wrong cell)
    move_3_state_wrong = [0,1,1,0]
    client2.emit('move', {
        "gameId": gameId, 
        "move": {"row": move_3_state_wrong[0], "column": move_3_state_wrong[1], "innerRow": move_3_state_wrong[2], "innerColumn": move_3_state_wrong[3]}
    }, namespace="/game")
    received = client2.get_received(namespace="/game")
    assert len(received) == 0

    # wrong player
    move_3_state = [1,0,1,0]
    client1.emit('move', {
        "gameId": gameId, 
        "move": {"row": move_3_state[0], "column": move_3_state[1], "innerRow": move_3_state[2], "innerColumn": move_3_state[3]}
    }, namespace="/game")
    received = client1.get_received(namespace="/game")
    assert len(received) == 0

    # 3rd move player1 X
    move_player(client2, [1,0,1,0], 1, gameId)

    # 4th move player2 O
    move_player(client1, [1,0,1,1], -1, gameId)

    # 5th move player1 X
    move_player(client2, [1,1,0,0], 1, gameId)

    # 6th move player2 O
    move_player(client1, [0,0,1,1], -1, gameId)

    # 7th move player1 X
    move_player(client2, [1,1,1,0], 1, gameId)

    # 8th move player2 O
    move_player(client1, [1,0,0,1], -1, gameId)

    # 9th move player1 X
    move_player(client2, [0,1,0,0], 1, gameId)

    # 10th move player2 O (first big cell)
    first_big_cell_state = [0,0,1,2]
    gameData = move_player_and_return(client1, first_big_cell_state, gameId)
    
    assert gameData['state'][first_big_cell_state[0]][first_big_cell_state[1]] == -1
    assert gameData['nextMove'] == {'row':first_big_cell_state[2], 'column': first_big_cell_state[3]}

    # 11th move player1 X
    move_player(client2, [1,2,1,0], 1, gameId)

    # 12th move player2 O (second big cell)
    second_big_cell_state = [1,0,2,1]
    gameData = move_player_and_return(client1, second_big_cell_state, gameId)
    
    assert gameData['state'][second_big_cell_state[0]][second_big_cell_state[1]] == -1
    assert gameData['nextMove'] == {'row':second_big_cell_state[2], 'column': second_big_cell_state[3]}

    # 13th move player1 X (any next move)
    gameData = move_player_and_return(client2, [2,1,0,0], gameId)
    assert gameData['state'][2][1][0][0] == 1
    assert gameData['nextMove'] == None

    # 14th move player2 O
    move_player(client1, [2,0,1,1], -1, gameId)

    # 15th move player1 X (first big cell)
    first_big_cell_state = [1,1,2,0]
    gameData = move_player_and_return(client2, first_big_cell_state, gameId)
    
    assert gameData['state'][first_big_cell_state[0]][first_big_cell_state[1]] == 1
    assert gameData['nextMove'] == {'row':first_big_cell_state[2], 'column': first_big_cell_state[3]}

    # 16th move player2 O
    move_player(client1, [2,0,0,1], -1, gameId)

    # 17th move player1 X
    move_player(client2, [0,1,2,0], 1, gameId)

    # 18th move player2 O (winner)
    winner = [2,0,2,1]
    gameData = move_player_and_return(client1, winner, gameId)
    
    assert gameData['winner'] == -1
    assert gameData['status'] == 'Completed'
