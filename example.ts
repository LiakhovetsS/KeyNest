import KNStore from "keynest-store";
const store = new KNStore<string, any>({
    cleanupEnabled: true,
    cleanupIntervalMs: 1000 * 60 * 60, // 1 година
    staleThresholdMs: 1000 * 60 * 60 * 2 // 2 години
});
store.on('expired', (key, entry) => {
    console.log(`Key ${key} expired`, entry);
});

store.on('deleted', (key, entry) => {
    console.log(`Key ${key} deleted`, entry);
});

store.on('prune', (list=[]) => {
    console.log(`Pruned ${list.length} entries`, list);
});

store.set('key', {id: 1, sum: 150});
store.set('key2', {id: 1, sum: 130}, 1500);
store.set('orderId', '234454534', 30_000);