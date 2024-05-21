from flask import Flask, request, render_template
from flask_apscheduler import APScheduler
from flask_cors import CORS
from flask_socketio import SocketIO, Namespace, emit
import game;

app = Flask(__name__, static_folder="site/dist/assets", template_folder="site/dist")
socketio = SocketIO(app, cors_allowed_origins="*")


class CustomNamespace(Namespace):
    def on_connect(self):
        print("Client connected")
        emit('response', {'data': 'Connected'})

    def on_disconnect(self):
        print("Client disconnected")
        result = game.disconnect_player_by_id(request.sid)
        if result:
            if result.gameContext.player1.connected:
                emit('playerLeft', to=result.gameContext.player1.playerSid)
            else:
                emit('playerLeft', to=result.gameContext.player2.playerSid)
        
    def on_create_game(self):
        result = game.create_game()
        result.connectPlayer(request.sid)
        emit('created', result.id, to=request.sid)

    def on_load_game(self, data):
        result = game.get_game_by_id(data)
        if not result:
            self.handleNotFoundError(data, request.sid)
            return
        if result.connectPlayer(request.sid):
            player1Context = result.getPlayer1Context()
            emit('bothConnected', player1Context, to=player1Context["player"]["sid"])
            player2Context = result.getPlayer2Context()
            emit('bothConnected', player2Context, to=player2Context["player"]["sid"])

    def on_move(self, data):
        result = game.move_game(data["gameId"], data["move"])
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
        

socketio.on_namespace(CustomNamespace('/game'))

CORS(app)
scheduler = APScheduler()

@app.route("/")
def hello_world():
    return render_template("index.html")
@app.errorhandler(404)
def not_found(e):
    return render_template("index.html")

@app.route("/game/", methods=["POST"])
def create_new_game():
    return game.create_game().toJSON()

@app.route("/game/<game_uid>")
def get_game_by_id(game_uid):
    return game.get_game_by_id(game_uid).toJSON()

@app.route("/game/<game_uid>", methods=["PUT"])
def move_game_by_id(game_uid):
    data = request.json
    if data:
        response = game.move_game(game_uid, data)
        if response == 0:
            return 'Wrong data provided', 400
        return response.toJSON()
    else:
        return 'No data provided', 400

@app.route("/games")
def get_games():
    return game.all_games()

# @socketio.on('connect')
# def handle_connect():
#     connected = game.connect_player(request.sid, request.args.get('gameId'))
#     if connected:
#         notify_frontend()

# def notify_frontend():
#     socketio.emit('players_ready', 'Both players are connected!', broadcast=True)


# @socketio.on('disconnect')
# def handle_disconnect():
#     game.disconnect_player(request.sid)


if __name__ == '__main__':
    scheduler.add_job(id = 'Scheduled Task', func=game.clear, trigger="interval", seconds=60)
    # scheduler.start()
    # socketio.run(app)
    socketio.run(app, debug=True, host="0.0.0.0")