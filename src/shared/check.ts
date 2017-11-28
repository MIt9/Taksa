export interface ICheck {
  id: string,
  pid: string,
  title: string,
  description: string,
  status: boolean,
  max: number,
  points: number,
  tasks: string[]
}
