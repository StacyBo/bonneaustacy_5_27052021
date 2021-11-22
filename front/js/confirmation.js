let site = document.location;
let url = new URL(site);
let orderId = url.searchParams.get("orderId");


function displayOrderIdentifier(orderId) {
    // Afficher les numero de commande
    if (orderId) {
        document.getElementById('orderId').textContent = orderId;
    }
}

displayOrderIdentifier(orderId);