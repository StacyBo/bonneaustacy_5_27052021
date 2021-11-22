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
                // Afficher le produit
                let cartItemEl = displayCartItem(product, productFromStorage);

                // Regarde si le même produit existe deja avec une couleur differente 
                if (isAlreadyExistingProduct(productFromStorage)) {
                    groupSameProducts(cartItemEl, productFromStorage);
                } else {
                    // Il n'existe pas, il s'affiche normalement à la suite
                    sectionCartItemsEl.appendChild(cartItemEl);
                }
            });
    }
}
requests().then(function () {
    // Une fois toutes les requêtes et éléments ajoutés dans le DOM
    updateTotals();

    // Evenement quantité
    let quantityElements = document.querySelectorAll('.itemQuantity');
    quantityElements.forEach(quantityEl => {
        quantityEl.addEventListener('change', () => {
            updateProductPrice(quantityEl);
        });
    });

    // Evenement suppression
    let deleteButtonElements = document.querySelectorAll('.deleteItem');
    deleteButtonElements.forEach(deleteButtonEl => {
        deleteButtonEl.addEventListener('click', () => {
            deleteProduct(deleteButtonEl);
        });
    });

    // Evenement envoyer formulaire
    let form = document.querySelector('.cart__order__form');
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Empêche l'envoi automatique (par défaut) du formulaire
        postTheOrder();
    });
});

function displayCartItem(product, productFromStorage) {
    // Afficher le produit
    // on récupère le modèle de l'article
    let cartItemPrototypeEl = document.querySelector('.cart__item');
    let cartItemEl = cartItemPrototypeEl.cloneNode(true);
    cartItemEl.style.display = 'flex';
    cartItemEl.dataset.id = productFromStorage.productId;

    // Afficher l'image
    let imgEl = cartItemEl.querySelector('img');
    imgEl.src = product.imageUrl;
    imgEl.alt = product.altTxt;

    // Afficher le nom du produit
    let productNameEl = cartItemEl.querySelector('.cart__item__content__titlePrice h2');
    productNameEl.textContent = product.name;

    // Afficher la quantité
    let quantityEl = cartItemEl.querySelector('.itemQuantity');
    quantityEl.value = productFromStorage.quantity;
    cartItemEl.dataset.quantity = productFromStorage.quantity;

    // Afficher le prix
    let priceEl = cartItemEl.querySelector('.cart_item_price');
    priceEl.textContent = (product.price * productFromStorage.quantity) + ' €';
    cartItemEl.dataset.price = product.price;

    // Afficher les choix de couleurs
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
            // Supprimer un produit
            productsFromStorage.splice(index, 1);
        }
    });

    // Mise à jour du Local Storage
    let productsUpdated = JSON.stringify(productsFromStorage);
    localStorage.setItem("products", productsUpdated);

    // Supprimer le produit du DOM
    cartItemEl.remove();

    // Mise à jour des totaux des produits
    updateTotals();
}

function updateProductPrice(quantityEl) {
    // Mise à jour des prix des produits 
    let cartItemEl = quantityEl.closest('.cart__item');
    let unitPrice = parseInt(cartItemEl.dataset.price);
    let cartItemPriceEl = cartItemEl.querySelector('.cart_item_price');
    let quantity = quantityEl.value;
    cartItemPriceEl.textContent = (unitPrice * quantity) + ' €';
    cartItemEl.dataset.quantity = quantity;

    // Mise à jour du prix total 
    updateTotals();

    // Mise à jour des quantités dans le Local Storage
    updateQuantityInLocalStorage(cartItemEl, quantity);
}

function updateQuantityInLocalStorage(cartItemEl, quantity) {
    // Chercher si le produit est dans le Local Storage et ajuster les quantités
    for (let productFromStorage of productsFromStorage) {
        if (productFromStorage.productId === cartItemEl.dataset.id && productFromStorage.color === cartItemEl.dataset.color) {
            productFromStorage.quantity = quantity;
            break;
        }
    }

    // Mise à jour du Local Storage 
    let productsUpdated = JSON.stringify(productsFromStorage);
    localStorage.setItem("products", productsUpdated);
}

function updateTotals() {
    // Afficher les totaux
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
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (product) {
            // Remettre le Local Storage a zero
            localStorage.removeItem('products');
            window.location.href = 'confirmation.html?orderId=' + product.orderId;
        })
        .catch((error) => {
            console.error(error);
        });
}

function groupSameProducts(cartItemEl, productFromStorage) {
    // Afficher la couleur
    let cartItemColorEl = cartItemEl.querySelector('.cart_item_color');
    cartItemColorEl.textContent = 'Couleur : ' + productFromStorage.color;
    cartItemColorEl.style.display = 'block';

    // Afficher apres la meme reference de produit 
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
    // Prenom
    if (regexDefault.test(contact.firstName) === false) {
        firstNameErrorMsg.textContent = 'Veuillez saisir un prénom';
        return false;
    } else {
        firstNameErrorMsg.textContent = '';
    }

    // Nom de famille
    if (regexDefault.test(contact.lastName) === false) {
        lastNameErrorMsg.textContent = 'Veuillez saisir un nom';
        return false;
    } else {
        lastNameErrorMsg.textContent = '';
    }

    // Adresse
    let regexAddress = /^[0-9a-z\sàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöü]+$/i;
    if (regexAddress.test(contact.address) === false) {
        addressErrorMsg.textContent = 'Veuillez saisir une adresse';
        return false;
    } else {
        addressErrorMsg.textContent = '';
    }

    // Ville
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