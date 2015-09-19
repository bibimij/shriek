# Shriek Chat
Yet another chat

# Build workflow (short)
1. `npm install`
2. `gulp`

# Development workflow

## Собрать проект и смотреть на изменения файлов

`gulp`

## Стартовать ноду

`node .`

## Тестирование сервера

1. Установите глобально Mocha: `npm install -g mocha`
2. Стартоните приложение: `node .`
3. В другом окне консоли запустите тесты: `mocha`

# Files structure
* app — основное приложение
  * assets
    * css — файлы, которые получились от склеивания файлов в modules, потом попадают в public/assets/css
      * modules — файлы sass для модулей
    * js — основной файл фронта, гкуда объявляются все инклуды
  * components — внешние компоненты (включено в gitignore)
  * configs — файлы конфига для express
  * controllers — основные js файлы экспресс
  * models — модели для express
  * modules — модули для express
  * views
    * layouts — тут html шаблон страницы, который потом копируются в public/
    * components — react компоненты
* public — все статичные файлы, здесь лежит базовый index.html, который собирается из вьюх
  * assets
    * css
    * js

# Deployment to remote server

## SSH Key for server (on local machine)
1. `ssh-keygen -t rsa`
  * Можно изменить имя файла, но лучше этого не делать. Default: `id_rsa`
  * passphrase не пишите, оставьте пустым
2. `cat ~/.ssh/id_rsa.pub | ssh [user]@[hostname] 'cat >> ~/.ssh/authorized_keys'`
  * `host` и `user` - соответственно адрес сервера и имя юзера на нем

Если все сделано правильно, то выполните:

```bash
ssh [user]@[hostname] "ssh -T git@github.com"
```

Вы должны увидеть такое сообщение:

> Hi `sigorilla`! You've successfully authenticated, but GitHub does not provide shell access.

## PM2

Для удаленного обновления используем NPM пакет `pm2`

1. `npm install -g pm2@latest`
3. `pm2 deploy <environment_key>`, где `environment_key` - либо `develop` (тестирование, разработка), либо `production` (`master` ветка)

## Результат

* Production будет доступна по адресу: [host]
* Development - по адресу: [host]:81

## API
### Description
Все события отправляются с помощью `socket.io`. Если мы хотим получить данные то пишем:

```javascript
socket.on('<name-of-event>', function (data) {
  // work with 'data'
});
```
Для отправки данных:

```javascript
socket.emit('<name-of-event>', data);
```

### Response

##### Success

```json
{
  "status": "ok",
  "<some-data>" : {}
}
```

##### Failed

```json
{
  "status": "error",
  "error_message": "<Error message>"
}
```

### Events

##### `user enter`

Вход/регистрация пользователя

*Input* (`emit`)

| Field | Type | Description |
|-------|------ | -------|
| username | String | Username |
| password | String | Password |

*Output* (`on`)

| Field | Type | Description |
|-------|------ | -------|
| status | String | Status of error |
| user | Object | `user` object from DB (see schema) |

`error_message`:
  * `Пользователь уже вошел`
  * `Неверный пароль`
  * `User validation failed`
  * `Пользователь не найден`

##### `user connected`

Пользователь подсоединился

*Output* (`on`)

| Field | Type | Description |
|-------|------ | -------|
| status | String | Status of error |
| user | Object | `user` object from DB (see schema) |

##### `user leave`

Пользователь вышел

*Input* (`emit`)

| Field | Type | Description |
|-------|------ | -------|

*Output* (`on`)

| Field | Type | Description |
|-------|------ | -------|
| status | String | Status of error |
| user.username | String | Username |

`error_message`:
  * `Пользователь еще не вошел`

##### `user disconnected`

Отсоединение пользователя

*Output* (`on`)

| Field | Type | Description |
|-------|------ | -------|
| status | String | Status of error |
| user.username | String | Username |

##### `user info`

Получить информацию о пользователе

*Input* (`emit`)

| Field | Type | Description |
|-------|------ | -------|
| username | String | Username |

*Output* (`on`)

| Field | Type | Description |
|-------|------ | -------|
| status | String | Status of error |
| user | Object | `user` object from DB (see schema) |

`error_message`:
  * `Пользователь должен войти`
  * `Пользователь не найден`

##### `user list`

Получить список пользователей

*Input* (`emit`)

| Field | Type | Description |
|-------|------ | -------|

*Output* (`on`)

| Field | Type | Description |
|-------|------ | -------|
| status | String | Status of error |
| users | Array | array of `user` objects from DB (see schema) |

`error_message`:
  * `Пользователь должен войти`
  * `Пользователей не найдено`

##### `user start typing`

Пользователь начал печатать

*Input* (`emit`)

| Field | Type | Description |
|-------|------ | -------|

*Output* (`on`)

| Field | Type | Description |
|-------|------ | -------|
| status | String | Status of error |
| user.username | String | Username |

`error_message`:
  * `Пользователь должен войти`
  * `Пользователь уже печатает`

##### `user stop typing`

Пользователь закончил печатать

*Input* (`emit`)

| Field | Type | Description |
|-------|------ | -------|

*Output* (`on`)

| Field | Type | Description |
|-------|------ | -------|
| status | String | Status of error |
| user.username | String | Username |

`error_message`:
  * `Пользователь должен начать печатать`

##### `channel create`

Создание канала

*Input* (`emit`)

| Field | Type | Description |
|-------|------ | -------|
| name | String | Название чата |

*Output* (`on`)

| Field | Type | Description |
|-------|------ | -------|
| status | String | Status of error |
| channel | Object | `channel` object from DB (see schema) |

`error_message`:
  * `Ошибка создания чата`

##### `channel info`

Получение информации о канале

*Input* (`emit`)

| Field | Type | Description |
|-------|------ | -------|
| slug | String | Слаг чата |

*Output* (`on`)

| Field | Type | Description |
|-------|------ | -------|
| status | String | Status of error |
| channel | Object | `channel` object from DB (see schema) |

`error_message`:
  * `Ошибка получения чата`

##### `channel list`

Получение списка каналов

*Input* (`emit`)

| Field | Type | Description |
|-------|------ | -------|

*Output* (`on`)

| Field | Type | Description |
|-------|------ | -------|
| status | String | Status of error |
| channels | Array | array of `channel` objects from DB (see schema) |

`error_message`:
  * `Ошибка получения чата`

##### `channel get`

Получить сообщения из канала

*Input* (`emit`)

| Field | Type | Description |
|-------|------ | -------|
| channel | String | Слаг канала |
| limit | Integer | Кол-во сообщений |
| skip | Integer | Начиная с какого |
| date | ISODate | С какой даты |

*Output* (`on`)

| Field | Type | Description |
|-------|------ | -------|
| status | String | Status of error |
| messages | Array | Array of `message` objects from DB (see schema) |

`error_message`:
  * `Ошибка получения сообщений`

##### `message send`

Отправить сообщение

*Input* (`emit`)

| Field | Type | Description |
|-------|------ | -------|
| username | String | Username |
| text | String | Message |
| channel | String | (optional) Slug of channel, default: `general` |
| type | String | (optional) Type of message, default: `text` |

*Output* (`on`)

| Field | Type | Description |
|-------|------ | -------|
| status | String | Status of error |
| message | Object | `message` object from DB (see schema) |

`error_message`:
  * `Ошибка создания сообщения`

### Schema

##### User

| Field | Type | Other |
|-------|------ | -------|
| username | String | `required`, `unique` |
| hashedPassword | String | `required` |
| salt | String | `required` |
| created_at | ISODate | `default: now` |
| updated_at | ISODate | `default: now` |

`username` from 5 to 29 letters. Only latin letters and underscore (`_`).

`password` from 6 letters.

##### Channel

| Field | Type | Other |
|-------|------ | -------|
| name | String | `required` |
| slug | String | `required`, `unique` |
| created_at | ISODate | `default: now` |
| updated_at | ISODate | `default: now` |

##### Message

| Field | Type | Other |
|-------|------ | -------|
| username | String | `required` |
| channel | String | `required` |
| text | String | `required` |
| type | String | `required` |
| created_at | ISODate | `default: now` |

### Config

Configuration file `config.json` example

```json
{
  "port": 3000,
  "mongoose": {
    "uri": "mongodb://localhost/shriek"
  }
}

```
