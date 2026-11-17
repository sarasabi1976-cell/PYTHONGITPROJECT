document.addEventListener('DOMContentLoaded', () => {
  let completed = Number(localStorage.getItem('updraftDone') || '12');
  const checkboxes = document.querySelectorAll('.plan-check');

  checkboxes.forEach((checkbox, index) => {
    checkbox.checked = index < completed;

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        completed++;
      } else {
        completed = Math.max(0, completed - 1);
      }

      localStorage.setItem('updraftDone', completed);

      const count = document.querySelector('#plan-count');
      if (count) {
        count.textContent = `${completed} of 18 sessions complete`;
      }
    });
  });
});