import os
import sys
import django
from django.db.models import Q
# Добавляем путь к корневой директории проекта
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, PROJECT_ROOT)
print(sys.path)
# Настройка Django окружения (укажите путь к settings вашего проекта)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'arcadezonedb.settings')
django.setup()


from app.models import Player, Game, Record


# Заполнение таблицы Game

"""game1 = Game(1, "Game1", "https://disk.yandex.ru/d/17h-upJd69Q55A/Game1/code.txt", "genre1",
             "https://disk.yandex.ru/d/17h-upJd69Q55A/Game1/pictures")
game2 = Game(2, "Game2", "https://disk.yandex.ru/d/17h-upJd69Q55A/Game2/code.txt", "genre2",
             "https://disk.yandex.ru/d/17h-upJd69Q55A/Game2/pictures")
game3 = Game(3, "Game3", "https://disk.yandex.ru/d/17h-upJd69Q55A/Game3/code.txt", "genre3",
             "https://disk.yandex.ru/d/17h-upJd69Q55A/Game3/pictures")

game1.save()
game2.save()
game3.save()

print("Таблица Game успешно заполнена.")

# Заполнение таблицы Player

player1 = Player(1,"Player1", "1", None)
player2 = Player(2,"Player2", "2", None)
player3 = Player(3,"Player3", "3", None)

player1.save()
player2.save()
player3.save()

print("Таблица Player успешно заполнена.")"""

records_data = [
    {"player_id": "1", "game_id": "2", "start_time": "9:20", "end_time": "12:23", "score": "10"},
    {"player_id": "1", "game_id": "3", "start_time": "10:15", "end_time": "12:20", "score": "20"},
    {"player_id": "2", "game_id": "1", "start_time": "8:20", "end_time": "13:30", "score": "20"},
    {"player_id": "3", "game_id": "1", "start_time": "7:25", "end_time": "13:40", "score": "20"},
    {"player_id": "1", "game_id": "3", "start_time": "6:25", "end_time": "13:40", "score": "40"},
    {"player_id": "2", "game_id": "3", "start_time": "10:25", "end_time": "13:40", "score": "20"},
]

for record in records_data:
    Record.objects.create(**record)
