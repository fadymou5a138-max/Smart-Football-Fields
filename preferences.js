/* Theme, language and responsive preference controls for Smart Football Fields. */
(() => {
  'use strict';
  const root = document.documentElement;
  const body = document.body;
  const storage = {
    get(key, fallback) { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch {} }
  };
  let language = storage.get('sff_language', 'ar');
  let theme = storage.get('sff_theme', 'light');
  const originals = new WeakMap();

  const dictionary = {
    'تطبيق اللاعب':'Player App','الرئيسية':'Home','تفاصيل الملعب':'Field Details','مراجعة الحجز':'Booking Review','تأكيد الحجز':'Booking Confirmation','حجوزاتي':'My Bookings','لوحة تحكم المسؤول':'Admin Dashboard','نظرة عامة':'Overview','الحجوزات':'Bookings','الري والحساسات':'Irrigation & Sensors','الملاعب والأسعار':'Fields & Pricing','التوثيق':'Documentation','نظام التصميم':'Design System','رحلات الاستخدام':'User Flows','مدير النظام':'System Administrator','أحمد محمد':'Ahmed Mohamed','متصل الآن':'Online',
    'إدارة التشغيل':'Operations Management','متابعة وإدارة جميع حجوزات اللاعبين.':'View and manage all player bookings.','كل الحالات':'All statuses','مؤكد':'Confirmed','ملغي':'Cancelled','رقم الحجز':'Booking ID','اللاعب':'Player','الملعب':'Field','التاريخ':'Date','الإجمالي':'Total','الحالة':'Status','إجراء':'Action','الملاعب':'Fields','الإدارة':'Admin',
    'تم تأكيد الحجز':'Booking Confirmed','تم بنجاح':'Success','تم تأكيد حجزك!':'Your booking is confirmed!','حجزك اتسجل بنجاح. مستنيينك في الملعب!':'Your booking has been saved. See you on the field!','الموعد':'Schedule','طباعة التذكرة':'Print Ticket','عرض حجوزاتي':'View My Bookings','العودة للرئيسية':'Back to Home',
    'خطوة أخيرة':'One Last Step','تأكد من بيانات الحجز قبل التأكيد.':'Review your booking details before confirming.','مدينة نصر · ملعب خماسي':'Nasr City · 5-a-side field','تاريخ الحجز':'Booking Date','موعد اللعب':'Playing Time','مدة الحجز':'Booking Duration','ساعة واحدة':'1 hour','ساعتان':'2 hours','3 ساعات':'3 hours','سعر الساعة':'Hourly Rate','بيانات اللاعب':'Player Details','الاسم':'Name','رقم الهاتف':'Phone Number','طريقة الدفع':'Payment Method','الدفع عند الملعب':'Pay at the field','محفظة إلكترونية':'E-wallet','تأكيد الحجز ✓':'Confirm Booking ✓',
    'إنترنت الأشياء IoT':'Internet of Things (IoT)','مراقبة حالة التربة والمياه والتحكم في نظام الري الذكي.':'Monitor soil and water conditions and control smart irrigation.','الأجهزة متصلة':'Devices Connected','رطوبة التربة':'Soil Moisture','مستوى طبيعي':'Normal Level','درجة الحرارة':'Temperature','مناسبة':'Suitable','مستوى المياه':'Water Level','ممتاز':'Excellent','حالة المضخة':'Pump Status','متوقفة':'Off','تحكم يدوي':'Manual Control','إعدادات الري الذكي':'Smart Irrigation Settings','تفعيل الري التلقائي':'Enable Automatic Irrigation','حد رطوبة التربة (%)':'Soil Moisture Threshold (%)','مدة تشغيل المضخة (دقيقة)':'Pump Runtime (minutes)','حفظ الإعدادات':'Save Settings','حالة الأجهزة':'Device Status','حساس رطوبة التربة':'Soil Moisture Sensor','متصل · آخر تحديث الآن':'Connected · Updated just now','نشط':'Active','حساس درجة الحرارة':'Temperature Sensor','وحدة التحكم بالمضخة':'Pump Controller','سجل الري':'Irrigation Log','اليوم، 06:30 ص':'Today, 06:30 AM','تشغيل تلقائي · 5 دقائق':'Automatic run · 5 minutes','أمس، 06:30 ص':'Yesterday, 06:30 AM',
    'لوحة التحكم':'Dashboard','ملخص أداء الملاعب وحالة الأنظمة اليوم.':'Today’s field performance and system status.','النظام يعمل':'System Operational','حجوزات اليوم':'Today’s Bookings','هذا الأسبوع':'this week','الإيرادات اليوم':'Today’s Revenue','عن أمس':'vs. yesterday','الملاعب النشطة':'Active Fields','من أصل':'out of','لاعب مسجل':'registered players','اللاعبون':'Players','توقع الحاجة إلى الري':'Irrigation Demand Forecast','لا توجد حاجة للري حاليًا':'No irrigation needed now','ملاءمة الأجواء للعب':'Weather Conditions','مناسب جدًا للعب':'Great for playing','قراءات الحساسات':'Sensor Readings','مستوى المياه بالخزان':'Tank Water Level','التحكم في المضخة':'Pump Control','مضخة الري الرئيسية':'Main Irrigation Pump','حالة التشغيل':'Operating Status','المضخة متوقفة حاليًا':'The pump is currently off',
    'إدارة الملاعب':'Field Management','إضافة الملاعب وتعديل بياناتها وأسعار الحجز.':'Add fields and edit their details and booking prices.','＋ إضافة ملعب':'+ Add Field',
    'حساب اللاعب':'Player Account','تابع مواعيدك وحجوزاتك السابقة.':'Track your upcoming and past bookings.','الكل':'All','القادمة':'Upcoming','السابقة':'Past',
    '⚡ احجز بسهولة والعب براحتك':'⚡ Book easily and enjoy your game','أهلًا، أحمد 👋':'Welcome, Ahmed 👋','جاهز لماتش جديد؟ اختار ملعبك وموعدك من هنا.':'Ready for a new match? Choose your field and time here.','متى تريد اللعب؟':'When do you want to play?','المنطقة':'Area','كل المناطق':'All Areas','مدينة نصر':'Nasr City','المعادي':'Maadi','التجمع الخامس':'Fifth Settlement','الشروق':'El Shorouk','تاريخ اللعب':'Playing Date','نوع الملعب':'Field Type','كل الأنواع':'All Types','خماسي':'5-a-side','سباعي':'7-a-side','ابحث عن ملعب ←':'Find a Field ←','اختار ملعبك':'Choose Your Field','ملاعب متاحة اليوم':'Fields Available Today','عرض التفاصيل ←':'View Details ←',
    '← رجوع للرئيسية':'← Back to Home','متاح للحجز':'Available for Booking','ملعب النخيل':'Al Nakheel Field','⌖ مدينة نصر، القاهرة':'⌖ Nasr City, Cairo','4.9 (120 تقييم)':'4.9 (120 reviews)','ملعب كرة قدم مجهز بإضاءة ليلية وأرضية نجيلة صناعية عالية الجودة، مناسب للمباريات والتدريبات.':'A football field with night lighting and quality artificial turf, suitable for matches and training.','👥 10 لاعبين':'👥 10 players','💡 إضاءة ليلية':'💡 Night Lighting','حالة الملعب الآن':'Current Field Status','● متاح':'● Available','حالة الأرضية':'Surface Condition','إضاءة تعمل':'Lights Working','التجهيزات':'Facilities','اختر اليوم':'Choose a Date','المواعيد المتاحة':'Available Time Slots','متابعة الحجز ←':'Continue Booking ←',
    'المسارات الأساسية للتنقل داخل تجربة اللاعب والمسؤول.':'Core navigation paths for players and administrators.','رحلة حجز اللاعب':'Player Booking Journey','←':'←','رحلة إدارة المسؤول':'Admin Management Journey','إدارة الملاعب':'Manage Fields',
    'مرجع الألوان والخطوط والمكونات المستخدمة في المنصة.':'Reference for the colors, fonts, and components used in the platform.','الألوان':'Colors','الخطوط':'Typography','العنوان الرئيسي — Cairo Bold':'Main Heading — Cairo Bold','العنوان الفرعي — Cairo SemiBold':'Subheading — Cairo SemiBold','النص العادي — Cairo Regular، واضح وسهل القراءة.':'Body Text — Cairo Regular, clear and readable.','المكونات':'Components','زر أساسي':'Primary Button','زر ثانوي':'Secondary Button','شارة الحالة':'Status Badge',
    'جنيه / ساعة':'EGP / hour','جنيه':'EGP','ج.م':'EGP','اختار اليوم':'Choose a date','لا توجد ملاعب مطابقة لبحثك.':'No fields match your search.','لا توجد حجوزات في هذا القسم.':'No bookings in this section.','لا توجد حجوزات مؤكدة اليوم.':'No confirmed bookings today.','إلغاء الحجز':'Cancel Booking','احجز الآن':'Book Now','إضافة ملعب':'Add Field','تعديل السعر':'Edit Price','حجز جديد':'New Booking','حالة طبيعية':'Normal','مناسب':'Suitable','محجوز':'Booked','لا توجد ملاعب مطابقة لبحثك.':'No fields match your search.','لا توجد حجوزات مطابقة':'No matching bookings','تم إلغاء الحجز وإتاحة الموعد من جديد':'Booking cancelled. The time slot is available again.','هذا الموعد تم حجزه بالفعل، اختر موعدًا آخر':'This slot is already booked. Choose another time.','اختار اليوم والموعد أولاً':'Choose a date and time first.','لا يمكن الحجز في تاريخ سابق':'You cannot book a past date.','أدخل اسمًا صحيحًا (3 أحرف على الأقل)':'Enter a valid name (at least 3 characters).','أدخل رقم هاتف مصري صحيح':'Enter a valid Egyptian phone number.','اختر مدة حجز صحيحة':'Choose a valid booking duration.','اختر تاريخًا وموعدًا صحيحين':'Choose a valid date and time.','أدخل سعرًا صحيحًا أكبر من صفر':'Enter a valid price greater than zero.','تم تحديث سعر الملعب':'Field price updated.','تمت إضافة الملعب':'Field added successfully.','تم حفظ إعدادات الري على هذا الجهاز':'Irrigation settings saved on this device.','المضخة تعمل الآن':'The pump is running now.','هل أنت متأكد من إلغاء هذا الحجز؟':'Are you sure you want to cancel this booking?','الأحد':'Sunday','الإثنين':'Monday','الثلاثاء':'Tuesday','الأربعاء':'Wednesday','الخميس':'Thursday','الجمعة':'Friday','السبت':'Saturday','الزمالك':'Zamalek','حلوان':'Helwan','التجمع الخامس':'Fifth Settlement','مدينة نصر':'Nasr City','الشروق':'El Shorouk','المعادي':'Maadi','ملعب الأبطال':'Champions Field','ملعب الجزيرة':'Al Gezira Field','ملعب الشروق':'El Shorouk Field','ملعب الفرسان':'Knights Field','ملعب النجوم':'Stars Field','ملعب النخيل':'Al Nakheel Field','جديد':'New','تعمل':'Running','متوقفة':'Stopped','ملغي':'Cancelled','مؤكد':'Confirmed','تعذر العثور على الملعب':'Could not find the field','تعذر حفظ البيانات في المتصفح':'Could not save data in the browser','أدخل منطقة الملعب':'Enter the field area','اسم الملعب الجديد':'New field name','ابدأ حجزًا جديدًا':'Start a new booking','لا يوجد حجز حديث لعرضه.':'There is no recent booking to display.','المدة المختارة تتعارض مع حجز آخر، اختر موعدًا أو مدة مختلفة':'The selected duration conflicts with another booking. Choose a different time or duration.','إلغاء':'Cancel','رقم الحجز:':'Booking ID:','ساعة':'hour','جنيه':'EGP','رطوبة مناسبة':'Good moisture level','مناسب جدًا للعب':'Excellent for playing','إضاءة تعمل':'Lights are working','اختر موعدًا آخر':'Choose another time','عرض حجوزاتي':'View My Bookings'
  };

  const phrasePairs = Object.entries(dictionary).sort((a,b) => b[0].length - a[0].length);
  function translateText(value) {
    if (language === 'ar') return value;
    const trimmed = value.trim();
    if (dictionary[trimmed]) return value.replace(trimmed, dictionary[trimmed]);
    let result = value;
    for (const [ar, en] of phrasePairs) {
      if (ar.length > 2 && result.includes(ar)) result = result.split(ar).join(en);
    }
    return result;
  }
  function applyLanguage() {
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    body.classList.toggle('lang-en', language === 'en');
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!originals.has(node)) originals.set(node, node.nodeValue);
      const original = originals.get(node);
      const next = language === 'ar' ? original : translateText(original);
      if (node.nodeValue !== next) node.nodeValue = next;
    }
    body.querySelectorAll('[placeholder],[title],[aria-label]').forEach(el => {
      for (const attr of ['placeholder','title','aria-label']) {
        if (!el.hasAttribute(attr)) continue;
        const key = `data-original-${attr}`;
        if (!el.hasAttribute(key)) el.setAttribute(key, el.getAttribute(attr));
        const original = el.getAttribute(key);
        el.setAttribute(attr, language === 'ar' ? original : translateText(original));
      }
    });
    document.title = language === 'ar' ? 'Smart Football Fields' : 'Smart Football Fields';
    const langButton = document.querySelector('#languageToggle');
    if (langButton) { langButton.textContent = language === 'ar' ? 'EN' : 'عربي'; langButton.setAttribute('aria-label', language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'); }
  }
  function applyTheme() {
    body.dataset.theme = theme;
    const button = document.querySelector('#themeToggle');
    if (button) { button.textContent = theme === 'dark' ? '☀' : '☾'; button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'); button.title = theme === 'dark' ? 'Light mode' : 'Dark mode'; }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#111a15' : '#164b35';
  }
  function addControls() {
    const topbar = document.querySelector('.topbar');
    if (!topbar || document.querySelector('.utility-actions')) return;
    const controls = document.createElement('div');
    controls.className = 'utility-actions';
    controls.innerHTML = '<button type="button" id="themeToggle" class="utility-btn" aria-label="Toggle theme" title="Toggle theme">☾</button><button type="button" id="languageToggle" class="utility-btn language-btn" aria-label="Change language">EN</button>';
    topbar.appendChild(controls);
    controls.querySelector('#themeToggle').addEventListener('click', () => { theme = theme === 'dark' ? 'light' : 'dark'; storage.set('sff_theme', theme); applyTheme(); });
    controls.querySelector('#languageToggle').addEventListener('click', () => { language = language === 'ar' ? 'en' : 'ar'; storage.set('sff_language', language); applyLanguage(); });
  }
  addControls();
  applyTheme();
  applyLanguage();
  // Translate dynamically rendered cards, booking rows and notifications as they appear.
  const observer = new MutationObserver(() => {
    if (language === 'en') applyLanguage();
  });
  observer.observe(body, { childList: true, subtree: true });
})();
