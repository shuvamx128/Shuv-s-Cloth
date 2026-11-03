const WHATSAPP = "9779767258429"; // put your WhatsApp number here
const SHOW_RATINGS = true;        // set to false to hide the star ratings

const CL = {
  black:["Black","#111111"], white:["White","#f5f5f5"], grey:["Grey","#9ca3af"],
  navy:["Navy","#1e2a5a"], beige:["Beige","#d6c3a3"], red:["Red","#dc2626"],
  olive:["Olive","#6b7a4a"], blue:["Blue","#3b6fb6"], maroon:["Maroon","#6d1f3a"],
  brown:["Brown","#6b4f3a"], cream:["Cream","#f3ead7"], lavender:["Lavender","#cfc8e6"],
  green:["Green","#1f5c3a"]
};
const TOP = ["S","M","L","XL"];

const P = (id,name,cat,price,old,rating,colors,sizes,imgs) => {
  const list = [].concat(imgs);
  return { id,name,cat,price,old,rating,colors:colors.map(c=>CL[c]),sizes,imgs:list,img:list[0] };
};

const products = [
  P(1,"Navy Cable Knit Sweater","Sweaters",1800,0,4.8,["navy"],TOP,"109201.png"),
  P(2,"Black Sleeveless Printed Tee","T-shirts",700,0,4.6,["black"],TOP,"108751.jpg"),
  P(3,"Olive Zip Jacket","Jackets",2800,0,4.7,["olive"],TOP,"106254.jpg"),
  P(4,"Cream Oversized T-shirt","T-shirts",900,0,4.7,["cream"],TOP,"102253.png"),
  P(5,"Maroon Casual Shirt","Shirts",1300,0,4.6,["maroon"],TOP,["89968.jpg","88355.jpg"]),
  P(6,"Beige Windbreaker Jacket","Jackets",2400,0,4.5,["beige"],TOP,"89941.jpg"),
  P(7,"Lavender Check Shirt","Shirts",1200,0,4.5,["lavender"],TOP,"89925.jpg"),
  P(8,"Maroon Full Sleeve T-shirt","T-shirts",950,0,4.6,["maroon"],TOP,"87694.jpg"),
  P(9,"Black Full Sleeve Shirt","Shirts",1300,0,4.7,["black"],TOP,"87686.jpg"),
  P(10,"Red Track Jacket","Jackets",2200,0,4.6,["red"],TOP,"87211_heic.jpg"),
  P(11,"Black & White Flannel Shirt","Shirts",1400,0,4.8,["black"],TOP,"86685.jpg"),
  P(12,"Maroon Striped Sleeve Tee","T-shirts",850,0,4.4,["maroon"],TOP,"72564_heic.jpg"),
  P(13,"Grey Polo T-shirt","T-shirts",1000,0,4.5,["grey"],TOP,"66202.jpg"),
  P(14,"Brown Suede Bomber Jacket","Jackets",3200,0,4.9,["brown"],TOP,["57161.jpg","57051.jpg"]),
  P(15,"Confident Graphic Tee","T-shirts",950,0,4.7,["cream"],TOP,"57091.jpg"),
  P(16,"Beige Plaid Hooded Shirt Jacket","Jackets",2600,0,4.7,["beige"],TOP,"51292.jpg"),
  P(17,"Green Zip-Up Hoodie","Hoodies",2100,0,4.8,["green"],TOP,"51290.jpg")
];

const cats = [
  { name:"All", img:"106254.jpg" },
  { name:"Hoodies", img:"51290.jpg" },
  { name:"T-shirts", img:"57091.jpg" },
  { name:"Shirts", img:"86685.jpg" },
  { name:"Sweaters", img:"109201.png" },
  { name:"Jackets", img:"57161.jpg" }
];
const popular = ["Hoodie","T-shirt","Shirt","Sweater","Jacket"];

const banners = [
  { img:"57051.jpg", tag:"NEW ARRIVAL", title:"Winter Jackets Collection", text:"Stylish. Warm. Ready to wear.", cat:"Jackets" },
  { img:"109201.png", tag:"COZY PICKS", title:"Sweaters & Hoodies", text:"Soft fabric, perfect fit.", cat:"Sweaters" },
  { img:"57091.jpg", tag:"BEST PRINT", title:"Everyday Graphic Tees", text:"Order easily on WhatsApp.", cat:"T-shirts" }
];

const $ = id => document.getElementById(id);
let cart = [], wish = new Set(), category = "All", cur = null, sel = {}, slide = 0;

const stars = r => SHOW_RATINGS
  ? `<div class="stars">${"★".repeat(Math.round(r))}${"☆".repeat(5 - Math.round(r))} <small>${r}</small></div>` : "";

function toast(msg) {
  $("toast").textContent = msg;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 1800);
}

/* ---------- Save / load ---------- */
function save() {
  try {
    localStorage.setItem("shuv_cart", JSON.stringify(cart));
    localStorage.setItem("shuv_wish", JSON.stringify([...wish]));
  } catch (e) {}
}
function load() {
  try {
    cart = JSON.parse(localStorage.getItem("shuv_cart") || "[]");
    wish = new Set(JSON.parse(localStorage.getItem("shuv_wish") || "[]"));
  } catch (e) { cart = []; wish = new Set(); }
}

/* ---------- Hero banner ---------- */
function showHero() {
  $("slides").innerHTML = banners.map(b => `
    <div class="slide" style="background-image:url('${b.img}')">
      <div>
        <small>${b.tag}</small>
        <h2>${b.title}</h2>
        <p>${b.text}</p>
        <button onclick="setCat('${b.cat}')">Shop Now</button>
      </div>
    </div>`).join("");
  $("dots").innerHTML = banners.map((_, i) => `<i class="${i === 0 ? "on" : ""}"></i>`).join("");
}
function goSlide(n) {
  slide = (n + banners.length) % banners.length;
  $("slides").style.transform = `translateX(-${slide * 100}%)`;
  document.querySelectorAll("#dots i").forEach((d, i) => d.classList.toggle("on", i === slide));
}
setInterval(() => goSlide(slide + 1), 4500);
let tx = 0;
$("slides").addEventListener("touchstart", e => { tx = e.touches[0].clientX; }, { passive:true });
$("slides").addEventListener("touchend", e => {
  const d = e.changedTouches[0].clientX - tx;
  if (Math.abs(d) > 40) goSlide(slide + (d < 0 ? 1 : -1));
});

/* ---------- Chips & categories ---------- */
function showChips() {
  $("chips").innerHTML = popular.map(c => `<button class="chip" onclick="quickSearch('${c}')">${c}</button>`).join("");
}
function quickSearch(t) {
  $("search").value = t; category = "All";
  showCats(); showProducts(); scrollToShop();
}
function scrollToShop() { $("shop").scrollIntoView({ behavior:"smooth" }); }

function showCats() {
  $("cats").innerHTML = cats.map(c => `
    <button class="cat ${c.name === category ? "active" : ""}" onclick="setCat('${c.name}')">
      <div class="ring"><img src="${c.img}" alt="${c.name}" loading="lazy"></div>${c.name}
    </button>`).join("");
}
function setCat(c) {
  category = c; $("search").value = "";
  showCats(); showProducts(); scrollToShop(); setNav("navHome");
}
function setNav(id) {
  document.querySelectorAll(".bottom button").forEach(b => b.classList.toggle("on", b.id === id));
}

/* ---------- Products ---------- */
function showProducts() {
  const q = $("search").value.toLowerCase().trim().replace(/s$/, "");
  const pr = $("price").value;
  let list = products.filter(p => {
    if (category === "Saved" && !wish.has(p.id)) return false;
    if (category !== "All" && category !== "Saved" && p.cat !== category) return false;
    const text = (p.name + " " + p.cat + " " + p.colors.map(c => c[0]).join(" ")).toLowerCase();
    if (q && !text.includes(q)) return false;
    if (pr === "1" && p.price >= 1000) return false;
    if (pr === "2" && (p.price < 1000 || p.price > 2000)) return false;
    if (pr === "3" && p.price <= 2000) return false;
    return true;
  });
  const s = $("sort").value;
  if (s === "low") list.sort((a, b) => a.price - b.price);
  if (s === "high") list.sort((a, b) => b.price - a.price);
  if (s === "rating") list.sort((a, b) => b.rating - a.rating);

  const typed = $("search").value.trim();
  $("title").textContent = typed ? `Results for “${typed}”`
    : category === "Saved" ? "Saved Items" : category === "All" ? "All Products" : category;
  $("countText").textContent = list.length + " products found";

  $("grid").innerHTML = list.map(p => `
    <div class="card">
      <div class="pic">
        <img src="${p.img}" alt="${p.name}" loading="lazy" onclick="openModal(${p.id})">
        <span class="label">${p.cat}</span>
        <button class="heart ${wish.has(p.id) ? "on" : ""}" onclick="toggleWish(${p.id})">${wish.has(p.id) ? "♥" : "♡"}</button>
        <button class="add" onclick="openModal(${p.id})">ADD</button>
      </div>
      <div class="pinfo">
        <span class="pbadge">NPR ${p.price}${p.old ? `<s>${p.old}</s>` : ""}</span>
        <h3>${p.name}</h3>
        ${stars(p.rating)}
      </div>
    </div>`).join("") || `<p class="empty" style="grid-column:1/-1">No products found</p>`;
}

function toggleWish(id) {
  wish.has(id) ? wish.delete(id) : wish.add(id);
  $("wcount").textContent = wish.size;
  save(); showProducts();
}

/* ---------- Product popup ---------- */
function openModal(id) {
  cur = products.find(p => p.id === id);
  sel = { size: cur.sizes[0], color: cur.colors[0][0], qty: 1 };
  renderModal();
  $("modal").classList.add("show");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  $("modal").classList.remove("show");
  document.body.style.overflow = "";
}

function renderModal() {
  $("sheet").innerHTML = `
    <button class="x" onclick="closeModal()">✕</button>
    <div class="gal">${cur.imgs.map(s => `<img src="${s}" alt="${cur.name}">`).join("")}</div>
    ${cur.imgs.length > 1 ? `<div class="swipe">← Swipe for more photos →</div>` : ""}
    <h2>${cur.name}</h2>
    ${stars(cur.rating)}
    <span class="pbadge">NPR ${cur.price}${cur.old ? `<s>${cur.old}</s>` : ""}</span>

    <h4>Color: <span>${sel.color}</span></h4>
    <div class="opts">${cur.colors.map(([n, h]) =>
      `<button class="dot ${n === sel.color ? "on" : ""}" style="background:${h}" onclick="pick('color','${n}')"></button>`).join("")}</div>

    <h4>Size: <span>${sel.size}</span></h4>
    <div class="opts">${cur.sizes.map(s =>
      `<button class="size ${s === sel.size ? "on" : ""}" onclick="pick('size','${s}')">${s}</button>`).join("")}</div>

    <h4>Quantity</h4>
    <div class="qty"><button onclick="setQty(-1)">−</button><b>${sel.qty}</b><button onclick="setQty(1)">+</button></div>

    <button class="btn accent" style="margin-top:16px" onclick="addToCart()">Add to Cart</button>
    <button class="btn wa" onclick="buyNow()">Buy Now on WhatsApp</button>`;
}
function pick(type, value) { sel[type] = value; renderModal(); }
function setQty(n) { sel.qty = Math.max(1, sel.qty + n); renderModal(); }

/* ---------- Cart ---------- */
function addToCart() {
  const found = cart.find(i => i.id === cur.id && i.size === sel.size && i.color === sel.color);
  if (found) found.qty += sel.qty;
  else cart.push({ id: cur.id, size: sel.size, color: sel.color, qty: sel.qty });
  closeModal(); updateCart(); toast("Added to cart ✓");
}
function changeQty(i, n) {
  cart[i].qty += n;
  if (cart[i].qty <= 0) cart.splice(i, 1);
  updateCart();
}
function updateCart() {
  cart = cart.filter(i => products.some(p => p.id === i.id));
  let total = 0, count = 0;
  $("items").innerHTML = cart.map((it, i) => {
    const p = products.find(x => x.id === it.id);
    total += p.price * it.qty; count += it.qty;
    return `<div class="row">
      <img src="${p.img}" alt="${p.name}">
      <div class="meta"><b>${p.name}</b><small>${it.color} • ${it.size}</small><span>Rs. ${p.price * it.qty}</span></div>
      <div class="q"><button onclick="changeQty(${i},-1)">−</button><b>${it.qty}</b><button onclick="changeQty(${i},1)">+</button></div>
    </div>`;
  }).join("") || `<p class="empty">Your cart is empty</p>`;
  $("total").textContent = total;
  $("count").textContent = count;
  $("wcount").textContent = wish.size;
  save();
}

function sendWhatsApp(msg) {
  window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg), "_blank");
}
function buyNow() {
  sendWhatsApp(`Hello SHUV! I want to order:\n- ${cur.name} (${sel.color}, ${sel.size}) x ${sel.qty}\nTotal: Rs. ${cur.price * sel.qty}\nPayment: Cash on Delivery`);
}
function checkout() {
  if (!cart.length) return toast("Your cart is empty");
  const name = $("cname").value.trim(), addr = $("caddr").value.trim();
  if (!name || !addr) return toast("Please enter name and address");
  let msg = "Hello SHUV! I want to order:\n";
  cart.forEach(it => {
    const p = products.find(x => x.id === it.id);
    msg += `- ${p.name} (${it.color}, ${it.size}) x ${it.qty}\n`;
  });
  msg += `\nTotal: Rs. ${$("total").textContent}\nName: ${name}\nAddress: ${addr}\nPayment: Cash on Delivery`;
  sendWhatsApp(msg);
}

/* ---------- Events ---------- */
$("search").addEventListener("input", showProducts);
$("search").addEventListener("keydown", e => { if (e.key === "Enter") scrollToShop(); });
$("searchBtn").onclick = () => { showProducts(); scrollToShop(); };
$("sort").addEventListener("change", showProducts);
$("price").addEventListener("change", showProducts);
$("cartBtn").onclick = () => $("cart").classList.add("open");
$("navCart").onclick = () => $("cart").classList.add("open");
$("close").onclick = () => $("cart").classList.remove("open");
$("order").onclick = checkout;
$("modal").onclick = e => { if (e.target.id === "modal") closeModal(); };

function showSaved() {
  category = "Saved"; $("search").value = "";
  showCats(); showProducts(); scrollToShop(); setNav("navSaved");
}
$("heartBtn").onclick = showSaved;
$("navSaved").onclick = showSaved;
$("navHome").onclick = () => {
  $("search").value = ""; category = "All";
  showCats(); showProducts(); setNav("navHome");
  window.scrollTo({ top:0, behavior:"smooth" });
};
$("navCats").onclick = () => { $("cats").scrollIntoView({ behavior:"smooth" }); setNav("navCats"); };
$("navWa").onclick = () => sendWhatsApp("Hello SHUV, I have a question.");
$("waLink").href = "https://wa.me/" + WHATSAPP;

/* ---------- Start ---------- */
load();
showHero();
showChips();
showCats();
showProducts();
updateCart();
setNav("navHome");
