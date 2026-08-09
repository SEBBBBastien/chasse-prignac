// Cache des tuiles de carte (OpenStreetMap + satellite Esri) pour un usage hors-réseau
// sur les zones déjà consultées (pistes, terrain sans réseau, etc.)
var CACHE_NAME = 'chasse-tiles-v1';
var TILE_HOSTS = ['tile.openstreetmap.org', 'server.arcgisonline.com'];

self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', function(event){
  var url = event.request.url;
  var isTile = TILE_HOSTS.some(function(h){ return url.indexOf(h) !== -1; });
  if(!isTile) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.match(event.request).then(function(cached){
        var networkFetch = fetch(event.request).then(function(resp){
          if(resp && resp.status === 200) cache.put(event.request, resp.clone());
          return resp;
        }).catch(function(){ return cached; });
        // cache-first : sert la tuile stockée immédiatement si dispo, sinon attend le réseau
        return cached || networkFetch;
      });
    })
  );
});
