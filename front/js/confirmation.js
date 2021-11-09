let site = document.location;
let url = new URL(site);
let orderId = url.searchParams.get("orderId");

// Display the order identifier
if (orderId) {
    document.getElementById('orderId').textContent = orderId;
}