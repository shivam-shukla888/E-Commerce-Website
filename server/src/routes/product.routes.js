const express = require('express');
const { getDb } = require('../db/connection');

const router = express.Router();

/**
 * GET /api/products
 * Query Parameters:
 * - search: text to search in name or description
 * - category: category slug or id
 * - minPrice: minimum price in paise
 * - maxPrice: maximum price in paise
 * - inStock: if 'true', only return items with stock > 0
 * - sort: 'price_asc' | 'price_desc' | 'rating_desc' | 'newest' | 'featured'
 * - page: page number (default 1)
 * - limit: items per page (default 20)
 */
router.get('/', (req, res, next) => {
  try {
    const db = getDb();
    const {
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      sort = 'featured',
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (category && category !== 'all') {
      if (isNaN(Number(category))) {
        conditions.push('c.slug = ?');
        params.push(category);
      } else {
        conditions.push('p.category_id = ?');
        params.push(Number(category));
      }
    }

    if (minPrice && !isNaN(Number(minPrice))) {
      conditions.push('p.price_paise >= ?');
      params.push(Number(minPrice));
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      conditions.push('p.price_paise <= ?');
      params.push(Number(maxPrice));
    }

    if (inStock === 'true' || inStock === true) {
      conditions.push('p.stock_quantity > 0');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'p.is_featured DESC, p.id DESC';
    switch (sort) {
      case 'price_asc':
        orderBy = 'p.price_paise ASC';
        break;
      case 'price_desc':
        orderBy = 'p.price_paise DESC';
        break;
      case 'rating_desc':
        orderBy = 'p.rating DESC';
        break;
      case 'newest':
        orderBy = 'p.created_at DESC';
        break;
      case 'featured':
      default:
        orderBy = 'p.is_featured DESC, p.rating DESC';
        break;
    }

    // Total count for pagination
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const totalRow = db.prepare(countQuery).get(...params);
    const total = totalRow.total;

    // Fetch paginated products
    const selectQuery = `
      SELECT 
        p.id, p.name, p.slug, p.description, p.price_paise, p.stock_quantity,
        p.image_url, p.additional_images, p.rating, p.review_count, p.is_featured,
        p.specs, p.created_at,
        c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const products = db.prepare(selectQuery).all(...params, limitNum, offset);

    // Format products specs and additional images
    const formattedProducts = products.map(prod => {
      let parsedSpecs = {};
      let parsedImages = [];
      try {
        parsedSpecs = JSON.parse(prod.specs || '{}');
      } catch {
        parsedSpecs = {};
      }
      try {
        parsedImages = JSON.parse(prod.additional_images || '[]');
      } catch {
        parsedImages = [];
      }
      return {
        ...prod,
        specs: parsedSpecs,
        additional_images: parsedImages,
      };
    });

    res.json({
      success: true,
      products: formattedProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/products/:identifier
 * Retrieve product by slug or numeric ID
 */
router.get('/:identifier', (req, res, next) => {
  try {
    const db = getDb();
    const { identifier } = req.params;

    const isNumeric = !isNaN(Number(identifier));
    const query = `
      SELECT 
        p.id, p.name, p.slug, p.description, p.price_paise, p.stock_quantity,
        p.image_url, p.additional_images, p.rating, p.review_count, p.is_featured,
        p.specs, p.created_at,
        c.id AS category_id, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${isNumeric ? 'p.id = ?' : 'p.slug = ?'}
    `;

    const product = db.prepare(query).get(isNumeric ? Number(identifier) : identifier);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let parsedSpecs = {};
    let parsedImages = [];
    try {
      parsedSpecs = JSON.parse(product.specs || '{}');
    } catch {
      parsedSpecs = {};
    }
    try {
      parsedImages = JSON.parse(product.additional_images || '[]');
    } catch {
      parsedImages = [];
    }

    // Related products in same category
    const related = db.prepare(`
      SELECT p.id, p.name, p.slug, p.price_paise, p.image_url, p.rating, p.review_count, p.stock_quantity, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? AND p.id != ?
      LIMIT 4
    `).all(product.category_id, product.id);

    res.json({
      success: true,
      product: {
        ...product,
        specs: parsedSpecs,
        additional_images: parsedImages,
        related_products: related,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
