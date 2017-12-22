var vorpal = require('vorpal')();

function interactiveAdd(v) {
  v.prompt({
    type: 'input',
    name: 'newTodo',
    message: 'New todo: ',
  },
  function(result){
    if (result.newTodo) {
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
.delimiter('>>')
.show();
