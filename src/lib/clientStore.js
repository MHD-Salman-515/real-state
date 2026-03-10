// src/lib/clientStore.js
const K = {
  profile: "me",
  favorites: "fav_props_v1",
  recent: "recent_props_v1",
  draft: "bookvisit_draft_v1",
  appts: "appointments_v1",
  lastSearch: "last_search_v1",
};

const read = (k, def) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; }
};
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export const store = {
  // Profile
  getProfile() { return read(K.profile, null); },
  saveProfile(obj) { write(K.profile, obj); },

  // Favorites
  listFavs() { return read(K.favorites, []); },
  isFav(id) { return store.listFavs().includes(String(id)); },
  addFav(id) { const s = new Set(store.listFavs()); s.add(String(id)); write(K.favorites, [...s]); },
  removeFav(id) { write(K.favorites, store.listFavs().filter(x => x !== String(id))); },

  // Recent views
  listRecent() { return read(K.recent, []); }, // [{id, at}]
  addRecent(id) {
    const arr = store.listRecent().filter(r => r.id !== String(id));
    arr.unshift({ id: String(id), at: new Date().toISOString() });
    write(K.recent, arr.slice(0, 20));
  },

  // Book-visit draft
  getDraft() { return read(K.draft, null); },
  saveDraft(draft) { write(K.draft, draft); },
  clearDraft() { localStorage.removeItem(K.draft); },

  // Appointments
  listAppts() { return read(K.appts, []); }, // [{id, propId, when, note, status}]
  addAppt(a) {
    const id = "A-" + Math.floor(Math.random()*100000);
    const rec = { id, status: "pending", at: new Date().toISOString(), ...a };
    write(K.appts, [rec, ...store.listAppts()]);
    return rec;
  },
  updateAppt(id, patch) {
    write(K.appts, store.listAppts().map(x => x.id === id ? {...x, ...patch} : x));
  },

  // Search memory
  saveLastSearch(q) { write(K.lastSearch, q); },
  getLastSearch() { return read(K.lastSearch, {}); },
};
