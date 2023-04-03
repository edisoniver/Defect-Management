self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('defect-tracker-cache').then((cache) => {
        return cache.addAll([
          '/',
          '/app.css',
          '/css/bootstrap.min.css',
          'https://code.jquery.com/jquery-3.6.0.min.js',
          'https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js',
          '/js/bootstrap.bundle.min.js',
          '/js/client.js',
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });
  