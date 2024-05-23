from flask import Flask, request, render_template
from flask_apscheduler import APScheduler
from flask_cors import CORS
from flask_socketio import SocketIO, Namespace, emit
import game;

app = Flask(__name__, static_folder="../../site/dist/assets", template_folder="../../site/dist")
socketio = SocketIO(app, cors_allowed_origins="*")


class GameNamespace(Namespace):
    def on_connect(self):
        print(f"Client connected: [{request.sid}]")

    def on_disconnect(self):
        print("Client disconnected")
        result = game.disconnect_player_by_id(request.sid)
        if result:
            if result.gameContext.player1.connected:
                emit('playerLeft', result.toJSON(), to=result.gameContext.player1.playerSid)
            else:
                emit('playerLeft', result.toJSON(), to=result.gameContext.player2.playerSid)
        
    def on_create_game(self):
        result = game.create_game()
        emit('created', result.id, to=request.sid)

    def on_load_game(self, data):
        result = game.get_game_by_id(data)
        if not result:
            self.handleNotFoundError(data, request.sid)
            return
        
        if result.status == 'Completed':
            emit('bothConnected', result.toJSON(), to=request.sid)
            return
        if result.gameContext.allConnected() or result.connectPlayer(request.sid):
            player1Context = result.getPlayer1Context()
            emit('bothConnected', player1Context, to=player1Context["player"]["sid"])
            player2Context = result.getPlayer2Context()
            emit('bothConnected', player2Context, to=player2Context["player"]["sid"])

    def on_move(self, data):
        result = game.move_game(data["gameId"], data["move"], request.sid)
        if result:
            player1Context = result.getPlayer1Context()
            emit('playerMoved', player1Context, to=player1Context["player"]["sid"])
            player2Context = result.getPlayer2Context()
            emit('playerMoved', player2Context, to=player2Context["player"]["sid"])

    def handleNotFoundError(self, data, sid):
        emit('error', {
                "status" : 404,
                "message": f"We couldn't locate the game you requested (ID: {data})."
            }, to=sid)
        
        emit('error', f"We couldn't locate the game you requested (ID: {data}).", to=sid)
        

socketio.on_namespace(GameNamespace('/game'))

CORS(app)

@app.route("/")
def hello_world():
    return render_template("index.html")
@app.errorhandler(404)
def not_found(e):
    return render_template("index.html")


if __name__ == '__main__':
    socketio.run(app)

