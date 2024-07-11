// Retrieve tasks and nextId from localStorage
let nextId = JSON.parse(localStorage.getItem("nextId"));
const todoList = $("todo-cards");
const projectFormEl = $("#formModal");

console.log(projectFormEl);

//function to get localstorage items OR make empty array
function readTasksFromStorage() {
  // Retrieve tasks from localStorage and parse the JSON to an array.
  let taskList = JSON.parse(localStorage.getItem("taskList"));

  //If no tasks were retrieved from localStorage, assign projects to a new empty array to push to later.
  if (!taskList) {
    taskList = [];
  }

  // Return the tasklist array either empty or with data in it whichever it was determined to be by the logic right above.
  return taskList;
}

//function to generate a unique task id
function generateTaskId() {
  const taskID = crypto.randomUUID();

  nextId = taskID;

  return nextId;
}

// function to create a task card
function createTaskCard(task) {
// Creates a new card element and add the classes `card`, `task-card`, `draggable`, and `my-3`. Also add a `data-task-id` attribute and set it to the task id.
  console.log("we are creating cards");
  
  const taskCard = $('<div>')
    .addClass('card task-card draggable my-3')
    .attr('data-task-id', task.tID);
  const cardHeader = $('<div>').addClass('card-header h4').text(task.tTitle);
  const cardBody = $('<div>').addClass('card-body');
  const cardDescription = $('<p>').addClass('card-text').text(task.tDescription);
  const cardDueDate = $('<p>').addClass('card-text').text(task.tDueDate);
  const cardDeleteBtn = $('<button>')
    .addClass('btn btn-danger delete')
    .text('Delete')
    .attr('data-task-id', task.tID).attr('id', task.tID);
  cardDeleteBtn.on('click', handleDeleteTask);

  // Sets the card background color based on due date. Only apply the styles if the dueDate exists and the status is not done.
  if (task.tDueDate && task.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(task.tDueDate, 'DD/MM/YYYY');

  //If the task is due today, make the card yellow. If it is overdue, make it red.
    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }

 //Gather all the elements created above and append them to the correct elements.
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

// Return the card so it can be appended to the correct lane.
  return taskCard;
}

//function to render the task list and make cards draggable
function renderTaskList() {
  const taskList = readTasksFromStorage();

  console.log(taskList);
  console.log("rendering cards");

  //Empty existing task cards out of the lanes
  const todoList = $("#todo-cards");
  todoList.empty();

  const inProgressList = $("#in-progress-cards");
  inProgressList.empty();

  const doneList = $("#done-cards");
  doneList.empty();

//Loop through taskList and create task cards for each status
  for (let task of taskList) {
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
function saveTasksToStorage(taskList) {
  localStorage.setItem("taskList", JSON.stringify(taskList));
}

//a function to handle adding a new task
function handleAddTask(event) {
//prevent default action
  event.preventDefault();

//record info from form.
  let title = $("#taskTitle");
  let dueDate = $("#taskDueDate");
  let description = $("#taskDescription");

//create new object from form data
  const newTask = {
    tTitle: title.val().trim(),
    tDueDate: dueDate.val(),
    tDescription: description.val().trim(),
    tID: generateTaskId(),
    status: 'to-do',
  };

//log to check task is being stored
  console.log(newTask);

//get list in local storage
  const taskList = readTasksFromStorage();

//save the task to local storage
  taskList.push(newTask);
  saveTasksToStorage(taskList);

//check the array hs the new info in it
  console.log(taskList);

  renderTaskList();
//clear inputs
  $("#taskTitle").val('');
  $("#taskDueDate").val('');
  $("#taskDescription").val('');
}

//function to handle deleting a task
function handleDeleteTask() {
    const taskId = $(this).attr('data-task-id');
    const taskList = readTasksFromStorage();
  
    taskList.forEach((task) => {
      if (task.tID === taskId) {
        taskList.splice(taskList.indexOf(task), 1);
      }
    });
  
// function to save the projects to localStorage
    saveTasksToStorage(taskList);
  
//  use other function to print projects back to the screen
    renderTaskList();
  }

  function dragstartHandler(ev) {
    ev.dataTransfer.dropEffect = "move";
  }


//function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
     // Read projects from localStorage
  const taskList = readTasksFromStorage();

// ? Get the project id from the event
  const taskId = ui.draggable[0].dataset.taskId;

  console.log(taskId);

// Get the id of the lane that the card was dropped into
  const newStatus = event.target.id;

  for ( let task of taskList) {
// Find the project card by the `id` and update the project status.
    if (task.tID === taskId) {
      task.status = newStatus;
      console.log(`task status: ${task.status}`);
    }
  }
   // Save the updated projects array to localStorage (overwritting the previous one) and render the new project data to the screen.
  localStorage.setItem('taskList', JSON.stringify(taskList));
  
  renderTaskList();

}


// when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker

//on submit create task item
$(document).ready(function () {
  projectFormEl.on("submit", handleAddTask);

  renderTaskList();

  $("#taskDueDate").datepicker({
    changeMonth: true,
    changeYear: true,
  });

// ? Make lanes droppable
  $(".lane").droppable({
    accept: ".draggable",
    drop: handleDrop,
  });
});