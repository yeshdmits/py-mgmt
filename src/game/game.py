import uuid
from datetime import datetime, timedelta
from flask_apscheduler import APScheduler

games = []

def all_games():
    return [game.toJSON() for game in games]

def create_game():
    game = Game()
    games.append(game)
    return game


def get_game_by_id(game_uid):
    for game in games:
        if game.id == game_uid:
            return game
    return False

def disconnect_player_by_id(player_sid):
    for game in games:
        if game.playerExistsBySid(player_sid):
            game.disconnectPlayer(player_sid)
            return game
    return False

def move_game(game_uid, data, playerSid):
    for game in games:
        if game.id == game_uid:
            if not game.canPlayerMove(playerSid):
                return False
            result = game.move(data.get("row"), data.get("column"), data.get("innerRow"), data.get("innerColumn"))
            if result == 0:
                return False
            return game
    return False


class Game:
    def __init__(self):
        self.scheduler = APScheduler()
        self.scheduler.start()
        self.status = 'In Progress'
        self.id = uuid.uuid4().hex # unique id of the game session
        self.createdAt = datetime.now() # date-time of starting
        self.expireAt = datetime.now() + timedelta(minutes=30) # expiration date of the game
        self.step = 1 # player move [1/-1]
        self.nextMove = None
        self.gameContext = GameContext()
        self.schedule_function(self.expireAt)
        self.winner = 0
        self.state = [
    [
        [[0, 0, 0],[0, 0, 0],[0, 0, 0]], 
        [[0, 0, 0],[0, 0, 0],[0, 0, 0]], 
        [[0, 0, 0],[0, 0, 0],[0, 0, 0]]
    ], 
    [
        [[0, 0, 0],[0, 0, 0],[0, 0, 0]], 
        [[0, 0, 0],[0, 0, 0],[0, 0, 0]], 
        [[0, 0, 0],[0, 0, 0],[0, 0, 0]]
    ], 
    [
        [[0, 0, 0],[0, 0, 0],[0, 0, 0]], 
        [[0, 0, 0],[0, 0, 0],[0, 0, 0]], 
        [[0, 0, 0],[0, 0, 0],[0, 0, 0]]
    ]
] # current state of game
        self.historyState = [
    [
        [[0, 0, 0],[0, 0, 0],[0, 0, 0]], 
        [[0, 0, 0],[0, 0, 0],[0, 0, 0]], 
        [[0, 0, 0],[0, 0, 0],[0, 0, 0]]
    ], 
    [
        [[0, 0, 0],[0, 0, 0],[0, 0, 0]], 
        [[0, 0, 0],[0, 0, 0],[0, 0, 0]], 
        [[0, 0, 0],[0, 0, 0],[0, 0, 0]]
    ], 
    [
        [[0, 0, 0],[0, 0, 0],[0, 0, 0]], 
        [[0, 0, 0],[0, 0, 0],[0, 0, 0]], 
        [[0, 0, 0],[0, 0, 0],[0, 0, 0]]
    ]
]
        
    def autoComplete(self):
        self.status = 'Completed'

    def schedule_function(self, run_time):
        self.scheduler.add_job(id=self.id, func=self.autoComplete, trigger='date', run_date=run_time)

    def playerExistsBySid(self, sid):
        if self.status == 'Completed':
            return False
        return self.gameContext.player1.playerSid == sid or self.gameContext.player2.playerSid
    
    def canPlayerMove(self, sid):
        if self.gameContext.player1.playerSid == sid:
            return self.gameContext.player1.playerMove
        if self.gameContext.player2.playerSid == sid:
            return self.gameContext.player2.playerMove
        return False

    def connectPlayer(self, sid):
        if self.gameContext.allConnected():
            return False
        
        self.gameContext.connect(sid)
        self.expireAt = self.createdAt + timedelta(minutes=30)

        if self.scheduler.get_job(self.id):
            self.scheduler.remove_job(self.id)
            self.schedule_function(self.expireAt)

        result = self.gameContext.allConnected()
        if result and not self.gameContext.started():
            self.gameContext.player1.playerMove = True

        return result
    
    def disconnectPlayer(self, sid):
        if self.status == 'Completed':
            return False
        
        player = self.gameContext.getBySid(sid)
        if player:
            player.connected = False
            self.expireAt = datetime.now() + timedelta(seconds=30)
            if self.scheduler.get_job(self.id):
                self.scheduler.remove_job(self.id)
                self.schedule_function(self.expireAt)
            return True
        
        return False
    
    def move(self, row, column, i, j):
        if self.status == 'Completed':
            return 0
        
        if self.nextMove:
            if self.nextMove['row'] != row or self.nextMove['column'] != column:
                return 0

        if self.state[row][column][i][j] == 0:
            self.state[row][column][i][j] = self.step
            self.historyState[row][column][i][j] = self.step
            winnerInner = self.checkWinnerInner(self.state[row][column])
            if winnerInner != None:
                self.state[row][column] = winnerInner
                winner = self.checkWinner(self.state)
                if winner != None:
                    self.winner = winner
                    self.status = 'Completed'
                    return 1
            if self.state[i][j] == 1 or self.state[i][j] == -1:
                self.nextMove = None
            else:
                self.nextMove = {"row": i, "column": j}
        else:
            return 0
        
        self.gameContext.swapMoving()
        if self.step == 1:
            self.step = -1
        else:
            self.step = 1
        return 1

    def getPlayer1Context(self):
        return {
            "id": self.id,
            "createdAt": self.createdAt.isoformat(),
            "expireAt": self.expireAt.isoformat(),
            "step": self.step,
            "state": self.state,
            "nextMove": self.nextMove,
            "historyState": self.historyState,
            "status": self.status,
            "winner": self.winner,
            "player": {
                "move": self.gameContext.player1.playerMove,
                "sid": self.gameContext.player1.playerSid
            }
        }

    def getPlayer2Context(self):
        return {
            "id": self.id,
            "createdAt": self.createdAt.isoformat(),
            "expireAt": self.expireAt.isoformat(),
            "step": self.step,
            "state": self.state,
            "nextMove": self.nextMove,
            "historyState": self.historyState,
            "status": self.status,
            "winner": self.winner,
            "player": {
                "move": self.gameContext.player2.playerMove,
                "sid": self.gameContext.player2.playerSid
            }
        }

    def toJSON(self):
        return {
            "id": self.id,
            "createdAt": self.createdAt.isoformat(),
            "expireAt": self.expireAt.isoformat(),
            "step": self.step,
            "state": self.state,
            "nextMove": self.nextMove,
            "historyState": self.historyState,
            "status": self.status,
            "winner": self.winner,
            "player": {
                "move": False,
                "sid": ''
            }
        }
    
    def checkWinnerInner(self, fields):
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
    
    def checkWinner(self, fields):
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

class GameContext:
    def __init__(self):
        self.player1 = GameContextPlayer()
        self.player2 = GameContextPlayer()
    
    def getBySid(self, sessionId):
        if self.player1.playerSid == sessionId:
            return self.player1
        elif self.player2.playerSid == sessionId:
            return self.player2
    
    def connect(self, sid):
        if self.player1.connected and self.player2.connected:
            return False
        if not self.player1.connected and not self.player2.playerSid == sid:
            self.player1.playerSid = sid
            self.player1.connected = True
        elif not self.player2.connected and not self.player1.playerSid == sid:
            self.player2.playerSid = sid
            self.player2.connected = True
    

    def started(self):
        return self.player1.playerMove or self.player2.playerMove

    def allConnected(self):
        return self.player1.connected and self.player2.connected
    
    def swapMoving(self):
        self.player1.playerMove = not self.player1.playerMove
        self.player2.playerMove = not self.player2.playerMove
        

class GameContextPlayer:
    def __init__(self):
        self.playerSid = None
        self.playerMove = False
        self.connected = False
    
    def connectPlayer(self, sessionId):
        self.playerSid = sessionId
        self.connected = True

