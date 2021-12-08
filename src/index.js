const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers

  const user = users.find(u => u.username === username)

  if(user === undefined) return response.status(404).send({error: "O usuário não existe."})

  request.user = user
  return next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body

  const user = {id: uuidv4(), name, username, todos: []}

  if(users.find(u => u.username === username)){
    return response.status(400).send({error:"O usuário já existe"})
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.json(request.user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body
  const {user} = request

  const todo = {id: uuidv4(), title, deadline: new Date(deadline), done: false, created_at: new Date()}
  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body
  const {user} = request
  const {id} = request.params

  const todo = user.todos.find(t => t.id === id)

  if(todo === undefined) return response.status(404).send({error:"O todo não existe."})

  todo.title = title
  todo.deadline = new Date(deadline)
  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params

  const todo = user.todos.find(t => t.id === id)

  if(todo === undefined) return response.status(404).send({error:"O todo não existe."})

  todo.done = true
  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params

  const todo_index = user.todos.findIndex(t => t.id === id)
  if(todo_index === -1) return response.status(404).send({error:"O todo não existe."})

  user.todos.splice(todo_index,1)
  return response.status(204).send()
});

module.exports = app;