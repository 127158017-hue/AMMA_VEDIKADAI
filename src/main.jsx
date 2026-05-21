import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BadgePercent,
  Image as ImageIcon,
  Lock,
  LogOut,
  Mail,
  Menu,
  PackagePlus,
  Phone,
  Plus,
  ShoppingCart,
  Sparkles,
  Trash2,
  X
} from "lucide-react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  writeBatch
} from "firebase/firestore";
import { db } from "./firebaseClient";
import "./styles.css";

const PRODUCTS_KEY = "vedikadai.products";
const STORE_CONTACT_KEY = "vedikadai.storeContact";

const categories = ["Ground-made", "Sivakasi Fancy"];

const sampleProducts = [
  {
    id: "gm-001",
    title: "Classic Red Bijili",
    category: "Ground-made",
    mrp: 240,
    price: 180,
    imageUrl: ""
  },
  {
    id: "gm-002",
    title: "Flower Pot Gold",
    category: "Ground-made",
    mrp: 420,
    price: 320,
    imageUrl: ""
  },
  {
    id: "gm-003",
    title: "Ground Chakkar Deluxe",
    category: "Ground-made",
    mrp: 300,
    price: 240,
    imageUrl: ""
  },
  {
    id: "sf-001",
    title: "Sivakasi Sky Shot",
    category: "Sivakasi Fancy",
    mrp: 950,
    price: 780,
    imageUrl: ""
  },
  {
    id: "sf-002",
    title: "Fancy Sparkle Fountain",
    category: "Sivakasi Fancy",
    mrp: 700,
    price: 540,
    imageUrl: ""
  }
];

const defaultStoreContact = {
  phone: "+91 98765 43210",
  email: "orders@vedikadai.local"
};

const sampleProductMrps = sampleProducts.reduce((map, product) => {
  map[product.id] = product.mrp;
  return map;
}, {});

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function productFromFirebase(id, data) {
  return {
    id,
    title: data.title,
    category: data.category,
    mrp: Number(data.mrp || 0),
    price: Number(data.price || 0),
    imageUrl: data.imageUrl || ""
  };
}

function productToFirebase(product) {
  return {
    title: product.title,
    category: product.category,
    mrp: Number(product.mrp || product.price || 0),
    price: Number(product.price || 0),
    imageUrl: product.imageUrl || "",
    createdAt: product.createdAt || new Date().toISOString()
  };
}

function orderFromFirebase(id, data) {
  return {
    id,
    createdAt: data.createdAt,
    customer: data.customer,
    items: data.items,
    total: Number(data.total || 0),
    savings: Number(data.savings || 0),
    status: data.status || "Order Pending"
  };
}

function orderToFirebase(order) {
  return {
    createdAt: order.createdAt,
    customer: order.customer,
    items: order.items,
    total: Number(order.total || 0),
    savings: Number(order.savings || 0),
    status: order.status || "Order Pending"
  };
}

function normalizeProducts(products) {
  return products.map((product) => {
    const price = Number(product.price || 0);
    const storedMrp = Number(product.mrp || 0);
    const fallbackMrp = Number(sampleProductMrps[product.id] || estimateMrp(price) || price);
    const mrp = storedMrp > price ? storedMrp : Math.max(fallbackMrp, price);

    return {
      ...product,
      mrp,
      price,
      imageUrl: product.imageUrl || ""
    };
  });
}

function estimateMrp(price) {
  const sellingPrice = Number(price || 0);
  if (!sellingPrice) return 0;
  return Math.ceil((sellingPrice * 1.4) / 10) * 10;
}

function getSavings(item) {
  return Math.max(0, Number(item.mrp || item.price) - Number(item.price || 0));
}

function getDiscountPercent(item) {
  const mrp = Number(item.mrp || 0);
  const savings = getSavings(item);
  return mrp > 0 && savings > 0 ? Math.round((savings / mrp) * 100) : 0;
}

function App() {
  const [view, setView] = useState(() => (window.location.pathname === "/admin" ? "admin" : "store"));
  const [products, setProducts] = useState(() => normalizeProducts(readStorage(PRODUCTS_KEY, sampleProducts)));
  const [orders, setOrders] = useState([]);
  const [storeContact, setStoreContact] = useState(() => readStorage(STORE_CONTACT_KEY, defaultStoreContact));
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);
  const databaseAvailable = useRef(false);

  useEffect(() => {
    if (!localStorage.getItem(PRODUCTS_KEY)) {
      writeStorage(PRODUCTS_KEY, sampleProducts);
    }
  }, []);

  useEffect(() => {
    setProducts((items) => {
      const normalized = normalizeProducts(items);
      const changed = normalized.some(
        (product, index) => product.mrp !== items[index]?.mrp || product.price !== items[index]?.price
      );
      return changed ? normalized : items;
    });
  }, []);

  useEffect(() => writeStorage(PRODUCTS_KEY, products), [products]);
  useEffect(() => writeStorage(STORE_CONTACT_KEY, storeContact), [storeContact]);

  useEffect(() => {
    const loadDatabase = async () => {
      try {
        const [productsSnapshot, ordersSnapshot, contactSnapshot] = await Promise.all([
          getDocs(query(collection(db, "products"), orderBy("createdAt", "asc"))),
          getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"))),
          getDoc(doc(db, "storeContact", "main"))
        ]);

        databaseAvailable.current = true;
        const firebaseProducts = productsSnapshot.docs.map((item) => productFromFirebase(item.id, item.data()));
        if (firebaseProducts.length) {
          setProducts(normalizeProducts(firebaseProducts));
        } else {
          setProducts(sampleProducts);
          await Promise.all(
            sampleProducts.map((product) => setDoc(doc(db, "products", product.id), productToFirebase(product)))
          );
        }
        setOrders(ordersSnapshot.docs.map((item) => orderFromFirebase(item.id, item.data())));
        if (contactSnapshot.exists()) {
          const contact = contactSnapshot.data();
          setStoreContact({ phone: contact.phone || "", email: contact.email || "" });
        }
      } catch (error) {
        console.error("Firebase load failed", error);
        databaseAvailable.current = false;
      }
    };

    loadDatabase();
  }, []);

  useEffect(() => {
    if (view !== "admin" || !isAdminAuthed) return undefined;

    const refreshOrders = async () => {
      try {
        const ordersSnapshot = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
        databaseAvailable.current = true;
        setOrders(ordersSnapshot.docs.map((item) => orderFromFirebase(item.id, item.data())));
      } catch (error) {
        console.error("Firebase order refresh failed", error);
        databaseAvailable.current = false;
      }
    };

    refreshOrders();
    const intervalId = window.setInterval(refreshOrders, 8000);
    return () => window.clearInterval(intervalId);
  }, [view, isAdminAuthed]);

  const saveProducts = (updater) => {
    setProducts((current) => {
      const next = normalizeProducts(typeof updater === "function" ? updater(current) : updater);
      const removedIds = current
        .filter((product) => !next.some((nextProduct) => nextProduct.id === product.id))
        .map((product) => product.id);

      Promise.all([
        ...next.map((product) => setDoc(doc(db, "products", product.id), productToFirebase(product))),
        ...removedIds.map((id) => deleteDoc(doc(db, "products", id)))
      ])
        .then(() => {
          databaseAvailable.current = true;
        })
        .catch((error) => {
          console.error("Firebase product save failed", error);
          databaseAvailable.current = false;
        });

      return next;
    });
  };

  const saveOrders = (updater) => {
    setOrders((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      const batch = writeBatch(db);
      next.forEach((order) => {
        batch.set(doc(db, "orders", order.id), orderToFirebase(order));
      });
      batch
        .commit()
        .then(() => {
          databaseAvailable.current = true;
        })
        .catch((error) => {
          console.error("Firebase order save failed", error);
          databaseAvailable.current = false;
        });

      return next;
    });
  };

  const saveStoreContact = (contact) => {
    setStoreContact(contact);
    setDoc(doc(db, "storeContact", "main"), contact)
      .then(() => {
        databaseAvailable.current = true;
      })
      .catch((error) => {
        console.error("Firebase contact save failed", error);
        databaseAvailable.current = false;
      });
  };

  const addOrder = async (order) => {
    await setDoc(doc(db, "orders", order.id), orderToFirebase(order));
    databaseAvailable.current = true;
    setOrders((current) => [order, ...current.filter((item) => item.id !== order.id)]);
  };

  useEffect(() => {
    const handlePopState = () => {
      setView(window.location.pathname === "/admin" ? "admin" : "store");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (nextView) => {
    const nextPath = nextView === "admin" ? "/admin" : "/";
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setView(nextView);
  };

  const goStore = () => navigate("store");
  const goAdmin = () => navigate("admin");

  return (
    <div className="min-h-screen bg-cream text-stone-900">
      {view === "store" ? (
        <Storefront
          products={products}
          addOrder={addOrder}
          storeContact={storeContact}
          onAdminClick={goAdmin}
        />
      ) : isAdminAuthed ? (
        <AdminDashboard
          products={products}
          setProducts={saveProducts}
          orders={orders}
          setOrders={saveOrders}
          storeContact={storeContact}
          setStoreContact={saveStoreContact}
          onLogout={() => {
            setIsAdminAuthed(false);
            goStore();
          }}
        />
      ) : (
        <AdminGate onSuccess={() => setIsAdminAuthed(true)} onBack={goStore} />
      )}
    </div>
  );
}

function Storefront({ products, addOrder, storeContact, onAdminClick }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [success, setSuccess] = useState("");
  const [orderError, setOrderError] = useState("");
  const [thankYouOpen, setThankYouOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return products;
    return products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartMrpTotal = cart.reduce((sum, item) => sum + Number(item.mrp || item.price) * item.qty, 0);
  const cartSavings = cartMrpTotal - cartTotal;
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const addToCart = (product) => {
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (existing) {
        return items.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...items, { ...product, qty: 1 }];
    });
    setSuccess("");
    setOrderError("");
  };

  const updateQty = (id, direction) => {
    setCart((items) =>
      items
        .map((item) => (item.id === id ? { ...item, qty: item.qty + direction } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const submitOrder = async (customer) => {
    const order = {
      id: `order-${Date.now()}`,
      createdAt: new Date().toISOString(),
      customer,
      items: cart.map(({ id, title, category, mrp, price, qty }) => ({ id, title, category, mrp, price, qty })),
      total: cartTotal,
      savings: cartSavings,
      status: "Order Pending"
    };
    try {
      await addOrder(order);
      setCart([]);
      setCartOpen(false);
      setCheckoutOpen(false);
      setThankYouOpen(true);
      setSuccess("");
      setOrderError("");
    } catch (error) {
      console.error("Firebase order create failed", error);
      setOrderError("Order could not be saved to Firebase. Please try again in a moment.");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-orange-100 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            className="rounded-full border border-orange-100 p-2 text-stone-700 md:hidden"
            onClick={() => setMobileFiltersOpen(true)}
            aria-label="Open category filters"
          >
            <Menu size={20} />
          </button>
          <button className="flex items-center gap-3 text-left" onClick={() => setSelectedCategory("All")}>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-flame text-white shadow-soft">
              <Sparkles size={22} />
            </span>
            <span>
              <span className="block text-xl font-black tracking-wide text-flame">Vedikadai</span>
              <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                Firecracker Store
              </span>
            </span>
          </button>
          <button
            onClick={() => setCartOpen(true)}
            className="relative grid h-12 w-12 place-items-center rounded-full bg-stone-950 text-white shadow-soft"
            aria-label="Open shopping cart"
          >
            <ShoppingCart size={21} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-ember px-1 text-xs font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <CategorySidebar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          className="hidden lg:block"
        />
        <section>
          <div className="mb-5 overflow-hidden rounded-lg border border-orange-100 bg-paper shadow-soft">
            <div className="grid gap-5 p-5 md:grid-cols-[1fr_280px] md:p-6">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-flame">
                  <Sparkles size={14} />
                  Festival ready
                </div>
                <h1 className="text-3xl font-black text-stone-950 sm:text-4xl">Choose your crackers</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                  Shop ground-made favorites and Sivakasi fancy specials. Orders are confirmed by phone by the
                  Vedikadai admin team.
                </p>
              </div>
              <div className="rounded-lg bg-stone-950 p-4 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-200">Cart value</p>
                <p className="mt-2 text-3xl font-black">{formatPrice(cartTotal)}</p>
                <p className="mt-1 text-sm font-semibold text-stone-300">{cartCount} items selected</p>
                {cartSavings > 0 && (
                  <p className="mt-3 rounded-md bg-green-500/15 px-3 py-2 text-sm font-black text-green-200">
                    You save {formatPrice(cartSavings)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-stone-950">Catalog</h2>
              <p className="mt-1 text-sm font-semibold text-stone-500">Fresh prices and automatic discount tags.</p>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-bold text-flame shadow-sm ring-1 ring-orange-100">
              {filteredProducts.length} products
            </div>
          </div>

          {success && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
              {success}
            </div>
          )}
          {orderError && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
              {orderError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={() => addToCart(product)} />
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 pt-2 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-orange-100 bg-paper p-5 text-sm shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black text-stone-950">Vedikadai local order desk</p>
              <div className="mt-2 flex flex-col gap-2 text-stone-600 sm:flex-row sm:gap-5">
                <span className="inline-flex items-center gap-2">
                  <Phone size={16} className="text-flame" />
                  {storeContact.phone || "Phone number pending"}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Mail size={16} className="text-flame" />
                  {storeContact.email || "Email pending"}
                </span>
              </div>
            </div>
            <button onClick={onAdminClick} className="self-start rounded px-2 py-1 text-xs font-semibold text-stone-500 hover:text-flame sm:self-auto">
              admin
            </button>
          </div>
        </div>
      </footer>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-40 bg-stone-950/40 p-4 lg:hidden" onClick={() => setMobileFiltersOpen(false)}>
          <div className="max-w-xs" onClick={(event) => event.stopPropagation()}>
            <CategorySidebar
              selectedCategory={selectedCategory}
              setSelectedCategory={(category) => {
                setSelectedCategory(category);
                setMobileFiltersOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {cartOpen && (
        <CartDrawer
          cart={cart}
          total={cartTotal}
          mrpTotal={cartMrpTotal}
          savings={cartSavings}
          onClose={() => setCartOpen(false)}
          onQty={updateQty}
          onCheckout={() => setCheckoutOpen(true)}
        />
      )}

      {checkoutOpen && (
        <CheckoutModal
          total={cartTotal}
          onClose={() => setCheckoutOpen(false)}
          onSubmit={submitOrder}
        />
      )}

      {thankYouOpen && <ThankYouModal onClose={() => setThankYouOpen(false)} />}
    </>
  );
}

function CategorySidebar({ selectedCategory, setSelectedCategory, className = "" }) {
  return (
    <aside className={`rounded-lg border border-orange-100 bg-paper p-4 shadow-sm ${className}`}>
      <h2 className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-stone-500">Categories</h2>
      {["All", ...categories].map((category) => (
        <button
          key={category}
          onClick={() => setSelectedCategory(category)}
          className={`mb-2 flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-sm font-bold transition ${
            selectedCategory === category
              ? "bg-flame text-white shadow-sm"
              : "bg-white text-stone-700 ring-1 ring-orange-100 hover:bg-orange-50"
          }`}
        >
          <span>{category}</span>
          <span className={selectedCategory === category ? "text-white" : "text-gold"}>*</span>
        </button>
      ))}
    </aside>
  );
}

function ProductCard({ product, onAdd }) {
  const savings = getSavings(product);
  const discountPercent = getDiscountPercent(product);

  return (
    <article className="overflow-hidden rounded-lg border border-orange-100 bg-paper shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="relative h-44 bg-gradient-to-br from-orange-50 via-white to-red-50 sm:h-48">
        {discountPercent > 0 && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-flame px-3 py-1 text-xs font-black text-white shadow-sm">
            <BadgePercent size={14} />
            {discountPercent}% OFF
          </span>
        )}
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-ember shadow-sm ring-1 ring-orange-100">
              <Sparkles size={40} />
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-2 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-flame">
          {product.category}
        </div>
        <h3 className="min-h-12 text-lg font-black leading-6 text-stone-950">{product.title}</h3>
        <div className="mt-3 rounded-lg bg-orange-50/70 p-3">
          <div className="flex flex-wrap items-center gap-2">
            {savings > 0 && (
              <span className="text-sm font-black text-stone-400 line-through">
                {formatPrice(Number(product.mrp))}
              </span>
            )}
            <span className="text-2xl font-black text-stone-950">{formatPrice(Number(product.price))}</span>
          </div>
          {savings > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-black text-green-800">
                Save {formatPrice(savings)}
              </span>
              <span className="text-xs font-black text-green-700">
                Discounted from {formatPrice(Number(product.mrp))} to {formatPrice(Number(product.price))}
              </span>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-stone-400">Cash on confirm</span>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-md bg-flame px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
          >
            <Plus size={17} />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

function CartDrawer({ cart, total, mrpTotal, savings, onClose, onQty, onCheckout }) {
  return (
    <div className="fixed inset-0 z-50 bg-stone-950/45" onClick={onClose}>
      <aside
        className="ml-auto flex h-full w-full max-w-md flex-col bg-paper shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-orange-100 p-5">
          <h2 className="text-xl font-black">Your cart</h2>
          <button className="rounded-full p-2 hover:bg-orange-50" onClick={onClose} aria-label="Close cart">
            <X size={21} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <p className="rounded-lg bg-orange-50 p-4 text-sm font-semibold text-stone-600">Your cart is empty.</p>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="rounded-lg border border-orange-100 bg-white p-4">
                  <div className="flex justify-between gap-4">
                    <div>
                      <h3 className="font-black">{item.title}</h3>
                      <p className="text-sm text-stone-500">
                        {getSavings(item) > 0 && (
                          <span className="mr-2 line-through">{formatPrice(item.mrp)}</span>
                        )}
                        {formatPrice(item.price)} each
                      </p>
                    </div>
                    <p className="font-black">{formatPrice(item.price * item.qty)}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="qty-button" onClick={() => onQty(item.id, -1)} aria-label={`Decrease ${item.title}`}>
                      -
                    </button>
                    <span className="grid h-9 min-w-10 place-items-center rounded-md bg-orange-50 px-3 font-bold">
                      {item.qty}
                    </span>
                    <button className="qty-button" onClick={() => onQty(item.id, 1)} aria-label={`Increase ${item.title}`}>
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-orange-100 p-5">
          <div className="mb-4 rounded-lg bg-orange-50 p-4">
            <div className="flex items-center justify-between text-sm font-bold text-stone-500">
              <span>Catalog amount</span>
              <span className={savings > 0 ? "line-through" : ""}>{formatPrice(mrpTotal)}</span>
            </div>
            {savings > 0 && (
              <div className="mt-2 flex items-center justify-between text-sm font-black text-green-700">
                <span>Automatic discount</span>
                <span>- {formatPrice(savings)}</span>
              </div>
            )}
            <div className="mt-3 flex items-center justify-between border-t border-orange-200 pt-3 text-lg font-black">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={onCheckout}
            className="w-full rounded-md bg-stone-950 px-5 py-3 font-black text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            Checkout
          </button>
        </div>
      </aside>
    </div>
  );
}

function CheckoutModal({ total, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  const submit = (event) => {
    event.preventDefault();
    onSubmit({
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-stone-950/50 p-4">
      <form onSubmit={submit} className="w-full max-w-lg rounded-lg bg-paper p-5 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Checkout</h2>
            <p className="text-sm font-semibold text-stone-500">No online payment. Admin confirmation by phone.</p>
          </div>
          <button type="button" className="rounded-full p-2 hover:bg-orange-50" onClick={onClose} aria-label="Close checkout">
            <X size={21} />
          </button>
        </div>
        <label className="form-label">
          Name
          <input
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="form-input"
            placeholder="Customer name"
          />
        </label>
        <label className="form-label">
          Phone Number
          <input
            required
            pattern="[0-9+\-\s]{8,15}"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            className="form-input"
            placeholder="Phone number"
          />
        </label>
        <label className="form-label">
          Delivery Address
          <textarea
            required
            value={form.address}
            onChange={(event) => setForm({ ...form, address: event.target.value })}
            className="form-input min-h-28 resize-y"
            placeholder="Door no, street, area, city"
          />
        </label>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-black">Total: {formatPrice(total)}</span>
          <button className="rounded-md bg-flame px-5 py-3 font-black text-white hover:bg-red-700">
            Place Order
          </button>
        </div>
      </form>
    </div>
  );
}

function ThankYouModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-stone-950/55 p-4">
      <section className="w-full max-w-md rounded-lg border border-orange-100 bg-paper p-6 text-center shadow-2xl">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100 text-green-700">
          <Sparkles size={30} />
        </div>
        <h2 className="mt-5 text-2xl font-black text-stone-950">Thank you for purchasing!</h2>
        <p className="mt-3 text-sm font-semibold leading-6 text-stone-600">
          Your order has been received. Please wait 24-48 hours for our admin to contact you and confirm the order.
        </p>
        <p className="mt-4 rounded-lg bg-orange-50 px-4 py-3 text-sm font-black text-flame">
          No payment was collected online.
        </p>
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-md bg-flame px-5 py-3 font-black text-white hover:bg-red-700"
        >
          Continue Shopping
        </button>
      </section>
    </div>
  );
}

function AdminGate({ onSuccess, onBack }) {
  const [layer, setLayer] = useState(1);
  const [value, setValue] = useState("");
  const [colorProgress, setColorProgress] = useState([]);
  const [error, setError] = useState("");

  const reset = () => {
    setLayer(1);
    setValue("");
    setColorProgress([]);
    setError("Security check failed. Restarted at Layer 1.");
  };

  const pass = () => {
    setValue("");
    setError("");
    setLayer((current) => current + 1);
  };

  const checkInput = (expected, normalizer = (text) => text) => {
    if (normalizer(value) === normalizer(expected)) pass();
    else reset();
  };

  const checkColor = (color) => {
    const expected = ["Red", "Gold", "Green"];
    const next = [...colorProgress, color];
    if (expected[colorProgress.length] !== color) {
      reset();
      return;
    }
    if (next.length === expected.length) {
      setLayer(5);
      setColorProgress([]);
      setError("");
    } else {
      setColorProgress(next);
      setError("");
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-xl rounded-lg border border-orange-100 bg-paper p-6 shadow-soft">
        <button onClick={onBack} className="mb-6 text-sm font-bold text-stone-500 hover:text-flame">
          Back to store
        </button>
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-stone-950 text-white">
            <Lock size={22} />
          </span>
          <div>
            <h1 className="text-2xl font-black">Admin Security</h1>
            <p className="text-sm font-semibold text-stone-500">Layer {layer} of 5</p>
          </div>
        </div>
        <div className="mb-5 h-2 overflow-hidden rounded-full bg-orange-100">
          <div className="h-full bg-flame transition-all" style={{ width: `${(layer / 5) * 100}%` }} />
        </div>
        {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</div>}

        {layer === 1 && (
          <SecurityInput
            label="Master Password"
            type="password"
            value={value}
            setValue={setValue}
            onSubmit={() => checkInput("Vedikadai@2024")}
          />
        )}
        {layer === 2 && (
          <PinLayer value={value} setValue={setValue} onSubmit={() => checkInput("1998")} />
        )}
        {layer === 3 && (
          <SecurityInput
            label="Where do our fancy crackers come from?"
            value={value}
            setValue={setValue}
            onSubmit={() => checkInput("Sivakasi", (text) => text.trim().toLowerCase())}
          />
        )}
        {layer === 4 && (
          <div>
            <p className="mb-4 text-sm font-bold text-stone-600">Click the sequence: Red, Gold, then Green.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Red", "bg-flame"],
                ["Blue", "bg-blue-600"],
                ["Gold", "bg-gold"],
                ["Green", "bg-leaf"]
              ].map(([color, className]) => (
                <button
                  key={color}
                  onClick={() => checkColor(color)}
                  className={`${className} h-16 rounded-md font-black text-white shadow-sm`}
                >
                  {color}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm font-semibold text-stone-500">Progress: {colorProgress.join(" > ") || "none"}</p>
          </div>
        )}
        {layer === 5 && (
          <SecurityInput
            label="Final Passphrase"
            value={value}
            setValue={setValue}
            onSubmit={() => {
              if (value.trim() === "Ground Made Mass") onSuccess();
              else reset();
            }}
          />
        )}
      </section>
    </main>
  );
}

function SecurityInput({ label, value, setValue, onSubmit, type = "text" }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="form-label">
        {label}
        <input
          autoFocus
          required
          type={type}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="form-input"
        />
      </label>
      <button className="mt-4 rounded-md bg-flame px-5 py-3 font-black text-white hover:bg-red-700">
        Continue
      </button>
    </form>
  );
}

function PinLayer({ value, setValue, onSubmit }) {
  return (
    <div>
      <div className="mb-4 grid h-12 place-items-center rounded-md bg-orange-50 text-xl font-black tracking-[0.4em]">
        {value.padEnd(4, "*")}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "Clear", "0", "Enter"].map((key) => (
          <button
            key={key}
            onClick={() => {
              if (key === "Clear") setValue("");
              else if (key === "Enter") onSubmit();
              else setValue((pin) => (pin.length < 4 ? `${pin}${key}` : pin));
            }}
            className="h-12 rounded-md bg-white font-black text-stone-800 ring-1 ring-orange-100 hover:bg-orange-50"
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}

function AdminDashboard({ products, setProducts, orders, setOrders, storeContact, setStoreContact, onLogout }) {
  const [tab, setTab] = useState("products");

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-4 rounded-lg border border-orange-100 bg-paper p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-stone-950">Vedikadai Admin</h1>
          <p className="text-sm font-semibold text-stone-500">Manage fixed catalog items and callback orders.</p>
        </div>
        <button
          onClick={onLogout}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-stone-950 px-4 py-3 font-black text-white hover:bg-stone-800"
        >
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <div className="mb-5 flex gap-2 rounded-lg bg-white p-2 shadow-sm ring-1 ring-orange-100">
        <button className={`admin-tab ${tab === "products" ? "admin-tab-active" : ""}`} onClick={() => setTab("products")}>
          Manage Products
        </button>
        <button className={`admin-tab ${tab === "orders" ? "admin-tab-active" : ""}`} onClick={() => setTab("orders")}>
          View Orders
        </button>
        <button className={`admin-tab ${tab === "contact" ? "admin-tab-active" : ""}`} onClick={() => setTab("contact")}>
          Store Contact
        </button>
      </div>

      {tab === "products" ? (
        <ManageProducts products={products} setProducts={setProducts} />
      ) : tab === "orders" ? (
        <OrdersTable orders={orders} setOrders={setOrders} />
      ) : (
        <StoreContactPanel storeContact={storeContact} setStoreContact={setStoreContact} />
      )}
    </main>
  );
}

function ManageProducts({ products, setProducts }) {
  const [form, setForm] = useState({ title: "", category: "Ground-made", mrp: "", price: "", imageUrl: "" });
  const [imageName, setImageName] = useState("");

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, imageUrl: String(reader.result || "") }));
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const addProduct = (event) => {
    event.preventDefault();
    const sellingPrice = Number(form.price);
    const mrp = Number(form.mrp || estimateMrp(sellingPrice));
    setProducts((items) => [
      {
        id: `product-${Date.now()}`,
        title: form.title.trim(),
        category: form.category,
        mrp: Math.max(mrp, sellingPrice),
        price: sellingPrice,
        imageUrl: form.imageUrl.trim()
      },
      ...items
    ]);
    setForm({ title: "", category: "Ground-made", mrp: "", price: "", imageUrl: "" });
    setImageName("");
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <form onSubmit={addProduct} className="rounded-lg border border-orange-100 bg-paper p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <PackagePlus className="text-flame" size={22} />
          <h2 className="text-xl font-black">Add Product</h2>
        </div>
        <label className="form-label">
          Title
          <input
            required
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            className="form-input"
          />
        </label>
        <label className="form-label">
          Category
          <select
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
            className="form-input"
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label className="form-label">
          MRP / Before Discount
          <input
            min="1"
            type="number"
            value={form.mrp}
            onChange={(event) => setForm({ ...form, mrp: event.target.value })}
            className="form-input"
            placeholder="Optional. Auto: 500 becomes 700"
          />
        </label>
        <label className="form-label">
          Selling Price
          <input
            required
            min="1"
            type="number"
            value={form.price}
            onChange={(event) => setForm({ ...form, price: event.target.value })}
            className="form-input"
            placeholder="Example: 500"
          />
        </label>
        {form.price && (
          <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-black text-green-800">
            Website display: {formatPrice(Number(form.mrp || estimateMrp(form.price)))} discounted to{" "}
            {formatPrice(Number(form.price))}
          </div>
        )}
        <label className="form-label">
          Image URL
          <input
            value={form.imageUrl}
            onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
            className="form-input"
            placeholder="Optional"
          />
        </label>
        <label className="form-label">
          Upload Product Image
          <input
            accept="image/*"
            type="file"
            onChange={handleImageUpload}
            className="form-input file:mr-3 file:rounded-md file:border-0 file:bg-orange-100 file:px-3 file:py-2 file:font-bold file:text-flame"
          />
        </label>
        {form.imageUrl && (
          <div className="mt-4 overflow-hidden rounded-lg border border-orange-100 bg-orange-50">
            <img src={form.imageUrl} alt="Product preview" className="h-36 w-full object-cover" />
            <p className="px-3 py-2 text-xs font-bold text-stone-500">
              {imageName || "Image preview"}
            </p>
          </div>
        )}
        <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-flame px-5 py-3 font-black text-white hover:bg-red-700">
          <Plus size={18} />
          Add Product
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-orange-100 bg-paper shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-orange-50 text-xs uppercase tracking-[0.12em] text-stone-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Pricing</th>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 font-bold">{product.title}</td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-baseline gap-2">
                      {getSavings(product) > 0 && (
                        <span className="text-xs font-bold text-stone-400 line-through">
                          {formatPrice(Number(product.mrp))}
                        </span>
                      )}
                      <span className="font-black">{formatPrice(Number(product.price))}</span>
                    </div>
                    {getSavings(product) > 0 && (
                      <div className="text-xs font-bold text-green-700">
                        {formatPrice(Number(product.mrp))} discounted to {formatPrice(Number(product.price))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-500">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.title} className="h-12 w-16 rounded-md object-cover" />
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <ImageIcon size={16} />
                        Placeholder
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setProducts((items) => items.filter((item) => item.id !== product.id))}
                      className="inline-flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 font-bold text-red-700 hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function StoreContactPanel({ storeContact, setStoreContact }) {
  const [form, setForm] = useState(storeContact);
  const [saved, setSaved] = useState(false);

  const saveContact = (event) => {
    event.preventDefault();
    setStoreContact({
      phone: form.phone.trim(),
      email: form.email.trim()
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <form onSubmit={saveContact} className="rounded-lg border border-orange-100 bg-paper p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Phone className="text-flame" size={22} />
          <h2 className="text-xl font-black">Store Contact</h2>
        </div>
        <label className="form-label">
          Contact Number
          <input
            required
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            className="form-input"
            placeholder="+91 98765 43210"
          />
        </label>
        <label className="form-label">
          Email Address
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="form-input"
            placeholder="orders@vedikadai.com"
          />
        </label>
        <button className="mt-4 w-full rounded-md bg-flame px-5 py-3 font-black text-white hover:bg-red-700">
          Save Contact Details
        </button>
        {saved && <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm font-black text-green-700">Saved.</p>}
      </form>

      <div className="rounded-lg border border-orange-100 bg-paper p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-gold">Storefront footer preview</p>
        <h3 className="mt-3 text-2xl font-black text-stone-950">Vedikadai local order desk</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-orange-50 p-4">
            <Phone className="mb-3 text-flame" size={22} />
            <p className="text-sm font-bold text-stone-500">Phone</p>
            <p className="mt-1 font-black text-stone-950">{form.phone || "Not set"}</p>
          </div>
          <div className="rounded-lg bg-orange-50 p-4">
            <Mail className="mb-3 text-flame" size={22} />
            <p className="text-sm font-bold text-stone-500">Email</p>
            <p className="mt-1 break-all font-black text-stone-950">{form.email || "Not set"}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function OrdersTable({ orders, setOrders }) {
  const updateOrderStatus = (orderId, status) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
  };

  return (
    <section className="overflow-hidden rounded-lg border border-orange-100 bg-paper shadow-sm">
      <div className="flex flex-col gap-2 border-b border-orange-100 bg-orange-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-black text-stone-950">Firebase Orders</h2>
          <p className="text-xs font-semibold text-stone-500">
            Orders shown here are loaded from Firebase Firestore, not this browser.
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-flame ring-1 ring-orange-100">
          {orders.length} orders
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-orange-50 text-xs uppercase tracking-[0.12em] text-stone-500">
            <tr>
              <th className="px-4 py-3">Customer Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Cart Items</th>
              <th className="px-4 py-3">Total Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Admin Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center font-semibold text-stone-500">
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="align-top">
                  <td className="px-4 py-3 font-bold">{order.customer.name}</td>
                  <td className="px-4 py-3">{order.customer.phone}</td>
                  <td className="max-w-64 px-4 py-3">{order.customer.address}</td>
                  <td className="px-4 py-3">
                    {order.items.map((item) => (
                      <div key={`${order.id}-${item.id}`} className="mb-1">
                        {item.title} x {item.qty} ({formatPrice(item.price)})
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3 font-black">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                        order.status === "Money Received"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {order.status || "Order Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <button
                        onClick={() => updateOrderStatus(order.id, "Order Pending")}
                        className="rounded-md bg-amber-50 px-3 py-2 text-xs font-black text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100"
                      >
                        Order Pending
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "Money Received")}
                        className="rounded-md bg-green-600 px-3 py-2 text-xs font-black text-white hover:bg-green-700"
                      >
                        Money Received
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const rootElement = document.getElementById("root");
const root = window.__vedikadaiRoot || createRoot(rootElement);
window.__vedikadaiRoot = root;
root.render(<App />);
