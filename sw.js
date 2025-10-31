// Service Worker para Maria Flor Sistema
// Permite funcionamento offline e cache inteligente

const CACHE_NAME = 'maria-flor-v1.0.0';
const STATIC_CACHE = 'maria-flor-static-v1';
const DYNAMIC_CACHE = 'maria-flor-dynamic-v1';

// Arquivos essenciais para cache
const STATIC_FILES = [
    '/',
    '/index.html',
    '/pages/dashboard.html',
    '/css/login.css',
    '/css/dashboard.css',
    '/js/login.js',
    '/js/dashboard.js',
    '/js/client-config.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install Service Worker
self.addEventListener('install', event => {
    console.log('🔧 Service Worker instalando...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 Fazendo cache dos arquivos estáticos');
                return cache.addAll(STATIC_FILES.map(url => {
                    return new Request(url, { mode: 'no-cors' });
                }));
            })
            .catch(error => {
                console.error('Erro no cache:', error);
            })
    );
    
    self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', event => {
    console.log('✅ Service Worker ativado');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('🗑️ Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    self.clients.claim();
});

// Fetch interceptor
self.addEventListener('fetch', event => {
    // Apenas interceptar requests GET
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Se encontrar no cache, retornar
                if (response) {
                    return response;
                }
                
                // Senão, fazer fetch e cachear
                return fetch(event.request)
                    .then(response => {
                        // Verificar se é uma resposta válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clonar a resposta
                        const responseToCache = response.clone();
                        
                        // Adicionar ao cache dinâmico
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // Se offline, retornar página offline ou página principal
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Background sync para quando voltar online
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('🔄 Sincronização em background');
        event.waitUntil(syncData());
    }
});

// Notificações push (para funcionalidades futuras)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/img/icon-192.png',
            badge: '/img/icon-72.png',
            vibrate: [100, 50, 100],
            data: {
                url: data.url || '/'
            }
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Função para sincronizar dados
function syncData() {
    return new Promise((resolve) => {
        // Aqui você pode implementar sincronização com servidor
        // Por enquanto, apenas simular
        console.log('📤 Dados sincronizados com sucesso');
        resolve();
    });
}

// Message handler para comunicação com a aplicação
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});