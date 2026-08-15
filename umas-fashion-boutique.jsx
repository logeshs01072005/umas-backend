import { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag, Search, User, X, Plus, Minus, Trash2, ChevronRight,
  LogOut, LayoutDashboard, Package, BarChart3, Menu, Check,
  ArrowRight, Mail, Lock, Edit2,
  Sparkles, Crown, Shirt, Gem, Footprints, AlertCircle
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

/* ---------------------------- Static catalog data ---------------------------- */

const CATEGORIES = ["Sarees", "Lehengas", "Kurtis", "Western Wear", "Accessories", "Footwear"];

const CATEGORY_META = {
  Sarees: { icon: Sparkles, from: "from-rose-100", to: "to-orange-100" },
  Lehengas: { icon: Crown, from: "from-red-100", to: "to-rose-200" },
  Kurtis: { icon: Shirt, from: "from-amber-100", to: "to-yellow-100" },
  "Western Wear": { icon: ShoppingBag, from: "from-stone-100", to: "to-neutral-200" },
  Accessories: { icon: Gem, from: "from-yellow-100", to: "to-amber-200" },
  Footwear: { icon: Footprints, from: "from-orange-100", to: "to-amber-100" },
};

const SEASONAL_THEMES = {
  regular: {
    id: "regular",
    name: "Regular / Classic",
    badge: "Classic Elegance",
    heroBg: "bg-stone-950",
    heroText: "text-amber-400",
    buttonBg: "bg-amber-500 hover:bg-amber-400 text-stone-950",
    border: "border-amber-500/20",
    tagline: "Woven traditions, finished for the modern wardrobe."
  },
  summer: {
    id: "summer",
    name: "Summer Collection",
    badge: "☀️ Summer Solstice Special",
    heroBg: "bg-gradient-to-br from-amber-950 via-amber-900 to-yellow-950",
    heroText: "text-amber-300",
    buttonBg: "bg-amber-400 hover:bg-amber-300 text-stone-950",
    border: "border-amber-400/30",
    tagline: "Lightweight organza, breathable cotton & breezy summer couture."
  },
  winter: {
    id: "winter",
    name: "Winter Festive",
    badge: "❄️ Royal Winter Velvet & Silk",
    heroBg: "bg-gradient-to-br from-slate-950 via-sky-950 to-indigo-950",
    heroText: "text-cyan-300",
    buttonBg: "bg-cyan-400 hover:bg-cyan-300 text-stone-950",
    border: "border-cyan-400/30",
    tagline: "Rich Banarasi weaves, heavy zardozi & luxurious winter bridal wear."
  },
  rain: {
    id: "rain",
    name: "Monsoon Rain",
    badge: "🌧️ Monsoon Blossom Edition",
    heroBg: "bg-gradient-to-br from-teal-950 via-emerald-950 to-slate-950",
    heroText: "text-emerald-300",
    buttonBg: "bg-emerald-400 hover:bg-emerald-300 text-stone-950",
    border: "border-emerald-400/30",
    tagline: "Color-fast georgette, chiffon & vibrant rainy season staples."
  },
  spring: {
    id: "spring",
    name: "Spring Bloom",
    badge: "🌸 Spring Floral Bloom",
    heroBg: "bg-gradient-to-br from-rose-950 via-pink-950 to-stone-950",
    heroText: "text-rose-300",
    buttonBg: "bg-rose-400 hover:bg-rose-300 text-stone-950",
    border: "border-rose-400/30",
    tagline: "Hand-painted floral motifs, pastel tones & spring celebration wear."
  }
};

const SEED_PRODUCTS = [
  { id: "p1", name: "Banarasi Silk Saree", category: "Sarees", price: 8999, mrp: 12999, sizes: ["Free Size"], tag: "Bestseller", desc: "Handwoven Banarasi silk with intricate zari border, finished with a matching unstitched blouse piece." },
  { id: "p2", name: "Kanjivaram Silk Saree", category: "Sarees", price: 10999, mrp: 15999, sizes: ["Free Size"], tag: "New", desc: "Traditional South Indian Kanjivaram weave in a rich temple border pattern." },
  { id: "p3", name: "Chiffon Party Saree", category: "Sarees", price: 3499, mrp: 4999, sizes: ["Free Size"], tag: "", desc: "Lightweight chiffon saree with sequin scatter work, perfect for evening events." },
  { id: "p4", name: "Organza Floral Saree", category: "Sarees", price: 4999, mrp: 6999, sizes: ["Free Size"], tag: "Sale", desc: "Hand-painted floral organza saree with a delicate scalloped edge." },
  { id: "p5", name: "Bridal Red Lehenga", category: "Lehengas", price: 24999, mrp: 34999, sizes: ["S", "M", "L", "XL"], tag: "Bestseller", desc: "Heavy zardozi bridal lehenga in classic red with a matching dupatta and choli." },
  { id: "p6", name: "Pastel Georgette Lehenga", category: "Lehengas", price: 15999, mrp: 21999, sizes: ["S", "M", "L"], tag: "", desc: "Flowy georgette lehenga in a soft pastel palette with thread embroidery." },
  { id: "p7", name: "Embroidered Net Lehenga", category: "Lehengas", price: 18999, mrp: 25999, sizes: ["M", "L", "XL"], tag: "New", desc: "Net lehenga with all-over sequin and thread embroidery, ideal for receptions." },
  { id: "p8", name: "Anarkali Kurti Set", category: "Kurtis", price: 2799, mrp: 3999, sizes: ["S", "M", "L", "XL"], tag: "", desc: "Floor-length anarkali kurti with matching palazzo and dupatta." },
  { id: "p9", name: "Chikankari Kurti", category: "Kurtis", price: 1899, mrp: 2599, sizes: ["S", "M", "L", "XL", "XXL"], tag: "Bestseller", desc: "Hand-embroidered Lucknowi chikankari kurti in breathable cotton." },
  { id: "p10", name: "Straight Cotton Kurti", category: "Kurtis", price: 1299, mrp: 1799, sizes: ["S", "M", "L", "XL"], tag: "", desc: "Everyday straight-cut cotton kurti with block-print detailing." },
  { id: "p11", name: "Floral Wrap Dress", category: "Western Wear", price: 2499, mrp: 3499, sizes: ["XS", "S", "M", "L"], tag: "", desc: "Wrap-style midi dress in a botanical print, cinched with a self-tie belt." },
  { id: "p12", name: "Tailored Blazer Dress", category: "Western Wear", price: 3999, mrp: 5499, sizes: ["S", "M", "L"], tag: "", desc: "Structured blazer dress with a nipped waist, perfect for evening occasions." },
  { id: "p13", name: "Denim Co-ord Set", category: "Western Wear", price: 2999, mrp: 3999, sizes: ["S", "M", "L", "XL"], tag: "New", desc: "Two-piece denim shirt and skirt co-ord set with contrast stitching." },
  { id: "p14", name: "Kundan Choker Set", category: "Accessories", price: 1999, mrp: 2999, sizes: ["Free Size"], tag: "Bestseller", desc: "Kundan and pearl choker necklace with matching earrings." },
  { id: "p15", name: "Gold Plated Jhumkas", category: "Accessories", price: 899, mrp: 1299, sizes: ["Free Size"], tag: "", desc: "Antique gold-plated jhumka earrings with a pearl drop." },
  { id: "p16", name: "Embellished Clutch", category: "Accessories", price: 1499, mrp: 1999, sizes: ["Free Size"], tag: "", desc: "Hand-embellished box clutch with a detachable chain strap." },
  { id: "p17", name: "Embroidered Juttis", category: "Footwear", price: 1299, mrp: 1799, sizes: ["5", "6", "7", "8", "9"], tag: "", desc: "Traditional embroidered juttis with a cushioned footbed." },
  { id: "p18", name: "Block Heels", category: "Footwear", price: 1999, mrp: 2799, sizes: ["4", "5", "6", "7", "8"], tag: "Sale", desc: "Comfortable block heels in a versatile champagne tone." },
];

const ADMIN_EMAIL = "admin@umas.com";
const ADMIN_PASSWORD = "admin123";
const SEED_USERS = [{ id: "u-admin", name: "Uma Admin", email: ADMIN_EMAIL, password: ADMIN_PASSWORD, isAdmin: true }];

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const discountPct = (price, mrp) => (mrp > price ? Math.round((1 - price / mrp) * 100) : 0);
const uid = (p) => p + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ------------------------------- Storage helpers ------------------------------ */

async function loadShared(key, seed) {
  try {
    const res = await window.storage.get(key, true);
    if (res && res.value) return JSON.parse(res.value);
  } catch (e) {}
  if (seed !== undefined) {
    try { await window.storage.set(key, JSON.stringify(seed), true); } catch (e) {}
    return seed;
  }
  return [];
}
async function saveShared(key, value) {
  try { await window.storage.set(key, JSON.stringify(value), true); } catch (e) {}
}

/* ---------------------------------- Toast ---------------------------------- */

function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-stone-950 text-amber-300 border border-amber-500/40 px-5 py-3 rounded-full shadow-xl text-sm tracking-wide flex items-center gap-2">
      <Check size={16} className="text-amber-400" /> {message}
    </div>
  );
}

/* ----------------------------- Product art block ---------------------------- */

function ProductArt({ category, tag, size = "h-64" }) {
  const meta = CATEGORY_META[category] || CATEGORY_META.Sarees;
  const Icon = meta.icon;
  return (
    <div className={`relative ${size} w-full rounded-md bg-gradient-to-br ${meta.from} ${meta.to} flex items-center justify-center overflow-hidden`}>
      <Icon size={56} strokeWidth={1} className="text-stone-700/60" />
      <div className="absolute inset-3 border border-white/50 rounded-sm pointer-events-none" />
      {tag ? (
        <span className={`absolute top-3 left-3 text-[10px] tracking-widest uppercase px-2 py-1 rounded-sm font-medium ${tag === "Sale" ? "bg-rose-900 text-rose-50" : "bg-stone-950 text-amber-300"}`}>
          {tag}
        </span>
      ) : null}
    </div>
  );
}

/* --------------------------------- Nav bar ---------------------------------- */

function Nav({ view, setView, cartCount, currentUser, onOpenAuth, onLogout, search, setSearch }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const navLink = (label, target) => (
    <button
      onClick={() => { setView(target); setMenuOpen(false); }}
      className={`text-sm tracking-widest uppercase transition-colors ${view === target ? "text-amber-400" : "text-stone-300 hover:text-amber-300"}`}
    >
      {label}
    </button>
  );

  return (
    <header className="sticky top-0 z-40 bg-stone-950 border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-20 flex items-center justify-between gap-4">
        <button onClick={() => setView("home")} className="flex flex-col items-start leading-none shrink-0">
          <span className="font-serif text-2xl md:text-3xl text-amber-300 tracking-wide">Uma's</span>
          <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-stone-400 mt-0.5">Fashion &amp; Boutique</span>
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {navLink("Home", "home")}
          {navLink("Shop", "shop")}
        </nav>

        <div className="flex items-center gap-1 md:gap-3">
          <div className="hidden sm:flex items-center">
            {searchOpen ? (
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={() => !search && setSearchOpen(false)}
                placeholder="Search products…"
                className="bg-stone-900 border border-amber-500/30 text-stone-100 placeholder-stone-500 text-sm rounded-full px-4 py-2 w-48 focus:outline-none focus:border-amber-400"
              />
            ) : (
              <button onClick={() => { setSearchOpen(true); setView("shop"); }} className="p-2 text-stone-300 hover:text-amber-300" aria-label="Search">
                <Search size={19} />
              </button>
            )}
          </div>

          <div className="relative">
            <button onClick={() => setAccountOpen((v) => !v)} className="p-2 text-stone-300 hover:text-amber-300" aria-label="Account">
              <User size={19} />
            </button>
            {accountOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-stone-900 border border-amber-500/30 rounded-md shadow-xl py-2 text-sm">
                {currentUser ? (
                  <>
                    <div className="px-4 py-2 text-stone-400 text-xs border-b border-stone-800">Signed in as<br /><span className="text-amber-300">{currentUser.name}</span></div>
                    <button onClick={() => { setView("account"); setAccountOpen(false); }} className="w-full text-left px-4 py-2 text-stone-200 hover:bg-stone-800">My Orders</button>
                    {currentUser.isAdmin && (
                      <button onClick={() => { setView("admin"); setAccountOpen(false); }} className="w-full text-left px-4 py-2 text-stone-200 hover:bg-stone-800 flex items-center gap-2">
                        <LayoutDashboard size={14} /> Admin Dashboard
                      </button>
                    )}
                    <button onClick={() => { onLogout(); setAccountOpen(false); }} className="w-full text-left px-4 py-2 text-rose-400 hover:bg-stone-800 flex items-center gap-2">
                      <LogOut size={14} /> Log out
                    </button>
                  </>
                ) : (
                  <button onClick={() => { onOpenAuth(); setAccountOpen(false); }} className="w-full text-left px-4 py-2 text-stone-200 hover:bg-stone-800">Login / Sign up</button>
                )}
              </div>
            )}
          </div>

          <button onClick={() => setView("cart")} className="relative p-2 text-stone-300 hover:text-amber-300" aria-label="Cart">
            <ShoppingBag size={19} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-stone-950 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <button className="md:hidden p-2 text-stone-300" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            <Menu size={19} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-stone-800 px-5 py-4 flex flex-col gap-4 bg-stone-950">
          {navLink("Home", "home")}
          {navLink("Shop", "shop")}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="bg-stone-900 border border-amber-500/30 text-stone-100 placeholder-stone-500 text-sm rounded-full px-4 py-2 focus:outline-none focus:border-amber-400"
          />
        </div>
      )}
    </header>
  );
}

/* --------------------------------- Swatch strip -------------------------------- */

function SwatchStrip({ onPick }) {
  return (
    <div className="flex gap-6 md:gap-10 overflow-x-auto pb-2 px-1 justify-center">
      {CATEGORIES.map((cat) => {
        const meta = CATEGORY_META[cat];
        const Icon = meta.icon;
        return (
          <button key={cat} onClick={() => onPick(cat)} className="flex flex-col items-center gap-2 shrink-0 group">
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${meta.from} ${meta.to} flex items-center justify-center border border-amber-500/30 group-hover:border-amber-400 transition-all group-hover:-translate-y-1`}>
              <Icon size={26} strokeWidth={1.3} className="text-stone-700" />
            </div>
            <span className="text-[11px] tracking-widest uppercase text-stone-300 group-hover:text-amber-300">{cat}</span>
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------- Product card -------------------------------- */

function ProductCard({ product, onOpen }) {
  const pct = discountPct(product.price, product.mrp);
  return (
    <button onClick={() => onOpen(product)} className="text-left group">
      <ProductArt category={product.category} tag={product.tag} />
      <div className="pt-3">
        <div className="text-[10px] tracking-widest uppercase text-stone-500">{product.category}</div>
        <div className="font-serif text-lg text-stone-900 group-hover:text-amber-700 transition-colors leading-snug">{product.name}</div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-stone-900 font-medium">{inr(product.price)}</span>
          {pct > 0 && <span className="text-stone-400 text-sm line-through">{inr(product.mrp)}</span>}
          {pct > 0 && <span className="text-rose-700 text-xs font-medium">{pct}% off</span>}
        </div>
      </div>
    </button>
  );
}

/* ----------------------------------- Home view ---------------------------------- */

function HomeView({ products, setView, setCategoryFilter, openProduct, activeTheme = "regular" }) {
  const theme = SEASONAL_THEMES[activeTheme] || SEASONAL_THEMES.regular;
  const featured = products.filter((p) => p.tag === "Bestseller").slice(0, 4);

  return (
    <div>
      <section className={`${theme.heroBg} text-center py-20 md:py-28 px-6 border-b ${theme.border} transition-all duration-500`}>
        <div className={`${theme.heroText} text-xs tracking-[0.4em] uppercase mb-4 font-medium`}>
          {theme.badge}
        </div>
        <h1 className="font-serif text-4xl md:text-6xl text-stone-50 leading-tight max-w-3xl mx-auto">
          Uma's Fashion &amp; Boutique
        </h1>
        <p className="text-stone-300 max-w-xl mx-auto mt-5 text-sm md:text-base leading-relaxed">
          {theme.tagline}
        </p>
        <button
          onClick={() => setView("shop")}
          className={`mt-8 inline-flex items-center gap-2 ${theme.buttonBg} font-medium tracking-wide px-7 py-3 rounded-full transition-all shadow-md`}
        >
          Shop the Collection <ArrowRight size={16} />
        </button>
      </section>

      <section className="bg-stone-950 pb-16 pt-4">
        <SwatchStrip onPick={(cat) => { setCategoryFilter(cat); setView("shop"); }} />
      </section>

      <section className="bg-stone-50 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl md:text-3xl text-stone-900">Bestsellers</h2>
            <button onClick={() => setView("shop")} className="text-xs tracking-widest uppercase text-amber-700 hover:text-amber-800 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={openProduct} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-stone-950 py-10 border-t border-amber-500/20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center px-6">
          {[
            ["Free shipping", "On orders above ₹2,999"],
            ["Easy 7-day returns", "No questions asked"],
            ["Secure checkout", "Your details stay protected"],
          ].map(([t, s]) => (
            <div key={t}>
              <div className="text-amber-300 tracking-widest text-xs uppercase mb-1">{t}</div>
              <div className="text-stone-500 text-sm">{s}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ----------------------------------- Shop view ---------------------------------- */

function ShopView({ products, categoryFilter, setCategoryFilter, search, openProduct }) {
  const [sort, setSort] = useState("featured");

  const filtered = useMemo(() => {
    let list = products.filter((p) => (categoryFilter ? p.category === categoryFilter : true));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "bestseller") list = [...list].sort((a, b) => (b.tag === "Bestseller") - (a.tag === "Bestseller"));
    return list;
  }, [products, categoryFilter, search, sort]);

  return (
    <div className="bg-stone-50 min-h-[70vh] py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="font-serif text-3xl text-stone-900">{categoryFilter || "All Products"}</h1>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-stone-300 rounded-full px-4 py-2 text-sm text-stone-700 bg-white focus:outline-none focus:border-amber-500"
          >
            <option value="featured">Featured</option>
            <option value="bestseller">Bestsellers first</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>

        <div className="flex gap-2 flex-wrap mb-10">
          <button
            onClick={() => setCategoryFilter(null)}
            className={`px-4 py-1.5 rounded-full text-xs tracking-widest uppercase border ${!categoryFilter ? "bg-stone-950 text-amber-300 border-stone-950" : "border-stone-300 text-stone-600"}`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-4 py-1.5 rounded-full text-xs tracking-widest uppercase border ${categoryFilter === c ? "bg-stone-950 text-amber-300 border-stone-950" : "border-stone-300 text-stone-600"}`}
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24 text-stone-400">
            <AlertCircle className="mx-auto mb-3" size={28} />
            No products match your search. Try a different keyword or category.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={openProduct} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Product detail view ------------------------------ */

function ProductDetailView({ product, addToCart, setView }) {
  const [size, setSize] = useState(product.sizes[0]);
  const [qty, setQty] = useState(1);
  const pct = discountPct(product.price, product.mrp);

  return (
    <div className="bg-stone-50 min-h-[70vh] py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => setView("shop")} className="text-xs tracking-widest uppercase text-stone-500 hover:text-amber-700 mb-6 inline-block">
          ← Back to Shop
        </button>
        <div className="grid md:grid-cols-2 gap-10">
          <ProductArt category={product.category} tag={product.tag} size="h-[420px]" />
          <div>
            <div className="text-[11px] tracking-widest uppercase text-stone-500 mb-1">{product.category}</div>
            <h1 className="font-serif text-3xl text-stone-900 mb-3">{product.name}</h1>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl text-stone-900 font-medium">{inr(product.price)}</span>
              {pct > 0 && <span className="text-stone-400 line-through">{inr(product.mrp)}</span>}
              {pct > 0 && <span className="text-rose-700 text-sm font-medium">{pct}% off</span>}
            </div>
            <p className="text-stone-600 text-sm leading-relaxed mb-6">{product.desc}</p>

            <div className="mb-5">
              <div className="text-xs tracking-widest uppercase text-stone-500 mb-2">Size</div>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-4 py-2 rounded-md border text-sm ${size === s ? "bg-stone-950 text-amber-300 border-stone-950" : "border-stone-300 text-stone-700 hover:border-amber-500"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-7">
              <div className="text-xs tracking-widest uppercase text-stone-500 mb-2">Quantity</div>
              <div className="flex items-center gap-3 border border-stone-300 rounded-md w-fit px-2">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2 text-stone-600"><Minus size={14} /></button>
                <span className="w-6 text-center">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="p-2 text-stone-600"><Plus size={14} /></button>
              </div>
            </div>

            <button
              onClick={() => addToCart(product, size, qty)}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium tracking-wide px-8 py-3 rounded-full transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------- Cart view ----------------------------------- */

function CartView({ cart, products, updateQty, removeItem, setView, subtotal }) {
  return (
    <div className="bg-stone-50 min-h-[70vh] py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-3xl text-stone-900 mb-8">Your Cart</h1>
        {cart.length === 0 ? (
          <div className="text-center py-20 text-stone-500">
            <ShoppingBag className="mx-auto mb-3" size={32} />
            Your cart is empty.
            <div className="mt-4">
              <button onClick={() => setView("shop")} className="text-amber-700 underline text-sm">Continue shopping</button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-10">
            <div className="md:col-span-2 flex flex-col gap-5">
              {cart.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                if (!product) return null;
                return (
                  <div key={item.cartId} className="flex gap-4 bg-white border border-stone-200 rounded-md p-4">
                    <div className="w-24 shrink-0"><ProductArt category={product.category} size="h-24" /></div>
                    <div className="flex-1">
                      <div className="font-serif text-lg text-stone-900">{product.name}</div>
                      <div className="text-xs text-stone-500 mb-2">Size: {item.size}</div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-stone-300 rounded-md">
                          <button onClick={() => updateQty(item.cartId, Math.max(1, item.qty - 1))} className="p-1.5 text-stone-600"><Minus size={12} /></button>
                          <span className="w-6 text-center text-sm">{item.qty}</span>
                          <button onClick={() => updateQty(item.cartId, item.qty + 1)} className="p-1.5 text-stone-600"><Plus size={12} /></button>
                        </div>
                        <button onClick={() => removeItem(item.cartId)} className="text-rose-700 hover:text-rose-800"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <div className="text-stone-900 font-medium">{inr(product.price * item.qty)}</div>
                  </div>
                );
              })}
            </div>
            <div className="bg-white border border-stone-200 rounded-md p-6 h-fit">
              <div className="flex justify-between text-sm mb-2 text-stone-600"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
              <div className="flex justify-between text-sm mb-4 text-stone-600"><span>Shipping</span><span>{subtotal >= 2999 ? "Free" : inr(99)}</span></div>
              <div className="flex justify-between font-medium text-stone-900 border-t border-stone-200 pt-4 mb-6">
                <span>Total</span><span>{inr(subtotal + (subtotal >= 2999 || subtotal === 0 ? 0 : 99))}</span>
              </div>
              <button
                onClick={() => setView("checkout")}
                className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium tracking-wide py-3 rounded-full transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- Checkout view --------------------------------- */

function CheckoutView({ cart, products, subtotal, currentUser, onOpenAuth, placeOrder }) {
  const [form, setForm] = useState({ name: currentUser?.name || "", phone: "", address: "", city: "", pincode: "" });
  const [payment, setPayment] = useState("cod");
  const shipping = subtotal >= 2999 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;
  const valid = form.name && form.phone && form.address && form.city && form.pincode;

  if (!currentUser) {
    return (
      <div className="bg-stone-50 min-h-[60vh] py-24 px-6 text-center">
        <p className="text-stone-600 mb-4">Please log in to continue to checkout.</p>
        <button onClick={onOpenAuth} className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium px-7 py-3 rounded-full">
          Login / Sign up
        </button>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-[70vh] py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-3xl text-stone-900 mb-8">Checkout</h1>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="bg-white border border-stone-200 rounded-md p-6">
              <div className="text-xs tracking-widest uppercase text-stone-500 mb-4">Shipping Details</div>
              <div className="grid sm:grid-cols-2 gap-4">
                <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-stone-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 sm:col-span-2" />
                <input placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border border-stone-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 sm:col-span-2" />
                <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="border border-stone-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 sm:col-span-2" />
                <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="border border-stone-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
                <input placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="border border-stone-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
              </div>
            </div>
            <div className="bg-white border border-stone-200 rounded-md p-6">
              <div className="text-xs tracking-widest uppercase text-stone-500 mb-4">Payment Method</div>
              <div className="flex flex-col gap-3 text-sm">
                <label className="flex items-center gap-2"><input type="radio" checked={payment === "cod"} onChange={() => setPayment("cod")} /> Cash on Delivery</label>
                <label className="flex items-center gap-2"><input type="radio" checked={payment === "card"} onChange={() => setPayment("card")} /> Card / UPI</label>
              </div>
              <p className="text-xs text-stone-400 mt-4">This is a demo storefront — no real payment is processed.</p>
            </div>
          </div>
          <div className="bg-white border border-stone-200 rounded-md p-6 h-fit">
            <div className="text-xs tracking-widest uppercase text-stone-500 mb-4">Order Summary</div>
            {cart.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              if (!product) return null;
              return (
                <div key={item.cartId} className="flex justify-between text-sm text-stone-600 mb-2">
                  <span>{product.name} × {item.qty} ({item.size})</span>
                  <span>{inr(product.price * item.qty)}</span>
                </div>
              );
            })}
            <div className="flex justify-between text-sm mb-2 text-stone-600 border-t border-stone-200 pt-3"><span>Shipping</span><span>{shipping ? inr(shipping) : "Free"}</span></div>
            <div className="flex justify-between font-medium text-stone-900 border-t border-stone-200 pt-3 mb-6"><span>Total</span><span>{inr(total)}</span></div>
            <button
              disabled={!valid || cart.length === 0}
              onClick={() => placeOrder(form, payment, total)}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-medium tracking-wide py-3 rounded-full transition-colors"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Confirmation view ------------------------------- */

function ConfirmationView({ order, setView }) {
  if (!order) return null;
  return (
    <div className="bg-stone-50 min-h-[70vh] py-24 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center mx-auto mb-6">
        <Check size={28} className="text-stone-950" />
      </div>
      <h1 className="font-serif text-3xl text-stone-900 mb-2">Thank you, {order.address.name.split(" ")[0]}!</h1>
      <p className="text-stone-600 mb-1">Your order has been placed successfully.</p>
      <p className="text-stone-400 text-sm mb-8">Order ID: {order.id}</p>
      <button onClick={() => setView("shop")} className="bg-stone-950 text-amber-300 px-7 py-3 rounded-full text-sm tracking-widest uppercase">
        Continue Shopping
      </button>
    </div>
  );
}

/* ---------------------------------- Account view ---------------------------------- */

const STATUS_COLORS = {
  Placed: "bg-amber-100 text-amber-800",
  Processing: "bg-blue-100 text-blue-800",
  Shipped: "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-rose-100 text-rose-800",
};

function AccountView({ currentUser, orders, setView }) {
  const myOrders = orders.filter((o) => o.userEmail === currentUser?.email).sort((a, b) => b.date - a.date);
  return (
    <div className="bg-stone-50 min-h-[70vh] py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-3xl text-stone-900 mb-8">My Orders</h1>
        {myOrders.length === 0 ? (
          <div className="text-center py-16 text-stone-500">
            No orders yet. <button onClick={() => setView("shop")} className="text-amber-700 underline">Start shopping</button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {myOrders.map((o) => (
              <div key={o.id} className="bg-white border border-stone-200 rounded-md p-5">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                  <div className="text-sm text-stone-500">Order {o.id} · {new Date(o.date).toLocaleDateString()}</div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                </div>
                {o.items.map((it, i) => (
                  <div key={i} className="flex justify-between text-sm text-stone-700 mb-1">
                    <span>{it.name} × {it.qty} ({it.size})</span>
                    <span>{inr(it.price * it.qty)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-medium text-stone-900 border-t border-stone-200 mt-3 pt-3">
                  <span>Total</span><span>{inr(o.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------- Auth modal ----------------------------------- */

function AuthModal({ onClose, onLogin, onSignup, error }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  return (
    <div className="fixed inset-0 bg-stone-950/70 z-[90] flex items-center justify-center px-4">
      <div className="bg-white rounded-md w-full max-w-sm p-7 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"><X size={18} /></button>
        <h2 className="font-serif text-2xl text-stone-900 mb-1">{mode === "login" ? "Welcome back" : "Create an account"}</h2>
        <p className="text-stone-500 text-sm mb-6">{mode === "login" ? "Log in to continue" : "Join Uma's Fashion & Boutique"}</p>

        <div className="flex flex-col gap-3">
          {mode === "signup" && (
            <div className="flex items-center gap-2 border border-stone-300 rounded-md px-3">
              <User size={15} className="text-stone-400" />
              <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full py-2.5 text-sm focus:outline-none" />
            </div>
          )}
          <div className="flex items-center gap-2 border border-stone-300 rounded-md px-3">
            <Mail size={15} className="text-stone-400" />
            <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full py-2.5 text-sm focus:outline-none" />
          </div>
          <div className="flex items-center gap-2 border border-stone-300 rounded-md px-3">
            <Lock size={15} className="text-stone-400" />
            <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full py-2.5 text-sm focus:outline-none" />
          </div>
          {error && <div className="text-rose-600 text-xs">{error}</div>}
          <button
            onClick={() => (mode === "login" ? onLogin(form) : onSignup(form))}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium tracking-wide py-2.5 rounded-full mt-1"
          >
            {mode === "login" ? "Log in" : "Sign up"}
          </button>
        </div>

        <div className="text-center text-sm text-stone-500 mt-5">
          {mode === "login" ? (
            <>New here? <button onClick={() => setMode("signup")} className="text-amber-700 underline">Create an account</button></>
          ) : (
            <>Already have an account? <button onClick={() => setMode("login")} className="text-amber-700 underline">Log in</button></>
          )}
        </div>
        <div className="text-center text-[11px] text-stone-400 mt-3">Admin demo login: admin@umas.com / admin123</div>
      </div>
    </div>
  );
}

/* --------------------------------- Admin dashboard -------------------------------- */

const PIE_COLORS = ["#d97706", "#78350f", "#f59e0b", "#57534e", "#b45309"];

function AdminOverview({ orders, products, users }) {
  const revenue = orders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);
  const byCategory = useMemo(() => {
    const map = {};
    orders.forEach((o) => o.items.forEach((it) => { map[it.category] = (map[it.category] || 0) + it.price * it.qty; }));
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [orders]);
  const byStatus = useMemo(() => {
    const map = {};
    orders.forEach((o) => { map[o.status] = (map[o.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const cards = [
    ["Total Revenue", inr(revenue)],
    ["Total Orders", orders.length],
    ["Total Products", products.length],
    ["Customers", users.filter((u) => !u.isAdmin).length],
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(([label, val]) => (
          <div key={label} className="bg-white border border-stone-200 rounded-md p-5">
            <div className="text-xs tracking-widest uppercase text-stone-500 mb-2">{label}</div>
            <div className="text-2xl font-serif text-stone-900">{val}</div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-stone-200 rounded-md p-5 h-80">
          <div className="text-xs tracking-widest uppercase text-stone-500 mb-4">Revenue by Category</div>
          {byCategory.length === 0 ? <div className="text-stone-400 text-sm">No orders yet.</div> : (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => inr(v)} />
                <Bar dataKey="value" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white border border-stone-200 rounded-md p-5 h-80">
          <div className="text-xs tracking-widest uppercase text-stone-500 mb-4">Orders by Status</div>
          {byStatus.length === 0 ? <div className="text-stone-400 text-sm">No orders yet.</div> : (
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                  {byStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial || { name: "", category: CATEGORIES[0], price: "", mrp: "", sizes: "Free Size", tag: "New", desc: "" }
  );
  const valid = form.name && form.price;

  return (
    <div className="bg-white border border-stone-200 rounded-md p-5 mb-6 shadow-sm">
      <div className="text-xs tracking-widest uppercase text-stone-600 mb-4 font-semibold">
        {initial ? "Edit Product Details" : "🚀 Launch New Product"}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          placeholder="Product Name *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border border-stone-300 rounded-md px-3 py-2 text-sm sm:col-span-2 focus:outline-none focus:border-amber-500"
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
        >
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={form.tag}
          onChange={(e) => setForm({ ...form, tag: e.target.value })}
          className="border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
        >
          <option value="New">🚀 New Launch</option>
          <option value="Bestseller">⭐ Bestseller</option>
          <option value="Sale">🔥 Sale</option>
          <option value="">No tag</option>
        </select>
        <input
          placeholder="Selling Price (₹) *"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
        />
        <input
          placeholder="MRP (Original Price ₹)"
          type="number"
          value={form.mrp}
          onChange={(e) => setForm({ ...form, mrp: e.target.value })}
          className="border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
        />
        <input
          placeholder="Available Sizes (e.g. Free Size, S, M, L, XL)"
          value={form.sizes}
          onChange={(e) => setForm({ ...form, sizes: e.target.value })}
          className="border border-stone-300 rounded-md px-3 py-2 text-sm sm:col-span-2 focus:outline-none focus:border-amber-500"
        />
        <textarea
          placeholder="Product Description..."
          value={form.desc}
          onChange={(e) => setForm({ ...form, desc: e.target.value })}
          className="border border-stone-300 rounded-md px-3 py-2 text-sm sm:col-span-2 focus:outline-none focus:border-amber-500"
          rows={2}
        />
      </div>
      <div className="flex gap-3 mt-4">
        <button
          disabled={!valid}
          onClick={() => {
            const numPrice = Number(form.price) || 0;
            const numMrp = Number(form.mrp) || numPrice;
            const sizeList = typeof form.sizes === "string"
              ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean)
              : (Array.isArray(form.sizes) ? form.sizes : ["Free Size"]);

            onSave({
              ...form,
              id: form.id || uid("p"),
              price: numPrice,
              mrp: numMrp,
              sizes: sizeList.length > 0 ? sizeList : ["Free Size"],
              tag: form.tag || "New",
              desc: form.desc || `${form.name} from our latest collection.`
            });
          }}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-medium px-5 py-2 rounded-full text-sm flex items-center gap-1 shadow"
        >
          {initial ? "Save Product" : "🚀 Launch Product"}
        </button>
        <button onClick={onCancel} className="text-stone-500 text-sm px-3">Cancel</button>
      </div>
    </div>
  );
}

function AdminProducts({ products, saveProduct, deleteProduct }) {
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-xs tracking-widest uppercase text-stone-500 font-medium">{products.length} products in catalog</div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="bg-stone-950 text-amber-300 text-xs tracking-widest uppercase px-4 py-2.5 rounded-full flex items-center gap-1 hover:bg-stone-900 shadow"
          >
            <Plus size={14} /> Launch New Product
          </button>
        )}
      </div>
      {adding && <ProductForm onSave={(p) => { saveProduct(p); setAdding(false); }} onCancel={() => setAdding(false)} />}
      {editing && <ProductForm initial={editing} onSave={(p) => { saveProduct(p); setEditing(null); }} onCancel={() => setEditing(null)} />}
      <div className="bg-white border border-stone-200 rounded-md overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-stone-100 text-stone-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Price</th>
              <th className="text-left px-4 py-3">Tag</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-stone-100 hover:bg-stone-50/50">
                <td className="px-4 py-3 text-stone-800 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-stone-500">{p.category}</td>
                <td className="px-4 py-3 text-stone-800 font-medium">{inr(p.price)}</td>
                <td className="px-4 py-3 text-stone-500">{p.tag || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(p)} className="text-stone-500 hover:text-amber-700 mr-3" title="Edit"><Edit2 size={15} /></button>
                  <button onClick={() => deleteProduct(p.id)} className="text-stone-500 hover:text-rose-700" title="Delete"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminOrders({ orders, updateOrderStatus }) {
  const sorted = [...orders].sort((a, b) => b.date - a.date);
  return (
    <div className="bg-white border border-stone-200 rounded-md overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-stone-100 text-stone-500 text-xs uppercase tracking-wider">
          <tr><th className="text-left px-4 py-3">Order ID</th><th className="text-left px-4 py-3">Customer</th><th className="text-left px-4 py-3">Items</th><th className="text-left px-4 py-3">Total</th><th className="text-left px-4 py-3">Status</th></tr>
        </thead>
        <tbody>
          {sorted.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-400">No orders yet.</td></tr>}
          {sorted.map((o) => (
            <tr key={o.id} className="border-t border-stone-100">
              <td className="px-4 py-3 text-stone-800 font-medium">{o.id}</td>
              <td className="px-4 py-3 text-stone-600">{o.address?.name || "Customer"}<br /><span className="text-xs text-stone-400">{o.userEmail}</span></td>
              <td className="px-4 py-3 text-stone-600">{o.items.length}</td>
              <td className="px-4 py-3 text-stone-800 font-medium">{inr(o.total)}</td>
              <td className="px-4 py-3">
                <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)} className="border border-stone-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:border-amber-500">
                  {["Placed", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminThemeManager({ activeTheme, onSelectTheme }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl text-stone-900">Seasonal Theme Manager</h2>
        <p className="text-stone-500 text-sm mt-1">
          Select the active seasonal theme for your store. Only admins have access to change storefront themes.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Object.entries(SEASONAL_THEMES).map(([key, theme]) => {
          const isActive = activeTheme === key;
          return (
            <button
              key={key}
              onClick={() => onSelectTheme(key)}
              className={`text-left p-5 rounded-lg border-2 transition-all flex flex-col justify-between ${
                isActive ? "border-amber-500 bg-amber-50/40 shadow-md scale-[1.02]" : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-serif text-lg font-medium text-stone-900">{theme.name}</span>
                  {isActive && (
                    <span className="bg-amber-500 text-stone-950 text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-amber-700 mb-2 font-medium">{theme.badge}</div>
                <p className="text-xs text-stone-500 leading-relaxed mb-4">{theme.tagline}</p>
              </div>
              <div className={`w-full py-2 rounded-md text-xs font-medium text-center uppercase tracking-wider ${isActive ? "bg-amber-500 text-stone-950 font-semibold" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}>
                {isActive ? "Currently Active" : "Activate Theme"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AdminDashboard({ products, orders, users, saveProduct, deleteProduct, updateOrderStatus, setView, activeTheme, onSelectTheme }) {
  const [tab, setTab] = useState("overview");
  const tabs = [
    ["overview", "Overview", BarChart3],
    ["products", "Products", Package],
    ["orders", "Orders", ShoppingBag],
    ["theme", "Seasonal Themes", Sparkles],
  ];
  return (
    <div className="bg-stone-50 min-h-[70vh] flex flex-col md:flex-row">
      <aside className="md:w-56 bg-stone-950 md:min-h-[70vh] p-5 flex md:flex-col gap-2">
        <div className="hidden md:block text-amber-300 font-serif text-xl mb-6">Admin Panel</div>
        {tabs.map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm ${tab === key ? "bg-amber-500 text-stone-950 font-medium" : "text-stone-300 hover:bg-stone-900"}`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
        <button onClick={() => setView("home")} className="md:mt-auto flex items-center gap-2 px-4 py-2.5 rounded-md text-sm text-stone-400 hover:text-amber-300">
          ← Back to store
        </button>
      </aside>
      <main className="flex-1 p-6 md:p-8">
        {tab === "overview" && <AdminOverview orders={orders} products={products} users={users} />}
        {tab === "products" && <AdminProducts products={products} saveProduct={saveProduct} deleteProduct={deleteProduct} />}
        {tab === "orders" && <AdminOrders orders={orders} updateOrderStatus={updateOrderStatus} />}
        {tab === "theme" && <AdminThemeManager activeTheme={activeTheme} onSelectTheme={onSelectTheme} />}
      </main>
    </div>
  );
}

/* ------------------------------------- Footer ------------------------------------- */

function Footer() {
  return (
    <footer className="bg-stone-950 border-t border-amber-500/20 py-10 px-6 text-center">
      <div className="font-serif text-xl text-amber-300 mb-2">Uma's Fashion &amp; Boutique</div>
      <div className="text-stone-500 text-sm mb-4">Puducherry, India · hello@umasboutique.example · +91 98765 43210</div>
      <div className="text-stone-600 text-xs">© {new Date().getFullYear()} Uma's Fashion & Boutique. All rights reserved.</div>
    </footer>
  );
}

/* ---------------------------------- Root component --------------------------------- */

export default function UmasFashionBoutique() {
  const [products, setProducts] = useState(SEED_PRODUCTS);
  const [users, setUsers] = useState(SEED_USERS);
  const [orders, setOrders] = useState([]);
  const [activeTheme, setActiveTheme] = useState("regular");
  const [loaded, setLoaded] = useState(false);

  const [view, setView] = useState("home");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [search, setSearch] = useState("");
  const [activeProduct, setActiveProduct] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);

  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authError, setAuthError] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  useEffect(() => {
    (async () => {
      const p = await loadShared("umas:products", SEED_PRODUCTS);
      const u = await loadShared("umas:users", SEED_USERS);
      const o = await loadShared("umas:orders", []);
      const th = await loadShared("umas:activeTheme", "regular");
      setProducts(p); setUsers(u); setOrders(o);
      if (th && SEASONAL_THEMES[th]) setActiveTheme(th);

      // Always reset view to starting home page on fresh website load
      setView("home");

      try {
        let email = null;
        if (typeof window !== "undefined" && window.sessionStorage) {
          const sess = sessionStorage.getItem("umas:session");
          if (sess) email = JSON.parse(sess);
        }
        if (email) {
          const found = u.find((usr) => usr.email === email);
          if (found) {
            setCurrentUser(found);
            const cRes = await window.storage.get(`umas:cart:${email}`, true).catch(() => null);
            if (cRes && cRes.value) setCart(JSON.parse(cRes.value));
          }
        }
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded && currentUser) saveShared(`umas:cart:${currentUser.email}`, cart);
  }, [cart, currentUser, loaded]);

  const handleSelectTheme = async (themeKey) => {
    setActiveTheme(themeKey);
    await saveShared("umas:activeTheme", themeKey);
    showToast(`Storefront theme updated to: ${SEASONAL_THEMES[themeKey]?.name || "Regular"}`);
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => {
    const p = products.find((pr) => pr.id === i.productId);
    return s + (p ? p.price * i.qty : 0);
  }, 0);

  const openProduct = (p) => { setActiveProduct(p); setView("product"); };

  const addToCart = (product, size, qty) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id && i.size === size);
      if (existing) return prev.map((i) => (i === existing ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { cartId: uid("c"), productId: product.id, size, qty }];
    });
    showToast(`Added ${product.name} to cart`);
  };
  const updateQty = (cartId, qty) => setCart((prev) => prev.map((i) => (i.cartId === cartId ? { ...i, qty } : i)));
  const removeItem = (cartId) => setCart((prev) => prev.filter((i) => i.cartId !== cartId));

  const handleLogin = async ({ email, password }) => {
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) { setAuthError("Invalid email or password."); return; }
    setCurrentUser(found); setAuthOpen(false); setAuthError("");
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        sessionStorage.setItem("umas:session", JSON.stringify(email));
      }
    } catch (e) {}
    const cRes = await window.storage.get(`umas:cart:${email}`, true).catch(() => null);
    setCart(cRes && cRes.value ? JSON.parse(cRes.value) : []);
    showToast(`Welcome back, ${found.name.split(" ")[0]}!`);
    if (found.isAdmin) setView("admin");
  };

  const handleSignup = async ({ name, email, password }) => {
    if (!name || !email || !password) { setAuthError("Please fill in all fields."); return; }
    if (users.find((u) => u.email === email)) { setAuthError("An account with this email already exists."); return; }
    const newUser = { id: uid("u"), name, email, password, isAdmin: false };
    const updated = [...users, newUser];
    setUsers(updated); await saveShared("umas:users", updated);
    setCurrentUser(newUser); setAuthOpen(false); setAuthError("");
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        sessionStorage.setItem("umas:session", JSON.stringify(email));
      }
    } catch (e) {}
    showToast(`Welcome, ${name.split(" ")[0]}!`);
  };

  const handleLogout = async () => {
    setCurrentUser(null); setCart([]); setView("home");
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        sessionStorage.removeItem("umas:session");
      }
      await window.storage.delete("umas:session", false);
    } catch (e) {}
  };

  const placeOrder = async (address, payment, total) => {
    const order = {
      id: uid("ORD").toUpperCase(),
      userEmail: currentUser.email,
      address,
      payment,
      items: cart.map((i) => {
        const p = products.find((pr) => pr.id === i.productId);
        return { name: p.name, category: p.category, price: p.price, qty: i.qty, size: i.size };
      }),
      total,
      status: "Placed",
      date: Date.now(),
    };
    const updated = [...orders, order];
    setOrders(updated); await saveShared("umas:orders", updated);
    setCart([]); setLastOrder(order); setView("confirmation");
    showToast("Order placed successfully!");
  };

  const saveProduct = async (product) => {
    const exists = products.some((p) => p.id === product.id);
    const updated = exists ? products.map((p) => (p.id === product.id ? product : p)) : [product, ...products];
    setProducts(updated); await saveShared("umas:products", updated);
    showToast(exists ? "Product details updated" : "🚀 New product launched successfully!");
  };
  const deleteProduct = async (id) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated); await saveShared("umas:products", updated);
    showToast("Product deleted");
  };
  const updateOrderStatus = async (id, status) => {
    const updated = orders.map((o) => (o.id === id ? { ...o, status } : o));
    setOrders(updated); await saveShared("umas:orders", updated);
  };

  if (!loaded) {
    return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-amber-300 font-serif text-xl">Loading Uma's Fashion &amp; Boutique…</div>;
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {view !== "admin" && (
        <Nav
          view={view} setView={setView} cartCount={cartCount} currentUser={currentUser}
          onOpenAuth={() => setAuthOpen(true)} onLogout={handleLogout}
          search={search} setSearch={(v) => { setSearch(v); setView("shop"); }}
        />
      )}

      {view === "home" && <HomeView products={products} setView={setView} setCategoryFilter={setCategoryFilter} openProduct={openProduct} activeTheme={activeTheme} />}
      {view === "shop" && <ShopView products={products} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} search={search} openProduct={openProduct} />}
      {view === "product" && activeProduct && <ProductDetailView product={activeProduct} addToCart={addToCart} setView={setView} />}
      {view === "cart" && <CartView cart={cart} products={products} updateQty={updateQty} removeItem={removeItem} setView={setView} subtotal={subtotal} />}
      {view === "checkout" && <CheckoutView cart={cart} products={products} subtotal={subtotal} currentUser={currentUser} onOpenAuth={() => setAuthOpen(true)} placeOrder={placeOrder} />}
      {view === "confirmation" && <ConfirmationView order={lastOrder} setView={setView} />}
      {view === "account" && <AccountView currentUser={currentUser} orders={orders} setView={setView} />}
      {view === "admin" && (
        currentUser?.isAdmin ? (
          <AdminDashboard
            products={products} orders={orders} users={users}
            saveProduct={saveProduct} deleteProduct={deleteProduct}
            updateOrderStatus={updateOrderStatus} setView={setView}
            activeTheme={activeTheme} onSelectTheme={handleSelectTheme}
          />
        ) : (
          <div className="min-h-[70vh] flex items-center justify-center flex-col gap-4 bg-stone-50">
            <p className="text-stone-600">Admin access only.</p>
            <button onClick={() => setAuthOpen(true)} className="bg-amber-500 text-stone-950 px-6 py-2.5 rounded-full text-sm font-medium">Login as Admin</button>
          </div>
        )
      )}

      {view !== "admin" && <Footer />}
      {authOpen && <AuthModal onClose={() => { setAuthOpen(false); setAuthError(""); }} onLogin={handleLogin} onSignup={handleSignup} error={authError} />}
      <Toast message={toast} />
    </div>
  );
}
