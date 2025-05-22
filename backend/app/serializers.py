from django.utils import timezone
from datetime import timezone as dt_timezone
from django.conf import settings
import jwt
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User, BlackListedToken
from django.contrib.auth import authenticate
from .clear_expired_tokens import Command


class RegistrationSerializer(serializers.ModelSerializer):
    # Сериализация регистрации пользователя и создания нового.

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
        # Использовать метод create_user, который мы
        # написали ранее, для создания нового пользователя.
        return User.objects.create_user(**validated_data)


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

        # Метод validate должен возвращать словать проверенных данных. Это
        # данные, которые передются в т.ч. в методы create и update.
        return {
            'email': user.email,
            'username': user.username,
            'token': user.token
        }


class UserSerializer(serializers.ModelSerializer):
    # Ощуществляет сериализацию и десериализацию объектов User.

    # Пароль должен содержать от 8 до 128 символов. Это стандартное правило. Мы
    # могли бы переопределить это по-своему, но это создаст лишнюю работу для
    # нас, не добавляя реальных преимуществ, потому оставим все как есть.
    password = serializers.CharField(
        max_length=128,
        min_length=8,
        write_only=True,
        required=False  # необязательное поле при обновлении
    )
    current_password = serializers.CharField(
        write_only=True,
        required=True,
    )

    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'current_password', 'token',)

        # Параметр read_only_fields является альтернативой явному указанию поля
        # с помощью read_only = True, как мы это делали для пароля выше.
        # Причина, по которой мы хотим использовать здесь 'read_only_fields'
        # состоит в том, что нам не нужно ничего указывать о поле. В поле
        # пароля требуются свойства min_length и max_length,
        # но это не относится к полю токена.
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

        for key, value in validated_data.items():
            # Для ключей, оставшихся в validated_data мы устанавливаем значения
            # в текущий экземпляр User по одному.
            setattr(instance, key, value)

        if password is not None:
            # 'set_password()' решает все вопросы, связанные с безопасностью
            # при обновлении пароля, потому нам не нужно беспокоиться об этом.
            instance.set_password(password)

        # После того как все было обновлено, мы должны сохранить наш экземпляр
        # User. Стоит отметить, что set_password() не сохраняет модель.
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
        Command.update_blacklist(token_str)

