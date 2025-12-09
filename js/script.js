// ================= NAVBAR STICKY =================

const header = document.querySelector("header");

window.addEventListener("scroll", function () {
    header.classList.toggle("sticky", window.scrollY > 150);
});

// ================= MENU RESPONSIVO =================

let menu = document.querySelector('#menu-icon');
let navlist = document.querySelector('.navlist');

menu.onclick = () => {
    menu.classList.toggle('bx-x');
    navlist.classList.toggle('open');
};

window.onscroll = () => {
    menu.classList.remove('bx-x');
    navlist.classList.remove('open');
};

// ================= CARRITO =================

// Estructura del carrito en memoria
let cart = [];

// Selectores principales
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalSpan = document.getElementById('cart-total');
const cartIcon = document.getElementById('cart-icon');
const cartCloseBtn = document.getElementById('cart-close');
const cartClearBtn = document.getElementById('cart-clear');
const cartWhatsappBtn = document.getElementById('cart-whatsapp');

// Número de WhatsApp del restaurante (sin +)
const WHATSAPP_PHONE = '51955857588';

// Cargar carrito desde localStorage
function loadCart() {
    const saved = localStorage.getItem('lajama_cart');
    if (saved) {
        try {
            cart = JSON.parse(saved);
        } catch (e) {
            cart = [];
        }
    }
    renderCart();
}

function saveCart() {
    localStorage.setItem('lajama_cart', JSON.stringify(cart));
}

// Agregar producto
function addToCart(name, price) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    saveCart();
    renderCart();
}

// Disminuir cantidad
function decreaseItem(name) {
    const item = cart.find(i => i.name === name);
    if (!item) return;
    item.quantity--;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.name !== name);
    }
    saveCart();
    renderCart();
}

// Eliminar producto
function removeItem(name) {
    cart = cart.filter(i => i.name !== name);
    saveCart();
    renderCart();
}

// Calcular total
function getTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Pintar carrito en la vista
function renderCart() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
        cartTotalSpan.textContent = '0.00';
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-name="${item.name}">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-price">S/ ${item.price.toFixed(2)}</span>
            <div class="cart-item-qty">
                <button class="qty-btn btn-decrease">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn btn-increase">+</button>
            </div>
            <span class="cart-item-subtotal">S/ ${(item.price * item.quantity).toFixed(2)}</span>
            <button class="remove-item-btn">&times;</button>
        </div>
    `).join('');

    cartTotalSpan.textContent = getTotal().toFixed(2);
}

// Mostrar / ocultar carrito
function openCart() {
    cartOverlay.classList.add('open');
}

function closeCart() {
    cartOverlay.classList.remove('open');
}

// Construir mensaje para WhatsApp
function buildOrderMessage() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío.');
        return null;
    }

    let message = 'Hola, Vengo del catalogo WEB\n Quiero hacer el siguiente pedido:\n\n';

    cart.forEach(item => {
        message += `- ${item.quantity} x ${item.name} (S/ ${item.price.toFixed(2)})\n`;
    });

    message += `\nTotal: S/ ${getTotal().toFixed(2)}\n`;
    message += `\nDatos del cliente:\nNombre: ______\nDirección: ______\nTeléfono: ______`;

    return encodeURIComponent(message);
}

// Enviar pedido por WhatsApp
function sendOrderByWhatsApp() {
    const encodedMessage = buildOrderMessage();
    if (!encodedMessage) return;

    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;
    window.open(url, '_blank');
}

// ================= EVENTOS =================

// Botones "Add to cart" de los productos
const addToCartButtons = document.querySelectorAll('.add-to-cart');

addToCartButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        const row = btn.closest('.row');
        const name = row.dataset.name;
        const price = parseFloat(row.dataset.price);
        if (!name || isNaN(price)) return;
        addToCart(name, price);
        openCart(); // abre el carrito al agregar
    });
});

// Abrir y cerrar carrito
cartIcon.addEventListener('click', function (e) {
    e.preventDefault();
    openCart();
});

cartCloseBtn.addEventListener('click', closeCart);

cartOverlay.addEventListener('click', function (e) {
    // Cerrar si se hace clic fuera del contenedor
    if (e.target === cartOverlay) {
        closeCart();
    }
});

// Vaciar carrito
cartClearBtn.addEventListener('click', function () {
    if (cart.length === 0) return;
    if (confirm('¿Seguro que deseas vaciar el carrito?')) {
        cart = [];
        saveCart();
        renderCart();
    }
});

// Enviar por WhatsApp
cartWhatsappBtn.addEventListener('click', sendOrderByWhatsApp);

// Manejo de botones +, -, eliminar dentro del carrito (delegación de eventos)
cartItemsContainer.addEventListener('click', function (e) {
    const itemDiv = e.target.closest('.cart-item');
    if (!itemDiv) return;
    const name = itemDiv.dataset.name;

    if (e.target.classList.contains('btn-increase')) {
        const item = cart.find(i => i.name === name);
        if (item) {
            addToCart(name, item.price);
        }
    } else if (e.target.classList.contains('btn-decrease')) {
        decreaseItem(name);
    } else if (e.target.classList.contains('remove-item-btn')) {
        removeItem(name);
    }
});

// Inicializar carrito al cargar la página
loadCart();
