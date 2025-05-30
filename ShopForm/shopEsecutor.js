const email = getParametro();


function getParametro() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('email');
}

function toggleSidebar() {
    const sidebar = document.getElementById("filtriBox");
    sidebar.classList.toggle("attivo");
}

function accountPersonale(){
    location.href = `../UserForm/dashboard.html?email=${email}`; 
}
function carrelloPersonale(){
    location.href = `../CartForm/cart.html?email=${email}`; 
}

function aggiuntaProdottoCarrello(idProdotto, email) {
    fetch("/aggiungiProdotto", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ idProdotto, email })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Prodotto aggiunto al carrello con successo!");
        } else {
            alert("Errore nell'aggiunta del prodotto al carrello: " + data.message);
        }
    })
    .catch(error => {
        alert("Errore durante l'aggiunta del prodotto al carrello: " + error.message);
    });
}

document.addEventListener("DOMContentLoaded", async function () {
const prodotti = await restituisciTuttiProdotti();
    if (prodotti.length > 0) {
        Object.values(prodotti).forEach(prodotto => {
            const prodottiContainer = document.getElementById("prodotti");

            // Crea il div principale del prodotto
            const productDiv = document.createElement("div");
            productDiv.className = "product";
            productDiv.onclick = () => {
                location.href = `infoProdottoSpec.html?id=${prodotto.id},${email}`; // Reindirizza alla pagina delle specifiche del prodotto
            };

            // Crea e aggiungi l'immagine
            const img = document.createElement("img");
            img.src = prodotto.immagine;
            img.alt = prodotto.nome;
            productDiv.appendChild(img);

            // Titolo
            const h3 = document.createElement("h3");
            h3.textContent = prodotto.nome;
            productDiv.appendChild(h3);

            // Prezzo
            const price = document.createElement("p");
            price.innerHTML = `<strong>${prodotto.prezzo}</strong>`;
            productDiv.appendChild(price);

            // Bottone
            const btn = document.createElement("button");
            btn.textContent = "Aggiungi al carrello";//Aggiungere funzionalità per aggiungere al carrello
            btn.onclick = (event) => {
                aggiuntaProdottoCarrello(prodotto.id, email);
            }
            productDiv.appendChild(btn);

            // Aggiungi tutto al contenitore
            prodottiContainer.appendChild(productDiv);
        })
    }
});


    
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
    }
}
