
CREATE TABLE t_p21863386_volunteer_hands_kine.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO t_p21863386_volunteer_hands_kine.site_settings (key, value) VALUES
  ('site_name', 'Лапа помощи'),
  ('site_tagline', 'Волонтёрский отряд'),
  ('hero_title', 'Каждый заслуживает любви'),
  ('hero_subtitle', 'Мы помогаем бездомным кошкам и собакам найти заботливых хозяев. Вместе мы делаем мир добрее.'),
  ('hero_image', 'https://cdn.poehali.dev/projects/66a18cda-db29-4366-bc2a-646b730b6bd5/files/51dd37f3-f71c-4e39-abd4-5eafdaa5fac0.jpg'),
  ('stat_rescued', '320+'),
  ('stat_volunteers', '48'),
  ('stat_years', '5'),
  ('accent_color', '22 65% 52%'),
  ('contact_phone', '+7 (900) 000-00-00'),
  ('contact_email', 'help@lapapomoshi.ru'),
  ('contact_address', 'ул. Заботы, 1, г. Москва'),
  ('contact_hours', 'Пн–Пт: 10:00–19:00'),
  ('admin_password', 'admin123');

CREATE TABLE t_p21863386_volunteer_hands_kine.animals (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  age TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Ищет дом',
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO t_p21863386_volunteer_hands_kine.animals (name, type, age, status, description, image_url, sort_order) VALUES
  ('Рыжик', 'Кот', '2 года', 'Ищет дом', 'Ласковый и игривый, любит людей. Привит, стерилизован.', 'https://cdn.poehali.dev/projects/66a18cda-db29-4366-bc2a-646b730b6bd5/files/51dd37f3-f71c-4e39-abd4-5eafdaa5fac0.jpg', 1),
  ('Барон', 'Пёс', '3 года', 'Ищет дом', 'Добрый и послушный. Знает базовые команды. Привит.', 'https://cdn.poehali.dev/projects/66a18cda-db29-4366-bc2a-646b730b6bd5/files/8c499ab9-909f-45d2-b36c-1ec3a76830d7.jpg', 2),
  ('Снежок', 'Кот', '1 год', 'На передержке', 'Молодой и активный. Любит играть. Полностью здоров.', 'https://cdn.poehali.dev/projects/66a18cda-db29-4366-bc2a-646b730b6bd5/files/c883dd1b-be5e-45f0-b404-21ca8596a285.jpg', 3),
  ('Дружок', 'Пёс', '5 лет', 'Ищет дом', 'Спокойный и верный. Отлично ладит с детьми. Привит.', 'https://cdn.poehali.dev/projects/66a18cda-db29-4366-bc2a-646b730b6bd5/files/8c499ab9-909f-45d2-b36c-1ec3a76830d7.jpg', 4),
  ('Луна', 'Кошка', '4 года', 'На передержке', 'Нежная и тихая. Любит уют и спокойствие. Стерилизована.', 'https://cdn.poehali.dev/projects/66a18cda-db29-4366-bc2a-646b730b6bd5/files/51dd37f3-f71c-4e39-abd4-5eafdaa5fac0.jpg', 5),
  ('Гром', 'Пёс', '2 года', 'Ищет дом', 'Энергичный и игривый. Нужен активный хозяин. Привит.', 'https://cdn.poehali.dev/projects/66a18cda-db29-4366-bc2a-646b730b6bd5/files/8c499ab9-909f-45d2-b36c-1ec3a76830d7.jpg', 6);

CREATE TABLE t_p21863386_volunteer_hands_kine.news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0
);

INSERT INTO t_p21863386_volunteer_hands_kine.news (title, content, published_at) VALUES
  ('Выезд на передержку: спасены 4 котёнка', 'Наш отряд выехал на вызов и забрал четырёх маленьких котят из подвала жилого дома. Все они здоровы и уже нашли временных хозяев.', '2026-04-05'),
  ('Акция по сбору корма прошла успешно', 'Благодаря неравнодушным жителям города мы собрали более 200 кг корма для подопечных животных. Огромное спасибо всем участникам!', '2026-03-28'),
  ('Барсик и Муся нашли постоянный дом', 'Радостная новость: два наших давних подопечных наконец-то обрели любящих хозяев. Желаем им долгой и счастливой жизни!', '2026-03-15');

CREATE TABLE t_p21863386_volunteer_hands_kine.volunteers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  since_year TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Heart',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0
);

INSERT INTO t_p21863386_volunteer_hands_kine.volunteers (name, role, since_year, icon, sort_order) VALUES
  ('Анна Соколова', 'Куратор отряда', 'с 2021 года', 'Star', 1),
  ('Михаил Орлов', 'Ветеринарный куратор', 'с 2022 года', 'Heart', 2),
  ('Дарья Лисова', 'Координатор передержек', 'с 2022 года', 'Home', 3),
  ('Елена Петрова', 'SMM и коммуникации', 'с 2023 года', 'MessageCircle', 4),
  ('Игорь Волков', 'Транспорт и логистика', 'с 2023 года', 'Car', 5),
  ('Наталья Зайцева', 'Фотограф', 'с 2024 года', 'Camera', 6);

CREATE TABLE t_p21863386_volunteer_hands_kine.thanks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  contribution TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0
);

INSERT INTO t_p21863386_volunteer_hands_kine.thanks (name, type, contribution, sort_order) VALUES
  ('Ветклиника «Добрые руки»', 'Партнёр', 'Бесплатная стерилизация животных', 1),
  ('Зоомагазин «Мурка»', 'Спонсор', 'Ежемесячная поставка корма', 2),
  ('Татьяна Морозова', 'Меценат', 'Финансовая поддержка лечения', 3),
  ('Городская Дума', 'Поддержка', 'Предоставление помещения', 4),
  ('Александр Новиков', 'Волонтёр', '150 выездов за 3 года', 5),
  ('Семья Красновых', 'Приёмная семья', 'Взяли под опеку 12 животных', 6);

CREATE TABLE t_p21863386_volunteer_hands_kine.donations (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  current_amount INT NOT NULL DEFAULT 0,
  target_amount INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0
);

INSERT INTO t_p21863386_volunteer_hands_kine.donations (title, description, current_amount, target_amount, sort_order) VALUES
  ('Лечение Грома', 'Операция на лапе', 8500, 15000, 1),
  ('Корм на апрель', 'Ежемесячный сбор', 12000, 12000, 2),
  ('Вакцинация котят', 'Группа из 10 котят', 3200, 8000, 3);

CREATE TABLE t_p21863386_volunteer_hands_kine.contact_requests (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
