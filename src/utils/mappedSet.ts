export function appendToMappedSet<K, V>(map: Map<K, Set<V>>, key: K, value: V) {
    let set = map.get(key);
    if (!set) {
        set = new Set<V>();
        map.set(key, set);
    }

    set.add(value);

    return () => {
        removeFromMappedSet(map, key, value);
    };
}

export function removeFromMappedSet<K, V>(map: Map<K, Set<V>>, key: K, value: V) {
    const set = map.get(key);
    if (!set) return;

    set.delete(value);
    if (set.size === 0) {
        map.delete(key);
    }
}
