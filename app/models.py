from django.db import models
from django.utils import timezone


class Game(models.Model):
    name = models.TextField()
    code = models.TextField(blank=True)
    genre = models.TextField()
    pictures = models.TextField(blank=True)


class Player(models.Model):
    nickname = models.TextField()
    password = models.TextField(default=None)
    adm_password = models.TextField(null=True)


class Record(models.Model):
    player = models.ForeignKey(Player, on_delete=models.PROTECT)
    game = models.ForeignKey(Game, on_delete=models.PROTECT)
    start_time = models.TimeField(null=True)
    end_time = models.TimeField(null=True, auto_now_add=True, )
    score = models.IntegerField(default=True)
    def save(self, *args, **kwargs):
        if self.end_time is None:
            # Получаем текущее локальное время (по часовому поясу Django проекта)
            self.end_time = timezone.localtime(timezone.now()).time()
        super().save(*args, **kwargs)
        