document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("user")) || {};
  let prodotti = JSON.parse(localStorage.getItem("prodotti")) || [];
  const ordini = JSON.parse(localStorage.getItem("ordini")) || [];

  const userSection = document.getElementById("user-data");
  const orderList = document.getElementById("order-history");
  const contProdotti = document.getElementById("cont-prodotti");
  const contOrdini = document.getElementById("cont-ordini");

  const popup = document.getElementById("popup-prodotti");
  const popupTitle = document.getElementById("popup-title");
  const popupClose = document.getElementById("popup-close");
  const listaProdotti = document.getElementById("lista-prodotti");

  const formAggiungi = document.getElementById("form-aggiungi");
  const formModifica = document.getElementById("form-modifica");
  const inputNomeNuovo = document.getElementById("nome-nuovo");
  const inputPrezzoNuovo = document.getElementById("prezzo-nuovo");
  const inputModNome = document.getElementById("mod-nome");
  const inputModPrezzo = document.getElementById("mod-prezzo");
  const btnSalvaNuovo = document.getElementById("btn-salva-nuovo");
  const btnSalvaModifica = document.getElementById("btn-salva-modifica");

  let prodottoInModificaIndex = null;

  if (user && user.nome && userSection) {
    userSection.innerHTML = `
      <p><strong>Nome:</strong> ${user.nome}</p>
      <p><strong>Cognome:</strong> ${user.cognome}</p>
      <p><strong>Email:</strong> ${user.email}</p>
    `;
  }

  if (role === "cliente") {
    toggleSezioni("cliente");
    popolaStoricoOrdini();
  } else if (role === "venditore") {
    toggleSezioni("venditore");
    aggiornaContatori();
    setupBottoniGestioneProdotti();
  } else {
    window.location.href = "../LoginForm/login-registration.html";
  }

  function toggleSezioni(ruolo) {
    document.querySelectorAll(".cliente-only").forEach(el => el.style.display = ruolo === "cliente" ? "block" : "none");
    document.querySelectorAll(".venditore-only").forEach(el => el.style.display = ruolo === "venditore" ? "block" : "none");
  }

  function popolaStoricoOrdini() {
    if (!orderList) return;
    orderList.innerHTML = "";
    ordini.forEach(order => {
      const li = document.createElement("li");
      li.textContent = `🧾 ${order.prodotto} - ${order.data}`;
      orderList.appendChild(li);
    });
  }

  function aggiornaContatori() {
    if (contProdotti) contProdotti.textContent = prodotti.length;
    if (contOrdini) contOrdini.textContent = ordini.length;
  }

  function salvaProdotti() {
    localStorage.setItem("prodotti", JSON.stringify(prodotti));
    aggiornaContatori();
  }

  function setupBottoniGestioneProdotti() {
    document.getElementById("add-product").addEventListener("click", () => mostraPopup("Aggiungi"));
    document.getElementById("view-products").addEventListener("click", () => mostraPopup("Visualizza"));
    document.getElementById("edit-products").addEventListener("click", () => mostraPopup("Modifica"));
    document.getElementById("delete-products").addEventListener("click", () => mostraPopup("Elimina"));
    popupClose.addEventListener("click", () => popup.classList.add("hidden"));
  }

  btnSalvaNuovo.addEventListener("click", () => {
    const nome = inputNomeNuovo.value.trim();
    const prezzo = parseFloat(inputPrezzoNuovo.value);
    if (nome && !isNaN(prezzo)) {
      prodotti.push({ nome, prezzo });
      salvaProdotti();
      inputNomeNuovo.value = "";
      inputPrezzoNuovo.value = "";
      mostraPopup("Aggiungi");
    }
  });

  btnSalvaModifica.addEventListener("click", () => {
    const nome = inputModNome.value.trim();
    const prezzo = parseFloat(inputModPrezzo.value);
    if (nome && !isNaN(prezzo) && prodottoInModificaIndex !== null) {
      prodotti[prodottoInModificaIndex] = { nome, prezzo };
      salvaProdotti();
      formModifica.style.display = "none";
      mostraPopup("Modifica");
    }
  });

function mostraPopup(modalità) {
  popupTitle.textContent = `${modalità} Prodotti`;
  listaProdotti.innerHTML = "";
  formAggiungi.style.display = "none";
  formModifica.style.display = "none";
  prodottoInModificaIndex = null;

  // Mostra lista sempre uguale
  prodotti.forEach(prod => {
    const row = document.createElement("div");
    row.style.marginBottom = "0.5rem";
    row.textContent = `${prod.nome} - €${prod.prezzo.toFixed(2)}`;
    listaProdotti.appendChild(row);
  });

  // Modalità: Aggiungi
  if (modalità === "Aggiungi") {
    formAggiungi.style.display = "block";

  // Modalità: Modifica
  } else if (modalità === "Modifica") {
    // Dropdown + bottone
    formModifica.style.display = "block";
    const select = document.createElement("select");
    select.style.width = "100%";
    select.style.marginBottom = "0.5rem";
    prodotti.forEach((prod, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = `${prod.nome} - €${prod.prezzo.toFixed(2)}`;
      select.appendChild(option);
    });
    formModifica.insertBefore(select, inputModNome);

    select.addEventListener("change", () => {
      const idx = parseInt(select.value);
      inputModNome.value = prodotti[idx].nome;
      inputModPrezzo.value = prodotti[idx].prezzo;
      prodottoInModificaIndex = idx;
    });

    select.dispatchEvent(new Event("change")); // inizializza con primo valore

  // Modalità: Elimina
  } else if (modalità === "Elimina") {
    const form = document.createElement("div");
    form.style.marginTop = "1rem";
    form.style.borderTop = "1px solid #ccc";
    form.style.paddingTop = "1rem";

    const select = document.createElement("select");
    select.style.width = "100%";
    select.style.marginBottom = "0.5rem";

    prodotti.forEach((prod, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = `${prod.nome} - €${prod.prezzo.toFixed(2)}`;
      select.appendChild(option);
    });

    const btnElimina = document.createElement("button");
    btnElimina.textContent = "Elimina";
    btnElimina.className = "btn btn-danger";
    btnElimina.style.width = "100%";

    btnElimina.addEventListener("click", () => {
      const idx = parseInt(select.value);
      prodotti.splice(idx, 1);
      localStorage.setItem("prodotti", JSON.stringify(prodotti));
      mostraPopup("Elimina");
    });

    form.appendChild(select);
    form.appendChild(btnElimina);
    listaProdotti.appendChild(form);
  }

  popup.classList.remove("hidden");
}

});
