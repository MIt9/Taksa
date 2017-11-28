/**
 * Created by d.bilukha on 30.08.2017.
 */
export interface ITask {
  id: string,
  department: string,
  check: string,
  note: string,
  assigned: string,
  createdBy: string,
  createTime: Date,
  modification: Date,
  dirty: boolean,
  remindTime: number,
  priority: 'low' | 'medium' | 'high',
  completed: boolean,
  files: string[],
  images: string[]
}
