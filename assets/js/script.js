// Retrieve tasks and nextid from localStorage
let nextid = JSON.parse(localStorage.getItem("nextid"));
const todoList = $("todo-cards");
const projectFormEl = $("#formModal");

console.log(projectFormEl);

//function to get localstorage items OR make empty array
function readtasksfromstorage() {
// Retrieve tasks from localStorage and parse the JSON to an array.
  let tasklist = JSON.parse(localStorage.getItem("tasklist"));

//If no tasks were retrieved from localStorage, assign projects to a new empty array to push to later.
  if (!tasklist) {
    tasklist = [];
  }

  // Return the tasklist array either empty or with data in it whichever it was determined to be by the logic right above.
  return tasklist;
}

//function to generate a unique task id
function generatetaskid() {
  const taskid = crypto.randomUUID();

  nextid = taskid;

  return nextid;
}

// function to create a task card
function createTaskCard(task) {
// Creates a new card element and add the classes `card`, `task-card`, `draggable`, and `my-3`. Also add a `data-task-id` attribute and set it to the task id.
  console.log("we are creating cards");
  
  const taskCard = $('<div>')
    .addClass('card task-card draggable my-3')
    .attr('data-task-id', task.tID);
  const cardhead = $('<div>').addClass('card-header h4').text(task.tTitle);
  const cardbody = $('<div>').addClass('card-body');
  const carddescription = $('<p>').addClass('card-text').text(task.tDescription);
  const cardDueDate = $('<p>').addClass('card-text').text(task.tDueDate);
  const cardDeleteBtn = $('<button>')
    .addClass('btn btn-danger delete')
    .text('Delete')
    .attr('data-task-id', task.tID).attr('id', task.tID);
  cardDeleteBtn.on('click', handleDeleteTask);

  // Sets the card background color based on due date. Only apply the styles if the dueDate exists and the status is not done.
  if (task.tDueDate && task.status !== 'done') {
    const now = dayjs();
    const taskduedate = dayjs(task.tDueDate, 'DD/MM/YYYY');

  //If the task is due today, make the card yellow. If it is overdue, make it red.
    if (now.isSame(taskduedate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskduedate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }

 //Gather all the elements created above and append them to the correct elements.
  cardbody.append(carddescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardhead, cardbody);

// Return the card so it can be appended to the correct lane.
  return taskCard;
}

//function to render the task list and make cards draggable
function rendertasklist() {
  const tasklist = readtasksfromstorage();

  console.log(tasklist);
  console.log("rendering cards");

  //Empty existing task cards out of the lanes
  const todoList = $("#todo-cards");
  todoList.empty();

  const inProgressList = $("#in-progress-cards");
  inProgressList.empty();

  const doneList = $("#done-cards");
  doneList.empty();

//Loop through tasklist and create task cards for each status
  for (let task of tasklist) {
    if (task.status === "to-do") {
      todoList.append(createTaskCard(task));
    } else if (task.status === "in-progress") {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === "done") {
      doneList.append(createTaskCard(task));
    }
  }

//  make task cards draggable
  $(".draggable").draggable({
    opacity: 0.7,
    zIndex: 100,
// the function that creates the clone of the card that is dragged. 
    helper: function (e) {
//Check if the target of the drag event is the card itself or a child element. 
      const original = $(e.target).hasClass("ui-draggable")
        ? $(e.target)
        : $(e.target).closest(".ui-draggable");
// Return the clone with the width set to the width of the original card. 
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
}

//shortcut function to save tasks to storage
function savetaskstostorage(tasklist) {
  localStorage.setItem("tasklist", JSON.stringify(tasklist));
}

//a function to handle adding a new task
function handleaddtask(event) {
//prevent default action
  event.preventDefault();

//record info from form.
  let title = $("#tasktitle");
  let dueDate = $("#taskduedate");
  let description = $("#taskDescription");

//create new object from form data
  const newTask = {
    tTitle: title.val().trim(),
    tDueDate: dueDate.val(),
    tDescription: description.val().trim(),
    tID: generatetaskid(),
    status: 'to-do',
  };

//log to check task is being stored
  console.log(newTask);

//get list in local storage
  const tasklist = readtasksfromstorage();

//save the task to local storage
  tasklist.push(newTask);
  savetaskstostorage(tasklist);

//check the array hs the new info in it
  console.log(tasklist);

  rendertasklist();
//clear inputs
  $("#tasktitle").val('');
  $("#taskduedate").val('');
  $("#taskDescription").val('');
}

//function to handle deleting a task
function handleDeleteTask() {
    const taskid = $(this).attr('data-task-id');
    const tasklist = readtasksfromstorage();
  
    tasklist.forEach((task) => {
      if (task.tID === taskid) {
        tasklist.splice(tasklist.indexOf(task), 1);
      }
    });
  
// function to save the projects to localStorage
    savetaskstostorage(tasklist);
  
//  use other function to print projects back to the screen
    rendertasklist();
  }

  function dragstartHandler(ev) {
    ev.dataTransfer.dropEffect = "move";
  }


//function to handle dropping a task into a new status lane
function handledrop(event, ui) {
     // Read projects from localStorage
  const tasklist = readtasksfromstorage();

// ? Get the project id from the event
  const taskid = ui.draggable[0].dataset.taskid;

  console.log(taskid);

// Get the id of the lane that the card was dropped into
  const newStatus = event.target.id;

  for ( let task of tasklist) {
// Find the project card by the `id` and update the project status.
    if (task.tID === taskid) {
      task.status = newStatus;
      console.log(`task status: ${task.status}`);
    }
  }
   // Save the updated projects array to localStorage (overwritting the previous one) and render the new project data to the screen.
  localStorage.setItem('tasklist', JSON.stringify(tasklist));
  
  rendertasklist();

}


// when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker

//on submit create task item
$(document).ready(function () {
  projectFormEl.on("submit", handleaddtask);

  rendertasklist();

  $("#taskduedate").datepicker({
    changeMonth: true,
    changeYear: true,
  });

// ? Make lanes droppable
  $(".lane").droppable({
    accept: ".draggable",
    drop: handledrop,
  });
});