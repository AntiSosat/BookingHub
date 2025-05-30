const {idPord,email} = getParametro();


function getParametro() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get({
        id: urlParams.get('id'),
        email: urlParams.get('email')
    });
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
    prodottoSpecifico = await restituisciProdottiSpec();
    const wrapper = document.getElementById("product-wrapper");

    // Crea il contenitore principale
    const container = document.createElement("div");
    container.className = "container";

    // Sezione immagine
    const imageSection = document.createElement("div");
    imageSection.className = "image-section";
    const img = document.createElement("img");
    img.src = prodottoSpecifico.immagine;
    img.alt = "Nome del Prodotto";
    imageSection.appendChild(img);

    // Sezione dettagli
    const detailsSection = document.createElement("div");
    detailsSection.className = "details-section";

    const title = document.createElement("h1");
    title.textContent = prodottoSpecifico.nome;

    const brand = document.createElement("p");
    brand.innerHTML = "<strong>Marchio:</strong> ${prodottoSpecifico.idVenditore}";

    const color = document.createElement("p");
    color.innerHTML = "<strong>Categoria:</strong> ${prodottoSpecifico.categoria}";

    const description = document.createElement("p");
    description.innerHTML = "<strong>Descrizione:</strong> ${prodottoSpecifico.descrizione}";
    description.className = "description";

    const price = document.createElement("p");
    price.className = "price";
    price.textContent = prodottoSpecifico.prezzo + " €";

    // Pulsante acquisto
    const buySection = document.createElement("div");
    buySection.className = "buy-section";
    const button = document.createElement("button");
    button.textContent = "Aggiungi al Carrello";
    btn.onclick = (event) => {
        aggiuntaProdottoCarrello(prodotto.id, email);
    }
    buySection.appendChild(button);

    // Appendi tutto alla sezione dettagli
    detailsSection.appendChild(title);
    detailsSection.appendChild(brand);
    detailsSection.appendChild(color);
    detailsSection.appendChild(description);
    detailsSection.appendChild(price);
    detailsSection.appendChild(buySection);

    // Appendi le sezioni al container principale
    container.appendChild(imageSection);
    container.appendChild(detailsSection);

    // Infine, appendi il container alla pagina
    wrapper.appendChild(container);
});

async function restituisciProdottiSpec() {
    try {
        const response = await fetch("/prodottobyID", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
            , body: JSON.stringify({ id: id })
        });
        const result = await response.json();
        return result;
    } catch (error) {
        alert("Errore durante il recupero dei prodotti: " + error.message);
    }
}