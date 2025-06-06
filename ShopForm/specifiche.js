function getParametro() {
    const email = sessionStorage.getItem("userEmail");
    const idProdotto = sessionStorage.getItem("idProduct"); 
    return { idProdotto, email };
}


function aggiuntaProdottoCarrello(idProdotto, email) {
    fetch("/aggiungiProdottoCarrello", {
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
    console.log(sessionStorage.getItem("idProduct"));
    const parametri = getParametro();
    if (!parametri) {
        alert("Sessione o prodotto non trovati. Effettua il login.");
        window.location.href = "../LoginForm/login-registration.html";
        return;
    }
    const { idProdotto, email } = parametri;

    const prodottoSpecifico = await restituisciProdottiSpec(idProdotto);
    console.log("Prodotto specifico:", prodottoSpecifico);
    if (!prodottoSpecifico) {
        alert("Prodotto non trovato.");
        return;
    }

    const wrapper = document.getElementById("product-wrapper");
    if (!wrapper) {
        console.error("Elemento #product-wrapper non trovato.");
        return;
    }

    // Crea il contenitore principale
    const container = document.createElement("div");
    container.className = "container";

    // Sezione immagine
    const imageSection = document.createElement("div");
    imageSection.className = "image-section";
    const img = document.createElement("img");
    img.src = prodottoSpecifico[0].immagine;
    img.alt = prodottoSpecifico[0].nome || "Nome del Prodotto";
    img.loading = "lazy";
    imageSection.appendChild(img);

    // Sezione dettagli
    const detailsSection = document.createElement("div");
    detailsSection.className = "details-section";

    const title = document.createElement("h1");
    title.textContent = prodottoSpecifico.nome;

    const brand = document.createElement("p");
    brand.innerHTML = `<strong>Marchio:</strong> ${prodottoSpecifico[0].ivavenditore}`;

    const color = document.createElement("p");
    color.innerHTML = `<strong>Categoria:</strong> ${prodottoSpecifico[0].categoria}`;

    const description = document.createElement("p");
    description.innerHTML = `<strong>Descrizione:</strong> ${prodottoSpecifico[0].descrizione}`;
    description.className = "description";

    const dispo = document.createElement("p");
    dispo.innerHTML = `<strong>Disponibilità: </strong> ${prodottoSpecifico[0].disponibilita}`;
    dispo.className = "dispo";

    const price = document.createElement("p");
    price.className = "price";
    price.textContent = prodottoSpecifico[0].prezzo + " €";

    // Pulsante acquisto
    let acquisto
    const buySection = document.createElement("div");
    if(prodottoSpecifico[0].disponibilita === "0") {
    buySection.className = "buy-section";
    acquisto = document.createElement("button");
    acquisto.textContent = "Prodotto non disponibile";
    acquisto.disabled = true;
    acquisto.className = "disabled-button";
    }else{
    buySection.className = "buy-section";
    acquisto = document.createElement("button");
    acquisto.textContent = "Aggiungi al Carrello";
    acquisto.onclick = () => {
        aggiuntaProdottoCarrello(idProdotto, email);
    }
}
    buySection.appendChild(acquisto);

    // Appendi tutto alla sezione dettagli
    detailsSection.appendChild(title);
    detailsSection.appendChild(brand);
    detailsSection.appendChild(color);
    detailsSection.appendChild(description);
    detailsSection.appendChild(dispo);
    detailsSection.appendChild(price);
    detailsSection.appendChild(buySection);

    // Appendi le sezioni al container principale
    container.appendChild(imageSection);
    container.appendChild(detailsSection);

    // Infine, appendi il container alla pagina
    wrapper.appendChild(container);
});

async function restituisciProdottiSpec(idProdotto) {
    try {
        const response = await fetch("/prodottobyID", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: idProdotto })
        });
        if (!response.ok) {
            throw new Error("Errore nella risposta dal server");
        }
        const result = await response.json();
        return result.prodotti;
    } catch (error) {
        return null;
    }
}
