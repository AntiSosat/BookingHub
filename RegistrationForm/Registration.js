
document.getElementById("registrazioneAzienda").addEventListener("submit", async function (event) {
    event.preventDefault();
    const nomeAzienda = document.getElementById("nomeAz").value;
    const iva = document.getElementById("pIva").value;
    const telefono = document.getElementById("numTel").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("pass").value;
    const confermaPassword = document.getElementById("passFinale").value;
    if (password !== confermaPassword) {
        alert("Le password non corrispondono");
        return;
    } else {

        try {
            const response = await fetch("/artigianiRegistrazione", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ nomeAzienda, iva, telefono ,email, password })
            })
            const result = await response.json();
            {
                if (result.success) {
                    window.location.href = "../ShopForm/shop.html?id=${email}";
                } 
            }
        } catch (error) {

        }
    }

});

document.getElementById("registrazioneCliente").addEventListener("submit", async function (event) {
    event.preventDefault();
    const id = Math.random();
    const nome = document.getElementById("nome").value;
    const cognome = document.getElementById("cognome").value;
    const datatNascita = document.getElementById("dataNascita").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("pass").value;
    const confermaPassword = document.getElementById("passFinale").value;
    if (password !== confermaPassword) {
        alert("Le password non corrispondono");
        return;
    } else {

        try {
            const response = await fetch("/registrazioneCliente", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id, nome, cognome ,email, datatNascita, password})
            })
            const result = await response.json();
            {
                if (result.success) {
                    window.location.href = "../ShopForm/shop.html?id=${email}";
                } 
            }
        } catch (error) {

        }
    }

});