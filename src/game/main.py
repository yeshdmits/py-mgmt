from flask import Flask, request, render_template
from flask_cors import CORS
from flask_socketio import SocketIO, Namespace, emit
from game import disconnect_player_by_id, create_game, get_game_by_id, connectPlayer, move_game, fetch_list

app = Flask(__name__, static_folder="../../site/dist/assets", template_folder="../../site/dist")
socketio = SocketIO(app, cors_allowed_origins="*")


class GameNamespace(Namespace):
    def on_connect(self):
        print(f"Client connected: [{request.sid}]")

    def on_fetch_list(self):
        result = fetch_list()
        emit('games', result, to=request.sid)

    def on_disconnect(self):
        print("Client disconnected")
        result = disconnect_player_by_id(request.sid)
        if result and result.status != 'Completed':
            if result.gameContext.player1.connected:
                emit('playerLeft', result.to_dict(), to=result.gameContext.player1.playerSid)
            elif result.gameContext.player2.connected:
                emit('playerLeft', result.to_dict(), to=result.gameContext.player2.playerSid)
        
    def on_create_game(self):
        result = create_game(request.sid)
        emit('created', result, to=request.sid)

    def on_load_game(self, data):
        game_db = get_game_by_id(data)
        
        if game_db.status == 'Completed':
            emit('bothConnected', game_db.to_dict(), to=request.sid)
            return
        
        result = connectPlayer(game_db, request.sid)
        if result:
            player1Context = result.getPlayer1Context()
            emit('bothConnected', player1Context, to=player1Context["player"]["sid"])
            player2Context = result.getPlayer2Context()
            emit('bothConnected', player2Context, to=player2Context["player"]["sid"])

    def on_move(self, data):
        result = move_game(data["gameId"], data["move"], request.sid)
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


@app.route("/")
def hello_world():
    return render_template("index.html")
@app.errorhandler(404)
def not_found(e):
    return render_template("index.html")


if __name__ == '__main__':
    socketio.run(app)

