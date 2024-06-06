import random

def calculate_legal_moves(matrix, row, column):
    legal_moves = []
    for i, line in enumerate(matrix):
            for j, element in enumerate(line):
                if element == 0:
                    legal_moves.append((row, column, i, j))
    
    return legal_moves

def random_move(state, move):
    legal_moves = []
    if move:
        row = move["row"]
        column = move["column"]
        legal_moves += calculate_legal_moves(state[row][column], row, column)
    else:
        for i, row in enumerate(state):
            for j, element in enumerate(row):
                if isinstance(element, list):
                    legal_moves += calculate_legal_moves(element, i, j)
    print(legal_moves)

    return random.choice(legal_moves)
    
