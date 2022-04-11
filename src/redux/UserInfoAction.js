/* 
	该文件专门为Count组件生成action对象
*/
import {ADMINISTRATOR,COMMERCE,PAWNSHOPSTAFF,USER,EXPERT} from './constant'

export const createAdministratorAction = data => ({type:ADMINISTRATOR,data})
export const createCommerceAction = data => ({type:COMMERCE,data})
export const createPawnshopstaffAction = data => ({type:PAWNSHOPSTAFF,data})
export const createUserAction = data => ({type:USER,data})
export const createExpertAction = data => ({type:EXPERT,data})
