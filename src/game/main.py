from flask import Flask, request, render_template
from flask_cors import CORS
from flask_socketio import SocketIO, Namespace, emit
import game

app = Flask(__name__, static_folder="../../site/dist/assets", template_folder="../../site/dist")
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_method='eventlet')

class GameNamespace(Namespace):
    def on_connect(self):
        print(f"Client connected: [{request.sid}]")

    def on_disconnect(self):
        print(f"Client disconnected: [{request.sid}]")
        result = game.disconnect_player_by_id(request.sid)
        if result and result.status != 'Completed':
            if result.gameContext.player1.connected:
                emit('playerLeft', result.to_dict(), to=result.gameContext.player1.playerSid)
            elif result.gameContext.player2.connected:
                emit('playerLeft', result.to_dict(), to=result.gameContext.player2.playerSid)
        
    def on_create_game(self, data):
        print(f"Create Game: [{request.sid}]")
        result = game.create_game(request.sid, data)
        emit('created', result, to=request.sid)

    def on_load_game(self, data):
        print(f"Load Game: [{request.sid}]")
        game_db = game.get_game_by_id(data)
        
        if game_db.status == 'Completed':
            emit('bothConnected', game_db.to_dict(), to=request.sid)
            return
        
        result = game.connectPlayer(game_db, request.sid)
        if result:
            print(f"All players connected: [{result.to_dict()}]")
            player1Context = result.getPlayer1Context()
            emit('bothConnected', player1Context, to=player1Context["player"]["sid"])
            if not result.isBotPlayer:
                player2Context = result.getPlayer2Context()
                emit('bothConnected', player2Context, to=player2Context["player"]["sid"])
    def on_quit(self):
        print(f"On quit: [{request.sid}]")
        self.on_disconnect()

    def on_move(self, data):
        result = game.move_game(data["gameId"], data["move"], request.sid)
        if result:
            player1Context = result.getPlayer1Context()
            emit('playerMoved', player1Context, to=player1Context["player"]["sid"])
            if not result.isBotPlayer:
                player2Context = result.getPlayer2Context()
                emit('playerMoved', player2Context, to=player2Context["player"]["sid"])

    def handleNotFoundError(self, data, sid):
        emit('error', {
                "status" : 404,
                "message": f"We couldn't locate the game you requested (ID: {data})."
            }, to=sid)
        
        emit('error', f"We couldn't locate the game you requested (ID: {data}).", to=sid)
        

socketio.on_namespace(GameNamespace('/game'))


@app.route("/")
def hello_world():
    return render_template("index.html")
@app.errorhandler(404)
def not_found(e):
    return render_template("index.html")
@app.route("/api/list")
def fetch_list():
    return game.read_all()
@app.route("/api/game/<gameId>")
def fetch_game(gameId):
    return game.get_game_by_id(gameId).to_dict()

@app.route("/api")
def random_move():
    game.bot_move(request.args.get('id'))

GEVENT_SUPPORT=True
if __name__ == '__main__':
    socketio.run(app, debug=True, log_output=True, host='0.0.0.0', port=4321)

