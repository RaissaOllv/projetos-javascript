document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('formLogin');

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    try {
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.erro || 'Erro no login');

      alert(data.mensagem);
      console.log('Usuário logado:', data.usuario);

      // Redireciona para dashboard após login bem-sucedido
      window.location.href = 'dashboard.html';

    } catch (error) {
      alert(error.message);
    }
  });
});
