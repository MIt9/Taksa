/**
 * Created by d.bilukha on 01.09.2017.
 */
import { ICheck } from './check';

export interface IDepartment {
  id: string,
  title: string,
  checks?: ICheck[]
}
