# Dimascord REST API

NestJS 12, TypeORM 0.3 и PostgreSQL 18. Для локальных команд нужны Node.js
26.13.0, npm 11.20.0 и Docker с Compose v2.

## Подготовка окружения

```sh
npm ci
cp .env.example .env
```

`.env` не коммитится и не копируется в Docker-образ. Пример содержит только
демонстрационные реквизиты для локальной разработки. Переменные процесса
имеют приоритет над `.env`, включая пустые значения. Приложение и CLI используют
один загрузчик конфигурации; в Nest значения доступны через `ConfigService`.
Обязательные значения проверяются до подключения, пароли в ошибки не включаются.

| Переменная    | Назначение                           | Пример на хосте            |
| ------------- | ------------------------------------ | -------------------------- |
| `DB_HOST`     | Адрес PostgreSQL                     | `localhost`                |
| `DB_PORT`     | Порт PostgreSQL, целое число 1–65535 | `5432`                     |
| `DB_USER`     | Пользователь PostgreSQL              | `dimascord`                |
| `DB_PASSWORD` | Непустой пароль PostgreSQL           | Значение из `.env.example` |
| `DB_NAME`     | Имя БД                               | `dimascord`                |
| `PORT`        | HTTP-порт, целое число 1–65535       | `3000`                     |

Если порт занят, измените `DB_PORT` или `PORT` в `.env` либо передайте переменную
команде: `DB_PORT=55431 PORT=3003 docker compose up -d --build`.
Внутри Compose приложение всегда использует `postgres:5432`; `DB_PORT` из `.env`
управляет опубликованным портом для хоста. Все команды Compose выполняйте
с одинаковыми переопределениями портов.

## Запуск на хосте

```sh
docker compose up -d --wait postgres
npm run migration:run
npm run start:dev
```

`GET http://localhost:3000/` возвращает `Hello World!`. Для запуска сборки:

```sh
npm run build
npm run start:prod
```

## Docker

Собранное приложение:

```sh
docker compose up -d --build --wait
docker compose exec app npm run migration:run:prod
docker compose logs -f app
docker compose down
```

Разработка с hot reload подключается явно:

```sh
docker compose -f compose.yaml -f compose.dev.yaml up -d --build
docker compose -f compose.yaml -f compose.dev.yaml exec app npm run migration:run
docker compose -f compose.yaml -f compose.dev.yaml logs -f app
docker compose -f compose.yaml -f compose.dev.yaml down
```

Исходники монтируются в контейнер, а `node_modules` хранятся в отдельном named
volume. После изменения зависимостей пересоберите образ и обновите зависимости
в development-volume:

```sh
docker compose -f compose.yaml -f compose.dev.yaml build app
docker compose -f compose.yaml -f compose.dev.yaml run --rm --no-deps app npm ci
docker compose -f compose.yaml -f compose.dev.yaml up -d --force-recreate app
```

Dockerfile содержит цели `development`, `build` и `production`. Production
запускается пользователем `node`, содержит `dist` и runtime-зависимости;
тесты, локальные env и исходники в него не копируются. Приложение ждёт
`pg_isready` перед запуском. PostgreSQL закреплён на `18.3-alpine`.

Рабочие данные хранятся в `dimascord_postgres-data`, смонтированном
в `/var/lib/postgresql` согласно структуре официального образа PostgreSQL 18.
Перезапуск, пересоздание контейнера и обычный `docker compose down` сохраняют
данные. `docker compose down -v` удаляет volumes и данные.
Изменение реквизитов в `.env` **не перенастраивает уже созданный PostgreSQL
volume**: существующих пользователей, пароли и БД меняют средствами PostgreSQL.
Удаление volume подходит только для намеренного сброса локальных данных.

## Миграции

`synchronize` и `migrationsRun` отключены: запуск приложения не меняет схему.
Предметных сущностей и производственных миграций пока нет. TypeORM может создать
свою таблицу истории при явном `migration:run` даже без миграций.

Сущности размещайте в `src/<модуль>/*.entity.ts`, миграции — в
`src/database/migrations/*.ts`. Общая конфигурация находит только `.ts` при работе
из исходников и только `.js` в `dist`, без дублирования и загрузки тестов.
Не размещайте тестовые сущности и миграции в `src`.

```sh
# Пустой шаблон: последний аргумент — путь и имя без расширения.
npm run migration:create -- src/database/migrations/AddUsers

# Разница между сущностями и текущей БД; требует работающую PostgreSQL.
npm run migration:generate -- src/database/migrations/AddUsers

npm run migration:show
npm run migration:run
npm run migration:revert

# Сборка и запуск без ts-node.
npm run build
npm run migration:show:prod
npm run migration:run:prod
npm run migration:revert:prod
```

При отсутствии изменений `migration:generate` сообщает `No changes in database
schema were found` и возвращает код 1 — файл не создаётся. Проверяйте SQL
сгенерированной миграции перед применением. `migration:revert` откатывает
последнюю применённую миграцию; без миграций это пустая операция.

В development-контейнере команды доступны с теми же аргументами:

```sh
docker compose -f compose.yaml -f compose.dev.yaml exec app npm run migration:create -- src/database/migrations/AddUsers
docker compose -f compose.yaml -f compose.dev.yaml exec app npm run migration:generate -- src/database/migrations/AddUsers
docker compose -f compose.yaml -f compose.dev.yaml exec app npm run migration:show
docker compose -f compose.yaml -f compose.dev.yaml exec app npm run migration:run
docker compose -f compose.yaml -f compose.dev.yaml exec app npm run migration:revert
```

После добавления миграций пересоберите production-образ. В production-контейнере
доступны только команды из сборки:

```sh
docker compose exec app npm run migration:show:prod
docker compose exec app npm run migration:run:prod
docker compose exec app npm run migration:revert:prod
```

## Тесты и проверки

```sh
docker compose -f compose.test.yaml up -d --wait
npm run test:all
npm run build
npm run lint
npx tsc --noEmit
npm run format:check
docker compose config --quiet
docker compose -f compose.yaml -f compose.dev.yaml config --quiet
docker compose -f compose.test.yaml config --quiet
docker compose -f compose.test.yaml down
```

Дополнительно после production-сборки можно проверить состав образа и пустой
производственный набор сущностей/миграций:

```sh
docker compose exec -T app node < test/verify-production.cjs
```

Эта проверка рассчитана на начальную схему задачи 003; после добавления
предметных сущностей ожидаемый набор нужно обновить.

По отдельности: `npm test -- --runInBand`, `npm run test:integration`,
`npm run test:e2e -- --runInBand`. Интеграционные и e2e-проверки выполняйте
последовательно, на хосте.

Тестовый Compose — отдельный проект `dimascord-test`, PostgreSQL доступен только
на `127.0.0.1:55432`, хранилище — `tmpfs`, без рабочего volume. Jest задаёт
фиксированные реквизиты `dimascord_test`, не наследуя рабочую конфигурацию БД.
Тестовый DataSource дополнительно отвергает другие реквизиты. Для запуска тестов
не нужно менять `.env`. Тестовую БД не используйте для рабочих данных.

Тестовая миграция существует только в `test/database`. Она проверяет полный цикл
`database_probe`: применение, запись/чтение, статус, повторный запуск и откат.
`finally` дополнительно удаляет таблицу и тестовую историю, проверяет отсутствие
таблицы и закрывает соединения; отдельный тест проверяет этот путь при ошибке.
Тест `GET /` поднимает настоящий DatabaseModule и проверяет закрытие соединения.
При остановке/пересоздании тестового контейнера временные данные теряются.

## Источники решений

- [Интеграция NestJS с TypeORM](https://docs.nestjs.com/data/typeorm.md).
- [Конфигурация NestJS](https://docs.nestjs.com/application/configuration.md).
- [CLI TypeORM](https://typeorm.io/docs/advanced-topics/using-cli/).
- [Официальный образ PostgreSQL и хранение данных](https://hub.docker.com/_/postgres).

Проверены peer dependencies: `@nestjs/typeorm` 12.0.3 поддерживает NestJS 12
и TypeORM 0.3; `@nestjs/config` 12.1.1 поддерживает NestJS 12. Установлены
TypeORM 0.3.31 и pg 8.23.1; точные версии зафиксированы в `package-lock.json`.
