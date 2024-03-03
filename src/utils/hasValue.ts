export const hasValue = <R = unknown>(
    record: Record<string, R>,
    value: unknown,
): value is keyof typeof record =>
    Object.values(record).some((val) => val === value)
