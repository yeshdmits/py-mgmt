from pymongo import MongoClient
from datetime import datetime, timedelta
from bson import ObjectId
import os
import pytz

mongo_password = os.environ["mongo_password"]
uri = f"mongodb+srv://game:{mongo_password}@cluster0.brjgrjl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
print(uri)
client = MongoClient(uri)
database = client.get_database("python-game")
games = database.get_collection("games")

try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

def read_all():
    results = []
    cursor = games.find()
    for i in cursor:
        results.append(Game.from_dict(i).to_transfer())

    return results

def create(player_sid, isBotPlayer):
    try:
        result = findByPlayer(player_sid)
        if result:
            result.status = 'Completed'
            query = { "id": result.id }
            toUpdate = { "$set": result.to_dict() }
            games.update_one(query, toUpdate)

        to_save = Game(isBotPlayer=isBotPlayer).to_dict()
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
    
def autoComplete():
    query = { 
            "status": 'In Progress',
            "expireAt": { "$lt": datetime.now(pytz.utc).isoformat()}
        }
    update = {"$set": {"status": "Completed", "gameContext": {"player1": {"connected": False}, "player2": {"connected": False}}}}
    result = games.update_many(query, update)
    print("Number of documents updated:", result.modified_count)

def autoRemove():
    query = { 
        # "expireAt": { "$lt": (datetime.now(pytz.utc)).isoformat()}
        "expireAt": { "$lt": (datetime.now(pytz.utc) - timedelta(minutes=60)).isoformat()}
    }
    result = games.delete_many(query)
    print("Number of documents deleted:", result.deleted_count)

def checkCanCreate():
    return len(read_all()) < 1000

# Utils
def round_to_nearest_minute(dt):
    return dt + timedelta(seconds=(60 - dt.second) % 60)


# Entity

class Game:
    def __init__(self, createdAt=None, expireAt=None,
                 status='In Progress', 
                 id=None, 
                 step=1, 
                 nextMove=None, 
                 gameContext=None, 
                 winner=0, 
                 state=None, 
                 historyState=None, 
                 startedAt=None, 
                 finishedAt=None, 
                 isBotPlayer=False):
        self.isBotPlayer = isBotPlayer
        self.status = status
        self.id = id
        if createdAt:
            self.createdAt = createdAt
        else: 
            self.createdAt = datetime.now(pytz.utc)
        if expireAt:
            self.expireAt = expireAt
        else:
            self.expireAt = datetime.now(pytz.utc) + timedelta(minutes=60)
        self.step = step
        self.nextMove = nextMove
        if gameContext:
            self.gameContext = gameContext
        elif isBotPlayer:
            self.gameContext = GameContext(player2=GameContextPlayer(connected=True))
        else:
            self.gameContext = GameContext()

        if finishedAt:
            self.finishedAt = round_to_nearest_minute(finishedAt)
        if startedAt:
            self.startedAt = round_to_nearest_minute(startedAt)

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
            "createdAt": self.createdAt.isoformat(),
            "expireAt": self.expireAt.isoformat(),
            "step": self.step,
            "state": self.state,
            "nextMove": self.nextMove,
            "historyState": self.historyState,
            "status": self.status,
            "winner": self.winner,
            "isBotPlayer": self.isBotPlayer,
            "gameContext": self.gameContext.to_dict(),
            "playerLeft": not self.gameContext.player1.connected or not self.gameContext.player2.connected
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
            isBotPlayer=dict_data.get('isBotPlayer'),
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
