let idUtente;

document.addEventListener("DOMContentLoaded", async function () {
    idUtente = getParametro();
    console.log("ID Utente:", idUtente);    
    if (!idUtente) {
        alert("Sessione non trovata. Effettua il login.");
        location.href = "../LoginForm/login-registration.html";
        return;
    }
    const prodotti = await restituisciTuttiProdotti();
    stampaProdotti(prodotti);
});

function getParametro() {
    const urlParams = new URLSearchParams(window.location.search);
    idUtente = urlParams.get('userEmail')|| urlParams.get('id');

    if (idUtente && idUtente !== "null") {
        sessionStorage.setItem("userEmail", idUtente);
        console.log("userId salvato in sessionStorage:", idUtente);
    } else {
        idUtente = sessionStorage.getItem("userEmail");
        console.log("userId preso da sessionStorage:", idUtente);
    }

    return idUtente || null;
}

function getUserRole() {
    return sessionStorage.getItem("userRole") || null;
}

function toggleSidebar() {
    const sidebar = document.getElementById("filtriBox");
    sidebar.classList.toggle("attivo");
}

function accountPersonale() {
    const idUtente = getParametro();
    location.href = `../UserForm/dashboard.html?id=${idUtente}`;
}

function carrelloPersonale() {
    const idUtente = getParametro();
    location.href = `../CartForm/cart.html?id=${idUtente}`;
}

async function aggiuntaProdottoCarrello(idProdotto, idUtente) {
    try {
        const response = await fetch("/aggiungiProdottoCarrello", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ idProdotto, email: idUtente })
        });
        console.log("Aggiunta prodotto al carrello:", { idProdotto, email: idUtente });
        const result = await response.json();
        console.log("Risultato dell'aggiunta al carrello:", result);

        if (result.success) {
            alert("Prodotto aggiunto al carrello con successo!");
        } else {
            alert("Errore nell'aggiunta del prodotto al carrello: " + result.message);
        }
    } catch (error) {
        console.error("Errore durante l'aggiunta al carrello:", error);
        alert("Errore durante l'aggiunta del prodotto al carrello: " + error.message);
    }
}


document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        ricercaNome();
    }
});

async function ricercaNome() {
    const filtroInput = document.getElementById("filtroNome");
    const nomeRicerca = filtroInput.value.toLowerCase().trim();
    if (nomeRicerca === "") {
        filtroInput.value = "";
        filtroInput.placeholder = "Cerca Prodotti....";

        const prodotti = await restituisciTuttiProdotti();
        return stampaProdotti(prodotti);
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
                const prodotti = await restituisciTuttiProdotti();
                stampaProdotti(prodotti);
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
        return result.prodotti;
    } catch (error) {
        alert("Errore durante il recupero dei prodotti: " + error.message);
        return [];
    }
}

function stampaProdotti(prodotti) {
    const container = document.getElementById("prodotti");
    container.innerHTML = "";

    if (!prodotti || prodotti.length === 0) return;

    const fragment = document.createDocumentFragment();

    prodotti.forEach(prodotto => {
        const div = document.createElement("div");
        div.className = "product";
        div.onclick = () => {
            sessionStorage.setItem("idProduct", prodotto.id);
            location.href = `InfoProdottoSpec.html?idProdotto=${prodotto.id}&email=${idUtente}`;
        };

        const img = document.createElement("img");
        img.src = prodotto.immagine;
        img.alt = prodotto.nome;
        img.loading = "lazy";
        div.appendChild(img);

        const h3 = document.createElement("h3");
        h3.textContent = prodotto.nome;
        div.appendChild(h3);

        const price = document.createElement("p");
        price.innerHTML = `<strong> Prezzo: ${Number(prodotto.prezzo).toFixed(2)} €</strong>`;
        div.appendChild(price);

        const btn = document.createElement("button");
        if (prodotto.disponibilita === "0") {
            btn.textContent = "Prodotto non disponibile";
            btn.disabled = true;
            btn.className = "disabled-button";
        } else {
            btn.textContent = "Aggiungi al Carrello";
            btn.onclick = (event) => {
                event.stopPropagation();
                aggiuntaProdottoCarrello(prodotto.id, idUtente);
            };
        }

        div.appendChild(btn);
        fragment.appendChild(div);
    });

    container.appendChild(fragment);
}

function applicaFiltri() {
    const filtri = {
        categoria: {
            uomo: document.getElementById('genereUomo').checked,
            donna: document.getElementById('genereDonna').checked,
            bambino: document.getElementById('genereBambino').checked,
            bambina: document.getElementById('genereBambina').checked,
            unisex: document.getElementById('genereUni').checked
        },
        prezzo: {
            crescente: document.getElementById('prezzoCrescente').checked,
            decrescente: document.getElementById('prezzoDecrescente').checked
        },
        disponibilita: document.getElementById('disponibilità').checked
    };

    applicaFiltriProdotti(filtri);
}

async function applicaFiltriProdotti(filtri) {
    const categorie = [];

    if (filtri.categoria.uomo) categorie.push("'uomo'");
    if (filtri.categoria.donna) categorie.push("'donna'");
    if (filtri.categoria.bambino) categorie.push("'bambino'");
    if (filtri.categoria.bambina) categorie.push("'bambina'");
    if (filtri.categoria.unisex) categorie.push("'unisex'");

    let prodotti = [];

    try {
        if (categorie.length > 0) {
            const query = `SELECT * FROM prodotti WHERE categoria IN (${categorie.join(",")})`;
            const response = await fetch("/prodottoByCategoria", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query })
            });

            const result = await response.json();
            if (result.success) {
                prodotti = result.prodotti;
            } else {
                alert("Errore nel filtro per categoria: " + result.message);
                return;
            }
        } else {
            prodotti = await restituisciTuttiProdotti();
        }

        if (filtri.disponibilita) {
            prodotti = prodotti.filter(p => p.disponibilita > 0);
        }

        if (filtri.prezzo.crescente) {
            prodotti.sort((a, b) => a.prezzo - b.prezzo);
        } else if (filtri.prezzo.decrescente) {
            prodotti.sort((a, b) => b.prezzo - a.prezzo);
        }

        stampaProdotti(prodotti);
        alert("Filtri applicati con successo!");
    } catch (error) {
        console.error("Errore nell'applicazione dei filtri:", error);
        alert("Errore durante l'applicazione dei filtri: " + error.message);
    }
}
