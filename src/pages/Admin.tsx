import { useState, useEffect, useRef } from "react";
import { adminFetch, adm } from "@/lib/api";
import Icon from "@/components/ui/icon";

type Section = "settings" | "animals" | "news" | "volunteers" | "thanks" | "donations" | "contacts";

const SECTIONS: { id: Section; label: string; icon: string }[] = [
  { id: "settings", label: "Настройки сайта", icon: "Settings" },
  { id: "animals", label: "Животные", icon: "PawPrint" },
  { id: "news", label: "Новости", icon: "Newspaper" },
  { id: "volunteers", label: "Волонтёры", icon: "Users" },
  { id: "thanks", label: "Благодарности", icon: "Heart" },
  { id: "donations", label: "Сборы", icon: "HandCoins" },
  { id: "contacts", label: "Заявки", icon: "Mail" },
];

function Toast({ msg, type, onClose }: { msg: string; type: "ok" | "err"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-sm text-sm font-medium shadow-lg animate-fade-in ${type === "ok" ? "bg-green-600 text-white" : "bg-red-500 text-white"}`}>
      {msg}
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(!!localStorage.getItem("admin_token"));
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [section, setSection] = useState<Section>("settings");
  const [data, setData] = useState<object[] | Record<string, string>>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const notify = (msg: string, type: "ok" | "err" = "ok") => setToast({ msg, type });

  const login = async () => {
    const res = await fetch(`https://functions.poehali.dev/919ce08a-4375-4282-82a4-bb0f2a187f4c?route=login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).then((r) => r.json());
    if (res.ok) {
      localStorage.setItem("admin_token", res.token);
      setAuthed(true);
    } else {
      setLoginErr("Неверный пароль");
    }
  };

  const logout = () => { localStorage.removeItem("admin_token"); setAuthed(false); };

  const load = async (s: Section) => {
    setLoading(true);
    setEditItem(null);
    try {
      const res = await adminFetch(s);
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (authed) load(section); }, [authed, section]);

  const save = async (item: Record<string, unknown>) => {
    const isNew = !item.id;
    await adminFetch(section, isNew ? "POST" : "PUT", item);
    notify(isNew ? "Добавлено" : "Сохранено");
    setEditItem(null);
    load(section);
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить запись?")) return;
    await adminFetch(section, "DELETE", { id });
    notify("Удалено");
    load(section);
  };

  const markRead = async (id: number) => {
    await adminFetch("contacts", "PUT", { id });
    load(section);
  };

  const saveSettings = async () => {
    await adminFetch("settings", "POST", data as Record<string, string>);
    notify("Настройки сохранены");
  };

  const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        const token = localStorage.getItem("admin_token") || "";
        const res = await fetch(`https://functions.poehali.dev/919ce08a-4375-4282-82a4-bb0f2a187f4c?route=upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Admin-Token": token },
          body: JSON.stringify({ file: base64, type: file.type }),
        }).then((r) => r.json());
        if (res.url) resolve(res.url);
        else reject("Ошибка загрузки");
      };
      reader.readAsDataURL(file);
    });
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-sm bg-card border border-border rounded-sm p-8">
          <div className="text-center mb-8">
            <div className="text-2xl mb-1">🐾</div>
            <h1 className="font-display text-2xl font-light">Вход в панель</h1>
            <p className="text-muted-foreground text-sm mt-1">Лапа помощи — администратор</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
                className="w-full border border-border bg-background px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-accent"
                placeholder="Введите пароль"
                autoFocus
              />
              {loginErr && <p className="text-red-500 text-xs mt-1">{loginErr}</p>}
            </div>
            <button onClick={login} className="w-full bg-accent text-accent-foreground py-3 text-sm font-medium hover:opacity-90 rounded-sm">
              Войти
            </button>
          </div>
          <p className="text-center text-muted-foreground text-xs mt-6">По умолчанию: admin123</p>
        </div>
      </div>
    );
  }

  const rows = Array.isArray(data) ? data as Record<string, unknown>[] : [];
  const settings = (!Array.isArray(data) ? data : {}) as Record<string, string>;

  const ANIMAL_STATUSES = ["Ищет дом", "На передержке", "Нашёл дом"];
  const ICONS = ["Heart", "Star", "Home", "MessageCircle", "Car", "Camera", "Users", "Phone", "Mail"];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary text-primary-foreground flex flex-col transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:relative md:flex`}>
        <div className="p-6 border-b border-white/10">
          <div className="font-display text-lg">🐾 Лапа помощи</div>
          <div className="text-primary-foreground/50 text-xs mt-1">Панель управления</div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSection(s.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${section === s.id ? "bg-white/10 text-white" : "text-primary-foreground/60 hover:text-white hover:bg-white/5"}`}
            >
              <Icon name={s.icon} fallback="Circle" size={16} />
              {s.label}
              {s.id === "contacts" && Array.isArray(data) && section === "contacts" && rows.filter((r) => !r.is_read).length > 0 && (
                <span className="ml-auto bg-accent text-white text-xs px-1.5 py-0.5 rounded-full">
                  {rows.filter((r) => !r.is_read).length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={logout} className="w-full flex items-center gap-2 text-primary-foreground/50 hover:text-white text-sm transition-colors px-3 py-2">
            <Icon name="LogOut" size={14} />
            Выйти
          </button>
          <a href="/" target="_blank" className="w-full flex items-center gap-2 text-primary-foreground/50 hover:text-white text-sm transition-colors px-3 py-2 mt-1">
            <Icon name="ExternalLink" size={14} />
            Открыть сайт
          </a>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="h-14 border-b border-border flex items-center px-6 gap-4 bg-card">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Icon name="Menu" size={20} />
          </button>
          <h2 className="font-medium text-sm">{SECTIONS.find((s) => s.id === section)?.label}</h2>
          <div className="ml-auto flex items-center gap-3">
            {section !== "settings" && section !== "contacts" && (
              <button
                onClick={() => setEditItem({})}
                className="flex items-center gap-2 bg-accent text-accent-foreground text-xs px-4 py-2 rounded-sm hover:opacity-90"
              >
                <Icon name="Plus" size={14} />
                Добавить
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Загрузка...</div>
          ) : (

            /* SETTINGS */
            section === "settings" ? (
              <div className="max-w-2xl space-y-6">
                <div className="bg-card border border-border rounded-sm p-6">
                  <h3 className="font-medium mb-4 text-sm uppercase tracking-wide text-muted-foreground">Основное</h3>
                  <div className="space-y-4">
                    {[
                      { key: "site_name", label: "Название сайта" },
                      { key: "site_tagline", label: "Подзаголовок" },
                      { key: "hero_title", label: "Заголовок главного экрана" },
                      { key: "hero_subtitle", label: "Описание главного экрана" },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>
                        <input
                          type="text"
                          value={settings[key] || ""}
                          onChange={(e) => setData({ ...settings, [key]: e.target.value })}
                          className="w-full border border-border bg-background px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-accent"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Фоновое изображение (hero)</label>
                      <div className="flex gap-3 items-start">
                        <input
                          type="text"
                          value={settings["hero_image"] || ""}
                          onChange={(e) => setData({ ...settings, hero_image: e.target.value })}
                          className="flex-1 border border-border bg-background px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-accent"
                          placeholder="URL изображения"
                        />
                        <button
                          onClick={() => fileRef.current?.click()}
                          className="border border-border px-3 py-2.5 text-xs rounded-sm hover:bg-secondary whitespace-nowrap flex items-center gap-1.5"
                        >
                          <Icon name="Upload" size={13} />
                          Загрузить
                        </button>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            notify("Загружаю...", "ok");
                            try {
                              const url = await uploadImage(file);
                              setData({ ...settings, hero_image: url });
                              notify("Изображение загружено");
                            } catch {
                              notify("Ошибка загрузки", "err");
                            }
                          }}
                        />
                      </div>
                      {settings["hero_image"] && (
                        <img src={settings["hero_image"]} alt="" className="mt-2 h-24 w-40 object-cover rounded-sm border border-border" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-sm p-6">
                  <h3 className="font-medium mb-4 text-sm uppercase tracking-wide text-muted-foreground">Статистика</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { key: "stat_rescued", label: "Спасено животных" },
                      { key: "stat_volunteers", label: "Волонтёров" },
                      { key: "stat_years", label: "Лет работы" },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>
                        <input
                          type="text"
                          value={settings[key] || ""}
                          onChange={(e) => setData({ ...settings, [key]: e.target.value })}
                          className="w-full border border-border bg-background px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-accent text-center font-display text-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-sm p-6">
                  <h3 className="font-medium mb-4 text-sm uppercase tracking-wide text-muted-foreground">Контакты</h3>
                  <div className="space-y-4">
                    {[
                      { key: "contact_phone", label: "Телефон" },
                      { key: "contact_email", label: "Email" },
                      { key: "contact_address", label: "Адрес" },
                      { key: "contact_hours", label: "Часы работы" },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>
                        <input
                          type="text"
                          value={settings[key] || ""}
                          onChange={(e) => setData({ ...settings, [key]: e.target.value })}
                          className="w-full border border-border bg-background px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-accent"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-sm p-6">
                  <h3 className="font-medium mb-4 text-sm uppercase tracking-wide text-muted-foreground">Безопасность</h3>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Пароль администратора</label>
                    <input
                      type="password"
                      value={settings["admin_password"] || ""}
                      onChange={(e) => setData({ ...settings, admin_password: e.target.value })}
                      className="w-full border border-border bg-background px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <button onClick={saveSettings} className="bg-accent text-accent-foreground px-8 py-3 text-sm font-medium hover:opacity-90 rounded-sm">
                  Сохранить настройки
                </button>
              </div>

            /* CONTACTS */
            ) : section === "contacts" ? (
              <div className="space-y-3 max-w-3xl">
                {rows.length === 0 && <p className="text-muted-foreground text-sm">Заявок пока нет</p>}
                {rows.map((r) => (
                  <div key={r.id as number} className={`bg-card border rounded-sm p-5 ${!r.is_read ? "border-accent/40" : "border-border"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {!r.is_read && <span className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />}
                          <span className="font-medium text-sm">{r.name as string}</span>
                          <span className="text-muted-foreground text-xs">· {r.contact as string}</span>
                        </div>
                        <p className="text-accent text-xs mb-2">{r.subject as string}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{r.message as string}</p>
                        <p className="text-muted-foreground/50 text-xs mt-2">{new Date(r.created_at as string).toLocaleString("ru")}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {!r.is_read && (
                          <button onClick={() => markRead(r.id as number)} className="text-xs border border-border px-3 py-1.5 rounded-sm hover:bg-secondary">
                            Прочитано
                          </button>
                        )}
                        <button onClick={() => remove(r.id as number)} className="text-red-400 hover:text-red-600 p-1.5">
                          <Icon name="Trash2" size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            /* TABLE SECTIONS */
            ) : (
              <div>
                <div className="space-y-2 max-w-4xl">
                  {rows.length === 0 && <p className="text-muted-foreground text-sm">Записей нет. Нажмите «Добавить».</p>}
                  {rows.map((r) => (
                    <div key={r.id as number} className={`bg-card border border-border rounded-sm p-4 flex items-center gap-4 ${!r.is_active ? "opacity-50" : ""}`}>
                      {r.image_url && (
                        <img src={r.image_url as string} alt="" className="w-12 h-12 object-cover rounded-sm flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {(r.name || r.title) as string}
                        </div>
                        <div className="text-muted-foreground text-xs truncate mt-0.5">
                          {section === "animals" && `${r.type} · ${r.age} · ${r.status}`}
                          {section === "news" && (r.content as string)?.slice(0, 80)}
                          {section === "volunteers" && `${r.role} · ${r.since_year}`}
                          {section === "thanks" && `${r.type} · ${r.contribution}`}
                          {section === "donations" && `${(r.current_amount as number).toLocaleString("ru")} / ${(r.target_amount as number).toLocaleString("ru")} ₽`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setEditItem(r)}
                          className="text-xs border border-border px-3 py-1.5 rounded-sm hover:bg-secondary"
                        >
                          Изменить
                        </button>
                        <button onClick={() => remove(r.id as number)} className="text-red-400 hover:text-red-600 p-1.5">
                          <Icon name="Trash2" size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </main>
      </div>

      {/* EDIT MODAL */}
      {editItem !== null && section !== "settings" && section !== "contacts" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-card border border-border rounded-sm w-full max-w-lg p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl">{editItem.id ? "Редактировать" : "Добавить"}</h3>
              <button onClick={() => setEditItem(null)}><Icon name="X" size={18} /></button>
            </div>

            <div className="space-y-4">
              {/* ANIMALS */}
              {section === "animals" && (
                <>
                  <Field label="Имя" value={editItem.name as string} onChange={(v) => setEditItem({ ...editItem, name: v })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Вид (Кот/Кошка/Пёс)" value={editItem.type as string} onChange={(v) => setEditItem({ ...editItem, type: v })} />
                    <Field label="Возраст" value={editItem.age as string} onChange={(v) => setEditItem({ ...editItem, age: v })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Статус</label>
                    <select
                      value={(editItem.status as string) || "Ищет дом"}
                      onChange={(e) => setEditItem({ ...editItem, status: e.target.value })}
                      className="w-full border border-border bg-background px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-accent"
                    >
                      {ANIMAL_STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <FieldArea label="Описание" value={editItem.description as string} onChange={(v) => setEditItem({ ...editItem, description: v })} />
                  <ImageField
                    label="Фото"
                    value={editItem.image_url as string}
                    onChange={(v) => setEditItem({ ...editItem, image_url: v })}
                    onUpload={uploadImage}
                    onToast={notify}
                  />
                  <Toggle label="Показывать на сайте" value={editItem.is_active !== false} onChange={(v) => setEditItem({ ...editItem, is_active: v })} />
                </>
              )}

              {/* NEWS */}
              {section === "news" && (
                <>
                  <Field label="Заголовок" value={editItem.title as string} onChange={(v) => setEditItem({ ...editItem, title: v })} />
                  <FieldArea label="Текст новости" value={editItem.content as string} onChange={(v) => setEditItem({ ...editItem, content: v })} />
                  <Field label="Дата (YYYY-MM-DD)" value={editItem.published_at ? String(editItem.published_at).slice(0, 10) : ""} onChange={(v) => setEditItem({ ...editItem, published_at: v })} />
                  <Toggle label="Показывать на сайте" value={editItem.is_active !== false} onChange={(v) => setEditItem({ ...editItem, is_active: v })} />
                </>
              )}

              {/* VOLUNTEERS */}
              {section === "volunteers" && (
                <>
                  <Field label="Имя" value={editItem.name as string} onChange={(v) => setEditItem({ ...editItem, name: v })} />
                  <Field label="Роль" value={editItem.role as string} onChange={(v) => setEditItem({ ...editItem, role: v })} />
                  <Field label="Участвует с (напр. с 2021 года)" value={editItem.since_year as string} onChange={(v) => setEditItem({ ...editItem, since_year: v })} />
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Иконка</label>
                    <select
                      value={(editItem.icon as string) || "Heart"}
                      onChange={(e) => setEditItem({ ...editItem, icon: e.target.value })}
                      className="w-full border border-border bg-background px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-accent"
                    >
                      {ICONS.map((ic) => <option key={ic}>{ic}</option>)}
                    </select>
                  </div>
                  <Toggle label="Показывать на сайте" value={editItem.is_active !== false} onChange={(v) => setEditItem({ ...editItem, is_active: v })} />
                </>
              )}

              {/* THANKS */}
              {section === "thanks" && (
                <>
                  <Field label="Имя / Организация" value={editItem.name as string} onChange={(v) => setEditItem({ ...editItem, name: v })} />
                  <Field label="Тип (Партнёр / Спонсор / Волонтёр / ...)" value={editItem.type as string} onChange={(v) => setEditItem({ ...editItem, type: v })} />
                  <Field label="Вклад" value={editItem.contribution as string} onChange={(v) => setEditItem({ ...editItem, contribution: v })} />
                  <Toggle label="Показывать на сайте" value={editItem.is_active !== false} onChange={(v) => setEditItem({ ...editItem, is_active: v })} />
                </>
              )}

              {/* DONATIONS */}
              {section === "donations" && (
                <>
                  <Field label="Название сбора" value={editItem.title as string} onChange={(v) => setEditItem({ ...editItem, title: v })} />
                  <Field label="Описание" value={editItem.description as string} onChange={(v) => setEditItem({ ...editItem, description: v })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Собрано ₽" value={String(editItem.current_amount ?? 0)} onChange={(v) => setEditItem({ ...editItem, current_amount: parseInt(v) || 0 })} type="number" />
                    <Field label="Цель ₽" value={String(editItem.target_amount ?? 0)} onChange={(v) => setEditItem({ ...editItem, target_amount: parseInt(v) || 0 })} type="number" />
                  </div>
                  <Toggle label="Показывать на сайте" value={editItem.is_active !== false} onChange={(v) => setEditItem({ ...editItem, is_active: v })} />
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => save(editItem)} className="flex-1 bg-accent text-accent-foreground py-2.5 text-sm font-medium rounded-sm hover:opacity-90">
                Сохранить
              </button>
              <button onClick={() => setEditItem(null)} className="px-5 border border-border text-sm rounded-sm hover:bg-secondary">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border bg-background px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-accent"
      />
    </div>
  );
}

function FieldArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>
      <textarea
        rows={3}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border bg-background px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-accent resize-none"
      />
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-colors relative ${value ? "bg-accent" : "bg-border"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function ImageField({ label, value, onChange, onUpload, onToast }: {
  label: string; value: string; onChange: (v: string) => void;
  onUpload: (f: File) => Promise<string>; onToast: (m: string, t?: "ok" | "err") => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1.5 block">{label}</label>
      <div className="flex gap-2 items-start">
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 border border-border bg-background px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-accent"
          placeholder="URL фото"
        />
        <button onClick={() => ref.current?.click()} className="border border-border px-3 py-2.5 text-xs rounded-sm hover:bg-secondary flex items-center gap-1.5">
          <Icon name="Upload" size={13} />
          Загрузить
        </button>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            onToast("Загружаю...");
            try {
              const url = await onUpload(file);
              onChange(url);
              onToast("Загружено");
            } catch {
              onToast("Ошибка", "err");
            }
          }}
        />
      </div>
      {value && <img src={value} alt="" className="mt-2 h-20 w-32 object-cover rounded-sm border border-border" />}
    </div>
  );
}
