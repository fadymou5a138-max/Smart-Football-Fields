/* Smart Football Fields - Frontend demo logic (LocalStorage only) */
'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const PAGE_FILES = {
  'player-home': 'index.html',
  'field-details': 'field-details.html',
  'booking-review': 'booking-review.html',
  'booking-success': 'booking-success.html',
  'my-bookings': 'my-bookings.html',
  'admin-overview': 'admin-dashboard.html',
  'admin-bookings': 'admin-bookings.html',
  irrigation: 'irrigation.html',
  'fields-pricing': 'fields-pricing.html',
  'design-system': 'design-system.html',
  'user-flows': 'user-flows.html'
};

const DEFAULT_FIELDS = [
  { id: 1, name: 'ملعب النخيل', area: 'مدينة نصر', type: 'خماسي', price: 250, rating: '4.9' },
  { id: 2, name: 'ملعب الأبطال', area: 'المعادي', type: 'خماسي', price: 220, rating: '4.8' },
  { id: 3, name: 'ملعب النجوم', area: 'التجمع الخامس', type: 'سباعي', price: 300, rating: '5.0' },
  { id: 4, name: 'ملعب الشروق', area: 'الشروق', type: 'سباعي', price: 280, rating: '4.7' },
  { id: 5, name: 'ملعب الجزيرة', area: 'الزمالك', type: 'خماسي', price: 260, rating: '4.9' },
  { id: 6, name: 'ملعب الفرسان', area: 'حلوان', type: 'سباعي', price: 240, rating: '4.6' }
];

function readStore(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn(`تعذر قراءة ${key} من LocalStorage`, error);
    return fallback;
  }
}
function writeStore(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (error) { console.error(`تعذر حفظ ${key}`, error); notify('تعذر حفظ البيانات في المتصفح'); return false; }
}
function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function todayISO() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

let fields = readStore('sff_fields', null);
if (!Array.isArray(fields) || !fields.length) fields = DEFAULT_FIELDS.map(field => ({ ...field }));
let bookings = readStore('sff_reference_bookings', []);
if (!Array.isArray(bookings)) bookings = [];
let selectedDate = localStorage.getItem('sff_selected_date') || '';
let selectedTime = localStorage.getItem('sff_selected_time') || '';
let currentField = fields.find(field => field.id === Number(localStorage.getItem('sff_field_id'))) || fields[0];
const currentPage = document.body.dataset.currentPage || '';

function notify(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(notify.timer);
  notify.timer = window.setTimeout(() => toast.classList.remove('show'), 2600);
}
function go(page) {
  if (PAGE_FILES[page]) window.location.href = PAGE_FILES[page];
}
function saveBookings() { writeStore('sff_reference_bookings', bookings); }
function saveFields() { writeStore('sff_fields', fields); }
function timeToMinutes(time) {
  const match = String(time).match(/(\d{1,2}):(\d{2})\s*([مص])/);
  if (!match) return -1;
  let hour = Number(match[1]) % 12;
  if (match[3] === 'م') hour += 12;
  return hour * 60 + Number(match[2]);
}
function isSlotBooked(date, time, fieldId = currentField.id) {
  const start = timeToMinutes(time);
  return bookings.some(booking => {
    if (booking.status !== 'مؤكد' || booking.date !== date) return false;
    const bookingFieldId = booking.fieldId != null ? Number(booking.fieldId) : (booking.field === currentField.name ? Number(currentField.id) : -1);
    if (bookingFieldId !== Number(fieldId)) return false;
    const bookingStart = timeToMinutes(booking.time);
    const duration = Number(booking.hours || 1) * 60;
    return start >= bookingStart && start < bookingStart + duration;
  });
}
function getAvailableTimes(date) {
  return ['05:00 م', '06:00 م', '07:00 م', '08:00 م', '09:00 م', '10:00 م'];
}
function fieldCard(field) {
  return `<article class="field-card">
    <div class="pitch-art"><span class="midline"></span><span class="circle"></span><span class="penalty p1"></span><span class="penalty p2"></span></div>
    <div class="field-card-body"><h3>${escapeHTML(field.name)} <span class="rating">★ ${escapeHTML(field.rating)}</span></h3>
    <p class="field-sub">⌖ ${escapeHTML(field.area)} · ${escapeHTML(field.type)}</p>
    <div class="field-foot"><div><b>${Number(field.price).toLocaleString('en-US')}</b> <small>جنيه / ساعة</small></div>
    <button class="primary" type="button" data-open-field="${Number(field.id)}">احجز الآن</button></div></div></article>`;
}
function renderCards() {
  let list = [...fields];
  const area = $('#areaSearch')?.value || '';
  const type = $('#searchType')?.value || '';
  if (area) list = list.filter(field => field.area === area);
  if (type) list = list.filter(field => field.type === type);
  const home = $('#homeFieldCards');
  if (home) home.innerHTML = list.length ? list.map(fieldCard).join('') : '<div class="empty">لا توجد ملاعب مطابقة لبحثك.</div>';
  const admin = $('#adminFieldCards');
  if (admin) admin.innerHTML = fields.map(field => `<article class="field-card"><div class="pitch-art"></div><div class="field-card-body"><h3>${escapeHTML(field.name)}</h3><p class="field-sub">${escapeHTML(field.area)} · ${escapeHTML(field.type)}</p><div class="field-foot"><b>${Number(field.price).toLocaleString('en-US')} جنيه</b><button class="secondary" type="button" data-edit="${Number(field.id)}">تعديل السعر</button></div></div></article>`).join('');
}
function renderDates() {
  const box = $('#dateOptions');
  if (!box) return;
  const names = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dates = [];
  const anchor = new Date(`${selectedDate || todayISO()}T00:00:00`);
  if (Number.isNaN(anchor.getTime()) || selectedDate < todayISO()) anchor.setTime(new Date(`${todayISO()}T00:00:00`).getTime());
  for (let i = 0; i < 7; i++) {
    const date = new Date(anchor);
    date.setDate(anchor.getDate() + i);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    dates.push(`<button type="button" class="date-choice ${value === selectedDate ? 'selected' : ''}" data-date="${value}">${names[date.getDay()]}<br>${date.getDate()}/${date.getMonth() + 1}</button>`);
  }
  if (!selectedDate || !dates.some(item => item.includes(`data-date="${selectedDate}"`))) {
    selectedDate = todayISO();
    localStorage.setItem('sff_selected_date', selectedDate);
  }
  box.innerHTML = dates.join('');
  $$('[data-date]', box).forEach(button => button.classList.toggle('selected', button.dataset.date === selectedDate));
}
function renderSlots() {
  const box = $('#timeSlots');
  if (!box) return;
  const times = getAvailableTimes(selectedDate);
  box.innerHTML = times.map(time => {
    const unavailable = isSlotBooked(selectedDate, time);
    return `<button type="button" class="slot ${time === selectedTime ? 'selected' : ''}" data-time="${time}" ${unavailable ? 'disabled aria-disabled="true"' : ''}>${time}${unavailable ? ' · محجوز' : ''}</button>`;
  }).join('');
  const selectedStillAvailable = times.includes(selectedTime) && !isSlotBooked(selectedDate, selectedTime);
  if (!selectedStillAvailable) {
    selectedTime = times.find(time => !isSlotBooked(selectedDate, time)) || '';
    if (selectedTime) localStorage.setItem('sff_selected_time', selectedTime);
  }
  $$('[data-time]', box).forEach(button => button.classList.toggle('selected', button.dataset.time === selectedTime));
}
function openField(id) {
  currentField = fields.find(field => Number(field.id) === Number(id));
  if (!currentField) return notify('تعذر العثور على الملعب');
  localStorage.setItem('sff_field_id', String(currentField.id));
  const requestedDate = $('#searchDate')?.value || selectedDate;
  selectedDate = requestedDate && requestedDate >= todayISO() ? requestedDate : todayISO();
  selectedTime = '';
  localStorage.setItem('sff_selected_date', selectedDate);
  localStorage.removeItem('sff_selected_time');
  go('field-details');
}
function updateTotal() {
  const duration = $('#duration');
  const total = $('#totalPrice');
  if (duration && total) total.textContent = `${(Number(currentField.price) * Number(duration.value || 1)).toLocaleString('en-US')} جنيه`;
}
function renderMyBookings(filter = 'all') {
  const box = $('#myBookingList');
  if (!box) return;
  let list = [...bookings].sort((a, b) => Number(b.id) - Number(a.id));
  if (filter === 'upcoming') list = list.filter(booking => booking.status === 'مؤكد' && booking.date >= todayISO());
  if (filter === 'past') list = list.filter(booking => booking.status !== 'مؤكد' || booking.date < todayISO());
  box.innerHTML = list.length ? list.map(booking => `<article class="booking-item"><div><h3>${escapeHTML(booking.field)}</h3><p>${escapeHTML(booking.date)} · ${escapeHTML(booking.time)} · ${Number(booking.hours || 1)} ساعة · ${Number(booking.total).toLocaleString('en-US')} جنيه</p><small>رقم الحجز: SFF-${String(booking.id).slice(-6)}</small></div><span class="status-badge">${escapeHTML(booking.status)}</span>${booking.status === 'مؤكد' && booking.date >= todayISO() ? `<button class="cancel" type="button" data-cancel="${Number(booking.id)}">إلغاء الحجز</button>` : ''}</article>`).join('') : '<div class="empty">لا توجد حجوزات في هذا القسم.</div>';
}
function renderAdminBookings() {
  const body = $('#adminBookingRows');
  if (!body) return;
  const query = ($('#adminSearch')?.value || '').trim().toLowerCase();
  const status = $('#adminStatus')?.value || '';
  const list = bookings.filter(booking => `${booking.player || ''} ${booking.field || ''} ${booking.phone || ''}`.toLowerCase().includes(query) && (!status || booking.status === status));
  body.innerHTML = list.length ? list.map(booking => `<tr><td>SFF-${String(booking.id).slice(-6)}</td><td>${escapeHTML(booking.player)}</td><td>${escapeHTML(booking.field)}</td><td>${escapeHTML(booking.date)} ${escapeHTML(booking.time)}</td><td>${Number(booking.total).toLocaleString('en-US')} ج.م</td><td>${escapeHTML(booking.status)}</td><td>${booking.status === 'مؤكد' ? `<button class="table-action" type="button" data-cancel="${Number(booking.id)}">إلغاء</button>` : '—'}</td></tr>`).join('') : '<tr><td colspan="7">لا توجد حجوزات مطابقة</td></tr>';
}
function renderAdminStats() {
  const confirmed = bookings.filter(booking => booking.status === 'مؤكد');
  const todayBookings = confirmed.filter(booking => booking.date === todayISO());
  const todayRevenue = todayBookings.reduce((sum, booking) => sum + Number(booking.total || 0), 0);
  const statBookings = $('#statBookings');
  if (statBookings) statBookings.textContent = String(todayBookings.length);
  const stats = $$('.stat');
  if (stats[1]) { const value = $('b', stats[1]); if (value) value.innerHTML = `${todayRevenue.toLocaleString('en-US')} <i>ج.م</i>`; }
  if (stats[2]) { const value = $('b', stats[2]); if (value) value.textContent = String(fields.length); }
  if ($('#todayAdminBookings')) $('#todayAdminBookings').innerHTML = todayBookings.length ? todayBookings.slice(0, 5).map(booking => `<div class="sensor-row"><span>${escapeHTML(booking.field)} · ${escapeHTML(booking.player)}</span><b>${escapeHTML(booking.time)} — ${escapeHTML(booking.status)}</b></div>`).join('') : '<p class="muted">لا توجد حجوزات مؤكدة اليوم.</p>';
}
function renderFieldDetails() {
  const section = $('#field-details');
  if (!section) return;
  const heading = $('h1', section);
  if (heading) heading.textContent = currentField.name;
  const location = $('.detail-hero .muted', section);
  if (location) location.textContent = `⌖ ${currentField.area}`;
  const price = $('.price', section);
  if (price) price.innerHTML = `${Number(currentField.price).toLocaleString('en-US')} <small>جنيه / ساعة</small>`;
  const facts = $('.detail-facts', section);
  if (facts) facts.innerHTML = `<span>⚽ ${escapeHTML(currentField.type)}</span><span>⭐ ${escapeHTML(currentField.rating || 'جديد')}</span><span>💡 إضاءة ليلية</span>`;
}
function render() {
  renderCards();
  renderDates();
  renderSlots();
  renderMyBookings();
  renderAdminBookings();
  renderAdminStats();
  renderFieldDetails();
  if ($('#reviewField')) $('#reviewField').textContent = currentField.name;
  if ($('#reviewDate')) $('#reviewDate').textContent = selectedDate || '—';
  if ($('#reviewTime')) $('#reviewTime').textContent = selectedTime || '—';
  updateTotal();
  $$('[data-page]').forEach(link => link.classList.toggle('active', link.dataset.page === currentPage));
}

// Main delegated interactions: safe across dynamically rendered cards and rows.
document.addEventListener('click', event => {
  const open = event.target.closest('[data-open-field]');
  if (open) return openField(Number(open.dataset.openField));

  const dateButton = event.target.closest('[data-date]');
  if (dateButton) {
    selectedDate = dateButton.dataset.date;
    localStorage.setItem('sff_selected_date', selectedDate);
    selectedTime = '';
    localStorage.removeItem('sff_selected_time');
    renderDates();
    renderSlots();
    return;
  }

  const timeButton = event.target.closest('[data-time]');
  if (timeButton && !timeButton.disabled) {
    selectedTime = timeButton.dataset.time;
    localStorage.setItem('sff_selected_time', selectedTime);
    renderSlots();
    return;
  }

  const cancelButton = event.target.closest('[data-cancel]');
  if (cancelButton) {
    const booking = bookings.find(item => Number(item.id) === Number(cancelButton.dataset.cancel));
    if (!booking || booking.status !== 'مؤكد') return;
    if (!window.confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) return;
    booking.status = 'ملغي';
    saveBookings();
    renderMyBookings(); renderAdminBookings(); renderAdminStats(); renderSlots();
    notify('تم إلغاء الحجز وإتاحة الموعد من جديد');
    return;
  }

  const tab = event.target.closest('[data-booktab]');
  if (tab) {
    $$('.tab').forEach(item => item.classList.toggle('active', item === tab));
    renderMyBookings(tab.dataset.booktab);
    return;
  }

  const edit = event.target.closest('[data-edit]');
  if (edit) {
    const field = fields.find(item => Number(item.id) === Number(edit.dataset.edit));
    if (!field) return;
    const value = window.prompt('أدخل سعر الساعة الجديد بالجنيه', String(field.price));
    if (value === null) return;
    const price = Number(value);
    if (!Number.isFinite(price) || price <= 0) return notify('أدخل سعرًا صحيحًا أكبر من صفر');
    field.price = price;
    saveFields(); renderCards();
    notify('تم تحديث سعر الملعب');
  }
});

$('#findFields')?.addEventListener('click', () => {
  if ($('#searchDate')?.value) {
    selectedDate = $('#searchDate').value;
    localStorage.setItem('sff_selected_date', selectedDate);
  }
  renderCards();
  $('#homeFieldCards')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
$('#areaSearch')?.addEventListener('change', renderCards);
$('#searchType')?.addEventListener('change', renderCards);
$('#continueBooking')?.addEventListener('click', () => {
  if (!selectedDate || !selectedTime) return notify('اختار اليوم والموعد أولاً');
  if (selectedDate < todayISO()) return notify('لا يمكن الحجز في تاريخ سابق');
  if (isSlotBooked(selectedDate, selectedTime)) { renderSlots(); return notify('هذا الموعد تم حجزه بالفعل، اختر موعدًا آخر'); }
  go('booking-review');
});
$('#duration')?.addEventListener('change', updateTotal);
$('#confirmBooking')?.addEventListener('click', () => {
  const player = ($('#playerName')?.value || '').trim();
  const phone = ($('#playerPhone')?.value || '').replace(/\s+/g, '');
  const hours = Number($('#duration')?.value || 1);
  const validPhone = /^(\+20|0)?1[0125][0-9]{8,9}$/.test(phone);
  if (player.length < 3) return notify('اكتب اسمًا صحيحًا (3 أحرف على الأقل)');
  if (!validPhone) return notify('أدخل رقم هاتف مصري صحيح');
  if (![1, 2, 3].includes(hours)) return notify('اختر مدة حجز صحيحة');
  if (!selectedDate || !selectedTime || selectedDate < todayISO()) return notify('اختر تاريخًا وموعدًا صحيحين');
  const start = timeToMinutes(selectedTime);
  const requestedEnd = start + hours * 60;
  const conflict = bookings.some(booking => {
    const bookingFieldId = booking.fieldId != null ? Number(booking.fieldId) : (booking.field === currentField.name ? Number(currentField.id) : -1);
    if (booking.status !== 'مؤكد' || booking.date !== selectedDate || bookingFieldId !== Number(currentField.id)) return false;
    const existingStart = timeToMinutes(booking.time);
    const existingEnd = existingStart + Number(booking.hours || 1) * 60;
    return start < existingEnd && existingStart < requestedEnd;
  });
  if (conflict) return notify('المدة المختارة تتعارض مع حجز آخر، اختر موعدًا أو مدة مختلفة');
  const payment = $('input[name="pay"]:checked')?.value || 'الدفع عند الملعب';
  const booking = {
    id: Date.now(), fieldId: currentField.id, field: currentField.name, area: currentField.area,
    player, phone, date: selectedDate, time: selectedTime, hours,
    total: Number(currentField.price) * hours, payment, pay: payment,
    status: 'مؤكد', createdAt: new Date().toISOString()
  };
  bookings.unshift(booking);
  if (!writeStore('sff_reference_bookings', bookings)) { bookings.shift(); return; }
  localStorage.setItem('sff_last_booking', JSON.stringify(booking));
  go('booking-success');
});

if (currentPage === 'booking-success') {
  const booking = readStore('sff_last_booking', null);
  if (booking) {
    if ($('#ticketId')) $('#ticketId').textContent = `SFF-${String(booking.id).slice(-6)}`;
    if ($('#ticketWhen')) $('#ticketWhen').textContent = `${booking.date} · ${booking.time}`;
    if ($('#ticketTotal')) $('#ticketTotal').textContent = `${Number(booking.total).toLocaleString('en-US')} جنيه`;
    const fieldName = $('.ticket div:nth-child(2) b');
    if (fieldName) fieldName.textContent = booking.field;
  } else {
    const ticket = $('.ticket');
    if (ticket) ticket.insertAdjacentHTML('beforebegin', '<p class="empty">لا يوجد حجز حديث لعرضه. <a href="index.html">ابدأ حجزًا جديدًا</a>.</p>');
  }
}

$('#pumpSwitch')?.addEventListener('change', event => {
  const active = event.target.checked;
  const status = active ? 'المضخة تعمل الآن' : 'المضخة متوقفة حاليًا';
  if ($('#pumpStatus')) $('#pumpStatus').textContent = status;
  if ($('#pumpCard')) $('#pumpCard').textContent = active ? 'تعمل' : 'متوقفة';
  localStorage.setItem('sff_pump_state', active ? 'on' : 'off');
  notify(status);
});
$('#saveIrrigation')?.addEventListener('click', () => {
  const settings = { automatic: Boolean($('#autoIrrigation')?.checked), moistureLimit: Number($('#moistureLimit')?.value || 0), pumpMinutes: Number($('input[type=number]:not(#moistureLimit)')?.value || 5) };
  writeStore('sff_irrigation_settings', settings);
  notify('تم حفظ إعدادات الري على هذا الجهاز');
});
const irrigationSettings = readStore('sff_irrigation_settings', null);
if (irrigationSettings) {
  if ($('#autoIrrigation')) $('#autoIrrigation').checked = Boolean(irrigationSettings.automatic);
  if ($('#moistureLimit')) $('#moistureLimit').value = irrigationSettings.moistureLimit;
  const pumpMinutes = $('input[type=number]:not(#moistureLimit)');
  if (pumpMinutes && irrigationSettings.pumpMinutes) pumpMinutes.value = irrigationSettings.pumpMinutes;
}
if ($('#pumpSwitch')) $('#pumpSwitch').checked = localStorage.getItem('sff_pump_state') === 'on';
if ($('#pumpStatus') && $('#pumpSwitch')) $('#pumpStatus').textContent = $('#pumpSwitch').checked ? 'المضخة تعمل الآن' : 'المضخة متوقفة حاليًا';
if ($('#pumpCard') && $('#pumpSwitch')) $('#pumpCard').textContent = $('#pumpSwitch').checked ? 'تعمل' : 'متوقفة';

$('#addField')?.addEventListener('click', () => {
  const name = (window.prompt('اسم الملعب الجديد') || '').trim();
  if (!name) return;
  const area = (window.prompt('المنطقة') || '').trim();
  if (!area) return notify('أدخل منطقة الملعب');
  const rawPrice = window.prompt('سعر الساعة بالجنيه', '250');
  if (rawPrice === null) return;
  const price = Number(rawPrice);
  if (!Number.isFinite(price) || price <= 0) return notify('أدخل سعرًا صحيحًا أكبر من صفر');
  fields.push({ id: Date.now(), name, area, price, type: 'خماسي', rating: 'جديد' });
  saveFields(); renderCards();
  notify('تمت إضافة الملعب');
});
$('#adminSearch')?.addEventListener('input', renderAdminBookings);
$('#adminStatus')?.addEventListener('change', renderAdminBookings);
$('#hamb')?.addEventListener('click', () => $('#sidebar')?.classList.toggle('open'));
$('#sidebarToggle')?.addEventListener('click', () => $('#sidebar')?.classList.remove('open'));
document.addEventListener('click', event => {
  if (window.innerWidth <= 720 && $('#sidebar')?.classList.contains('open') && !event.target.closest('#sidebar, #hamb')) {
    $('#sidebar').classList.remove('open');
  }
});

$('#printTicket')?.addEventListener('click', () => window.print());

const searchDate = $('#searchDate');
if (searchDate && !searchDate.value) searchDate.value = todayISO();
render();
