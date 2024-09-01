import React, { Component } from 'react';
import Login from './pages/Login';
import Pawnshop from './pages/pawnshop';
import Commerce from './pages/commerce';
import Administrators from './pages/administrators';
import Experts from './pages/experts';
import Users from './pages/users';
import './App.less';
import { Routes, Route } from 'react-router-dom';

//全局配置中文
import { ConfigProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';

export default class App extends Component {
  render() {
    return (
      <div className='main'>
        <ConfigProvider locale={zh_CN}>
          <Routes>
            <Route path="*" element={<Login/>} />
            <Route path="/pawnshop/*" element={<Pawnshop/>}/>
            <Route path="/commerce/*" element={<Commerce/>}/>
            <Route path="/administrators/*" element={<Administrators/>}/>
            <Route path="/experts/*" element={<Experts/>}/>
            <Route path="/users/*" element={<Users/>}/>
          </Routes>
        </ConfigProvider>
      </div>
    )
  }
}
