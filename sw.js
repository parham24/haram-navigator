// نام انبار (Cache) ما. اگر خواستید برنامه را آپدیت کنید، این نام را تغییر دهید.
const CACHE_NAME = 'haram-map-v2';

// لیستی از تمام فایل‌های اصلی که باید در همان ابتدا ذخیره شوند.
const urlsToCache = [
  './', // صفحه اصلی
  './index.html',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css',
  'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js'
];

// رویداد نصب: وقتی سرویس ورکر برای اولین بار نصب می‌شود، اجرا می‌شود.
self.addEventListener('install', event => {
  // منتظر بمان تا کار ذخیره‌سازی تمام شود.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('انبار باز شد، در حال ذخیره فایل‌های اصلی...');
        return cache.addAll(urlsToCache);
      })
  );
});

// رویداد fetch: هر بار که اپلیکیشن یک درخواست (مثلاً برای یک عکس یا فایل) ارسال می‌کند، اجرا می‌شود.
self.addEventListener('fetch', event => {
  event.respondWith(
    // ابتدا در انبار (Cache) به دنبال درخواست بگرد.
    caches.match(event.request)
      .then(response => {
        // اگر فایل در انبار پیدا شد، همان را برگردان.
        if (response) {
          return response;
        }

        // اگر فایل در انبار نبود، آن را از اینترنت درخواست کن.
        return fetch(event.request).then(
          networkResponse => {
            // اگر درخواست موفقیت‌آمیز بود، یک کپی از آن را در انبار ذخیره کن تا دفعه بعد آفلاین در دسترس باشد.
            // این بخش برای ذخیره کاشی‌های نقشه حیاتی است.
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
  );

});
