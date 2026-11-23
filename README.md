# Цифровой деканат

Локальный запуск требует PostgreSQL, Python 3.12+ и Node.js.

1. Создайте отдельную пустую базу и роль PostgreSQL для этого приложения.
2. В корне проекта создайте виртуальное окружение и установите зависимости: `uv venv && uv pip install -r backend/requirements.txt`.
3. Задайте `DATABASE_URL=postgresql+psycopg://ROLE:PASSWORD@localhost:5432/DATABASE` в окружении сервера, затем выполните `.venv/bin/python backend/seed.py`. Скрипт создаёт таблицы и печатает пароли новых демо-аккаунтов один раз. Сохраните их вне репозитория.
4. Запустите API: `.venv/bin/uvicorn --app-dir backend main:app --port 8000`.
5. В каталоге frontend выполните `npm install && npm run dev -- --port 5173`. Откройте http://localhost:5173.

Для размещения настройте HTTPS, один origin для фронтенда и API (маршрут /api), APP_ORIGIN с точным HTTPS-адресом и ограничение частоты запросов к /api/login на прокси. БД и API не должны принимать публичные подключения напрямую. Пароли демо-пользователей передаются жюри отдельно.
