from pymongo import MongoClient
from datetime import datetime, timedelta
import uuid
from bson import ObjectId

uri = "mongodb://localhost:27017/"

client = MongoClient(uri)
database = client.get_database("mongo-example")
games = database.get_collection("games")

def read_all():
    projection = {
        "_id": 1,
        "createdAt": 1,
        "expireAt": 1,
        "status": 1,
        "winner": 1,
        "gameContext": 1
    }

    # cursor = games.find({}, projection)
    results = []
    cursor = games.find()
    for i in cursor:
        results.append(Game.from_dict(i).to_transfer())

    return results

def create(player_sid):
    try:
        result = findByPlayer(player_sid)
        if result:
            result.status = 'Completed'
            query = { "id": result.id }
            toUpdate = { "$set": result.to_dict() }
            games.update_one(query, toUpdate)

        to_save = Game().to_dict()
        insertedId = games.insert_one(to_save).inserted_id

        return str(insertedId)
    except Exception as e:
        raise Exception("Database error")
    
def read(id):
    try:
        query = { "_id": ObjectId(id) }
        result = games.find_one(query)
        game = Game.from_dict(result)

        return game
    except Exception as e:
        raise Exception("Database error")

def update(obj):
    try:
        query = { "_id": ObjectId(obj.id) }
        toUpdate = { "$set": obj.to_dict() }
        games.update_one(query, toUpdate)

        return read(obj.id)
    except Exception as e:
        raise Exception("Database error")
    
def findByPlayer(playerSid):
    try:
        query = { 
            "status": 'In Progress',
            "$or": [
                { "gameContext.player1.playerSid": playerSid },
                { "gameContext.player2.playerSid": playerSid },
            ]
        }
        result = games.find_one(query)
        
        if result:
            return Game.from_dict(result)
        return result
    except Exception as e:
        raise Exception("Database error")
    

# Entity

class Game:
    def __init__(self, status='In Progress', 
                 id=None, 
                 createdAt=datetime.now(), 
                 expireAt=datetime.now() + timedelta(minutes=30), 
                 step=1, 
                 nextMove=None, 
                 gameContext=None, 
                 winner=0, 
                 state=None, 
                 historyState=None, startedAt=None, finishedAt=None):
        self.status = status
        self.id = id
        self.createdAt = createdAt
        self.expireAt = expireAt
        self.step = step
        self.nextMove = nextMove
        self.startedAt = startedAt
        self.finishedAt = finishedAt
        if gameContext:
            self.gameContext = gameContext
        else:
            self.gameContext = GameContext()

        self.winner = winner
        if state:
            self.state = state # current state of game
        else:
            self.state = [
                [[[0, 0, 0],[0, 0, 0],[0, 0, 0]], [[0, 0, 0],[0, 0, 0],[0, 0, 0]], [[0, 0, 0],[0, 0, 0],[0, 0, 0]]], 
                [[[0, 0, 0],[0, 0, 0],[0, 0, 0]], [[0, 0, 0],[0, 0, 0],[0, 0, 0]], [[0, 0, 0],[0, 0, 0],[0, 0, 0]]], 
                [[[0, 0, 0],[0, 0, 0],[0, 0, 0]], [[0, 0, 0],[0, 0, 0],[0, 0, 0]], [[0, 0, 0],[0, 0, 0],[0, 0, 0]]]
            ]
        if historyState:
            self.historyState = historyState
        else:
            self.historyState = [
                [[[0, 0, 0],[0, 0, 0],[0, 0, 0]], [[0, 0, 0],[0, 0, 0],[0, 0, 0]], [[0, 0, 0],[0, 0, 0],[0, 0, 0]]], 
                [[[0, 0, 0],[0, 0, 0],[0, 0, 0]], [[0, 0, 0],[0, 0, 0],[0, 0, 0]], [[0, 0, 0],[0, 0, 0],[0, 0, 0]]], 
                [[[0, 0, 0],[0, 0, 0],[0, 0, 0]], [[0, 0, 0],[0, 0, 0],[0, 0, 0]], [[0, 0, 0],[0, 0, 0],[0, 0, 0]]]
            ]
    
    def to_transfer(self):
        return {
            "id": str(self.id),
            "createdAt": self.createdAt.isoformat(),
            "expireAt": self.expireAt.isoformat(),
            "status": self.status,
            "winner": self.winner,
            "gameContext": self.gameContext.to_dict(),
            "state": self.state
        }
        
    def to_dict(self):
        return {
            "id": str(self.id),
            "createdAt": self.createdAt.isoformat(),
            "expireAt": self.expireAt.isoformat(),
            "step": self.step,
            "state": self.state,
            "nextMove": self.nextMove,
            "historyState": self.historyState,
            "status": self.status,
            "winner": self.winner,
            "gameContext": self.gameContext.to_dict()
        }
    
    @classmethod
    def from_dict(cls, dict_data):
        return cls(
            id=dict_data.get('_id'),
            createdAt=datetime.fromisoformat(dict_data.get('createdAt')),
            expireAt=datetime.fromisoformat(dict_data.get('expireAt')),
            step=dict_data.get('step'),
            state=dict_data.get('state'),
            nextMove=dict_data.get('nextMove'),
            historyState=dict_data.get('historyState'),
            status=dict_data.get('status'),
            winner=dict_data.get('winner'),
            gameContext=GameContext.from_dict(dict_data.get('gameContext'))
        )
        
    def getPlayer1Context(self):
        result = self.to_dict()
        del result['gameContext']
        result['player'] = {
            "move": self.gameContext.player1.playerMove,
            "sid": self.gameContext.player1.playerSid
        }
        return result

    def getPlayer2Context(self):
        result = self.to_dict()
        del result['gameContext']
        result['player'] = {
            "move": self.gameContext.player2.playerMove,
            "sid": self.gameContext.player2.playerSid
        }
        return result

class GameContext:
    def __init__(self, player1=None, player2=None):
        if player1:
            self.player1 = player1
        else:
            self.player1 = GameContextPlayer()
        
        if player2:
            self.player2 = player2
        else:
            self.player2 = GameContextPlayer()
    
    def to_dict(self):
        return {
            "player1": self.player1.to_dict(),
            "player2": self.player2.to_dict()
        }
    
    @classmethod
    def from_dict(cls, dict_data):
        return cls(
            player1=GameContextPlayer.from_dict(dict_data.get("player1")),
            player2=GameContextPlayer.from_dict(dict_data.get("player2"))
        )

class GameContextPlayer:
    def __init__(self, playerSid=None, playerMove=False, connected=False):
        self.playerSid = playerSid
        self.playerMove = playerMove
        self.connected = connected
    
    def to_dict(self):
        return {
            "playerSid": self.playerSid,
            "playerMove": self.playerMove,
            "connected": self.connected
        }
    
    @classmethod
    def from_dict(cls, dict_data):
        return cls(
            playerSid=dict_data.get('playerSid'),
            playerMove=dict_data.get("playerMove"),
            connected=dict_data.get("connected")
        )
