# 📦 KeyNest

---

## 🇬🇧 English version

### 🔑 What is KeyNest?

**KeyNest** is a lightweight key-value store library for TypeScript with support for:

- **TTL (time-to-live):** automatic record expiration
- **Global cleanup:** remove items not accessed for 2+ hours
- **Events (EventEmitter):** listen to data removal (TTL expiration or cleanup)
- **Generics:** fully typed keys and values

> _A “smart cache” for Node.js, backend apps, or IoT projects._

### 👨‍💻 Who is it for?

- Node.js developers for simple caching or session storage
- Full-stack engineers for temporary data persistence without a database
- IoT/Edge developers to store sensor data temporarily
- API developers to cache responses with TTL

### 🛠 Use cases

| Use Case                        | Description                          |
|----------------------------------|--------------------------------------|
| Caching API responses            | Time-based expiration                |
| Session storage for users        | Temporary persistence                |
| Rate limiting / Throttling       | Request limiting                     |
| IoT devices                      | Temporary storage for sensors        |
| Data with limited lifetime       | Any similar scenario                 |

---

### 🚀 Installation

```sh
npm install keynest
```

---

### 📖 Usage

#### 1. Create a store
```ts
import KNStore from "keynest-store";

const kv = new KNStore<string, number>({
    cleanupEnabled: true,
    cleanupIntervalMs: 1000 * 60 * 60, // 1 hour
    staleThresholdMs: 1000 * 60 * 60 * 2 // 2 hours
});
```

#### 2. Set with TTL
```ts
kv.set("session:123", 42, 5000); // expires in 5 seconds
```

#### 3. Listen for TTL expiration
```ts
kv.on("expired", (key, value) => {
  console.log(`Key=${key} expired due to TTL`);
});
```

#### 4. Listen for global cleanup
```ts
kv.on("prune", (list) => {
  console.log(`Pruned items count: ${list.length}`);
});
```
#### 5. Listen for manual deletion
```ts
kv.on("deleted", (key, value) => {
  console.log(`Запис із ключем ${key} видалено вручну`);
});
```

#### 6. Using with Generics
```ts
interface User {
  id: number;
  name: string;
}

const userStore = new KVStore<string, User>();
userStore.set("u1", { id: 1, name: "Alice" }, 10000);
```

---

### ✅ Advantages

- Simple API (`set`, `get`, `has`, `delete`)
- Automatic data expiration
- Strong typing (Generics)
- Event support
- Lightweight, zero dependencies

---
## 🇺🇦 Українська версія

### 🔑 Що таке KeyNest?

**KeyNest** — легка бібліотека для роботи з key-value сховищем на TypeScript з підтримкою:

- **TTL (time-to-live):** автоматичне видалення даних після вказаного часу
- **Глобальне очищення:** видалення записів, які не використовувалися понад 2 години
- **Події (EventEmitter):** відстеження видалення даних через TTL або глобальне очищення
- **Дженеріки:** повна типізація ключів і значень

> _«Розумний кеш» для веб, бекенду чи IoT-проєктів._

### 👨‍💻 Кому знадобиться?

- Node.js розробникам для кешування або сесійного сховища
- Full-stack інженерам для тимчасового зберігання даних без бази
- IoT/Edge розробникам для збереження даних із сенсорів
- API-фахівцям для кешування відповідей з TTL

### 🛠 Де можна використовувати?

| Сценарій                        | Опис                                 |
|----------------------------------|--------------------------------------|
| Кешування API-відповідей         | Заданий час життя                    |
| Зберігання сесій користувачів    | Тимчасове зберігання                 |
| Rate limiting / Throttle         | Обмеження запитів                    |
| IoT-пристрої                     | Тимчасове сховище для сенсорів       |
| Дані з обмеженим часом життя     | Будь-які подібні сценарії            |

---

### 🚀 Встановлення

```sh
npm install keynest
```

---

### 📖 Використання

#### 1. Створення сховища
```ts
import KNStore from "keynest-store";

const kv = new KNStore<string, number>({
    cleanupEnabled: true,
    cleanupIntervalMs: 1000 * 60 * 60, // 1 година
    staleThresholdMs: 1000 * 60 * 60 * 2 // 2 години
});
```

#### 2. Запис з TTL
```ts
kv.set("session:123", 42, 5000); // 5 секунд
```

#### 3. Події TTL
```ts
kv.on("expired", (key, value) => {
  console.log(`Запис із ключем ${key} видалено через TTL`);
});
```

#### 4. Події глобального очищення
```ts
kv.on("prune", (list) => {
  console.log(`Видалено записів: ${list.length}`);
});
```
#### 5. Події видалення запису
```ts
kv.on("deleted", (key, value) => {
  console.log(`Запис із ключем ${key} видалено вручну`);
});
```

#### 6. Використання з дженеріками
```ts
interface User {
  id: number;
  name: string;
}

const userStore = new KVStore<string, User>();
userStore.set("u1", { id: 1, name: "Alice" }, 10000);
```

---

### ✅ Переваги

- Простий API (`set`, `get`, `has`, `delete`)
- Автоматичне видалення старих даних
- Гнучка типізація (Generics)
- Підтримка подій
- Мінімальний розмір, без зовнішніх залежностей

---

