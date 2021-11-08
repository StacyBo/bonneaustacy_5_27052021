// On récupère les produits enregistrés dans le local storage
let productsFromLocalStorage = localStorage.getItem('products');
// On converti les produits qui sont de type "texte" en tableau pour pouvoir utiliser la fonction forEach ensuite par exemple
let productsFromStorage = JSON.parse(productsFromLocalStorage);

let sectionCartItemsEl = document.getElementById('cart__items');
// on récupère le modèle de l'article
let cartItemPrototypeEl = document.querySelector('.cart__item');

async function requests() {
    if (!productsFromStorage) {
        return;
    }
    for (productFromStorage of productsFromStorage) {
        await fetch('http://localhost:3000/api/products/' + productFromStorage.productId)
            .then(function (response) {
                return response.json();
            })
            .then(function (product) {
                // Display the product
                let cartItemEl = displayCartItem(product);

                // Check if the same product already exists with a different color
                if (isAlreadyExistingProduct(product)) {
                    // Display the color
                    let cartItemColorEl = cartItemEl.querySelector('.cart_item_color');
                    cartItemColorEl.textContent = 'Couleur : ' + productFromStorage.color;
                    cartItemColorEl.style.display = 'block';

                    // Display it just after the same product
                    let sameProductEl = document.querySelector('.cart__item[data-id="' + productFromStorage.productId + '"]');
                    if (sameProductEl) {
                        sameProductEl.after(cartItemEl);
                    } else {
                        sectionCartItemsEl.appendChild(cartItemEl);
                    }
                } else {
                    // It doesn't already exist, so display it normally at the end
                    sectionCartItemsEl.appendChild(cartItemEl);
                }
            });
    }
}

requests().then(function () {
    // One time all requests and elements added in the DOM
    updateTotals();

    // Quantity event
    let quantityElements = document.querySelectorAll('.itemQuantity');
    quantityElements.forEach(quantityEl => {
        quantityEl.addEventListener('change', () => {
            updateProductPrice(quantityEl);
        });
    });

    // Delete event
    let deleteButtonElements = document.querySelectorAll('.deleteItem');
    deleteButtonElements.forEach(deleteButtonEl => {
        deleteButtonEl.addEventListener('click', () => {
            deleteProduct(deleteButtonEl);
        });
    });

    // submit form event
    let form = document.querySelector('.cart__order__form');
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Empêche l'envoi automatique (par défaut) du formulaire
        postTheOrder();
    });
});

function displayCartItem(product) {
    // Display cart item
    let cartItemEl = cartItemPrototypeEl.cloneNode(true);
    cartItemEl.style.display = 'flex';
    cartItemEl.dataset.productId = product._id;

    // Display Image
    let imgEl = cartItemEl.querySelector('img');
    imgEl.src = product.imageUrl;
    imgEl.alt = product.altTxt;

    // Display product name
    let productNameEl = cartItemEl.querySelector('.cart__item__content__titlePrice h2');
    productNameEl.textContent = product.name;

    // Display quantity
    let quantityEl = cartItemEl.querySelector('.itemQuantity');
    quantityEl.value = productFromStorage.quantity;
    cartItemEl.dataset.quantity = productFromStorage.quantity;

    // Display price
    let priceEl = cartItemEl.querySelector('.cart_item_price');
    priceEl.textContent = (product.price * productFromStorage.quantity) + ' €';
    cartItemEl.dataset.price = product.price;

    // Add color data
    cartItemEl.dataset.color = productFromStorage.color;

    return cartItemEl;
}

function isAlreadyExistingProduct(product) {
    let exists = false;
    for (product of productsFromStorage) {
        if (product.productId === productFromStorage.productId && product.color !== productFromStorage.color) {
            exists = true;
        }
    }
    return exists;
}

function deleteProduct(deleteButtonEl) {
    let cartItemEl = deleteButtonEl.closest('.cart__item');

    productsFromStorage.forEach(function (productFromStorage, index) {
        if (productFromStorage.productId === cartItemEl.dataset.id && productFromStorage.color === cartItemEl.dataset.color) {
            // Delete the item
            productsFromStorage.splice(index, 1);
        }
    });

    // Update the localStorage
    let productsUpdated = JSON.stringify(productsFromStorage);
    localStorage.setItem("products", productsUpdated);

    // Remove the product from the DOM
    cartItemEl.remove();

    // Update products total
    updateTotals();
}

function updateProductPrice(quantityEl) {
    // Update total product price
    let cartItemEl = quantityEl.closest('.cart__item');
    let unitPrice = parseInt(cartItemEl.dataset.price);
    let cartItemPriceEl = cartItemEl.querySelector('.cart_item_price');
    let quantity = quantityEl.value;
    cartItemPriceEl.textContent = (unitPrice * quantity) + ' €';
    cartItemEl.dataset.quantity = quantity;

    // Update products total
    updateTotals();

    // Update the local storage
    updateQuantityInLocalStorage(cartItemEl, quantity);
}

function updateQuantityInLocalStorage(cartItemEl, quantity) {
    // Find the product and update the quantity
    for (productFromStorage of productsFromStorage) {
        if (productFromStorage.productId === cartItemEl.dataset.id && productFromStorage.color === cartItemEl.dataset.color) {
            productFromStorage.quantity = quantity;
            break;
        }
    }

    // Update the localStorage
    let productsUpdated = JSON.stringify(productsFromStorage);
    localStorage.setItem("products", productsUpdated);
}

function updateTotals() {
    // Display the totals
    let products = document.querySelectorAll('.cart__item');
    let totalArticle = 0;
    let totalPrice = 0;
    for (product of products) {
        if (product.dataset.price && product.dataset.quantity) {
            totalArticle += parseInt(product.dataset.quantity);
            totalPrice += parseInt(product.dataset.quantity) * parseInt(product.dataset.price);
        }
    }
    let totalQuantityEl = document.getElementById('totalQuantity');

    totalQuantityEl.textContent = totalArticle;

    let totalPriceEl = document.getElementById('totalPrice');
    totalPriceEl.textContent = totalPrice.toFixed(2);
}

function postTheOrder() {
    const params = {
        contact: {
            firstName: 'cyril',
            lastName: 'abella',
            address: 'aaa',
            city: 'bbb',
            email: 'cyril.abella@gmail.com'
        },
        products: ['107fb5b75607497b96722bda5b504926', '77711f0e466b4ddf953f677d30b0efc9']
    };
    fetch('http://localhost:3000/api/products/order', {
        method: 'POST',
        body: JSON.stringify(params),
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
        .then(function (response) {
            localStorage.removeItem('products');
            let orderId = response.orderId;
            window.location.href = 'confirmation.html?orderId=' + orderId;

        })
        .catch((error) => {
            console.error(error);
        })
        ;
}
