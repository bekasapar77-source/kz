import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "emailjs-com";

const MATCH = {
  home: "Кайрат",
  away: "Реал",
  competition: "УЕФА Лига Чемпионов",
  dateISO: null,
  city: "Алматы",
  venue: "Центральный стадион",
  org: "ФК Кайрат",
};

const SECTORS = [
  { id: "vip", name: "VIP (Запад)", price: 95000, quota: 120 },
  { id: "premium", name: "Premium (Запад)", price: 65000, quota: 300 },
  { id: "standard", name: "Standard", price: 38000, quota: 1200 },
  { id: "fan", name: "Фан-сектор", price: 20000, quota: 900 },
];

const fmt = (n) =>
  new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(n);

export default function App() {
  const [cart, setCart] = useState([]);
  const [availability, setAvailability] = useState(() =>
    Object.fromEntries(SECTORS.map((s) => [s.id, s.quota]))
  );
  const [selectedSector, setSelectedSector] = useState(null);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [showForm, setShowForm] = useState(false);
  const [popup, setPopup] = useState(null);

  function addToCart(sector, qty = 1) {
    if (!sector) return;
    const rem = availability[sector.id];
    if (rem <= 0) return;
    const take = Math.min(qty, rem);
    setCart((prev) => {
      const ex = prev.find((p) => p.id === sector.id);
      if (ex)
        return prev.map((p) =>
          p.id === sector.id ? { ...p, qty: p.qty + take } : p
        );
      return [...prev, { ...sector, qty: take }];
    });
    setAvailability((prev) => ({ ...prev, [sector.id]: prev[sector.id] - take }));
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  function sendBooking() {
    const tickets = cart.map((i) => `${i.name} — ${i.qty} шт.`).join(", ");
    const templateParams = {
      name: formData.name,
      phone: formData.phone,
      tickets,
      total: fmt(total),
      date: new Date().toLocaleString("ru-RU"),
      to_email: "bekasapar77@gmail.com",
    };

    emailjs
      .send(
        "service_zeqy4kp",
        "template_g8nhj7y",
        templateParams,
        "Viat6_6DrKP0C2YJ5"
      )
      .then(
        () => {
          setPopup("✅ Ваша бронь успешно оформлена! Мы скоро свяжемся с вами.");
          setCart([]);
          setFormData({ name: "", phone: "" });
          setShowForm(false);
          setTimeout(() => setPopup(null), 5000);
        },
        () => {
          setPopup("❌ Ошибка при отправке. Попробуйте позже.");
          setTimeout(() => setPopup(null), 5000);
        }
      );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="p-4 bg-gray-900 flex justify-between">
        <div className="font-bold text-lg">
          {MATCH.home} vs {MATCH.away}
        </div>
        <div className="text-sm text-gray-400">
          {MATCH.venue}, {MATCH.city}
        </div>
      </header>

      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-black mb-4">Выберите места</h1>
        <div className="grid gap-2">
          {SECTORS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSector(s)}
              className="p-3 bg-gray-800 rounded-lg flex justify-between"
            >
              <div>
                <div>{s.name}</div>
                <div className="text-xs text-gray-400">
                  {fmt(s.price)} • Осталось: {availability[s.id]}
                </div>
              </div>
            </button>
          ))}
        </div>

        {selectedSector && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <div className="flex justify-between">
              <div>
                <div className="font-bold">{selectedSector.name}</div>
                <div className="text-sm text-gray-400">
                  {fmt(selectedSector.price)} • Осталось:{" "}
                  {availability[selectedSector.id]}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => addToCart(selectedSector, 1)}
                  className="px-4 py-2 bg-yellow-400 text-black rounded-lg"
                >
                  +1
                </button>
                <button
                  onClick={() => addToCart(selectedSector, 2)}
                  className="px-4 py-2 bg-gray-600 rounded-lg"
                >
                  +2
                </button>
              </div>
            </div>
          </div>
        )}

        {cart.length > 0 && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h2 className="font-bold mb-2">Корзина</h2>
            <ul className="space-y-1 text-sm">
              {cart.map((i) => (
                <li key={i.id}>
                  {i.name} — {i.qty} шт. × {fmt(i.price)} ={" "}
                  {fmt(i.qty * i.price)}
                </li>
              ))}
            </ul>
            <div className="mt-2 font-bold">Итого: {fmt(total)}</div>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 w-full px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg"
            >
              Забронировать билеты
            </button>
          </div>
        )}

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            >
              <div className="bg-gray-900 p-6 rounded-xl max-w-md w-full">
                <h3 className="text-lg font-bold mb-4">Введите данные</h3>
                <input
                  type="text"
                  placeholder="Имя"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full mb-2 p-2 rounded bg-gray-800"
                />
                <input
                  type="tel"
                  placeholder="Телефон"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full mb-2 p-2 rounded bg-gray-800"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={sendBooking}
                    className="flex-1 px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg"
                  >
                    Подтвердить бронь
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 rounded-lg"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {popup && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.4 }}
              className="fixed bottom-6 right-6 bg-gray-900 border border-gray-700 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 max-w-xs"
            >
              {popup}
              <button
                onClick={() => setPopup(null)}
                className="block mt-2 text-sm text-yellow-400 hover:underline"
              >
                Закрыть
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-center py-6 text-gray-500">
        © {new Date().getFullYear()} {MATCH.org}. Все права защищены.
      </footer>
    </div>
  );
}
