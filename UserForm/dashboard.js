const email = getParametro();

function getParametro() {
  const urlParams = new URLSearchParams(window.location.search);
  let email = urlParams.get('id') || urlParams.get('email');
  if (email && email !== "null") {
    sessionStorage.setItem("userEmail", email);
    console.log("userEmail salvato in sessionStorage:", sessionStorage.getItem("userEmail"));
  } else {
    email = sessionStorage.getItem("userEmail");
    console.log("userEmail salvato in sessionStorage:", sessionStorage.getItem("userEmail"));
  }
  return email ? email : null;
}

function getUserRole() {
  return sessionStorage.getItem("userRole") || null;
}

// Funzione per nascondere tutti i form del popup
function nascondiTuttiForms() {
  document.getElementById("form-aggiungi").classList.add("hidden");
  document.getElementById("form-modifica").classList.add("hidden");
  document.getElementById("form-elimina").classList.add("hidden");
  document.getElementById("lista-prodotti").innerHTML = "";
}

//---cliente
async function caricaDatiCliente(email) {
  try {
    const [nomeRes, cognomeRes, dataNascitaRes] = await Promise.all([
      fetch(`/cliente/nome?id=${email}`).then(res => res.json()),
      fetch(`/cliente/cognome?id=${email}`).then(res => res.json()),
      fetch(`/cliente/data_nascita?id=${email}`).then(res => res.json())
    ]);

    const nome = nomeRes.nome;
    const cognome = cognomeRes.cognome;
    const formatoData = new Date(dataNascitaRes.data_nascita).toLocaleDateString("it-IT");

    const userSection = document.getElementById("user-data");
    if (userSection) {
      userSection.innerHTML = `
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Cognome:</strong> ${cognome}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Data di nascita:</strong> ${formatoData}</p>
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

    const uniqueOrdini = Array.from(new Set(ordini));
    const ordersContainer = document.createElement("div");
    ordersContainer.classList.add("orders-container");

    if (!Array.isArray(uniqueOrdini) || uniqueOrdini.length === 0) {
      orderList.innerHTML = `<div class="no-orders">
      Nessun ordine trovato!<br><br>
         Quando effettuerai un acquisto, lo troverai qui!
      </div>`;
      return;
    }

    for (const ordineId of uniqueOrdini) {
      const ordineCard = document.createElement("div");
      ordineCard.classList.add("ordine-card");

      const header = document.createElement("div");
      header.classList.add("ordine-header");
      header.textContent = `Ordine #${ordineId}`;

      const content = document.createElement("div");
      content.classList.add("ordine-content");

      header.addEventListener("click", () => {
        content.classList.toggle("hidden");
      });

      const prodottiRes = await fetch(`/ordine/prodotti?cliente=${email}&ordine=${ordineId}`);
      const prodotti = await prodottiRes.json();

      const ul = document.createElement("ul");
      let prodottiValidi = 0;

      if (!Array.isArray(prodotti)) {
        console.error("Prodotti non validi o errore dal backend:", prodotti);
        continue;
      }

      for (const item of prodotti) {
        const prodottoId = item.prodotto;
        const quantita = item.quantita;

        if (!prodottoId || quantita === undefined) {
          console.warn("Quantità assente per prodotto", item);
          continue;
        }

        const prodottoInfoRes = await fetch(`/prodotto/dettagli?id=${prodottoId}`);
        const prodottoInfo = await prodottoInfoRes.json();

        if (prodottoInfo?.nome) {
          const li = document.createElement("li");
          li.textContent = `${prodottoInfo.nome} x${quantita}`;
          ul.appendChild(li);
          prodottiValidi++;
        }
      }

      // Fetch del totale ordine UNA SOLA VOLTA per la card
      const totaleRes = await fetch(`/ordine/totale?cliente=${email}&ordine=${ordineId}`);
      const totaleData = await totaleRes.json();
      const totale = totaleData.totale || 0;

      const totaleDiv = document.createElement("div");
      totaleDiv.classList.add("ordine-totale");
      totaleDiv.textContent = `Totale ordine: €${Number(totale).toFixed(2)}`;

      if (prodottiValidi > 0) {
        content.appendChild(ul);
        content.appendChild(totaleDiv);
        ordineCard.appendChild(header);
        ordineCard.appendChild(content);
        ordersContainer.appendChild(ordineCard);
      }
    }

    orderList.appendChild(ordersContainer);
  } catch (error) {
    console.error("Errore nel caricamento storico ordini:", error);
  }
}

async function caricaStatisticheOrdini(email) {
  const statistiche = document.getElementById("order-stats");

  if (!statistiche) return;

  try {
    const [ordini, prodotti, spesa] = await Promise.all([
      fetch(`/stat/ordini?cliente=${email}`).then(res => res.json()),
      fetch(`/stat/quantita?cliente=${email}`).then(res => res.json()),
      fetch(`/stat/spesa?cliente=${email}`).then(res => res.json())
    ]);

    const numeroOrdini = ordini.numero_ordini || 0;
    const totaleProdotti = prodotti.totale_prodotti || 0;
    const totaleSpeso = spesa.totale_speso || 0;

    statistiche.innerHTML = `
      <p>📦 Ordini effettuati: ${numeroOrdini}</p>
      <p>🛍️ Prodotti acquistati: ${totaleProdotti}</p>
      <p>💰 Totale speso: €${Number(totaleSpeso).toFixed(2)}</p>
    `;



if (numeroOrdini === 0 && totaleProdotti === 0 && totaleSpeso === 0) {
        document.getElementById("order-history").innerHTML =
        "<p class='no-orders'>Non hai ancora effettuato ordini</p>";
    }


  } catch (error) {
    console.error("Errore nel caricamento statistiche ordini:", error);
    alert("Si è verificato un errore durante il caricamento delle statistiche degli ordini.");
    statistiche.innerHTML = `
      <p>📦 Ordini effettuati: 0</p>
      <p>🛍️ Prodotti acquistati: 0</p>
      <p>💰 Totale speso: €0.00</p>
    `;;
  }
}

//---venditore
async function caricaDatiVenditore(email) {
  let ivaVenditore = null
  try {
    const info = await fetch(`/artigiano/info?email=${email}`).then(res => res.json());
    ivaVenditore = info.iva;
    console.log("IVA Venditore:", ivaVenditore);
    sessionStorage.setItem("ivaVenditore", info.iva);
    console.log("IVA Venditore salvata in sessionStorage:", sessionStorage.getItem("ivaVenditore"));
    const venditoreSection = document.getElementById("user-data");

    venditoreSection.innerHTML = `
      <p><strong>Nome azienda:</strong> ${info.nomeazienda}</p>
      <p><strong>Partita IVA:</strong> ${info.iva}</p>
      <p><strong>Email:</strong> ${info.email}</p>
      <p><strong>Telefono:</strong> ${info.numerotel}</p>
    `;

    const prodotti = await fetch(`/prodotti/idvenditore?idvenditore=${info.iva}`).then(res => res.json());
    document.getElementById("cont-prodotti").textContent = prodotti.length;
    
    const ordiniRes = await fetch(`/ordine/venditore?ivavenditore=${info.iva}`);
    const ordini = await ordiniRes.json();
    const ordiniUnici = new Set(ordini.map(o => o.id));
    document.getElementById("cont-ordini").textContent = ordiniUnici.size;

  } catch (error) {
    console.error("Errore nel caricamento dei dati del venditore:", error);
    alert("Si è verificato un errore durante il caricamento dei dati del venditore.");
  }
}

async function caricaProdottiVenditore(email) {
  try {
    const ivaData = await fetch(`/artigiano/iva-by-email?email=${email}`).then(res => res.json());
    const ivaVenditore = ivaData.iva;
    console.log("IVA Venditore:", ivaVenditore);

    const prodotti = await fetch(`/prodotti/idvenditore?idvenditore=${ivaVenditore}`).then(res => res.json());
    console.log("Prodotti trovati:", prodotti);

    const lista = document.getElementById("lista-prodotti");
    lista.innerHTML = "";

    if (prodotti.length === 0) {
      lista.innerHTML = "<li>Nessun prodotto trovato</li>";
      return;
    }

    prodotti.forEach(prod => {
      const li = document.createElement("li");
      li.textContent = `${prod.nome} - €${Number(prod.prezzo).toFixed(2)}`;
      lista.appendChild(li);
    });

  } catch (error) {
    console.error("Errore nel caricamento dei prodotti del venditore:", error);
  }
}

async function caricaStoricoOrdiniArtigiano(email) {
  const orderList = document.getElementById("order-history-artigiano");
  if (!orderList) return;

  try {
    const ivaRes = await fetch(`/artigiano/iva-by-email?email=${email}`);
    const ivaData = await ivaRes.json();
    const ivaVenditore = ivaData.iva;

    // Recupera tutti gli ordini dove il venditore è questo artigiano
    const response = await fetch(`/ordine/venditore?ivavenditore=${ivaVenditore}`);
    const ordini = await response.json();
    console.log("Ordini trovati per artigiano:", ordini);
    orderList.innerHTML = "";

    if (!Array.isArray(ordini) || ordini.length === 0) {
      orderList.innerHTML = `<div class="no-orders">
        Nessun ordine trovato!<br><br>
        Quando riceverai un ordine, lo troverai qui!
      </div>`;
      return;
    }

    const ordersContainer = document.createElement("div");
    ordersContainer.classList.add("orders-container");

    // Raggruppa per id ordine
    const ordiniRaggruppati = {};
    for (const o of ordini) {
      if (!ordiniRaggruppati[o.id]) ordiniRaggruppati[o.id] = [];
      ordiniRaggruppati[o.id].push(o);
    }

    for (const ordineId in ordiniRaggruppati) {
      const ordineCard = document.createElement("div");
      ordineCard.classList.add("ordine-card");

      const header = document.createElement("div");
      header.classList.add("ordine-header");
      header.textContent = `Ordine #${ordineId}`;

      // === Bottone elimina ordine ===
      const eliminaBtn = document.createElement("button");
      eliminaBtn.textContent = "Elimina Ordine";
      eliminaBtn.classList.add("btn-elimina-ordine");
      eliminaBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (confirm("Sei sicuro di voler eliminare questo ordine?")) {
          const res = await fetch("/ordine/elimina", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ordineId })
          });
          const data = await res.json();
          if (data.success) {
            alert("Ordine eliminato!");
            ordineCard.remove();

        if (ordersContainer.childElementCount === 0) {
                orderList.innerHTML = `<div class="no-orders">
                  Nessun ordine trovato!<br><br>
                  Quando riceverai un ordine, lo troverai qui!
                </div>`;
              }

          } else {
            alert("Errore: " + (data.error || "Impossibile eliminare l'ordine"));
          }
        }
      });
      header.appendChild(eliminaBtn);
      // === Fine bottone elimina ===

      const content = document.createElement("div");
      content.classList.add("ordine-content");

      header.addEventListener("click", () => {
        content.classList.toggle("hidden");
      });

      const ul = document.createElement("ul");
      let prodottiValidi = 0;
      let totale = 0;

      for (const item of ordiniRaggruppati[ordineId]) {
        const prodottoId = item.prodotto;
        const quantita = item.quantita;

        const prodottoInfoRes = await fetch(`/prodotto/dettagli?id=${prodottoId}`);
        const prodottoInfo = await prodottoInfoRes.json();

        if (prodottoInfo?.nome) {
          const li = document.createElement("li");
          li.textContent = `${prodottoInfo.nome} x${quantita}`;
          ul.appendChild(li);
          prodottiValidi++;
          totale += (prodottoInfo.prezzo || 0) * (quantita || 1);
        }
      }

      const totaleDiv = document.createElement("div");
      totaleDiv.classList.add("ordine-totale");
      totaleDiv.textContent = `Totale ordine: €${Number(totale).toFixed(2)}`;

      if (prodottiValidi > 0) {
        content.appendChild(ul);
        content.appendChild(totaleDiv);
        ordineCard.appendChild(header);
        ordineCard.appendChild(content);
        ordersContainer.appendChild(ordineCard);
      }
    }

    orderList.appendChild(ordersContainer);
  } catch (error) {
    console.error("Errore nel caricamento storico ordini artigiano:", error);
  }
}

async function aggiungiProdotto(email) {
  try {
    const idVenditore = sessionStorage.getItem("ivaVenditore");

    const nome = document.getElementById("nome-nuovo").value.trim();
    const prezzo = parseFloat(document.getElementById("prezzo-nuovo").value.trim());
    const disponibilita = parseInt(document.getElementById("disponibilita-nuovo").value.trim());
    const descrizione = document.getElementById("descrizione-nuovo").value.trim();
    const categoria = document.getElementById("categoria-nuovo").value.trim();
    const immagine = document.getElementById("immagine-nuovo");

    if (!nome || isNaN(prezzo) || isNaN(disponibilita)) {
      alert("Compila tutti i campi obbligatori (nome, prezzo, disponibilità).");
      return;
    }


    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("prezzo", prezzo);
    formData.append("disponibilita", disponibilita);
    formData.append("descrizione", descrizione);
    formData.append("categoria", categoria);
    formData.append("idVenditore", idVenditore);

    if (immagine.files.length > 0) {
      formData.append("immagine", immagine.files[0]);
    }

    const res = await fetch("/prodotto/aggiungi", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert("Errore durante l'aggiunta del prodotto: " + (data.error || "Errore generico."));
      return;
    }

    alert("Prodotto aggiunto con successo!");
    document.getElementById("popup-prodotti").classList.add("hidden");

    // Aggiorna il contatore dei prodotti
    await caricaDatiVenditore(email);

  } catch (error) {
    console.error("Errore in aggiungiProdotto:", error);
    alert("Errore durante l'aggiunta del prodotto.");
  }
}

async function popolaSelectModifica() {
  const email = getParametro();
  const ivaRes = await fetch(`/artigiano/iva-by-email?email=${email}`).then(r => r.json());
  const prodotti = await fetch(`/prodotti/idvenditore?idvenditore=${ivaRes.iva}`).then(r => r.json());

  const select = document.getElementById("select-modifica");
  select.innerHTML = "";

  const optVuoto = document.createElement("option");
  optVuoto.value = "";
  optVuoto.textContent = "Seleziona un prodotto...";
  select.appendChild(optVuoto);


  prodotti.forEach(prod => {
    const opt = document.createElement("option");
    opt.value = prod.id;
    opt.textContent = `${prod.nome} - €${Number(prod.prezzo).toFixed(2)}`;
    opt.dataset.json = JSON.stringify(prod);
    select.appendChild(opt);
  });

  select.selectedIndex = 0;
  // Svuota i campi sotto
  document.getElementById("mod-nome").value = "";
  document.getElementById("mod-prezzo").value = "";
  document.getElementById("mod-disponibilita").value = "";
  document.getElementById("mod-descrizione").value = "";
  document.getElementById("mod-categoria").selectedIndex = 0;
  document.getElementById("mod-immagine").value = "";
  select.dispatchEvent(new Event("change"));
}

async function modificaProdotto() {
  const id = document.getElementById("select-modifica").value;
  const nome = document.getElementById("mod-nome").value.trim();
  const prezzo = parseFloat(document.getElementById("mod-prezzo").value.trim());
  const disponibilita = parseInt(document.getElementById("mod-disponibilita").value.trim());
  const descrizione = document.getElementById("mod-descrizione").value.trim();
  const categoria = document.getElementById("mod-categoria").value.trim();
  const modImgElem = document.getElementById("mod-immagine");
  const immagineInput = modImgElem;


  const formData = new FormData();
  formData.append("id", id);
  formData.append("nome", nome);
  formData.append("prezzo", prezzo);
  formData.append("disponibilita", disponibilita);
  formData.append("descrizione", descrizione);
  formData.append("categoria", categoria);

  if (immagineInput.files.length > 0) {
    formData.append("immagine", immagineInput.files[0]);
  }


  const res = await fetch("/prodotto/modifica", {
    method: "PUT",
    body: formData
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    alert("Errore: " + data.error);
    return;
  }

  alert("Prodotto modificato con successo!");
  document.getElementById("popup-prodotti").classList.add("hidden");

  const email = getParametro();
  await caricaDatiVenditore(email);
}

async function popolaSelectElimina() {
  const email = sessionStorage.getItem("userEmail");
  const ivaRes = await fetch(`/artigiano/iva-by-email?email=${email}`).then(r => r.json());
  const prodotti = await fetch(`/prodotti/idvenditore?idvenditore=${ivaRes.iva}`).then(r => r.json());

  const select = document.getElementById("select-elimina");
  select.innerHTML = "";

  prodotti.forEach(prod => {
    const opt = document.createElement("option");
    opt.value = prod.id;
    opt.textContent = `${prod.nome} - €${Number(prod.prezzo).toFixed(2)}`;
    select.appendChild(opt);
  });
}

async function eliminaProdotto() {
  const id = document.getElementById("select-elimina").value;
  if (!id) return alert("Seleziona un prodotto da eliminare.");

  const conferma = confirm("Vuoi davvero eliminare questo prodotto?");
  if (!conferma) return;

  const res = await fetch("/prodotto/elimina", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });

  const data = await res.json();

  if (!res.ok) {
    alert("Errore durante l'eliminazione: " + (data.error || "Errore generico"));
    return;
  }

  alert("Prodotto eliminato con successo!");
  document.getElementById("popup-prodotti").classList.add("hidden");

  const email = sessionStorage.getItem("userEmail");
  await caricaDatiVenditore(email);
}

function caricaDatiUtente(email, tipo) {
  try {
    if (tipo === "cliente") {
      document.querySelectorAll(".cliente-only").forEach(el => el.style.display = "block");
      caricaDatiCliente(email);
      caricaStoricoOrdini(email);
      caricaStatisticheOrdini(email);
    } else if (tipo === "artigiano") {
      document.querySelectorAll(".artigiano-only").forEach(el => el.style.display = "block");
      caricaDatiVenditore(email);
      caricaProdottiVenditore(email);
      caricaStoricoOrdiniArtigiano(email);
    }
  } catch (error) {
    console.error("Errore nel caricamento dati utente:", error);
    throw error;
  }
}

async function popolaCategoria(){
  const categorie = ["uomo","donna","bambino","bambina","unisex"];
  const selects = [document.getElementById("categoria-nuovo"), document.getElementById("mod-categoria")];
  selects.forEach(select => {
      if (!select) return;
      select.innerHTML = "";
      categorie.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
      });
    });
}

document.addEventListener("DOMContentLoaded", async () => {
  const email = getParametro();
  const role = getUserRole();

  try {
    if (!email || !role) {
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

    const isOnDashboard = window.location.pathname.includes("dashboard.html");

    if (!isOnDashboard) {
      if (data.tipo === "cliente" || data.tipo === "artigiano") {
        window.location.href = `../UserForm/dashboard.html?id=${email}`;
        return;
      } else {
        alert("Tipo di utente non valido");
        window.location.href = "../LoginForm/login-registration.html";
        return;
      }
    }

    caricaDatiUtente(email, data.tipo);

    popolaCategoria();

    // Event listeners per i bottoni del popup
    document.getElementById("view-products").addEventListener("click", async () => {
      nascondiTuttiForms();
      document.getElementById("popup-title").textContent = "Visualizza Prodotti";
      document.getElementById("popup-prodotti").classList.remove("hidden");

      const email = getParametro();
      await caricaProdottiVenditore(email);
    });

    document.getElementById("add-product").addEventListener("click", () => {
      nascondiTuttiForms();
      document.getElementById("popup-title").textContent = "Aggiungi Prodotto";
      document.getElementById("form-aggiungi").classList.remove("hidden");
      document.getElementById("popup-prodotti").classList.remove("hidden");

      
      document.getElementById("nome-nuovo").value = "";
      document.getElementById("prezzo-nuovo").value = "";
      document.getElementById("disponibilita-nuovo").value = "";
      document.getElementById("descrizione-nuovo").value = "";
      document.getElementById("categoria-nuovo").value = "";
      document.getElementById("immagine-nuovo").value = "";
    });

    document.getElementById("edit-products").addEventListener("click", async () => {
      nascondiTuttiForms();
      document.getElementById("popup-title").textContent = "Modifica Prodotti";
      document.getElementById("form-modifica").classList.remove("hidden");
      document.getElementById("popup-prodotti").classList.remove("hidden");

      document.getElementById("mod-nome").value = "";
      document.getElementById("mod-prezzo").value = "";
      document.getElementById("mod-disponibilita").value = "";
      document.getElementById("mod-descrizione").value = "";
      document.getElementById("mod-categoria").selectedIndex = 0;
      document.getElementById("mod-immagine").value = "";

      await popolaSelectModifica();
    });

    document.getElementById("select-modifica").addEventListener("change", (e) => {
      const opt = e.target.selectedOptions[0];
      if (opt && opt.dataset.json) {
        const prod = JSON.parse(opt.dataset.json);
        document.getElementById("mod-nome").value = prod.nome;
        document.getElementById("mod-prezzo").value = prod.prezzo;
        document.getElementById("mod-disponibilita").value = prod.disponibilita;
        document.getElementById("mod-descrizione").value = prod.descrizione;
        document.getElementById("mod-categoria").value = prod.categoria;
      }
    });

    document.getElementById("delete-products").addEventListener("click", async () => {
      nascondiTuttiForms();
      document.getElementById("popup-title").textContent = "Elimina Prodotto";
      document.getElementById("form-elimina").classList.remove("hidden");
      document.getElementById("popup-prodotti").classList.remove("hidden");

      await popolaSelectElimina();
    });

    // Event listeners per i bottoni di azione
    document.getElementById("btn-salva-nuovo").addEventListener("click", async () => {
      const email = getParametro();
      await aggiungiProdotto(email);
    });

    document.getElementById("btn-salva-modifica").addEventListener("click", modificaProdotto);
    document.getElementById("btn-conferma-elimina").addEventListener("click", eliminaProdotto);

    document.getElementById("popup-close").addEventListener("click", () => {
      document.getElementById("popup-prodotti").classList.add("hidden");
    });

  } catch (error) {
    console.error("Errore durante il caricamento dei dati:", error);
    alert("Si è verificato un errore durante il caricamento dei dati.");
  }
});