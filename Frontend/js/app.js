document.addEventListener('DOMContentLoaded', () => {
  const today = document.getElementById('today');

  if (today) {
    today.textContent = new Intl.DateTimeFormat('en', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(new Date());
  }

  document.querySelectorAll('.task input').forEach(input => {
    input.addEventListener('change', () => {
      input.closest('.task').classList.toggle('done', input.checked);
      toast(input.checked
        ? 'Nice work — task checked off.'
        : 'Task added back to today.');
    });
  });

  document.querySelectorAll('[data-toast]').forEach(button => {
    button.addEventListener('click', () => toast(button.dataset.toast));
  });

  document.querySelectorAll('.choice').forEach(button => {
    button.addEventListener('click', () => {
      button.parentElement.querySelectorAll('.choice').forEach(choice => {
        choice.classList.remove('selected');
      });
      button.classList.add('selected');
    });
  });

  document.querySelectorAll('.tab').forEach(button => {
    button.addEventListener('click', () => {
      button.parentElement.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
      });
      button.classList.add('active');

      document.querySelectorAll('[data-tab-content]').forEach(section => {
        section.hidden = section.dataset.tabContent !== button.dataset.tab;
      });
    });
  });
});

function toast(message) {
  const notification = document.createElement('div');
  notification.className = 'toast';
  notification.textContent = message;
  document.body.append(notification);

  setTimeout(() => notification.remove(), 2600);
}