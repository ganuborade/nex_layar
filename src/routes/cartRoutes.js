const express = require('express');
const pool = require('../config/db');
const requireAuth = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const [items] = await pool.query(
      `SELECT c.id AS cart_id, c.quantity, p.id AS product_id, p.title, p.description, p.price
       FROM cart_items c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    return res.json({ items, total });
  } catch (error) {
    return next(error);
  }
});

router.post('/items', async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product is required.' });
    }

    const [products] = await pool.query('SELECT id FROM products WHERE id = ? AND is_active = 1', [productId]);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [req.user.id, productId, Number(quantity)]
    );

    return res.status(201).json({ message: 'Project added to cart.' });
  } catch (error) {
    return next(error);
  }
});

router.delete('/items/:cartId', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.cartId, req.user.id]);
    return res.json({ message: 'Project removed from cart.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
