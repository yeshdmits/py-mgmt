import random
import copy

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

def smarter_move(state, move):
    legal_moves = []
    if move:
        row = move["row"]
        column = move["column"]
        return (row, column) + state_based_move_decision(state[row][column], calculate_legal_moves(state[row][column], row, column))
    else:
        for i, row in enumerate(state):
            for j, element in enumerate(row):
                if isinstance(element, list):
                    legal_moves += calculate_legal_moves(element, i, j)

    best_move = full_state_based_move_decision(state, legal_moves)
    if best_move:
        return best_move
    return random.choice(legal_moves)

def state_based_move_decision(simple_state, legal_moves):
    possible_moves = get_last_two_elements_from_tuples(legal_moves)
    best_move = check_best_move(simple_state, -1, possible_moves)
    if not best_move:
        best_move = check_best_move(simple_state, 1, possible_moves)
    if best_move:
        return best_move
    return random.choice(possible_moves)

def full_state_based_move_decision(state, legal_moves):
    best_move = None
    for (row, col, i, j) in legal_moves:
        temp_state = copy.deepcopy(state)
        temp_state[row][col][i][j] = -1
        innerResult = checkWinnerInner(temp_state[row][col])
        if innerResult:
            best_move = (row, col, i, j)
            temp_state[row][col] = innerResult
            result = checkWinner(temp_state)
            if result:
                return best_move

def check_best_move(simple_state, action, possible_moves):
    for (i, j) in possible_moves:
        temp_state = copy.deepcopy(simple_state)
        temp_state[i][j] = action
        result = checkWinnerInner(temp_state)
        if result:
            return (i, j)
    return None
            
def get_last_two_elements_from_tuples(lst):
    return [tup[-2:] for tup in lst]
    

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