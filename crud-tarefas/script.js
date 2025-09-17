const API = 'https://crud-tarefas-backend-production.up.railway.app/tarefas';
const lista = document.getElementById('lista-tarefas');
const form = document.getElementById('form-tarefa');
const tituloInput = document.getElementById('titulo');
const dataHoraInput = document.getElementById('dataHora');

function carregarTarefas() {
  fetch(API)
    .then(res => res.json())
    .then(tarefas => {
      lista.innerHTML = '';
      tarefas.forEach(t => {
        const li = document.createElement('li');

        // Título da tarefa
        const span = document.createElement('span');
        span.textContent = t.titulo;

        // Data e hora da tarefa formatada
        const dataSpan = document.createElement('small');
        if (t.dataHora) {
          const data = new Date(t.dataHora);
          dataSpan.textContent = data.toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          });
          dataSpan.style.marginLeft = '10px';
          dataSpan.style.color = '#666';
        }

        // Select para status
        const select = document.createElement('select');
        ['Pendente', 'Concluída'].forEach(opt => {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt;
          if (t.status && t.status.toLowerCase() === opt.toLowerCase()) option.selected = true;
          select.appendChild(option);
        });

        select.addEventListener('change', () => {
          fetch(`${API}/${t.id}`, {  // Usando rota correta com /:id
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: select.value })
          }).then(carregarTarefas);
        });

        // Botão excluir
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.onclick = () => deletar(t.id);

        // Monta o item da lista
        li.appendChild(span);
        li.appendChild(dataSpan);
        li.appendChild(select);
        li.appendChild(btnExcluir);

        lista.appendChild(li);
      });
    });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nova = {
    titulo: tituloInput.value,
    status: 'Pendente',
    dataHora: dataHoraInput.value
  };

  fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nova)
  }).then(() => {
    tituloInput.value = '';
    dataHoraInput.value = '';
    carregarTarefas();
  });
});

function deletar(id) {
  fetch(`${API}/${id}`, { method: 'DELETE' })  // Usando rota correta com /:id
    .then(carregarTarefas);
}

carregarTarefas();
