from django.urls import path, re_path, include
from app.views import (
    add_game,  create_record, delete_game, delete_player, delete_record, get_game, 
    get_games, get_player_records, get_top_10_records, register_player, get_players, get_player, update_current_user,
     login_player, logout_player, get_last_games, check_adm, makestaff, get_players_staff, admin_get_player, admin_get_player
)

urlpatterns = [

    
    path('players/register/', register_player, name='register_player'),
    path('players/login/', login_player, name='login_player'),
    path('players/logout/', logout_player, name='logout_player'),
    path("players/", get_players, name="get_players"),
    path("player/", get_player, name="get_player"),
    path("players/<int:player_id>/delete/", delete_player, name="delete_player"),
    path("players/update_player/", update_current_user, name="update_current_user"),
    path("games/", get_games, name="get_games"),
    path("games/last", get_last_games, name="get_last_games"),
    path("games/<int:game_id>/", get_game, name="get_game"),
    path("games/add/", add_game, name="add_game"),
    path("games/<int:game_id>/delete/", delete_game, name="delete_game"),
    path("records/add/", create_record, name="create_record"),
    path("records/player/<int:player_id>/", get_player_records, name="get_player_records"),
    path("records/top/game/<int:game_id>/", get_top_10_records, name="get_top_10_records"),
    path("records/player/<int:player_id>/game/<int:game_id>/delete/", delete_record, name="delete_record"),
    path('admpanel/check-adm/', check_adm, name='check_password'),
    path('admpanel/players/', get_players_staff, name='get_players_staff'),
    path('admpanel/player/<int:player_id>/', makestaff, name='makestaff'),
    path('admpanel/get_player/<int:player_id>/', admin_get_player, name='admin_get_player')
]
