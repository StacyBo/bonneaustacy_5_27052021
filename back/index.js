fetch ('http://localhost:3000/api/products')
    .then (function(response){
        return response.json();
    })
    .then (function(data){
        console.log(data);
    });


// let items = document.getElementById(items)

//.then(function(data){
//    data.forEach(product => {
//        let items = document.getElementById('items');
//            a = document.createElement('a');
//            article = document.createElement('article');
//                article.classList.add('productCard');
//            img = document.createElement('img');
//                img.classList.add('producImage');
//            h3 = document.createElement.add('h3');
//                h3.classList.add('productName');
//            p = document.createElement('p');
//                p.classList.add('prodcutDescription');
//
//    items.appendChild(a);
//    a.appendChild(article);
//    article.appendChild(img);
//    article.appendChild(h3);
//    article.appendChild(p);
//
//    a.href = product._id;
//    img.src = product.imageUrl;
//    h3.innerHTML = product.name;
//    img.alt = product.altTxt;
//    p.innerHTML = product.description;
//
//    })
//})

//document.getElementById(items).innerHTML = fetch ('http://localhost:3000/api/products/'+ id)


