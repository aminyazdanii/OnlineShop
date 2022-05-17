const cartBtn = document.querySelector('.cart-btn');
const confirmBtn = document.querySelector('.cart-confirm')
const cartModal = document.querySelector('.cart');
const backDrop = document.querySelector('.backdrop')
const ProductsDOM = document.querySelector('.products-center')
const cartTotal = document.querySelector('.cart-total');
const cartItems = document.querySelector('.cart-items');
const cartContent = document.querySelector('.cart-content');
const clearCart = document.querySelector('.cart-clear');

cartBtn.addEventListener('click',showCartModal);
backDrop.addEventListener('click',closeCartModal);
confirmBtn.addEventListener('click',closeCartModal);

function showCartModal() {
    cartModal.style.top = '20%' ;
    cartModal.style.opacity = '1';
    backDrop.style.display = 'block';
}

function closeCartModal() {
    cartModal.style.top = '-100%' ;
    cartModal.style.opacity = '0';
    backDrop.style.display = 'none';
}

import { productsData } from "./products.js";
let cart = [];
let  buttonsDom = [];
document.addEventListener('DOMContentLoaded',()=>{
    const products = new Products;
    const productsData = products.getProducts();
    const ui = new UI;
    ui.setupApp();
    ui.displayProducts(productsData);
    ui.getAddToCartBtns();
    ui.cartLogic();
    Storage.saveProducts(productsData);
})

class Products {
    getProducts() {
        return productsData;
    }
}

class UI {
    
    displayProducts(products) {
        let resualt = '';
        products.forEach(item => {
            resualt+= ` <section class="product">
            <div class="img-container">
                <img class="product-img" src=${item.imageUrl} alt="p-${item.id}" />
            </div>
            <div class="product-desc">
                <p class="product-title">${item.title}</p>
                <p class="product-price">${item.price}$</p>
            </div>
            <button class="add-to-cart" data-id=${item.id}>add to cart</button>
        </section>`;
        ProductsDOM.innerHTML = resualt;
        });
    }
    
    getAddToCartBtns() {
        const addToCartBtns = [...document.querySelectorAll('.add-to-cart')];
        buttonsDom = addToCartBtns;
        addToCartBtns.forEach( (btn) => {
            const id = btn.dataset.id;
            const isInCart = cart.find((p)=> p.id === id);
            if (isInCart) {
                btn.innerText = 'In Cart';
                btn.disabled = true;
            }
            btn.addEventListener('click',(event) => {
                event.target.innerText = 'In Cart';
                event.target.disabled = true;
                const addedProduct = {...Storage.getProduct(id), quantity : 1 }
                cart = [...cart, addedProduct];
                Storage.saveCart(cart);
                this.setCartValue(cart);
                this.addCartItem(addedProduct);
            })
        })
    }

    setCartValue(cart) {
        let tempCartItem = 0;
        const totalPrice = cart.reduce((acc, curr) => {
            tempCartItem += curr.quantity;
            return acc + curr.quantity * curr.price;
        }, 0);
        cartTotal.innerText = `Total Price: ${totalPrice.toFixed(2)}$`;
        cartItems.innerText = tempCartItem;
    }

    addCartItem(cartItem) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <img class="cart-item-img" src=${cartItem.imageUrl}>
        <div class="cart-item-desc">
            <h4>${cartItem.title}</h4>
            <h5>${cartItem.price} $</h5>
        </div>
        <div class="cart-item-controller">
            <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
            <p>${cartItem.quantity}</p>
            <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>
        </div>
        <i class='far fa-trash-alt' data-id=${cartItem.id}></i>`;
        cartContent.appendChild(div);
    }

    setupApp() {
        cart = Storage.getCart() || [];  
        cart.forEach((cartItem) => this.addCartItem(cartItem));
        this.setCartValue(cart);
    }
    
    cartLogic() {
        clearCart.addEventListener('click',()=> this.clearCart());
        cartContent.addEventListener('click',(event)=>{
            
            if (event.target.classList.contains('fa-chevron-up')){
                const addQuantity = event.target;
                const addedItem = cart.find((cItem)=>cItem.id == addQuantity.dataset.id)
                addedItem.quantity++;
                this.setCartValue(cart);
                Storage.saveCart(cart);
                addQuantity.nextElementSibling.innerText = addedItem.quantity;
            } else if (event.target.classList.contains('fa-chevron-down')) {
                const subQuantity = event.target;
                const substractedItem = cart.find((c)=> c.id == subQuantity.dataset.id);
                if(substractedItem.quantity === 1){
                    this.removeItem(substractedItem.id);
                    cartContent.removeChild(subQuantity.parentElement.parentElement);
                }
                substractedItem.quantity--;
                this.setCartValue(cart);
                Storage.saveCart(cart);
                subQuantity.previousElementSibling.innerText = substractedItem.quantity;
            } else if (event.target.classList.contains('fa-trash-alt')) {
                const removeItem = event.target;
                const _removedItem = cart.find((c)=> c.id == removeItem.dataset.id);
                this.removeItem(_removedItem.id);
                Storage.saveCart(cart);
                cartContent.removeChild(removeItem.parentElement);
            }
        })
    }

    clearCart() {
        cart.forEach((cItem) => this.removeItem(cItem.id));
        while(cartContent.children.length) {
            cartContent.removeChild(cartContent.children[0]);
        }
        closeCartModal();
    }

    removeItem(id) {
        cart = cart.filter((cItem)=> cItem.id !== id);
        this.setCartValue(cart);
        Storage.saveCart(cart);
        const button = buttonsDom.find((btn) => parseInt(btn.dataset.id) === parseInt(id));
        button.innerText='add to cart';
        button.disabled = false;
    }
}

class Storage {
    static saveProducts(products) {
       localStorage.setItem('products',JSON.stringify(products));
   } 
    static getProduct(id) {
        const _products = JSON.parse(localStorage.getItem('products'));
        return _products.find((p)=> p.id === parseInt(id))       
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart() {
        return JSON.parse(localStorage.getItem('cart'))
        ? JSON.parse(localStorage.getItem('cart'))
        : [];
    }
}