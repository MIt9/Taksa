const uuidv4 = require('uuid/v4');
const Datastore = require('nedb');
const {People, CheckList, Check, Department, Task, Message} = require('./types');
const admin = require('./lists/admin.json');
const menager = require('./lists/menager.json');
const test = require('./lists/test.json');
/***
 * DemoDb module
 */

class DemoDb {
  constructor() {
    this.db = {};
    this.db.users = new Datastore({inMemoryOnly: true});
    this.db.tasks = new Datastore({inMemoryOnly: true});
    this.db.departaments = new Datastore({inMemoryOnly: true});
    this.db.checklists = new Datastore({inMemoryOnly: true});
    this.db.checks = new Datastore({inMemoryOnly: true});
    this.db.isUpdateInTask = new Datastore({inMemoryOnly: true});
    this.db.messages = new Datastore({inMemoryOnly: true});
    for (let base in this.db) {
      this.db[base].loadDatabase();
    }
    this.init();
  }

  init() {
    const userList = [
      new People({
        name: 'd.bilukha',
        phone: '+380979810967',
        email: 'd.bilukha@temabit.com'
      }),new People({
        name: 's.tyshkevych',
        phone: '+380675769505',
        email: 's.tyshkevych@temabit.com'
      }),
      new People({
        name: 'i.mykytiuk',
        phone: '‎+380931643997',
        email: 'i.mykytiuk@temabit.com'
      }),
      new People({
        name: 'y.dolgii',
        phone: '‎‎+380634415007',
        email: 'y.dolgii@temabit.com'
      }),
      new People({
        name: 'v.mykhailiuk',
        phone: '‎+380667309142',
        email: 'v.mykhailiuk@temabit.com'
      }),
      new People({
        name: 'ma.kapliuk',
        phone: '‎‎+380674475674',
        email: 'ma.kapliuk@temabit.com'
      })
    ];
    this.db.users.insert(userList);
    // this.db.tasks.insert(this.generateTasks(['ma.kapliuk','v.mykhailiuk','y.dolgii','i.mykytiuk','d.bilukha'], 15));
    this.generateBaseFromListFiles(admin);
    this.generateBaseFromListFiles(menager);
    this.generateBaseFromListFiles(test);

  }
  generateBaseFromListFiles(_list){
    const list = new CheckList(_list.title);
    const lid = list.id;
    const departmentArray = [];
    const checksArray = [];
    for (let i = 0; i < _list.items.length; i++) {
      let depItem = _list.items[i];
      const department = new Department(depItem.department, lid);
      const pid = department.id;
      departmentArray.push(department);
      for (let j = 0; j < depItem.checks.length; j++) {
        const item = depItem.checks[j];
        item.pid = pid;
        item.status = null;
        const check = new Check(item);
        checksArray.push(check);
      }
    }
    this.db.checklists.insert(list);
    this.db.departaments.insert(departmentArray);
    this.db.checks.insert(checksArray);
  }
  getUsers() {
    return new Promise((resolve, reject) => {
      this.db.users.find().sort({name: 1}).exec(function (err, users) {
        if (err) {
          reject({error: err});
        }
        resolve(users);
      })
    })
  }

  getTasks(user, updated, change) {
    const that = this;
    return new Promise((resolve, reject) => {
      this.db.tasks.find({assigned: user}).sort({completed: 1}).exec(function (err, myList) {
        if (err) {
          reject({error: err});
        }
        that.db.tasks.find({
          createdBy: user,
          assigned: {$ne: user}
        }).sort({completed: 1}).exec(function (err, elseList) {
          if (err) {
            reject({error: err});
          }
          resolve({tasks:[...myList, ...elseList], updated, change});
        })
      })
    })
  }

  getTasksById(tasks, onlyUncompleted) {
    const result = [];
    for (let i = 0; i < tasks.length; i++) {
      const id = tasks[i];
      const data = onlyUncompleted ? {completed: false, id: id} : {id: id};
      result.push(
        new Promise((resolve, reject) => {
          this.db.tasks.find(data).exec(function (err, myList) {
            if (err) {
              reject({error: err});
            }
            resolve(myList[0]);
          })
        })
      )
    }
    return Promise.all(result)
  }

  getAllLists(user) {
    const that = this;
    return new Promise((resolve, reject) => {
      this.db.checklists.find({}).sort({title: 1}).exec(async function (err, list) {
        if (err) {
          reject({error: err});
        }
        const result = {};
        for (let i = 0; i < list.length; i++) {
          const listName = list[i].name;
          result[listName] = await that.getList(listName);
        }
        resolve(result)
      })
    })
  }

  addMessage(tid, user, text) {
    const message = new Message(tid, user, text);
    return new Promise((resolve, reject) => {
      this.db.messages.insert(message, function (err, result) {
        if (err) {
          reject({error: err});
        } else {
          resolve(result);
        }
      })
    })
  }

  syncMessage(messages) {
    return new Promise((resolve, reject) => {
      this.db.messages.insert(messages, function (err, result) {
        if (err) {
          reject({error: err});
        } else {
          resolve(result);
        }
      })
    })
  }

  getMessageByTaskId(tid) {
    return new Promise((resolve, reject) => {
      this.db.messages.find({tid: tid}).sort({createTime: 1}).exec(function (err, list) {
        if (err) {
          reject({error: err});
        } else {
          resolve(list);
        }
      })
    })
  }

  getList(listName) {
    const that = this;
    return new Promise((resolve, reject) => {
      this.db.checklists.find({name: listName}).exec(function (err, list) {
        if (err) {
          reject({error: err});
        }
        if (list.length === 1) {
          that.db.departaments.find({lid: list[0].id}).exec(function (err, departments) {
            if (err) {
              reject({error: err});
            }
            const promiseArray = [];
            for (let i = 0; i < departments.length; i++) {
              const dep = departments[i];
              promiseArray.push(new Promise((resolve, reject) => {
                that.db.checks.find({pid: dep.id}).sort({description: 1}).exec(function (err, checks) {
                  if (err) {
                    reject({error: err});
                  }
                  dep.checks = checks;
                  resolve(true)
                })
              }))
            }
            Promise.all(promiseArray).then(() => {
              resolve(departments);
            }).catch(
              (err) => {
                reject({error: err});
              }
            );
          })
        } else {
          reject({error: err});
        }
      })
    })
  }

  updateCheck(check) {
    return new Promise((resolve, reject) => {
      this.db.checks.update({id: check.id}, check, function (err, result) {
        if (err) {
          reject({error: err});
        } else {
          resolve(check);
        }
      })
    })
  }
  detectChangeInTaskUpdate(oldTask, updatedTask){
    let messageArray = [];
    const change = {};
    if(oldTask === null){
      change.message = 'Задача создана';
      return change;
    }
    if(oldTask.department !== updatedTask.department){
      messageArray.push(`Отделение изминено с ${oldTask.department} на ${updatedTask.department}`);
      change.department = {
        from: oldTask.department,
        to: updatedTask.department
      }
    }
    if(oldTask.check !== updatedTask.check){
      messageArray.push(`Проверка изминена с ${oldTask.check} на ${updatedTask.check}`);
      change.check = {
        from: oldTask.check,
        to: updatedTask.check
      }
    }
    if(oldTask.note !== updatedTask.note){
      messageArray.push(`Описание изминено с ${oldTask.note} на ${updatedTask.note}`);
      change.note = {
        from: oldTask.note,
        to: updatedTask.note
      }
    }
    if(oldTask.assigned !== updatedTask.assigned){
      messageArray.push(`Ответственый изминен с ${oldTask.assigned} на ${updatedTask.assigned}`);
      change.assigned = {
        from: oldTask.assigned,
        to: updatedTask.assigned
      }
    }
    if(oldTask.completed !== updatedTask.completed){
      messageArray.push(`Состояние изминено с ${oldTask.completed} на ${updatedTask.completed}`);
      change.completed = {
        from: oldTask.completed,
        to: updatedTask.completed
      }
    }
    if(oldTask.priority !== updatedTask.priority){
      const priority ={
        low: 'низкий',
        normal: 'нормальный',
        high: 'высокий'
      };
      messageArray.push(`Приоритет изминен с ${priority[oldTask.priority]} на ${priority[updatedTask.priority]}`);
      change.completed = {
        from: oldTask.priority,
        to: updatedTask.priority
      }
    }
    change.message = messageArray.join('; \n');
    return change;
  }
  updateTask(task) {
    const that = this;
    task.dirty = false;
    return new Promise((resolve, reject) => {
      this.db.tasks.find({id: task.id}).exec(function (err, oldTask) {
        if (err) {
          reject({error: err});
        }
        if (oldTask.length === 0){
          resolve(that.createTask(task));
        } else {
          if (oldTask.modification > task.modification ) {
            resolve({updated:oldTask});
          }
          that.db.tasks.update({id: task.id}, task, function (err) {
            const change = that.detectChangeInTaskUpdate(oldTask[0] || null, task);
            if (err) {
              reject({error: err});
            } else {
              resolve({updated:task, change});
            }
          })
        }
      })
    })
  }
  syncTasks(tasksArray){
      const taskArray = [];
      for(let item of tasksArray){
        taskArray.push(this.updateTask(item))
      }
      return Promise.all(taskArray);
  }
  createTask(item) {
    const that = this;
    const task = new Task(item);
    return new Promise((resolve, reject) => {
      this.db.tasks.insert(task, function (err, updated) {
        if (err) {
          reject({error: err});
        } else {
          const change = that.detectChangeInTaskUpdate(null, task);
          resolve({updated, change});
        }
      })
    })
  }

  generateTasks(userList, n) {
    const result = [];
    for (let i = 0; i < userList.length; i++) {
      const user = userList[i];
      for (let j = 0; j < n; j++) {
        const item = new Task({
          department: 'Test department',
          check: 'test check ' + user,
          note: 'test note ' + user + ' ' + j,
          assigned: user,
          createdBy: j % 2 === 0 ? 'd.bilukha' : user,
          completed: j % 2 !== 0,
          files: [],
          images: []
        });
        result.push(item);
      }
    }
    return result
  }

  generateDepartment(checklist, n) {
    const result = [];
    for (let i = 0; i < checklist.length; i++) {
      const list = checklist[i];
      for (let j = 0; j < n; j++) {
        const item = new Department(list.name + ' some department ' + j, list.id);
        result.push(item);
      }
    }
    return result
  }

  generateChecks(departments, n) {
    const result = [];
    for (let i = 0; i < departments.length; i++) {
      const list = departments[i];
      for (let j = 0; j < n; j++) {
        const item = new Check({
          pid: list.id,
          title: list.title + ' some checks ' + j,
          description: list.title + ' some description ' + j,
          status: null,
          tasks: []
        });
        result.push(item);
      }
    }
    return result
  }

  /***
   * Generate uid
   * @returns {String}
   */
  generateId() {
    return uuidv4();
  }

}

module.exports = DemoDb;
