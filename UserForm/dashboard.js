document.addEventListener("DOMContentLoaded", function () {
    // --- TEST LOCALE ---
    // Imposta il ruolo da console per simulare un utente
    // Esempio: localStorage.setItem("role", "cliente");

    const role = localStorage.getItem("role");

    // Recupera i dati utente (opzionale per test visuali)
    const userData = JSON.parse(localStorage.getItem("user")) || {};
    const ordini = JSON.parse(localStorage.getItem("ordini")) || [];
    const prodotti = JSON.parse(localStorage.getItem("prodotti")) || [];

    // Mostra le informazioni utente (se presenti)
    const userSection = document.getElementById("user-data");
    if (userSection && userData.nome) {
        userSection.innerHTML = `
            <p><strong>Nome:</strong> ${userData.nome}</p>
            <p><strong>Cognome:</strong> ${userData.cognome}</p>
            <p><strong>Email:</strong> ${userData.email}</p>
        `;
    }

    if (role === "cliente") {
        // Mostra solo sezione cliente
        document.querySelectorAll(".venditore-only").forEach(el => el.style.display = "none");
        document.querySelectorAll(".cliente-only").forEach(el => el.style.display = "block");

        // Popola lo storico ordini
        const orderList = document.getElementById("order-history");
        if (orderList) {
            orderList.innerHTML = "";
            ordini.forEach(order => {
                const li = document.createElement("li");
                li.textContent = `🧾 ${order.prodotto} - ${order.data}`;
                orderList.appendChild(li);
            });
        }
    } else if (role === "venditore") {
        // Mostra solo sezione venditore
        document.querySelectorAll(".cliente-only").forEach(el => el.style.display = "none");
        document.querySelectorAll(".venditore-only").forEach(el => el.style.display = "block");

        // Popola contatori prodotti e ordini ricevuti
        document.getElementById("cont-prodotti").textContent = prodotti.length;
        document.getElementById("cont-ordini").textContent = ordini.length;
    } else {
        // Nessun ruolo: reindirizza al login
        window.location.href = "../LoginForm/login-registration.html";
    }
});

/*
f12 > console
venditore
localStorage.setItem("role", "venditore");
localStorage.setItem("user", JSON.stringify({
  nome: "Mario",
  cognome: "Rossi",
  email: "mario.rossi@example.com"
}));

localStorage.setItem("prodotti", JSON.stringify([
  { id: 1, nome: "Collana", prezzo: 20.99 },
  { id: 2, nome: "Bracciale", prezzo: 14.50 }
]));

localStorage.setItem("ordini", JSON.stringify([
  { id: 101, cliente: "Anna", prodotto: "Collana", data: "2025-05-10" }
]));

location.reload(); // Ricarica la pagina

cliente
localStorage.setItem("role", "cliente");
localStorage.setItem("user", JSON.stringify({
  nome: "Giulia",
  cognome: "Neri",
  email: "giulia.neri@example.com"
}));

localStorage.setItem("ordini", JSON.stringify([
  { id: 1, prodotto: "Anello in oro", data: "2025-05-08" },
  { id: 2, prodotto: "Bracciale", data: "2025-05-12" }
]));

location.reload(); // Ricarica la pagina

cancellare
localStorage.clear();
location.reload();
*/