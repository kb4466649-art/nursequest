// NurseQuest Service Worker — Offline Support
// OneSignal push handling is merged into this same worker (free web push,
// no paid backend) — this must stay the FIRST statement in the file.
importScripts('https://cdn.onesignal.com/sdks/OneSignalSDK.sw.js');

const CACHE_NAME = 'nursequest-v17';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js'
];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache=>{
      // cache local assets; skip network assets that may fail
      return cache.addAll(['./','./index.html','./manifest.json']).catch(()=>{});
    })
    // NOTE: no self.skipWaiting() here on purpose. When a new version is
    // deployed (e.g. dropped onto Netlify), this lets the new worker sit in
    // "waiting" state while any already-open tabs keep running the old
    // version — instead of silently taking over. The page shows a
    // "new version available" banner and only calls skipWaiting() (via a
    // postMessage below) once the user taps "Update", so nobody gets
    // yanked onto new code without warning mid-session.
  );
});

// Lets the page (index.html) trigger activation of a waiting worker once
// the user has agreed to update, by tapping the in-app update banner.
self.addEventListener('message', e=>{
  if(e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))
    ).then(()=> self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);

  if(url.hostname === 'api.anthropic.com' || url.hostname === 'generativelanguage.googleapis.com' || url.hostname === 'firestore.googleapis.com'){
    // Always network for API calls
    e.respondWith(fetch(e.request).catch(()=> new Response('{"error":"offline"}',{headers:{'Content-Type':'application/json'}})));
    return;
  }

  // NEVER cache Google auth/config checks — a stale cached response here
  // (e.g. from before a domain was authorized) would otherwise get served
  // forever on that device, even after the real settings are fixed.
  if(url.hostname.endsWith('googleapis.com') || url.hostname === 'accounts.google.com' || url.hostname === 'apis.google.com'){
    e.respondWith(fetch(e.request));
    return;
  }

  // Network-first for the HTML shell so edits show up on a normal reload
  if(e.request.mode === 'navigate' || url.pathname.endsWith('index.html') || url.pathname.endsWith('/')){
    e.respondWith(
      fetch(e.request).then(resp=>{
        if(resp && resp.status===200){
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache=> cache.put(e.request, clone));
        }
        return resp;
      }).catch(()=> caches.match(e.request).then(c=> c || caches.match('./index.html')))
    );
    return;
  }

  // Cache-first for other static assets
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached) return cached;
      return fetch(e.request).then(resp=>{
        if(resp && resp.status===200 && e.request.method==='GET'){
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache=> cache.put(e.request, clone));
        }
        return resp;
      }).catch(()=> caches.match('./index.html'));
    })
  );
});
