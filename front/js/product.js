let site = document.location;
let url = new URL(site);
let productId = url.searchParams.get("id");

fetch('http://localhost:3000/api/products/' + productId)
    .then(function (response) {
        return response.json();
    })
    .then(function (product) {
        displayProduct(product)
    });

// afficher les produits
function displayProduct(product) {
    displayProductImage(product);
    displayProductName(product);
    displayProductPrice(product);
    displayProductDescription(product);
    displayProductColors(product);
}

function displayProductImage(product) {
    // Afficher l'image du produit
    let img = document.createElement('img');
    img.src = product.imageUrl;
    img.alt = product.altTxt;
    let itemImg = document.querySelector('.item__img');
    itemImg.appendChild(img);
}
function displayProductName(product) {
    // Afficher le nom du produit
    let title = document.getElementById('title');
    title.textContent = product.name;
}
function displayProductPrice(product) {
    // Afficher le prix du produit
    let price = document.getElementById('price');
    price.textContent = product.price;

}
function displayProductDescription(product) {
    // Afficher la description du produit
    let description = document.getElementById('description');
    description.textContent = product.description;
}
function displayProductColors(product) {
    // Afficher la couleur du produit
    let colors = document.getElementById('colors');
    for (let color of product.colors) {
        let option = document.createElement('option');
        option.value = color;
        option.textContent = color;
        colors.appendChild(option);
    }
}

// Cliquer sur "ajouter au panier" 
const addToCartButton = document.getElementById('addToCart');

addToCartButton.addEventListener('click', function () {
    let quantity = parseInt(document.getElementById('quantity').value);
    if (quantity < 1) {
        return;
    }
    let colorSelected = document.getElementById('colors').value;
    if (!colorSelected) {
        return;
    }

    // On r??cup??re les produits enregistr??s dans le local storage
    let productsFromLocalStorageJSON = localStorage.getItem('products');
    // On converti les produits qui sont de type "texte" en tableau pour pouvoir utiliser la fonction forEach ensuite par exemple
    let productsFromLocalStorage = JSON.parse(productsFromLocalStorageJSON);

    if (Array.isArray(productsFromLocalStorage) && productsFromLocalStorage.length > 0) {
        // Si des produits existent dans le local storage
        // On regarde dans un premier temps si ce canap?? est pr??sent dans les produits r??cup??r??s

        let productHasBeenUpdated = updateProductQuantity(productsFromLocalStorage, colorSelected, quantity);

        // Si le canap?? n'existe pas dans la liste et qu'il n'a pas la m??me couleur, on l'ajoute
        if (productHasBeenUpdated === false) {
            addProductInLocalStorage(quantity, colorSelected, productsFromLocalStorage);
        }
    } else {
        // Si pas de produits dans le local storage, on l'ajoute
        productsFromLocalStorage = [];
        addProductInLocalStorage(quantity, colorSelected, productsFromLocalStorage);
    }

    // On converti notre tableau mis ?? jour "products" en type "texte" pour pouvoir le stocker dans le localStorage
    let productsUpdated = JSON.stringify(productsFromLocalStorage);
    localStorage.setItem("products", productsUpdated);

    document.location.href = "cart.html";
});

// Ajuster les quantites de produits
function updateProductQuantity(productsFromLocalStorage, colorSelected, quantity) {
    let productHasBeenUpdated = false;
    for (let product of productsFromLocalStorage) {
        // Si le m??me canap?? est trouv??, on ajuste seulement la quantit??
        if (product.productId === productId && product.color === colorSelected) {
            product.quantity += quantity;
            productHasBeenUpdated = true;
            break;
        }
    }
    return productHasBeenUpdated;
}

function addProductInLocalStorage(quantity, colorSelected, productsFromLocalStorage) {
    let newProduct = {
        productId: productId,
        quantity: quantity,
        color: colorSelected
    };
    productsFromLocalStorage.push(newProduct);
}