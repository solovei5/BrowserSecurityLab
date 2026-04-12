document.cookie = "SessionID=123456; path=/";

const emailList = document.getElementById('email-list');
const emailContent = document.getElementById('email-content');

fetch('/api/emails')
  .then(res => res.json())
  .then(emails => {
    emails.forEach(email => {
      const item = document.createElement('div');
      item.className = 'email-item';
      item.innerHTML = `
        <strong>${email.subject}</strong>
        <span>From: ${email.sender}</span>
      `;

      item.addEventListener('click', () => {
        emailContent.innerHTML = `
          <h2>${email.subject}</h2>
          <p><strong>From:</strong> ${email.sender}</p>
          <p>${email.body}</p>
        `;
      });

      emailList.appendChild(item);
    });
  })
  .catch(err => {
    console.error('Failed to load emails:', err);
  });