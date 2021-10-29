let str = window.location.href;
let url = new URL(str);
let id = url.searchParams.get("id");
console.log(id);

fetch('http://localhost:3000/api/products/'+ id)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        data.forEach(product => {
            console.log(product)
    // création des élèments pour les produits de la page d'acceuil
    let a = document.createElement('a');
    let article = document.createElement('article');
    article.classList.add('productCard');
    let img = document.createElement('img');
    img.classList.add('productImage');
    let h3 = document.createElement('productName');
    h3.classList.add('productName');
    let p = document.createElement('p');
    p.classList.add('prodcutDescription');

    // organisation des elements dans le code 
    items.appendChild(a);
    a.appendChild(article);
    article.appendChild(img);
    article.appendChild(h3);
    article.appendChild(p);

    // association des élèments et des données de l'API
    a.href = "product.html?id=" + product._id;
    img.src = product.imageUrl;
    h3.innerHTML = product.name;
    img.alt = product.altTxt;
    p.innerHTML = product.description;
    });
    });

