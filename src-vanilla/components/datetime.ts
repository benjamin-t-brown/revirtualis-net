export const createDateTime = (date: string) => {
  if (
    date.toLowerCase() === 'tba' ||
    date.toLowerCase() === 'tbd' ||
    date.toLowerCase() === 'soon'
  ) {
    return date;
  }
  return `<span class="date-time hidden">${+new Date(date)}</span>`;
};
