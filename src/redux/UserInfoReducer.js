/* 
	1.该文件是用于创建一个为Count组件服务的reducer，reducer的本质就是一个函数
	2.reducer函数会接到两个参数，分别为：之前的状态(preState)，动作对象(action)
*/
import {ADMINISTRATOR,COMMERCE,PAWNSHOPSTAFF,USER,EXPERT} from './constant'
import axios from 'axios'

const initUserinfo={}//初始化状态
export default function UserInfoReducer(preState=initUserinfo,action){
	//console.log(preState);
	//从action对象中获取：type、data
	const {type,data} = action
	//根据type决定如何加工数据
	switch (type) {
		case ADMINISTRATOR: //管理员
			return data
		case COMMERCE: //商务部
			return data
        case PAWNSHOPSTAFF: //典当行
			return data
        case USER: //用户
			return data
        case EXPERT: //专家
			return data
		default:
			return preState
	}
}