const urlBase = 'http://localhost:3000';

const form = document.getElementById('formProduto');
const selectCategoria = document.getElementById('categoriaProduto');
const selectFornecedor = document.getElementById('fornecedorProduto');
const listaProdutos = document.getElementById('lista-produtos');
const pesquisaInput = document.getElementById('pesquisaProduto');
const btnToggleLista = document.getElementById('btnToggleLista');
const produtosContainer = document.getElementById('produtos-container');
const paginacaoDiv = document.getElementById('paginacao');

let produtos = [];
let categorias = [];
let fornecedores = [];

let paginaAtual = 1;
const itensPorPagina = 5;
let editandoId = null;

// Carrega categorias para select
async function carregarCategorias() {
  try {
    const res = await fetch(`${urlBase}/categorias`);
    categorias = await res.json();
    selectCategoria.innerHTML = `<option disabled selected value="">Categoria</option>`;
    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.nome;
      selectCategoria.appendChild(option);
    });
  } catch (error) {
    alert('Erro ao carregar categorias');
    console.error(error);
  }
}

// Carrega fornecedores para select
async function carregarFornecedores() {
  try {
    const res = await fetch(`${urlBase}/fornecedores`);
    fornecedores = await res.json();
    selectFornecedor.innerHTML = `<option disabled selected value="">Fornecedor</option>`;
    fornecedores.forEach(forn => {
      const option = document.createElement('option');
      option.value = forn.id;
      option.textContent = forn.nome;
      selectFornecedor.appendChild(option);
    });
  } catch (error) {
    alert('Erro ao carregar fornecedores');
    console.error(error);
  }
}

// Carrega produtos do backend
async function carregarProdutos() {
  try {
    const res = await fetch(`${urlBase}/produtos`);
    produtos = await res.json();
    paginaAtual = 1;
    mostrarProdutos();
  } catch (error) {
    alert('Erro ao carregar produtos');
    console.error(error);
  }
}

// Mostra produtos na lista, com filtro e paginação
function mostrarProdutos() {
  const filtro = pesquisaInput.value.toLowerCase();
  let filtrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(filtro) || 
    (p.codigo_barras && p.codigo_barras.includes(filtro))
  );

  const totalPaginas = Math.ceil(filtrados.length / itensPorPagina);
  if (paginaAtual > totalPaginas) paginaAtual = 1;
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const paginados = filtrados.slice(inicio, fim);

  listaProdutos.innerHTML = '';

  if (paginados.length === 0) {
    listaProdutos.innerHTML = '<li>Nenhum produto encontrado.</li>';
    paginacaoDiv.innerHTML = '';
    return;
  }

  paginados.forEach(prod => {
    const nomeCategoria = categorias.find(c => c.id === prod.id_categoria)?.nome || 'Categoria não encontrada';
    const nomeFornecedor = fornecedores.find(f => f.id === prod.id_fornecedor)?.nome || 'Fornecedor não encontrado';

    const li = document.createElement('li');
    li.innerHTML = `
      <h4>${prod.nome}</h4>
      <p><strong>Categoria:</strong> ${nomeCategoria}</p>
      <p><strong>Fornecedor:</strong> ${nomeFornecedor}</p>
      <p><strong>Cód. Barras:</strong> ${prod.codigo_barras || '-'}</p>
      <p><strong>Custo Líquido:</strong> ${prod.custoLiquido != null ? Number(prod.custoLiquido).toFixed(2) : '-'}</p>
      <p><strong>Custo Bruto:</strong> ${prod.custoBruto != null ? Number(prod.custoBruto).toFixed(2) : '-'}</p>
      <p><strong>Preço Venda:</strong> ${prod.precoVenda != null ? Number(prod.precoVenda).toFixed(2) : '-'}</p>
      <p><strong>Lucro:</strong> ${prod.lucro != null ? Number(prod.lucro).toFixed(2) : '-'}</p>
      <div class="acoes">
        <button class="btn-editar" data-id="${prod.id}">Editar</button>
        <button class="btn-excluir" data-id="${prod.id}">Excluir</button>
      </div>
    `;
    listaProdutos.appendChild(li);
  });

  // Paginação
  paginacaoDiv.innerHTML = '';
  for(let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = i === paginaAtual ? 'btn-outline active' : 'btn-outline';
    btn.addEventListener('click', () => {
      paginaAtual = i;
      mostrarProdutos();
    });
    paginacaoDiv.appendChild(btn);
  }

  // Eventos editar e excluir
  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.onclick = () => carregarParaEdicao(btn.dataset.id);
  });
  document.querySelectorAll('.btn-excluir').forEach(btn => {
    btn.onclick = () => excluirProduto(btn.dataset.id);
  });
}

// Cadastrar ou editar produto
form.addEventListener('submit', async e => {
  e.preventDefault();

  const dados = {
    nome: document.getElementById('nomeProduto').value,
    descricao: '', // Pode adicionar campo no form se quiser
    codigo_interno: document.getElementById('codInternoProduto').value,
    id_categoria: Number(document.getElementById('categoriaProduto').value),
    id_fornecedor: Number(document.getElementById('fornecedorProduto').value),
    codigo_barras: document.getElementById('codBarrasProduto').value,
    custoLiquido: parseFloat(document.getElementById('custoLiquidoProduto').value),
    custoBruto: parseFloat(document.getElementById('custoBrutoProduto').value),
    precoVenda: parseFloat(document.getElementById('precoVendaProduto').value),
    lucro: parseFloat(document.getElementById('lucroProduto').value),
    unidade_venda: document.getElementById('unidadeVendaSelect').value,
    icms: document.getElementById('icmsProduto').value,
    ncm: document.getElementById('ncmProduto').value,
  };

  try {
    if (editandoId) {
      // Editar
      const res = await fetch(`${urlBase}/produtos/${editandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      if (!res.ok) throw new Error('Erro ao editar produto');
      alert('Produto editado com sucesso');
    } else {
      // Cadastrar
      const res = await fetch(`${urlBase}/produtos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      if (!res.ok) throw new Error('Erro ao cadastrar produto');
      alert('Produto cadastrado com sucesso');
    }
    form.reset();
    editandoId = null;
    carregarProdutos();
  } catch (error) {
    alert(error.message);
    console.error(error);
  }
});

// Carregar produto para edição
function carregarParaEdicao(id) {
  const prod = produtos.find(p => p.id == id);
  if (!prod) return alert('Produto não encontrado');

  editandoId = id;
  document.getElementById('nomeProduto').value = prod.nome || '';
  document.getElementById('codInternoProduto').value = prod.codigo_interno || '';
  document.getElementById('categoriaProduto').value = prod.id_categoria || '';
  document.getElementById('fornecedorProduto').value = prod.id_fornecedor || '';
  document.getElementById('codBarrasProduto').value = prod.codigo_barras || '';
  document.getElementById('custoLiquidoProduto').value = prod.custoLiquido ?? '';
  document.getElementById('custoBrutoProduto').value = prod.custoBruto ?? '';
  document.getElementById('precoVendaProduto').value = prod.precoVenda ?? '';
  document.getElementById('lucroProduto').value = prod.lucro ?? '';
  document.getElementById('unidadeVendaSelect').value = prod.unidade_venda || '';
  document.getElementById('icmsProduto').value = prod.icms || '';
  document.getElementById('ncmProduto').value = prod.ncm || '';
}

// Excluir produto
async function excluirProduto(id) {
  if (!confirm('Deseja realmente excluir este produto?')) return;
  try {
    const res = await fetch(`${urlBase}/produtos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir produto');
    alert('Produto excluído com sucesso');
    carregarProdutos();
  } catch (error) {
    alert(error.message);
    console.error(error);
  }
}

// Atualiza lucro automaticamente ao alterar custos
document.getElementById('custoLiquidoProduto').addEventListener('input', calcularLucro);
document.getElementById('custoBrutoProduto').addEventListener('input', calcularLucro);

function calcularLucro() {
  const custoLiq = parseFloat(document.getElementById('custoLiquidoProduto').value) || 0;
  const custoBru = parseFloat(document.getElementById('custoBrutoProduto').value) || 0;
  if (custoLiq > 0) {
    const lucro = ((custoBru - custoLiq) / custoLiq) * 100;
    document.getElementById('lucroProduto').value = lucro.toFixed(2);
  } else {
    document.getElementById('lucroProduto').value = '';
  }
}

// Pesquisa ao digitar
pesquisaInput.addEventListener('input', () => {
  paginaAtual = 1;
  mostrarProdutos();
});

// Toggle visibilidade da lista de produtos
btnToggleLista.addEventListener('click', () => {
  if (produtosContainer.style.display === 'none') {
    produtosContainer.style.display = 'block';
    btnToggleLista.textContent = 'Ocultar Produtos Cadastrados';
  } else {
    produtosContainer.style.display = 'none';
    btnToggleLista.textContent = 'Mostrar Produtos Cadastrados';
  }
});

// Inicialização ao carregar a página
(async function () {
  await carregarCategorias();
  await carregarFornecedores();
  await carregarProdutos();
})();
