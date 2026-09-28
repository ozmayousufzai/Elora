document.addEventListener("DOMContentLoaded", () => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  let cart = JSON.parse(localStorage.getItem("eloraCart") || "[]");
  let saved = JSON.parse(localStorage.getItem("eloraSaved") || "[]");

  const overlay=$("#drawer-overlay"), cartDrawer=$("#cart-drawer"), savedDrawer=$("#saved-drawer");
  const cartItems=$("#cart-items"), savedItems=$("#saved-items"), cartCount=$("#cart-count"), savedCount=$("#saved-count"), cartTotal=$("#cart-total");
  const checkout=$("#checkout"), modal=$("#checkout-modal"), form=$("#checkout-form"), success=$("#order-success");

  const money=n=>`$${Number(n).toFixed(2)}`;
  const store=()=>{localStorage.setItem("eloraCart",JSON.stringify(cart));localStorage.setItem("eloraSaved",JSON.stringify(saved));};
  const notify=msg=>{const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.eloraToast);window.eloraToast=setTimeout(()=>t.classList.remove("show"),1800);};

  function openDrawer(d){cartDrawer.classList.remove("open");savedDrawer.classList.remove("open");d.classList.add("open");overlay.classList.add("show");document.body.classList.add("lock");}
  function closeDrawers(){cartDrawer.classList.remove("open");savedDrawer.classList.remove("open");overlay.classList.remove("show");document.body.classList.remove("lock");}
  $("#cart-button").onclick=()=>openDrawer(cartDrawer);
  $("#saved-button").onclick=()=>{renderSaved();openDrawer(savedDrawer)};
  $("#close-cart").onclick=closeDrawers; $("#close-saved").onclick=closeDrawers; overlay.onclick=closeDrawers;

  function cardProduct(card){const img=card.querySelector("img");return {id:card.dataset.id,name:card.dataset.name,price:Number(card.dataset.price),image:img.src};}

  document.addEventListener("click",e=>{
    const add=e.target.closest(".add-button");
    if(add){const p=cardProduct(add.closest(".product-card"));const found=cart.find(x=>x.id===p.id);found?found.qty++:cart.push({...p,qty:1});store();renderCart();notify(`${p.name} added to your bag`);openDrawer(cartDrawer);return;}
    const heart=e.target.closest(".heart");
    if(heart){const p=cardProduct(heart.closest(".product-card"));const exists=saved.find(x=>x.id===p.id);if(exists){saved=saved.filter(x=>x.id!==p.id);heart.classList.remove("saved");heart.setAttribute("aria-pressed","false");notify("Removed from saved items");}else{saved.push(p);heart.classList.add("saved");heart.setAttribute("aria-pressed","true");notify("Saved to your favorites");}store();renderCounts();renderSaved();return;}
    const qty=e.target.closest("[data-qty]");
    if(qty){const id=qty.dataset.id;const item=cart.find(x=>x.id===id);if(!item)return;item.qty+=qty.dataset.qty==="plus"?1:-1;if(item.qty<=0)cart=cart.filter(x=>x.id!==id);store();renderCart();return;}
    const remove=e.target.closest("[data-remove]");
    if(remove){cart=cart.filter(x=>x.id!==remove.dataset.remove);store();renderCart();return;}
    const savedRemove=e.target.closest("[data-saved-remove]");
    if(savedRemove){saved=saved.filter(x=>x.id!==savedRemove.dataset.savedRemove);store();renderCounts();renderSaved();syncHearts();return;}
  });

  function renderCounts(){cartCount.textContent=cart.reduce((s,x)=>s+x.qty,0);savedCount.textContent=saved.length;}
  function renderCart(){
    if(!cart.length){cartItems.innerHTML='<p class="empty">Your bag is empty. Add a piece you love.</p>';cartTotal.textContent="$0.00";renderCounts();return;}
    cartItems.innerHTML=cart.map(x=>`<div class="cart-item"><img src="${x.image}" alt=""><div><div class="item-name">${x.name}</div><div class="item-meta">${money(x.price)}</div><div class="qty"><button data-qty="minus" data-id="${x.id}">−</button><span>${x.qty}</span><button data-qty="plus" data-id="${x.id}">+</button></div><button class="remove" data-remove="${x.id}">Remove</button></div><strong>${money(x.price*x.qty)}</strong></div>`).join("");
    cartTotal.textContent=money(cart.reduce((s,x)=>s+x.price*x.qty,0));renderCounts();
  }
  function renderSaved(){
    if(!saved.length){savedItems.innerHTML='<p class="empty">No saved pieces yet. Tap ♡ on a design to save it.</p>';return;}
    savedItems.innerHTML=saved.map(x=>`<div class="saved-item"><img src="${x.image}" alt=""><div><div class="item-name">${x.name}</div><div class="item-meta">${money(x.price)}</div><button class="remove" data-saved-remove="${x.id}">Remove</button></div><button class="remove" data-saved-remove="${x.id}">×</button></div>`).join("");
  }
  function syncHearts(){$$(".product-card").forEach(c=>{const h=c.querySelector(".heart");const yes=saved.some(x=>x.id===c.dataset.id);h.classList.toggle("saved",yes);h.setAttribute("aria-pressed",String(yes));h.textContent=yes?"♥":"♡";});}

  $$(".filter").forEach(btn=>btn.onclick=()=>{$$(".filter").forEach(b=>b.classList.remove("active"));btn.classList.add("active");const f=btn.dataset.filter;$$(".product-card").forEach(c=>c.style.display=f==="all"?"":c.dataset.category===f?"":"none");});
  $("#menu-btn").onclick=()=>$("#nav").classList.toggle("open");
  $$("#nav a").forEach(a=>a.onclick=()=>$("#nav").classList.remove("open"));

  checkout.onclick=()=>{if(!cart.length){notify("Your bag is empty");return;}modal.classList.add("show");form.style.display="grid";success.classList.remove("show");};
  $("#close-checkout").onclick=()=>modal.classList.remove("show");
  modal.addEventListener("click",e=>{if(e.target===modal)modal.classList.remove("show");});
  form.onsubmit=e=>{e.preventDefault();form.style.display="none";success.classList.add("show");cart=[];store();renderCart();notify("Order placed — thank you for your purchase!");};
  $("#continue-shopping").onclick=()=>{modal.classList.remove("show");closeDrawers();window.location.hash="shop";};

  renderCart();renderSaved();renderCounts();syncHearts();
});
