import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import MyNavLink from '../../components/MyNavLink'
import AssessStandard from './system/assessStandard'
import PawnDetails from './system/pawnDetails'
import CommerceMember from './infoManage/commerceMember'
import PawnshopInfo from './infoManage/pawnshopInfo'
import UserInfo from './infoManage/userInfo'
import ExpertInfo from './infoManage/expertInfo'

//引入store，用于获取redux中保存状态
import store from '../../redux/store'
//引入actionCreator，专门用于创建action对象
import {createAdministratorAction} from '../../redux/UserInfoAction'

import '../../style/pawnshop.less'
import { Layout, Menu, Button } from 'antd'
import {
    SettingOutlined,
    FormOutlined
} from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

export default function Administrators() {
    const state = {
        collapsed: false,
        userid: ''
    }

    const params = useLocation()
    state.userid = params.state?params.state.id:state.userid
    
    const onCollapse = collapsed => {
        state.collapsed = collapsed;
    };

    return (
        <Layout>
            <Header className="header">
                <div className="logo" />
                <h2 style={{color:'white',float:'left'}}>管理信息平台————管理员</h2>
                <Button className="exitBtn"
                style={{float:'right',color:'#888', top:16, right:10,width:72,height:32, cursor:'pointer'}}
                onClick={()=>{store.dispatch(createAdministratorAction({})); window.history.back(-1)}}>
                    退出
                </Button>
                <p style={{float:'right',color:'white',marginRight:50}}>管理员： Tiffany</p>
            </Header>
            <Layout>
                <Sider collapsible collapsed={state.collapsed} onCollapse={onCollapse}>
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                    <SubMenu key="sub1" icon={<SettingOutlined />} title="系统设置">
                        {/* <Menu.Item key="1">
                            <MyNavLink replace to={`system/assessstandard`}>估价标准设置</MyNavLink>
                        </Menu.Item> */}
                        <Menu.Item key="2">
                            <MyNavLink replace to={`system/pawndetails`}>典当类目设置</MyNavLink>
                        </Menu.Item>
                    </SubMenu>
                    <SubMenu key="sub2" icon={<FormOutlined />} title="信息管理">
                        <Menu.Item key="3">
                            <MyNavLink replace to={`infomanage/commercemember`}>商务部人员管理</MyNavLink>
                        </Menu.Item>
                        <Menu.Item key="4">
                            <MyNavLink replace to={`infomanage/pawnshopinfo`}>当行信息管理</MyNavLink>
                        </Menu.Item>
                        <Menu.Item key="5">
                            <MyNavLink replace to={`infomanage/userinfo`}>用户信息管理</MyNavLink>
                        </Menu.Item>
                        <Menu.Item key="6">
                            <MyNavLink replace to={`infomanage/userinfo`}>个人信息管理</MyNavLink>
                        </Menu.Item>
                        {/* <Menu.Item key="6">
                            <MyNavLink replace to={`infomanage/expertinfo`}>专家信息管理</MyNavLink>
                        </Menu.Item> */}
                    </SubMenu>
                </Menu>
                </Sider>
                <Layout className="site-layout">
                    <Content style={{ margin: '10px 16px' }}>
                        <div style={{ padding: 10, height: '83vh' }}>
                            <Routes>
                                <Route path="system/assessstandard" element={<AssessStandard/>}/>   
                                <Route path="system/pawndetails" element={<PawnDetails/>}/>    
                                <Route path="infomanage/commercemember" element={<CommerceMember/>}/>   
                                <Route path="infomanage/pawnshopinfo" element={<PawnshopInfo/>}/>    
                                <Route path="infomanage/userinfo" element={<UserInfo/>}/>
                                <Route path="infomanage/expertinfo" element={<ExpertInfo/>}/>
                            </Routes>
                        </div>
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>典当管理信息平台 © 管理员</Footer>
                </Layout>
            </Layout>
        </Layout>
    )

}