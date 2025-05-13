from django.urls import path, re_path, include

from app.views import (
    add_game, archive, create_record, delete_game, delete_player, delete_record, game, games_list, get_game, 
    get_games, get_player_record, get_top_10_records, register_player, get_players, get_player, update_current_user,
    update_score, login_player, logout_player
)

urlpatterns = [
    path('', game, name='home'),
    path('list/<int:id>/', games_list),
    re_path(r'^archive/(?P<year>[0-9]{4})', archive),
    
    path('players/register/', register_player, name='register_player'),
    path('players/login/', login_player, name='login_player'),
    path('players/logout/', logout_player, name='logout_player'),
    path("players/", get_players, name="get_players"),
    path("players/", get_player, name="get_player"),
    path("players/delete/", delete_player, name="delete_player"),
    path("players/update_player/", update_current_user, name="update_current_user"),
    path("games/", get_games, name="get_games"),
    path("games/<int:game_id>/", get_game, name="get_game"),
    path("games/add/", add_game, name="add_game"),
    path("games/<int:game_id>/delete/", delete_game, name="delete_game"),
    path("records/add/", create_record, name="create_record"),
    path("records/<int:player_id>/<int:game_id>/update/", update_score, name="update_score"),
    path("records/player/<int:player_id>/<int:game_id>/", get_player_record, name="get_player_record"),
    path("records/top/<int:game_id>/", get_top_10_records, name="get_top_10_records"),
    path("records/<int:player_id>/<int:game_id>/delete/", delete_record, name="delete_record"),
]