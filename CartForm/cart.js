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