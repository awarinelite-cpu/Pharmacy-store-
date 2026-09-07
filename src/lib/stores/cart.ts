import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface CartLine {
	productId: string;
	vendorId: string;
	vendorName: string;
	name: string;
	unitPrice: number; // kobo
	qty: number;
	maxQty: number;
}

const STORAGE_KEY = 'pharmacy_cart';

function load(): CartLine[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function createCart() {
	const { subscribe, update, set } = writable<CartLine[]>(load());

	subscribe((lines) => {
		if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
	});

	return {
		subscribe,
		add(line: Omit<CartLine, 'qty'>, qty = 1) {
			update((lines) => {
				const existing = lines.find((l) => l.productId === line.productId);
				if (existing) {
					existing.qty = Math.min(existing.qty + qty, existing.maxQty);
					return [...lines];
				}
				return [...lines, { ...line, qty: Math.min(qty, line.maxQty) }];
			});
		},
		setQty(productId: string, qty: number) {
			update((lines) =>
				lines
					.map((l) => (l.productId === productId ? { ...l, qty: Math.min(Math.max(qty, 0), l.maxQty) } : l))
					.filter((l) => l.qty > 0)
			);
		},
		remove(productId: string) {
			update((lines) => lines.filter((l) => l.productId !== productId));
		},
		clear() {
			set([]);
		}
	};
}

export const cart = createCart();
