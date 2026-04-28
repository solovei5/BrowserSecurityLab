(function () {
  const button = document.createElement('button');
  button.textContent = 'Chat with Support';

  button.style.position = 'fixed';
  button.style.right = '20px';
  button.style.bottom = '20px';
  button.style.padding = '12px 18px';
  button.style.background = '#007bff';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '8px';
  button.style.cursor = 'pointer';
  button.style.zIndex = '9999';

  document.body.appendChild(button);

  button.addEventListener('click', () => {
    fetch('http://localhost:4000/api/support/messages')
      .then(res => res.json())
      .then(data => {
        alert('Support says: ' + data.message);
      })
      .catch(err => {
        console.error('Support fetch failed:', err);
      });
  });
})();