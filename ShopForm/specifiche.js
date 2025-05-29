const id = getParametro(id);


function getParametro() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}
document.addEventListener("DOMContentLoaded", async function () {
    const prodotti = await restituisciProdottoSpec();
    if (prodotti.length > 0) {
        Object.values(prodotti).forEach(prodotto => {
            const prodottiContainer = document.getElementById("prodotti");

            // Crea il div principale del prodotto
            const productDiv = document.createElement("div");
            productDiv.className = "product";
            productDiv.onclick = () => {
                location.href = prodotto.link;
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
            productDiv.appendChild(btn);

            // Aggiungi tutto al contenitore
            prodottiContainer.appendChild(productDiv);
        })
    }
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