import { toHijri } from 'hijri-converter';

export const getHijriDate = (date = new Date()) => {
  const hijri = toHijri(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return `${hijri.hDay} ${hijri.hMonthName} ${hijri.hYear} AH`;
};