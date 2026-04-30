const cartItemsEl = document.getElementById("cartItems");
const totalEl = document.getElementById("cartTotal");

function renderCart() {
  const cart = getCart();

  cartItemsEl.innerHTML = "";

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <img src="${item.image}" />
      <div>
        <p>${item.name}</p>
        <p>$${item.price} x ${item.quantity}</p>
      </div>
    `;

    cartItemsEl.appendChild(div);
  });

  totalEl.textContent = `Total: $${total}`;
}

renderCart();
