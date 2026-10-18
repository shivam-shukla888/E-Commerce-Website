const express = require('express');
const { getDb } = require('../db/connection');

const router = express.Router();

/**
 * GET /api/categories
 * Retrieve all product categories with product counts
 */
router.get('/', (req, res, next) => {
  try {
    const db = getDb();
    const categories = db.prepare(`
      SELECT 
        c.id, c.name, c.slug, c.description, c.image_url,
        COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `).all();

    res.json({
      success: true,
      categories,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/categories/:slug
 */
router.get('/:slug', (req, res, next) => {
  try {
    const db = getDb();
    const category = db.prepare('SELECT * FROM categories WHERE slug = ?').get(req.params.slug);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, category });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
