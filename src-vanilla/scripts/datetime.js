window.addEventListener('DOMContentLoaded', () => {
  const dateTimes = document.querySelectorAll('.date-time');
  dateTimes.forEach((dateTime) => {
    dateTime.textContent = new Date(
      Number(dateTime.textContent)
    ).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    dateTime.classList.remove('hidden');
  });
});
