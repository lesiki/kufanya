var vorpal = require('vorpal')();
const chalk = vorpal.chalk;
var jsonfile = require('jsonfile');
var _ = require('lodash');

var file = 'kufanya.json'
var data;

jsonfile.readFile(file, function(err, obj) {
  data = obj;
})

function persist() {
  jsonfile.writeFile(file, data, function (err) {
  });
}

function addTodo(newTodo) {
  if(typeof(data) === 'undefined') {
    data = { todos: [] }
  }
  data.todos.push({
    text: newTodo,
    date: new Date().getTime(),
    done: false
  });
  persist();
}

function interactiveAdd(v) {
  v.prompt({
    type: 'input',
    name: 'newTodo',
    message: 'New todo: ',
  },
  function(result){
    if (result.newTodo) {
      addTodo(result.newTodo);
      interactiveAdd(v);
    }
  });
}

vorpal
  .command('add', 'Bulk-add new todos')
  .action(function(args, callback) {
    this.log("Add new tasks. Press ⏎  with empty line to exit");
    interactiveAdd(this);
    callback();
  });

vorpal
  .command('list', 'List todos')
  .option('-a, --all')
  .action(function(args, callback) {
    var midnight = new Date();
    midnight.setHours(0,0,0,0);
    var undone = _.filter(data.todos, function(o) { return !o.done });
    var today = _.filter(data.todos, function(o) {
      return o.date > midnight;
    });
    this.log("Today")
    reportTodos(_.intersection(today, undone), "Todo", false, this);
    reportTodos(_.difference(today, undone), "Done", true, this);
    this.log("\n");

    callback();
  });

function reportTodos(sublist, label, areDone, v) {
  if(sublist.length === 0) {
    return;
  }
  var chalkingFunction;
  if(areDone) {
    chalkingFunction = chalk.grey;
  }
  else {
    chalkingFunction = chalk.cyan;
  }
  v.log(`  ${chalkingFunction(label)}`);
  _.each(sublist, function(entry) {
    v.log(chalkingFunction(`  [${areDone ? 'x' : ' '}] ${entry.text}`));
  })
  v.log(chalkingFunction(''));
}

vorpal
  .delimiter('>>')
  .show();
