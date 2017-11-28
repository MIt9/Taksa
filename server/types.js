const uuidv4 = require('uuid/v4');

class Task {
  constructor(item) {
    this.id = item.id ? item.id : uuidv4();
    this.department = item.department || '';
    this.check = item.check || '';
    this.note = item.note || '';
    this.assigned = item.assigned;
    this.createdBy = item.createdBy;
    this.createTime = new Date();
    this.modification = new Date();
    this.dirty = false;
    this.remindTime = item.remindTime || 0;
    this.completed = item.completed;
    this.priority = item.priority || 'low';
    this.files = item.files;
    this.images = item.images;
  }
}

class People {
  constructor(item){
    this.id = uuidv4();
    this.name = item.name;
    this.phone = item.phone || '';
    this.email = item.email || '';
  }
}

class CheckList {
  constructor(name){
    this.name = name;
    this.id = uuidv4();
  }
}

class Department {
  constructor(title, lid){
    this.title = title;
    this.id = uuidv4();
    this.lid = lid;
  }
}
class Message {
  constructor(tid, user, text){
    this.id = uuidv4();
    this.tid = tid;
    this.user = user;
    this.text = text;
    this.createTime = new Date();
  }
}

class Check {
  constructor(item) {
    this.id = item.id ? item.id : uuidv4();
    this.pid = item.pid;
    this.title = item.title;
    this.description = item.description || '';
    this.status = item.status || null;
    this.tasks = item.tasks || [];
    this.max = item.max || 0;
    this.points = 0;
  }
}
module.exports = {
  People, Task, Department, CheckList, Check, Message
};
