export const isRecord = (
    unknown: unknown,
): unknown is Record<string, unknown> =>
    typeof unknown === 'object' && unknown !== null
