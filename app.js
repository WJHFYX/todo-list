(function () {
  'use strict';

  var STORAGE_KEY = 'todo-list.items';

  var input = document.getElementById('todo-input');
  var addBtn = document.getElementById('add-btn');
  var list = document.getElementById('todo-list');
  var emptyHint = document.getElementById('empty-hint');

  // todos 为唯一数据源，结构：{ id: string, text: string, completed: boolean }
  var todos = loadTodos();

  /* ===== 数据读写 ===== */
  function loadTodos() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  }

  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ===== 渲染 ===== */
  function createTodoElement(todo) {
    var li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.dataset.id = todo.id;

    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', '标记为已完成');

    // 使用 textContent 填充用户输入，避免 XSS
    var text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    var deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '删除';

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(deleteBtn);
    return li;
  }

  function render() {
    list.innerHTML = '';
    var fragment = document.createDocumentFragment();
    todos.forEach(function (todo) {
      fragment.appendChild(createTodoElement(todo));
    });
    list.appendChild(fragment);
    emptyHint.hidden = todos.length > 0;
  }

  /* ===== 业务操作 ===== */
  function addTodo() {
    var text = input.value.trim();
    if (!text) {
      input.focus();
      return;
    }

    todos.push({ id: generateId(), text: text, completed: false });
    input.value = '';
    saveTodos();
    render();
    input.focus();
  }

  function findTodoId(target) {
    var item = target.closest('.todo-item');
    return item ? item.dataset.id : null;
  }

  // 事件委托：勾选完成
  list.addEventListener('change', function (e) {
    if (!e.target.classList.contains('todo-checkbox')) return;

    var id = findTodoId(e.target);
    var todo = todos.find(function (t) { return t.id === id; });
    if (todo) {
      todo.completed = e.target.checked;
      saveTodos();
      render();
    }
  });

  // 事件委托：删除任务
  list.addEventListener('click', function (e) {
    if (!e.target.classList.contains('delete-btn')) return;

    var id = findTodoId(e.target);
    todos = todos.filter(function (t) { return t.id !== id; });
    saveTodos();
    render();
  });

  addBtn.addEventListener('click', addTodo);

  // 回车添加
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      addTodo();
    }
  });

  // 首次加载
  render();
})();
