let site = document.location;
let url = new URL(site);
let productId = url.searchParams.get("id");

fetch('http://localhost:3000/api/products/' + productId)
    .then(function (response) {
        return response.json();
    })
    .then(function (product) {
        console.log(product)
        // Display Product image
        let img = document.createElement('img');
        img.src = product.imageUrl;
        img.alt = product.altTxt;
        let itemImg = document.querySelector('.item__img');
        itemImg.appendChild(img);

        // Display Product title
        let title = document.getElementById('title');
        title.textContent = product.name;

        // Display Product price
        let price = document.getElementById('price');
        price.textContent = product.price;

        // Display Product description
        let description = document.getElementById('description');
        description.textContent = product.description;

        // Display Product colors
        let colors = document.getElementById('colors');
        for (let color of product.colors) {
            let option = document.createElement('option');
            option.value = color;
            option.textContent = color;
            colors.appendChild(option);
        }
    });

// Click on "add to cart" button
const addToCartButton = document.getElementById('addToCart');

addToCartButton.addEventListener('click', function () {
    let quantity = parseInt(document.getElementById('quantity').value);
    let colorSelected = document.getElementById('colors').value;

    // On récupère les produits enregistrés dans le local storage
    let productsFromLocalStorageJSON = localStorage.getItem('products');

    // On converti les produits qui sont de type "texte" en tableau pour pouvoir utiliser la fonction forEach ensuite par exemple
    let productsFromLocalStorage = JSON.parse(productsFromLocalStorageJSON);

    if (Array.isArray(productsFromLocalStorage) && productsFromLocalStorage.length > 0) {
        // Si des produits existent dans le local storage
        // On regarde dans un premier temps si ce canapé est présent dans les produits récupérés

        let productHasBeenUpdated = updateProductQuantity(productsFromLocalStorage, colorSelected, quantity);

        // Si le canapé n'existe pas dans la liste et qu'il n'a pas la même couleur, on l'ajoute
        if (productHasBeenUpdated === false) {
            addProductInLocalStorage(quantity, colorSelected, productsFromLocalStorage);
        }
    } else {
        // Si pas de produits dans le local storage, on l'ajoute
        addProductInLocalStorage(quantity, colorSelected, productsFromLocalStorage);
    }

    // On converti notre tableau mis à jour "products" en type "texte" pour pouvoir le stocker dans le localStorage
    let productsUpdated = JSON.stringify(productsFromLocalStorage);
    localStorage.setItem("products", productsUpdated);

    document.location.href = "cart.html";
});

function updateProductQuantity(productsFromLocalStorage, colorSelected, quantity) {
    let productHasBeenUpdated = false;
    for (let product of productsFromLocalStorage) {
        // Si le même canapé est trouvé, on ajuste seulement la quantité
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

