from django.utils import timezone
from datetime import timezone as dt_timezone
from django.conf import settings
import jwt
from django.utils.timezone import now
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User, BlackListedToken
from django.contrib.auth import authenticate
from .clear_expired_tokens import Command


class RegistrationSerializer(serializers.ModelSerializer):
    # Убедитесь, что пароль содержит не менее 8 символов, не более 128,
    # и так же что он не может быть прочитан клиентской стороной
    password = serializers.CharField(
        max_length=128,
        min_length=8,
        write_only=True
    )

    # Клиентская сторона не должна иметь возможность отправлять токен вместе с
    # запросом на регистрацию. Сделаем его доступным только на чтение.
    token = serializers.CharField(max_length=255, read_only=True)

    class Meta:
        model = User
        # Перечислить все поля, которые могут быть включены в запрос
        # или ответ, включая поля, явно указанные выше.
        fields = ['email', 'username', 'password', 'token']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        user.last_login = now()
        user.save(update_fields=['last_login'])
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField(max_length=255)
    username = serializers.CharField(max_length=255, read_only=True)
    password = serializers.CharField(max_length=128, write_only=True)
    token = serializers.CharField(max_length=255, read_only=True)

    def validate(self, data):
        # В методе validate мы убеждаемся, что текущий экземпляр
        # LoginSerializer значение valid. В случае входа пользователя в систему
        # это означает подтверждение того, что присутствуют адрес электронной
        # почты и то, что эта комбинация соответствует одному из пользователей.
        email = data.get('email', None)
        password = data.get('password', None)

        # Вызвать исключение, если не предоставлена почта.
        if email is None:
            raise serializers.ValidationError(
                'Требуется email'
            )

        # Вызвать исключение, если не предоставлен пароль.
        if password is None:
            raise serializers.ValidationError(
                'Требуется пароль'
            )

        # Метод authenticate предоставляется Django и выполняет проверку, что
        # предоставленные почта и пароль соответствуют какому-то пользователю в
        # нашей базе данных. Мы передаем email как username, так как в модели
        # пользователя USERNAME_FIELD = email.
        user = authenticate(username=email, password=password)

        # Если пользователь с данными почтой/паролем не найден, то authenticate
        # вернет None. Возбудить исключение в таком случае.
        if user is None:
            raise serializers.ValidationError(
                'Пользователь с таким паролем и email не был найден'
            )

        # Django предоставляет флаг is_active для модели User. Его цель
        # сообщить, был ли пользователь деактивирован или заблокирован.
        # Проверить стоит, вызвать исключение в случае True.
        if not user.is_active:
            raise serializers.ValidationError(
                'Этот пользователь деактивирован'
            )

        user.last_login = now()
        user.save(update_fields=['last_login'])

        # Метод validate должен возвращать словарь проверенных данных. Это
        # данные, которые передаются в т.ч. в методы create и update.
        return {
            'email': user.email,
            'username': user.username,
            'token': user.token
        }


class UserSerializer(serializers.ModelSerializer):
    # Осуществляет сериализацию и десериализацию объектов User.

    # Пароль должен содержать от 8 до 128 символов. Это стандартное правило. Мы
    # могли бы переопределить это по-своему, но это создаст лишнюю работу для
    # нас, не добавляя реальных преимуществ, потому оставим все как есть.
    email = serializers.EmailField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(
        max_length=128,
        min_length=8,
        write_only=True,
        required=False,
        allow_blank=True
    )
    current_password = serializers.CharField(
        write_only=True,
        required=True,
    )

    class Meta:
        model = User
        fields = ('email',
                  'username',
                  'password',
                  'current_password',
                  'token',
                  'created_at',
                  'updated_at',
                  'is_staff',
                  'is_superuser',
                  )
        read_only_fields = ('token',)

    def validate_current_password(self, value):
        user = self.instance
        if not user.check_password(value):
            raise serializers.ValidationError('Неверный текущий пароль.')
        return value

    def update(self, instance, validated_data):
        # Выполняет обновление User.

        validated_data.pop('current_password', None)  # Проверка старого пароля
        password = validated_data.pop('password', None)  # Новый пароль (если имеется)

        email = validated_data.get('email')
        if email == '':
            validated_data.pop('email')

        username = validated_data.get('username')
        if username == '':
            validated_data.pop('username')

        for key, value in validated_data.items():
            setattr(instance, key, value)

        if password is not None and password != '':
            instance.set_password(password)

        instance.save()
        return instance

    def logout(self):
        # Выход пользователя: занести токен в чёрный список.
        request = self.context.get('request')
        if request is None:
            raise serializers.ValidationError('Request context is required.')

        # Достаём токен из заголовков
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            raise serializers.ValidationError('Authorization header missing.')

        # Пример: Authorization: Token <token>
        try:
            token_str = auth_header.split()[1]
        except IndexError:
            raise serializers.ValidationError('Token missing in header.')

        # Заносим токен в Blacklist
        com = Command()
        com.update_blacklist(token_str)
