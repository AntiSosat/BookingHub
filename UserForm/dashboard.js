const email = getParametro();

function getParametro() {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('id') || urlParams.get('email');
  return (email && email !== "null") ? email : null;
}


//---cliente
async function caricaDatiCliente(email) {
  try {
    const [nomeRes, cognomeRes] = await Promise.all([
      fetch(`/cliente/nome?id=${email}`).then(res => res.json()),
      fetch(`/cliente/cognome?id=${email}`).then(res => res.json())
    ]);

    const nome = nomeRes.nome;
    const cognome = cognomeRes.cognome;

    const userSection = document.getElementById("user-data");
    if (userSection) {
      userSection.innerHTML = `
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Cognome:</strong> ${cognome}</p>
        <p><strong>Email:</strong> ${email}</p>
      `;
    }
  } catch (error) {
    console.error("Errore nel caricamento dei dati del cliente:", error);
    alert("Si è verificato un errore durante il caricamento dei dati del cliente.");
  }
}


async function caricaStoricoOrdini(email) {
  const orderList = document.getElementById("order-history");
  if (!orderList) return;

  try {
    const response = await fetch(`/ordine/cliente?cliente=${email}`);
    const ordini = await response.json();

    orderList.innerHTML = "";

    for (const ordineId of ordini) {
      const prodottiRes = await fetch(`/ordine/prodotti?cliente=${email}&ordine=${ordineId}`);
      const prodotti = await prodottiRes.json();

      for (const prodottoId of prodotti) {
        const prodottoInfoRes = await fetch(`/prodotto/dettagli?id=${prodottoId}`);
        const prodottoInfo = await prodottoInfoRes.json();

        const li = document.createElement("li");
        li.textContent = `🧾 ${prodottoInfo.nome} - Ordine #${ordineId}`;
        orderList.appendChild(li);
      }
    }

  } catch (error) {
    console.error("Errore nel caricamento storico ordini:", error);
    throw error;
  }
}

//---venditore
async function caricaDatiVenditore(email) {
  try {
    
    const ivaRes = await fetch(`/artigiano/iva-by-email?email=${email}`).then(res => res.json());
    const iva = ivaRes.iva;

    // iva chiave per le altre chiamate
    const [telRes, emailRes, nomeAziendaRes] = await Promise.all([
      fetch(`/artigiano/numerotel?id=${iva}`).then(res => res.json()),
      fetch(`/artigiano/email?id=${iva}`).then(res => res.json()),
      fetch(`/artigiano/nomeAzienda?id=${iva}`).then(res => res.json())  // se hai anche questo
    ]);

    const userSection = document.getElementById("user-data");
    if (userSection) {
      userSection.innerHTML = `
        <p><strong>Partita IVA:</strong> ${iva}</p>
        <p><strong>Telefono:</strong> ${telRes.numertel}</p>
        <p><strong>Email:</strong> ${emailRes.email}</p>
      `;
    }

    // Conteggio prodotti (in base all'IVA come idVenditore)
    const prodotti = await fetch(`/prodotti/idvenditore?idvenditore=${iva}`).then(res => res.json());
    const contProdotti = document.getElementById("cont-prodotti");
    if (contProdotti) contProdotti.textContent = prodotti.length;

    const contOrdini = document.getElementById("cont-ordini");
    if (contOrdini) contOrdini.textContent = "1"; // mock

  } catch (error) {
    console.error("Errore nel caricamento dati venditore:", error);
    alert("Errore durante il caricamento dati venditore.");
  }
}



function caricaDatiUtente(email, tipo) {
  try {
    if (tipo === "cliente") {
      caricaDatiCliente(email);
      caricaStoricoOrdini(email);
    } else if (tipo === "artigiano") {
      caricaDatiVenditore(email);
     // caricaProdottiVenditore(email);
    }
  } catch (error) {
    console.error("Errore nel caricamento dati utente:", error);
    throw error;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    if (!email) {
      alert("Sessione non trovata. Effettua il login.");
      window.location.href = "../LoginForm/login-registration.html";
      return;
    }

    const response = await fetch(`/utente/tipo?email=${email}`);
    const data = await response.json();

    if (!data.tipo) {
      alert("Errore: tipo di utente non trovato.");
      window.location.href = "../LoginForm/login-registration.html";
      return;
    }

    // Controlla se sei già sulla dashboard
    const isOnDashboard = window.location.pathname.includes("dashboard.html");

    if (!isOnDashboard) {
      if (data.tipo === "cliente" || data.tipo === "artigiano") {
        window.location.href = `../UserForm/dashboard.html?id=${email}`;
        return; // evita esecuzione successiva
      } else {
        alert("Tipo di utente non valido");
        window.location.href = "../LoginForm/login-registration.html";
        return;
      }
    }

    // Se sei già su dashboard.html, carica i dati
    caricaDatiUtente(email, data.tipo);

  } catch (error) {
    console.error("Errore durante il caricamento dei dati:", error);
    alert("Si è verificato un errore durante il caricamento dei dati.");
  }
});








/*
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
*/