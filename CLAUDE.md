# CLAUDE.md

Цей файл містить настанови для Claude Code (claude.ai/code) під час роботи з кодом у цьому репозиторії.

## Що це

Односторінковий React-застосунок із пріоритетом мобільних пристроїв (mobile-first): персональний путівник для однієї поїздки до Катанії (Сицилія, 14–22 червня 2026). Увесь контент — українською (власні назви в оригіналі + переклад у дужках). Контент і фото вбудовуються під час збірки; весь стан користувача зберігається у браузері — бекенду, API чи бази даних немає.

## Команди

```bash
npm run dev        # Dev-сервер Vite (типово http://localhost:5173/catania/)
npm run build      # tsc -b (типи через project refs), ПОТІМ vite build → dist/
npm run preview    # локально віддає продакшн-збірку
npm run typecheck  # tsc --noEmit, лише перевірка типів
npm test           # vitest run — повний прогін тестів
npx vitest run src/__tests__/data.test.ts          # один файл
npx vitest run -t "All 46 places have unique IDs"  # один тест за назвою
npx vitest                                          # watch-режим
```

> ⚠️ **Версія Node.** Дефолтний `node` у середовищі — **v12**, застарий для Vite 6 / Vitest 4 (потрібен Node 18+). Через це `npm run dev/build/test` локально падають із `SyntaxError: Cannot use import statement outside a module`. Запускайте через nvm (`nvm use 22`). [.claude/launch.json](.claude/launch.json) уже вказує preview-сервер на абсолютний шлях до Node 22.

`npm run build` — контрольна точка типів (`tsc -b` перед Vite). `npm test` — контрольна точка даних (див. розділ «Тести»). Лінтера немає.

## Розгортання (Deployment)

Пуш у `main` запускає `.github/workflows/deploy.yml`, який збирає та публікує `dist/` на GitHub Pages. Три речі пов'язані між собою і мають лишатися узгодженими:

- `vite.config.ts` задає `base: "/catania/"` — застосунок віддається з цього під-шляху. **Усі URL ресурсів (зокрема локальні фото) мусять мати префікс `/catania/`.** Зміна шляху репозиторію/Pages вимагає зміни `base`.
- `main.tsx` використовує `HashRouter` (а не `BrowserRouter`), щоб клієнтські маршрути працювали на GitHub Pages без серверних перенаправлень. Маршрути мають вигляд `/catania/#/places`.
- У workflow немає кроку тестів/лінту; успішна збірка — єдина перевірка CI. Тож проганяйте `npm test` локально перед пушем.

## Архітектура

### Контент проти стану користувача — центральний поділ

Застосунок побудовано навколо чіткого розділення між **статичним контентом путівника** та **станом користувача на конкретному пристрої**, які поєднуються під час рендерингу за стабільним рядковим `id`.

- **Контент** живе у [src/data/cataniaGuide.ts](src/data/cataniaGuide.ts) як типізовані сталі масиви: `places` (46), `foods`, `events`, плюс `transportFacts` і `auditWarnings`. Сторінки імпортують їх напряму. Щоб додати місце/їжу/подію, додайте типізований об'єкт із новим унікальним `id`; прив'язка стану користувача відбувається автоматично через `id`. (Функція маршруту/«Plan» з `itineraryDays` була прибрана — не повертайте її без потреби.)
- **Стан користувача** — єдиний об'єкт `AppState` (`places`/`foods`/`events` з ключами за `id` контенту, плюс `settings.theme`). Це *єдине*, що зберігається. Картка читає зріз через `state.places[place.id]` і записує через функції оновлення з контексту.

Типи для обох частин — у [src/types/guide.ts](src/types/guide.ts). Значення `PlaceCategory` — **українські рядки** (`"Історичне ядро"`, `"Узбережжя"`…), тож новий контент використовує саме ці літерали. `AppState.version` дорівнює `2`.

### Фото місць — локальні файли + `realPhotos`-оверрайд

Це найменш очевидна частина; читайте уважно перед правками фото.

- Кожне місце має `images: GuideImage[]`, які показує компонент-галерея [src/components/PhotoCarousel.tsx](src/components/PhotoCarousel.tsx).
- **Фактичне джерело фото — мапа `realPhotos`** (ключ — `id` місця) у кінці [src/data/cataniaGuide.ts](src/data/cataniaGuide.ts), а одразу після масиву `places` цикл `places.forEach(... place.images = realPhotos[place.id])` **перекриває** інлайнові `images:` у картках. Тобто щоб змінити фото — редагуйте `realPhotos`, а не тіла місць.
- Фото — **локальні файли** у `public/images/places/<id>.jpg`, на які посилаються через префікс бази: `"/catania/images/places/<id>.jpg"`. **Жодних віддалених URL** (Wikimedia/Unsplash) — тести це забороняють (локальні шляхи кешуються в `dist/`, працюють офлайн, без rate-limit).
- Конвеєр джерел фото — у `scripts/` (Python): `fetch_photos.py` шукає кандидатів через Commons API, `download_images.py` завантажує локально, `verify_images.py`/`check_urls.py` перевіряють. Перезапускайте, щоб оновити/додати фото.

### Сховище стану, валідація та міграція

- [src/hooks/useGuideState.tsx](src/hooks/useGuideState.tsx) визначає `GuideProvider` (монтується раз у `main.tsx`) і хук `useGuide()` — єдине джерело істини для стану. Усі мутації йдуть через типізовані методи (`updatePlace`, `updateFood`, `updateEvent`, `setTheme`, `importState`, `resetState`) — ніколи не мутуйте стан напряму. Кожна проходить через `withTimestamp` (`updatedAt`/`lastUpdatedAt`).
- `PlaceUserState` має не лише `status`/`favorite`/`rating`/`note`, а й прапорці досвіду `seen`/`eaten`/`swum`/`sunset`/`revisit` (тогли «Особистий досвід» у [PlaceCard](src/components/PlaceCard.tsx)).
- [src/hooks/useLocalStorage.ts](src/hooks/useLocalStorage.ts) — generic-хук, що зберігає під ключем `STORAGE_KEY` (`catania-guide-2026-state-v1`) і дає `storageError` (показується в шапці) при переповненні/недоступності сховища.
- **Усі зовнішні дані валідуються.** `validateAppState` + `sanitize*` захисно перебудовують стан із недовірених джерел (`localStorage` *та* імпортованого JSON): відкидають невідомі ключі, обмежують рейтинги 1–5, приймають `version` `1` **і** `2` та **мігрують v1→v2**. Тримайте цей шар синхронним зі змінами форми `AppState` (це покрито тестами в `guideState.test.ts`).
- **Імпорт/експорт** ([src/pages/MemoriesPage.tsx](src/pages/MemoriesPage.tsx)) серіалізує весь `AppState` у JSON і читає назад через `importState` → `validateAppState`. Це єдиний бекап, тож форма експорту й валідатор мають збігатися.

### Маршрутизація та оболонка

[src/App.tsx](src/App.tsx) оголошує чотири маршрути — Home, Places, Food, Memories — з перенаправленням решти на `/`. [src/components/AppShell.tsx](src/components/AppShell.tsx) обгортає кожну сторінку: липка шапка з перемикачем теми, нижня панель вкладок (мобільні) і бічна панель (десктоп), обидві з масиву `tabs` (Огляд / Місця / Їжа / Мій список). Сторінки — у `src/pages/`, перевикористовувані картки/контроли — у `src/components/`.

### Тема

Три режими (`system` / `light` / `dark`) у `AppState.settings.theme`. `GuideProvider` визначає `system` за `prefers-color-scheme`, перемикає клас `dark` на `<html>` і переобчислює при зміні теми ОС. Tailwind має `darkMode: "class"`, тож кожен стилізований елемент потребує явних `dark:`.

## Тести

Vitest, тести в [src/\_\_tests\_\_/](src/__tests__/). Вони — **захист цілісності даних і фактів**, а не лише коду; редагуючи контент, тримайте їх зеленими:

- `data.test.ts`: рівно 46 місць з унікальними `id`; **усі фото — локальні `/catania/images/…`, без віддалених URL**; кожен `id` місця має запис у `realPhotos` і навпаки; повнота обов'язкових полів; коректність подій (немає фестивалю Gualtieri Sicaminò; дати Taobuk `18–22 червня 2026`); і **конкретні транзитні факти** (AMTS 434 для Riviera dei Ciclopi; Interbus/Etna Trasporti/Pirandello для Таорміни; AST для Етни/Ното; Galatea metro + Catania Europa для Li Cuti). Це навмисні «запобіжники» проти повернення хибної інформації.
- `guideState.test.ts`: `validateAppState` (невалідний вхід → дефолт, валідний v2, **міграція v1→v2**, санітизація пошкоджених станів).

## Домовленості (Conventions)

- **Стилізація** — лише Tailwind, із семантичною палітрою Катанії у [tailwind.config.ts](tailwind.config.ts): `ink` (нейтральні), `lava` (помаранчево-червоний Етни), `ionian` (бірюза моря), `citrus`, `basil`. Віддавайте перевагу цим токенам і кастомним `rounded-card` / `shadow-soft`. Кастомні утиліти (`tap-highlight`, `no-scrollbar`, `image-scrim`) — у [src/styles.css](src/styles.css).
- **Mobile-first і доступність**: зони натискання ≥44px (`button { min-height: 44px }` глобально, плюс `min-h-11`/`min-h-12`), іконки `aria-hidden`, контроли з `sr-only`-підписами / `role`+`aria-checked`.
- Компоненти — іменовані експорти; `App` — єдиний default export.
- Контент ретельно курований і прив'язаний до дат: місця/події мають `confidence` (`verified official` / `traditional recurring` / `needs local check`; у UI показується лише м'яке «Уточни на місці» для `needs local check`), а `auditWarnings`/`transportFacts` кодують реальні обмеження (ціни, вікна фестивалів, транзит, проміжок 14–22 червня). Сприймайте це як факти, які треба зберегти, а не вигадувати — `deep-research-report (1).md` і `deep-research-report (2).md` у корені є першоджерелами.
