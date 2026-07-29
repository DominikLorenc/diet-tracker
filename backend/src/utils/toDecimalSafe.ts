// Prisma converts a JS `number` straight into its arbitrary-precision Decimal
// type, which exposes the raw IEEE-754 binary value (e.g. 9.7 -> "9.699999999999999")
// instead of JS's own shortest round-trip string. Stringifying here first,
// with JS's own Number#toString, avoids that drift for every Decimal column.
export const toDecimalSafe = <T extends Record<string, unknown>>(data: T, fields: readonly (keyof T)[]): T => {
    const safe = { ...data };
    for (const field of fields) {
        const value = safe[field];
        if (typeof value === 'number') {
            (safe as Record<string, unknown>)[field as string] = value.toString();
        }
    }
    return safe;
};
