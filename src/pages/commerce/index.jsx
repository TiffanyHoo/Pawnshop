// 商务部子系统
import React, { Component } from 'react'
import axios from 'axios'
import { Route, Routes, useLocation } from 'react-router-dom'
import MyNavLink from '../../components/MyNavLink'
import PawnshopInfo from './qualification/pawnshopInfo'
import RegistrationAudit from './qualification/registrationAudit'
import InfoChangeAudit from './qualification/infoChangeAudit'
import PawnItems from './supervise/pawnItems'
import Pawner from './supervise/pawner'
import PersonalInfo from './personalInfo'

//引入store，用于获取redux中保存状态
import store from '../../redux/store'
//引入actionCreator，专门用于创建action对象
import {createCommerceAction} from '../../redux/UserInfoAction'

import '../../style/pawnshop.less'
import { Layout, Menu, Breadcrumb, Button } from 'antd'
import {
  AuditOutlined,
  EyeOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

const state = {
    collapsed: false,
    userid: '',
    userinfo:{},
    loginFlag: false
}

export default function Commerce() {

    const params = useLocation()

    if(state.userid!==''){

    }else{
        state.userid = params.state?params.state.id:state.userid
    }
    
    const onCollapse = collapsed => {
        state.collapsed = collapsed;
    };

    const getData = async () => {
        if(state.loginFlag){
        }else{
            let userinfo = {}
            await axios.get('/getComMem',{
                params:{
                    id: state.userid,
                }
            }).then(response=>{
                if(response.data.length === 0){
                    console.log('无数据')
                }else{
                    userinfo = response.data[0]
                }
            }).catch(error=>{
                console.log(error);
            });
            state.userinfo = userinfo
            state.loginFlag = true
        }
        store.dispatch(createCommerceAction(state.userinfo))
        //console.log(state.userinfo)
    }

    getData()

    return (
        <Layout>
            <Header className="header">
                <div className="logo" />
                <h2 style={{color:'white',float:'left'}}>典当信息监管平台</h2>
                <Button className="exitBtn"
                style={{float:'right',color:'#888', top:16, right:10,width:72,height:32, cursor:'pointer'}}
                onClick={()=>{store.dispatch(createCommerceAction({})); window.history.back(-1)}}>
                    退出
                </Button>
            </Header>
            <Layout>
                <Sider collapsible collapsed={state.collapsed} onCollapse={onCollapse}>
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                    <SubMenu key="sub1" icon={<AuditOutlined />} title="资质管理">
                        <Menu.Item key="1">
                            <MyNavLink replace to={`qualification/pawnshopinfo`}>当行信息管理</MyNavLink>
                        </Menu.Item>
                        <Menu.Item key="2">
                            <MyNavLink replace to={`qualification/registrationaudit`}>注册审核</MyNavLink>
                        </Menu.Item>
                        <Menu.Item key="3">
                            <MyNavLink replace to={`qualification/infochangeaudit`}>信息变更审核</MyNavLink>
                        </Menu.Item>
                    </SubMenu>
                    <SubMenu key="sub2" icon={<EyeOutlined />} title="典当监管">
                        <Menu.Item key="4">
                            <MyNavLink replace to={`supervise/pawnitems`}>当物合规管理</MyNavLink>
                        </Menu.Item>
                        <Menu.Item key="5">
                            <MyNavLink replace to={`supervise/pawner`}>当户信息管理</MyNavLink>
                        </Menu.Item>
                    </SubMenu>
                    <SubMenu key="sub3" icon={<UserOutlined />} title="信息管理">
                        <Menu.Item key="6">
                            <MyNavLink replace to={`personalInfo`}>个人信息管理</MyNavLink>
                        </Menu.Item>
                    </SubMenu>
                </Menu>
                </Sider>
                <Layout className="site-layout">
                    <Content style={{ margin: '10px 16px' }}>
                        <div className="site-layout-background" style={{ padding: 10, height: '80vh' }}>
                        <Routes>
                            <Route path="qualification/pawnshopinfo" element={<PawnshopInfo/>}/>   
                            <Route path="qualification/registrationaudit" element={<RegistrationAudit/>}/>    
                            <Route path="qualification/infochangeaudit" element={<InfoChangeAudit/>}/>   
                            <Route path="supervise/pawnitems" element={<PawnItems/>}/>    
                            <Route path="supervise/pawner" element={<Pawner/>}/>
                            <Route path="personalInfo" element={<PersonalInfo/>}/>
                        </Routes>
                        </div>
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>典当信息管理平台 © 商务部</Footer>
                </Layout>
            </Layout>
        </Layout>
    )
}