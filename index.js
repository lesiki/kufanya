var vorpal = require('vorpal')();
const chalk = vorpal.chalk;
var jsonfile = require('jsonfile');
var _ = require('lodash');
var pad = require('pad-right');

var file = 'kufanya.json'
var data = { todos: [] };

jsonfile.readFile(file, function(err, obj) {
  if(typeof(obj) !== 'undefined') {
    data = obj;
  }
})

function persist() {
  jsonfile.writeFile(file, data, function (err) {
  });
}

function addTodo(newTodo) {
  data.todos.push({
    text: newTodo,
    date: new Date().getTime(),
    done: false
  });
  persist();
}

function interactiveAdd(v, cb) {
  v.prompt({
    type: 'input',
    name: 'newTodo',
    message: 'New todo: ',
  },
  function(result){
    if (result.newTodo) {
      addTodo(result.newTodo);
      interactiveAdd(v, cb);
    }
    else {
      cb();
    }
  });
}

vorpal
  .command('add', 'Bulk-add new todos')
  .action(function(args, callback) {
    this.log("Add new tasks. Press ⏎  with empty line to exit");
    interactiveAdd(this, callback);
  });

vorpal
  .command('done', 'Mark as done\n')
  .action(function (args, cb) {
    var undone = _.filter(data.todos, function(o) { return !o.done });
    var v = this;
    if(undone.length > 0) {
      this.prompt({
        type: 'checkbox',
        name: 'entry',
        message: 'Choose entry to mark as done:',
        choices: _.map(undone, function(it) {
          return it.text;
        })
      },
      function(entriesToMarkDone){
        _.each(entriesToMarkDone.entry, function(labelToMarkDone) {
          var ind = _.findIndex(data.todos, function(todoEntry) {
            return todoEntry.text === labelToMarkDone;
          });
          data.todos[ind].done = true;
        })
        persist();
        v.log(`Marked ${entriesToMarkDone.entry.length} entries as done.`);
        cb();
      })
    }
    else {
      v.log('Nothing to mark as done.');
      cb();
    }
  });

vorpal
  .command('list', 'List todos')
  .option('-a, --all')
  .action(function(args, callback) {
    if(data.todos.length == 0) {
      this.log("No todos here\n");
    }
    else {
      var midnight = new Date();
      midnight.setHours(0,0,0,0);
      var undone = _.filter(data.todos, function(o) { return !o.done });
      var today = _.filter(data.todos, function(o) {
        return o.date > midnight;
      });
      this.log("Today\n");
      reportTodos(_.intersection(today, undone), "Todo", false, this);
      reportTodos(_.difference(today, undone), "Done", true, this);
      this.log("");
    }
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
  var id = 0;
  _.each(sublist, function(entry) {
    id ++;
    v.log(
      chalkingFunction(`  [${areDone ? 'x' : ' '}] ${entry.text}`)
    );
  })
  v.log(chalkingFunction(''));
}

vorpal
  .delimiter('>>')
  .show();
