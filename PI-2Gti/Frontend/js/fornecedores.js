const apiUrl = 'http://localhost:3000/fornecedores';

const form = document.getElementById('formFornecedor');
const nomeInput = document.getElementById('nomeFornecedor');
const telefoneInput = document.getElementById('telefoneFornecedor');
const emailInput = document.getElementById('emailFornecedor');
const enderecoInput = document.getElementById('enderecoFornecedor');
const cnpjInput = document.getElementById('cnpjFornecedor');

const listaContainer = document.getElementById('fornecedores-container');
const listaFornecedores = document.getElementById('lista-fornecedores');
const pesquisaInput = document.getElementById('pesquisa-fornecedor');
const paginacao = document.getElementById('paginacao');

let fornecedores = [];
let fornecedoresFiltrados = [];
let paginaAtual = 1;
const itensPorPagina = 5;
let editandoId = null;

// --- Carregar fornecedores do backend
async function carregarFornecedores() {
  try {
    const res = await fetch(apiUrl);
    fornecedores = await res.json();
    fornecedoresFiltrados = fornecedores;
    paginaAtual = 1;
    mostrarFornecedores();
    criarPaginacao();
  } catch (error) {
    alert('Erro ao carregar fornecedores: ' + error.message);
  }
}

// --- Mostrar fornecedores na lista (paginação)
function mostrarFornecedores() {
  listaFornecedores.innerHTML = '';

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const paginaItens = fornecedoresFiltrados.slice(inicio, fim);

  if (paginaItens.length === 0) {
    listaFornecedores.innerHTML = '<li>Nenhum fornecedor encontrado.</li>';
    return;
  }

  paginaItens.forEach(fornecedor => {
    const li = document.createElement('li');

    li.innerHTML = `
      <h4>${fornecedor.nome}</h4>
      <p><strong>Telefone:</strong> ${fornecedor.telefone || '-'}</p>
      <p><strong>Email:</strong> ${fornecedor.email || '-'}</p>
      <p><strong>Endereço:</strong> ${fornecedor.endereco || '-'}</p>
      <p><strong>CNPJ:</strong> ${fornecedor.cnpj || '-'}</p>
      <div class="acoes">
        <button class="btn-editar" data-id="${fornecedor.id}">Editar</button>
        <button class="btn-excluir" data-id="${fornecedor.id}">Excluir</button>
      </div>
    `;

    listaFornecedores.appendChild(li);
  });

  // Eventos dos botões editar/excluir
  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.onclick = () => iniciarEdicao(Number(btn.dataset.id));
  });

  document.querySelectorAll('.btn-excluir').forEach(btn => {
    btn.onclick = () => excluirFornecedor(Number(btn.dataset.id));
  });
}

// --- Criar botões de paginação
function criarPaginacao() {
  paginacao.innerHTML = '';
  const totalPaginas = Math.ceil(fornecedoresFiltrados.length / itensPorPagina);

  if (totalPaginas <= 1) return;

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.className = 'btn-outline';
    btn.textContent = i;
    if (i === paginaAtual) btn.disabled = true;

    btn.onclick = () => {
      paginaAtual = i;
      mostrarFornecedores();
      criarPaginacao();
    };

    paginacao.appendChild(btn);
  }
}

// --- Filtrar fornecedores pelo input de pesquisa
function filtrarFornecedores() {
  const termo = pesquisaInput.value.toLowerCase();

  fornecedoresFiltrados = fornecedores.filter(f => {
    return (
      f.nome.toLowerCase().includes(termo) ||
      (f.cnpj && f.cnpj.toLowerCase().includes(termo))
    );
  });

  paginaAtual = 1;
  mostrarFornecedores();
  criarPaginacao();
}

// --- Iniciar edição preenchendo formulário
function iniciarEdicao(id) {
  const fornecedor = fornecedores.find(f => f.id === id);
  if (!fornecedor) return alert('Fornecedor não encontrado');

  editandoId = id;

  nomeInput.value = fornecedor.nome || '';
  telefoneInput.value = fornecedor.telefone || '';
  emailInput.value = fornecedor.email || '';
  enderecoInput.value = fornecedor.endereco || '';
  cnpjInput.value = fornecedor.cnpj || '';

  document.getElementById('btnSalvarFornecedor').textContent = 'Salvar Alterações';
}

// --- Limpar formulário e voltar para cadastro
function limparFormulario() {
  form.reset();
  editandoId = null;
  document.getElementById('btnSalvarFornecedor').textContent = 'Cadastrar';
}

// --- Envio do formulário (POST ou PUT)
form.onsubmit = async (e) => {
  e.preventDefault();

  const dados = {
    nome: nomeInput.value.trim(),
    telefone: telefoneInput.value.trim(),
    email: emailInput.value.trim(),
    endereco: enderecoInput.value.trim(),
    cnpj: cnpjInput.value.trim()
  };

  if (!dados.nome || !dados.telefone || !dados.email || !dados.endereco || !dados.cnpj) {
    return alert('Por favor, preencha todos os campos obrigatórios.');
  }

  try {
    if (editandoId) {
      // PUT - atualizar fornecedor
      const res = await fetch(`${apiUrl}/${editandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      if (!res.ok) throw new Error('Erro ao atualizar fornecedor');

      alert('Fornecedor atualizado com sucesso!');
    } else {
      // POST - novo fornecedor
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      if (!res.ok) throw new Error('Erro ao cadastrar fornecedor');

      alert('Fornecedor cadastrado com sucesso!');
    }

    limparFormulario();
    carregarFornecedores();
  } catch (error) {
    alert(error.message);
  }
};

// --- Excluir fornecedor
async function excluirFornecedor(id) {
  if (!confirm('Deseja realmente excluir este fornecedor?')) return;

  try {
    const res = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });

    if (!res.ok) throw new Error('Erro ao excluir fornecedor');

    alert('Fornecedor excluído com sucesso!');
    carregarFornecedores();
  } catch (error) {
    alert(error.message);
  }
}

// --- Evento para filtro
pesquisaInput.addEventListener('input', filtrarFornecedores);

// --- Inicialização
carregarFornecedores();
