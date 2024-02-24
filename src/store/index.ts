import type { GetStore, SetStore, Store } from './types.d'

const createStore = <S extends Record<string, unknown>>(
    storeCreator: (set: SetStore<S>, get: GetStore<S>) => S,
) => {
    let store = {} as S
    /** Delayed call */
    const setStore: SetStore<S> = (stateMutator) => stateMutator(store)
    const getStore: GetStore<S> = () => store
    store = storeCreator(setStore, getStore)
    return {
        store,
        getStore,
        setStore,
    }
}

export const { store, getStore, setStore } = createStore<Store>(() => ({}))
