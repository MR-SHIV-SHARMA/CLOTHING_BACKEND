// This file has been consolidated into catalogService.js
// Please use catalogService.products instead

import { catalogService } from "./catalogService.js";

export const productService = {
  // Re-export catalog service product methods for backward compatibility
  ...catalogService.products,

  // Additional utility methods specific to product handling
  formatPrice: (price, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price);
  },

  calculateDiscount: (originalPrice, discountedPrice) => {
    const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
    return Math.round(discount);
  },

  isProductInStock: (product) => {
    return product.stock > 0 && product.isActive;
  },

  getProductMainImage: (product) => {
    return product.images && product.images.length > 0
      ? product.images[0]
      : "/images/placeholder-product.jpg";
  },

  // Product comparison utilities
  compareProducts: (product1, product2) => {
    return {
      id: [product1.id, product2.id],
      name: [product1.name, product2.name],
      price: [product1.price, product2.price],
      rating: [product1.rating, product2.rating],
      features: {
        common: product1.features?.filter(f => product2.features?.includes(f)) || [],
        unique1: product1.features?.filter(f => !product2.features?.includes(f)) || [],
        unique2: product2.features?.filter(f => !product1.features?.includes(f)) || [],
      },
      availability: [product1.inStock, product2.inStock],
    };
  },

  // Product filtering utilities
  filterProducts: (products, filters) => {
    return products.filter(product => {
      let matches = true;
      
      if (filters.priceRange) {
        const [min, max] = filters.priceRange;
        matches = matches && product.price >= min && product.price <= max;
      }
      
      if (filters.category) {
        matches = matches && product.categoryId === filters.category;
      }
      
      if (filters.brand) {
        matches = matches && product.brandId === filters.brand;
      }
      
      if (filters.rating) {
        matches = matches && product.rating >= filters.rating;
      }
      
      if (filters.inStock) {
        matches = matches && product.stock > 0;
      }
      
      return matches;
    });
  },

  // Product search utilities
  searchProducts: (products, query) => {
    const searchTerm = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  },

  // Product sorting utilities
  sortProducts: (products, sortBy, sortOrder = 'asc') => {
    return products.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'created':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'popularity':
          aValue = a.viewCount || 0;
          bValue = b.viewCount || 0;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });
  },
};

export default productService;
