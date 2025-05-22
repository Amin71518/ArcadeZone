# Импорт модуля admin из библиотеки Django.contrib
from django.contrib import admin
# Импорт модели MyModel из текущего каталога (".")
from .models import User
# Регистрация модели MyModel для административного сайта
""""
admin.site.register(Player)
admin.site.register(Game)
admin.site.register(Record)
"""

admin.site.register(User)
