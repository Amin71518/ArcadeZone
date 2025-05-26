from django.http import HttpResponse, HttpResponseNotFound, Http404, JsonResponse
from django.shortcuts import render, redirect
import json
import logging
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
from .clear_expired_tokens import Command
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import Record
import jwt
from django.conf import settings


@api_view(['POST'])
@permission_classes([AllowAny])
def register_player(request):
    user = request.data.get('user', {})

    serializer = RegistrationSerializer(data=user)
    if serializer.is_valid():
        serializer.save()
        return Response({
            "username": serializer.data["username"],
            "email": serializer.data["email"],
            "token": serializer.data["token"]
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_player(request):
    user = request.data.get('user', {})

    serializer = LoginSerializer(data=user)
    serializer.is_valid(raise_exception=True)

    return Response({
        "username": serializer.data["username"],
        "email": serializer.data["email"],
        "token": serializer.data["token"]
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_player(request):
    # Выход из аккаунта. Добавляем токен в чёрный список.

    serializer = UserSerializer(
        request.user,
        context={'request': request}  # Чтобы передать request внутрь сериализатора
    )
    serializer.logout()

    return Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_player(request):
    # Получение данных текущего авторизованного пользователя.

    serializer = UserSerializer(request.user)
    return Response({
        "username": serializer.data["username"],
        "email": serializer.data["email"],
        "token": serializer.data["token"]
    }, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_current_user(request):
    # Обновление данных текущего авторизованного пользователя.

    serializer_data = request.data.get('user', {})

    serializer = UserSerializer(
        request.user, data=serializer_data, partial=True
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response({
        "username": serializer.data["username"],
        "email": serializer.data["email"],
        "token": serializer.data["token"]
    }, status=status.HTTP_200_OK)



@api_view(['DELETE'])
@permission_classes([IsSuperuser])
def delete_player(request, player_id):
    confirm = request.GET.get('confirm', 'false').lower() == 'true'
    if request.user.id == int(player_id):
        return JsonResponse({"error": "You cannot delete yourself"}, status=403)
    try:
        player = User.objects.get(id=player_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "Player not found"}, status=404)
    records_exist = Record.objects.filter(player_id=player_id).exists()
    if records_exist and not confirm:
        return JsonResponse(
            {"warning": "Player is present in records. Confirm deletion?", "requires_confirmation": True},
            status=409
        )
    if records_exist and confirm:
        Record.objects.filter(player_id=player_id).delete()
    player.delete()
    return JsonResponse({"message": "Player deleted successfully"})



@api_view(['GET'])
@permission_classes([IsSuperuser])
def get_players(request):
    if request.method == "GET":
        players = list(
            User.objects
            .order_by('id')
            .values("email",
                    "username",
                    "id",
                    "last_login",
                    "created_at",
                    "updated_at",
                    "is_superuser"))
        return JsonResponse({"players": players}, safe=False)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_games(request):
    # Получить список всех игр
    if request.method == "GET":
        games = list(Game.objects.values())
        return JsonResponse({"games": games}, safe=False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_last_games(request):
    # Получить последние 3 игры пользователя на основе JWT
    if request.method == "GET":
        try:
            # Извлекаем токен из заголовка Authorization
            auth_header = request.META.get("HTTP_AUTHORIZATION", "")
            if not auth_header.startswith("Token "):
                return JsonResponse({"error": "Invalid token format"}, status=401)

            token = auth_header.split(" ")[1]

            # Декодируем JWT и получаем ID пользователя
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get("id")

            if not user_id:
                return JsonResponse({"error": "Invalid token payload"}, status=401)

            # Получаем последние 3 записи пользователя
            records = list(
                Record.objects
                .filter(player_id=user_id)
                .select_related("game")  # автоматический JOIN
                .order_by("-id")[:3]
                .values(
                    "game__name",  # получаем имя игры через JOIN
                    "start_time",
                    "end_time",
                    "score"
                )
            )

            logging.info(records)

            return JsonResponse({"records": records}, safe=False)

        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "Token has expired"}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({"error": "Invalid token"}, status=401)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_game(request, game_id):
    # Получить информацию об одной игре
    if request.method == "GET":
        try:
            game = Game.objects.get(id=game_id)
            return JsonResponse({
                "id": game.id,
                "name": game.name,
                "code": game.code,
                "genre": game.genre,
                "picture_url": game.pictures
            })
        except Game.DoesNotExist:
            return JsonResponse({"error": "Game not found"}, status=404)



@api_view(['POST'])
@permission_classes([IsSuperuser])
def add_game(request):
    # Добавить новую игру
    if request.method == "POST":
        data = json.loads(request.body)
        try:
            id = data["id"]
            name = data["name"]
            code_url = data["code"]
            genre = data["genre"]
            picture_url = data["pictures"]
        except KeyError:
            return JsonResponse({"error": "Missing required fields", "data": data}, status=400)

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



@api_view(['DELETE'])
@permission_classes([IsSuperuser])
def delete_game(request, game_id):
    confirm = request.GET.get('confirm', 'false').lower() == 'true'
    try:
        game = Game.objects.get(id=game_id)
    except Game.DoesNotExist:
        return JsonResponse({"error": "Game not found"}, status=404)
    
    # Проверка связанных записей
    if not confirm and Record.objects.filter(game=game).exists():
        return JsonResponse(
            {"warning": "Игра присутствует в рекордах. Подтвердите удаление?", "requires_confirmation": True},
            status=409
        )
    
    # Удаление после подтверждения
    if confirm:
        Record.objects.filter(game=game).delete()
    
    game.delete()
    return JsonResponse({"message": "Игра успешно удалена"})



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_record(request):
    logger = logging.getLogger(__name__)
    # Создание нового рекорда игрока. Если рекорд уже есть — обновляется только если новый лучше
    if request.method == "POST":
        data = json.loads(request.body)
        try:
            player_id = data["player_id"]
            game_id = data["game_id"]
            start_time = data["start_time"]
            end_time = data["end_time"]
            score = data["score"]
        except KeyError:
            return JsonResponse({"error": "player_id, game_id, score, start_time и end_time обязательны"}, status=400)

        try:
            player = User.objects.get(id=player_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "Игрок не найден"}, status=404)

        # Проверка существующего рекорда
        existing_record = Record.objects.filter(player_id=player_id, game_id=game_id).first()

        if existing_record:
            if score > existing_record.score:
                existing_record.score = score
                existing_record.start_time = start_time
                existing_record.end_time = end_time
                existing_record.save()
                return JsonResponse({
                    "message": "Рекорд обновлен",
                    "record": {
                        "id": existing_record.id,
                        "player_id": existing_record.player_id,
                        "game_id": existing_record.game_id,
                        "start_time": existing_record.start_time,
                        "end_time": existing_record.end_time,
                        "score": existing_record.score
                    }
                })
            else:
                return JsonResponse({
                    "message": "Новый результат ниже текущего рекорда",
                    "current_score": existing_record.score,
                    "new_score": score
                }, status=200)

        # Рекорда ещё не было — создаём
        record = Record.objects.create(
            player_id=player_id,
            game_id=game_id,
            start_time=start_time,
            end_time=end_time,
            score=score
        )
        return JsonResponse({
            "message": "Рекорд создан",
            "record": {
                "id": record.id,
                "player_id": record.player_id,
                "game_id": record.game_id,
                "start_time": record.start_time,
                "end_time": record.end_time,
                "score": record.score
            }
        })



@api_view(['GET'])
@permission_classes([IsSuperuser])
def get_player_records(request, player_id):
    """Вывод рекордов игрока."""
    if request.method == "GET":
        records = (Record.objects
        .filter(player_id=player_id)
        .order_by("-id")
        .values(
            "player__username",
            "game__name",
            "start_time",
            "end_time",
            "score"
        ))

        print("Records queryset values:", list(records))
        print(repr(player_id), type(player_id))

        if not User.objects.filter(id=player_id).exists():
            return JsonResponse({"error": "A player with such an ID does not exist."}, status=404)

        elif not records:
            return JsonResponse({"error": "No records found for this player"}, status=404)

        return JsonResponse({
            "player_id": player_id,
            "records": list(records)
        })



@api_view(['GET'])
def get_top_10_records(request, game_id):
    """Топ 10 игроков по рекордам."""
    if request.method == "GET":
        top_records = Record.objects.filter(game_id=game_id).order_by("-score")[:10]
        return JsonResponse({
            "top_10": [
                {
                    "record_id": rec.id,
                    "player_name": rec.player.username,
                    "player_id": rec.player.id,
                    "game_id": rec.game_id,
                    "score": rec.score,
                    "start_time": rec.start_time,
                    "end_time": rec.end_time
                } for rec in top_records
            ]
        })



@api_view(['DELETE'])
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_adm(request):
    serializer_data = request.data.get('user', {})
    email = serializer_data.get("email")
    password = serializer_data.get("password")

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'detail': 'Пользователь не найден'}, status=status.HTTP_403_FORBIDDEN)

    # Проверка пароля
    if not user.check_password(password):
        user_data = {
            'email': user.email,
        }
        return Response(user_data, status=status.HTTP_403_FORBIDDEN)

    # Проверка прав
    if not user.is_superuser:
        user.is_staff = True
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
        }
        user.save()
        return Response(user_data, status=status.HTTP_403_FORBIDDEN)

    # Всё ок — возвращаем 200 OK

    return Response({'valid': True}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsSuperuser])
def get_players_staff(request):
    # Получаем всех пользователей, у которых is_superuser == False
    players = User.objects.filter(is_staff=True, is_superuser=False)
    # Формируем список словарей с нужными полями
    players_data = [
        {
            'id': player.id,
            'username': player.username,
            'email': player.email,
            'is_staff': player.is_staff,
            'is_superuser': player.is_superuser
        }
        for player in players
    ]

    return Response(players_data, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsSuperuser])
def makestaff(request, player_id):
    approve = request.data.get('approve')
    try:
        user = User.objects.get(id=player_id)
    except User.DoesNotExist:
        return Response({'detail': 'Пользователь не найден'}, status=404)

    if approve:
        user.is_superuser = True
        user.is_staff = True
    else:
        user.is_staff = False
        user.is_superuser = False
    user.save()
    return Response({'success': True})


@api_view(['GET'])
@permission_classes([IsSuperuser])
def admin_get_player(request, player_id):
    try:
        player = User.objects.get(id=player_id)
        player_data = {
            "id": player.id,
            "username": player.username,
            "email": player.email,
            "is_admin": player.is_superuser,
            "last_login": player.last_login,
            "created_at": player.created_at,
            "updated_at": player.updated_at
        }
    except User.DoesNotExist:
        return JsonResponse({"error": "Игрок с таким ID не найден"}, status=404)
    return Response(player_data, status=status.HTTP_200_OK)
