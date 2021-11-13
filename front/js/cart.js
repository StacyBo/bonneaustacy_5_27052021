// On récupère les produits enregistrés dans le local storage
let productsFromLocalStorage = localStorage.getItem('products');
// On converti les produits qui sont de type "texte" en tableau pour pouvoir utiliser la fonction forEach ensuite par exemple
let productsFromStorage = JSON.parse(productsFromLocalStorage);

let sectionCartItemsEl = document.getElementById('cart__items');


async function requests() {
    if (!productsFromStorage) {
        return;
    }
    for (let productFromStorage of productsFromStorage) {
        await fetch('http://localhost:3000/api/products/' + productFromStorage.productId)
            .then(function (response) {
                return response.json();
            })
            .then(function (product) {
                // Display the product
                let cartItemEl = displayCartItem(product, productFromStorage);

                // Check if the same product already exists with a different color
                if (isAlreadyExistingProduct(productFromStorage)) {
                    groupSameProducts(cartItemEl, productFromStorage);
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

function displayCartItem(product, productFromStorage) {
    // Display cart item
    // on récupère le modèle de l'article
    let cartItemPrototypeEl = document.querySelector('.cart__item');
    let cartItemEl = cartItemPrototypeEl.cloneNode(true);
    cartItemEl.style.display = 'flex';
    cartItemEl.dataset.id = productFromStorage.productId;

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

function isAlreadyExistingProduct(productFromStorage) {
    let exists = false;
    for (let product of productsFromStorage) {
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
    for (let productFromStorage of productsFromStorage) {
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
    for (let product of products) {
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

function getProductIds() {
    let productIds = [];
    for (let product of productsFromStorage) {
        productIds.push(product.productId);
    }
    return productIds;
}

function postTheOrder() {
    let firstNameEl = document.getElementById('firstName');
    let lastNameEl = document.getElementById('lastName');
    let addressEl = document.getElementById('address');
    let cityEl = document.getElementById('city');
    let emailEl = document.getElementById('email');

    let contact = {
        firstName: firstNameEl.value,
        lastName: lastNameEl.value,
        address: addressEl.value,
        city: cityEl.value,
        email: emailEl.value
    };

    if (!validateForm(contact)) {
        return;
    }

    let productsIds = getProductIds();

    if (productsIds.length < 1) {
        return;
    }

    const params = {
        contact: contact,
        products: productsIds
    };
    fetch('http://localhost:3000/api/products/order', {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {'Content-Type': 'application/json; charset=utf-8'},
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (product) {
            // Clear the Local Storage
            localStorage.removeItem('products');
            window.location.href = 'confirmation.html?orderId=' + product.orderId;
        })
        .catch((error) => {
            console.error(error);
        });
}

function groupSameProducts(cartItemEl, productFromStorage) {
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
}

function validateForm(contact) {
    let firstNameErrorMsg = document.getElementById('firstNameErrorMsg');
    let lastNameErrorMsg = document.getElementById('lastNameErrorMsg');
    let addressErrorMsg = document.getElementById('addressErrorMsg');
    let cityErrorMsg = document.getElementById('cityErrorMsg');
    let emailErrorMsg = document.getElementById('emailErrorMsg');

    let regexDefault = /^[a-zàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöü]+$/i;
    // firstName
    if (regexDefault.test(contact.firstName) === false) {
        firstNameErrorMsg.textContent = 'Veuillez saisir un prénom';
        return false;
    } else {
        firstNameErrorMsg.textContent = '';
    }

    // LastName
    if (regexDefault.test(contact.lastName) === false) {
        lastNameErrorMsg.textContent = 'Veuillez saisir un nom';
        return false;
    } else {
        lastNameErrorMsg.textContent = '';
    }

    // Address
    let regexAddress = /^[0-9a-z\sàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöü]+$/i;
    if (regexAddress.test(contact.address) === false) {
        addressErrorMsg.textContent = 'Veuillez saisir une adresse';
        return false;
    } else {
        addressErrorMsg.textContent = '';
    }

    // City
    if (regexDefault.test(contact.city) === false) {
        cityErrorMsg.textContent = 'Veuillez saisir une ville';
        return false;
    } else {
        cityErrorMsg.textContent = '';
    }

    // Email
    let regexEmail = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9]+$/;
    if (regexEmail.test(contact.email) === false) {
        emailErrorMsg.textContent = 'Veuillez saisir une adresse Email valide';
        return false;
    } else {
        emailErrorMsg.textContent = '';
    }
    
    return true;
}