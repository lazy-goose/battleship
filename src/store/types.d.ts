export type Store = Record<string, unknown>

type Rec = Record<string, unknown>

export type SetStore<St> = (stateMutator: (state: St) => void) => void
export type GetStore<St> = () => St
export type SliceCreator<Sl extends Rec, St extends Rec = Store> = (
    set: SetStore<St>,
    get: GetStore<St>,
) => Sl
