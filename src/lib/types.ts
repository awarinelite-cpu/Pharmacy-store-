export type Role = 'admin' | 'vendor' | 'customer';

export interface AppUser {
	uid: string;
	email: string;
	name: string;
	role: Role;
	// Vendor-only fields
	vendorApproved?: boolean;
	businessName?: string;
	phone?: string;
	disabled?: boolean;
	createdAt?: number;
}

export interface Product {
	id: string;
	vendorId: string;
	vendorName: string;
	name: string;
	genericName?: string;
	category: string;
	description?: string;
	price: number; // in kobo (smallest currency unit), matches Paystack convention
	stockQty: number;
	unit: string; // e.g. "tablet", "bottle", "pack"
	prescriptionRequired: boolean;
	batchNumber?: string;
	expiryDate?: string; // ISO date
	imageUrl?: string;
	active: boolean;
	createdAt: number;
	updatedAt: number;
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'fulfilled' | 'cancelled';

export interface OrderItem {
	productId: string;
	vendorId: string;
	name: string;
	unitPrice: number;
	qty: number;
}

export interface Order {
	id: string;
	customerId: string;
	customerName: string;
	vendorId: string; // orders are split per-vendor since stock is independent per vendor
	items: OrderItem[];
	subtotal: number;
	status: OrderStatus;
	paystackRef?: string;
	deliveryAddress?: string;
	createdAt: number;
	updatedAt: number;
}

export interface InventoryLogEntry {
	id: string;
	productId: string;
	vendorId: string;
	change: number; // positive = stock in, negative = stock out
	reason: string; // "restock", "sale", "adjustment", "damaged"
	balanceAfter: number;
	actorUid: string;
	createdAt: number;
}
