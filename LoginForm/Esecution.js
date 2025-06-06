document.getElementById("login-cliente").addEventListener("submit", async function(event) {
    event.preventDefault(); 

    const email = document.getElementById("email").value;
    const password = document.getElementById("pass").value;

    try {
        const response=await fetch("/loginCliente",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },  
            body: JSON.stringify({ email, password })
        })
        const result = await response.json();
        console.log(result);
        {
            if(!result.success){
                document.getElementById("email").value = "";
                document.getElementById("pass").value = "";
                alert(result.message);
            }else{
                //window.location.href = `../ShopForm/shop.html?id=${email}`;
                sessionStorage.setItem("userEmail", email);
                sessionStorage.setItem("userRole", "cliente");
                window.location.href = `../ShopForm/shop.html?id=${email}`;
            }
        }
    } catch (error) {
        
    }

});


document.getElementById("login-azienda").addEventListener("submit", async function(event) {
    event.preventDefault(); 

    const iva = document.getElementById("pIva").value;
    const emailAzienda = document.getElementById("emailVend").value;
    const password = document.getElementById("passVend").value;
    try {
        const response = await fetch("/loginArtigiano", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },  
            body: JSON.stringify({ emailAzienda, password, iva })
        });

        const result = await response.json();

        if (!result.success) {
            document.getElementById("emailVend").value = "";
            document.getElementById("passVend").value = "";
            document.getElementById("pIva").value = "";
            alert(result.message);
        } else {
            //window.location.href = `../ShopForm/shop.html?id=${email}`;
            sessionStorage.setItem("userEmail", emailAzienda);
            sessionStorage.setItem("userRole", "artigiano");
            window.location.href = `../ShopForm/shop.html?id=${emailAzienda}`;
        }

    } catch (error) {
        console.error("Errore nella richiesta:", error);
        alert("Si è verificato un errore. Riprova più tardi.");
    }
});
