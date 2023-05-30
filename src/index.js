const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username } = request.headers;

  const userExist = users.find(user => user.username === username);

  if(!userExist){
   return response.status(404).json({
      error: `O Usuário ${username} não existe na base de dados `
    })
  }

  return next()
}

app.post('/users', (request, response) => {
  const {name, username } = request.body;  

  const userExist = users.find(user => user.username === username);

  if(!name || !username){
    return response.json({
      error: 'nome ou userName não informados verifique por favor'
    })
  }

  if(userExist){
    return response.status(400).json({
    error: `Já existe um usuário na base de dados com esse username: ${username}`
    })
  }  

  const normalizeUser = {
    id: uuidv4(),
    name,
    username,
    todos:[]
  };

  users.push(normalizeUser);

  response.status(201).json(normalizeUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const {username} = request.headers

    const userFind = users.find(user => user.username === username)

    const { todos } = userFind;

    return response.json({
      user: username,
      todos
    })
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {username} =request.headers;
  const {title,deadline } = request.body;

  const normalizeTodo = {
    id: uuidv4(),
    title,
    done:false,
    deadline:new Date(deadline),
    created_at: new Date()
  }

  users.find(user => {
    if(user.username === username){
      user.todos.push(normalizeTodo)
    }})


  return response.status(201).json(normalizeTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const userFound = users.find(user => user.username === username);
  
  const todoIndex = userFound.todos.findIndex(todo => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  const updatedTodo = {
    ...userFound.todos[todoIndex],
    title,
    deadline: new Date(deadline),
  };

  users.find(user => {
    if(user.username === username){
      user.todos.splice(todoIndex, 1, updatedTodo)
    }})

  userFound.todos.splice(todoIndex, 1, updatedTodo);

  return response.json(userFound);
});


app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const userFound = users.find(user => user.username === username); 

  const todoIndex = userFound.todos.findIndex(todo => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  const updatedTodo = {
    ...userFound.todos[todoIndex],
    done:true    
  };

  users.find(user => {
    if(user.username === username){
      user.todos.splice(todoIndex, 1, updatedTodo)
    }})

  userFound.todos.splice(todoIndex, 1, updatedTodo);

  return response.json(userFound);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const userFound = users.find(user => user.username === username);

  const todoIndex = userFound.todos.findIndex(todo => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  userFound.todos.splice(todoIndex, 1);

  users.find(user => {    
    if(user.username === username){
        user.todos.splice(todoIndex, 1);
    }})

  return response.status(200).json(userFound);
});


module.exports = app;