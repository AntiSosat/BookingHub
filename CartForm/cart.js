document.addEventListener("DOMContentLoaded", () => {


  function getParametro() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('email') || urlParams.get('id'); // supporta entrambi
  }

  // 1. Leggo da URL
  const emailFromURL = getParametro();

  // 2. Se esiste, salvo in sessionStorage
  if (emailFromURL && emailFromURL !== "null") {
    sessionStorage.setItem("email", emailFromURL);
  }

  // 3. Recupero SEMPRE da sessionStorage per usare nel resto del file
  const email = sessionStorage.getItem("email");

  // 4. Se ancora assente → reindirizza al login
  if (!email) {
    alert("Nessuna sessione attiva. Effettua il login.");
    location.href = "/LoginForm/login-registration.html";
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
      const prodNome = await fetch(`/prodottobyId?id=${id}`);
      const prezzoProd = await fetch(`/prodotto/prezzo?id=${id}`);

      const nomeProdottoJson = await prodNome.json();
      const prezzoProdottoJson = await prezzoProd.json();

      return {
        id,
        nome: nomeProdottoJson.dati[0] || "Prodotto sconosciuto",
        prezzo: prezzoProdottoJson.dati[0] || 0
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
      totale += parseFloat(prodotto.prezzo);

      const div = document.createElement("div");
      div.className = "cart-item-box";
      div.innerHTML = `
        <span>${prodotto.nome}</span>
        <span>€ ${parseFloat(prodotto.prezzo).toFixed(2)}</span>
      `;

      boxBianchiContainer.appendChild(div);

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

  function pagaaaree() {
    const popup = document.getElementById("payment-popup");
    const popupSummary = document.getElementById("popup-summary");
    const closePopup = document.getElementById("close-popup");

    popupSummary.innerHTML = "";
    let totale = 0;

    prodottiNelCarrello.forEach(item => {
      const span = item.querySelector("span");
      const nome = spans[0]?.textContent || "Prodotto"; //span[0] nome prodotto
      const prezzo = parseFloat(spans[1]?.textContent.replace("€ ", "")).trim; //span[1] prezzo prodotto

      const li = document.createElement("li");
      li.textContent = `${nome} - € ${prezzo.toFixed(2)}`;
      popupSummary.appendChild(li);

      totale += prezzo;

    });

    const totalItem = document.createElement("li");
    totalItem.style.fontWeight = "bold";
    totaalLi.textContent = `Totale: € ${totale.toFixed(2)}`;
    popupSummary.appendChild(totalItem);

    popup.classList.remove("hidden");

    //svuuota
    document.querySelector(".cart-list").innerHTML = "";
    document.querySelector(".cart-summary-wrapper").style.display = "none";
    document.querySelector(".cart-empty").style.display = "block";

  }

  document.getElementById("close-popup").addEventListener("click", () => {
    document.getElementById("payment-popup").classList.add("hidden");
  });

});








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