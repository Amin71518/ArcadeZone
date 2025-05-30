import datetime
from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone
import jwt
from .models import BlackListedToken
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Удаляет все истекшие токены из BlackListedToken'

    def handle_clear(self, *args, **kwargs):
        expired_tokens = BlackListedToken.objects.filter(expires_at__lt=timezone.now())
        count = expired_tokens.count()
        expired_tokens.delete()

    def update_blacklist(self, token_str):
        """
        Добавляет токен в черный список.
        Если id токена кратен 5, удаляет устаревшие токены.
        """
        payload = jwt.decode(token_str, settings.SECRET_KEY, algorithms=['HS256'])
        # Добавляем новый токен
        new_token = BlackListedToken.objects.create(
            token=token_str,
            expires_at=datetime.datetime.fromtimestamp(payload['exp'])

        )


        # Проверяем кратность id
        if new_token.id % 5 == 0:
            # Удаляем все токены, срок жизни которых истек
            self.handle_clear()
