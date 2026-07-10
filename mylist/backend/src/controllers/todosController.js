const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at ASC',
      [req.userId]
    );
    res.json(rows.map(r => ({
      id:        r.id,
      text:      r.text,
      done:      r.done === 1,
      priority:  r.priority,
      dueDate:   r.due_date ? r.due_date.toISOString().split('T')[0] : '',
      createdAt: r.created_at,
    })));
  } catch (e) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.create = async (req, res) => {
  try {
    const { text, priority, dueDate } = req.body;
    if (!text) return res.status(400).json({ message: 'El texto es requerido' });

    const [result] = await pool.query(
      'INSERT INTO todos (user_id, text, priority, due_date) VALUES (?, ?, ?, ?)',
      [req.userId, text, priority || '', dueDate || null]
    );
    res.status(201).json({ id: result.insertId, text, done: false, priority, dueDate });
  } catch (e) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.update = async (req, res) => {
  try {
    const { text, done, priority, dueDate } = req.body;
    await pool.query(
      'UPDATE todos SET text = ?, done = ?, priority = ?, due_date = ? WHERE id = ? AND user_id = ?',
      [text, done, priority || '', dueDate || null, req.params.id, req.userId]
    );
    res.json({ message: 'Actualizado' });
  } catch (e) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM todos WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    res.json({ message: 'Eliminado' });
  } catch (e) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};