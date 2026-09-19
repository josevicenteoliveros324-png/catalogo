const starterProducts = [
  { id: 1, name: 'Caja de buenos deseos', category: 'Regalos', price: 68000, stock: 4, color: '#d7a18c', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=85' },
  { id: 2, name: 'Vela calma de vainilla', category: 'Hogar', price: 42000, stock: 8, color: '#d9c2a6', image: 'https://images.unsplash.com/photo-1602874801006-e26f0c2f5b2?auto=format&fit=crop&w=900&q=85' },
  { id: 3, name: 'Agenda para tus ideas', category: 'Papeleria', price: 35000, stock: 0, color: '#b9c7bc', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=85' },
  { id: 4, name: 'Aretes luz dorada', category: 'Accesorios', price: 55000, stock: 3, color: '#d7b86e', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85' },
  { id: 5, name: 'Kit para celebrar', category: 'Regalos', price: 89000, stock: 2, color: '#c88772', image: 'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&w=900&q=85' },
  { id: 6, name: 'Taza de buenos dias', category: 'Hogar', price: 39000, stock: 5, color: '#aebfb4', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=85' }
];
const categories = ['Todos', 'Regalos', 'Hogar', 'Papeleria', 'Accesorios'];
let products = [];
let favorites = JSON.parse(localStorage.getItem('detalles-johana-favorites') || '[]');
let activeCategory = 'Todos';
let showingFavorites = false;
const $ = (selector) => document.querySelector(selector);
const money = (value) => `$${Number(value || 0).toLocaleString('es-CO')}`;
const persist = () => { localStorage.setItem('detalles-johana-favorites', JSON.stringify(favorites)); };
async function loadProducts() {
  try {
    const response = await fetch('content/products.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('No se pudo cargar el catalogo');
    const catalog = await response.json();
    products = catalog.products || starterProducts;
  } catch (error) {
    products = starterProducts;
  }
  renderAll();
}
function productVisual(product) { return product.image ? `<img src="${product.image}" alt="${product.name}" loading="lazy">` : '<span class="fallback-mark">DJ</span>'; }
function productCard(product) {
  const isFavorite = favorites.includes(product.id);
  const availability = Number(product.stock) > 0 ? `${product.stock} disponible${Number(product.stock) === 1 ? '' : 's'}` : 'Agotado';
  return `<article class="product-card"><div class="product-image" data-image-id="${product.id}" role="button" tabindex="0" aria-label="Ampliar foto de ${product.name}" style="background:${product.color}">${productVisual(product)}<button class="favorite-button ${isFavorite ? 'is-favorite' : ''}" data-favorite="${product.id}" type="button" aria-label="${isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}">${isFavorite ? '♥' : '♡'}</button><span class="category-tag">${product.category}</span></div><div class="product-info"><div><p class="product-category">${product.category}</p><h3>${product.name}</h3></div><strong class="product-price">${money(product.price)}</strong></div><div class="product-footer"><span class="availability ${product.stock > 0 ? 'is-available' : 'is-sold-out'}"><span></span>${availability}</span></div></article>`;
}
function renderFilters() { $('#filterRow').innerHTML = categories.map((category) => `<button class="filter-button ${activeCategory === category && !showingFavorites ? 'is-active' : ''}" data-filter="${category}" type="button">${category}</button>`).join(''); }
function renderProducts() {
  const search = $('#searchInput').value.trim().toLowerCase();
  const visible = products.filter((product) => (activeCategory === 'Todos' || product.category === activeCategory) && (!showingFavorites || favorites.includes(product.id)) && product.name.toLowerCase().includes(search));
  $('#productGrid').innerHTML = visible.length ? visible.map(productCard).join('') : '<div class="empty-state"><span>✦</span><h3>No encontramos articulos</h3><p>Prueba con otra busqueda o agrega un nuevo detalle.</p></div>';
}
function renderStats() { $('#productCount').textContent = products.length; $('#availableCount').textContent = products.filter((product) => Number(product.stock) > 0).length; $('#favoriteCount').textContent = favorites.length; }
function renderAll() { renderFilters(); renderProducts(); renderStats(); }
function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('is-visible'); setTimeout(() => toast.classList.remove('is-visible'), 2400); }
document.addEventListener('click', (event) => {
  const filter = event.target.closest('[data-filter]');
  if (filter) { activeCategory = filter.dataset.filter; showingFavorites = false; renderAll(); return; }
  const favorite = event.target.closest('[data-favorite]');
  if (favorite) { const id = Number(favorite.dataset.favorite); favorites = favorites.includes(id) ? favorites.filter((favoriteId) => favoriteId !== id) : [...favorites, id]; persist(); renderAll(); return; }
  const image = event.target.closest('[data-image-id]');
  if (image) { const product = products.find((entry) => entry.id === Number(image.dataset.imageId)); if (product && product.image) openImage(product); return; }
});
$('#searchInput').addEventListener('input', renderProducts);
$('#favoritesButton').addEventListener('click', () => { showingFavorites = !showingFavorites; $('#favoritesButton').classList.toggle('is-active', showingFavorites); renderFilters(); renderProducts(); });
const imageDialog = $('#imageDialog');
function openImage(product) { $('#expandedImage').src = product.image; $('#expandedImage').alt = product.name; $('#expandedImageTitle').textContent = product.name; imageDialog.showModal(); }
$('#closeImageButton').addEventListener('click', () => imageDialog.close());
imageDialog.addEventListener('click', (event) => { if (event.target === imageDialog) imageDialog.close(); });
loadProducts();