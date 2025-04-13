import os
import sys
import django
from django.db.models import Q
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, PROJECT_ROOT)
# Настройка Django окружения (укажите путь к settings вашего проекта)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'arcadezonedb.settings')
django.setup()
from app.models import Player, Game, Record
# Запрос к модели Record с INNER JOIN
records = Record.objects.filter(
    Q(game__name="Game1") | Q(game__name="Game2") | Q(game__name="Game3")
).select_related('player', 'game').order_by('-score')[:5]

# Вывод результатов
for record in records:
    print(f"Nickname: {record.player.nickname}, Game: {record.game.name}, Score: {record.score}")