const STORAGE_KEY = 'kaiedshop.recentlyViewed';
const MAX_ITEMS = 8;

export const getRecentlyViewed = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const items = raw ? JSON.parse(raw) : [];
        return Array.isArray(items) ? items : [];
    } catch {
        return [];
    }
};

export const rememberProduct = (product) => {
    if (!product?._id) return getRecentlyViewed();

    const entry = {
        _id: product._id,
        name: product.name,
        price: product.price,
        primaryImage: product.primaryImage || '',
        brand: product.brand || ''
    };

    const next = [
        entry,
        ...getRecentlyViewed().filter((item) => item._id !== product._id)
    ].slice(0, MAX_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
};
