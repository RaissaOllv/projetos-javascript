const urlBase = "http://localhost:3000";

const inputProduto = document.getElementById("input-produto");
const listaSugestoes = document.getElementById("lista-sugestoes");
const formEntrada = document.getElementById("form-entrada-estoque");
const listaEstoque = document.getElementById("lista-estoque");
const paginacao = document.getElementById("paginacao");

let produtos = [];
let entradasEstoque = [];
let paginaAtual = 1;
const itensPorPagina = 5;

// Busca todos os produtos do backend
async function carregarProdutos() {
  try {
    const res = await fetch(`${urlBase}/produtos`);
    if (!res.ok) throw new Error("Erro ao buscar produtos");
    produtos = await res.json();
  } catch (err) {
    console.error(err);
  }
}

// Mostra as sugestões conforme o texto digitado
function mostrarSugestoes(texto) {
  listaSugestoes.innerHTML = "";
  if (!texto) return;

  const textoLower = texto.toLowerCase();
  const sugeridos = produtos
    .filter(p => p.nome.toLowerCase().includes(textoLower))
    .slice(0, 5);

  sugeridos.forEach(prod => {
    const item = document.createElement("div");
    item.classList.add("item-sugestao");
    item.textContent = prod.nome;
    item.dataset.id = prod.id;
    item.addEventListener("click", () => {
      inputProduto.value = prod.nome;
      inputProduto.dataset.produtoId = prod.id;
      listaSugestoes.innerHTML = "";
    });
    listaSugestoes.appendChild(item);
  });
}

// Exibe as entradas de estoque na lista com paginação
function mostrarEstoque() {
  listaEstoque.innerHTML = "";

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const paginaItens = entradasEstoque.slice(inicio, fim);

  if (paginaItens.length === 0) {
    listaEstoque.innerHTML = "<li>Nenhuma entrada cadastrada.</li>";
    paginacao.innerHTML = "";
    return;
  }

  paginaItens.forEach(entrada => {
    const prod = produtos.find(p => p.id === entrada.produtoId);
    const li = document.createElement("li");
    li.classList.add("card-estoque");
    li.innerHTML = `
      <h3>${prod ? prod.nome : "Produto removido"}</h3>
      <p><strong>Quantidade:</strong> ${entrada.quantidade}</p>
      <p><strong>Data da Entrada:</strong> ${entrada.dataEntrada}</p>
      <p><strong>Custo:</strong> R$ ${entrada.custo.toFixed(2)}</p>
      <p><strong>Lote:</strong> ${entrada.lote}</p>
      <p><strong>Vencimento:</strong> ${entrada.dataVencimento}</p>
      <p><strong>Observações:</strong> ${entrada.obs || "-"}</p>
    `;
    listaEstoque.appendChild(li);
  });

  montarPaginacao();
}

// Cria os botões para navegação da paginação
function montarPaginacao() {
  paginacao.innerHTML = "";
  const totalPaginas = Math.ceil(entradasEstoque.length / itensPorPagina);
  if (totalPaginas <= 1) return;

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.disabled = i === paginaAtual;
    btn.addEventListener("click", () => {
      paginaAtual = i;
      mostrarEstoque();
    });
    paginacao.appendChild(btn);
  }
}

// Evento input para mostrar sugestões ao digitar no campo produto
inputProduto.addEventListener("input", () => {
  mostrarSugestoes(inputProduto.value);
});

// Fecha a lista de sugestões ao clicar fora do campo ou da lista
document.addEventListener("click", (e) => {
  if (!inputProduto.contains(e.target) && !listaSugestoes.contains(e.target)) {
    listaSugestoes.innerHTML = "";
  }
});

// Evento submit para salvar uma nova entrada de estoque
formEntrada.addEventListener("submit", (e) => {
  e.preventDefault();

  const produtoId = Number(inputProduto.dataset.produtoId);
  const quantidade = Number(document.getElementById("input-qtd").value);
  const dataEntrada = document.getElementById("input-data-entrada").value;
  const custo = Number(document.getElementById("input-custo").value);
  const lote = document.getElementById("input-lote").value.trim();
  const dataVencimento = document.getElementById("input-data-vencimento").value;
  const obs = document.getElementById("textarea-obs").value.trim();

  if (!produtoId) {
    alert("Selecione um produto válido da lista.");
    return;
  }

  // Adiciona a nova entrada no começo da lista
  entradasEstoque.unshift({
    produtoId,
    quantidade,
    dataEntrada,
    custo,
    lote,
    dataVencimento,
    obs
  });

  formEntrada.reset();
  inputProduto.dataset.produtoId = "";
  listaSugestoes.innerHTML = "";
  paginaAtual = 1;
  mostrarEstoque();
});

// Inicializa a página carregando produtos e exibindo estoque
async function init() {
  await carregarProdutos();
  mostrarEstoque();
}

document.addEventListener("DOMContentLoaded", init);
