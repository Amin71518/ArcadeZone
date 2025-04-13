from django.http import HttpResponse, HttpResponseNotFound, Http404, JsonResponse
from django.shortcuts import render, redirect
import json
from django.contrib.auth.hashers import make_password
from django.views.decorators.csrf import csrf_exempt
from .models import Player, Game, Record
from django.utils import timezone


def game(request):
    return HttpResponse("страница приложения games")
def games_list(request, id):
    if int(id) < 0:
        raise Http404()
    if int(id) == 0:
        return redirect('home', permanent=True)
    return HttpResponse(f"<h1>Игра под номером {id}</h1>")
def archive(request, year):
    return HttpResponse(f"<h1>Архив по годам</h1><p>{year}</p>")
def pageNotFound(request, exception):
    return HttpResponseNotFound('<h1>Страница не найдена</h1>')



@csrf_exempt  #Отключение протокола безопасности(отключить по окончании проекта)
def register_player(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            received_nickname = data.get('nickname')
            received_password = data.get('password')

            if not received_nickname or not received_password:
                return JsonResponse({'error': 'nickname and password are required'}, status=400)

            if Player.objects.filter(nickname=received_nickname).exists():
                return JsonResponse({'error': 'User already exists'}, status=400)

            # Хешируем пароль перед сохранением
            hashed_password = make_password(received_password)
            user = Player.objects.create(nickname=received_nickname, password=hashed_password)
            
            return JsonResponse({'message': 'User created successfully', 'user_id': user.id}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)



@csrf_exempt
def get_players(request):
    """Получить список всех игроков."""
    if request.method == "GET":
        players = list(Player.objects.values())
        return JsonResponse({"players": players}, safe=False)

@csrf_exempt
def get_player(request, player_id):
    """Получить информацию об игроке по ID."""
    if request.method == "GET":
        try:
            player = Player.objects.get(id=player_id) # Player.objects.get(id=player_id).values()
            return JsonResponse({
                "id": player.id,
                "nickname": player.nickname,
                "password": player.password,
                "adm_password": player.adm_password
            })
        except Player.DoesNotExist:
            return JsonResponse({"error": "Player not found"}, status=404)

@csrf_exempt
def delete_player(request, player_id):
    """Удалить игрока по ID."""
    if request.method == "DELETE":
        try:
            player = Player.objects.get(id=player_id)
            player.delete()
            return JsonResponse({"message": "Player deleted successfully"})
        except Player.DoesNotExist:
            return JsonResponse({"error": "Player not found"}, status=404)
        
@csrf_exempt
def update_player_password(request, player_id):
    """Обновить пароль игрока по ID."""
    if request.method == "PUT":
        try:
            player = Player.objects.get(id=player_id)
            data = json.loads(request.body)
            new_password = data.get("password")

            if not new_password:
                return JsonResponse({"error": "New password is required"}, status=400)

            player.password = make_password(new_password)
            player.save()

            return JsonResponse({
                "message": "Password updated successfully",
                "id": player.id,
                "nickname": player.nickname
            })
        except Player.DoesNotExist:
            return JsonResponse({"error": "Player not found"}, status=404)


@csrf_exempt
def get_games(request):
    """Получить список всех игр."""
    if request.method == "GET":
        games = list(Game.objects.values())
        return JsonResponse({"games": games}, safe=False)

@csrf_exempt
def get_game(request, game_id):
    """Получить информацию об одной игре."""
    if request.method == "GET":
        try:
            game = Game.objects.get(id=game_id)
            return JsonResponse({
                "id": game.id,
                "name": game.name,
                "code_url": game.code_url,
                "genre": game.genre,
                "picture_url": game.picture_url
            })
        except Game.DoesNotExist:
            return JsonResponse({"error": "Game not found"}, status=404)


@csrf_exempt
def add_game(request):
    """Добавить новую игру."""
    if request.method == "POST":
        data = json.loads(request.body)
        try:
            id = data["id"]
            name = data["name"]
            code_url = data["code"]
            genre = data["genre"]
            picture_url = data["pictures"]
        except KeyError:
            return JsonResponse({"error": "Missing required fields"}, status=400)

        game = Game.objects.create(
            id=id,
            name=name,
            code=code_url,
            genre=genre,
            pictures=picture_url
        )
        return JsonResponse({
            "message": "Game created",
            "game": {
                "id": game.id,
                "name": game.name,
                "code": game.code,
                "genre": game.genre,
                "pictures": game.pictures
            }
        })

@csrf_exempt
def delete_game(request, game_id):
    """Удалить игру."""
    if request.method == "DELETE":
        try:
            game = Game.objects.get(id=game_id)
            game.delete()
            return JsonResponse({"message": "Game deleted"})
        except Game.DoesNotExist:
            return JsonResponse({"error": "Game not found"}, status=404)
        

@csrf_exempt
def create_record(request):
    """Создание нового рекорда игрока."""
    if request.method == "POST":
        data = json.loads(request.body)
        try:
            player_id = data["player_id"]
            game_id = data["game_id"]
            start_time = data["start_time"]  # строка формата ISO (например, "2025-04-04T18:30:00Z")
            end_time = data["end_time"]
            score = data["score"]
        except KeyError:
            return JsonResponse({"error": "player_id and score are required"}, status=400)

        try:
            player = Player.objects.get(id=player_id)
            record = Record.objects.create(player_id=player_id, game_id=game_id, 
                                           start_time=start_time, end_time = end_time, score=score)
            return JsonResponse({
                "message": "Record created",
                "record": {
                    "id": record.id,
                    "player_id": record.player_id,
                    "game_id": record.game_id,
                    "start_time": record.start_time,
                    "end_time": record.end_time,
                    "score": record.score
                }
            })
        except Player.DoesNotExist:
            return JsonResponse({"error": "Player not found"}, status=404)

@csrf_exempt
def update_score(request, player_id, game_id):
    """Обновление score по id записи."""
    if request.method == "PUT":
        data = json.loads(request.body)
        new_score = data.get("score")
        start_time = data.get("start_time")
        end_time = data.get("end_time")

        if new_score is None:
            return JsonResponse({"error": "score is required"}, status=400)

        try:
            record = Record.objects.get(player_id=player_id, game_id=game_id)
            record.score = new_score
            record.start_time = start_time
            record.end_time = end_time
            
            record.save()
            return JsonResponse({
                "message": "Score updated",
                "new_score": record.score
            })
        except Record.DoesNotExist:
            return JsonResponse({"error": "Record not found"}, status=404)

@csrf_exempt
def get_player_record(request, player_id):
    """Вывод рекордов игрока."""
    if request.method == "GET":
        records = Record.objects.filter(player_id=player_id).order_by("-score")
        if not records:
            return JsonResponse({"error": "No records found for this player"}, status=404)

        return JsonResponse({
            "player_id": player_id,
            "records": list(records.values("id", "game_id", "start_time", "end_time", "score")) #добавил три параметра
        })

@csrf_exempt
def get_top_10_records(request, game_id):
    """Топ 10 игроков по рекордам."""
    if request.method == "GET":
        top_records = Record.objects.filter(game_id=game_id).order_by("-score")[:10] #сюда добавил в вывод
        return JsonResponse({
            "top_10": [
                {
                    "record_id": rec.id,
                    "player_id": rec.player.id,
                    "game_id": rec.game_id,
                    "score": rec.score,
                    "start_time": rec.start_time,
                    "end_time": rec.end_time
                } for rec in top_records
            ]
        })

@csrf_exempt
def delete_record(request):
    """Удаление записи рекорда игрока."""
    if request.method == "DELETE":
        data=json.loads(request)
        player_id = data.get["player_id"]
        game_id = data.get["game_id"]
        try:
            record = Record.objects.get(player_id=player_id, game_id=game_id)
            record.delete()
            return JsonResponse({"message": "Record deleted"})
        except Record.DoesNotExist:
            return JsonResponse({"error": "Record not found"}, status=404)


