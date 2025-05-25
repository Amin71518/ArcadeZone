# Используем официальный Node.js образ для сборки и разработки
FROM node:18-alpine

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json (или pnpm-lock.yaml/yarn.lock, если используете другой менеджер)
COPY package.json ./
COPY package-lock.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы проекта
COPY . .

# Открываем порт для Vite (по умолчанию 5173)
EXPOSE 5173

# Запускаем Vite dev сервер
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]