from datetime import datetime, timedelta
# from flask_apscheduler import APScheduler
from apscheduler.schedulers.background import BackgroundScheduler
import repository
import automation

games = []

def bot_move(id):
    game = repository.read(id)
    automation.random_move(game.state, game.nextMove)

def read_all():
    return repository.read_all()

def create_game(player_sid, isBotPlayer):
    return repository.create(player_sid, isBotPlayer)

def get_game_by_id(game_uid):
    return repository.read(game_uid)

def disconnect_player_by_id(player_sid):
    result = repository.findByPlayer(player_sid)
    if result:
        return disconnectPlayer(result, player_sid)
    return result

def move_game(game_uid, data, playerSid):
    game_db = repository.read(game_uid)
    if canPlayerMove(game_db, playerSid) and game_db.status == 'In Progress':
        result = move(game_db, data.get("row"), data.get("column"), data.get("innerRow"), data.get("innerColumn"))
        if result:
            if not result.isBotPlayer:
                return result
            botMove = automation.random_move(result.state, result.nextMove)
            return move(result, botMove[0], botMove[1], botMove[2], botMove[3])
    return False

scheduler = BackgroundScheduler()
def autoComplete():
    repository.autoComplete()
scheduler.add_job(autoComplete, trigger='interval', minutes=1)
scheduler.start()

def playerExistsBySid(gameId, playerSid):
    result = repository.read(gameId)
    if result.status == 'Completed':
        return False
    return result.gameContext.player1.playerSid == playerSid or result.gameContext.player2.playerSid == playerSid

def canPlayerMove(game_db, sid):
    if game_db.gameContext.player1.playerSid == sid:
        return game_db.gameContext.player1.playerMove
    if game_db.gameContext.player2.playerSid == sid:
        return game_db.gameContext.player2.playerMove
    return False

def connectPlayer(game, sid):
    if game.gameContext.player1.connected and game.gameContext.player2.connected:
        return game
    # result.gameContext.connect(sid)
    if not game.gameContext.player1.connected and not game.gameContext.player2.playerSid == sid:
        game.gameContext.player1.playerSid = sid
        game.gameContext.player1.connected = True
    elif not game.gameContext.player2.connected and not game.gameContext.player1.playerSid == sid:
        game.gameContext.player2.playerSid = sid
        game.gameContext.player2.connected = True

    game.expireAt = game.createdAt + timedelta(minutes=10)

    connected = game.gameContext.player1.connected and game.gameContext.player2.connected
    if connected and not (game.gameContext.player1.playerMove or game.gameContext.player1.playerMove):
        game.gameContext.player1.playerMove = True

    result = repository.update(game)
    if connected:
        return result
    return connected

def disconnectPlayer(game, sid):
    # player = result.gameContext.getBySid(sid)
    if game.gameContext.player1.playerSid == sid:
        game.gameContext.player1.connected = False
    elif game.gameContext.player2.playerSid == sid:
        game.gameContext.player2.connected = False
    game.expireAt = datetime.now() + timedelta(seconds=30)
    return repository.update(game)

def checkWinnerInner(fields):
    for i in range(len(fields)):
        if fields[i][0] != 0 and fields[i][0] == fields[i][1] and fields[i][0] == fields[i][2]:
            return fields[i][0]

    for j in range(len(fields)):
        if fields[0][j] != 0 and fields[0][j] == fields[1][j] and fields[0][j] == fields[2][j]:
            return fields[0][j]

    if fields[0][0] != 0 and fields[0][0] == fields[1][1] and fields[0][0] == fields[2][2]:
        return fields[0][0]

    if fields[0][2] != 0 and fields[0][2] == fields[1][1] and fields[0][2] == fields[2][0]:
        return fields[0][2]

    is_draw = True
    for i in range(len(fields)):
        for j in range(len(fields)):
            if fields[i][j] == 0:
                is_draw = False
                break
        if not is_draw:
            break

    if is_draw:
        return 0

    return None

def move(game, row, column, i, j):
    if game.nextMove:
        if game.nextMove['row'] != row or game.nextMove['column'] != column:
            return False

    if game.state[row][column][i][j] == 0:
        game.state[row][column][i][j] = game.step
        game.historyState[row][column][i][j] = game.step
        winnerInner = checkWinnerInner(game.state[row][column])
        if winnerInner != None:
            game.state[row][column] = winnerInner
            winner = checkWinner(game.state)
            if winner != None:
                game.winner = winner
                game.status = 'Completed'
                return repository.update(game)
        if game.state[i][j] == 1 or game.state[i][j] == -1:
            game.nextMove = None
        else:
            game.nextMove = {"row": i, "column": j}
    else:
        return False
    
    if not game.isBotPlayer:
        game.gameContext.player1.playerMove = not game.gameContext.player1.playerMove
        game.gameContext.player2.playerMove = not game.gameContext.player2.playerMove
    if game.step == 1:
        game.step = -1
    else:
        game.step = 1
    return repository.update(game)

def checkWinner(fields):
    for i in range(len(fields)):
        if isinstance(fields[i][0], int) and fields[i][0] == fields[i][1] and fields[i][0] == fields[i][2]:
            return fields[i][0]

    for j in range(len(fields)):
        if isinstance(fields[0][j], int) and fields[0][j] == fields[1][j] and fields[0][j] == fields[2][j]:
            return fields[0][j]

    if isinstance(fields[0][0], int) and fields[0][0] == fields[1][1] and fields[0][0] == fields[2][2]:
        return fields[0][0]

    if isinstance(fields[0][2], int) and fields[0][2] == fields[1][1] and fields[0][2] == fields[2][0]:
        return fields[0][2]

    is_draw = True
    for i in range(len(fields)):
        for j in range(len(fields)):
            if not isinstance(fields[i][j], int):
                is_draw = False
                break
        if not is_draw:
            break

    if is_draw:
        return 0

    return None
