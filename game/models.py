from django.db import models
from customauth.models import Player


# Ссуда
class Loan(models.Model):
    loan_amount = models.IntegerField()
    loan_date = models.DateField()


class Game(models.Model):
    room_name = models.CharField(max_length=100)
    players_count = models.IntegerField()
    step = models.IntegerField(null=True, blank=True)
    level = models.IntegerField(null=True, default=3)

    game_stage = models.IntegerField(null=True, blank=True)

    game_stage_map = {
        1: 'buy_esm',
        2: 'produce_egp',
        3: 'sell_egp',
        4: 'get_loan',
        5: 'build_fabrics'
    }


class EGPRequest(models.Model):
    egp_count = models.IntegerField(null=True, blank=True)
    egp_price = models.IntegerField(null=True, blank=True)
    bank_response = models.CharField(null=True, blank=True, max_length=2000)


class ESMRequest(models.Model):
    esm_count = models.IntegerField(null=True, blank=True)
    esm_price = models.IntegerField(null=True, blank=True)
    bank_response = models.CharField(null=True, blank=True, max_length=2000)


class AutomatizationRequest(models.Model):
    step = models.IntegerField(null=True, blank=True)
    count = models.IntegerField(null=True, blank=True)

class BuildRequest(models.Model):
    step = models.IntegerField(null=True, blank=True)
    automatical_fabric_count = models.IntegerField(null=True, blank=True)
    simple_fabric_count = models.IntegerField(null=True, blank=True)


class PlayerGameInfo(models.Model):
    player_id = models.ForeignKey(to=Player, on_delete=models.CASCADE)
    room_id = models.ForeignKey(to=Game, on_delete=models.CASCADE)

    loan_id = models.ForeignKey(to=Loan, null=True, blank=True, on_delete=models.SET_NULL)
    capital = models.IntegerField(null=True, blank=True)
    auto_fabric_count = models.IntegerField(null=True, blank=True)
    simple_fabric_count = models.IntegerField(null=True, blank=True)
    esm = models.IntegerField(null=True, blank=True)
    egp = models.IntegerField(null=True, blank=True)
    senior_player = models.BooleanField(null=True, default=False)
    senioring = models.SmallIntegerField(null=True, blank=True)
    player_turn_finish = models.BooleanField(null=True, default=False)
    esm_request_id = models.ForeignKey(ESMRequest, null=True, blank=True, on_delete=models.SET_NULL)
    egp_request_id = models.ForeignKey(EGPRequest, null=True, blank=True, on_delete=models.SET_NULL)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["player_id", "room_id"], name='unique_game_info')
        ]


class AutomatizationRequestList(models.Model):
    player_info_id = models.ForeignKey(to=PlayerGameInfo, on_delete=models.CASCADE, related_name='auto_player_id')
    request_id = models.ForeignKey(to=AutomatizationRequest, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["player_info_id", "request_id"], name='unique_in_auto_request')
        ]


class BuildRequestList(models.Model):
    player_info_id = models.ForeignKey(to=PlayerGameInfo, on_delete=models.CASCADE, related_name='build_player_id')
    request_id = models.ForeignKey(to=BuildRequest, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["player_info_id", "request_id"], name='unique_in_build_request')
        ]