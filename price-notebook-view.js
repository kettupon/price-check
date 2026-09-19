// Generated from price-notebook-view.jsx by scripts/build-notebook.cjs.
import React, { useState, useEffect, useRef } from 'react';
import './price-notebook.js';
export default function PriceNotebookView() {
  const [mode, setMode] = useState('save');
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [photoView, setPhotoView] = useState(null);
  const [shareEntry, setShareEntry] = useState(null);
  const [shareProduct, setShareProduct] = useState('');
  const [shareStore, setShareStore] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const photoDialog = useRef(null);
  const shareDialog = useRef(null);
  useEffect(() => {
    if (photoView) photoDialog.current?.showModal();else photoDialog.current?.close();
  }, [photoView]);
  useEffect(() => {
    if (shareEntry) shareDialog.current?.showModal();else shareDialog.current?.close();
  }, [shareEntry]);
  const refresh = async () => setRecords(await window.PriceNotebook.list());
  useEffect(() => {
    refresh().catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);
  const resetForm = () => {
    setEditingId(null);
    setPrice('');
    setNote('');
    setImageDataUrl('');
    if (fileRef.current) fileRef.current.value = '';
  };
  const openSave = () => {
    if (busy) return;
    resetForm();
    setError('');
    setMode('save');
  };
  const edit = record => {
    setEditingId(record.id);
    setPrice(String(record.price));
    setNote(record.note || '');
    setImageDataUrl(record.imageDataUrl);
    setError('');
    setMode('save');
  };
  const choosePhoto = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    setImageDataUrl('');
    try {
      setImageDataUrl(await window.PriceNotebook.prepareImage(file));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const save = async event => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await window.PriceNotebook.save({
        id: editingId,
        price,
        note,
        imageDataUrl
      });
      await refresh();
      resetForm();
      setMode('archive');
    } catch (e) {
      setError(e.name === 'QuotaExceededError' ? 'พื้นที่จัดเก็บในเบราว์เซอร์เต็ม กรุณาลบรายการเก่าหรือเพิ่มพื้นที่' : e.message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async record => {
    if (!window.confirm('ลบราคาที่บันทึกนี้จากอุปกรณ์นี้?')) return;
    setBusy(true);
    setError('');
    try {
      await window.PriceNotebook.remove(record.id);
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return React.createElement("div", {
    className: "flex-1 overflow-y-auto pb-24 bg-gray-50"
  }, React.createElement("div", {
    className: "p-4 space-y-4"
  }, React.createElement("div", {
    className: "rounded-2xl bg-white p-4 shadow-sm border border-gray-100"
  }, React.createElement("h2", {
    className: "text-xl font-bold text-gray-800"
  }, "สมุดราคาของฉัน"), React.createElement("p", {
    className: "text-xs text-gray-500 mt-1"
  }, "เก็บรูปและราคาไว้กลับมาดูภายหลัง ไม่เผยแพร่ให้คนอื่น"), React.createElement("p", {
    className: "text-[11px] text-amber-700 mt-2 bg-amber-50 rounded-lg p-2"
  }, "บันทึกเฉพาะในเบราว์เซอร์บนอุปกรณ์นี้ ไม่ซิงก์ข้ามเครื่อง ผู้ใช้เบราว์เซอร์เดียวกันเปิดดูได้ และจะหายหากล้างข้อมูลเว็บไซต์")), React.createElement("div", {
    className: "grid grid-cols-2 gap-2 rounded-xl bg-white p-1 shadow-sm",
    role: "tablist",
    "aria-label": "สมุดราคา"
  }, React.createElement("button", {
    type: "button",
    role: "tab",
    "aria-selected": mode === 'save',
    onClick: () => setMode('save'),
    disabled: busy,
    className: `rounded-lg py-2.5 text-sm font-bold ${mode === 'save' ? 'bg-green-500 text-white' : 'text-gray-600'}`
  }, "บันทึกราคา"), React.createElement("button", {
    type: "button",
    role: "tab",
    "aria-selected": mode === 'archive',
    disabled: busy,
    onClick: () => {
      setError('');
      refresh().catch(e => setError(e.message));
      setMode('archive');
    },
    className: `rounded-lg py-2.5 text-sm font-bold ${mode === 'archive' ? 'bg-green-500 text-white' : 'text-gray-600'}`
  }, "ราคาที่บันทึก (", records.length, ")")), error && React.createElement("p", {
    role: "alert",
    className: "rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700"
  }, error), mode === 'save' ? React.createElement("form", {
    onSubmit: save,
    className: "rounded-2xl bg-white p-4 shadow-sm space-y-4"
  }, React.createElement("h3", {
    className: "font-bold text-gray-800"
  }, editingId ? 'แก้ไขราคาที่บันทึก' : 'บันทึกราคาใหม่'), React.createElement("div", null, React.createElement("label", {
    htmlFor: "notebook-photo",
    className: "block text-sm font-bold text-gray-700 mb-2"
  }, "รูปภาพ ", React.createElement("span", {
    className: "text-red-500"
  }, "*")), React.createElement("input", {
    disabled: busy,
    id: "notebook-photo",
    ref: fileRef,
    type: "file",
    accept: "image/*",
    onChange: choosePhoto,
    className: "block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-green-50 file:px-3 file:py-2 file:font-bold file:text-green-700",
    "aria-label": "เลือกรูปภาพราคา"
  }), imageDataUrl && React.createElement("img", {
    src: imageDataUrl,
    alt: "รูปภาพที่เลือก",
    className: "mt-3 w-full h-48 object-contain rounded-xl bg-gray-100"
  })), React.createElement("div", null, React.createElement("label", {
    htmlFor: "notebook-price",
    className: "block text-sm font-bold text-gray-700 mb-2"
  }, "ราคา (บาท) ", React.createElement("span", {
    className: "text-red-500"
  }, "*")), React.createElement("input", {
    disabled: busy,
    id: "notebook-price",
    value: price,
    onChange: e => setPrice(e.target.value),
    inputMode: "decimal",
    placeholder: "เช่น 39.50",
    className: "w-full rounded-xl border border-gray-200 px-4 py-3 text-lg font-bold outline-none focus:border-green-500"
  })), React.createElement("div", null, React.createElement("label", {
    htmlFor: "notebook-note",
    className: "block text-sm font-bold text-gray-700 mb-2"
  }, "หมายเหตุ ", React.createElement("span", {
    className: "font-normal text-gray-400"
  }, "(ไม่จำเป็น)")), React.createElement("textarea", {
    disabled: busy,
    id: "notebook-note",
    value: note,
    onChange: e => setNote(e.target.value),
    maxLength: 500,
    rows: 3,
    placeholder: "เช่น เจอที่ร้านใกล้บ้าน",
    className: "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500"
  })), React.createElement("button", {
    type: "submit",
    disabled: busy,
    className: "w-full rounded-xl bg-green-500 px-4 py-3 font-bold text-white disabled:opacity-50"
  }, busy ? 'กำลังบันทึก…' : editingId ? 'บันทึกการแก้ไข' : 'บันทึกราคา'), editingId && React.createElement("button", {
    type: "button",
    onClick: openSave,
    disabled: busy,
    className: "w-full text-sm text-gray-500"
  }, "ยกเลิกการแก้ไข")) : React.createElement("div", {
    className: "space-y-3"
  }, loading ? React.createElement("p", {
    role: "status",
    className: "p-6 text-center text-gray-500"
  }, "กำลังเปิดสมุดราคา…") : records.length === 0 ? React.createElement("div", {
    className: "rounded-2xl bg-white p-8 text-center text-sm text-gray-500"
  }, "ยังไม่มีราคาที่บันทึกไว้", React.createElement("br", null), React.createElement("button", {
    type: "button",
    onClick: openSave,
    disabled: busy,
    className: "mt-3 font-bold text-green-600"
  }, "บันทึกราคาแรก")) : records.map(record => React.createElement("article", {
    key: record.id,
    className: "rounded-2xl bg-white p-3 shadow-sm border border-gray-100 flex gap-3"
  }, React.createElement("button", {
    type: "button",
    onClick: () => setPhotoView(record.imageDataUrl),
    "aria-label": "ดูรูปภาพขนาดใหญ่",
    className: "flex-none self-start"
  }, React.createElement("img", {
    src: record.imageDataUrl,
    alt: "รูปภาพราคาที่บันทึก",
    className: "w-24 h-24 rounded-xl object-cover bg-gray-100"
  })), React.createElement("div", {
    className: "min-w-0 flex-1"
  }, React.createElement("div", {
    className: "text-lg font-bold text-green-700"
  }, "฿", record.price.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })), record.note && React.createElement("p", {
    className: "text-sm text-gray-700 break-words whitespace-pre-wrap mt-1"
  }, record.note), React.createElement("p", {
    className: "text-[11px] text-gray-400 mt-1"
  }, new Date(record.createdAt).toLocaleString('th-TH')), React.createElement("div", {
    className: "flex flex-wrap gap-4 mt-2"
  }, React.createElement("button", {
    type: "button",
    disabled: busy,
    onClick: () => edit(record),
    className: "text-xs font-bold text-green-700"
  }, "แก้ไข"), React.createElement("button", {
    type: "button",
    disabled: busy,
    onClick: () => {
      setShareProduct('');
      setShareStore('');
      setShareEntry(record);
    },
    className: "text-xs font-bold text-green-700"
  }, "แชร์ออนไลน์"), React.createElement("button", {
    type: "button",
    disabled: busy,
    onClick: () => remove(record),
    className: "text-xs font-bold text-red-600 disabled:opacity-50"
  }, "ลบ"))))))), React.createElement("dialog", {
    ref: photoDialog,
    onCancel: () => setPhotoView(null),
    "aria-label": "รูปภาพราคาที่บันทึก",
    className: "rounded-2xl p-4 max-w-[95vw] backdrop:bg-black/80"
  }, React.createElement("button", {
    autoFocus: true,
    type: "button",
    onClick: () => setPhotoView(null),
    className: "mb-3 rounded-lg bg-gray-100 px-5 py-2 font-bold"
  }, "ปิดรูปภาพ"), photoView && React.createElement("img", {
    src: photoView,
    alt: "รูปภาพราคาที่บันทึกขนาดใหญ่",
    className: "max-w-full max-h-[75vh] object-contain"
  })), React.createElement("dialog", {
    ref: shareDialog,
    onCancel: () => setShareEntry(null),
    "aria-labelledby": "share-preview-title",
    className: "rounded-2xl p-5 w-[min(95vw,440px)] max-h-[90vh] overflow-y-auto backdrop:bg-black/70"
  }, React.createElement("button", {
    autoFocus: true,
    type: "button",
    onClick: () => setShareEntry(null),
    className: "float-right rounded-lg bg-gray-100 px-3 py-2 text-sm"
  }, "ปิด"), React.createElement("h2", {
    id: "share-preview-title",
    className: "font-bold text-lg pr-16"
  }, "ตัวอย่างแชร์ออนไลน์"), React.createElement("p", {
    className: "text-sm text-gray-600 mt-3"
  }, "ตรวจสอบข้อมูลที่จะให้ชุมชนเห็นเมื่อยืนยันเผยแพร่: รูปภาพ ราคา หมายเหตุ และชื่อสินค้า/ร้านที่กรอกด้านล่าง"), shareEntry && React.createElement("div", {
    className: "mt-4 space-y-3"
  }, React.createElement("img", {
    src: shareEntry.imageDataUrl,
    alt: "รูปภาพสำหรับแชร์ให้ชุมชน",
    className: "w-full max-h-60 object-contain rounded-xl bg-gray-100"
  }), React.createElement("p", {
    className: "text-xl font-bold text-green-700"
  }, "฿", shareEntry.price.toFixed(2)), React.createElement("p", {
    className: "text-sm whitespace-pre-wrap break-words"
  }, shareEntry.note || 'ไม่มีหมายเหตุ'), React.createElement("label", {
    className: "block text-sm"
  }, "ชื่อสินค้า (ไม่จำเป็น)", React.createElement("input", {
    value: shareProduct,
    onChange: e => setShareProduct(e.target.value),
    maxLength: 200,
    className: "block w-full rounded-lg border p-2 mt-1"
  })), React.createElement("label", {
    className: "block text-sm"
  }, "ร้านค้า (ไม่จำเป็น)", React.createElement("input", {
    value: shareStore,
    onChange: e => setShareStore(e.target.value),
    maxLength: 100,
    className: "block w-full rounded-lg border p-2 mt-1"
  }))), React.createElement("p", {
    role: "status",
    className: "mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800"
  }, "ยังเผยแพร่ไม่ได้ ขณะนี้กำลังเตรียมระบบชุมชนให้ปลอดภัย เมื่อเปิดใช้งานจะต้องเข้าสู่ระบบและยืนยันก่อนส่ง ข้อมูลนี้ยังอยู่ในอุปกรณ์และยังไม่ได้ส่งออนไลน์"), React.createElement("button", {
    type: "button",
    disabled: true,
    className: "mt-4 w-full rounded-xl bg-gray-200 text-gray-500 py-3 font-bold"
  }, "ยืนยันเผยแพร่ — ยังไม่พร้อมใช้งาน"), React.createElement("p", {
    className: "text-xs text-gray-500 mt-3"
  }, "ราคาที่บันทึกส่วนตัวยังคงอยู่ แม้ปิดตัวอย่างนี้")));
}
