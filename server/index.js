const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require("fs");
const Buffer = require("Buffer");

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const router = express.Router();
const DemoDb = require('./demo-db');
const neDB = new DemoDb();

const userToId = {};
const idToUser = {};
const files = {};

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/files", express.static(__dirname + '/files'));
app.use('/api', router);
router.get('/', (req, res) => {
  res.send('api works');
});


router.post('/updateCheck', (req,res) =>{
  const check = req.body.check;
  (async()=>{
    try{
      let result = await neDB.updateCheck(check);
      res.status(200).json(result);
    }catch(err){
      res.status(500).json(err);
    }
  })();
});

router.post('/getTasksInChecks', (req,res) =>{
  const tasks = req.body.tasks;
  (async()=>{
    try{
      let tmp = await neDB.getTasksById(tasks, true);
      let result = [];
      for (let i = 0; i < tmp.length; i++) {
        const item = tmp[i];
        if(item !== undefined) {
          result.push(item)
        }
      }
      res.status(200).json(result);
    }catch(err){
      res.status(500).json(err);
    }
  })();
});
router.post('/updateTaskWithUploading', (req, res) => {
  const task = req.body.task;
  const name = req.body.name;
  const fileArray = req.body.fileArray;
  const photoArray = req.body.photoArray;
  (async()=>{
    try{
      const fileList = await writeFilesFromArray(fileArray);
      const photoList = await writeFilesFromArray(photoArray);
      console.log('photoList=>',photoList);
      task.files = task.files.concat(fileList);
      task.images = task.images.concat(photoList);
      let result = {};
      if(task.id === null || task.id === undefined){
        result = await neDB.createTask(task, name);
      } else {
        result = await neDB.updateTask(task, name);
      }
      updateTask(result.updated, result);
      updateChangeTask(result);
      res.status(200).json(result);
    }catch(err){
      res.status(500).json(err)
    }
  })();
});

router.post('/updateTask', (req,res) =>{
  const task = req.body.task;
  const name = req.body.name;
  console.log(req.body)
  (async()=>{
    try{
      let result = {};
      if(task.id === null || task.id === undefined){
        result = await neDB.createTask(task, name);
      } else {
        result = await neDB.updateTask(task, name);
      }
      updateTask(result.updated, result);
      updateChangeTask(result);
      res.status(200).json(result);
    }catch(err){
      res.status(500).json(err)
    }
  })();
});

function updateChangeTask(data){
  if (data.change.message){
    neDB.addMessage(data.updated.id, 'system', data.change.message)
      .then(()=>{
        updateMessage(data.updated)
      })
      .catch(e=>console.log(e));
  }
}

router.post('/getMessages', (req,res) =>{
  const task = req.body.task;
  (async()=>{
    try{
      let result = await neDB.getMessageByTaskId(task.id);
      updateTask(task);
      res.status(200).json(result);
    }catch(err){
      res.status(500).json(err)
    }
  })();
});

router.post('/addMessage', (req,res) =>{
  const user = req.body.user;
  const task = req.body.task;
  const text = req.body.text;
  (async()=>{
    try{
      let result = await neDB.addMessage(task.id, user, text);
      updateMessage(task);
      updateTask(task);
      res.status(200).json(result);
    }catch(err){
      res.status(500).json(err)
    }
  })();
});
router.post('/syncMessage', (req,res) =>{
  const messages = req.body.messages;
  (async()=>{
    try{
      let result = await neDB.syncMessage(messages);
      updateMessage(task);
      updateTask(task);
      res.status(200).json(result);
    }catch(err){
      res.status(500).json(err)
    }
  })();
});

router.post('/tasks', (req,res) =>{
  const name = req.body.name;
  (async()=>{
    try{
      let result = await neDB.getTasks(name);
      res.status(200).json(result);
    }catch(err){
      res.status(500).json(err)
    }
  })();
});

router.post('/syncTasks', (req,res) =>{
  const task = req.body.task;
  const name = req.body.name;
  (async()=>{
    try{
      await neDB.syncTasks(task);
      let result = await neDB.getTasks(name);
      res.status(200).json(result);
    }catch(err){
      res.status(500).json(err)
    }
  })();
});

router.post('/list', (req,res) =>{
  if (req.body && req.body.listName){
    const listName = req.body.listName;
    (async()=>{
      try{
        let result = await neDB.getList(listName);
        res.status(200).json(result);
      }catch(err){
        res.status(500).json(err)
      }
    })();
  }else {
    res.status(500).json({error: 'no list name in request'})
  }
});

router.post('/lists', (req,res) =>{
  if (req.body && req.body.name){
    const name = req.body.name;
    (async()=>{
      try{
        let result = await neDB.getAllLists(name);
        res.status(200).json(result);
      }catch(err){
        res.status(500).json(err)
      }
    })();
  }else {
    res.status(500).json({error: 'no list name in request'})
  }
});
router.post('/getUsers', (req,res) =>{
    (async()=>{
      try{
        let result = await neDB.getUsers();
        res.status(200).json(result);
      }catch(err){
        res.status(500).json(err)
      }
    })();
});

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.send('only api works');
});

io.on('connection', function (client) {
    console.log('Client connected...', client.id);
    client.on('message', function (data) {
      client.emit('message',{text: 'message received'});
    });
    client.on('login', function (data) {
      // console.info(`[Logged] ${client.id}. Message: ${JSON.stringify(data)}`);
      addUser(userToId, idToUser, data.name, client.id);
    });
    client.on('end', function () {
      removeUser(userToId, idToUser, client.id);
    });
    client.on('close', function () {
      removeUser(userToId, idToUser, client.id);
    });
    client.on('disconnect', function () {
      removeUser(userToId, idToUser, client.id);
    });
    client.on('upload', (data) => {
      writeFileToDisk(data).then(()=>{
        client.emit('end upload',{file: data.title});
      }).catch(e=>{console.log(e)})
    })
  }

);

function addUser(userList, idList, userName, id){
  idList[id] = userName;
  if (!userList[userName]) {
    userList[userName] = [id];
  } else {
    userList[userName].push(id);
  }
  // console.log('[addUser => ]', JSON.stringify(userList, null, 3), JSON.stringify(idList, null, 3))
}

function removeUser(userList, idList, id) {
  const userName = idList[id];
  if (userName !== undefined) {
    const itemList = userList[userName];
    if (itemList !== undefined) {
      const index = itemList.indexOf(id);
      if (index !== -1){
        itemList.splice(index, 1);
        if (itemList.length === 0) {
          delete userList[userName]
        }
      }
    }
    delete idList[id];
  }
  // console.log('[removeUser => ]', JSON.stringify(userList, null, 3), JSON.stringify(idList, null, 3))
}

function getSocketOfUsers(task ,data){
  let changedSocketArray = [];
  if (data && data.change && data.change.assigned && data.change.assigned.from){
    changedSocketArray = userToId[data.change.assigned.from] || [];
  }
  const assignedSocketArray = userToId[task.assigned] || [];
  const createBydSocketArray = userToId[task.createdBy] || [];
  return assignedSocketArray.concat(createBydSocketArray).concat(changedSocketArray);
}

function updateTask(task, data){
  const userSockets = getSocketOfUsers(task, data);
  for (let i = 0; i < userSockets.length; i++) {
    const socket = userSockets[i];
    io.to(socket).emit('updateTasks',{update: true});
  }
}

function updateTasks (tasks, data){
  let result = [];
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const userSockets = getSocketOfUsers(task, data);
    result = [...userSockets];
  }
  const uniq = result.reduce(function(a,b){
    if (a.indexOf(b) < 0 ) a.push(b);
    return a;
  },[]);
  for (let i = 0; i < uniq.length; i++) {
    const socket = uniq[i];
    io.to(socket).emit('updateTasks',{update: true});
  }
}

function updateMessage(task){
  const assignedSocketArray = userToId[task.assigned] || [];
  const createBydSocketArray = userToId[task.createdBy] || [];
  const userSockets = assignedSocketArray.concat(createBydSocketArray);
  for (let i = 0; i < userSockets.length; i++) {
    const socket = userSockets[i];
    io.to(socket).emit('updateMessage',{tid: task.id});
  }
}

function updateTaskMessage(){

}


async function writeFilesFromArray(fileArray){
  const filePromise = [];
  fileArray.forEach((item)=>{
    filePromise.push(writeFileToDisk(item));
  });
  return await Promise.all(filePromise);
}

function writeFileToDisk(data){
  return new Promise((resolve, reject)=>{
    const taskPath = __dirname + '/files/'+data.taskId+'/';
    if (!fs.existsSync(taskPath)){
      fs.mkdirSync(taskPath);
    }
    fs.writeFile( taskPath+data.title, data.base64, 'base64', function(err) {
      if(err){
        reject(err);
      }
      resolve(data.title);
    });
  })
}
server.listen(4600);
