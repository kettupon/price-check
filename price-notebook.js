(function (global) {
  'use strict';
  const DB_NAME = 'dealhunter-personal-notebook';
  const STORE = 'prices';

  function open() {
    return new Promise((resolve, reject) => {
      if (!global.indexedDB) return reject(new Error('เบราว์เซอร์นี้ไม่รองรับการบันทึกในเครื่อง'));
      const request = global.indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('กรุณาปิดแท็บอื่นของแอปแล้วลองใหม่'));
    });
  }

  async function run(mode, action) {
    const db = await open();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = action(tx.objectStore(STORE));
        let result;
        request.onsuccess = () => { result = request.result; };
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error || new Error('บันทึกไม่สำเร็จ'));
      });
    } finally {
      db.close();
    }
  }

  function validatePrice(value) {
    const raw = String(value).trim();
    const price = Number(raw);
    if (!/^\d+(?:\.\d{1,2})?$/.test(raw) || !Number.isFinite(price) || price <= 0 || price > 1000000) {
      throw new Error('กรุณาใส่ราคา 0.01–1,000,000 บาท (ทศนิยมไม่เกิน 2 ตำแหน่ง)');
    }
    return price;
  }

  async function prepareImage(file) {
    if (!file || !file.type.startsWith('image/')) throw new Error('กรุณาเลือกรูปภาพ');
    if (file.size > 15 * 1024 * 1024) throw new Error('รูปภาพต้นฉบับต้องไม่เกิน 15 MB');
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('เปิดรูปภาพนี้ไม่ได้ กรุณาเลือกรูปอื่น'));
        image.src = url;
      });
      const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      if (dataUrl.length > 4 * 1024 * 1024) throw new Error('รูปภาพใหญ่เกินไป กรุณาใช้รูปที่เล็กลง');
      return dataUrl;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function list() {
    const records = await run('readonly', store => store.getAll());
    return records.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async function save({ id, price, note, imageDataUrl }) {
    const cleanPrice = validatePrice(price);
    if (typeof imageDataUrl !== 'string' || !imageDataUrl.startsWith('data:image/jpeg;base64,')) {
      throw new Error('กรุณาเลือกรูปภาพ');
    }
    const cleanNote = String(note || '').trim();
    if (cleanNote.length > 500) throw new Error('หมายเหตุต้องไม่เกิน 500 ตัวอักษร');
    const now = Date.now();
    const existing = id ? await run('readonly', store => store.get(id)) : null;
    if (id && !existing) throw new Error('ไม่พบรายการที่ต้องการแก้ไข');
    const record = {
      id: id || (global.crypto?.randomUUID?.() || `${now}-${Math.random().toString(36).slice(2)}`),
      price: cleanPrice,
      note: cleanNote,
      imageDataUrl,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };
    await run('readwrite', store => store.put(record));
    return record;
  }

  async function remove(id) {
    await run('readwrite', store => store.delete(id));
  }

  global.PriceNotebook = { list, save, remove, prepareImage, validatePrice };
})(window);
