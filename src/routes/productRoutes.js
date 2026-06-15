const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [products] = await pool.query(
      'SELECT id, title, description, price, category FROM products WHERE is_active = 1 ORDER BY id'
    );
    return res.json({ products });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
