export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
export const pct = (n: number) => `${Math.round(n * 100)}%`;
