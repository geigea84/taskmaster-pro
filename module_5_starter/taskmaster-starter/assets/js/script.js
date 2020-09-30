var tasks = {};

var createTask = function (taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function () {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function (list, arr) {
    // then loop over sub-array
    arr.forEach(function (task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

//5.1.6 selecting existing p element and replacing with a prominent text area element
$(".list-group").on("click", "p", function () {
  var text = $(this)
    .text()
    .trim();
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

//5.1.6 This blur event will trigger as soon as the user interacts with anything other than the <textarea> element. 
//When that happens, we need to collect a few pieces of data: the current value of the element, the parent element's ID, 
//and the element's position in the list. These data points will help us update the correct task in the tasks object.
$(".list-gorup").on("blur", "textarea", function () {
  //get the textarea's current value/text
  var text = $(this)
    .val()
    .trim();

  //get the parent ul's id attribute
  var status =$(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  //get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  //5.1.6 Because we don't know the values, we'll have to use the variable names as placeholders
  //tasks is an object.
  //tasks[status] returns an array (e.g., toDo).
  //tasks[status][index] returns the object at the given index in the array.
  //tasks[status][index].text returns the text property of the object at the given index.
  tasks[status][index].text = text;
  saveTasks();

  //convert the <textarea> back into a <p> element //recreate p element
  var taskP = $("<P>")
    .addClass("m-1")
    .text(text);

  //replace textarea with p element
  $(this).replaceWith(taskP);
});

//5.3.5 Let's try turning the columns in Taskmaster into sortables. 
//Keep in mind that the actual lists we want to become sortable are 
//the <ul> elements with the class list-group. We'll use a jQuery selector 
//to find all list-group elements and then call a new jQuery UI method on them.
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    console.log("activate", this);
  },
  deactivate: function(event) {
    console.log("deactivate", this);
  },
  over: function(event) {
    console.log("over", event.target);
  },
  out: function(event) {
    console.log("out", event.target);
  },
  //5.3.5 jQuery's each() method will run a callback function for every item/element in the array. 
  //It's another form of looping, except that a function is now called on each loop iteration. 
  //The potentially confusing part of this code is the second use of $(this). 
  //Inside the callback function, $(this) actually refers to the child element at that index.
  update: function(event) {
    //array to store the task data in
    var tempArr = [];

    // loop over current set of children in sortable list
    $(this).children().each(function() {
      var text = $(this)
        .find("p")
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();

      //add task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
    });
    //5.3.5 trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    //update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();

    console.log(tempArr);
  }
  //5.3.5 This is another example of scoped variables. Remember, if an inner function declares a 
  //variable with the same name as a variable declared outside, the inner function will 
  //use the closer of the two declarations. A similar situation would look like this:

    //var name = "Bob";

    //var sayName = function() {
    //var name = "Alice";
    //console.log(name);
    //};

    //sayName(); //prints "Alice"

    //console.log(name); // prints "Bob"
  
});

//5.3.6
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
    console.log("drop");
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
});

//5.1.7 Due dates are wrapped in <span> elements that are children of the same .list-group, 
//meaning we can delegate the click the same way we did for <p> elements
//due date was clicked
$(".list-group").on("click", "span", function() {
  //get current text
  var date = $(this)
    .text()
    .trim();

  //create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  //swap out elements
  $(this).replaceWith(dateInput);

  //automatically focus on new element
  dateInput.trigger("focus");
  
  //5.1.7 The main difference here is that we're creating an <input> element and using jQuery's 
  //attr() method to set it as type="text". In jQuery, attr() can serve two purposes. 
  //With one argument, it gets an attribute (e.g., attr("id")). With two arguments, 
  //it sets an attribute (e.g., attr("type", "text"))
});

//5.1.7 Next, we'll convert them back when the user clicks outside (i.e., when the element's blur event occurs).
//value of due date was changed
$(".list-group").on("blur", "input[type='text']", function() {
  //get current text
  var date = $(this)
    .val()
    .trim();

  //get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  //get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  //update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  //recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  //replace input with span element
  $(this).replaceWith(taskSpan);
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function () {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function () {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function () {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


