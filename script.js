class TaskManager {
    /*
        Initialized Vars
    */
    recordedData = {};
    constructor(rootElem) {
        let savedData = localStorage.getItem('__sked');
        if (savedData){
            let parsed = JSON.parse(savedData);
            console.log(parsed);
            this.lists = [...parsed.lists];
            this.tasks = [...parsed.tasks];
        }
        else{
            this.lists = [
            {
                name: 'Pending',
                id: 'pending',
                description: 'This is a pending items List'
            }
            ];
            this.tasks = [

            ];
        }
        this.rootElem = rootElem;
    }

    createTask = (newTaskObj, listId) =>{
        let taskId = `task_${btoa(newTaskObj.name.replace(' ', '_'))}${Math.floor(Math.random() * 90 + 10)}`;
        // Copy to New Object
        let obj = { ...newTaskObj };
        obj['id'] = taskId;
        obj['list'] = listId;
        
        // Add Tasks
        this.tasks.push(obj);
        
        /*
            Refresh Lists, Update Draggables
        */
        this.renderLists();
        new DragAndDrop();

        /*
            Save Progress To Local Storage
        */
       this.save();
    }

    /*
        Render Lists
        @params : none
    */
    renderLists = () =>{
        /*
            Clean up before render/rerender
        */
        this.cleanRootElement()
        let lists = this.lists;
        console.log(this.tasks);
        lists.map(item=>{
            let tasks = this.renderThisListTasks(item.id);
            let sanitizedMarkup = tasks && tasks.length>0 ? tasks.join(''):'';
            this.rootElem.innerHTML += `<div class="drag-box" id="${item.id}">${sanitizedMarkup}<div class="list-name">${item.name}</div></div>`
        });
        this.rootElem.innerHTML += `<div class="drag-box new-list"><span>Add a New List</span> 
        <input type="text" name="list_name"  placeholder="List Name" id="newListName"/><input type="text" name="list_description" placeholder="Description" id="newListdescription"/>
        <button type="button" id="addList" onclick="addList()">Add</button></div>`;

        this.removeGarbageMarkup();
    }
    

    /*
        Render Tasks on Lists
        @params id: string
    */

    renderThisListTasks = (id) =>{
        let listItems = [];
        let tasks_ = this.tasks;

        tasks_.map((item, index)=>{
            if(id===item.list){
                listItems.push(`        <div class='drag-card'>
            <div draggable='true' id="${item.id}" class='drag-task' tooltip=${item.description}>
            <div class="infoPane">
                <span id="name-${item.id}" onchange="handleValueChange(this)">${item.name}</span>
                <div class="actionBtn"><span id="edit-${item.id}" onclick="editTask(this)">Edit</span><span id="edit-${item.id}" onclick="window.taskManager_.deleteTask(this)">Delete</span>
                    </div>
            </div>
                <div class="description">
                    <div id="description-${item.id}" onchange="handleValueChange(this)">${item.description}</div>
                    <button type="button" id="editTask-${item.id}" onclick="window.taskManager_.finalizeEdit(${item.id})">Save</button>
                    <button id="hideForm-${item.id}"
                onclick="closeEdit(this)">Close</button>
                </div>
                    </div>
                    </div>`);
            }
            else{
                listItems.push(`<div class="noDisplay"></div>`);
            }
            /*
                For New Task CTA
            */
            index === tasks_.length - 1 && listItems.unshift(`<div>
            
    <div id="addNewTask-${id}" class="addNewTaskCta" onClick={showAddForm(this)}>Add a New Task </div>
    <div id="wrapperAddNewTask-${id}" class="addNewTaskForm">
        <div class="inputFields">
        <input type="text" name="task_name" placeholder="Task Name"
            id="newTaskName-${id}" />
            <input type="text" name="task_description" placeholder="Task Description"
            id="newTaskdescription-${id}" />
        </div>
        <div class="actionButtons">
        <button type="button" id="addTask-${id}" onclick="createNewTask(this)">Add</button>
        <button id="hideForm-${id}"
            onclick="hideForm(this)">Close</button>
       </div>
    </div>
</div>`)
        });
        if(tasks_.length===0){
            listItems.push(`<div>
    <div id="addNewTask-${id}" class="addNewTaskCta" onClick={showAddForm(this)}>Add a New Task </div>
    <div id="wrapperAddNewTask-${id}" class="addNewTaskForm">
        <div class="inputFields">
        <input type="text" name="task_name" placeholder="Task Name"
            id="newTaskName-${id}" />
            <input type="text" name="task_description" placeholder="Task Description"
            id="newTaskdescription-${id}" />
        </div>
        <div class="actionButtons">
        <button type="button" id="addTask-${id}" onclick="createNewTask(this)">Add</button>
        <button id="hideForm-${id}"
            onclick="hideForm(this)">Close</button>
       </div>
    </div>
</div>`);
        }
        return listItems;
    }

    /*
        Create New List
        @params listObj:Object
    */
    createNewList = (listObj) => {
        let listId = `list_${btoa(listObj.name.replace(' ', '_'))}${Math.floor(Math.random() * 90 + 10)}`;
        // Copy to New Object
        let obj = { ...listObj };
        obj['id'] = listId;


        // Add List
        this.lists.push(obj);
        
        this.renderLists();
        /*
        Save Progress To Local Storage
        */
        this.save();
    }
    
    /*
        Finalize Edit
    */
    finalizeEdit = (identifier) => {
        let updatedTasks = this.tasks.map(item=>{
            if(item.id === identifier.id){
                item.name = this.recordedData.name ? this.recordedData.name:item.name;
                item.description = this.recordedData.description ? this.recordedData.description:item.description;
            }
            return item;
        });
        this.tasks = [...updatedTasks];
        this.renderLists();
        /*
        Save Progress To Local Storage
        */
        this.save();
    }

    /*
        Clean Root Element
    */
    cleanRootElement = () => {
        this.rootElem.innerHTML = "";
    }

    /*
        Clean Garbage Element
    */
    removeGarbageMarkup = () =>{
        var elements = document.getElementsByClassName('noDisplay');
        while (elements.length > 0) {
            elements[0].parentNode.removeChild(elements[0]);
        }
       
    }

    /*
        Add Task To Moved List
    */
    addTaskToUpdatedList = (id, targetId) =>{
        let updatedTasks = [];
        this.tasks.map(item=>{
            if(item.id === id){
                item.list = targetId;
            }
            updatedTasks.push(item);
            
        });
        this.tasks = updatedTasks;
        // Rerender after Updated List
        this.renderLists();

        /*
        Save Progress To Local Storage
        */
        this.save();
    }

    /*
        Record Values While Editing
    */
    recordValues = (elemName, value) =>{
        let recordedData_ = {...this.recordedData};
        recordedData_[elemName]=value;
        this.recordedData = { ...recordedData_};
    }

    /*
        Delete Task  
    */
    deleteTask = (e) =>{
        let identifier = e.id.split('-')[1];
        let updatedTasks = this.tasks.filter(item=>{
            return item.id !== identifier;
        });
        this.tasks = updatedTasks;

        //Rerender After Delete
        this.renderLists();
        /*
        Save Progress To Local Storage
        */
        this.save();
    }

    save = () =>{
        let saveObj = {
            lists:[...this.lists],
            tasks: [ ...this.tasks ]
        };
        localStorage.setItem('__sked', JSON.stringify(saveObj));
    }


}

class DragAndDrop{
    constructor(){
        var dropTarget = document.querySelector(".drop-target");
        this.updateDraggableNodes();

        /*
            Add Events
        */
        dropTarget.addEventListener('dragover', function (ev) {
            ev.preventDefault();
        });
        // End destination where item is dropped into
        dropTarget.addEventListener('drop', function (ev) {
            ev.preventDefault();
            let target = ev.target;
            let droppable = target.classList.contains('drag-box');
            let srcId = ev.dataTransfer.getData("srcId");
            if (droppable) {
                ev.target.appendChild(document.getElementById(srcId));
                window.taskManager_.addTaskToUpdatedList(srcId, target.id);
            }
        });
    }
    
    /*
        Draggable Update
    */
    updateDraggableNodes = () => {
        /*
            Drag And Drop Functionality
        */
        var draggables = document.querySelectorAll(".drag-task");

        // Tells the other side what data is being passed (e.g. the ID is targeted)
        draggables.forEach(item => {
            item.addEventListener("dragstart", function (ev) {
                ev.dataTransfer.setData("srcId", ev.target.id);
            });
        })
    }
}


////////////// Window onLoad & Initial Selectors and Class Initialization----------------------------------------------------------
window.onload = ()=>{
    /*
        Get Root Element for the App
    */
    let rootElem = document.getElementById('__taskManagerRoot')
    window.taskManager_ = new TaskManager(rootElem);
    
    // Create Lists
    window.taskManager_.renderLists();

    
    /*
        Instantiate Drag And Drop Functionality
    */
    new DragAndDrop();

};

/*
    Wrapper Methods
*/

addList = () =>{
    let name = document.getElementById('newListName').value;
    let description = document.getElementById('newListdescription').value;
    if(!name){
        alert('Name is Required');
        return false;
    }
    let listObj = {
        name, description
    }
    window.taskManager_.createNewList(listObj);
}

createNewTask = (e) =>{
    let uniq_id = e.id.split('-')[1];
    let newTaskName = document.getElementById(`newTaskName-${uniq_id}`).value;
    let newTaskDescription = document.getElementById(`newTaskdescription-${uniq_id}`).value;
    let taskObj = {
        name:newTaskName,
        description:newTaskDescription
    };
    window.taskManager_.createTask(taskObj, uniq_id);

}

showAddForm = (e) =>{
    let uniq_id = e.id.split('-')[1];
    let wrapperDiv = document.getElementById(`wrapperAddNewTask-${uniq_id}`);
    wrapperDiv.style.display = 'flex';
}

hideForm = (e) =>{
    let uniq_id = e.id.split('-')[1];
    let wrapperDiv = document.getElementById(`wrapperAddNewTask-${uniq_id}`);
    wrapperDiv.style.display = 'none';
}

editTask = (e) =>{
 let task_id = e.id.split('-')[1];
    let descriptionDiv = document.getElementById(`description-${task_id}`);
    let nameDiv = document.getElementById(`name-${task_id}`);
    nameDiv.contentEditable = true;
    descriptionDiv.contentEditable = true;
    var name = null;
    var description = null;
    nameDiv.addEventListener("input", function () {
        name = nameDiv.textContent;
        window.taskManager_.recordValues('name', name, task_id);
    }, false);
    descriptionDiv.addEventListener("input", function () {
        description = descriptionDiv.textContent;
        window.taskManager_.recordValues('description', description, task_id);
    }, false);
    descriptionDiv.parentElement.style.display = 'block';
}
closeEdit = (e) => {
    let task_id = e.id.split('-')[1];
    let descriptionDiv = document.getElementById(`description-${task_id}`);
    descriptionDiv.parentElement.style.display = 'none';
}



/////////////////////////////----------------------------------------------------------
