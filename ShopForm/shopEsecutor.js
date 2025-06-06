// const email = getParametro();


// function getParametro() {
//     const urlParams = new URLSearchParams(window.location.search);
//     const email = urlParams.get('email') || urlParams.get('id');
//     return (email && email !== "null") ? email : null;
// }
let email;
function getParametro() {
    const urlParams = new URLSearchParams(window.location.search);
    email = urlParams.get('id') || urlParams.get('email');
    if (email && email !== "null") {
        sessionStorage.setItem("userEmail", email);
        console.log("userEmail salvato in sessionStorage:", sessionStorage.getItem("userEmail"));
    } else {
        email = sessionStorage.getItem("userEmail");
        console.log("userEmail presa in sessionStorage:", sessionStorage.getItem("userEmail"));
    }
    return email ? email : null;
}

function getUserRole() {
    return sessionStorage.getItem("userRole") || null;
}

function toggleSidebar() {
    const sidebar = document.getElementById("filtriBox");
    sidebar.classList.toggle("attivo");
}

function accountPersonale() {
    const email = getParametro();
    console.log("EMAIL PRIMA DEL REDIRECT DASHBOARD:", email);   //non ancora testato ma credo sia la stessa cosa di sotto , `../UserForm/dashboard.html?email=${email}
    location.href = `../UserForm/dashboard.html?id=${email}`;
}
function carrelloPersonale() {
    const email = getParametro();
    console.log("EMAIL PRIMA DEL REDIRECT:", email);  //ora ok funziona, prima dava null con sotto  ../CartForm/cart.html?email=${email}
    location.href = `../CartForm/cart.html?id=${email}`;
}

async function aggiuntaProdottoCarrello(idProdotto, email) {

    const resp = await fetch(`/prodotto/disponibilita?id=${idProdotto}`);
    const data = await resp.json();
    if (data.disponibilita <= 0) { 
        alert("Prodotto esaurito");
        return;
    }


    try {
        const response = await fetch("/aggiungiProdottoCarrello", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ idProdotto, email })
        })
        const result = await response.json();
        console.log("Risultato dell'aggiunta al carrello:", result);
        if (result.success) {
            alert("Prodotto aggiunto al carrello con successo!");
        } else {
            alert("Errore nell'aggiunta del prodotto al carrello: " + data.message);
        }
    } catch (error) {
        console.error("Errore durante l'aggiunta del prodotto al carrello:", error);
        alert("Errore durante l'aggiunta del prodotto al carrello: " + error.message);
    }
}
document.addEventListener("DOMContentLoaded", async function () {

    const email = getParametro();
    if (!email) {
        alert("Sessione non trovata. Effettua il login.");
        console.log("Email di sessione: ", email);
        location.href = "../LoginForm/login-registration.html";
        return;
    }
    const prodotti = await restituisciTuttiProdotti();
    stampaProdotti(prodotti);

});
document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Previene l'invio del form
        ricercaNome(); // Chiama la funzione di ricerca
    }
});

async function ricercaNome() {
    document.getElementById("prodotti").innerHTML = "";
    const nomeRicerca = document.getElementById("filtroNome").value.toLowerCase().trim();
    document.getElementById("filtroNome").value = ""; // Pulisce il campo di ricerca dopo l'invio
    document.getElementById("filtroNome").placeholder = "Cerca Prodotti...."; // Pulisce il campo di ricerca dopo l'invio
    if (!nomeRicerca) {
        const resultTutti = await restituisciTuttiProdotti();
        stampaProdotti(resultTutti);
    } else {
        try {
            const response = await fetch("/ricercaProdottiNome", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ nome: nomeRicerca })
            });
            const result = await response.json();
            if (result.success) {
                stampaProdotti(result.prodotti);
            } else {
                alert("Nessun prodotto trovato con il nome: " + nomeRicerca);
                const resultTutti = await restituisciTuttiProdotti();
                stampaProdotti(resultTutti);
            }
        } catch (error) {
            alert("Errore durante la ricerca dei prodotti: " + error.message);
        }
    }
}


async function restituisciTuttiProdotti() {
    try {
        const response = await fetch("/prodotti", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const result = await response.json();
        return result;
    } catch (error) {
        alert("Errore durante il recupero dei prodotti: " + error.message);
        return [];
    }
}

function stampaProdotti(prodotti) {
    if (prodotti && Object.keys(prodotti).length > 0) {
        const prodottiContainer = document.getElementById("prodotti");
        const fragment = document.createDocumentFragment();
        console.log("Prodotti ricevuti:", prodotti);
        Object.values(prodotti).forEach(prodotto => {
            const productDiv = document.createElement("div");
            productDiv.className = "product";
            productDiv.onclick = () => {
                sessionStorage.setItem("idProduct", prodotto.id);
                location.href = `InfoProdottoSpec.html?id=${prodotto.id},${email}`;
            };

            const img = document.createElement("img");
            img.src = prodotto.immagine;
            img.alt = prodotto.nome;
            img.loading = "lazy"; // Lazy loading
            productDiv.appendChild(img);

            const h3 = document.createElement("h3");
            h3.textContent = prodotto.nome;
            productDiv.appendChild(h3);

            const price = document.createElement("p");
            price.innerHTML = `<strong> Prezzo: ${prodotto.prezzo} €</strong>`;
            productDiv.appendChild(price);

            const btn = document.createElement("button");
            btn.textContent = "Aggiungi al carrello";

            if (prodotto.disponibilita <= 0) {  
                btn.disabled = true;            
                btn.textContent = "Non disponibile";
            } else {
                btn.onclick = (event) => {
                    event.stopPropagation();
                    aggiuntaProdottoCarrello(prodotto.id, email);
                };
            }
            productDiv.appendChild(btn);

            fragment.appendChild(productDiv);
        });

        prodottiContainer.appendChild(fragment);
        console.log("Prodotti stampati correttamente:", prodotti);
    }
}
