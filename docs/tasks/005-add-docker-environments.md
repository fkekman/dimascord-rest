# 005 — Добавить Docker-окружения приложения и PostgreSQL

Родитель: [003](003-initialize-database.md), раздел «Docker и хранение данных».
Статус: реализовано, подготовка к ревью. Зависимость: [004](004-configure-database.md).

Добавить Dockerfile с development/build/production, основной compose.yaml,
явный compose.dev.yaml, healthcheck PostgreSQL 18, постоянный named volume,
изоляцию node_modules и .dockerignore.

Проверки: compose config, сборка и запуск production и development,
GET / в обоих режимах, hot reload, сохранность данных после пересоздания БД,
отсутствие секретов, тестов и dev-зависимостей в production-образе.

Результат: оба образа собраны и запущены, GET / проходит в обоих режимах,
Compose-конфигурации валидны, данные сохранились после пересоздания PostgreSQL.
Production проверен без ts-node, TypeScript, Nest CLI, исходников и тестов.
Проверка hot reload временным изменением исходника исключена по указанию
владельца проекта; исходник не изменён.
