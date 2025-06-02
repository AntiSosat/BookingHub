async function rimuoviProdottoDalCarrello(id, email) {
  try {
    const rimuoviRisp = await fetch('/cart/rimuoviProdotto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clienteId: email,
        prodottoId: id
      })
    });
    const rimuoviRispJson = await rimuoviRisp.json();
    console.log("Prodotto rimosso:", rimuoviRispJson);

    if (rimuoviRispJson.success) {
      const item = document.querySelector(`.cart-item button[data-id="${id}"]`).closest('.cart-item');
      if (item) {
        item.remove();
        aggiornaTotale();
      }
      alert("Prodotto rimosso con successo dal carrello.");
    }
  } catch (error) {
    console.error("Errore nella rimozione del prodotto dal carrello:", error);
    alert("Si è verificato un errore durante la rimozione del prodotto dal carrello.");
  }
}

function aggiornaTotale() {
  const items = document.querySelectorAll(".cart-item");
  let totale = 0;

  items.forEach(item => {
    const prezzo = parseFloat(item.querySelector(".price").textContent.replace("€", "").trim());
    const quantita = parseInt(item.querySelector(".qty-value").textContent, 10);
    if (!isNaN(prezzo) && !isNaN(quantita)) {
      totale += prezzo * quantita;
    }
  });

  const totaleCart = document.getElementById("cart-total");
  if (totaleCart) {
    totaleCart.textContent = totale.toFixed(2);
  }

  // Se il carrello è vuoto, mostra il messaggio appropriato
  if (items.length === 0) {
    document.querySelector(".cart-summary-wrapper").style.display = "none";
    document.querySelector(".cart-empty").style.display = "block";
  }
}

async function modificaQuantitaCarrello(id, nuovaQuantita, email) {
  try {
    console.log("Parametri inviati al server:", {
      clienteId: email,
      prodottoId: id,
      quantita: nuovaQuantita
    });

    const response = await fetch('/cart/modificaQuantita', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clienteId: email,
        prodottoId: id,
        quantita: nuovaQuantita
      })
    });

    const result = await response.json();
    console.log("Risultato della modifica:", result);

    if (!result.success) {
      alert(result.error || "Errore nella modifica della quantità");
    } else {
      alert("Quantità modificata con successo");
    }
  } catch (error) {
    console.error("Errore nella modifica della quantità:", error);
    alert("Si è verificato un errore durante la modifica della quantità del prodotto.");
  }
}

document.addEventListener("DOMContentLoaded", () => {


  // function getParametro() {
  //   const urlParams = new URLSearchParams(window.location.search);
  //   return urlParams.get('email') || urlParams.get('id'); // supporta entrambi
  // }

  // // 1. Leggo da URL
  // const emailFromURL = getParametro();

  // // 2. Se esiste, salvo in sessionStorage
  // if (emailFromURL && emailFromURL !== "null") {
  //   sessionStorage.setItem("email", emailFromURL);
  // }

  // // 3. Recupero SEMPRE da sessionStorage per usare nel resto del file
  // const email = sessionStorage.getItem("email");

  function getParametro() {
    const urlParams = new URLSearchParams(window.location.search);
    let email = urlParams.get('id') || urlParams.get('email');
    if (email && email !== "null") {
      sessionStorage.setItem("userEmail", email);
      console.log("userEmail salvato in sessionStorage:", sessionStorage.getItem("userEmail"));
    } else {
      email = sessionStorage.getItem("userEmail");
      console.log("userEmail preso in sessionStorage:", sessionStorage.getItem("userEmail"));
    }
    return email ? email : null;
  }
  function getUserRole() {
  return sessionStorage.getItem("userRole") || null;
  } 

  const email = getParametro();
  const role = getUserRole();

  // 4. Se ancora assente → reindirizza al login
  if (!email || !role) {
    alert("Sessione non trovata. Effettua il login.");
    window.location.href = "../LoginForm/login-registration.html";
    return;
  }


  console.log("Email attiva:", email);

  function ritornaMenu() {
    location.href = `../ShopForm/shop.html?id=${email}`;
  }

  async function getProdottiNelCarrello(email) {
    try {
      const ris = await fetch(`/Cart/idProdotti?cliente=${email}`);
      const idProdotto = await ris.json();

      if (!Array.isArray(idProdotto)) {
        console.error("Errore: idProdotto non è un array valido.");
        return [];
      }

      console.log("Id prodotti nel carrello:", idProdotto);
      return idProdotto;
    } catch (error) {
      console.error("Errore nel recupero dei prodotti nel carrello:", error);
      return [];
    }
  }

  async function getDettagliProdotti(id) {
    try {

      const prodNomePrezzo = await fetch(`/prodotto/dettagli?id=${id}`);
      if (!prodNomePrezzo.ok) {
        throw new Error(`Errore nella richiesta per il prodotto con ID ${id}: ${prodNomePrezzo.statusText}`);
      }
      const prodNomePrezzoJson = await prodNomePrezzo.json();


      /*
      const prodNome = await fetch(`/prodottobyId?id=${id}`);
      const prezzoProd = await fetch(`/prodotto/prezzo?id=${id}`);

      const nomeProdottoJson = await prodNome.json();
      const prezzoProdottoJson = await prezzoProd.json();
      */

      return {
        id,
        nome: prodNomePrezzoJson.nome || "Prodotto sconosciuto",
        prezzo: prodNomePrezzoJson.prezzo || 0
      }

    } catch (error) {
      console.error("Errore nel recupero dei dettagli del prodotto:", error);
      return {
        id,
        nome: "Errore",
        prezzo: 0
      };
    }
  }

  async function visualizzaCarrello() {
    const idC = await getProdottiNelCarrello(email);
    const boxBianchiContainer = document.querySelector(".cart-list");
    const totaleCart = document.getElementById("cart-total")

    boxBianchiContainer.innerHTML = "";
    let totale = 0;

    if (idC.length === 0) {
      document.querySelector(".cart-summary-wrapper").style.display = "none";
      document.querySelector(".cart-empty").style.display = "block";
      return;
    }

    document.querySelector(".cart-summary-wrapper").style.display = "flex";
    document.querySelector(".cart-empty").style.display = "none";

    for (const id of idC) {
      const prodotto = await getDettagliProdotti(id);
      const quantita = await fetch(`/cart/quantita?cliente=${email}&prodotto=${id}`)
        .then(r => r.json())
        .then(d => d.quantita || 1)
        .catch(() => 1);

      const prezzoTotale = parseFloat(prodotto.prezzo) * quantita;
      totale += prezzoTotale;

      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <div class="actions">
          <button class="remove-from-cart" data-id="${id}">🗑️</button>
          <button class="edit-qty" data-id="${id}" title="Modifica quantità">✏️</button>
        </div>
        <div class="description">${prodotto.nome}</div>
        <div class="price">€ ${prezzoTotale.toFixed(2)}</div>
        <div class="quantity">
          <span class="qty-value">${quantita}</span>
        </div>
      `;
      boxBianchiContainer.appendChild(div);

      //event listeners per rimuovere e modificare quantità
      div.querySelector('.remove-from-cart').addEventListener('click', async function () {
        if (confirm("Vuoi rimuovere questo prodotto dal carrello?")) {
          await rimuoviProdottoDalCarrello(id, email);
          div.remove();
          aggiornaTotale();
        }
      });

      div.querySelector('.edit-qty').addEventListener('click', async function () {
        const qtySpan = div.querySelector('.qty-value');
        let currentQty = parseInt(qtySpan.textContent, 10);
        const newQty = prompt("Inserisci la nuova quantità:", currentQty);
        if (newQty !== null && !isNaN(newQty) && Number(newQty) > 0) {
          await modificaQuantitaCarrello(id, Number(newQty), email);
          await visualizzaCarrello();
        }
      })

      totaleCart.textContent = totale.toFixed(2);

    }
  }

  visualizzaCarrello();

  function shoppare() {
    //const email = sessionStorage.getItem("email"); 
    if (email) {
      window.location.href = `../ShopForm/shop.html?id=${email}`;
    } else {
      alert("Sessione non trovata, effetua il login");
      window.location.href = "../LoginForm/login-registration.html";
    }
  }

  const shopButton = document.getElementById("continue-shopping");
  if (shopButton) {
    shopButton.addEventListener("click", shoppare);
  }



  document.getElementById("close-popup").addEventListener("click", () => {
    document.getElementById("payment-popup").classList.add("hidden");
  });




});



async function pagaaaree() {
  const popup = document.getElementById("payment-popup");
  const popupSummary = document.getElementById("popup-summary");
  popupSummary.innerHTML = "";
  let totale = 0;

  const prodottiNelCarrello = document.querySelectorAll(".cart-item");

  prodottiNelCarrello.forEach(item => {
    const nome = item.querySelector(".description").textContent;
    const prezzo = parseFloat(item.querySelector(".price").textContent.replace("€", "").trim());
    const quantita = parseInt(item.querySelector(".qty-value").textContent, 10);
    const li = document.createElement("li");
    li.textContent = `${nome} x${quantita} - € ${(prezzo * quantita).toFixed(2)}`;
    popupSummary.appendChild(li);
    totale += prezzo * quantita;
  });

  const totalItem = document.createElement("li");
  totalItem.style.fontWeight = "bold";
  totalItem.textContent = `Totale: € ${totale.toFixed(2)}`;
  popupSummary.appendChild(totalItem);

  popup.classList.remove("hidden");

  // Listener per chiudere popup e svuotare carrello lato server
  document.getElementById("close-popup").addEventListener("click", async () => {
    popup.classList.add("hidden");

    const email = sessionStorage.getItem("email");
    if (email) {
      try {
        const response = await fetch("/cart/svuotaCarrello", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clienteId: email })
        });

        const data = await response.json();
        if (!data.success) {
          console.error("Errore nello svuotamento server:", data.error);
        }
      } catch (err) {
        console.error("Errore nella chiamata a /cart/svuotaCarrello:", err);
      }
    }

    // Svuota frontend
    document.querySelector(".cart-list").innerHTML = "";
    document.querySelector(".cart-summary-wrapper").style.display = "none";
    document.querySelector(".cart-empty").style.display = "block";
  });
}



/*
test visualizzazione carrello e lista dei desideri

document.addEventListener("DOMContentLoaded", () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const wishCart = JSON.parse(localStorage.getItem("wish-cart")) || [];

  const cartContainer = document.querySelector(".cart-items");
  const wishContainer = document.querySelector(".wish-list");
  const emptyMessage = document.querySelector(".cart-empty");
  const totalElement = document.getElementById("cart-total");
  const checkoutButton = document.getElementById("checkout-button");
  const popup = document.getElementById("payment-popup");
  const popupSummary = document.getElementById("popup-summary");
  const closePopup = document.getElementById("close-popup");

  // Mostra o nasconde messaggio di carrello vuoto
  if (cart.length === 0) {
    emptyMessage.style.display = "block";
  } else {
    emptyMessage.style.display = "none";
    let total = 0;

    cart.forEach((item) => {
      const div = document.createElement("div");
      div.classList.add("cart-item");
      div.innerHTML = `
        <div class="actions">
          <button class="remove-from-cart">🗑️</button>
        </div>
        <div class="description">${item.name}</div>
        <div class="price">€ ${item.price.toFixed(2)}</div>
      `;
      cartContainer.appendChild(div);


      total += item.price * item.quantity;
    });

    totalElement.textContent = total.toFixed(2);
  }

  // Lista dei desideri
  wishCart.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("wish-item");
    div.innerHTML = `
      <div class="actions">
        <button class="add-to-cart">➕</button>
        <button class="remove-from-wish">🗑️</button>
      </div>
      <div class="description">${item.name}</div>
      <div class="price">€ ${item.price.toFixed(2)}</div>
    `;
    wishContainer.appendChild(div);
  });

  // Interazioni future: puoi aggiungere eventi per gestire i pulsanti

  checkoutButton.addEventListener("click", () => {
  // Svuota contenuto popup
  popupSummary.innerHTML = "";

  if (cart.length === 0) {
    popupSummary.innerHTML = "<li>Il carrello è vuoto.</li>";
  } else {
    let total = 0;
    cart.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.name} x${item.quantity} - € ${(item.price * item.quantity).toFixed(2)}`;
      popupSummary.appendChild(li);
      total += item.price * item.quantity;
    });

    // Totale finale
    const totalItem = document.createElement("li");
    totalItem.style.fontWeight = "bold";
    totalItem.textContent = `Totale: € ${total.toFixed(2)}`;
    popupSummary.appendChild(totalItem);
  }

  popup.classList.remove("hidden");
});

closePopup.addEventListener("click", () => {
  popup.classList.add("hidden");
});


});

*/

/*
f12 > console 

localStorage.setItem('cart', JSON.stringify([
  { id: 1, name: "Collana", price: 12.99, quantity: 1 },
  { id: 2, name: "Bracciale", price: 9.99, quantity: 2 }
]));

localStorage.setItem('wish-cart', JSON.stringify([
  { id: 3, name: "Anello", price: 14.99, quantity: 1 },
  { id: 4, name: "Orecchini", price: 7.49, quantity: 1 }
]));




*/