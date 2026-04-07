import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const HERO_IMG = "https://cdn.poehali.dev/projects/66a18cda-db29-4366-bc2a-646b730b6bd5/files/51dd37f3-f71c-4e39-abd4-5eafdaa5fac0.jpg";
const VOLUNTEER_IMG = "https://cdn.poehali.dev/projects/66a18cda-db29-4366-bc2a-646b730b6bd5/files/c883dd1b-be5e-45f0-b404-21ca8596a285.jpg";
const DOG_IMG = "https://cdn.poehali.dev/projects/66a18cda-db29-4366-bc2a-646b730b6bd5/files/8c499ab9-909f-45d2-b36c-1ec3a76830d7.jpg";

const NAV_LINKS = [
  { id: "home", label: "Главная" },
  { id: "animals", label: "Животные" },
  { id: "news", label: "Новости" },
  { id: "volunteers", label: "Волонтёры" },
  { id: "thanks", label: "Благодарности" },
  { id: "contacts", label: "Контакты" },
];

const ANIMALS = [
  { id: 1, name: "Рыжик", type: "Кот", age: "2 года", status: "Ищет дом", img: HERO_IMG, desc: "Ласковый и игривый, любит людей. Привит, стерилизован." },
  { id: 2, name: "Барон", type: "Пёс", age: "3 года", status: "Ищет дом", img: DOG_IMG, desc: "Добрый и послушный. Знает базовые команды. Привит." },
  { id: 3, name: "Снежок", type: "Кот", age: "1 год", status: "На передержке", img: VOLUNTEER_IMG, desc: "Молодой и активный. Любит играть. Полностью здоров." },
  { id: 4, name: "Дружок", type: "Пёс", age: "5 лет", status: "Ищет дом", img: DOG_IMG, desc: "Спокойный и верный. Отлично ладит с детьми. Привит." },
  { id: 5, name: "Луна", type: "Кошка", age: "4 года", status: "На передержке", img: HERO_IMG, desc: "Нежная и тихая. Любит уют и спокойствие. Стерилизована." },
  { id: 6, name: "Гром", type: "Пёс", age: "2 года", status: "Ищет дом", img: DOG_IMG, desc: "Энергичный и игривый. Нужен активный хозяин. Привит." },
];

const NEWS = [
  { id: 1, date: "5 апреля 2026", title: "Выезд на передержку: спасены 4 котёнка", text: "Наш отряд выехал на вызов и забрал четырёх маленьких котят из подвала жилого дома. Все они здоровы и уже нашли временных хозяев." },
  { id: 2, date: "28 марта 2026", title: "Акция по сбору корма прошла успешно", text: "Благодаря неравнодушным жителям города мы собрали более 200 кг корма для подопечных животных. Огромное спасибо всем участникам!" },
  { id: 3, date: "15 марта 2026", title: "Барсик и Муся нашли постоянный дом", text: "Радостная новость: два наших давних подопечных наконец-то обрели любящих хозяев. Желаем им долгой и счастливой жизни!" },
];

const VOLUNTEERS = [
  { name: "Анна Соколова", role: "Куратор отряда", since: "с 2021 года", icon: "Star" },
  { name: "Михаил Орлов", role: "Ветеринарный куратор", since: "с 2022 года", icon: "Heart" },
  { name: "Дарья Лисова", role: "Координатор передержек", since: "с 2022 года", icon: "Home" },
  { name: "Елена Петрова", role: "SMM и коммуникации", since: "с 2023 года", icon: "MessageCircle" },
  { name: "Игорь Волков", role: "Транспорт и логистика", since: "с 2023 года", icon: "Car" },
  { name: "Наталья Зайцева", role: "Фотограф", since: "с 2024 года", icon: "Camera" },
];

const THANKS = [
  { name: "Ветклиника «Добрые руки»", type: "Партнёр", contribution: "Бесплатная стерилизация животных" },
  { name: "Зоомагазин «Мурка»", type: "Спонсор", contribution: "Ежемесячная поставка корма" },
  { name: "Татьяна Морозова", type: "Меценат", contribution: "Финансовая поддержка лечения" },
  { name: "Городская Дума", type: "Поддержка", contribution: "Предоставление помещения" },
  { name: "Александр Новиков", type: "Волонтёр", contribution: "150 выездов за 3 года" },
  { name: "Семья Красновых", type: "Приёмная семья", contribution: "Взяли под опеку 12 животных" },
];

const DONATIONS = [
  { title: "Лечение Грома", current: 8500, target: 15000, desc: "Операция на лапе" },
  { title: "Корм на апрель", current: 12000, target: 12000, desc: "Ежемесячный сбор" },
  { title: "Вакцинация котят", current: 3200, target: 8000, desc: "Группа из 10 котят" },
];

export default function Index() {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState<number | null>(null);
  const [donationSuccess, setDonationSuccess] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = NAV_LINKS.map(l => document.getElementById(l.id));
      const scrollY = window.scrollY + 100;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = sections[i];
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(NAV_LINKS[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const handleDonate = () => {
    if (donationAmount) {
      setDonationSuccess(true);
      setTimeout(() => setDonationSuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-body">

      {/* NAV */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => scrollTo("home")} className="font-display text-xl font-medium tracking-wide hover:text-accent transition-colors">
            🐾 Лапа помощи
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className={`nav-link text-sm tracking-wide transition-colors ${activeSection === link.id ? "text-accent active" : "text-muted-foreground hover:text-foreground"}`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <button
            className="hidden md:flex items-center gap-2 bg-accent text-accent-foreground text-sm px-5 py-2 rounded-sm hover:opacity-90 transition-opacity font-medium"
            onClick={() => scrollTo("contacts")}
          >
            Помочь
          </button>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Icon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border px-6 py-4 flex flex-col gap-4 animate-fade-in">
            {NAV_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="home" className="pt-16 min-h-screen flex flex-col">
        <div className="flex-1 grid md:grid-cols-2">
          <div className="flex flex-col justify-center px-8 md:px-16 py-20 md:py-32">
            <p className="text-accent text-sm tracking-widest uppercase mb-4 animate-fade-up opacity-0" style={{animationDelay:"0.1s", animationFillMode:"forwards"}}>
              Волонтёрский отряд
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-light leading-tight mb-6 animate-fade-up opacity-0" style={{animationDelay:"0.2s", animationFillMode:"forwards"}}>
              Каждый<br />
              <em className="text-accent">заслуживает</em><br />
              любви
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-md animate-fade-up opacity-0" style={{animationDelay:"0.3s", animationFillMode:"forwards"}}>
              Мы помогаем бездомным кошкам и собакам найти заботливых хозяев. Вместе мы делаем мир добрее.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-up opacity-0" style={{animationDelay:"0.4s", animationFillMode:"forwards"}}>
              <button
                onClick={() => scrollTo("animals")}
                className="bg-accent text-accent-foreground px-8 py-3 text-sm font-medium hover:opacity-90 transition-opacity rounded-sm"
              >
                Найти питомца
              </button>
              <button
                onClick={() => scrollTo("contacts")}
                className="border border-border text-foreground px-8 py-3 text-sm font-medium hover:bg-secondary transition-colors rounded-sm"
              >
                Стать волонтёром
              </button>
            </div>

            <div className="flex gap-10 mt-16 animate-fade-up opacity-0" style={{animationDelay:"0.5s", animationFillMode:"forwards"}}>
              {[["320+", "спасённых животных"], ["48", "постоянных волонтёров"], ["5", "лет работы"]].map(([num, label]) => (
                <div key={label}>
                  <div className="font-display text-3xl font-medium">{num}</div>
                  <div className="text-muted-foreground text-xs mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden min-h-[400px]">
            <img
              src={HERO_IMG}
              alt="Животные"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/20" />
          </div>
        </div>
      </section>

      {/* DONATION BLOCK */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-primary-foreground/60 text-sm tracking-widest uppercase mb-3">Сборы</p>
              <h2 className="font-display text-4xl font-light mb-4">Материальная помощь</h2>
              <p className="text-primary-foreground/70 leading-relaxed">
                Любая сумма имеет значение. Ваша помощь идёт напрямую на лечение, корм и содержание подопечных животных.
              </p>
            </div>
            <div className="space-y-5">
              {DONATIONS.map((d) => {
                const pct = Math.min(100, Math.round((d.current / d.target) * 100));
                return (
                  <div key={d.title}>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="font-medium text-sm">{d.title}</span>
                      <span className="text-primary-foreground/60 text-xs">{d.desc}</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden mb-1" style={{background:"rgba(255,255,255,0.15)"}}>
                      <div className="h-full rounded-full transition-all duration-1000" style={{width:`${pct}%`, background:"hsl(var(--accent))"}} />
                    </div>
                    <div className="flex justify-between text-xs text-primary-foreground/50">
                      <span>{d.current.toLocaleString("ru")} ₽</span>
                      <span>цель {d.target.toLocaleString("ru")} ₽</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10 pt-10 border-t border-white/10">
            <p className="text-primary-foreground/60 text-sm mb-4">Выберите сумму или введите свою:</p>
            <div className="flex flex-wrap gap-3 mb-4">
              {[100, 300, 500, 1000, 2000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setDonationAmount(amount)}
                  className={`px-5 py-2 text-sm border rounded-sm transition-all ${donationAmount === amount ? "bg-accent border-accent text-white" : "border-white/20 text-primary-foreground/70 hover:border-white/40"}`}
                >
                  {amount.toLocaleString("ru")} ₽
                </button>
              ))}
              <input
                type="number"
                placeholder="Другая сумма"
                className="px-4 py-2 text-sm bg-white/10 border border-white/20 rounded-sm text-primary-foreground placeholder:text-primary-foreground/40 w-36 focus:outline-none focus:border-accent"
                onChange={(e) => setDonationAmount(Number(e.target.value))}
              />
            </div>
            <button
              onClick={handleDonate}
              className="bg-accent text-white px-8 py-3 text-sm font-medium hover:opacity-90 transition-opacity rounded-sm"
            >
              {donationSuccess ? "Спасибо! ❤️" : "Пожертвовать"}
            </button>
          </div>
        </div>
      </section>

      {/* ANIMALS */}
      <section id="animals" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-accent text-sm tracking-widest uppercase mb-3">Наши подопечные</p>
            <h2 className="font-display text-4xl md:text-5xl font-light">Животные</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ANIMALS.map((animal, i) => (
              <div
                key={animal.id}
                className="group bg-card rounded-sm overflow-hidden border border-border hover:shadow-md transition-shadow"
                style={{animationDelay:`${i * 0.08}s`}}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={animal.img}
                    alt={animal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display text-xl font-medium">{animal.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-sm ${animal.status === "Ищет дом" ? "bg-accent/10 text-accent" : "bg-secondary text-muted-foreground"}`}>
                      {animal.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-1">{animal.type} · {animal.age}</p>
                  <p className="text-sm leading-relaxed text-foreground/80">{animal.desc}</p>
                  <button className="mt-4 text-accent text-sm font-medium hover:underline transition-all">
                    Взять под опеку →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section id="news" className="py-24 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-accent text-sm tracking-widest uppercase mb-3">Последние события</p>
            <h2 className="font-display text-4xl md:text-5xl font-light">Новости</h2>
          </div>

          <div className="space-y-0">
            {NEWS.map((item) => (
              <article
                key={item.id}
                className="py-8 border-b border-border grid md:grid-cols-[160px_1fr] gap-6 group"
              >
                <time className="text-muted-foreground text-sm pt-1">{item.date}</time>
                <div>
                  <h3 className="font-display text-2xl font-medium mb-3 group-hover:text-accent transition-colors cursor-pointer">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* VOLUNTEERS */}
      <section id="volunteers" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12 md:flex justify-between items-end">
            <div>
              <p className="text-accent text-sm tracking-widest uppercase mb-3">Команда</p>
              <h2 className="font-display text-4xl md:text-5xl font-light">Волонтёры</h2>
            </div>
            <button
              onClick={() => scrollTo("contacts")}
              className="mt-4 md:mt-0 border border-accent text-accent px-6 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-all rounded-sm"
            >
              Присоединиться
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VOLUNTEERS.map((v) => (
              <div
                key={v.name}
                className="p-6 bg-card border border-border rounded-sm hover:border-accent/40 transition-colors"
              >
                <div className="w-10 h-10 bg-accent/10 rounded-sm flex items-center justify-center mb-4">
                  <Icon name={v.icon} fallback="Heart" size={18} className="text-accent" />
                </div>
                <h3 className="font-medium mb-1">{v.name}</h3>
                <p className="text-accent text-sm mb-1">{v.role}</p>
                <p className="text-muted-foreground text-xs">{v.since}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 bg-accent/5 border border-accent/20 rounded-sm">
            <div className="md:flex items-center gap-8">
              <div className="flex-1">
                <h3 className="font-display text-2xl mb-2">Стать частью команды</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Вы можете помочь животным даже без специальных знаний — нужны просто доброе сердце и немного времени. Мы принимаем волонтёров на любой вид помощи.
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
                {["Выгулять собаку", "Временная передержка", "Отвезти к врачу", "Помочь с кормом"].map(tag => (
                  <span key={tag} className="text-xs px-3 py-1 bg-secondary border border-border rounded-sm text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THANKS */}
      <section id="thanks" className="py-24 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-accent text-sm tracking-widest uppercase mb-3">Признательность</p>
            <h2 className="font-display text-4xl md:text-5xl font-light">Благодарности</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {THANKS.map((t) => (
              <div
                key={t.name}
                className="p-6 bg-card border border-border rounded-sm"
              >
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-sm">{t.type}</span>
                <h3 className="font-medium mt-3 mb-2">{t.name}</h3>
                <p className="text-sm text-muted-foreground">{t.contribution}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="font-display text-3xl text-muted-foreground/50 italic">
              "Каждый добрый поступок оставляет след в мире"
            </p>
          </div>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-accent text-sm tracking-widest uppercase mb-3">Связаться с нами</p>
            <h2 className="font-display text-4xl md:text-5xl font-light">Контакты</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              {[
                { icon: "Phone", label: "Телефон", value: "+7 (900) 000-00-00" },
                { icon: "Mail", label: "Email", value: "help@lapapomoshi.ru" },
                { icon: "MapPin", label: "Адрес", value: "ул. Заботы, 1, г. Москва" },
                { icon: "Clock", label: "Приёмные часы", value: "Пн–Пт: 10:00–19:00" },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name={item.icon} fallback="Circle" size={16} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="font-medium">{item.value}</p>
                  </div>
                </div>
              ))}

              <div className="flex gap-3 pt-4">
                {[
                  { icon: "Send", label: "Telegram" },
                  { icon: "MessageCircle", label: "VK" },
                  { icon: "Youtube", label: "YouTube" },
                ].map(s => (
                  <button
                    key={s.label}
                    className="w-10 h-10 border border-border rounded-sm flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
                    title={s.label}
                  >
                    <Icon name={s.icon} fallback="Circle" size={16} />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-sm p-8">
              <h3 className="font-display text-2xl mb-6">Написать нам</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Ваше имя</label>
                  <input
                    type="text"
                    className="w-full border border-border bg-background px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-accent transition-colors"
                    placeholder="Иван Иванов"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Email или телефон</label>
                  <input
                    type="text"
                    className="w-full border border-border bg-background px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-accent transition-colors"
                    placeholder="mail@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Тема</label>
                  <select className="w-full border border-border bg-background px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-accent transition-colors text-foreground">
                    <option>Хочу взять животное</option>
                    <option>Стать волонтёром</option>
                    <option>Помочь материально</option>
                    <option>Сообщить о животном</option>
                    <option>Другое</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Сообщение</label>
                  <textarea
                    rows={4}
                    className="w-full border border-border bg-background px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-accent transition-colors resize-none"
                    placeholder="Расскажите подробнее..."
                  />
                </div>
                <button className="w-full bg-accent text-accent-foreground py-3 text-sm font-medium hover:opacity-90 transition-opacity rounded-sm">
                  Отправить сообщение
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 border-t border-border bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg">🐾 Лапа помощи</span>
            <span className="text-primary-foreground/40 text-sm">Волонтёрский отряд</span>
          </div>
          <div className="flex flex-wrap gap-6 justify-center">
            {NAV_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-primary-foreground/50 text-xs hover:text-primary-foreground/80 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
          <p className="text-primary-foreground/30 text-xs">© 2026 Лапа помощи</p>
        </div>
      </footer>
    </div>
  );
}