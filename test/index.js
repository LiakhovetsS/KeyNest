const test = require('node:test');
const assert = require('node:assert');
const Store = require('../dist');

test('init store', async (t) => {
  const store = new Store({
    cleanupEnabled: true,//вмикає автоматичне очищення неактивних записів
    cleanupIntervalMs: 1000 * 60 * 60, // 2 hour інтервал між перевірками очищення
    staleThresholdMs: 1000 * 60 * 60 * 2// 4 hours час, після якого запис вважається застарілим
  });

  store.on('expired', (key, entry) => {
    console.log(`Key ${ key } expired`, entry);
  });

  store.on('deleted', (key, entry) => {
    console.log(`Key ${ key } deleted`, entry);
  });

  store.on('prune', (list = []) => {
    console.log(`Pruned ${ list.length } entries`, list);
  });

  store.set('key', { id: 1, sum: 150 });
  store.set('key2', {id: 1, sum: 130}, 1500);
  store.set('orderId', '234454534');
  setTimeout(() => {
    const value = store.get('key');
    console.log('Value for key:', value);
  }, 60_000);

});