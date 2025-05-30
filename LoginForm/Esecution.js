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
                window.location.href = `../ShopForm/shop.html?id=${email}`;
            }
        }
    } catch (error) {
        
    }

});


document.getElementById("login-azienda").addEventListener("submit", async function(event) {
    event.preventDefault(); 

    const iva = document.getElementById("pIva").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("pass").value;

    try {
        const response = await fetch("/loginCliente", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },  
            body: JSON.stringify({ email, password, iva })
        });

        const result = await response.json();

        if (!result.success) {
            document.getElementById("email").value = "";
            document.getElementById("pass").value = "";
            document.getElementById("pIva").value = "";
            alert(result.message);
        } else {
            window.location.href = `../ShopForm/shop.html?id=${email}`;
        }

    } catch (error) {
        console.error("Errore nella richiesta:", error);
        alert("Si è verificato un errore. Riprova più tardi.");
    }
});
