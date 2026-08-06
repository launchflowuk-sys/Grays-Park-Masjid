/**
 * Today's date in the user's LOCAL timezone as "YYYY-MM-DD".
 *
 * Do not use `new Date().toISOString().slice(0, 10)` for this — it returns
 * the UTC date, which during British Summer Time (UTC+1) yields *yesterday*
 * between 00:00 and 01:00 local time.
 */
export function todayIsoLocal(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
