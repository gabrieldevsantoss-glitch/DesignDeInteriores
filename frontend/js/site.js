/**
 * Interacoes simples do navegador (sem bibliotecas):
 *  - menu do celular
 *  - carrossel de produtos
 *  - linhas de itens no formulario de pedido
 */

// ---------- Menu do celular: botao com data-alternar="#id" ----------
document.querySelectorAll('[data-alternar]').forEach((botao) => {
  const alvo = document.querySelector(botao.dataset.alternar);
  botao.addEventListener('click', () => alvo.classList.toggle('aberto'));
});

// ---------- Carrossel de produtos: setas rolam o trilho ----------
document.querySelectorAll('.carrossel').forEach((carrossel) => {
  const trilho = carrossel.querySelector('.carrossel-trilho');
  carrossel.querySelectorAll('[data-rolar]').forEach((seta) => {
    seta.addEventListener('click', () => {
      const passo = trilho.clientWidth * 0.8 * Number(seta.dataset.rolar);
      trilho.scrollBy({ left: passo, behavior: 'smooth' });
    });
  });
});

// ---------- Formulario de pedido: adicionar/remover itens ----------
const listaItens = document.querySelector('[data-itens]');
if (listaItens) {
  const modelo = listaItens.querySelector('.item-linha');

  document.querySelector('[data-adicionar-item]').addEventListener('click', () => {
    const nova = modelo.cloneNode(true);
    nova.querySelectorAll('select, input').forEach((campo) => {
      campo.value = campo.type === 'number' ? 1 : '';
    });
    listaItens.appendChild(nova);
  });

  // Remove a linha (mantem pelo menos uma)
  listaItens.addEventListener('click', (evento) => {
    if (!evento.target.matches('[data-remover-item]')) return;
    if (listaItens.children.length > 1) evento.target.closest('.item-linha').remove();
  });
}

// ---------- Pedido: preenche o endereco ao escolher o cliente ----------
const seletorCliente = document.querySelector('[data-cliente-endereco]');
if (seletorCliente) {
  const endereco = document.querySelector('#endereco_entrega');
  seletorCliente.addEventListener('change', () => {
    const opcao = seletorCliente.selectedOptions[0];
    if (opcao && opcao.dataset.endereco && !endereco.value) endereco.value = opcao.dataset.endereco;
  });
}
