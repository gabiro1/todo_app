// server.js or app.js
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const PORT = process.env.PORT || 8000;
const app = express();

// Set up __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB connection
const MONGO_URI = 'mongodb://localhost:27017/todo-app';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Mongoose Schema
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
}, {
  timestamps: true,
});
const Todo = mongoose.model('Todo', todoSchema);

// ROUTES

// Home - list all todos
app.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.render('index.ejs', { title: 'Todo List', todos });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET add todo form
app.get('/add_todo', (req, res) => {
  res.render('newTodo.ejs', { title: 'Add Todo' });
});

// POST add todo
app.post('/add_todo', async (req, res) => {
  try {
    const { title, description } = req.body;
    const newTodo = new Todo({ title, description });
    await newTodo.save();
    res.redirect('/');
  } catch (error) {
    res.status(500).json({ message: 'Error adding todo' });
  }
});

// GET update form
app.get('/update_todo/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).send('Todo not found');
    res.render('updated_todo.ejs', { title: 'Update Todo', todo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST update todo
app.post('/update_todo/:id', async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    await Todo.findByIdAndUpdate(req.params.id, {
      title,
      description,
      completed: completed === 'on',
    });
    res.redirect('/');
  } catch (error) {
    res.status(500).json({ message: 'Error updating todo' });
  }
});

// GET delete form
app.get('/delete_todo/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).send('Todo not found');
    res.render('deleteTodo.ejs', { title: 'Delete Todo', todo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST delete todo
app.post('/delete_todo/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (error) {
    res.status(500).json({ message: 'Error deleting todo' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
