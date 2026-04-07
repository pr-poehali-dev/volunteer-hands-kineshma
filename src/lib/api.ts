const PUBLIC_URL = "https://functions.poehali.dev/a1235d5d-fc9f-414f-9953-fd585d19336c";
const ADMIN_URL = "https://functions.poehali.dev/919ce08a-4375-4282-82a4-bb0f2a187f4c";

export const pub = (route: string) => `${PUBLIC_URL}?route=${route}`;
export const adm = (route: string) => `${ADMIN_URL}?route=${route}`;

export function adminFetch(route: string, method = "GET", body?: object) {
  const token = localStorage.getItem("admin_token") || "";
  return fetch(adm(route), {
    method,
    headers: { "Content-Type": "application/json", "X-Admin-Token": token },
    body: body ? JSON.stringify(body) : undefined,
  }).then((r) => r.json());
}

export function publicFetch(route: string) {
  return fetch(pub(route)).then((r) => r.json());
}
