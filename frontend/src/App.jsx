import ImageCropModal from "./components/ImageCropModal";
import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag, Search, User, X, Plus, Minus, Trash2, ChevronRight,
  LogOut, LayoutDashboard, Package, BarChart3, Menu, Check,
  ArrowRight, Mail, Lock, Edit2, Upload, AlertCircle, Star,
  Clock, RotateCcw, Truck, ShieldCheck, Sliders, Calendar,
  Users, RefreshCw, FileText, Phone, MapPin, CreditCard, Tag,
  TrendingUp, Bell, Image as ImageIcon, Sparkles, CheckCircle, XCircle, Printer, Download,
  Ruler, MessageSquare, Bot, HelpCircle, Send
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/* ---------------------------- Configurations ---------------------------- */

const API_BASE = "/api";
const IMAGE_BASE = "";
const UPI_ID = "logeshs01072005@okhdfcbank";
const UPI_NAME = "Uma Fashion Boutique";
const WHATSAPP_NUMBER = "8489943146";

const SIZE_GUIDE_CM = {
  "XS": { bust: "81-84 cm (32-33 in)", waist: "66-69 cm (26-27 in)", hip: "89-91 cm (35-36 in)", shoulder: "36 cm (14 in)", length: "135-140 cm" },
  "S": { bust: "86-89 cm (34-35 in)", waist: "71-74 cm (28-29 in)", hip: "94-97 cm (37-38 in)", shoulder: "37 cm (14.5 in)", length: "138-142 cm" },
  "M": { bust: "91-94 cm (36-37 in)", waist: "76-79 cm (30-31 in)", hip: "99-102 cm (39-40 in)", shoulder: "38 cm (15 in)", length: "140-144 cm" },
  "L": { bust: "97-102 cm (38-40 in)", waist: "81-86 cm (32-34 in)", hip: "104-109 cm (41-43 in)", shoulder: "39.5 cm (15.5 in)", length: "142-146 cm" },
  "XL": { bust: "104-109 cm (41-43 in)", waist: "89-94 cm (35-37 in)", hip: "112-117 cm (44-46 in)", shoulder: "41 cm (16 in)", length: "144-148 cm" },
  "XXL": { bust: "112-117 cm (44-46 in)", waist: "97-102 cm (38-40 in)", hip: "119-124 cm (47-49 in)", shoulder: "42.5 cm (16.5 in)", length: "145-150 cm" },
  "Free Size": { bust: "81-112 cm (32-44 in)", waist: "66-102 cm (26-40 in)", hip: "89-124 cm (35-49 in)", shoulder: "36-42 cm", length: "Adjustable Margins" }
};

const DEFAULT_CATEGORIES = ["Sarees", "Lehengas", "Kurtis", "Tops", "Western Wear", "Accessories", "Footwear"];
const CATEGORIES = DEFAULT_CATEGORIES;

const CATEGORY_META = {
  Sarees: { icon: ShoppingBag, from: "from-rose-100", to: "to-orange-100" },
  Lehengas: { icon: ShoppingBag, from: "from-red-100", to: "to-rose-200" },
  Kurtis: { icon: ShoppingBag, from: "from-amber-100", to: "to-yellow-100" },
  Tops: { icon: ShoppingBag, from: "from-amber-100", to: "to-orange-100" },
  "Western Wear": { icon: ShoppingBag, from: "from-stone-100", to: "to-neutral-200" },
  Accessories: { icon: ShoppingBag, from: "from-yellow-100", to: "to-amber-200" },
  Footwear: { icon: ShoppingBag, from: "from-orange-100", to: "to-amber-100" },
};

const CATEGORY_EMOJI = {
  Sarees: "🥻",
  Lehengas: "👗",
  Kurtis: "👘",
  Tops: "👚",
  "Western Wear": "👖",
  Accessories: "💍",
  Footwear: "👟",
};


const CHART_COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899"];

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const formatDateTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
const discountPct = (price, mrp) => (mrp > price ? Math.round((1 - price / mrp) * 100) : 0);

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("/uploads")) {
    return `${IMAGE_BASE}${url}`;
  }
  return url;
};

// Calculate Estimated Delivery Date (5 days from now)
const calculateEstimatedDelivery = () => {
  const date = new Date();
  date.setDate(date.getDate() + 5);
  const weekday = date.toLocaleDateString("en-IN", { weekday: "long" });
  const dateStr = date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  return { dateStr, weekday, timeframe: "3 - 5 business days" };
};

/* --------------------------------- Toast ---------------------------------- */

function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-stone-950 text-amber-300 border border-amber-500/40 px-5 py-3 rounded-full shadow-xl text-sm tracking-wide flex items-center gap-2">
      <Check size={16} className="text-amber-400" /> {message}
    </div>
  );
}

/* ----------------------------- Product art block ---------------------------- */

function ProductArt({ category, tag, status, imageUrl, size = "h-64", showStatusTag = true }) {
  const displayTag = showStatusTag ? (tag || (status && status !== "Available" ? status : null)) : null;

  if (imageUrl) {
    const fullUrl = getImageUrl(imageUrl);
    return (
      <div className={`relative ${size} w-full rounded-md overflow-hidden bg-stone-100 flex items-center justify-center border border-stone-200/50`}>
        <img src={fullUrl} alt={category} className="w-full h-full object-cover" />
        {displayTag ? (
          <span className={`absolute top-3 left-3 text-[10px] tracking-widest uppercase px-2 py-1 rounded-sm font-medium shadow-sm ${displayTag === "Out of Stock" || displayTag === "Unavailable"
            ? "bg-rose-900 text-rose-100"
            : displayTag === "Coming Soon"
              ? "bg-blue-900 text-blue-100"
              : displayTag === "Sale"
                ? "bg-rose-900 text-rose-50"
                : "bg-stone-950 text-amber-300"
            }`}>
            {displayTag}
          </span>
        ) : null}
      </div>
    );
  }

  const meta = CATEGORY_META[category] || { icon: ShoppingBag, from: "from-rose-100", to: "to-orange-100" };
  const Icon = meta.icon;
  return (
    <div className={`relative ${size} w-full rounded-md bg-gradient-to-br ${meta.from} ${meta.to} flex flex-col items-center justify-center overflow-hidden`}>
      <Icon size={64} strokeWidth={1.5} className="text-amber-300" />
      <div className="absolute inset-3 border border-white/50 rounded-sm pointer-events-none" />
      <div className="absolute bottom-3 text-xs text-amber-50/90 tracking-wider uppercase font-medium">{category}</div>
      {displayTag ? (
        <span className={`absolute top-3 left-3 text-[10px] tracking-widest uppercase px-2 py-1 rounded-sm font-medium shadow-sm ${displayTag === "Out of Stock" || displayTag === "Unavailable"
          ? "bg-rose-900 text-rose-100"
          : displayTag === "Coming Soon"
            ? "bg-blue-900 text-blue-100"
            : displayTag === "Sale"
              ? "bg-rose-900 text-rose-50"
              : "bg-stone-950 text-amber-300"
          }`}>
          {displayTag}
        </span>
      ) : null}
    </div>
  );
}

/* --------------------------------- Order Payment Helper -------------------------------- */

function isOrderPaid(order) {
  if (!order) return false;
  const pStatus = (order.paymentStatus || order.payment_status || "").toLowerCase();
  const oStatus = (order.status || "").toLowerCase();
  return pStatus === "paid" || pStatus === "completed" || pStatus === "success" || oStatus === "delivered";
}

/* --------------------------------- Rating Stars -------------------------------- */

function RatingStars({ rating = 4.5, numReviews = 12, size = 14 }) {
  const displayRating = Number(rating) > 0 ? Number(rating) : 4.5;
  const count = Number(numReviews) >= 0 ? Number(numReviews) : 12;
  return (
    <div className="flex items-center gap-1">
      <div className="flex text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={star <= Math.round(displayRating) ? "fill-amber-400 text-amber-400" : "text-stone-300"}
          />
        ))}
      </div>
      <span className="text-xs text-stone-500 font-medium ml-1">
        {displayRating.toFixed(1)} {count > 0 ? `(${count})` : ""}
      </span>
    </div>
  );
}

function SectionHeader({ title, description }) {
  return (
    <div className="mb-6">
      <h2 className="font-serif text-xl text-amber-300">{title}</h2>
      <p className="text-stone-400 text-sm mt-1 max-w-2xl">{description}</p>
    </div>
  );
}

/* --------------------------------- Nav bar ---------------------------------- */

function Nav({ view, setView, cartCount, currentUser, onOpenAuth, onLogout, search, setSearch, newLaunchesCount = 0, onOpenNewLaunches, seasonalTheme, setSeasonalTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const navLink = (label, target) => (
    <button
      onClick={() => { setView(target); setMenuOpen(false); }}
      className={`text-sm tracking-widest uppercase transition-colors ${view === target ? "text-amber-400 font-medium" : "text-stone-300 hover:text-amber-300"}`}
    >
      {label}
    </button>
  );

  return (
    <header className="sticky top-0 z-40 bg-stone-950 border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-20 flex items-center justify-between gap-4">
        <button onClick={() => setView("home")} className="flex flex-col items-start leading-none shrink-0 text-left">
          <span className="font-serif text-2xl md:text-3xl text-amber-300 tracking-wide flex items-center gap-1.5">
            Uma's
            {seasonalTheme === "winter" && <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded-full font-sans tracking-normal">❄️ Winter Edition</span>}
          </span>
          <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-stone-400 mt-0.5">Fashion &amp; Boutique</span>
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {navLink("Home", "home")}
          {navLink("Shop", "shop")}
          {navLink("My Profile", "account")}
          {currentUser?.isAdmin && navLink("Admin Panel", "admin")}
        </nav>

        <div className="flex items-center gap-1 md:gap-3">
          {/* New Product Launch Notification Bell */}
          <button
            onClick={onOpenNewLaunches}
            className="relative p-2 text-stone-300 hover:text-amber-300 transition-colors"
            aria-label="New Product Launches"
            title="New Product Launches"
          >
            <Bell size={19} />
            {newLaunchesCount > 0 && (
              <span className="absolute top-1 right-1 bg-rose-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-bounce shadow-md">
                {newLaunchesCount}
              </span>
            )}
          </button>

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

          {/* Account & User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setAccountOpen((v) => !v)}
              className={`p-2 transition-colors ${view === "account" || view === "admin" ? "text-amber-400 font-bold" : "text-stone-300 hover:text-amber-300"}`}
              aria-label="Account"
              title="Account Menu"
            >
              <User size={19} />
            </button>
            {accountOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-stone-900 border border-amber-500/30 rounded-md shadow-xl py-2 text-sm z-50">
                {currentUser ? (
                  <>
                    <div className="px-4 py-2 text-stone-400 text-xs border-b border-stone-800">
                      Signed in as<br />
                      <span className="text-amber-300 font-medium">{currentUser.name}</span>
                    </div>
                    <button
                      onClick={() => { setView("account"); setAccountOpen(false); }}
                      className="w-full text-left px-4 py-2 text-stone-200 hover:bg-stone-800 flex items-center gap-2"
                    >
                      <User size={14} /> My Profile &amp; Orders
                    </button>
                    {currentUser.isAdmin && (
                      <button
                        onClick={() => { setView("admin"); setAccountOpen(false); }}
                        className="w-full text-left px-4 py-2 text-amber-400 hover:bg-stone-800 flex items-center gap-2 font-medium"
                      >
                        <LayoutDashboard size={14} /> Admin Panel
                      </button>
                    )}
                    <button
                      onClick={() => { onLogout(); setAccountOpen(false); }}
                      className="w-full text-left px-4 py-2 text-rose-400 hover:bg-stone-800 flex items-center gap-2"
                    >
                      <LogOut size={14} /> Log out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { onOpenAuth(); setAccountOpen(false); }}
                    className="w-full text-left px-4 py-2 text-amber-300 hover:bg-stone-800 font-semibold flex items-center gap-2"
                  >
                    <User size={14} /> Login / Sign up
                  </button>
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
          {navLink("My Profile", "account")}
          {currentUser?.isAdmin && navLink("Admin Panel", "admin")}
          {currentUser ? (
            <button
              onClick={() => { onLogout(); setMenuOpen(false); }}
              className="text-left text-sm tracking-widest uppercase text-rose-400 hover:text-rose-300 flex items-center gap-2"
            >
              <LogOut size={16} /> Log out
            </button>
          ) : (
            <button
              onClick={() => { onOpenAuth(); setMenuOpen(false); }}
              className="text-left text-sm tracking-widest uppercase text-amber-300 hover:text-amber-200 flex items-center gap-2 font-bold"
            >
              <User size={16} /> Login / Sign up
            </button>
          )}
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

function SwatchStrip({ onPick, categories = DEFAULT_CATEGORIES, activeCategory = null }) {
  const catList = Array.isArray(categories) && categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  return (
    <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 pt-1 px-4 justify-start md:justify-center scrollbar-hide">
      {catList.map((cat) => {
        const emoji = CATEGORY_EMOJI[cat] || "🛍️";
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onPick(cat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold tracking-wider uppercase transition-all duration-200 shrink-0 shadow-sm group ${isActive
              ? "bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 border-amber-300 font-bold shadow-amber-500/20 scale-105"
              : "bg-stone-900/90 hover:bg-amber-400 hover:text-stone-950 text-stone-200 border-stone-800 hover:border-amber-400 hover:shadow-md"
              }`}
          >
            <span className="text-base leading-none transition-transform group-hover:scale-110">{emoji}</span>
            <span className="whitespace-nowrap group-hover:text-stone-950">{cat}</span>
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
    <button onClick={() => onOpen(product)} className="text-left group flex flex-col h-full bg-white border border-stone-200/80 rounded-md p-3 hover:shadow-md transition-shadow">
      <ProductArt category={product.category} tag={product.tag} status={product.status} imageUrl={product.imageUrl} />
      <div className="pt-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[10px] tracking-widest uppercase text-stone-500">{product.category}</div>
          <div className="font-serif text-base text-stone-900 group-hover:text-amber-700 transition-colors leading-snug font-medium line-clamp-1">{product.name}</div>
          <div className="mt-1">
            <RatingStars rating={product.avgRating || 0} numReviews={product.numReviews || 0} />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-stone-900 font-medium">{inr(product.price)}</span>
          {pct > 0 && <span className="text-stone-400 text-xs line-through">{inr(product.mrp)}</span>}
          {pct > 0 && <span className="text-rose-700 text-xs font-medium">{pct}% off</span>}
        </div>
      </div>
    </button>
  );
}

/* ---------------------------- Promotional Banner Slider ---------------------------- */

function BannerSlider({ banners }) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  if (!banners || banners.length === 0) return null;
  const current = banners[activeIdx];

  return (
    <div className="relative bg-stone-900 border-b border-amber-500/20 text-stone-100 overflow-hidden min-h-[220px] flex items-center">
      {current.image_url ? (
        <img src={getImageUrl(current.image_url)} alt={current.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
      ) : null}
      <div className="relative max-w-5xl mx-auto px-6 py-10 text-center w-full z-10">
        <span className="inline-block bg-amber-500/20 text-amber-300 text-[10px] tracking-[0.2em] uppercase px-3 py-1 rounded-full border border-amber-500/30 mb-3">
          {current.category || "Special Offer"}
        </span>
        <h2 className="font-serif text-2xl md:text-4xl text-amber-300 font-medium mb-2">{current.title}</h2>
        <p className="text-stone-300 text-xs md:text-sm max-w-xl mx-auto">{current.description}</p>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === activeIdx ? "bg-amber-400 w-6" : "bg-stone-600"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Seasonal Themes Configuration ------------------------------- */

const SEASONAL_THEMES = {
  summer: {
    name: "Summer Sun",
    icon: "☀️",
    announcement: "☀️ SUMMER BREEZE BOUTIQUE COLLECTION • FLAT 20% OFF ON ALL SAREES & TOPS",
    heroBadge: "SUMMER SUN COLLECTION 2026",
    heroTitle: "Lightweight Chiffons & Vibrant Summer Prints",
    heroDesc: "Embrace breathable pure cottons, vibrant floral chiffons, and breezy designer kurtis crafted for summer elegance.",
    bgClass: "bg-amber-950 text-amber-50",
    barClass: "bg-gradient-to-r from-amber-800 via-orange-700 to-yellow-800 text-yellow-100 border-yellow-500/30",
    heroClass: "bg-gradient-to-b from-amber-950 via-orange-950 to-stone-900 border-yellow-500/20",
    badgeClass: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    btnPrimary: "bg-yellow-400 hover:bg-yellow-300 text-amber-950 shadow-yellow-500/20",
    btnSecondary: "bg-amber-900 hover:bg-amber-800 text-yellow-200 border-yellow-500/30"
  },
  winter: {
    name: "Winter Snow",
    icon: "❄️",
    announcement: "❄️ WINTER BOUTIQUE FESTIVAL LAUNCH • FLAT 20% OFF ON ALL SAREES & TOPS",
    heroBadge: "SPECIAL WINTER COLLECTION 2026",
    heroTitle: "Winter Grace & Timeless Silk Warmth",
    heroDesc: "Discover our winter boutique curation featuring cozy Kanjeevaram silks, royal embroidered lehengas, organza sarees, and warm designer shawls.",
    bgClass: "bg-slate-950 text-slate-100",
    barClass: "bg-gradient-to-r from-sky-950 via-blue-900 to-slate-950 text-sky-200 border-sky-500/30",
    heroClass: "bg-gradient-to-b from-slate-950 via-sky-950 to-slate-900 border-sky-500/20",
    badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    btnPrimary: "bg-sky-400 hover:bg-sky-300 text-slate-950 shadow-sky-500/20",
    btnSecondary: "bg-slate-900 hover:bg-slate-800 text-sky-300 border-sky-500/30"
  },
  rainy: {
    name: "Monsoon Rain",
    icon: "🌧️",
    announcement: "🌧️ MONSOON ELEGANCE BOUTIQUE EDITION • FLAT 20% OFF ON ALL SAREES & TOPS",
    heroBadge: "MONSOON EDITION 2026",
    heroTitle: "Rain-Resistant Silks & Deep Emerald Glamour",
    heroDesc: "Experience rich monsoon tones, deep emerald georgette sarees, and water-repellent luxury party wear.",
    bgClass: "bg-teal-950 text-teal-50",
    barClass: "bg-gradient-to-r from-teal-900 via-emerald-800 to-cyan-900 text-teal-200 border-teal-500/30",
    heroClass: "bg-gradient-to-b from-teal-950 via-cyan-950 to-slate-950 border-teal-500/20",
    badgeClass: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    btnPrimary: "bg-teal-400 hover:bg-teal-300 text-teal-950 shadow-teal-500/20",
    btnSecondary: "bg-teal-900 hover:bg-teal-800 text-teal-200 border-teal-500/30"
  },
  spring: {
    name: "Spring Blossom",
    icon: "🌸",
    announcement: "🌸 SPRING BLOSSOM FESTIVAL SPECIAL • FLAT 20% OFF ON ALL SAREES & TOPS",
    heroBadge: "SPRING FESTIVAL EDITION 2026",
    heroTitle: "Floral Pastel Grace & Celebratory Silk",
    heroDesc: "Celebrate fresh beginnings with soft pastel organzas, floral embroidery, and light golden lehengas.",
    bgClass: "bg-rose-950 text-rose-50",
    barClass: "bg-gradient-to-r from-rose-900 via-pink-800 to-purple-900 text-pink-200 border-pink-500/30",
    heroClass: "bg-gradient-to-b from-rose-950 via-pink-950 to-stone-950 border-rose-500/20",
    badgeClass: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    btnPrimary: "bg-pink-400 hover:bg-pink-300 text-rose-950 shadow-pink-500/20",
    btnSecondary: "bg-rose-900 hover:bg-rose-800 text-pink-200 border-rose-500/30"
  }
};

/* ----------------------------------- Home view ---------------------------------- */

function HomeView({ products, banners, promoSettings, setView, setCategoryFilter, openProduct, seasonalTheme, categories }) {
  const featured = useMemo(() => {
    // Show available products, prioritizing tagged products while including all available items
    const available = products.filter((p) => p.status !== "Out of Stock" && p.status !== "Unavailable" && p.stock > 0);
    const tagged = available.filter((p) => p.tag && p.tag !== "Available");
    if (tagged.length >= 4) return tagged.slice(0, 8);
    return available.length > 0 ? available.slice(0, 8) : products.slice(0, 8);
  }, [products]);

  const activeTheme = SEASONAL_THEMES[seasonalTheme] || SEASONAL_THEMES.summer;

  return (
    <div className={`transition-colors duration-500 ${activeTheme.bgClass}`}>
      {/* Top Announcement Bar - Pure clean promo banner without coupon code string */}
      <div className={`text-xs font-semibold py-2.5 px-4 text-center tracking-wider uppercase flex items-center justify-center gap-2 border-b transition-colors duration-500 ${activeTheme.barClass}`}>
        <span>{activeTheme.announcement}</span>
      </div>

      {banners && banners.length > 0 && <BannerSlider banners={banners} />}

      {/* High-Impact Boutique Hero Banner */}
      <section className={`relative overflow-hidden py-16 md:py-24 px-6 border-b transition-colors duration-500 ${activeTheme.heroClass}`}>
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-amber-500/10" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <span className={`inline-block text-xs tracking-[0.4em] uppercase px-4 py-1.5 rounded-full border mb-6 ${activeTheme.badgeClass}`}>
            {activeTheme.heroBadge}
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl text-stone-50 font-bold leading-tight max-w-4xl mx-auto">
            {activeTheme.heroTitle}
          </h1>
          <p className="text-stone-300 max-w-2xl mx-auto mt-6 text-sm sm:text-base md:text-lg font-light leading-relaxed">
            {activeTheme.heroDesc}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => { setCategoryFilter("Sarees"); setView("shop"); }}
              className={`font-bold tracking-wide px-8 py-3.5 rounded-full shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2 ${activeTheme.btnPrimary}`}
            >
              Shop Sarees <ArrowRight size={18} />
            </button>
            <button
              onClick={() => { setCategoryFilter(null); setView("shop"); }}
              className={`border font-semibold tracking-wide px-8 py-3.5 rounded-full transition-all ${activeTheme.btnSecondary}`}
            >
              Shop All Collections
            </button>
          </div>
        </div>
      </section>

      {/* Category Swatch Bar */}
      <section className="bg-stone-950 py-6 border-b border-stone-800">
        <SwatchStrip categories={categories} onPick={(cat) => { setCategoryFilter(cat); setView("shop"); }} />
      </section>

      {/* Ajio Category Spotlight Cards */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-serif text-2xl md:text-4xl text-amber-300 font-bold">Category Spotlight</h2>
            <p className="text-stone-400 text-xs md:text-sm mt-1">Explore top trending fashion categories handpicked for you</p>
          </div>
          <button onClick={() => { setCategoryFilter(null); setView("shop"); }} className="text-xs tracking-widest uppercase text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold">
            View All Categories <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { name: "Sarees", catKey: "Sarees", tag: "Silk & Georgette", bg: "from-rose-900 to-amber-950" },
            { name: "Tops", catKey: "Tops", tag: "Designer Fits", bg: "from-amber-950 to-stone-900" },
            { name: "Kurtis", catKey: "Kurtis", tag: "Casual & Workwear", bg: "from-purple-950 to-stone-900" },
            { name: "Bridal & Lehengas", catKey: "Lehengas", tag: "Royal Ethnic", bg: "from-rose-950 to-purple-900" },
          ].map((cat) => (
            <div
              key={cat.name}
              onClick={() => { setCategoryFilter(cat.catKey); setView("shop"); }}
              className={`relative rounded-2xl p-6 bg-gradient-to-br ${cat.bg} border border-amber-500/30 hover:border-amber-400 cursor-pointer overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 text-left min-h-[160px] flex flex-col justify-end`}
            >
              <div className="absolute top-4 right-4 text-amber-400/40 group-hover:text-amber-300 transition-colors">
                <ShoppingBag size={28} />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-amber-300/80 font-semibold">{cat.tag}</span>
              <h3 className="font-serif text-xl md:text-2xl text-stone-100 font-bold mt-1 group-hover:text-amber-300 transition-colors">{cat.name}</h3>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
                <span>Explore Now</span>
                <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Collection Grid */}
      <section className="bg-stone-900 py-16 px-6 border-t border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-serif text-2xl md:text-4xl text-amber-300 font-bold">Trending & Bestsellers</h2>
              <p className="text-stone-400 text-xs md:text-sm mt-1">Our most loved saree and apparel collections</p>
            </div>
            <button onClick={() => setView("shop")} className="text-xs tracking-widest uppercase text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold">
              View Collection <ChevronRight size={16} />
            </button>
          </div>
          {featured.length === 0 ? (
            <div className="text-stone-400 text-sm py-12 text-center border border-dashed border-stone-800 rounded-2xl">No items available currently.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} onOpen={openProduct} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-stone-950 border-t border-stone-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center px-6">
          {[
            ["🚀 Fast & Safe Delivery", "Across all locations with real-time tracking"],
            ["✨ 100% Quality Assured", "Handcrafted with premium boutique fabric"],
            ["💳 Instant Secure Checkout", "Razorpay UPI, Credit Card & Netbanking"],
          ].map(([t, s]) => (
            <div key={t} className="p-4 bg-stone-900/60 rounded-xl border border-stone-800">
              <div className="text-amber-300 font-semibold text-sm mb-1">{t}</div>
              <div className="text-stone-400 text-xs">{s}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ----------------------------------- Shop view ---------------------------------- */

function ShopView({ products, categoryFilter, setCategoryFilter, search, openProduct, categories = DEFAULT_CATEGORIES }) {
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
          {(categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES).map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-4 py-1.5 rounded-full text-xs tracking-widest uppercase border transition-all ${categoryFilter === c ? "bg-stone-950 text-amber-300 border-stone-950 font-bold" : "border-stone-300 text-stone-600 hover:border-amber-500"}`}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={openProduct} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------- Size Guide Modal (CM / Inches) -------------------------- */

function SizeGuideModal({ onClose, activeSize }) {
  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 relative border border-stone-200 shadow-2xl my-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 bg-stone-100 p-1.5 rounded-full"><X size={18} /></button>

        <div className="flex items-center gap-2 mb-1">
          <div className="bg-amber-100 p-2 rounded-lg text-amber-800"><Ruler size={20} /></div>
          <div>
            <h2 className="font-serif text-2xl text-stone-900 font-bold">Standard Size Guide &amp; CM Chart</h2>
            <p className="text-stone-500 text-xs">All measurements in <b>Centimeters (cm)</b> and Inches (in) for perfect boutique fitting.</p>
          </div>
        </div>

        {/* Size Chart Table */}
        <div className="mt-5 overflow-x-auto border border-stone-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-900 text-amber-300 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Size</th>
                <th className="p-3">Bust / Chest (cm)</th>
                <th className="p-3">Waist (cm)</th>
                <th className="p-3">Hip (cm)</th>
                <th className="p-3">Shoulder</th>
                <th className="p-3">Length</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              {Object.entries(SIZE_GUIDE_CM).map(([sz, m]) => (
                <tr key={sz} className={`hover:bg-amber-50/50 transition-colors ${activeSize === sz ? "bg-amber-100/60 font-bold text-amber-950" : ""}`}>
                  <td className="p-3 font-bold flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-900 border border-stone-300">{sz}</span>
                    {activeSize === sz && <span className="text-[10px] bg-amber-500 text-stone-950 px-1.5 py-0.5 rounded font-bold">Selected</span>}
                  </td>
                  <td className="p-3 font-mono">{m.bust}</td>
                  <td className="p-3 font-mono">{m.waist}</td>
                  <td className="p-3 font-mono">{m.hip}</td>
                  <td className="p-3 font-mono">{m.shoulder}</td>
                  <td className="p-3 font-mono text-stone-600">{m.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* How to Measure Instructions */}
        <div className="mt-6 bg-stone-50 border border-stone-200 rounded-xl p-4">
          <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-600" /> How to Measure in Centimeters (cm)
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 text-xs text-stone-600">
            <div>
              <span className="font-bold text-stone-900">1. Bust / Chest:</span> Measure around the fullest part of your bust in cm, keeping tape comfortably loose.
            </div>
            <div>
              <span className="font-bold text-stone-900">2. Natural Waist:</span> Measure around the narrowest part of your waistline above the navel in cm.
            </div>
            <div>
              <span className="font-bold text-stone-900">3. Hips:</span> Measure around the fullest part of your hips/seat area in cm.
            </div>
            <div>
              <span className="font-bold text-stone-900">4. Shoulders:</span> Measure horizontally across the back from shoulder point to shoulder point.
            </div>
          </div>
        </div>

        <div className="mt-5 text-center">
          <button onClick={onClose} className="bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-semibold uppercase tracking-wider px-6 py-2.5 rounded-full transition-colors">
            Got it, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- WhatsApp AI & Human Support Widget ---------------------- */

function WhatsAppSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ai"); // 'ai' or 'human'
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Hello! Welcome to Uma's Fashion Boutique. I am your AI assistant. How can I help you today?" }
  ]);
  const [inputMsg, setInputMsg] = useState("");

  const FAQS = [
    { q: "📏 Size Guide & CM Measurements", answer: "Our standard sizes in Centimeters (cm):\n- S: Bust 86-89 cm, Waist 71-74 cm\n- M: Bust 91-94 cm, Waist 76-79 cm\n- L: Bust 97-102 cm, Waist 81-86 cm\n- XL: Bust 104-109 cm, Waist 89-94 cm\nYou can click 'Size Guide (cm)' on any product page for a full breakdown!" },
    { q: "🚚 Delivery Time & Express Shipping", answer: "All orders receive 100% FREE Express Shipping across India! Standard dispatch takes 1-2 business days, and delivery takes 3-5 business days." },
    { q: "🔄 Return & Exchange Policy", answer: "We offer hassle-free returns within 7 days of delivery for unworn, tagged boutique items. Simply go to Account → My Orders → Request Return." },
    { q: "💳 Payment Methods Accepted", answer: "We accept Razorpay (UPI, Credit/Debit Cards, NetBanking), Cash on Delivery (COD), and Bank Transfer." },
  ];

  const handleSendMessage = (textToSend) => {
    const msg = textToSend || inputMsg.trim();
    if (!msg) return;

    const userMsg = { sender: "user", text: msg };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg("");

    // Simulate AI response logic
    setTimeout(() => {
      let botResponse = "Thank you for reaching out! You can also chat directly with our human expert on WhatsApp at +91 8489943146 for personalized assistance.";
      const lower = msg.toLowerCase();
      if (lower.includes("size") || lower.includes("cm") || lower.includes("fit") || lower.includes("measurement")) {
        botResponse = "📏 For Size Measurements in CM:\n• S = Bust 86-89cm, Waist 71-74cm\n• M = Bust 91-94cm, Waist 76-79cm\n• L = Bust 97-102cm, Waist 81-86cm\n• XL = Bust 104-109cm, Waist 89-94cm\nClick 'Size Guide (cm)' on any item to view full chart!";
      } else if (lower.includes("ship") || lower.includes("deliver") || lower.includes("time") || lower.includes("track")) {
        botResponse = "🚚 Free Express Shipping on all orders! Orders dispatch in 1-2 days and arrive in 3-5 business days. Track your order under My Orders!";
      } else if (lower.includes("return") || lower.includes("refund") || lower.includes("exchange")) {
        botResponse = "🔄 Easy 7-day returns! Request a return from your Account order panel within 7 days of delivery.";
      } else if (lower.includes("contact") || lower.includes("call") || lower.includes("whatsapp") || lower.includes("human") || lower.includes("agent")) {
        botResponse = "💬 You can speak directly to our human fashion consultant on WhatsApp at +91 8489943146!";
      }

      setChatMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
    }, 600);
  };

  const openWhatsAppDirect = (customMsg) => {
    const text = encodeURIComponent(customMsg || `Hi Uma's Fashion, I would like to inquire about products/customization.`);
    window.open(`https://wa.me/91${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* WhatsApp Chat Window */}
      {isOpen && (
        <div className="mb-4 bg-white border border-stone-200 rounded-2xl shadow-2xl w-80 sm:w-96 overflow-hidden flex flex-col h-[460px] animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-emerald-600 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white text-emerald-700 font-bold flex items-center justify-center text-sm shadow">
                  🥻
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">Uma's Fashion Boutique</h4>
                <div className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span>Online Support</span> • <span className="font-medium">+91 8489943146</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-emerald-100 hover:text-white p-1 rounded-full"><X size={18} /></button>
          </div>

          {/* Assistant Selector Tabs */}
          <div className="flex border-b border-stone-200 bg-stone-50 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors ${activeTab === "ai" ? "bg-white text-emerald-700 border-b-2 border-emerald-600 font-bold" : "text-stone-600 hover:text-stone-900"}`}
            >
              <Bot size={15} /> AI Assistant
            </button>
            <button
              onClick={() => setActiveTab("human")}
              className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition-colors ${activeTab === "human" ? "bg-white text-emerald-700 border-b-2 border-emerald-600 font-bold" : "text-stone-600 hover:text-stone-900"}`}
            >
              <Phone size={14} /> Human Assistant
            </button>
          </div>

          {/* AI Assistant Mode */}
          {activeTab === "ai" && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden bg-stone-50/50">
              {/* Chat Message List */}
              <div className="p-3 overflow-y-auto space-y-2.5 flex-1 text-xs">
                {chatMessages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[82%] rounded-2xl px-3.5 py-2 whitespace-pre-line shadow-xs ${m.sender === "user" ? "bg-emerald-600 text-white rounded-br-none" : "bg-white border border-stone-200 text-stone-800 rounded-bl-none"}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick AI FAQ Buttons */}
              <div className="p-2 border-t border-stone-200 bg-white space-y-1">
                <div className="text-[10px] text-stone-500 font-semibold px-1 uppercase tracking-wider">Quick AI Inquiries:</div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                  {FAQS.map((faq, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(faq.q)}
                      className="whitespace-nowrap bg-stone-100 hover:bg-emerald-50 text-stone-800 hover:text-emerald-800 border border-stone-200 px-2.5 py-1 rounded-full text-[11px] transition-colors"
                    >
                      {faq.q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-2 bg-white border-t border-stone-200 flex gap-2">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Ask AI about sizing, delivery..."
                  className="flex-1 border border-stone-300 rounded-full px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                />
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-full transition-colors">
                  <Send size={14} />
                </button>
              </form>
            </div>
          )}

          {/* Human Assistant Mode */}
          {activeTab === "human" && (
            <div className="flex-1 p-5 flex flex-col justify-between bg-stone-50 text-center">
              <div className="space-y-4 my-auto">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <MessageSquare size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Direct WhatsApp Support</h4>
                  <p className="text-stone-500 text-xs mt-1">Connect directly with our human boutique specialist for custom orders, measurement help, or payment queries.</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 font-medium">
                  Official Support: <span className="font-bold text-emerald-800">+91 8489943146</span>
                </div>
              </div>

              <button
                onClick={() => openWhatsAppDirect()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-full text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} /> Open Chat on WhatsApp (+91 8489943146)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-full shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 group border-2 border-white"
        title="WhatsApp AI &amp; Human Support (+91 8489943146)"
      >
        <div className="relative">
          <MessageSquare size={24} className="fill-white text-emerald-600" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border-2 border-emerald-600 rounded-full animate-ping"></span>
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-xs font-bold pr-1">
          WhatsApp Support (+91 8489943146)
        </span>
      </button>
    </div>
  );
}

/* ------------------------------- Product detail view ------------------------------ */

function ProductDetailView({ product, addToCart, setView, currentUser }) {
  const [size, setSize] = useState(product.sizes && product.sizes[0] ? product.sizes[0] : "Free Size");
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const pct = discountPct(product.price, product.mrp);
  const delivery = calculateEstimatedDelivery();
  const isOutOfStock = product.status === "Out of Stock" || product.stock <= 0 || product.status === "Unavailable";

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE}/reviews/product/${product.id}`);
      const data = await res.json();
      if (res.ok) setReviews(data.reviews || []);
    } catch (e) {
      console.error("Error fetching reviews:", e);
    }
  };

  const displayReviews = useMemo(() => {
    if (reviews && reviews.length > 0) return reviews;
    return [
      {
        _id: "default-1",
        user_name: "Priya Sharma",
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        rating: 5,
        comment: "Absolutely stunning quality fabric! The stitching and finish exceeded my expectations. Will definitely order again from Uma's."
      },
      {
        _id: "default-2",
        user_name: "Ananya R.",
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        rating: 5,
        comment: "Super fast delivery and elegant boutique packaging. The color is exactly as shown in the picture!"
      }
    ];
  }, [reviews]);

  return (
    <div className="bg-stone-50 min-h-[70vh] py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => setView("shop")} className="text-xs tracking-widest uppercase text-stone-500 hover:text-amber-700 mb-6 inline-block">
          ← Back to Shop
        </button>
        <div className="grid md:grid-cols-2 gap-10">
          <ProductArt category={product.category} tag={product.tag} status={product.status} imageUrl={product.imageUrl} size="h-[420px]" />
          <div>
            <div className="text-[11px] tracking-widest uppercase text-stone-500 mb-1">{product.category}</div>
            <h1 className="font-serif text-3xl text-stone-900 mb-2">{product.name}</h1>
            <div className="mb-4">
              <RatingStars rating={product.avgRating || 0} numReviews={product.numReviews || 0} size={16} />
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl text-stone-900 font-medium">{inr(product.price)}</span>
              {pct > 0 && <span className="text-stone-400 line-through">{inr(product.mrp)}</span>}
              {pct > 0 && <span className="text-rose-700 text-sm font-medium">{pct}% off</span>}
            </div>

            <p className="text-stone-600 text-sm leading-relaxed mb-6">{product.desc || product.description}</p>

            {/* Estimated Delivery Information Box */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-4 mb-6">
              <div className="flex items-center gap-2 text-amber-900 font-medium text-xs uppercase tracking-wider mb-1">
                <Truck size={16} className="text-amber-700" /> Estimated Delivery Information
              </div>
              <div className="text-stone-800 text-sm font-medium">
                Expected by <span className="text-amber-800 font-bold">{delivery.weekday}, {delivery.dateStr}</span>
              </div>
              <div className="text-stone-500 text-xs mt-0.5">Standard Dispatch Time: {delivery.timeframe}</div>
            </div>

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs tracking-widest uppercase text-stone-500">Size</div>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-amber-800 hover:text-amber-600 text-xs font-semibold underline flex items-center gap-1 transition-colors"
                  >
                    <Ruler size={13} /> Size Guide (cm / inches)
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`px-4 py-2 rounded-md border text-sm ${size === s ? "bg-stone-950 text-amber-300 border-stone-950 font-bold shadow-xs" : "border-stone-300 text-stone-700 hover:border-amber-500 bg-white"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* CM Measurement Info Box for Selected Size */}
                {SIZE_GUIDE_CM[size] && (
                  <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-stone-800 animate-in fade-in duration-150">
                    <div className="font-bold text-amber-900 flex items-center justify-between mb-1">
                      <span>📏 Measurements for Size <b>{size}</b> in CM:</span>
                      <span className="text-[10px] bg-amber-200 text-amber-950 font-bold px-2 py-0.5 rounded">Centimeters</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] text-stone-700">
                      <div><span className="text-stone-500">Bust:</span> {SIZE_GUIDE_CM[size].bust}</div>
                      <div><span className="text-stone-500">Waist:</span> {SIZE_GUIDE_CM[size].waist}</div>
                      <div><span className="text-stone-500">Hip:</span> {SIZE_GUIDE_CM[size].hip}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mb-7">
              <div className="text-xs tracking-widest uppercase text-stone-500 mb-2">
                Quantity {product.stock <= 5 && product.stock > 0 ? <span className="text-rose-600 text-xs uppercase font-bold ml-2">Only {product.stock} Left!</span> : null}
              </div>
              <div className="flex items-center gap-3 border border-stone-300 rounded-md w-fit px-2 bg-white">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2 text-stone-600" disabled={isOutOfStock}><Minus size={14} /></button>
                <span className="w-6 text-center text-sm font-medium">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))} className="p-2 text-stone-600" disabled={isOutOfStock}><Plus size={14} /></button>
              </div>
            </div>

            {isOutOfStock ? (
              <div className="flex flex-col gap-3">
                <div className="bg-rose-100 text-rose-800 text-xs font-semibold px-4 py-2 rounded-md w-fit">
                  Currently Out of Stock / Unavailable
                </div>
                <button
                  onClick={() => setShowNotifyModal(true)}
                  className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-amber-300 font-medium tracking-wide px-8 py-3 rounded-full transition-colors flex items-center justify-center gap-2"
                >
                  <Bell size={16} /> Notify Me When Available
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <button
                  onClick={() => addToCart(product, size, qty)}
                  className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold tracking-wide px-8 py-3 rounded-full transition-colors shadow-sm text-center flex-1"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    const msg = encodeURIComponent(`Hi Uma's Fashion, I am inquiring about product: ${product.name} (Price: ₹${product.price}, Size: ${size}). Could you please help me with more details?`);
                    window.open(`https://wa.me/91${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-full transition-colors shadow-sm flex items-center justify-center gap-2 text-center text-xs"
                  title="Inquire on WhatsApp (+91 8489943146)"
                >
                  <MessageSquare size={16} /> Inquire on WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-16 border-t border-stone-200 pt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl text-stone-900">Customer Ratings &amp; Verified Reviews</h2>
            {currentUser && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="bg-stone-900 text-amber-300 text-xs uppercase tracking-wider px-4 py-2 rounded-full hover:bg-stone-800"
              >
                Write a Review
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {displayReviews.map((rev) => (
              <div key={rev._id} className="bg-white border border-stone-200 rounded-md p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-stone-900 text-sm flex items-center gap-1.5">
                    {rev.user_name}
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Verified Buyer</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400">{formatDateTime(rev.created_at)}</span>
                    {currentUser && rev.user_id && rev.user_id === currentUser._id && (
                      <button
                        onClick={() => { setEditingReview(rev); setShowReviewModal(true); }}
                        className="text-xs text-amber-700 hover:text-amber-500 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                        title="Edit your review"
                      >
                        <Edit2 size={11} /> Edit
                      </button>
                    )}
                  </div>
                </div>
                <div className="mb-2">
                  <RatingStars rating={rev.rating} size={14} />
                </div>
                <p className="text-stone-600 text-sm leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showNotifyModal && <StockNotifyModal product={product} onClose={() => setShowNotifyModal(false)} />}
      {showReviewModal && (
        <WriteReviewModal
          product={product}
          editingReview={editingReview}
          onClose={() => { setShowReviewModal(false); setEditingReview(null); }}
          onSubmitted={fetchReviews}
        />
      )}
    </div>
  );
}

function StockNotifyModal({ product, onClose }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email && !phone) return alert("Please enter email or phone number.");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/notifications/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, email, phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(data.message);
      } else {
        alert(data.error || "Failed to subscribe.");
      }
    } catch (err) {
      alert("Error subscribing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 flex items-center justify-center p-4">
      <div className="bg-white rounded-md max-w-md w-full p-6 relative border border-stone-200 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"><X size={18} /></button>
        <h2 className="font-serif text-xl text-stone-900 mb-2">Back in Stock Notification</h2>
        <p className="text-stone-500 text-xs mb-4">We will notify you immediately when <b>{product.name}</b> is restocked.</p>

        {msg ? (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-md text-sm border border-emerald-200 text-center">
            {msg}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">Phone Number (SMS)</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10 digit phone number" className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-amber-500" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium py-2.5 rounded-full text-sm">
              {loading ? "Submitting…" : "Notify Me"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* -------------------------- Write Review Modal -------------------------- */

function WriteReviewModal({ product, editingReview, onClose, onSubmitted }) {
  const [rating, setRating] = useState(editingReview?.rating || 5);
  const [comment, setComment] = useState(editingReview?.comment || "");
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(editingReview?._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("umas:token");
    const url = isEdit ? `${API_BASE}/reviews/${editingReview._id}` : `${API_BASE}/reviews`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(isEdit ? { rating, comment } : { productId: product?.id, rating, comment }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(isEdit ? "Review updated successfully!" : "Thank you! Your review has been submitted.");
        if (onSubmitted) onSubmitted();
        onClose();
      } else {
        alert(data.error || "Failed to save review.");
      }
    } catch (err) {
      alert("Error saving review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 flex items-center justify-center p-4">
      <div className="bg-white rounded-md max-w-md w-full p-6 relative border border-stone-200 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"><X size={18} /></button>
        <h2 className="font-serif text-xl text-stone-900 mb-1">{isEdit ? "Edit Your Review" : "Write a Review"}</h2>
        <p className="text-stone-500 text-xs mb-4">{isEdit ? "Update your rating & comments below." : `Share your feedback for ${product?.name || "this product"}`}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button type="button" key={star} onClick={() => setRating(star)} className="text-2xl focus:outline-none">
                  <Star className={star <= rating ? "fill-amber-400 text-amber-400" : "text-stone-300"} size={24} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-bold mb-1">Review Comments</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the fabric, fit, and overall quality..."
              className="w-full bg-white text-stone-900 border border-stone-300 rounded-md p-3 text-sm focus:outline-none focus:border-amber-500 placeholder:text-stone-400 shadow-sm"
              style={{ color: "#1c1917", backgroundColor: "#ffffff" }}
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-2.5 rounded-full text-sm shadow-md transition-all">
            {loading ? "Saving…" : (isEdit ? "Update Review" : "Submit Review")}
          </button>
        </form>
      </div>
    </div>
  );
}

/* -------------------------- Admin Product Form Modal -------------------------- */

function ProductFormModal({ product, onClose, onSave, categories = DEFAULT_CATEGORIES }) {
  const [form, setForm] = useState({
    id: product?.id || null,
    name: product?.name || "",
    category: product?.category || (categories[0] || "Sarees"),
    description: product?.description || product?.desc || "",
    price: product?.price || 1999,
    mrp: product?.mrp || 2999,
    stock: product?.stock !== undefined ? product.stock : 50,
    lowStockThreshold: product?.lowStockThreshold || 5,
    status: product?.status || "Available",
    tag: product?.tag || "",
    avgRating: product?.avgRating !== undefined ? product.avgRating : 4.5,
    numReviews: product?.numReviews !== undefined ? product.numReviews : 12,
    sizes: product?.sizes && product.sizes.length > 0 ? product.sizes : ["Free Size"],
    sizePrices: product?.sizePrices || product?.size_prices || {},
    imageUrl: product?.imageUrl || "",
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cropFile, setCropFile] = useState(null);

  const ALL_SIZES = ["Free Size", "XS", "S", "M", "L", "XL", "XXL"];

  const handleSizeToggle = (sz) => {
    setForm((prev) => {
      const exists = prev.sizes.includes(sz);
      const newSizes = exists ? prev.sizes.filter((s) => s !== sz) : [...prev.sizes, sz];
      const newPrices = { ...prev.sizePrices };
      if (exists) {
        delete newPrices[sz];
      } else {
        newPrices[sz] = prev.price;
      }
      return { ...prev, sizes: newSizes, sizePrices: newPrices };
    });
  };

  const handleSizePriceChange = (sz, val) => {
    const num = parseFloat(val) || 0;
    setForm((prev) => ({
      ...prev,
      sizePrices: {
        ...prev.sizePrices,
        [sz]: num,
      },
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropFile(file);
    }
  };

  const handleCropComplete = async (dataUrl, blob) => {
    setCropFile(null);
    setUploading(true);
    const token = localStorage.getItem("umas:token");
    const formData = new FormData();
    formData.append("image", blob || dataUrl, "product-image.jpg");

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setForm((prev) => ({ ...prev, imageUrl: data.imageUrl }));
      } else {
        alert(data.error || "Failed to upload image.");
      }
    } catch (err) {
      alert("Error uploading image file.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.mrp) {
      return alert("Product Name, Base Price, and MRP are required.");
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[95] bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      {cropFile && (
        <ImageCropModal
          imageSrc={cropFile}
          onCropComplete={handleCropComplete}
          onClose={() => setCropFile(null)}
          title="Crop & Resize Product Image"
        />
      )}
      <div className="bg-white border border-stone-200 text-stone-900 rounded-2xl max-w-2xl w-full p-6 relative shadow-2xl my-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"><X size={20} /></button>
        <h2 className="font-serif text-2xl text-stone-900 font-bold mb-1">{form.id ? "Edit Product" : "Add New Product"}</h2>
        <p className="text-stone-500 text-xs mb-6">Fill in the product details to publish to the boutique store catalog.</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block uppercase tracking-wider text-stone-700 mb-1 font-bold">Product Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Kanjeevaram Soft Silk Saree"
                className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-stone-700 mb-1 font-bold">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-500"
              >
                {(categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block uppercase tracking-wider text-stone-700 mb-1 font-bold">Product Tag</label>
              <select
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-500"
              >
                <option value="">None</option>
                <option value="Bestseller">Bestseller</option>
                <option value="Sale">Sale</option>
                <option value="New Arrival">New Arrival</option>
                <option value="Handloom Special">Handloom Special</option>
                <option value="Bridal Collection">Bridal Collection</option>
              </select>
            </div>

            <div>
              <label className="block uppercase tracking-wider text-stone-700 mb-1 font-bold">Base Selling Price (₹) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-stone-700 mb-1 font-bold">MRP Original (₹) *</label>
              <input
                type="number"
                value={form.mrp}
                onChange={(e) => setForm({ ...form, mrp: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-stone-700 mb-1 font-bold">Stock Quantity</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-stone-700 mb-1 font-bold">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-500"
              >
                <option value="Available">Available</option>
                <option value="Coming Soon">Coming Soon</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>

            <div>
              <label className="block uppercase tracking-wider text-stone-700 mb-1 font-bold">Rating (1.0 to 5.0 Stars) ⭐</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={form.avgRating}
                onChange={(e) => setForm({ ...form, avgRating: parseFloat(e.target.value) || 4.5 })}
                placeholder="e.g. 4.5"
                className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-stone-700 mb-1 font-bold">Total Reviews Count</label>
              <input
                type="number"
                min="0"
                value={form.numReviews}
                onChange={(e) => setForm({ ...form, numReviews: parseInt(e.target.value) || 0 })}
                placeholder="e.g. 12"
                className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase tracking-wider text-stone-700 mb-1 font-bold">Available Sizes</label>
            <div className="flex gap-2 flex-wrap bg-stone-50 p-3 rounded-lg border border-stone-200">
              {ALL_SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => handleSizeToggle(sz)}
                  className={`px-3 py-1.5 rounded-md font-medium text-xs border transition-all ${form.sizes.includes(sz) ? "bg-amber-500 text-stone-950 border-amber-500 font-bold" : "bg-white text-stone-700 border-stone-300 hover:border-stone-400"}`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Size-Based Custom Pricing Matrix */}
          {form.sizes && form.sizes.length > 0 && (
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
              <label className="block uppercase tracking-wider text-amber-900 mb-2 font-bold flex items-center justify-between">
                <span>Custom Price Rate per Size (M, L, XL, etc.)</span>
                <span className="text-[10px] text-stone-500 font-normal">Optional: Set specific rates per size</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {form.sizes.map((sz) => (
                  <div key={sz} className="bg-white p-2.5 rounded-lg border border-stone-200 shadow-xs">
                    <span className="text-amber-800 font-bold block mb-1">Size {sz}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-stone-500 text-xs">₹</span>
                      <input
                        type="number"
                        value={form.sizePrices?.[sz] !== undefined ? form.sizePrices[sz] : form.price}
                        onChange={(e) => handleSizePriceChange(sz, e.target.value)}
                        placeholder={form.price}
                        className="w-full bg-white border border-stone-300 rounded px-2 py-1 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block uppercase tracking-wider text-stone-700 mb-1 font-bold">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed product fabric, weave, care instructions..."
              className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider text-stone-700 mb-1 font-bold">Product Image (Crop & Upload)</label>
            <div className="flex gap-3 items-center">
              {form.imageUrl ? (
                <div className="relative w-16 h-20 rounded-lg overflow-hidden border border-stone-300 bg-stone-100 flex-shrink-0">
                  <img src={getImageUrl(form.imageUrl)} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : null}
              <label className="cursor-pointer bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium px-4 py-2.5 rounded-lg border border-stone-300 transition-colors inline-flex items-center gap-2">
                <Upload size={16} />
                <span>{uploading ? "Uploading..." : form.imageUrl ? "Crop & Change Image" : "Choose & Crop Image"}</span>
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-stone-200">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors">Cancel</button>
            <button type="submit" disabled={saving || uploading} className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-6 py-2.5 rounded-lg transition-colors shadow-sm">
              {saving ? "Saving Product..." : form.id ? "Update Product" : "Publish Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ----------------------------------- Cart view ----------------------------------- */

function CartView({ cart, updateQty, removeItem, setView, subtotal }) {
  return (
    <div className="bg-stone-50 min-h-[70vh] py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="font-serif text-3xl text-stone-900">Your Cart</h1>
          <button
            onClick={() => setView("shop")}
            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-amber-500 text-stone-950 font-semibold uppercase tracking-widest shadow-sm hover:bg-amber-400 transition"
          >
            Back to Shopping
          </button>
        </div>
        {cart.length === 0 ? (
          <div className="text-center py-20 text-stone-500">
            <ShoppingBag className="mx-auto mb-3" size={32} />
            Your cart is empty.
            <div className="mt-4">
              <button
                onClick={() => setView("shop")}
                className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-amber-500 text-stone-950 font-semibold uppercase tracking-widest shadow-sm hover:bg-amber-400 transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-10">
            <div className="md:col-span-2 flex flex-col gap-5">
              {cart.map((item) => (
                <div key={item.cartItemId} className="flex gap-4 bg-white border border-stone-200 rounded-md p-4">
                  <div className="w-24 shrink-0">
                    <ProductArt category={item.category} imageUrl={item.imageUrl} size="h-24" />
                  </div>
                  <div className="flex-1">
                    <div className="font-serif text-lg text-stone-900">{item.name}</div>
                    <div className="text-xs text-stone-500 mb-2">Size: {item.size}</div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-stone-300 rounded-md">
                        <button onClick={() => updateQty(item.cartItemId, Math.max(1, item.quantity - 1))} className="p-1.5 text-stone-600"><Minus size={12} /></button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQty(item.cartItemId, item.quantity + 1)} className="p-1.5 text-stone-600"><Plus size={12} /></button>
                      </div>
                      <button onClick={() => removeItem(item.cartItemId)} className="text-rose-700 hover:text-rose-800"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="text-stone-900 font-medium">{inr(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="bg-white border border-stone-200 rounded-md p-6 h-fit">
              <div className="flex justify-between text-sm mb-2 text-stone-600"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
              <div className="flex justify-between text-sm mb-4 text-stone-600"><span>Shipping</span><span className="text-emerald-600 font-bold uppercase">FREE</span></div>
              <div className="flex justify-between font-medium text-stone-900 border-t border-stone-200 pt-4 mb-6">
                <span>Total</span><span>{inr(subtotal)}</span>
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

function CheckoutView({ cart, subtotal, currentUser, onOpenAuth, placeOrder, setView }) {
  const [form, setForm] = useState({
    name: currentUser?.name || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || "",
    city: currentUser?.city || "",
    pincode: currentUser?.pincode || "",
  });
  const [payment, setPayment] = useState("cod");
  const [paymentSettings, setPaymentSettings] = useState(null);

  // 100% Free Shipping on all orders
  const shipping = 0;
  const total = subtotal;
  const valid = form.name && form.phone && form.address && form.city && form.pincode;

  useEffect(() => {
    fetch(`${API_BASE}/settings/payment-methods`)
      .then((res) => res.json())
      .then((data) => {
        if (data.paymentMethods) setPaymentSettings(data.paymentMethods);
      })
      .catch((e) => console.error(e));
  }, []);

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

  const renderPaymentOption = (key, defaultLabel, valueKey) => {
    const setting = paymentSettings ? paymentSettings[key] : null;
    const isEnabled = setting ? setting.enabled !== false : true;
    const statusLabel = isEnabled ? "Available" : "Unavailable";

    return (
      <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${payment === valueKey ? "border-amber-500 bg-amber-50/40 shadow-sm" : "border-stone-200"} ${!isEnabled ? "opacity-60 bg-stone-100" : ""}`}>
        <div className="flex items-center gap-3">
          <input
            type="radio"
            name="paymentMethod"
            disabled={!isEnabled}
            checked={payment === valueKey}
            onChange={() => setPayment(valueKey)}
            className="accent-amber-600"
          />
          <span className="text-stone-900 text-sm font-medium">{defaultLabel}</span>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${isEnabled ? "bg-emerald-500 text-white" : "bg-rose-700 text-white"}`}>
          {statusLabel}
        </span>
      </label>
    );
  };

  return (
    <div className="bg-stone-50 min-h-[70vh] py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setView("cart")} className="text-sm text-stone-600 hover:text-amber-600 font-medium">← Back to cart</button>
          <div className="text-xs uppercase tracking-[0.3em] font-semibold text-stone-500">Checkout &amp; Shipping</div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
              <div className="text-xs tracking-widest uppercase text-stone-500 font-bold mb-4">Shipping Address Details</div>
              <div className="grid sm:grid-cols-2 gap-4">
                <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 sm:col-span-2 bg-white" />
                <input placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 sm:col-span-2 bg-white" />
                <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 sm:col-span-2 bg-white" />
                <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 bg-white" />
                <input placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 bg-white" />
              </div>
            </div>

            {/* 100% Free Shipping Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs tracking-widest uppercase text-emerald-900 font-bold flex items-center gap-2">
                  <Truck size={18} className="text-emerald-700" /> Free Express Shipping
                </div>
                <span className="text-[11px] uppercase font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  ₹0.00 Delivery Fee
                </span>
              </div>
              <p className="text-xs text-emerald-800">
                Enjoy 100% Free Doorstep Delivery on all boutique orders across India with real-time express tracking.
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
              <div className="text-xs tracking-widest uppercase text-stone-500 font-bold mb-4">Select Payment Method</div>
              <div className="flex flex-col gap-3">
                {renderPaymentOption("card", "Razorpay Online Payment (UPI, Credit/Debit Cards, Net Banking)", "online")}
                {renderPaymentOption("cod", "Cash on Delivery (COD)", "cod")}
              </div>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-6 h-fit shadow-sm">
            <div className="text-xs tracking-widest uppercase text-stone-500 font-bold mb-4">Order Summary</div>
            {cart.map((item) => (
              <div key={item.cartItemId} className="flex justify-between text-sm text-stone-600 mb-2">
                <span>{item.name} × {item.quantity} ({item.size})</span>
                <span>{inr(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm mb-2 text-stone-600 border-t border-stone-200 pt-3">
              <span>Shipping Fee</span>
              <span className="font-bold text-emerald-600 uppercase">FREE</span>
            </div>
            <div className="flex justify-between font-bold text-stone-900 text-base border-t border-stone-200 pt-3 mb-6">
              <span>Total Payable</span>
              <span className="text-amber-700">{inr(total)}</span>
            </div>
            <button
              disabled={!valid || cart.length === 0}
              onClick={() => placeOrder(form, payment, total)}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-bold tracking-wide py-3.5 rounded-full shadow-lg shadow-amber-500/20 transition-all"
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

function UpiView({ order, onConfirmPayment, onBack, onCancel }) {
  const [paymentReference, setPaymentReference] = useState(order?.paymentReference || "");
  const [proofFile, setProofFile] = useState(null);
  const [proofUrl, setProofUrl] = useState(order?.paymentProofUrl || "");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(order?.paymentStatus === "verification_requested" ? "Verification requested. Await admin approval." : "");

  const [qrDataUrl, setQrDataUrl] = useState("");
  const [upiSettings, setUpiSettings] = useState({ phoneNumber: "", qrImageUrl: "", upiId: UPI_ID });
  const [copiedText, setCopiedText] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/settings/payment-methods`)
      .then((res) => res.json())
      .then((data) => {
        if (data.paymentMethods?.upi) {
          setUpiSettings(prev => ({ ...prev, ...data.paymentMethods.upi }));
        }
      })
      .catch((e) => console.error("Error fetching UPI settings in UpiView:", e));
  }, []);

  useEffect(() => {
    if (!order) return;
    setProofUrl(order.paymentProofUrl || "");
    setPaymentReference(order.paymentReference || "");
    setMessage(order.paymentStatus === "verification_requested" ? "Verification requested. Await admin approval." : "");
    const amount = Number(order.total || 0).toFixed(2);
    const targetUpiId = upiSettings.upiId || upiSettings.phoneNumber ? `${upiSettings.phoneNumber}@upi` : UPI_ID;
    const upiLink = `upi://pay?pa=${encodeURIComponent(targetUpiId)}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR`;
    const googleQrUrl = `https://chart.googleapis.com/chart?chs=220x220&cht=qr&chl=${encodeURIComponent(upiLink)}&choe=UTF-8`;
    setQrDataUrl(googleQrUrl);
  }, [order, upiSettings]);

  if (!order) return null;

  const amountStr = Number(order.total || 0).toFixed(2);
  const activeUpiId = upiSettings.upiId || UPI_ID;
  const activePhone = upiSettings.phoneNumber || "";
  const deeplinkUrl = `upi://pay?pa=${encodeURIComponent(activeUpiId)}&pn=${encodeURIComponent(UPI_NAME)}&am=${amountStr}&cu=INR`;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      setProofUrl("");
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!paymentReference || !paymentReference.trim()) {
      alert("Bank RRN no or Payment ID is must required! Please enter your payment reference ID to proceed.");
      return;
    }
    setSubmitting(true);
    let uploadedUrl = proofUrl;
    if (proofFile) {
      uploadedUrl = await onConfirmPayment({ orderId: order.id, paymentReference: paymentReference.trim(), paymentProofFile: proofFile, paymentProofUrl: proofUrl });
      setSubmitting(false);
      return;
    }
    await onConfirmPayment({ orderId: order.id, paymentReference: paymentReference.trim(), paymentProofUrl: uploadedUrl });
    setSubmitting(false);
  };

  return (
    <div className="bg-stone-50 min-h-[75vh] py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 text-center shadow-lg">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-800 mb-3 border border-amber-200">
          <ShieldCheck size={26} />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl text-stone-900 font-bold mb-1.5">Payment Verification</h1>
        <p className="text-stone-600 text-xs sm:text-sm mb-4">
          Order <strong>#{order.orderNumber}</strong> • Payable Total: <strong className="text-amber-800 font-bold">{inr(order.total)}</strong>
        </p>

        {/* Prominent Admin Verification & Profile E-Bill Notice */}
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-left text-xs sm:text-sm space-y-1.5 mb-6 shadow-xs">
          <div className="font-bold text-amber-950 flex items-center gap-1.5">
            <Clock size={16} className="text-amber-700" />
            <span>Important Verification &amp; E-Bill Notice</span>
          </div>
          <p className="text-stone-700 leading-relaxed text-xs">
            Submitting your <strong>Bank RRN no or Payment ID is must required</strong> to verify your order. <strong>After admin verification, your official tax invoice will be issued.</strong> You can see and get your <strong>E-Bill</strong> anytime directly from your <strong>Profile page</strong>.
          </p>
        </div>

        {/* Phone-to-Pay & Deep Link Buttons */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-5 mb-6 text-left space-y-3">
          <div className="text-xs uppercase font-bold tracking-wider text-amber-900 flex items-center gap-1.5">
            <Phone size={16} className="text-amber-700" /> Instant Phone-to-Pay &amp; App Deep Links
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={deeplinkUrl}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all"
            >
              <CreditCard size={15} /> Pay via Any UPI App
            </a>

            {activePhone && (
              <a
                href={`tel:${activePhone}`}
                className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all"
              >
                <Phone size={15} /> Pay via Phone ({activePhone})
              </a>
            )}
          </div>
        </div>

        {/* QR Code section for direct UPI scan */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 mb-6">
          <p className="text-xs uppercase font-bold tracking-wider text-stone-500 mb-3">Scan QR Code via PhonePe / GPay / Paytm</p>
          <div className="flex justify-center mb-3">
            {upiSettings.qrImageUrl ? (
              <img src={getImageUrl(upiSettings.qrImageUrl)} alt="Admin UPI QR Code" width={220} height={220} className="rounded-xl border-2 border-amber-400 shadow-md bg-white p-2 object-contain" />
            ) : qrDataUrl ? (
              <img src={qrDataUrl} alt="UPI QR Code" width={200} height={200} className="rounded-xl border-2 border-stone-200 shadow-sm bg-white p-2" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-stone-100 rounded-xl text-stone-400 text-xs">Loading QR...</div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => copyToClipboard(activeUpiId, "UPI ID")}
              className="inline-flex items-center gap-1.5 bg-white border border-stone-300 hover:border-amber-500 px-3 py-1.5 rounded-lg text-xs text-stone-700 font-medium transition-colors"
            >
              UPI ID: <strong className="text-stone-900 font-mono">{activeUpiId}</strong>
              <span className="text-[10px] text-amber-600 font-bold">{copiedText === "UPI ID" ? "✓ Copied!" : "📋 Copy"}</span>
            </button>

            {activePhone && (
              <button
                type="button"
                onClick={() => copyToClipboard(activePhone, "Phone Number")}
                className="inline-flex items-center gap-1.5 bg-white border border-stone-300 hover:border-amber-500 px-3 py-1.5 rounded-lg text-xs text-stone-700 font-medium transition-colors"
              >
                Phone: <strong className="text-stone-900">{activePhone}</strong>
                <span className="text-[10px] text-amber-600 font-bold">{copiedText === "Phone Number" ? "✓ Copied!" : "📋 Copy"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Bank RRN / Payment ID Submission Form */}
        <div className="space-y-4 text-left mb-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-800 font-bold mb-1.5">
              Bank RRN no or Payment ID <span className="text-rose-600 font-extrabold">* (MUST REQUIRED)</span>
            </label>
            <input
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="e.g. Bank RRN (e.g. 423456789012) or Payment ID"
              className="w-full border-2 border-stone-300 focus:border-amber-500 rounded-lg px-4 py-3 text-sm text-stone-900 bg-white shadow-xs focus:outline-none font-mono"
              required
            />
            <p className="text-[11px] text-stone-500 mt-1">Please enter the exact Bank RRN no or Payment ID from your banking or payment app.</p>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-bold mb-1.5">
              Payment Screenshot / Receipt <span className="text-stone-400 font-normal">(Optional, recommended)</span>
            </label>
            <div className="flex items-center gap-3">
              <label htmlFor="proof-upload" className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold cursor-pointer border border-stone-300 transition-colors">
                <Upload size={14} className="mr-1.5" /> Choose Screenshot
              </label>
              <span className="text-xs text-stone-500 truncate max-w-xs">{proofFile ? proofFile.name : proofUrl ? "Proof uploaded" : "No file chosen"}</span>
            </div>
            <input id="proof-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          {message && (
            <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg p-3 font-medium">
              {message}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors"
          >
            ← Back to checkout
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-full border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
          >
            Cancel payment &amp; keep cart
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Bank RRN / Payment ID"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- E-Bill Printable Invoice --------------------------------- */

function downloadSingleInvoice(order) {
  if (!order) return;

  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const isPaid = isOrderPaid(order);

    const formattedDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
      })
      : new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

    // Customer Detail Extractions
    const customerName = String(order.shipName || order.user?.name || order.customerName || "Valued Customer");
    const customerAddr = String(order.shipAddress || order.address || "Address on file");
    const cityStatePin = [
      order.shipCity || order.city,
      order.shipState || order.state,
      order.shipPincode || order.pincode || order.zip
    ].filter(Boolean).join(" - ");
    const customerPhone = String(order.shipPhone || order.phone || order.user?.phone || "N/A");
    const customerEmail = String(order.shipEmail || order.email || order.user?.email || "N/A");

    // Header Background Bar
    doc.setFillColor(28, 25, 23); // #1c1917
    doc.rect(0, 0, 210, 34, "F");

    // Brand Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(245, 158, 11); // #f59e0b amber
    doc.text("Uma's Fashion & Boutique", 14, 14);

    // Brand Subtitle (Clean & Authentic Header - Old Fake Details Removed)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(214, 211, 209); // #d6d3d1
    doc.text("Official Store E-Bill & GST Invoice  |  GSTIN: 33AAAAA0000A1Z5", 14, 21);
    doc.text("Customer Support Email: care@umasboutique.com", 14, 27);

    // E-Bill Tag & Invoice #
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("OFFICIAL E-BILL (PDF)", 196, 13, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(245, 158, 11);
    doc.text(`Invoice #${order.orderNumber || order.id?.slice(-8) || "1001"}`, 196, 19, { align: "right" });
    doc.setTextColor(214, 211, 209);
    doc.setFontSize(8);
    doc.text(`Date: ${formattedDate}`, 196, 25, { align: "right" });

    // Customer & Payment Details Card (Height expanded for complete address, phone & email)
    doc.setFillColor(245, 245, 244); // #f5f5f4
    doc.roundedRect(14, 38, 182, 38, 3, 3, "F");
    doc.setDrawColor(231, 229, 228);
    doc.roundedRect(14, 38, 182, 38, 3, 3, "S");

    // Customer Left Column
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 113, 108); // #78716c
    doc.text("BILLED & SHIPPED TO:", 18, 44);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(28, 25, 23);
    doc.text(customerName, 18, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(68, 64, 60);
    doc.text(customerAddr.length > 55 ? customerAddr.substring(0, 53) + "..." : customerAddr, 18, 55);
    doc.text(cityStatePin || "India", 18, 60);
    doc.text(`Phone: ${customerPhone}  |  Email: ${customerEmail}`, 18, 65);

    // Payment Right Column
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 113, 108);
    doc.text("PAYMENT & ORDER DETAILS:", 115, 44);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(28, 25, 23);
    doc.text(`Payment Method: ${(order.paymentMethod || "ONLINE").toUpperCase()}`, 115, 50);

    doc.setFont("helvetica", "bold");
    if (isPaid) {
      doc.setTextColor(21, 128, 61); // emerald green
      doc.text("Payment Status: PAID / CONFIRMED", 115, 55);
    } else {
      doc.setTextColor(180, 83, 9); // amber/orange
      doc.text("Payment Status: PENDING / COD", 115, 55);
    }

    doc.setFont("helvetica", "normal");
    doc.setTextColor(68, 64, 60);
    doc.text(`Order Status: ${(order.status || "Confirmed").toUpperCase()}`, 115, 60);
    doc.text(`Order ID: ${order.id || "N/A"}`, 115, 65);

    // Items Table
    const tableRows = (order.items || []).map((item, idx) => [
      idx + 1,
      item.name || "Boutique Item",
      item.category || "Apparel",
      item.size || "Standard",
      item.quantity || 1,
      `INR ${Number(item.price || 0).toLocaleString("en-IN")}`,
      `INR ${Number((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}`,
    ]);

    autoTable(doc, {
      startY: 80,
      head: [["#", "Item Description", "Category", "Size", "Qty", "Unit Price", "Total Amount"]],
      body: tableRows,
      theme: "striped",
      headStyles: {
        fillColor: [28, 25, 23], // #1c1917
        textColor: [245, 158, 11], // #f59e0b
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { halign: "left", cellWidth: 58 },
        2: { halign: "center", cellWidth: 25 },
        3: { halign: "center", cellWidth: 18 },
        4: { halign: "center", cellWidth: 14 },
        5: { halign: "right", cellWidth: 28 },
        6: { halign: "right", cellWidth: 29 },
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [41, 37, 36],
      },
      alternateRowStyles: {
        fillColor: [250, 250, 249],
      },
      margin: { left: 14, right: 14 },
    });

    const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 125) + 8;

    // Totals Box
    doc.setFillColor(245, 245, 244);
    doc.roundedRect(120, finalY, 76, 26, 2, 2, "F");
    doc.setDrawColor(217, 119, 6);
    doc.roundedRect(120, finalY, 76, 26, 2, 2, "S");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(87, 83, 78);
    doc.text("Subtotal:", 124, finalY + 6);
    doc.text(`INR ${Number(order.subtotal || order.total).toLocaleString("en-IN")}`, 192, finalY + 6, { align: "right" });

    doc.text("Shipping Fee:", 124, finalY + 12);
    doc.text(order.shippingFee ? `INR ${Number(order.shippingFee).toLocaleString("en-IN")}` : "FREE", 192, finalY + 12, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(180, 83, 9); // #b45309
    doc.text(isPaid ? "Grand Total Paid:" : "Grand Total Due:", 124, finalY + 20);
    doc.text(`INR ${Number(order.total).toLocaleString("en-IN")}`, 192, finalY + 20, { align: "right" });

    // Official Stamp
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    if (isPaid) {
      doc.setTextColor(21, 128, 61);
      doc.text("✓ VERIFIED DIGITAL INVOICE", 14, finalY + 8);
    } else {
      doc.setTextColor(180, 83, 9);
      doc.text("• OFFICIAL STORE E-BILL (PENDING PAYMENT)", 14, finalY + 8);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 113, 108);
    doc.text("Authenticated electronic GST invoice issued by Uma's Boutique.", 14, finalY + 14);
    doc.text("All taxes and GST included as applicable.", 14, finalY + 19);

    // Footer
    doc.setDrawColor(231, 229, 228);
    doc.line(14, 280, 196, 280);
    doc.setFontSize(7.5);
    doc.setTextColor(168, 162, 158);
    doc.text("Uma's Fashion & Boutique  •  care@umasboutique.com  •  Thank you for shopping!", 105, 286, { align: "center" });

    // Save as actual PDF
    doc.save(`Invoice_${order.orderNumber || order.id?.slice(-8) || "order"}.pdf`);
  } catch (err) {
    console.error("PDF generation error:", err);
    alert("Error generating PDF invoice. Please try again.");
  }
}

function EBillInvoiceComponent({ order }) {
  if (!order) return null;
  if (!isOrderPaid(order)) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center max-w-xl mx-auto my-6 shadow-sm">
        <AlertCircle size={36} className="text-amber-600 mx-auto mb-2" />
        <h3 className="font-serif text-lg font-bold text-stone-900 mb-1">E-Bill Available After Payment Confirmation</h3>
        <p className="text-xs text-stone-600 mb-2">
          {order.paymentStatus === "verification_requested"
            ? `Your payment reference (${order.paymentReference || "Submitted"}) is currently under admin review. Official PDF E-Bill will be generated once payment is approved.`
            : order.paymentMethod === "cod"
              ? "For Cash on Delivery orders, physical invoice is provided upon delivery."
              : "Official PDF E-Bill invoices are only generated after payment completion."}
        </p>
      </div>
    );
  }

  const printBill = () => {
    window.print();
  };

  const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
  }) : new Date().toLocaleDateString("en-IN");

  return (
    <div className="bg-white border border-stone-300 rounded-lg p-6 sm:p-8 text-left shadow-lg max-w-2xl mx-auto my-6 print:border-none print:shadow-none print:m-0 print:p-0">
      <div className="flex justify-between items-start border-b border-stone-200 pb-6 mb-6">
        <div>
          <h2 className="font-serif text-2xl text-stone-900 font-bold">Uma's Fashion &amp; Boutique</h2>
          <p className="text-xs text-stone-500 mt-1">123 Luxury Avenue, Fashion District, India</p>
          <p className="text-xs text-stone-500">GSTIN: 33AAAAA0000A1Z5 | Support: care@umasboutique.com</p>
        </div>
        <div className="text-right">
          <span className="inline-block bg-amber-500 text-stone-950 font-bold text-xs uppercase px-3 py-1 rounded">OFFICIAL E-BILL</span>
          <p className="text-sm font-semibold text-stone-800 mt-2">Invoice #{order.orderNumber || order.id?.slice(-8)}</p>
          <p className="text-xs text-stone-500">Date: {formattedDate}</p>
        </div>
      </div>

      {/* Customer & Shipping Details */}
      <div className="grid grid-cols-2 gap-4 text-xs text-stone-600 mb-6 bg-stone-50 p-4 rounded-md">
        <div>
          <p className="font-bold uppercase text-stone-800 tracking-wider mb-1">Billed &amp; Shipped To:</p>
          <p className="font-semibold text-stone-900">{order.shipName || order.user?.name || "Valued Customer"}</p>
          <p>{order.shipAddress || "Address provided during checkout"}</p>
          <p>{order.shipCity ? `${order.shipCity} - ${order.shipPincode}` : ""}</p>
          <p>Phone: {order.shipPhone || "N/A"}</p>
        </div>
        <div>
          <p className="font-bold uppercase text-stone-800 tracking-wider mb-1">Payment Breakdown:</p>
          <p>Method: <b className="uppercase text-stone-900">{order.paymentMethod || "ONLINE"}</b></p>
          <p>Payment Status: <b className="uppercase text-emerald-600">PAID / CONFIRMED</b></p>
        </div>
      </div>

      {/* Item Table */}
      <table className="w-full text-left text-xs mb-6">
        <thead>
          <tr className="border-b border-stone-300 text-stone-500 uppercase tracking-wider">
            <th className="py-2">Item Description</th>
            <th className="py-2 text-center">Qty</th>
            <th className="py-2 text-right">Price</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {order.items?.map((item, idx) => (
            <tr key={idx}>
              <td className="py-2.5">
                <span className="font-medium text-stone-900">{item.name}</span>
                <span className="block text-[11px] text-stone-500">Size: {item.size || "Standard"} • Category: {item.category || "Boutique"}</span>
              </td>
              <td className="py-2.5 text-center font-semibold">{item.quantity}</td>
              <td className="py-2.5 text-right">{inr(item.price)}</td>
              <td className="py-2.5 text-right font-bold text-stone-900">{inr(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="border-t border-stone-300 pt-4 flex flex-col items-end text-xs space-y-1">
        <div className="flex justify-between w-48 text-stone-600"><span>Subtotal:</span><span>{inr(order.subtotal || order.total)}</span></div>
        <div className="flex justify-between w-48 text-stone-600"><span>Shipping:</span><span>{order.shippingFee ? inr(order.shippingFee) : "FREE"}</span></div>
        <div className="flex justify-between w-48 text-stone-900 font-bold text-sm border-t border-stone-300 pt-2 mt-1">
          <span>Grand Total:</span><span className="text-amber-700">{inr(order.total)}</span>
        </div>
      </div>

      {/* Print / Download Controls */}
      <div className="mt-8 pt-4 border-t border-stone-200 flex flex-wrap justify-between items-center gap-3 print:hidden">
        <span className="text-xs text-stone-500">Verified official boutique PDF invoice.</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadSingleInvoice(order)}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Download size={15} /> Download PDF E-Bill
          </button>
          <button
            onClick={printBill}
            className="bg-stone-900 hover:bg-stone-800 text-amber-300 px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Printer size={15} /> Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function EBillLookupSection({ orders = [] }) {
  const [query, setQuery] = useState("");
  const [matchedOrder, setMatchedOrder] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const clean = query.trim().toLowerCase();
    const found = orders.find(
      (o) =>
        String(o.orderNumber).toLowerCase() === clean ||
        String(o.id).toLowerCase() === clean ||
        (o.paymentReference && String(o.paymentReference).toLowerCase() === clean)
    );
    if (found) {
      if (!isOrderPaid(found)) {
        setMatchedOrder(null);
        setError(`Order #${found.orderNumber} found, but payment is still ${found.paymentStatus === "verification_requested" ? "under admin review" : "pending"}. Official E-Bill will be accessible once payment is confirmed.`);
      } else {
        setMatchedOrder(found);
        setError("");
      }
    } else {
      setMatchedOrder(null);
      setError("No matching order or transaction ID found. Please check your Reference ID or Order Number.");
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-md p-6 my-6 shadow-sm text-left max-w-2xl mx-auto">
      <h3 className="font-serif text-lg font-bold text-stone-900 mb-1 flex items-center gap-2">
        <FileText size={20} className="text-amber-600" /> Instant E-Bill &amp; Transaction Lookup
      </h3>
      <p className="text-xs text-stone-500 mb-4">Paste your Order Number or Payment Reference / Transaction ID below to render &amp; print your official boutique invoice.</p>
      <form onSubmit={handleSearch} className="flex gap-2 mb-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Order # or Reference / Txn ID (e.g. 1001 or pay_...)"
          className="flex-1 border border-stone-300 rounded-md px-4 py-2 text-xs focus:outline-none focus:border-amber-500"
        />
        <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-stone-950 px-5 py-2 rounded-md font-semibold text-xs transition-colors">
          View E-Bill
        </button>
      </form>
      {error && <div className="text-xs text-rose-600 bg-rose-50 p-3 rounded border border-rose-200 mb-2">{error}</div>}
      {matchedOrder && (
        <div className="mt-4">
          <div className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded mb-2">Order verified &amp; paid! Displaying printable E-Bill below:</div>
          <EBillInvoiceComponent order={matchedOrder} />
        </div>
      )}
    </div>
  );
}

function ConfirmationView({ order, setView, orders = [] }) {
  if (!order) return null;
  const paid = isOrderPaid(order);

  return (
    <div className="bg-stone-50 min-h-[70vh] py-16 px-6 text-center">
      <div className="max-w-2xl mx-auto bg-white border border-stone-200 rounded-2xl p-8 shadow-lg">
        <CheckCircle size={48} className="text-emerald-600 mx-auto mb-4" />
        <h1 className="font-serif text-3xl text-stone-900 mb-2">Order Confirmed!</h1>
        <p className="text-stone-500 text-sm mb-4">Thank you for shopping with Uma's. Your order number is <strong className="text-stone-900 font-bold">#{order.orderNumber}</strong>.</p>

        {/* User Request Notice: Admin verification & Profile page for E-Bill */}
        <div className="my-6 p-5 bg-amber-50/90 border-2 border-amber-300 rounded-xl text-left shadow-sm">
          <div className="flex items-center gap-2 text-amber-950 font-bold text-sm mb-2">
            <ShieldCheck size={20} className="text-amber-700 shrink-0" />
            <span>Important Note on Admin Verification &amp; E-Bill Invoice:</span>
          </div>
          <p className="text-stone-700 text-sm leading-relaxed mb-3">
            Your payment details have been submitted. <strong>After admin verification, your official invoice will be issued.</strong> You can see and get your <strong>E-Bill</strong> anytime from your <strong>Profile page</strong>.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setView("account")}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold px-4 py-2 rounded-full transition-colors shadow-xs"
            >
              <FileText size={14} /> Go to Profile Page for E-Bill
            </button>
            <span className="text-xs text-stone-500">Invoice will be downloadable once verified.</span>
          </div>
        </div>

        {paid ? (
          <>
            <div className="text-emerald-800 bg-emerald-50 border border-emerald-200 text-sm p-3 rounded-xl mb-4 font-medium">
              ✓ Payment verified and confirmed! Your official printable E-Bill Invoice is displayed below:
            </div>
            {/* Render E-Bill Invoice Component right below payment confirmation */}
            <div className="my-6">
              <EBillInvoiceComponent order={order} />
            </div>
          </>
        ) : (
          <div className="my-6 p-4 bg-stone-50 border border-stone-200 rounded-xl text-left text-xs text-stone-600 space-y-1">
            <div className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Clock size={16} className="text-amber-600" />
              <span>Payment Status: {order.paymentStatus === "verification_requested" ? "Verification In Progress" : order.paymentStatus?.toUpperCase()}</span>
            </div>
            {order.paymentReference && (
              <div>Submitted Bank RRN / Payment ID: <strong className="text-stone-900 font-mono">{order.paymentReference}</strong></div>
            )}
            <p className="text-stone-500 text-[11px] pt-1">
              Admin will review your transaction reference shortly. Upon verification, status will update to &quot;Paid&quot; and your E-bill will be activated.
            </p>
          </div>
        )}

        <EBillLookupSection orders={orders.length > 0 ? orders : [order]} />

        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
          <button onClick={() => setView("account")} className="bg-stone-900 hover:bg-stone-800 text-amber-300 px-6 py-3 rounded-full text-sm font-medium transition-colors">
            View My Orders &amp; Profile E-Bill
          </button>
          <button onClick={() => setView("shop")} className="border border-stone-300 text-stone-700 hover:bg-stone-100 px-6 py-3 rounded-full text-sm transition-colors">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Customer Profile View ------------------------------- */

function CustomerProfileView({ currentUser, orders = [], setView, onProfileUpdated, onRefreshProfile, showToast, onOpenAuth }) {
  const [activeTab, setActiveTab] = useState("orders");
  const [selectedEBillOrder, setSelectedEBillOrder] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || "",
    pincode: currentUser?.pincode || "",
    avatarUrl: currentUser?.avatarUrl || "",
  });
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [transactions, setTransactions] = useState([]);
  const [returns, setReturns] = useState([]);
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);
  const [returnModalOrder, setReturnModalOrder] = useState(null);
  const [customerOrderSearch, setCustomerOrderSearch] = useState("");

  useEffect(() => {
    if (currentUser) {
      fetchTransactions();
      fetchReturns();
    }
  }, [currentUser]);

  const fetchTransactions = async () => {
    const token = localStorage.getItem("umas:token");
    try {
      const res = await fetch(`${API_BASE}/orders/my-transactions`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setTransactions(data.transactions || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReturns = async () => {
    const token = localStorage.getItem("umas:token");
    try {
      const res = await fetch(`${API_BASE}/returns/my-returns`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setReturns(data.returns || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("umas:token");
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Profile updated successfully!");
        onProfileUpdated(data.user);
      } else {
        alert(data.error || "Failed to update profile.");
      }
    } catch (err) {
      alert("Error updating profile.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      return alert("New passwords do not match.");
    }
    const token = localStorage.getItem("umas:token");
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(passForm),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Password updated successfully!");
        setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        alert(data.error || "Failed to change password.");
      }
    } catch (err) {
      alert("Error changing password.");
    }
  };

  const sortedOrders = useMemo(() => {
    return [...(orders || [])]
      .filter((ord) => {
        if (!customerOrderSearch.trim()) return isOrderPaid(ord);
        const q = customerOrderSearch.trim().toLowerCase();
        return (
          isOrderPaid(ord) &&
          (String(ord.orderNumber || "").toLowerCase().includes(q) ||
            String(ord.id || "").toLowerCase().includes(q) ||
            (ord.items && ord.items.some((it) => it.name && it.name.toLowerCase().includes(q))) ||
            (ord.status && ord.status.toLowerCase().includes(q)))
        );
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [orders, customerOrderSearch]);

  if (!currentUser) {
    return (
      <div className="bg-stone-50 min-h-[70vh] py-16 px-6 text-center flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-2xl p-8 shadow-xl">
          <User size={48} className="text-amber-500 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-stone-900 font-bold mb-2">My Profile & Orders</h2>
          <p className="text-stone-500 text-sm mb-6">Please log in to view your profile details, order history, track shipments, and download invoices.</p>
          <button
            onClick={onOpenAuth}
            className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 rounded-full text-sm shadow-lg shadow-amber-500/20 transition-all"
          >
            Login / Create Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-[75vh] py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border border-stone-200 rounded-md p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-20 h-20 rounded-full bg-stone-900 text-amber-300 flex items-center justify-center font-serif text-3xl font-bold border-2 border-amber-500/40 overflow-hidden shrink-0">
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser?.name?.[0]?.toUpperCase() || "U"
              )}
            </div>
            <div>
              <h1 className="font-serif text-2xl text-stone-900 font-medium">{currentUser?.name}</h1>
              <p className="text-stone-500 text-sm">{currentUser?.email} • {currentUser?.phone || "No phone linked"}</p>
              <p className="text-xs text-stone-400 mt-1">Customer since {formatDateTime(currentUser?.createdAt)}</p>
            </div>
          </div>

          <button
            onClick={async () => {
              if (onRefreshProfile) await onRefreshProfile();
              await fetchTransactions();
              await fetchReturns();
              if (showToast) showToast("Profile & order history refreshed successfully!");
            }}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-md shrink-0"
          >
            <RefreshCw size={15} /> Refresh Profile Data
          </button>
        </div>

        {/* Profile Navigation Tabs */}
        <div className="flex border-b border-stone-200 overflow-x-auto mb-8 gap-2">
          {[
            ["orders", "Orders & Invoices (New to Old)", ShoppingBag],
            ["returns", "Return / Refunds", RotateCcw],
            ["transactions", "Payment History", CreditCard],
            ["details", "Personal Details", User],
            ["password", "Change Password", Lock],
          ].map(([tabKey, label, Icon]) => (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`flex items-center gap-2 px-5 py-3 text-xs tracking-wider uppercase border-b-2 font-medium shrink-0 transition-colors ${activeTab === tabKey ? "border-amber-500 text-amber-800 bg-amber-50/50 font-bold" : "border-transparent text-stone-600 hover:text-stone-900"
                }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* Tab 1: Orders */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl text-stone-900">Order &amp; Invoice History</h2>
                <p className="text-xs text-stone-500">Track shipments in real time and download official boutique invoices.</p>
              </div>
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-semibold self-start sm:self-auto">
                Showing {sortedOrders.length} Invoices
              </span>
            </div>

            {/* Customer Order Search Bar */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={customerOrderSearch}
                onChange={(e) => setCustomerOrderSearch(e.target.value)}
                placeholder="Search your orders by Order ID / Number (e.g. 1001), item name..."
                className="w-full bg-white border border-stone-200 rounded-lg pl-9 pr-8 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 shadow-sm"
              />
              {customerOrderSearch && (
                <button
                  onClick={() => setCustomerOrderSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {sortedOrders.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-md p-10 text-center text-stone-500">
                You haven't placed any orders yet.
              </div>
            ) : (
              sortedOrders.map((ord) => (
                <div key={ord.id} className="bg-white border border-stone-200 rounded-md p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4 mb-4">
                    <div>
                      <div className="font-serif text-lg text-stone-900 font-medium">Order #{ord.orderNumber}</div>
                      <div className="text-xs text-stone-400">{formatDateTime(ord.createdAt)}</div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs uppercase px-3 py-1 rounded-full font-bold tracking-wider ${ord.status === "Delivered" ? "bg-emerald-100 text-emerald-800" :
                        ord.status === "Cancelled" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                        }`}>
                        {ord.status}
                      </span>
                      <button
                        onClick={() => setTrackingModalOrder(ord)}
                        className="bg-stone-900 text-amber-300 text-xs px-3 py-1.5 rounded-full hover:bg-stone-800 flex items-center gap-1"
                      >
                        <Truck size={14} /> Track
                      </button>
                      {isOrderPaid(ord) ? (
                        <>
                          <button
                            onClick={() => downloadSingleInvoice(ord)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 font-bold shadow-sm transition-colors"
                          >
                            <Download size={14} /> Download Bill
                          </button>
                          <button
                            onClick={() => setSelectedEBillOrder(ord)}
                            className="bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs px-3 py-1.5 rounded-full flex items-center gap-1 font-semibold shadow-sm transition-colors"
                          >
                            <FileText size={14} /> View Invoice
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 border border-stone-300 px-3 py-1 rounded-full">
                          {ord.paymentStatus === "verification_requested"
                            ? "Verification Pending"
                            : ord.paymentMethod === "cod"
                              ? "COD (Bill on Delivery)"
                              : "Payment Pending"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="divide-y divide-stone-100">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="py-3 flex justify-between items-center text-sm">
                        <div>
                          <span className="font-medium text-stone-900">{item.name}</span>
                          <span className="text-xs text-stone-500 ml-2">({item.category} • Size: {item.size} • Qty: {item.quantity})</span>
                        </div>
                        <span className="text-stone-900 font-medium">{inr(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-stone-100 pt-4 mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-600">
                    <div>Payment: <b className="uppercase text-stone-900">{ord.paymentMethod}</b> ({ord.paymentStatus})</div>
                    <div className="flex items-center gap-4">
                      {ord.status === "Delivered" && (
                        <button
                          onClick={() => setReturnModalOrder(ord)}
                          className="text-amber-700 hover:underline font-medium flex items-center gap-1"
                        >
                          <RotateCcw size={12} /> Return / Refund Item
                        </button>
                      )}
                      <span className="text-sm font-bold text-stone-900">Total: {inr(ord.total)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Return Requests */}
        {activeTab === "returns" && (
          <div className="space-y-6">
            <h2 className="font-serif text-xl text-stone-900">Return &amp; Refund Claims</h2>
            {returns.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-md p-10 text-center text-stone-500">
                No active or past return requests.
              </div>
            ) : (
              returns.map((ret) => (
                <div key={ret._id} className="bg-white border border-stone-200 rounded-md p-6 shadow-sm">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-3 mb-3">
                    <div>
                      <div className="font-medium text-stone-900">Order #{ret.order_number}</div>
                      <div className="text-xs text-stone-500">Product: <b>{ret.product_name}</b></div>
                    </div>
                    <span className={`text-xs uppercase font-bold px-3 py-1 rounded-full ${ret.status === "Approved" ? "bg-emerald-100 text-emerald-800" :
                      ret.status === "Refund Completed" ? "bg-blue-100 text-blue-800" :
                        ret.status === "Rejected" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                      }`}>
                      {ret.status}
                    </span>
                  </div>
                  <div className="text-xs text-stone-600 space-y-1">
                    <div><b>Reason:</b> {ret.reason} {ret.custom_reason ? `(${ret.custom_reason})` : ""}</div>
                    {ret.comments && <div><b>Comments:</b> {ret.comments}</div>}
                    <div><b>Requested Date:</b> {formatDateTime(ret.requested_at)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Transactions */}
        {activeTab === "transactions" && (
          <div className="space-y-6">
            <h2 className="font-serif text-xl text-stone-900">Payment &amp; Transaction Logs</h2>
            {transactions.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-md p-10 text-center text-stone-500">
                No payment transactions recorded.
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
                  <table className="w-full text-left text-xs text-stone-600 min-w-[540px]">
                    <thead className="bg-stone-900 text-amber-300 uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Txn ID</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {transactions.map((t) => (
                        <tr key={t._id} className="hover:bg-stone-50">
                          <td className="p-3 font-mono font-medium">{t.transaction_id}</td>
                          <td className="p-3">{t.payment_method}</td>
                          <td className="p-3 font-semibold">{t.type}</td>
                          <td className="p-3 font-bold text-stone-900">{inr(t.amount)}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${t.status === "Success" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="p-3 text-stone-400">{formatDateTime(t.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Details */}
        {activeTab === "details" && (
          <form onSubmit={handleUpdateProfile} className="bg-white border border-stone-200 rounded-md p-6 max-w-2xl space-y-4">
            <h2 className="font-serif text-xl text-stone-900 mb-4">Edit Personal Information</h2>
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">Full Name</label>
              <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full border border-stone-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">Phone Number</label>
              <input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full border border-stone-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">Address</label>
              <input value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} className="w-full border border-stone-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">City</label>
                <input value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} className="w-full border border-stone-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">Pincode</label>
                <input value={profileForm.pincode} onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })} className="w-full border border-stone-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">Profile Photo URL (Optional)</label>
              <input value={profileForm.avatarUrl} onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })} placeholder="https://example.com/photo.jpg" className="w-full border border-stone-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
            </div>
            <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium px-6 py-2.5 rounded-full text-sm">
              Save Profile Changes
            </button>
          </form>
        )}

        {/* Tab 5: Password */}
        {activeTab === "password" && (
          <form onSubmit={handleChangePassword} className="bg-white border border-stone-200 rounded-md p-6 max-w-md space-y-4">
            <h2 className="font-serif text-xl text-stone-900 mb-4">Change Password</h2>
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">Current Password</label>
              <input type="password" value={passForm.currentPassword} onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })} className="w-full border border-stone-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" required />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">New Password</label>
              <input type="password" value={passForm.newPassword} onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })} className="w-full border border-stone-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" required />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">Confirm New Password</label>
              <input type="password" value={passForm.confirmPassword} onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })} className="w-full border border-stone-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" required />
            </div>
            <button type="submit" className="bg-stone-900 hover:bg-stone-800 text-amber-300 font-medium px-6 py-2.5 rounded-full text-sm">
              Update Password
            </button>
          </form>
        )}
      </div>

      {trackingModalOrder && <OrderTrackingModal order={trackingModalOrder} onClose={() => setTrackingModalOrder(null)} />}
      {returnModalOrder && <ReturnRequestModal order={returnModalOrder} onClose={() => setReturnModalOrder(null)} onSubmitted={fetchReturns} />}

      {selectedEBillOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto relative border border-stone-300 shadow-2xl p-6">
            <button
              onClick={() => setSelectedEBillOrder(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 font-bold z-10"
            >
              <X size={20} />
            </button>
            <EBillInvoiceComponent order={selectedEBillOrder} />
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------- Order Tracking Modal -------------------------- */

function OrderTrackingModal({ order, onClose }) {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!order) return;
    const token = localStorage.getItem("umas:token");
    const orderIdentifier = order._id || order.id || order.orderNumber;
    fetch(`${API_BASE}/orders/${orderIdentifier}/tracking`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.tracking) setTracking(data.tracking);
        setLoading(false);
      })
      .catch((e) => setLoading(false));
  }, [order]);

  const steps = ["Order Placed", "Payment Confirmed", "Processing", "Packed", "Shipped", "Out for Delivery", "Delivered"];
  const currentStepIdx = tracking ? steps.indexOf(tracking.current_status) : steps.indexOf(order.status);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 flex items-center justify-center p-4">
      <div className="bg-white rounded-md max-w-xl w-full p-6 relative border border-stone-200 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"><X size={18} /></button>
        <h2 className="font-serif text-2xl text-stone-900 mb-1">Order Progress Timeline</h2>
        <p className="text-stone-500 text-xs mb-6">Tracking Order <b>#{order.orderNumber}</b></p>

        {loading ? (
          <div className="py-8 text-center text-stone-500">Loading tracking data…</div>
        ) : (
          <div>
            {/* Horizontal Timeline Progress */}
            <div className="space-y-4 mb-8">
              <div className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-2">Delivery Status Steps</div>
              <div className="flex flex-col gap-3">
                {steps.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  return (
                    <div key={step} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isCurrent ? "bg-amber-500 text-stone-950 ring-4 ring-amber-100" :
                        isDone ? "bg-emerald-600 text-white" : "bg-stone-200 text-stone-500"
                        }`}>
                        {isDone ? <Check size={14} /> : idx + 1}
                      </div>
                      <span className={`text-sm ${isCurrent ? "font-bold text-stone-900" : isDone ? "font-medium text-stone-700" : "text-stone-400"}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline updates list */}
            {tracking?.timeline && tracking.timeline.length > 0 && (
              <div className="border-t border-stone-200 pt-4">
                <div className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-3">Activity Updates</div>
                <div className="space-y-3">
                  {tracking.timeline.map((event, i) => (
                    <div key={i} className="bg-stone-50 p-3 rounded border border-stone-200/60 text-xs">
                      <div className="flex justify-between font-medium text-stone-900">
                        <span>{event.status}</span>
                        <span className="text-stone-400">{formatDateTime(event.timestamp)}</span>
                      </div>
                      {event.description && <div className="text-stone-600 mt-0.5">{event.description}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------- Return Request Modal -------------------------- */

function ReturnRequestModal({ order, onClose, onSubmitted }) {
  const [eligibility, setEligibility] = useState(null);
  const [productName, setProductName] = useState(order.items[0]?.name || "");
  const [customerPhone, setCustomerPhone] = useState(order.shipping?.phone || "");
  const [reason, setReason] = useState("Defective item");
  const [customReason, setCustomReason] = useState("");
  const [comments, setComments] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("umas:token");
    fetch(`${API_BASE}/returns/eligibility/${order.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        setEligibility(data);
        setLoading(false);
      })
      .catch((e) => setLoading(false));
  }, [order.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eligibility || !eligibility.eligible) {
      return alert("This order is not eligible for return.");
    }
    const token = localStorage.getItem("umas:token");
    let proofUrl = imageUrl;

    if (imageFile && !proofUrl) {
      proofUrl = await uploadProofImage(imageFile);
      if (!proofUrl) {
        return;
      }
    }

    try {
      const res = await fetch(`${API_BASE}/returns`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          orderId: order.id,
          customerPhone,
          productName,
          reason,
          customReason,
          comments,
          imageUrls: proofUrl ? [proofUrl] : [],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Return request submitted successfully!");
        onSubmitted();
        onClose();
      } else {
        alert(data.error || "Failed to submit return request.");
      }
    } catch (err) {
      alert("Error submitting return request.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 flex items-center justify-center p-4">
      <div className="bg-white rounded-md max-w-md w-full p-6 relative border border-stone-200 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"><X size={18} /></button>
        <h2 className="font-serif text-xl text-stone-900 mb-1">Return / Refund Request</h2>
        <p className="text-stone-500 text-xs mb-4">Order #{order.orderNumber}</p>

        {loading ? (
          <div className="py-6 text-center text-stone-500">Checking eligibility window…</div>
        ) : eligibility && !eligibility.eligible ? (
          <div className="bg-rose-50 text-rose-800 p-4 rounded-md border border-rose-200 text-center text-sm font-semibold">
            {eligibility.reason || "Return Period Expired"}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 p-3 rounded text-xs text-amber-900 font-medium">
              {eligibility?.message || "Return available for 7 days after delivery"}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">Product Name</label>
              <select value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none">
                {order.items.map((it, idx) => (
                  <option key={idx} value={it.name}>{it.name} ({it.size})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">Customer Phone Number</label>
              <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none" required />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">Return Reason</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none">
                <option value="Defective item">Defective item</option>
                <option value="Wrong size">Wrong size</option>
                <option value="Item damaged">Item damaged</option>
                <option value="Not as described">Not as described</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {reason === "Other" && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">Custom Reason</label>
                <input value={customReason} onChange={(e) => setCustomReason(e.target.value)} placeholder="Specify reason..." className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none" required />
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">Additional Comments</label>
              <textarea rows={2} value={comments} onChange={(e) => setComments(e.target.value)} className="w-full border border-stone-300 rounded-md p-2 text-sm focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">Damage / Proof Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                    setImageUrl("");
                  }
                }}
                className="w-full text-xs text-stone-700"
              />
              <p className="text-xs text-stone-500 mt-2">Upload a photo of the damage or issue. This helps admin verify your return faster.</p>
              {imagePreview && (
                <div className="mt-3">
                  <img src={imagePreview} alt="Damage preview" className="w-full h-40 object-cover rounded-md border border-stone-200" />
                </div>
              )}
              <div className="mt-3">
                <label className="block text-xs uppercase tracking-wider text-stone-600 mb-1">Or provide existing image URL</label>
                <input value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setImagePreview(""); setImageFile(null); }} placeholder="https://example.com/photo.jpg" className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none" />
              </div>
            </div>

            <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium py-2.5 rounded-full text-sm">
              Submit Return Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ----------------------- New Product Launches Modal ----------------------- */

function NewLaunchesModal({ products = [], onClose, onSelectProduct }) {
  const newProducts = useMemo(() => {
    const list = products.filter((p) => p.tag === "New" || p.tag === "Bestseller");
    return list.length > 0 ? list : products.slice(0, 6);
  }, [products]);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[85vh] flex flex-col relative border border-amber-500/30 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-stone-950 text-stone-100 p-5 flex items-center justify-between border-b border-amber-500/20">
          <div>
            <span className="text-amber-400 text-[10px] tracking-[0.3em] uppercase block font-semibold mb-0.5">Fresh Arrivals</span>
            <h2 className="font-serif text-xl text-amber-300 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" /> New Product Launches
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-amber-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <p className="text-stone-600 text-sm mb-6">
            Explore our handpicked latest creations — fresh weaves, vibrant colors, and modern traditional couture.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {newProducts.map((product) => {
              const pct = discountPct(product.price, product.mrp);
              return (
                <div
                  key={product.id}
                  onClick={() => { onSelectProduct(product); onClose(); }}
                  className="bg-stone-50 border border-stone-200 rounded-md p-4 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div>
                    <ProductArt category={product.category} tag={product.tag || "New"} imageUrl={product.imageUrl} size="h-44" />
                    <div className="text-[10px] uppercase tracking-widest text-stone-500 mt-3">{product.category}</div>
                    <div className="font-serif text-base text-stone-900 group-hover:text-amber-700 font-medium leading-snug line-clamp-1 mt-0.5">
                      {product.name}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-stone-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-stone-900 font-medium text-sm">{inr(product.price)}</span>
                      {pct > 0 && <span className="text-stone-400 text-xs line-through ml-1.5">{inr(product.mrp)}</span>}
                    </div>
                    <span className="text-amber-700 text-xs font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      View <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-stone-100 p-4 border-t border-stone-200 text-right">
          <button
            onClick={onClose}
            className="bg-stone-950 hover:bg-stone-800 text-amber-300 text-xs font-medium uppercase tracking-widest px-6 py-2.5 rounded-full transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Auth Modal & CAPTCHA --------------------------------- */

function AuthModal({ onClose, onLogin, onSignup, error }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [captcha, setCaptcha] = useState({ text: "", token: "" });
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/captcha`);
      const data = await res.json();
      setCaptcha(data);
      setCaptchaAnswer("");
    } catch (e) {
      console.error("Error fetching CAPTCHA:", e);
    }
  };
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const startForgot = () => {
    setForgotMode(true);
    setForgotEmail(form.email || "");
    setForgotNewPassword("");
    setForgotConfirm("");
  };
  const submitDirectReset = async () => {
    if (!forgotEmail || !forgotNewPassword) return alert('Email and new password are required.');
    if (forgotNewPassword.length < 6) return alert('Password must be at least 6 characters.');
    if (forgotNewPassword !== forgotConfirm) return alert('Passwords do not match.');
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password-direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, newPassword: forgotNewPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Password updated. Please login.');
        setForgotMode(false);
        setTab('login');
        setForm((f) => ({ ...f, email: forgotEmail, password: '' }));
      } else {
        alert(data.error || 'Failed to update password.');
      }
    } catch (e) {
      alert('Error updating password.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!captchaAnswer) return alert("Please solve the CAPTCHA question.");
    if (tab === "login") {
      onLogin(form.email, form.password, captcha.token, captchaAnswer);
    } else {
      onSignup({ name: form.name, email: form.email, password: form.password, phone: form.phone, captchaToken: captcha.token, captchaAnswer });
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-7 relative border border-stone-200 shadow-2xl">
        <button onClick={onClose} className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 transition-colors"><X size={20} /></button>

        <div className="text-center mb-6">
          <span className="text-amber-600 text-[10px] tracking-[0.25em] font-extrabold uppercase block mb-1">Uma's Fashion & Boutique</span>
          <h2 className="font-serif text-2xl text-stone-900 font-bold">{tab === "login" ? "Welcome Back" : "Create Account"}</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {tab === "login" ? "Log in to access your orders and profile" : "Quick registration — no address required right now!"}
          </p>
        </div>

        <div className="flex border-b border-stone-200 mb-6">
          <button onClick={() => setTab("login")} className={`flex-1 py-2.5 text-center text-xs tracking-wider uppercase font-bold border-b-2 transition-all ${tab === "login" ? "border-amber-500 text-amber-900 bg-amber-50/40" : "border-transparent text-stone-400 hover:text-stone-700"}`}>Login</button>
          <button onClick={() => setTab("signup")} className={`flex-1 py-2.5 text-center text-xs tracking-wider uppercase font-bold border-b-2 transition-all ${tab === "signup" ? "border-amber-500 text-amber-900 bg-amber-50/40" : "border-transparent text-stone-400 hover:text-stone-700"}`}>New Registration</button>
        </div>

        {error && <div className="bg-rose-50 text-rose-800 p-3 rounded-lg text-xs mb-4 border border-rose-200 font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === "signup" && (
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">Full Name</label>
              <input placeholder="Enter your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" required />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">Email Address</label>
            <input type="email" placeholder="name@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" required />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">Password</label>
            <input type="password" placeholder="At least 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" required />
          </div>

          {tab === "login" && !forgotMode && (
            <div className="text-right">
              <button type="button" onClick={startForgot} className="text-xs text-amber-700 hover:underline font-medium">Forgot password?</button>
            </div>
          )}
          {forgotMode && (
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 mt-2">
              <div className="text-xs text-stone-700 font-semibold mb-1">Reset Account Password</div>
              <input type="email" placeholder="Email address" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="w-full border border-stone-300 rounded-md px-3 py-1.5 text-xs focus:outline-none" />
              <input type="password" placeholder="New password" value={forgotNewPassword} onChange={(e) => setForgotNewPassword(e.target.value)} className="w-full border border-stone-300 rounded-md px-3 py-1.5 text-xs focus:outline-none" />
              <input type="password" placeholder="Confirm new password" value={forgotConfirm} onChange={(e) => setForgotConfirm(e.target.value)} className="w-full border border-stone-300 rounded-md px-3 py-1.5 text-xs focus:outline-none" />
              <div className="flex gap-2 justify-end pt-1">
                <button type="button" onClick={() => setForgotMode(false)} className="px-3 py-1 rounded text-xs border border-stone-300">Cancel</button>
                <button type="button" onClick={submitDirectReset} disabled={forgotLoading} className="px-4 py-1 rounded text-xs bg-amber-500 text-stone-950 font-bold">{forgotLoading ? "Updating…" : "Update Password"}</button>
              </div>
            </div>
          )}

          {tab === "signup" && (
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">Phone Number (Optional)</label>
              <input placeholder="+91 9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" />
              <p className="text-[10px] text-stone-500 mt-1">ℹ️ Delivery address will be collected easily during checkout.</p>
            </div>
          )}

          {/* CAPTCHA Protection Section */}
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-widest text-stone-600 font-extrabold">Security Check</span>
              <button type="button" onClick={fetchCaptcha} className="text-amber-700 hover:underline text-xs flex items-center gap-1 font-semibold">
                <RefreshCw size={11} /> Refresh
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-stone-950 text-amber-300 px-3.5 py-2 rounded-lg font-mono font-bold text-sm tracking-widest shrink-0 shadow-inner">
                {captcha.text || "..."}
              </div>
              <input
                type="text"
                placeholder="Enter CAPTCHA code"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 rounded-full text-sm mt-4 shadow-lg shadow-amber-500/20 transition-all">
            {tab === "login" ? "Login to Account" : "Complete Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}


function PromoShowcaseManager({ promoSettings, onPromoUpdated }) {
  const [form, setForm] = useState({
    tickerText: promoSettings?.tickerText || "🔥 GRAND FESTIVE LAUNCH | FLAT 20% OFF ON ALL SAREES & TOPS",
    couponCode: promoSettings?.couponCode || "UMA20",
    heroTag: promoSettings?.heroTag || "NEW SEASON LAUNCH 2026",
    heroTitle: promoSettings?.heroTitle || "Elegance Woven in Every Thread",
    heroSubtitle: promoSettings?.heroSubtitle || "Discover our latest Ajio-style curated collection of Kanjeevaram Silks, Organza Sarees, Designer Tops, and Royal Lehengas.",
    heroImageUrl: promoSettings?.heroImageUrl || "",
    seasonName: promoSettings?.seasonName || "Festive Season 2026",
  });

  const [saving, setSaving] = useState(false);
  const [cropFile, setCropFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (promoSettings) {
      setForm((prev) => ({ ...prev, ...promoSettings }));
    }
  }, [promoSettings]);

  const handleCropComplete = async (dataUrl, blob) => {
    setCropFile(null);
    setUploading(true);
    const token = localStorage.getItem("umas:token");
    const formData = new FormData();
    formData.append("image", blob || dataUrl, "hero-banner.jpg");

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setForm((prev) => ({ ...prev, heroImageUrl: data.imageUrl }));
      } else {
        alert(data.error || "Failed to upload hero image.");
      }
    } catch (err) {
      alert("Error uploading image file.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("umas:token");
    try {
      const res = await fetch(`${API_BASE}/settings/admin/promo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ promoSettings: form }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Seasonal Promotional Showcase updated successfully!");
        if (onPromoUpdated) onPromoUpdated();
      } else {
        alert(data.error || "Failed to update promo settings.");
      }
    } catch (err) {
      alert("Error updating promo settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-stone-800/80 border border-amber-500/30 p-6 rounded-2xl max-w-4xl space-y-6">
      {cropFile && (
        <ImageCropModal
          imageSrc={cropFile}
          onCropComplete={handleCropComplete}
          onClose={() => setCropFile(null)}
          title="Crop & Resize Seasonal Hero Image"
        />
      )}
      <div className="flex items-center justify-between border-b border-stone-700 pb-4">
        <div>
          <h2 className="font-serif text-2xl text-amber-300 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" /> Ajio-Style Seasonal Showcase Manager
          </h2>
          <p className="text-stone-400 text-xs mt-1">
            Customize homepage seasonal theme, hero headline, promotional images, ticker bar, and coupon codes.
          </p>
        </div>
        <span className="bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full border border-amber-500/30 font-mono">
          Live Store Control
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block uppercase tracking-wider text-stone-400 mb-1 font-bold">Season Name / Event</label>
            <input
              value={form.seasonName}
              onChange={(e) => setForm({ ...form, seasonName: e.target.value })}
              placeholder="e.g. Summer Saree Festival 2026"
              className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2.5 text-sm text-stone-100 focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider text-stone-400 mb-1 font-bold">Promo Coupon Code</label>
            <input
              value={form.couponCode}
              onChange={(e) => setForm({ ...form, couponCode: e.target.value })}
              placeholder="e.g. UMA20"
              className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2.5 text-sm text-amber-300 font-mono font-bold focus:border-amber-400"
            />
          </div>
        </div>

        <div>
          <label className="block uppercase tracking-wider text-stone-400 mb-1 font-bold">Top Offer Ticker Banner Text</label>
          <input
            value={form.tickerText}
            onChange={(e) => setForm({ ...form, tickerText: e.target.value })}
            placeholder="e.g. 🔥 GRAND FESTIVE LAUNCH | FLAT 20% OFF ON ALL SAREES & TOPS"
            className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2.5 text-sm text-stone-100 focus:border-amber-400"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block uppercase tracking-wider text-stone-400 mb-1 font-bold">Hero Badge Tagline</label>
            <input
              value={form.heroTag}
              onChange={(e) => setForm({ ...form, heroTag: e.target.value })}
              placeholder="e.g. NEW SEASON LAUNCH 2026"
              className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2.5 text-sm text-stone-100 focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider text-stone-400 mb-1 font-bold">Hero Main Headline Title</label>
            <input
              value={form.heroTitle}
              onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
              placeholder="e.g. Elegance Woven in Every Thread"
              className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2.5 text-sm text-stone-100 focus:border-amber-400"
            />
          </div>
        </div>

        <div>
          <label className="block uppercase tracking-wider text-stone-400 mb-1 font-bold">Hero Subtitle Description</label>
          <textarea
            rows={3}
            value={form.heroSubtitle}
            onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
            placeholder="Detailed seasonal promotion tagline..."
            className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2.5 text-xs text-stone-100 focus:border-amber-400"
          />
        </div>

        <div>
          <label className="block uppercase tracking-wider text-stone-400 mb-1 font-bold">Seasonal Hero Background Image (Crop & Upload)</label>
          <div className="flex gap-3 items-center">
            {form.heroImageUrl ? (
              <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-amber-500/40 bg-stone-950 flex-shrink-0">
                <img src={getImageUrl(form.heroImageUrl)} alt="Hero Preview" className="w-full h-full object-cover" />
              </div>
            ) : null}
            <label className="cursor-pointer bg-stone-900 hover:bg-stone-700 text-amber-300 font-medium px-4 py-2.5 rounded-lg border border-stone-700 transition-colors inline-flex items-center gap-2">
              <Upload size={16} />
              <span>{uploading ? "Uploading..." : form.heroImageUrl ? "Crop & Change Image" : "Choose & Crop Hero Image"}</span>
              <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) setCropFile(e.target.files[0]); }} className="hidden" disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-700 flex justify-end">
          <button
            type="submit"
            disabled={saving || uploading}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20"
          >
            {saving ? "Saving Showcase..." : "Publish Promotional Showcase Theme"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* --------------------------------- Admin Theme Manager --------------------------------- */

function AdminThemeManager({ activeTheme, onThemeUpdated, showToast }) {
  const [selectedTheme, setSelectedTheme] = useState(activeTheme || "summer");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeTheme) setSelectedTheme(activeTheme);
  }, [activeTheme]);

  const themes = [
    {
      key: "summer",
      name: "Summer Sun",
      icon: "☀️",
      desc: "Vibrant amber & yellow tones — lightweight chiffons & summer prints",
      preview: "bg-gradient-to-br from-amber-800 via-orange-700 to-yellow-800",
    },
    {
      key: "winter",
      name: "Winter Snow",
      icon: "❄️",
      desc: "Cool sky blues & slate tones — cozy Kanjeevaram & winter bridal wear",
      preview: "bg-gradient-to-br from-sky-950 via-blue-900 to-slate-950",
    },
    {
      key: "rainy",
      name: "Monsoon Rain",
      icon: "🌧️",
      desc: "Deep teal & emerald tones — georgette & rain-resistant silks",
      preview: "bg-gradient-to-br from-teal-900 via-emerald-800 to-cyan-900",
    },
    {
      key: "spring",
      name: "Spring Blossom",
      icon: "🌸",
      desc: "Soft rose & pink tones — pastel organzas & floral celebration wear",
      preview: "bg-gradient-to-br from-rose-900 via-pink-800 to-purple-900",
    },
  ];

  const handleApply = async (themeKey) => {
    setSaving(true);
    setSelectedTheme(themeKey);
    const token = localStorage.getItem("umas:token");

    try {
      const res = await fetch(`${API_BASE}/settings/admin/active-theme`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ theme: themeKey }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("umas:activeTheme", themeKey);
        if (onThemeUpdated) onThemeUpdated(themeKey);
        window.dispatchEvent(new StorageEvent("storage", { key: "umas:activeTheme", newValue: themeKey }));
        if (showToast) showToast(`Global store theme updated to "${themeKey.toUpperCase()}"! All mobile & desktop visitors now see this theme.`);
      } else {
        alert(data.error || "Failed to update global theme.");
      }
    } catch (err) {
      console.error("Error updating theme:", err);
      alert("Error saving theme to server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-stone-900 font-bold mb-1">🎨 Global Seasonal Theme Control</h2>
        <p className="text-stone-500 text-sm">Select the active storefront theme. When changed here, the new seasonal theme updates globally across all customer mobile phones, tablets, and desktop browsers in real time.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {themes.map((t) => (
          <div
            key={t.key}
            className={`rounded-xl border-2 p-5 transition-all cursor-pointer ${selectedTheme === t.key ? "border-amber-500 bg-amber-50/60 shadow-md" : "border-stone-200 bg-white hover:border-amber-300"}`}
            onClick={() => handleApply(t.key)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-lg ${t.preview} flex items-center justify-center text-2xl shadow-inner shrink-0`}>
                {t.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 text-sm">{t.name}</span>
                  {selectedTheme === t.key && (
                    <span className="bg-amber-500 text-stone-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">✓ Active Everywhere</span>
                  )}
                </div>
                <p className="text-stone-500 text-xs mt-0.5">{t.desc}</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleApply(t.key); }}
              disabled={saving}
              className={`w-full py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-all ${selectedTheme === t.key ? "bg-amber-500 text-stone-950 shadow-sm font-extrabold" : "bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200"}`}
            >
              {saving && selectedTheme === t.key ? "Publishing Globally…" : selectedTheme === t.key ? "✓ Currently Active (All Devices)" : `Apply ${t.name} to All Visitors`}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 text-xs text-stone-600">
        <span className="text-amber-800 font-semibold">ℹ️ Global Cloud Sync: </span>
        Changes are saved directly to the database. Whenever any customer opens the site on mobile or PC, they automatically receive this chosen seasonal theme.
      </div>
    </div>
  );
}

/* --------------------------------- Admin Dashboard --------------------------------- */

function AdminDashboard({ products, orders, stats, saveProduct, deleteProduct, updateOrderStatus, setView, analyticsFilter, setAnalyticsFilter, promoSettings, onPromoUpdated, showToast, activeTheme, onThemeUpdated, categories = DEFAULT_CATEGORIES, onAddCategory, onDeleteCategory }) {
  const [adminTab, setAdminTab] = useState("analytics");
  const [paymentVerificationMethod, setPaymentVerificationMethod] = useState("all");
  const [customers, setCustomers] = useState([]);
  const [banners, setBanners] = useState([]);
  const [adminOrderList, setAdminOrderList] = useState(orders || []);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  useEffect(() => {
    if (orders) setAdminOrderList(orders);
  }, [orders]);

  const [returnReqs, setReturnReqs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [trackingDetails, setTrackingDetails] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingSearchQuery, setTrackingSearchQuery] = useState("");
  const [trackingStatusFilter, setTrackingStatusFilter] = useState("all");
  const [trackingPaymentFilter, setTrackingPaymentFilter] = useState("all");
  const [directTrackInput, setDirectTrackInput] = useState("");
  const [statusUpdate, setStatusUpdate] = useState({});
  const [paymentSettings, setPaymentSettings] = useState({
    cod: { enabled: true, customMessage: "" },
    online: { enabled: true, customMessage: "" },
    upi: { enabled: true, phoneNumber: "", upiId: UPI_ID, qrImageUrl: "" },
  });
  const [upiQrUploading, setUpiQrUploading] = useState(false);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newBanner, setNewBanner] = useState({ title: "", description: "", image_url: "", category: "Summer Season" });
  const [editingAdminReview, setEditingAdminReview] = useState(null);

  // Inline stock edit state
  const [stockEditId, setStockEditId] = useState(null);
  const [stockEditVal, setStockEditVal] = useState("");

  // Customer detail modal state
  const [customerDetailModal, setCustomerDetailModal] = useState(null); // { customer, cart, orders, transactions }
  const [customerDetailLoading, setCustomerDetailLoading] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, [paymentVerificationMethod]);

  const fetchAdminData = async () => {
    const token = localStorage.getItem("umas:token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const oRes = await fetch(`${API_BASE}/admin/orders`, { headers });
      const oData = await oRes.json();
      if (oRes.ok) setAdminOrderList(oData.orders || []);

      const cRes = await fetch(`${API_BASE}/admin/customers`, { headers });
      const cData = await cRes.json();
      if (cRes.ok) setCustomers(cData.customers || []);

      const bRes = await fetch(`${API_BASE}/banners/admin`, { headers });
      const bData = await bRes.json();
      if (bRes.ok) setBanners(bData.banners || []);

      const rRes = await fetch(`${API_BASE}/returns/admin`, { headers });
      const rData = await rRes.json();
      if (rRes.ok) setReturnReqs(rData.returnRequests || []);

      const revRes = await fetch(`${API_BASE}/reviews/admin`, { headers });
      const revData = await revRes.json();
      if (revRes.ok) setReviews(revData.reviews || []);

      const pRes = await fetch(`${API_BASE}/settings/payment-methods`);
      const pData = await pRes.json();
      if (pRes.ok && pData.paymentMethods) setPaymentSettings(pData.paymentMethods);

      const queryString = paymentVerificationMethod && paymentVerificationMethod !== "all" ? `?paymentMethod=${paymentVerificationMethod}` : "";
      const ppRes = await fetch(`${API_BASE}/admin/payments/pending${queryString}`, { headers });
      const ppData = await ppRes.json();
      if (ppRes.ok) setPendingPayments(ppData.pendingPayments || []);
    } catch (e) {
      console.error("Error fetching admin sub-data:", e);
    }
  };

  const downloadAnalyticsReport = () => {
    const rows = [];
    rows.push(["Analytics Report", "Filter", analyticsFilter || "All Time"]);
    rows.push(["Total Revenue", stats?.revenue || 0]);
    rows.push(["Total Orders", stats?.totalOrders || 0]);
    rows.push(["Pending Orders", stats?.pendingOrders || 0]);
    rows.push(["Completed Orders", stats?.completedOrders || 0]);
    rows.push(["Cancelled Orders", stats?.cancelledOrders || 0]);
    rows.push(["Returned Orders", stats?.returnedOrders || 0]);
    rows.push(["Total Customers", stats?.totalCustomers || 0]);
    rows.push(["New Customers", stats?.newCustomers || 0]);
    rows.push([]);
    rows.push(["Category", "Revenue"]);
    (stats?.revenueByCategory || []).forEach((item) => rows.push([item.name, item.value]));
    rows.push([]);
    rows.push(["Order Status", "Count"]);
    (stats?.ordersByStatus || []).forEach((item) => rows.push([item.name, item.value]));

    const csvContent = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `umas-analytics-${(analyticsFilter || "all").replace(/\s+/g, "_").toLowerCase()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("umas:token");
    try {
      const res = await fetch(`${API_BASE}/banners/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newBanner),
      });
      if (res.ok) {
        alert("Banner created!");
        setNewBanner({ title: "", description: "", image_url: "", category: "Summer Season" });
        fetchAdminData();
      }
    } catch (e) {
      alert("Error saving banner.");
    }
  };

  const handleDeleteBanner = async (id) => {
    const token = localStorage.getItem("umas:token");
    await fetch(`${API_BASE}/banners/admin/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchAdminData();
  };

  const handleSavePaymentSettings = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("umas:token");
    try {
      const res = await fetch(`${API_BASE}/settings/admin/payment-methods`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentMethods: paymentSettings }),
      });
      if (res.ok) alert("Payment settings updated!");
      else {
        const data = await res.json();
        alert(data.error || "Error updating payment settings.");
      }
    } catch (e) {
      alert("Error updating payment settings.");
    }
  };

  const handleUpdateReturnStatus = async (id, status, adminNotes = "") => {
    const token = localStorage.getItem("umas:token");
    try {
      const res = await fetch(`${API_BASE}/returns/admin/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, adminNotes }),
      });
      if (res.ok) fetchAdminData();
    } catch (e) {
      alert("Error updating return status.");
    }
  };

  const handleUpdateReviewStatus = async (id, status) => {
    const token = localStorage.getItem("umas:token");
    try {
      const res = await fetch(`${API_BASE}/reviews/admin/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchAdminData();
    } catch (e) {
      alert("Error updating review status.");
    }
  };

  const handleUpdateOrderStatusAdmin = async (orderId, status) => {
    const token = localStorage.getItem("umas:token");
    try {
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchAdminData();
        alert(`Order status updated to ${status}`);
        if (trackingOrder?.id === orderId) {
          setTrackingOrder({ ...trackingOrder, status });
        }
      } else {
        alert(data.error || "Failed to update order status.");
      }
    } catch (e) {
      alert("Error updating order status.");
    }
  };

  const fetchTrackingDetails = async () => {
    if (!trackingOrder) return;
    setTrackingLoading(true);
    const token = localStorage.getItem("umas:token");
    try {
      const res = await fetch(`${API_BASE}/orders/${trackingOrder.id}/tracking`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTrackingDetails(data.tracking || null);
      } else {
        setTrackingDetails(null);
      }
    } catch (e) {
      setTrackingDetails(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleDirectTrack = (e) => {
    if (e) e.preventDefault();
    const query = (directTrackInput || "").trim().toLowerCase();
    if (!query) return;
    const match = adminOrderList.find((o) =>
      String(o.orderNumber || "").toLowerCase() === query ||
      String(o.id || "").toLowerCase() === query ||
      String(o._id || "").toLowerCase() === query ||
      (o.paymentReference && String(o.paymentReference).toLowerCase() === query)
    );
    if (match) {
      setTrackingOrder(match);
      setTrackingSearchQuery(match.orderNumber || "");
      showToast?.(`Loaded tracking for order #${match.orderNumber}`);
    } else {
      alert(`No order found matching Order ID "${directTrackInput}".`);
    }
  };

  const filteredTrackingOrders = useMemo(() => {
    return adminOrderList.filter((ord) => {
      const q = trackingSearchQuery.trim().toLowerCase();
      const matchesQuery = !q ||
        String(ord.orderNumber || "").toLowerCase().includes(q) ||
        String(ord.id || "").toLowerCase().includes(q) ||
        String(ord._id || "").toLowerCase().includes(q) ||
        (ord.shipping?.name && ord.shipping.name.toLowerCase().includes(q)) ||
        (ord.shipping?.phone && ord.shipping.phone.toLowerCase().includes(q)) ||
        (ord.shipping?.city && ord.shipping.city.toLowerCase().includes(q)) ||
        (ord.shipping?.address && ord.shipping.address.toLowerCase().includes(q)) ||
        (ord.shipping?.pincode && String(ord.shipping.pincode).toLowerCase().includes(q)) ||
        (ord.userEmail && ord.userEmail.toLowerCase().includes(q)) ||
        (ord.paymentReference && ord.paymentReference.toLowerCase().includes(q));

      const matchesStatus = trackingStatusFilter === "all" || ord.status === trackingStatusFilter;
      const matchesPayment = trackingPaymentFilter === "all" || ord.paymentStatus === trackingPaymentFilter;

      return matchesQuery && matchesStatus && matchesPayment;
    });
  }, [adminOrderList, trackingSearchQuery, trackingStatusFilter, trackingPaymentFilter]);

  useEffect(() => {
    if (!trackingOrder) {
      setTrackingDetails(null);
      setTrackingLoading(false);
      return;
    }

    fetchTrackingDetails();
  }, [trackingOrder]);

  // Payment verification handlers
  const handleVerifyPayment = async (orderId, notes = "") => {
    const token = localStorage.getItem("umas:token");
    try {
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notes, paymentChannel: "Admin Verified" }),
      });
      if (res.ok) {
        fetchAdminData();
        alert("Payment verified! Invoice generated.");
      } else {
        const d = await res.json();
        alert(d.error || "Failed to verify payment.");
      }
    } catch (e) {
      alert("Error verifying payment.");
    }
  };

  const handleRejectPayment = async (orderId) => {
    const token = localStorage.getItem("umas:token");
    try {
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "Cancelled" }),
      });
      if (res.ok) {
        fetchAdminData();
        alert("Order cancelled — payment rejected.");
      }
    } catch (e) {
      alert("Error rejecting payment.");
    }
  };

  // Inline stock save
  const handleSaveStock = async (productId) => {
    const newStock = parseInt(stockEditVal, 10);
    if (isNaN(newStock) || newStock < 0) { alert("Enter a valid stock number."); return; }
    await saveProduct({ id: productId, stock: newStock });
    setStockEditId(null);
    setStockEditVal("");
  };

  // Customer cart & orders modal
  const handleViewCustomerDetail = async (customer) => {
    setCustomerDetailLoading(true);
    setCustomerDetailModal({ customer, cart: [], orders: [], transactions: [] });
    const token = localStorage.getItem("umas:token");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [cartRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE}/admin/customers/${customer.id}/cart`, { headers }),
        fetch(`${API_BASE}/admin/customers/${customer.id}/orders`, { headers }),
      ]);
      const cartData = await cartRes.json();
      const ordersData = await ordersRes.json();
      setCustomerDetailModal({
        customer,
        cart: cartData.cart || [],
        cartTotal: cartData.cartTotal || 0,
        orders: ordersData.orders || [],
        transactions: ordersData.transactions || [],
      });
    } catch (e) {
      console.error("Error loading customer detail:", e);
    } finally {
      setCustomerDetailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 p-3 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Admin Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 bg-white border border-stone-200 rounded-xl p-5 sm:p-6 mb-6 sm:mb-8 shadow-sm">
          <div>
            <span className="text-amber-700 text-[10px] sm:text-xs tracking-widest uppercase font-bold">⚙ Admin Control Panel</span>
            <h1 className="font-serif text-2xl sm:text-3xl text-stone-900 font-bold mt-0.5">Boutique Control Center</h1>
            <p className="text-stone-500 text-xs mt-0.5 hidden sm:block">Uma's Fashion & Boutique — Storefront & Inventory Management</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => { setEditingProduct(null); setProductModalOpen(true); }}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider px-4 py-2 sm:px-5 sm:py-2.5 rounded-full flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus size={14} /> Add Product
            </button>
            <button onClick={() => setView("home")} className="bg-white border border-stone-300 text-stone-700 text-xs uppercase tracking-wider px-3 py-2 sm:px-4 sm:py-2.5 rounded-full hover:bg-stone-100 transition-colors">
              ← Exit Store
            </button>
          </div>
        </div>

        {/* Navigation Tabs — horizontally scrollable on mobile */}
        <div className="flex border-b border-stone-200 bg-white rounded-t-xl px-3 sm:px-4 overflow-x-auto mb-6 gap-1 shadow-sm" style={{ WebkitOverflowScrolling: "touch" }}>
          {[
            ["analytics", "Analytics", BarChart3],
            ["customers", "Customers", Users],
            ["inventory", "Inventory", Package],
            ["banners", "Banners", ImageIcon],
            ["theme", "Theme", Sparkles],
            ["payments", "Payments", CreditCard],
            ["payverify", `Verify${pendingPayments.length > 0 ? ` (${pendingPayments.length})` : ""}`, ShieldCheck],
            ["tracking", "Tracking", MapPin],
            ["returns", "Returns", RotateCcw],
            ["reviews", "Reviews", Star],
          ].map(([tabKey, label, Icon]) => (
            <button
              key={tabKey}
              onClick={() => setAdminTab(tabKey)}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-3.5 text-[10px] sm:text-xs uppercase tracking-wider font-bold border-b-2 shrink-0 transition-all whitespace-nowrap ${adminTab === tabKey
                ? "border-amber-600 text-amber-900 bg-amber-50/70"
                : "border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300"
                } ${tabKey === "payverify" && pendingPayments.length > 0 ? "text-amber-700 border-amber-500" : ""}`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>


        {/* Seasonal Theme Manager Tab */}
        {adminTab === "theme" && (
          <AdminThemeManager
            activeTheme={activeTheme}
            onThemeUpdated={onThemeUpdated}
            showToast={showToast}
          />
        )}

        {/* 1. Analytics Tab */}
        {adminTab === "analytics" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
              <div>
                <h2 className="font-serif text-xl text-stone-900 font-bold">Business Analytics &amp; Reports</h2>
                <p className="text-stone-500 text-sm mt-0.5">Use the filter buttons to refresh boutique analytics quickly.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-2 flex-wrap">
                  {["Today", "This Week", "This Month", "This Year"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setAnalyticsFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider font-bold transition-colors ${analyticsFilter === f ? "bg-amber-500 text-stone-950 font-extrabold shadow-sm" : "bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200"}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <button
                  onClick={downloadAnalyticsReport}
                  className="bg-stone-900 hover:bg-stone-800 text-amber-300 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                >
                  Download Report
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white border border-stone-200 p-4 sm:p-5 rounded-xl shadow-sm">
                <div className="text-stone-500 text-xs uppercase tracking-wider font-semibold">Total Revenue</div>
                <div className="text-xl sm:text-2xl font-serif text-amber-700 font-bold mt-1">{inr(stats?.revenue || 0)}</div>
              </div>
              <div className="bg-white border border-stone-200 p-4 sm:p-5 rounded-xl shadow-sm">
                <div className="text-stone-500 text-xs uppercase tracking-wider font-semibold">Total Orders</div>
                <div className="text-xl sm:text-2xl font-serif text-stone-900 font-bold mt-1">{stats?.totalOrders || 0}</div>
              </div>
              <div className="bg-white border border-stone-200 p-4 sm:p-5 rounded-xl shadow-sm">
                <div className="text-stone-500 text-xs uppercase tracking-wider font-semibold">Total Customers</div>
                <div className="text-xl sm:text-2xl font-serif text-stone-900 font-bold mt-1">{stats?.totalCustomers || customers.length}</div>
              </div>
              <div className="bg-white border border-stone-200 p-4 sm:p-5 rounded-xl shadow-sm">
                <div className="text-stone-500 text-xs uppercase tracking-wider font-semibold">Pending Orders</div>
                <div className="text-xl sm:text-2xl font-serif text-amber-700 font-bold mt-1">{stats?.pendingOrders || 0}</div>
              </div>
            </div>

            {/* Low Stock Warning Section */}
            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 text-rose-800 text-xs font-bold uppercase tracking-wider mb-2">
                  <AlertCircle size={16} /> Low Stock Warning
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {stats.lowStockProducts.map((lp) => (
                    <div key={lp._id} className="bg-white p-2.5 rounded-lg text-xs border border-rose-200 flex justify-between items-center shadow-sm">
                      <span className="text-stone-800 font-medium">{lp.name}</span>
                      <span className="font-bold text-rose-700">Only {lp.stock} left</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Customers Tab */}
        {adminTab === "customers" && (
          <div className="space-y-6">
            <h2 className="font-serif text-xl text-stone-900 font-bold">Customer Management</h2>
            {/* Scrollable table on mobile */}
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
                <table className="w-full text-left text-xs text-stone-700 min-w-[640px]">
                  <thead className="bg-stone-100 text-stone-800 uppercase tracking-wider font-bold border-b border-stone-200">
                    <tr>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Phone Number</th>
                      <th className="p-3">Registration Date</th>
                      <th className="p-3">Account Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-3 font-semibold text-stone-900">{c.name}</td>
                        <td className="p-3 text-stone-600">{c.email}</td>
                        <td className="p-3 text-stone-600">{c.phone}</td>
                        <td className="p-3 text-stone-500">{formatDateTime(c.registrationDate)}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${c.status === "Active" ? "bg-emerald-50 text-emerald-800 border border-emerald-300" : "bg-rose-50 text-rose-800 border border-rose-300"}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3 flex gap-2">
                          <button
                            onClick={() => handleViewCustomerDetail(c)}
                            className="bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 px-2.5 py-1 rounded text-xs flex items-center gap-1 font-medium transition-colors"
                          >
                            <ShoppingBag size={11} /> Cart & Orders
                          </button>
                          <button
                            onClick={() => handleToggleCustomerStatus(c.id, c.status)}
                            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${c.status === "Active" ? "bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-200" : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200"}`}
                          >
                            {c.status === "Active" ? "Block" : "Unblock"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. Inventory Tab */}
        {adminTab === "inventory" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
              <div>
                <h2 className="font-serif text-xl text-stone-900 font-bold">Inventory &amp; Product Stock Management</h2>
                <p className="text-stone-500 text-xs mt-0.5">Manage live product listings, stock levels, and store categories.</p>
              </div>
              <button
                onClick={() => { setEditingProduct(null); setProductModalOpen(true); }}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-full flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus size={14} /> Add Product
              </button>
            </div>

            {/* Category Management Control */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-3">
                <div>
                  <h3 className="font-serif text-base text-stone-900 flex items-center gap-2 font-bold">
                    <Tag size={16} className="text-amber-600" /> Product Category Options Manager
                  </h3>
                  <p className="text-xs text-stone-500">Add new categories or manage existing choices for storefront filtering and product creation.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="New category (e.g. Jewelry)"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (onAddCategory) onAddCategory(newCategoryInput);
                        setNewCategoryInput("");
                      }
                    }}
                    className="bg-white border border-stone-300 text-stone-900 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-amber-500 flex-1 sm:w-56"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (onAddCategory) onAddCategory(newCategoryInput);
                      setNewCategoryInput("");
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs px-4 py-1.5 rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <Plus size={14} /> Add Option
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 bg-stone-100 border border-stone-300 text-stone-800 text-xs px-3 py-1 rounded-full font-medium shadow-xs"
                  >
                    <span>{cat}</span>
                    {categories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => { if (onDeleteCategory) onDeleteCategory(cat); }}
                        className="text-stone-400 hover:text-rose-600 p-0.5 rounded-full transition-colors"
                        title={`Remove ${cat} category`}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
                <table className="w-full text-left text-xs text-stone-700 min-w-[640px]">
                  <thead className="bg-stone-100 text-stone-800 uppercase tracking-wider font-bold border-b border-stone-200">
                    <tr>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock Quantity</th>
                      <th className="p-3">Status Tag</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-3 font-medium text-stone-900 flex items-center gap-2">
                          {p.imageUrl && <img src={getImageUrl(p.imageUrl)} alt="" className="w-8 h-8 object-cover rounded-lg border border-stone-200" />}
                          <span>{p.name}</span>
                        </td>
                        <td className="p-3 text-stone-600">{p.category}</td>
                        <td className="p-3 font-semibold text-amber-700">{inr(p.price)}</td>
                        <td className="p-3">
                          {stockEditId === p.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                value={stockEditVal}
                                onChange={(e) => setStockEditVal(e.target.value)}
                                className="w-20 bg-white border border-amber-500 text-stone-900 px-2 py-1 rounded text-xs"
                                autoFocus
                              />
                              <button onClick={() => handleSaveStock(p.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded text-xs font-bold">
                                <Check size={11} />
                              </button>
                              <button onClick={() => { setStockEditId(null); setStockEditVal(""); }} className="bg-stone-200 text-stone-700 px-2 py-1 rounded text-xs">
                                <X size={11} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${p.stock <= (p.lowStockThreshold || 5) ? "text-rose-600" : "text-emerald-700"}`}>{p.stock}</span>
                              <button onClick={() => { setStockEditId(p.id); setStockEditVal(String(p.stock)); }} className="text-stone-400 hover:text-amber-700" title="Edit stock">
                                <Edit2 size={11} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${p.status === "Available" ? "bg-emerald-50 text-emerald-700 border-emerald-300" : p.status === "Coming Soon" ? "bg-blue-50 text-blue-700 border-blue-300" : "bg-rose-50 text-rose-700 border-rose-300"}`}>
                            {p.status || "Available"}
                          </span>
                        </td>
                        <td className="p-3 flex gap-2 flex-wrap">
                          <button onClick={() => { setEditingProduct(p); setProductModalOpen(true); }} className="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 px-2.5 py-1 rounded text-xs flex items-center gap-1 font-medium transition-colors">
                            <Edit2 size={12} /> Edit
                          </button>
                          <button onClick={() => saveProduct({ ...p, stock: p.stock + 10 })} className="bg-amber-500 hover:bg-amber-400 text-stone-950 px-2.5 py-1 rounded text-xs font-bold transition-colors">+10 Stock</button>
                          <button onClick={() => deleteProduct(p.id)} className="bg-rose-50 text-rose-700 hover:bg-rose-100 px-2.5 py-1 rounded text-xs border border-rose-200 font-medium transition-colors">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. Promotional Banners Tab */}
        {adminTab === "banners" && (
          <div className="space-y-6">
            <h2 className="font-serif text-xl text-stone-900 font-bold">Promotional Banners Management</h2>
            <form onSubmit={handleSaveBanner} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-3 max-w-xl">
              <input placeholder="Banner Title" value={newBanner.title} onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })} className="w-full bg-white border border-stone-300 p-2.5 text-xs rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-500" required />
              <input placeholder="Description" value={newBanner.description} onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })} className="w-full bg-white border border-stone-300 p-2.5 text-xs rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-500" />
              <select value={newBanner.category} onChange={(e) => setNewBanner({ ...newBanner, category: e.target.value })} className="w-full bg-white border border-stone-300 p-2.5 text-xs rounded-lg text-stone-900 focus:outline-none focus:border-amber-500">
                <option value="Summer Season">Summer Season</option>
                <option value="Winter Season">Winter Season</option>
                <option value="Festival Offers">Festival Offers</option>
                <option value="Custom">Custom</option>
              </select>
              <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-5 py-2.5 rounded-full text-xs transition-colors">Create Banner</button>
            </form>

            <div className="grid md:grid-cols-2 gap-4">
              {banners.map((b) => (
                <div key={b._id} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full uppercase font-bold border border-amber-200">{b.category}</span>
                    <h3 className="font-serif text-lg text-stone-900 font-bold mt-1.5">{b.title}</h3>
                    <p className="text-xs text-stone-500 mt-0.5">{b.description}</p>
                  </div>
                  <button onClick={() => handleDeleteBanner(b._id)} className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 p-2 rounded-lg text-xs transition-colors"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Payment Methods Settings Tab */}
        {adminTab === "payments" && (
          <form onSubmit={handleSavePaymentSettings} className="space-y-5 max-w-xl">
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="font-serif text-xl text-stone-900 font-bold">Payment Methods Settings</h2>
              <p className="text-stone-500 text-xs">Enable or disable payment methods for storefront checkout.</p>
              {[
                { key: "cod", label: "Cash on Delivery (COD)" },
                { key: "online", label: "Razorpay (Online Payment)" },
              ].map(({ key, label }) => (
                <div key={key} className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
                  <label className="flex items-center justify-between text-sm font-bold uppercase text-stone-900 cursor-pointer">
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      className="accent-amber-600"
                      checked={paymentSettings[key]?.enabled !== false}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        [key]: { ...paymentSettings[key], enabled: e.target.checked }
                      })}
                    />
                  </label>
                  <input
                    placeholder="Custom disabled message (e.g. Temporarily Unavailable)"
                    value={paymentSettings[key]?.customMessage || ""}
                    onChange={(e) => setPaymentSettings({
                      ...paymentSettings,
                      [key]: { ...paymentSettings[key], customMessage: e.target.value }
                    })}
                    className="w-full bg-white border border-stone-300 p-2 text-xs rounded-lg text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              ))}
            </div>

            <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-6 py-2.5 rounded-full text-xs shadow-sm transition-colors">Save All Payment Settings</button>
          </form>
        )}


        {/* 5b. Payment Verification Tab */}
        {adminTab === "payverify" && (
          <div className="space-y-6">
            <SectionHeader
              title="Payment Verification"
              description="Review pending payment authorizations, filter by method, and verify customer payments in one place."
            />
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={paymentVerificationMethod}
                onChange={(e) => setPaymentVerificationMethod(e.target.value)}
                className="bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500 shadow-sm"
              >
                <option value="all">All Methods</option>
                <option value="online">Razorpay (Online)</option>
                <option value="cod">Cash on Delivery</option>
              </select>
              <button onClick={fetchAdminData} className="bg-stone-100 border border-stone-300 text-stone-800 text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 hover:bg-stone-200 transition-colors">
                <RefreshCw size={13} /> Refresh
              </button>
            </div>

            {pendingPayments.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-xl p-10 text-center text-stone-500 shadow-sm">
                <ShieldCheck size={36} className="mx-auto mb-3 text-emerald-600" />
                <p className="text-sm font-semibold text-stone-800">No pending payment verifications.</p>
                <p className="text-xs text-stone-500 mt-1">All customer payments are up to date and approved.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(paymentVerificationMethod === "all"
                  ? pendingPayments
                  : pendingPayments.filter((order) => order.paymentMethod === paymentVerificationMethod)
                ).map((order) => (
                  <div key={order.id} className="bg-white border-2 border-amber-300 rounded-xl p-5 space-y-4 shadow-sm">
                    <div className="flex flex-wrap justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-amber-800 text-base">#{order.orderNumber}</span>
                          <span className="bg-amber-100 text-amber-900 text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold border border-amber-200">
                            {order.paymentMethod?.toUpperCase()}
                          </span>
                          <span className="bg-orange-100 text-orange-800 text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold border border-orange-200">
                            {order.paymentStatus === "verification_requested" ? "Verification Requested" : order.paymentStatus}
                          </span>
                        </div>
                        <div className="text-stone-500 text-xs">{formatDateTime(order.createdAt)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-amber-700 font-bold text-lg">{inr(order.total)}</div>
                        {order.paymentReference && (
                          <div className="text-xs text-stone-500 mt-0.5">Bank RRN / Payment ID: <span className="text-stone-900 font-semibold">{order.paymentReference}</span></div>
                        )}
                        {order.paymentProofUrl && (
                          <div className="text-xs text-stone-500 mt-0.5">Proof: <a href={order.paymentProofUrl} target="_blank" rel="noreferrer" className="text-amber-700 font-bold hover:underline">View Screenshot</a></div>
                        )}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Customer Info */}
                      <div className="bg-stone-50 rounded-lg p-3.5 border border-stone-200">
                        <div className="text-[10px] uppercase text-amber-800 font-bold mb-2 tracking-wider">Customer Information</div>
                        <div className="text-xs text-stone-900 font-semibold">{order.customer.name}</div>
                        <div className="text-xs text-stone-600 mt-0.5">{order.customer.email}</div>
                        <div className="text-xs text-stone-600 mt-0.5">{order.customer.phone}</div>
                      </div>
                      {/* Shipping Info */}
                      <div className="bg-stone-50 rounded-lg p-3.5 border border-stone-200">
                        <div className="text-[10px] uppercase text-amber-800 font-bold mb-2 tracking-wider">Shipping Address</div>
                        <div className="text-xs text-stone-900 font-semibold">{order.shipping.name}</div>
                        <div className="text-xs text-stone-600 mt-0.5">{order.shipping.address}, {order.shipping.city} - {order.shipping.pincode}</div>
                        <div className="text-xs text-stone-600 mt-0.5">{order.shipping.phone}</div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-stone-50 rounded-lg p-3.5 border border-stone-200">
                      <div className="text-[10px] uppercase text-amber-800 font-bold mb-2 tracking-wider">Order Items</div>
                      <div className="space-y-1.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-stone-800 font-medium">{item.name} <span className="text-stone-500">({item.size})</span> × {item.qty}</span>
                            <span className="text-amber-800 font-bold">{inr(item.price * item.qty)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          const notes = window.prompt("Add verification notes (optional):", "") || "";
                          handleVerifyPayment(order.id, notes);
                        }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors"
                      >
                        <CheckCircle size={14} /> Verify & Approve Payment
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Reject payment for order #${order.orderNumber}? This will cancel the order.`)) {
                            handleRejectPayment(order.id);
                          }
                        }}
                        className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors"
                      >
                        <XCircle size={14} /> Reject Payment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. Tracking Tab */}
        {adminTab === "tracking" && (
          <div className="space-y-6">
            <SectionHeader
              title="Order Tracking Management"
              description="Search by Order ID, filter by delivery or payment status, and manage real-time courier timeline tracking."
            />

            {/* Search & Filter Toolbar */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Search Bar */}
                <div className="md:col-span-6 relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={trackingSearchQuery}
                    onChange={(e) => setTrackingSearchQuery(e.target.value)}
                    placeholder="Search by Order ID (e.g. 1001), Customer, Phone, City..."
                    className="w-full bg-white border border-stone-300 rounded-lg pl-9 pr-8 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 shadow-xs"
                  />
                  {trackingSearchQuery && (
                    <button
                      onClick={() => setTrackingSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Delivery Status Filter */}
                <div className="md:col-span-3">
                  <select
                    value={trackingStatusFilter}
                    onChange={(e) => setTrackingStatusFilter(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-500 shadow-xs"
                  >
                    <option value="all">All Delivery Statuses</option>
                    <option value="Placed">Placed</option>
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Payment Status Filter */}
                <div className="md:col-span-3">
                  <select
                    value={trackingPaymentFilter}
                    onChange={(e) => setTrackingPaymentFilter(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-500 shadow-xs"
                  >
                    <option value="all">All Payment Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="verification_requested">Verification Requested</option>
                  </select>
                </div>
              </div>

              {/* Direct Order ID Quick Lookup & Quick Stats Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200">
                <form onSubmit={handleDirectTrack} className="flex items-center gap-2 max-w-md w-full sm:w-auto">
                  <input
                    type="text"
                    value={directTrackInput}
                    onChange={(e) => setDirectTrackInput(e.target.value)}
                    placeholder="Enter Exact Order # to track..."
                    className="bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 w-48 sm:w-60 shadow-xs"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs px-3.5 py-1.5 rounded-lg whitespace-nowrap shadow-xs transition-colors"
                  >
                    Find &amp; Track
                  </button>
                </form>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-stone-500">
                    Showing <strong className="text-stone-900 font-bold">{filteredTrackingOrders.length}</strong> of {adminOrderList.length} orders
                  </span>
                  {(trackingSearchQuery || trackingStatusFilter !== "all" || trackingPaymentFilter !== "all") && (
                    <button
                      onClick={() => {
                        setTrackingSearchQuery("");
                        setTrackingStatusFilter("all");
                        setTrackingPaymentFilter("all");
                        setDirectTrackInput("");
                      }}
                      className="text-xs text-amber-700 hover:text-amber-800 underline font-medium"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={fetchAdminData}
                    className="bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 text-xs px-3 py-1.5 rounded-lg uppercase tracking-wider font-semibold transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {adminOrderList.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-xl p-10 text-center text-stone-500 shadow-sm">
                No orders available for tracking.
              </div>
            ) : filteredTrackingOrders.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-xl p-10 text-center text-stone-500 shadow-sm">
                <Search size={28} className="mx-auto text-stone-400 mb-2" />
                <p className="text-stone-800 font-semibold">No orders matched your search criteria.</p>
                <p className="text-xs text-stone-500 mt-1">Try searching by a different Order ID, customer name, phone number, or clear filters.</p>
                <button
                  onClick={() => {
                    setTrackingSearchQuery("");
                    setTrackingStatusFilter("all");
                    setTrackingPaymentFilter("all");
                  }}
                  className="mt-3 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  Reset Search &amp; Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTrackingOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`bg-white border rounded-xl p-5 shadow-sm transition-all ${trackingOrder?.id === order.id ? "border-amber-500 ring-2 ring-amber-500/20" : "border-stone-200 hover:border-stone-300"
                      }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-bold text-stone-900 text-base">#{order.orderNumber}</span>
                          <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                            {order.paymentMethod?.toUpperCase()}
                          </span>
                          {order.paymentReference && (
                            <span className="text-[10px] text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded">
                              Ref: {order.paymentReference}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-500 mb-2">
                          Placed on {formatDateTime(order.createdAt)} • {order.items?.length || 0} items
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold ${order.status === "Delivered" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : order.status === "Cancelled" ? "bg-rose-100 text-rose-800 border border-rose-300" : "bg-amber-100 text-amber-800 border border-amber-300"}`}>
                            {order.status}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 font-medium">
                            {order.paymentStatus}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-amber-800 border border-stone-200 font-bold">
                            {inr(order.total)}
                          </span>
                          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                            Free Shipping
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <button
                          onClick={() => setTrackingOrder(order)}
                          className={`text-xs uppercase tracking-wider font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors ${trackingOrder?.id === order.id
                            ? "bg-amber-500 text-stone-950 ring-2 ring-amber-300"
                            : "bg-amber-500 hover:bg-amber-400 text-stone-950"
                            }`}
                        >
                          <Truck size={14} /> {trackingOrder?.id === order.id ? "Viewing Live Timeline" : "Track Order"}
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-[1.4fr_1fr] pt-3 border-t border-stone-200">
                      <div className="space-y-1 text-xs">
                        <div className="uppercase tracking-wider text-amber-800 font-bold">Customer &amp; Delivery Address</div>
                        <div className="text-stone-900 font-semibold">{order.shipping?.name} • <span className="text-amber-700">{order.shipping?.phone}</span></div>
                        <div className="text-stone-600">{order.shipping?.address}, {order.shipping?.city} - {order.shipping?.pincode}</div>
                        {order.userEmail && <div className="text-stone-500">{order.userEmail}</div>}
                      </div>
                      <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
                        <div className="text-xs uppercase tracking-wider text-stone-700 font-bold mb-2">Update Delivery Status</div>
                        <div className="flex gap-2">
                          <select
                            value={statusUpdate[order.id] || order.status}
                            onChange={(e) => setStatusUpdate({ ...statusUpdate, [order.id]: e.target.value })}
                            className="flex-1 bg-white border border-stone-300 text-stone-900 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500"
                          >
                            {[
                              "Placed",
                              "Processing",
                              "Packed",
                              "Shipped",
                              "Dispatched",
                              "Out for Delivery",
                              "Delivered",
                              "Cancelled",
                            ].map((step) => (
                              <option key={step} value={step}>{step}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleUpdateOrderStatusAdmin(order.id, statusUpdate[order.id] || order.status)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xs transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {trackingOrder && (
              <div className="bg-white border border-stone-200 rounded-xl p-5 mt-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="text-sm uppercase tracking-wider text-stone-500 font-bold">Tracking Preview</div>
                    <div className="text-stone-900 font-bold text-lg">Order #{trackingOrder.orderNumber}</div>
                    <div className="text-xs text-stone-500">Current status: <span className="font-semibold text-amber-700">{trackingOrder.status}</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchTrackingDetails}
                      disabled={!trackingOrder}
                      className="bg-stone-100 border border-stone-300 text-stone-700 hover:bg-stone-200 text-xs uppercase tracking-wider px-3 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Refresh
                    </button>
                    <button
                      onClick={() => setTrackingOrder(null)}
                      className="text-stone-500 hover:text-stone-800 text-xs uppercase tracking-wider font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {trackingLoading ? (
                  <div className="py-6 text-center text-stone-500">Loading tracking preview…</div>
                ) : trackingDetails ? (
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      {[
                        "Order Placed",
                        "Payment Confirmed",
                        "Processing",
                        "Packed",
                        "Shipped",
                        "Dispatched",
                        "Out for Delivery",
                        "Delivered",
                      ].map((step) => {
                        const completed = trackingDetails.timeline?.some((event) => event.status === step);
                        return (
                          <div key={step} className={`rounded-lg border p-3 text-xs uppercase tracking-wider font-bold ${completed ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-stone-50 border-stone-200 text-stone-400"}`}>
                            {step}
                          </div>
                        );
                      })}
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-wider text-stone-700 font-bold mb-3">Timeline</div>
                      <div className="space-y-3">
                        {trackingDetails.timeline?.map((event, index) => (
                          <div key={index} className="bg-stone-50 border border-stone-200 rounded-lg p-3">
                            <div className="flex items-center justify-between text-sm font-semibold text-stone-900 mb-1">
                              <span>{event.status}</span>
                              <span className="text-stone-500 text-xs font-normal">{formatDateTime(event.timestamp)}</span>
                            </div>
                            {event.description && <div className="text-stone-600 text-sm">{event.description}</div>}
                            {event.location && <div className="text-stone-500 text-xs mt-2">{event.location}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-stone-500">No tracking data available for this order.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 7. Returns Tab */}
        {adminTab === "returns" && (
          <div className="space-y-6">
            <SectionHeader
              title="Return Claims & Refund Management"
              description="Review return requests, inspect refund details, and approve or reject claims with ease."
            />
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-100 text-stone-800 uppercase tracking-wider font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3">Order #</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {returnReqs.map((r) => (
                    <tr key={r._id} className="hover:bg-stone-50">
                      <td className="p-3 font-bold text-amber-800">{r.order_number}</td>
                      <td className="p-3 text-stone-900 font-medium">{r.product_name}</td>
                      <td className="p-3 text-stone-600">{r.customer_phone}</td>
                      <td className="p-3 text-stone-600">{r.reason}{r.custom_reason ? ` (${r.custom_reason})` : ""}</td>
                      <td className="p-3 font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${r.status === "Approved" ? "bg-emerald-100 text-emerald-800" : r.status === "Rejected" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>{r.status}</span>
                      </td>
                      <td className="p-3">
                        {r.image_urls && r.image_urls.length > 0 && (
                          <div className="mb-2">
                            <img src={getImageUrl(r.image_urls[0])} alt="Return proof" className="w-24 h-24 object-cover rounded-md border border-stone-200" />
                          </div>
                        )}
                        <div className="space-y-2">
                          <button onClick={() => handleUpdateReturnStatus(r._id, "Approved", "Verified and approved")} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-2.5 py-1 rounded text-xs transition-colors">Approve</button>
                          <button onClick={() => handleUpdateReturnStatus(r._id, "Rejected", "Rejected after review")} className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-2.5 py-1 rounded text-xs transition-colors ml-2">Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. Reviews Tab */}
        {adminTab === "reviews" && (
          <div className="space-y-6">
            <h2 className="font-serif text-xl text-stone-900 font-bold">Reviews &amp; Ratings Moderation</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-stone-900">{rev.user_name}</span>
                    <RatingStars rating={rev.rating} size={14} />
                  </div>
                  <p className="text-xs text-stone-600 mb-3">{rev.comment}</p>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => handleUpdateReviewStatus(rev._id, "Approved")} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px] px-2.5 py-1 rounded transition-colors">Approve</button>
                    <button onClick={() => handleUpdateReviewStatus(rev._id, "Hidden")} className="bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold text-[10px] px-2.5 py-1 rounded transition-colors">Hide</button>
                    <button
                      onClick={() => setEditingAdminReview(rev)}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-[10px] px-2.5 py-1 rounded flex items-center gap-1 transition-colors border border-amber-300"
                    >
                      <Edit2 size={10} /> Edit Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {productModalOpen && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={() => setProductModalOpen(false)}
          onSave={saveProduct}
        />
      )}

      {editingAdminReview && (
        <WriteReviewModal
          editingReview={editingAdminReview}
          onClose={() => setEditingAdminReview(null)}
          onSubmitted={async () => {
            const token = localStorage.getItem("umas:token");
            const res = await fetch(`${API_BASE}/reviews/admin`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok) setReviews(data.reviews || []);
          }}
        />
      )}

      {/* Customer Cart & Orders Modal */}
      {customerDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-stone-200">
              <div>
                <h2 className="font-serif text-xl text-stone-900 font-bold">{customerDetailModal.customer.name}</h2>
                <p className="text-xs text-stone-500">{customerDetailModal.customer.email} • {customerDetailModal.customer.phone}</p>
              </div>
              <button onClick={() => setCustomerDetailModal(null)} className="text-stone-400 hover:text-stone-700">
                <X size={22} />
              </button>
            </div>

            {customerDetailLoading ? (
              <div className="p-10 text-center text-stone-500 text-sm">Loading customer data…</div>
            ) : (
              <div className="p-5 space-y-6">
                {/* Current Cart */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingBag size={16} className="text-amber-600" />
                    <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider">Current Cart</h3>
                    {customerDetailModal.cartTotal > 0 && (
                      <span className="ml-auto text-amber-700 font-bold text-sm">{inr(customerDetailModal.cartTotal)}</span>
                    )}
                  </div>
                  {customerDetailModal.cart.length === 0 ? (
                    <div className="bg-stone-50 rounded-lg p-4 text-xs text-stone-500 text-center border border-stone-200">Cart is empty</div>
                  ) : (
                    <div className="bg-white rounded-lg overflow-hidden border border-stone-200">
                      <table className="w-full text-xs text-stone-700">
                        <thead className="bg-stone-100 text-stone-800 uppercase font-bold border-b border-stone-200">
                          <tr>
                            <th className="p-2.5 text-left">Product</th>
                            <th className="p-2.5 text-center">Size</th>
                            <th className="p-2.5 text-center">Qty</th>
                            <th className="p-2.5 text-right">Price</th>
                            <th className="p-2.5 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          {customerDetailModal.cart.map((item) => (
                            <tr key={item.cartItemId} className="hover:bg-stone-50">
                              <td className="p-2.5 font-medium text-stone-900">{item.productName}</td>
                              <td className="p-2.5 text-center">{item.size}</td>
                              <td className="p-2.5 text-center">{item.quantity}</td>
                              <td className="p-2.5 text-right">{inr(item.price)}</td>
                              <td className="p-2.5 text-right font-bold text-amber-700">{inr(item.lineTotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Order History */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package size={16} className="text-amber-600" />
                    <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider">Order History</h3>
                  </div>
                  {customerDetailModal.orders.length === 0 ? (
                    <div className="bg-stone-50 rounded-lg p-4 text-xs text-stone-500 text-center border border-stone-200">No orders yet</div>
                  ) : (
                    <div className="space-y-3">
                      {customerDetailModal.orders.map((order) => (
                        <div key={order.id} className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900 text-xs">#{order.orderNumber}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${order.status === "Delivered" ? "bg-emerald-100 text-emerald-800" :
                                order.status === "Cancelled" ? "bg-rose-100 text-rose-800" :
                                  "bg-amber-100 text-amber-800"
                                }`}>{order.status}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${order.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-800" :
                                order.paymentStatus === "verification_requested" ? "bg-orange-100 text-orange-800" :
                                  "bg-stone-200 text-stone-700"
                                }`}>{order.paymentStatus}</span>
                            </div>
                            <span className="text-amber-700 font-bold text-sm">{inr(order.total)}</span>
                          </div>
                          <div className="text-xs text-stone-500 mb-2">{formatDateTime(order.createdAt)} • {order.paymentMethod?.toUpperCase()}</div>
                          <div className="space-y-0.5">
                            {order.items.map((item, i) => (
                              <div key={i} className="text-xs text-stone-600">
                                {item.name} ({item.size}) × {item.qty} — {inr(item.price)}
                              </div>
                            ))}
                          </div>
                          {order.invoiceUrl && (
                            <a
                              href={order.invoiceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex items-center gap-1 text-xs text-amber-700 font-semibold hover:underline"
                            >
                              <FileText size={12} /> View Invoice
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payment / Transaction History */}
                {customerDetailModal.transactions && customerDetailModal.transactions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard size={16} className="text-amber-600" />
                      <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider">Payment History</h3>
                    </div>
                    <div className="bg-white rounded-lg overflow-hidden border border-stone-200">
                      <table className="w-full text-xs text-stone-700">
                        <thead className="bg-stone-100 text-stone-800 uppercase font-bold border-b border-stone-200">
                          <tr>
                            <th className="p-2.5 text-left">Transaction ID</th>
                            <th className="p-2.5 text-left">Method</th>
                            <th className="p-2.5 text-left">Type</th>
                            <th className="p-2.5 text-right">Amount</th>
                            <th className="p-2.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          {customerDetailModal.transactions.map((tx) => (
                            <tr key={tx._id} className="hover:bg-stone-50">
                              <td className="p-2.5 font-mono text-[10px] text-stone-500">{tx.transaction_id?.slice(0, 18)}…</td>
                              <td className="p-2.5">{tx.payment_method}</td>
                              <td className="p-2.5">{tx.type}</td>
                              <td className="p-2.5 text-right font-bold text-amber-700">{inr(tx.amount)}</td>
                              <td className="p-2.5 text-center">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${tx.status === "Success" ? "bg-emerald-100 text-emerald-800" :
                                  tx.status === "Failed" ? "bg-rose-100 text-rose-800" :
                                    "bg-stone-200 text-stone-700"
                                  }`}>{tx.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------- Footer ---------------------------------- */

function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-400 border-t border-amber-500/20 py-12 px-6 text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="font-serif text-2xl text-amber-300 mb-2">Uma's</div>
          <div className="text-xs tracking-widest uppercase text-stone-500 mb-4">Fashion &amp; Boutique</div>
          <p className="text-xs text-stone-500 leading-relaxed">Handpicked sarees, bridal lehengas, kurtis and occasion wear finished for the modern wardrobe.</p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-3">Shop</div>
          <div className="flex flex-col gap-2 text-xs">
            <span>Sarees &amp; Lehengas</span>
            <span>Kurtis &amp; Tunics</span>
            <span>Western Wear</span>
            <span>Footwear &amp; Accessories</span>
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-3">Policies</div>
          <div className="flex flex-col gap-2 text-xs">
            <span>7-Day Return Policy</span>
            <span>Terms of Service</span>
            <span>Privacy &amp; Security</span>
            <span>Shipping Information</span>
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-3">Contact</div>
          <div className="text-xs text-stone-500 space-y-1">
            <div>Support: umasfashion@gmail.com</div>
            <div>Phone: +91 8489943146</div>
            <div>Theni, Tamil Nadu, India</div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-stone-900 mt-8 pt-6 text-center text-xs text-stone-600">
        © {new Date().getFullYear()} Uma's Fashion &amp; Boutique. All rights reserved.
      </div>
    </footer>
  );
}


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary Caught Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-stone-900 border border-amber-500/30 p-8 rounded-2xl max-w-lg shadow-2xl space-y-4">
            <h1 className="font-serif text-3xl text-amber-300 font-bold">Uma's Fashion & Boutique</h1>
            <p className="text-stone-300 text-sm">
              We encountered a minor display issue. Click below to refresh and restore your store session.
            </p>
            <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 font-mono text-xs text-rose-400 text-left overflow-x-auto max-h-32">
              {String(this.state.error?.message || this.state.error)}
            </div>
            <button
              onClick={() => { window.location.hash = "home"; window.location.reload(); }}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-6 py-2.5 rounded-full transition-all shadow-lg shadow-amber-500/20"
            >
              Reload Website
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* -------------------------------- Main App --------------------------------- */

// Views that should NOT be restored on page refresh (transient/payment states)
const TRANSIENT_VIEWS = new Set(["upi", "checkout", "confirmation"]);

export default function App() {
  // ── State declarations ────────────────────────────────────────────────────
  const [view, setViewRaw] = useState(() => {
    // Clear any persistent view from previous browser sessions
    if (typeof window !== "undefined") {
      localStorage.removeItem("umas:upiOrderId");
      if (sessionStorage.getItem("umas:view") === "upi") {
        sessionStorage.removeItem("umas:view");
      }
      if (window.location.hash === "#upi") {
        window.location.hash = "";
      }
      const isNewSession = !sessionStorage.getItem("umas:session_active");
      if (isNewSession) {
        sessionStorage.setItem("umas:session_active", "true");
        localStorage.removeItem("umas:view");
        window.location.hash = "";
        return "home";
      }
    }
    const hash = window.location.hash.replace("#", "");
    if (["home", "shop", "cart", "checkout", "account", "admin", "product"].includes(hash)) return hash;
    const saved = sessionStorage.getItem("umas:view");
    if (saved && !TRANSIENT_VIEWS.has(saved) && saved !== "upi") return saved;
    return "home";
  });
  const [fullZoomImage, setFullZoomImage] = useState(null);
  const [promoSettings, setPromoSettings] = useState(null);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [search, setSearch] = useState("");
  const [activeProduct, setActiveProduct] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const [upiOrder, setUpiOrder] = useState(null);
  const [hasRestoredOrder, setHasRestoredOrder] = useState(false);
  const [adminStatsFilter, setAdminStatsFilter] = useState("This Month");
  const [authOpen, setAuthOpen] = useState(false);
  const [authError, setAuthError] = useState("");
  const [toast, setToast] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [seasonalTheme, setSeasonalTheme] = useState(() => localStorage.getItem("umas:activeTheme") || "summer");
  const [showNewLaunchesModal, setShowNewLaunchesModal] = useState(false);

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  const persistCategoriesToDB = async (updatedList) => {
    const token = localStorage.getItem("umas:token");
    try {
      await fetch(`${API_BASE}/settings/admin/categories`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ categories: updatedList }),
      });
    } catch (e) {
      console.error("Failed to persist categories:", e);
    }
  };

  const handleAddCategory = (newCat) => {
    if (!newCat || !newCat.trim()) return;
    const trimmed = newCat.trim();
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      alert("Category already exists!");
      return;
    }
    const updated = [...categories, trimmed];
    setCategories(updated);
    persistCategoriesToDB(updated);
    showToast(`Category "${trimmed}" added! All customers will now see it in the shop.`);
  };

  const handleDeleteCategory = (catToDelete) => {
    if (categories.length <= 1) {
      alert("Must keep at least one category.");
      return;
    }
    if (!confirm(`Are you sure you want to remove the "${catToDelete}" category? Customers will no longer see it in the shop.`)) return;
    const updated = categories.filter((c) => c !== catToDelete);
    setCategories(updated);
    persistCategoriesToDB(updated);
    showToast(`Category "${catToDelete}" removed. Customers will no longer see it.`);
  };

  // ── setView: persists to sessionStorage + URL hash ──────────────────────────
  const setView = (nextView) => {
    setViewRaw(nextView);
    if (!TRANSIENT_VIEWS.has(nextView)) {
      sessionStorage.setItem("umas:view", nextView);
      window.location.hash = nextView;
    }
  };

  // Scroll to top whenever view changes
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [view, activeProduct]);

  // Sync hash changes from back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (["home", "shop", "cart", "checkout", "account", "admin"].includes(hash)) setViewRaw(hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // React to Admin theme changes dispatched via localStorage storage event
  useEffect(() => {
    const handleStorageTheme = (e) => {
      if (e.key === "umas:activeTheme" && e.newValue) {
        setSeasonalTheme(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorageTheme);
    return () => window.removeEventListener("storage", handleStorageTheme);
  }, []);

  // Cross-Device Cart Sync: Re-fetch cart when tab or window comes into focus
  useEffect(() => {
    const handleSyncOnFocus = () => {
      if (document.visibilityState === "visible") {
        const token = localStorage.getItem("umas:token");
        if (token) {
          fetchCart(token);
        }
      }
    };
    document.addEventListener("visibilitychange", handleSyncOnFocus);
    window.addEventListener("focus", handleSyncOnFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleSyncOnFocus);
      window.removeEventListener("focus", handleSyncOnFocus);
    };
  }, []);

  useEffect(() => { initApp(); }, []);

  useEffect(() => {
    if (currentUser?.isAdmin) fetchAdminData();
  }, [adminStatsFilter]);

  const fetchActiveTheme = async () => {
    try {
      const res = await fetch(`${API_BASE}/settings/active-theme`);
      const data = await res.json();
      if (res.ok && data.activeTheme) {
        setSeasonalTheme(data.activeTheme);
        localStorage.setItem("umas:activeTheme", data.activeTheme);
      }
    } catch (e) {
      console.error("Error fetching active theme:", e);
    }
  };

  const fetchPromoSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/settings/promo`);
      const data = await res.json();
      if (res.ok && data.promoSettings) setPromoSettings(data.promoSettings);
    } catch (e) {
      console.error("Error fetching promo settings:", e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/settings/categories`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.categories) && data.categories.length > 0) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.error("Error fetching categories:", e);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const initApp = async () => {
    await fetchActiveTheme();
    await fetchCategories();
    await fetchProducts();
    await fetchBanners();
    await fetchPromoSettings();

    const token = localStorage.getItem("umas:token");
    if (token) {
      await fetchMe(token);
    } else {
      // If no token but we've restored an auth-only view, reset to home
      const restoredView = sessionStorage.getItem("umas:view");
      if (restoredView === "account" || restoredView === "admin") {
        setView("home");
      }
    }
    setLoaded(true);
  };

  const persistUpiOrder = (order) => {
    if (!order?.id) return;
    localStorage.setItem("umas:upiOrderId", order.id);
    localStorage.removeItem("umas:lastOrderId");
  };

  const persistLastOrder = (order) => {
    if (!order?.id) return;
    localStorage.setItem("umas:lastOrderId", order.id);
    localStorage.removeItem("umas:upiOrderId");
  };

  const clearStoredOrderState = () => {
    localStorage.removeItem("umas:upiOrderId");
    localStorage.removeItem("umas:lastOrderId");
  };

  const cancelPendingUpiOrder = () => {
    clearStoredOrderState();
    setUpiOrder(null);
    showToast("Payment cancelled. Your products are safely saved in your cart.");
    setView("cart");
  };

  const goToShop = () => {
    if (upiOrder) {
      cancelPendingUpiOrder();
      return;
    }
    setView("shop");
  };

  const handleSetView = (nextView) => {
    if (upiOrder && nextView !== "upi" && nextView !== "checkout") {
      cancelPendingUpiOrder();
      return;
    }
    setView(nextView);
  };

  const restoreStoredOrderState = async (token) => {
    if (!token) return;
    const upiOrderId = localStorage.getItem("umas:upiOrderId");
    const lastOrderId = localStorage.getItem("umas:lastOrderId");

    let idToRestore = upiOrderId || lastOrderId;
    if (!idToRestore) {
      setHasRestoredOrder(true);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/orders/${idToRestore}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.order) {
        clearStoredOrderState();
        setHasRestoredOrder(true);
        return;
      }

      const order = data.order;
      setLastOrder(order);
    } catch (e) {
      console.error("Failed to restore pending order state:", e);
    } finally {
      setHasRestoredOrder(true);
    }
  };

  useEffect(() => {
    if (currentUser && !hasRestoredOrder) {
      restoreStoredOrderState(localStorage.getItem("umas:token"));
    }
  }, [currentUser, hasRestoredOrder]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      if (res.ok) setProducts(data.products || []);
    } catch (e) {
      console.error("Error fetching products:", e);
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${API_BASE}/banners`);
      const data = await res.json();
      if (res.ok) setBanners(data.banners || []);
    } catch (e) {
      console.error("Error fetching banners:", e);
    }
  };

  const fetchMe = async (token) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        await fetchCart(token);
        await fetchMyOrders(token);
        if (data.user.isAdmin) {
          await fetchAdminData();
        }
      } else {
        localStorage.removeItem("umas:token");
      }
    } catch (e) {
      console.error("Error fetching auth state:", e);
    }
  };

  const fetchMyOrders = async (token) => {
    try {
      const res = await fetch(`${API_BASE}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setOrders(data.orders || []);
    } catch (e) {
      console.error("Error fetching orders:", e);
    }
  };

  const fetchAdminData = async () => {
    const token = localStorage.getItem("umas:token");
    if (!token) return;
    try {
      const statsQuery = adminStatsFilter ? `?filter=${encodeURIComponent(adminStatsFilter)}` : "";
      const sRes = await fetch(`${API_BASE}/admin/stats${statsQuery}`, { headers: { Authorization: `Bearer ${token}` } });
      const sData = await sRes.json();
      if (sRes.ok) setAdminStats(sData);

      const oRes = await fetch(`${API_BASE}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } });
      const oData = await oRes.json();
      if (oRes.ok) setAdminOrders(oData.orders || []);
    } catch (e) {
      console.error("Error fetching admin stats:", e);
    }
  };

  const fetchCart = async (token) => {
    const t = token || localStorage.getItem('umas:token');
    try {
      const res = await fetch(`${API_BASE}/cart`, { headers: t ? { Authorization: `Bearer ${t}` } : {} });
      const data = await res.json();
      if (res.ok) setCart(data.items || []);
    } catch (e) {
      console.error('Error fetching cart:', e);
    }
  };

  const handleLogin = async (email, password, captchaToken, captchaAnswer) => {
    setAuthError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, captchaToken, captchaAnswer }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("umas:token", data.token);
        setCurrentUser(data.user);
        setAuthOpen(false);
        await fetchCart(data.token);
        await fetchMyOrders(data.token);
        showToast("Logged in successfully!");
      } else {
        setAuthError(data.error || "Login failed.");
      }
    } catch (e) {
      setAuthError("Network error.");
    }
  };

  const handleSignup = async (payload) => {
    setAuthError("");
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("umas:token", data.token);
        setCurrentUser(data.user);
        setAuthOpen(false);
        await fetchCart(data.token);
        showToast("Account created successfully!");
      } else {
        setAuthError(data.error || "Registration failed.");
      }
    } catch (e) {
      setAuthError("Network error.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("umas:token");
    setCurrentUser(null);
    setCart([]);
    setOrders([]);
    setView("home");
    clearStoredOrderState();
    showToast("Logged out successfully.");
  };

  const uploadProofImage = async (file) => {
    const token = localStorage.getItem("umas:token");
    if (!file || !token) return null;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) return data.imageUrl;
      alert(data.error || "Failed to upload proof image.");
    } catch (e) {
      alert("Error uploading proof image.");
    }
    return null;
  };

  const addToCart = async (product, size, quantity) => {
    if (!currentUser) {
      setAuthOpen(true);
      return;
    }
    const token = localStorage.getItem("umas:token");
    try {
      const res = await fetch(`${API_BASE}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id, size, quantity }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchCart();
        showToast(`Added ${quantity} × ${product.name} to cart.`);
      } else {
        alert(data.error || "Failed to add to cart.");
      }
    } catch (e) {
      alert("Error adding item to cart.");
    }
  };

  const updateQty = async (cartItemId, quantity) => {
    const token = localStorage.getItem("umas:token");
    try {
      const res = await fetch(`${API_BASE}/cart/${cartItemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (res.ok) await fetchCart();
    } catch (e) {
      console.error(e);
    }
  };

  const removeItem = async (cartItemId) => {
    const token = localStorage.getItem("umas:token");
    try {
      const res = await fetch(`${API_BASE}/cart/${cartItemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) await fetchCart();
    } catch (e) {
      console.error(e);
    }
  };

  const placeOrder = async (address, paymentMethod, total) => {
    const token = localStorage.getItem("umas:token");
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentMethod, shipping: address }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to place order.");
        return;
      }

      const order = data.order;
      if (paymentMethod === "cod") {
        setLastOrder(order);
        setCart([]);
        setView("confirmation");
        persistLastOrder(order);
        await fetchMyOrders(token);
        showToast("Order placed successfully!");
        return;
      }

      if (paymentMethod === "online") {
        try {
          const rpRes = await fetch(`${API_BASE}/payments/razorpay/create-order`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ orderId: order.id }),
          });
          const rpData = await rpRes.json();
          if (rpRes.ok && rpData.razorpayOrderId && window.Razorpay) {
            const options = {
              key: rpData.keyId,
              amount: rpData.amount,
              currency: rpData.currency,
              name: "Uma's Fashion & Boutique",
              description: `Order #${order.orderNumber}`,
              order_id: rpData.razorpayOrderId,
              handler: async function (response) {
                const paymentRef = response.razorpay_payment_id || "";
                try {
                  await fetch(`${API_BASE}/payments/razorpay/verify-payment`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      orderId: order.id,
                      razorpay_order_id: response.razorpay_order_id || rpData.razorpayOrderId,
                      razorpay_payment_id: paymentRef,
                      razorpay_signature: response.razorpay_signature || "",
                    }),
                  });
                } catch (e) {
                  console.error("Payment verification API call error:", e);
                }
                const paidOrder = { ...order, paymentReference: paymentRef, paymentStatus: "paid", status: "Processing" };
                setLastOrder(paidOrder);
                clearStoredOrderState();
                setCart([]);
                setView("confirmation");
                await fetchMyOrders(token);
                showToast("Payment successful! Your order has been placed.");
              },
              prefill: {
                name: address.name,
                phone: address.phone,
              },
              theme: {
                color: "#f59e0b",
              },
              modal: {
                ondismiss: function () {
                  showToast("Payment was not completed. Your products remain saved in your cart.");
                },
              },
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
            return;
          }
        } catch (e) {
          console.error("Razorpay trigger error:", e);
        }
      }

      setLastOrder(order);
      clearStoredOrderState();
      setCart([]);
      setView("confirmation");
      await fetchMyOrders(token);
      showToast("Order placed successfully!");
    } catch (e) {
      alert("Error placing order. Your cart items are preserved.");
    }
  };

  const confirmUpiPayment = async ({ orderId, paymentReference, paymentProofUrl, paymentProofFile }) => {
    const token = localStorage.getItem("umas:token");
    let proofUrl = paymentProofUrl;

    if (paymentProofFile) {
      proofUrl = await uploadProofImage(paymentProofFile);
      if (!proofUrl) {
        return null;
      }
    }

    try {
      const res = await fetch(`${API_BASE}/payments/upi/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, paymentReference, paymentProofUrl: proofUrl, paymentChannel: "UPI" }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to confirm payment.");
        return null;
      }
      if (data.order) {
        setUpiOrder(data.order);
        persistUpiOrder(data.order);
        setLastOrder(data.order);
        clearStoredOrderState();
        setCart([]); // Payment completed and verified -> remove ordered products from cart!
        await fetchCart(token); // refresh server cart
        await fetchMyOrders(token);
        setView("confirmation");
        showToast("Bank RRN no / Payment ID submitted! Order placed under admin verification.");
        return data.order;
      }
      return null;
    } catch (e) {
      alert("Error confirming payment.");
      return null;
    }
  };

  const saveProduct = async (product) => {
    const token = localStorage.getItem("umas:token");
    const isEdit = !!product.id;
    const url = isEdit ? `${API_BASE}/products/${product.id}` : `${API_BASE}/products`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      });

      if (res.ok) {
        await fetchProducts();
        await fetchAdminData();
        showToast(isEdit ? "Product updated" : "Product added");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save product.");
      }
    } catch (e) {
      alert("Error saving product.");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const token = localStorage.getItem("umas:token");
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchProducts();
        await fetchAdminData();
        showToast("Product deleted.");
      }
    } catch (e) {
      alert("Error deleting product.");
    }
  };

  const openProduct = (product) => {
    setActiveProduct(product);
    setView("product");
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-amber-300 font-serif text-xl">
        Loading Uma's Fashion &amp; Boutique…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans flex flex-col justify-between">
      <div>
        {view !== "admin" && (
          <Nav
            view={view}
            setView={setView}
            cartCount={cartCount}
            currentUser={currentUser}
            onOpenAuth={() => setAuthOpen(true)}
            onLogout={handleLogout}
            search={search}
            setSearch={(v) => { setSearch(v); handleSetView("shop"); }}
            newLaunchesCount={products.slice(0, 4).length}
            onOpenNewLaunches={() => setShowNewLaunchesModal(true)}
            seasonalTheme={seasonalTheme}
            setSeasonalTheme={setSeasonalTheme}
          />
        )}

        {view === "home" && <HomeView products={products} banners={banners} promoSettings={promoSettings} setView={setView} setCategoryFilter={setCategoryFilter} openProduct={openProduct} seasonalTheme={seasonalTheme} categories={categories} />}
        {view === "shop" && <ShopView products={products} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} search={search} openProduct={openProduct} categories={categories} />}
        {view === "product" && activeProduct && <ProductDetailView product={activeProduct} addToCart={addToCart} setView={setView} currentUser={currentUser} />}
        {view === "cart" && <CartView cart={cart} updateQty={updateQty} removeItem={removeItem} setView={setView} subtotal={subtotal} />}
        {view === "checkout" && <CheckoutView cart={cart} subtotal={subtotal} currentUser={currentUser} onOpenAuth={() => setAuthOpen(true)} placeOrder={placeOrder} setView={setView} />}
        {view === "confirmation" && <ConfirmationView order={lastOrder} setView={handleSetView} orders={orders} />}
        {view === "account" && <CustomerProfileView currentUser={currentUser} orders={orders} setView={handleSetView} onProfileUpdated={(u) => setCurrentUser(u)} onRefreshProfile={() => fetchMe(localStorage.getItem("umas:token"))} showToast={showToast} onOpenAuth={() => setAuthOpen(true)} />}

        {/* New Product Launch Notification Modal */}
        {showNewLaunchesModal && (
          <NewLaunchesModal
            products={products}
            onClose={() => setShowNewLaunchesModal(false)}
            onSelectProduct={(p) => { setActiveProduct(p); setView("product"); }}
          />
        )}

        {/* Global Image Full Zoom Lightbox Modal */}
        {fullZoomImage && (
          <div
            className="fixed inset-0 z-[100] bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
            onClick={() => setFullZoomImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-amber-500/30 shadow-2xl bg-black">
              <button
                onClick={() => setFullZoomImage(null)}
                className="absolute top-4 right-4 bg-stone-900/80 text-white p-2 rounded-full hover:bg-stone-800 transition-colors z-10"
              >
                ✕
              </button>
              <img
                src={getImageUrl(fullZoomImage)}
                alt="Full View"
                className="w-full h-full object-contain max-h-[85vh] select-none"
              />
            </div>
          </div>
        )}

        {view === "admin" && (
          currentUser?.isAdmin ? (
            <AdminDashboard
              promoSettings={promoSettings}
              onPromoUpdated={fetchPromoSettings}
              products={products}
              orders={adminOrders}
              stats={adminStats}
              saveProduct={saveProduct}
              deleteProduct={deleteProduct}
              setView={setView}
              analyticsFilter={adminStatsFilter}
              setAnalyticsFilter={setAdminStatsFilter}
              showToast={showToast}
              activeTheme={seasonalTheme}
              onThemeUpdated={(t) => setSeasonalTheme(t)}
              categories={categories}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          ) : (
            <div className="min-h-[70vh] flex items-center justify-center flex-col gap-4 bg-stone-50">
              <p className="text-stone-600">Admin access only.</p>
              <button onClick={() => setAuthOpen(true)} className="bg-amber-500 text-stone-950 px-6 py-2.5 rounded-full text-sm font-medium">Login as Admin</button>
            </div>
          )
        )}
      </div>

      {view !== "admin" && <WhatsAppSupportWidget />}
      {view !== "admin" && <Footer />}
      {authOpen && <AuthModal onClose={() => { setAuthOpen(false); setAuthError(""); }} onLogin={handleLogin} onSignup={handleSignup} error={authError} />}
      <Toast message={toast} />
    </div>
  );
}