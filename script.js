let produtos = JSON.parse(localStorage.getItem('produtos')) || [];

function adicionarProduto() {

  const liga = document.getElementById('liga').value;
  const clube = document.getElementById('clube').value;
  const epoca = document.getElementById('epoca').value;
  const tipo = document.getElementById('tipo').value;
  const tamanho = document.getElementById('tamanho').value;
  const quantidade = Number(document.getElementById('quantidade').value);
  const preco = Number(document.getElementById('preco').value);
  const frete = Number(document.getElementById('frete').value);
  const venda = Number(document.getElementById('venda').value);

  const cliente = document.getElementById('cliente').value;
  const telefone = document.getElementById('telefone').value;
  const morada = document.getElementById('morada').value;
  const cep = document.getElementById('cep').value;
  const pais = document.getElementById('pais').value;
  const localidade = document.getElementById('localidade').value;
  const rastreio = document.getElementById('rastreio').value;

  const custo = preco + frete;
  const lucro = (venda - custo) * quantidade;

  const produto = {
    liga,
    clube,
    epoca,
    tipo,
    tamanho,
    quantidade,
    preco,
    frete,
    venda,
    custo,
    lucro,
    cliente,
    telefone,
    morada,
    cep,
    pais,
    localidade,
    rastreio
  };

  produtos.push(produto);

  localStorage.setItem('produtos', JSON.stringify(produtos));

  renderizarProdutos();
}

function renderizarProdutos() {

  const tabela = document.getElementById('tabelaProdutos');

  tabela.innerHTML = '';

  let totalStock = 0;
  let lucroTotal = 0;

  produtos.forEach(produto => {

    totalStock += produto.quantidade;
    lucroTotal += produto.lucro;

    tabela.innerHTML += `
      <tr>
        <td>${produto.clube}</td>
        <td>${produto.tamanho}</td>
        <td>${produto.quantidade}</td>
        <td>${produto.custo}€</td>
        <td>${produto.venda}€</td>
        <td>${produto.lucro}€</td>
        <td>${produto.cliente}</td>
        <td>${produto.rastreio}</td>
      </tr>
    `;
  });

  document.getElementById('totalStock').innerText = totalStock;
  document.getElementById('lucroTotal').innerText = lucroTotal + '€';
  document.getElementById('vendidos').innerText = produtos.length;
}

renderizarProdutos();
