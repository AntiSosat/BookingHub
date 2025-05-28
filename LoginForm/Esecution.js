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
        const data = await response.json();
        {
            if(data){
                alert("Utente non trovato o credenziali errate");
            }else{
                window.location.href = "../ShopForm/shop.html";
            }
        }
    } catch (error) {
        
    }

});