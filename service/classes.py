import math
import random


class Level:

    # конструктор
    def __init__(self, level):
        self.level = level

    # отдает минимальную цену на ЕСМ от уровня
    def get_price_esm(self):
        list_price_esm = [800, 650, 500, 400, 300]
        return list_price_esm[self.level]

    # отдает минимальную цену на ЕГП от уровня
    def get_price_egp(self):
        list_price_egp = [6500, 6000, 5500, 5000, 4500]
        return list_price_egp[self.level]

    # отдает количество ЕСМ от уровня и количества НЕ БАНКРОТОВ - игроков
    def get_number_esm(self, number_player):
        list_esm = [1, 1.5, 2, 2.5, 3]
        return math.floor(list_esm[self.level] * number_player)

    # отдает количество ЕГП от уровня и количества НЕ БАНКРОТОВ - игроков
    def get_number_egp(self, number_player):
        list_egp = [3, 2.5, 2, 1.5, 1]
        return math.floor(list_egp[self.level] * number_player)

    # смена уровня
    def get_new_level(self):
        matrix_of_level = [[1 / 3, 1 / 3, 1 / 6, 1 / 12, 1 / 12], [1 / 4, 1 / 3, 1 / 4, 1 / 12, 1 / 12],
                           [1 / 12, 1 / 4, 1 / 3, 1 / 4, 1 / 12], [1 / 12, 1 / 12, 1 / 4, 1 / 3, 1 / 4],
                           [1 / 12, 1 / 12, 1 / 6, 1 / 3, 1 / 3]]
        var = random.random()
        i = 0
        while var > 0:
            var = var - matrix_of_level[self.level][i]
            i = i + 1
        self.level = i-1
        pass
