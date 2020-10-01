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

  //.5.4.6 check due date
  auditTask(taskLi);

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

//5.5.7 Change and add/remove class types depending on whether you're activating the element or not
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
    console.log("activate", $(this));
  },
  deactivate: function(event) {
    $(this).removeClass("dropover");
    $(".bottom-trash").removeClass("bottom-trash-drag");
    console.log("deactivate", this);
  },
  over: function(event) {
    $(event.target).addClass("dropover-active");
    $(".bottom-trash").addClass("bottom-trash-active");
    console.log("over", event.target);
  },
  out: function(event) {
    $(event.target).removeClass("dropover-active");
    $(".bottom-trash").removeClass("bottom-trash-active");
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

//5.4.4 add calendar to dates
//When and where do we need to add the .datepicker() method to a due date edit <input> element?
//In the click event listener we added to any <span> element in .list-group to create a date <input> element.
$("#modalDueDate").datepicker({
  minDate: 1
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

  //5.4.4 enable jquery ui datepicker
  //Per the documentation, the onClose option for .datepicker() allows us to execute a function when the 
  //date picker closes. It may close when a user clicks anywhere on the page outside the date picker, so 
  //we need to capture that event and change the date picker back to its original <span> element.
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      //when calendar is closed, force a "change" event on the `dateInput`
      $(this).trigger("change");
    }
  });

  //automatically focus on new element
  dateInput.trigger("focus");
  
  //5.1.7 The main difference here is that we're creating an <input> element and using jQuery's 
  //attr() method to set it as type="text". In jQuery, attr() can serve two purposes. 
  //With one argument, it gets an attribute (e.g., attr("id")). With two arguments, 
  //it sets an attribute (e.g., attr("type", "text"))
});

{
//5.4.5 Moment.js can help us parse dates just like with JavaScript, but then we can manipulate that data more 
//easily than with regular JavaScript. For instance, adding two days to the current time is as easy as running this code:

//var twoDaysFromNow = moment().add(2, "days");
//To compare, here's how to do the same thing using regular JavaScript:

// get current date
//var currentDate = new Date();

// set how many days from now we want
//var daysFromNow = 2;

// get date two days from now
//var twoDaysFromNow = new Date(currentDate.setDate(currentDate.getDate() + daysFromNow));
}

//5.4.6 Because we need to run this type of functionality in the functions for both creating tasks 
//and editing task due dates, we should create a separate function for it, called auditTask, and 
//set it up to accept the task's <li> element as a parameter. This way we can add classes to it if need be.

//5.4.6 First, we use the date variable we created from taskEl to make a new Moment object, configured for 
//the user's local time using moment(date, "L"). Because the date variable does not specify a time of day 
//(for example, "11/23/2019"), the Moment object will default to 12:00am. Because work usually doesn't end 
//at 12:00am, we convert it to 5:00pm of that day instead, using the .set("hour", 17) method.
var auditTask = function(taskEl) {
  //get date from task element
  var date = $(taskEl).find("span").text().trim();

  //convert to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17);

  //remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  //apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }
  //Moment.js functions literally perform left to right. So when we use moment() to get right now and use .diff() 
  //afterwards to get the difference of right now to a day in the future, we'll get a negative number back. 
  //This can be hard to work with, because we have to check if the difference is >= -2, which can be hard to conceptualize.
  //In our code, we're preventing any confusion by testing for a number less than +2, not a number greater than -2. 
  //To do this, we've wrapped the returning value of the moment.diff() in the JavaScript Math object's .abs() method. 
  //This ensures we're getting the absolute value of that number.
  else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }

  //5.4.6 Now, when a task element is sent into the auditTask() function, we can get the date information 
  //and parse it into a Moment object using Moment.js. We use jQuery to select the taskEl element and find 
  //the <span> element inside it, then retrieve the text value using .text(). We chained on a JavaScript 
  //(not jQuery) .trim() method to cut off any possible leading or trailing empty spaces.
};

//5.1.7 Next, we'll convert them back when the user clicks outside (i.e., when the element's blur event occurs).
//value of due date was changed
$(".list-group").on("change", "input[type='text']", function() {
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

  //pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));

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
$("#task-form-modal .btn-save").click(function () {
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

//5.5.4 The user can still interact with the application while these timers are 
//running because they are asynchronous functions. This means they run in the 
//background until their time is up and then execute the callback function, 
//allowing us to still use the other functionality in the app as usual.

//5.5.4 Here, the jQuery selector passes each element it finds using the selector into the callback function, 
//and that element is expressed in the el argument of the function.auditTask() then passes the element to 
//its routines using the el argument.
//In this interval, we loop over every task on the page with a class of list-group-item and execute the 
//auditTask() function to check the due date of each one.
setInterval(function() {
  $(".card .list-group-item").each(function(index, el) {
    auditTask(el);
  });
}, 1800000);

//It can be hard to come up with longer time durations in milliseconds, 
//so a good trick to make this easier is to convert the time to something like this:

//setInterval(function() {
  // code to execute
//}, (1000 * 60) * 30);