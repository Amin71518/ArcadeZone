from django.http import HttpResponse, HttpResponseNotFound, Http404, JsonResponse
from django.shortcuts import render, redirect
import json
from django.contrib.auth.hashers import make_password
from django.views.decorators.csrf import csrf_exempt
from .models import User, Record, Game
from django.utils import timezone
from .renderers import UserJSONRenderer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegistrationSerializer, LoginSerializer, UserSerializer
from arcadezonedb.permissions import IsSuperuser


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



@api_view(['POST'])
@permission_classes([AllowAny])
def register_player(request):
    user = request.data.get('user', {})

    serializer = RegistrationSerializer(data=user)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_player(request):
    """
    Авторизация игрока.
    """
    user = request.data.get('user', {})

    serializer = LoginSerializer(data=user)
    serializer.is_valid(raise_exception=True)

    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_player(request):
    """
    Выход из аккаунта. Добавляем токен в чёрный список.
    """
    serializer = UserSerializer(
        request.user,
        context={'request': request}  # Чтобы передать request внутрь сериализатора
    )
    serializer.logout()

    return Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_player(request):
    """
    Получение данных текущего авторизованного пользователя.
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_current_user(request):
    """
    Обновление данных текущего авторизованного пользователя.
    """
    serializer_data = request.data.get('user', {})

    serializer = UserSerializer(
        request.user, data=serializer_data, partial=True
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(serializer.data, status=status.HTTP_200_OK)

@csrf_exempt
@permission_classes([IsSuperuser])
def delete_player(request, player_id):
    if request.method == "DELETE":
        try:
            player = User.objects.get(id=player_id)
            player.delete()
            return JsonResponse({"message": "Player deleted successfully"})
        except User.DoesNotExist:
            return JsonResponse({"error": "Player not found"}, status=404)

@csrf_exempt
@permission_classes([IsSuperuser])
def get_players(request):
    if request.method == "GET":
        players = list(User.objects.values())
        return JsonResponse({"players": players}, safe=False)

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
                "code_url": game.code,
                "genre": game.genre,
                "picture_url": game.pictures
            })
        except Game.DoesNotExist:
            return JsonResponse({"error": "Game not found"}, status=404)


@csrf_exempt
@permission_classes([IsSuperuser])
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
@permission_classes([IsSuperuser])
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
@permission_classes([IsAuthenticated])
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
            player = User.objects.get(id=player_id)
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
        except User.DoesNotExist:
            return JsonResponse({"error": "Player not found"}, status=404)

@csrf_exempt
@permission_classes([IsSuperuser])
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
@permission_classes([IsSuperuser])
def get_player_record(request, player_id, game_id):
    """Вывод рекордов игрока."""
    if request.method == "GET":
        records = Record.objects.filter(player_id=player_id, game_id=game_id).order_by("-score")
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
@permission_classes([IsSuperuser])
def delete_record(request, player_id, game_id):
    """Удаление записи рекорда игрока."""
    if request.method == "DELETE":
        try:
            record = Record.objects.get(player_id=player_id, game_id=game_id)
            record.delete()
            return JsonResponse({"message": "Record deleted"})
        except Record.DoesNotExist:
            return JsonResponse({"error": "Record not found"}, status=404)

