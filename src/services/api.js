const BASE_URL = 'https://dummyjson.com';

export const loginUser = async (username, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, expiresInMins: 30 }),
  });
  if (!res.ok) throw new Error('Usuario o contraseña incorrectos');
  return res.json();
};

export const fetchProducts = async ({ limit = 10, skip = 0, search = '', category = '' }) => {
  let url = `${BASE_URL}/products?limit=${limit}&skip=${skip}`;
  if (search) url = `${BASE_URL}/products/search?q=${search}&limit=${limit}&skip=${skip}`;
  if (category && category !== 'all') url = `${BASE_URL}/products/category/${category}?limit=${limit}&skip=${skip}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al cargar el catálogo');
  return res.json();
};

export const fetchCategories = async () => {
  const res = await fetch(`${BASE_URL}/products/categories`);
  return res.json();
};

export const addProduct = async (product) => {
  const res = await fetch(`${BASE_URL}/products/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  return res.json();
};

export const updateProduct = async (id, product) => {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  return res.json();
};

export const deleteProduct = async (id) => {
  const res = await fetch(`${BASE_URL}/products/${id}`, { method: 'DELETE' });
  return res.json();
};