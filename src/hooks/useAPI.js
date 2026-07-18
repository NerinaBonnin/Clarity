import { useState, useEffect } from 'react';
import api from '../api/axios';

export function useTodos() {
  const [todos, setTodos]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/todos')
      .then(res => setTodos(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTodos([]))
      .finally(() => setLoading(false));
  }, []);

  const addTodo = async (todo) => {
    const { data } = await api.post('/todos', todo);
    setTodos(prev => [...prev, { ...todo, id: data.id }]);
  };

  const updateTodo = async (id, changes) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t));
    await api.put(`/todos/${id}`, changes);
  };

  const removeTodo = async (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    await api.delete(`/todos/${id}`);
  };

  return { todos, setTodos, loading, addTodo, updateTodo, removeTodo };
}

export function useItems() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/items')
      .then(res => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const addItem = async (item) => {
    const { data } = await api.post('/items', item);
    setItems(prev => [...prev, { ...item, id: data.id }]);
  };

  const updateItem = async (id, changes) => {
    setItems(prev => prev.map(x => x.id === id ? { ...x, ...changes } : x));
    await api.put(`/items/${id}`, changes);
  };

  const removeItem = async (id) => {
    setItems(prev => prev.filter(x => x.id !== id));
    await api.delete(`/items/${id}`);
  };

  return { items, setItems, loading, addItem, updateItem, removeItem };
}