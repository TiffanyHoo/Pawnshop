//典当行子系统
import React from 'react'
import axios from 'axios'
import { Route, Routes, useLocation } from 'react-router-dom'
import MyNavLink from '../../components/MyNavLink'
import ManageApply from './pawn/manageApply'
import CreatePawn from './pawn/createPawn'
import RedeemPawn from './pawn/redeemPawn'
import RenewPawn from './pawn/renewPawn'
import SeverPawn from './pawn/severPawn'
import ManagePawn from './pawn/managePawn'
import AssessPawn from './pawn/assessPawn'
import ManageGoods from './sales/manageGoods'
import VerifyOrder from './sales/verifyOrder'
import ManageSales from './sales/manageSales'
import ManageStoreInfo from './store/manageStoreInfo'
import ManageStorehouse from './store/manageStorehouse'
import Company from './interior/company'
import Employees from './interior/employees'
import DayCount from './statistics/dayCount'
import MonthCount from './statistics/monthCount'
import YearCount from './statistics/yearCount'
import Authenticate from './expertService/authenticate'
import Assess from './expertService/assess'
import FeedbackOfPawn from './feedback/feedbackOfPawn'
import FeedbackOfSale from './feedback/feedbackOfSale'

//引入store，用于获取redux中保存状态
import store from '../../redux/store'
//引入actionCreator，专门用于创建action对象
import {createPawnshopstaffAction} from '../../redux/UserInfoAction'

import '../../style/pawnshop.less'
import { Layout, Menu, Button, Result } from 'antd'
import {
    BankOutlined,
    ShopOutlined,
    HomeOutlined,
    PieChartOutlined,
    TeamOutlined,
    ContactsOutlined,
    SoundOutlined
} from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

const state = {
    collapsed: false,
    userid: '',
    userinfo:{},
    messageArr:[
        {id:'01',title:'建当管理'},
        {id:'02',title:'续当管理'},
        {id:'03',title:'赎当管理'},
        {id:'04',title:'绝当管理'},
        {id:'05',title:'典当信息管理'}
    ],
    loginFlag: false,
    InServiceState: false
}

export default function Pawnshop() {

    const params = useLocation()

    if(state.userid!==''){

    }else{
        state.userid = params.state?params.state.id:state.userid
        state.InServiceState = params.state?params.state.InServiceState:state.InServiceState
    }

    const onCollapse = collapsed => {
        state.collapsed = collapsed;
    };

    const getData = async () => {
        if(state.loginFlag){
        }else{
            let userinfo = {}
            await axios.get('/getPSstaff',{
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
        store.dispatch(createPawnshopstaffAction(state.userinfo))
    }

    getData()

    return (
        <Layout>
            <Header className="header">
                <div className="logo" />
                <h2 style={{color:'white',float:'left'}}>典当管理信息平台</h2>
                <Button className="exitBtn"
                style={{float:'right',color:'#888', top:16, right:10,width:72,height:32, cursor:'pointer'}}
                onClick={()=>{store.dispatch(createPawnshopstaffAction({})); window.history.back(-1)}}>
                    退出
                </Button>
            </Header>
            {console.log(state.InServiceState)}
            {state.InServiceState==='0'?
            <Layout>
                <Result
                    status="403"
                    title="403"
                    subTitle="非常抱歉，你没有此页面的访问权限。"
                    extra={
                    <Button type="primary" onClick={()=>{store.dispatch(createPawnshopstaffAction({})); window.history.back(-1)}}>
                        Back Home
                    </Button>}
                />
            </Layout>
            :
            <Layout>
                <Sider collapsible collapsed={state.collapsed} onCollapse={onCollapse}>
                    <Menu theme="dark" defaultSelectedKeys={['0']} mode="inline">
                        <SubMenu key="sub1" icon={<BankOutlined />} title="典当管理">
                            <Menu.Item key="0">
                                <MyNavLink replace to={`pawn/manageApply`}>申请单处理</MyNavLink>
                            </Menu.Item>
                            <Menu.Item key="1">
                                <MyNavLink replace to={`pawn/createpawn`}>建当管理</MyNavLink>
                            </Menu.Item>
                            <Menu.Item key="2">
                                <MyNavLink replace to={`pawn/renewpawn`}>续当管理</MyNavLink>
                            </Menu.Item>
                            <Menu.Item key="3">
                                <MyNavLink replace to={`pawn/redeempawn`}>赎当管理</MyNavLink>
                            </Menu.Item>
                            <Menu.Item key="4">
                                <MyNavLink replace to={`pawn/severpawn`}>绝当管理</MyNavLink>
                            </Menu.Item>
                            <Menu.Item key="5">
                                <MyNavLink replace to={`pawn/managepawn`}>典当信息管理</MyNavLink>
                            </Menu.Item>
                            <Menu.Item key="6">
                                <MyNavLink replace to={`pawn/assesspawn`}>典当折价管理</MyNavLink>
                            </Menu.Item>
                        </SubMenu>
                        <SubMenu key="sub2" icon={<ShopOutlined />} title="销售管理">
                            <Menu.Item key="7">
                                <MyNavLink replace to={`sales/managegoods`}>绝当品管理</MyNavLink>
                            </Menu.Item>
                            <Menu.Item key="8">
                                <MyNavLink replace to={`sales/verifyOrder`}>订单交易确认</MyNavLink>
                            </Menu.Item>
                            <Menu.Item key="9">
                                <MyNavLink replace to={`sales/manageSales`}>销售信息管理</MyNavLink>
                            </Menu.Item>
                        </SubMenu>
                        <SubMenu key="sub3" icon={<HomeOutlined />} title="仓库管理">
                            <Menu.Item key="10">
                                <MyNavLink replace to={`store/managestoreinfo`}>仓库存放管理</MyNavLink>
                            </Menu.Item>
                            <Menu.Item key="11">
                                <MyNavLink replace to={`store/managestorehouse`}>仓库信息管理</MyNavLink>
                            </Menu.Item>
                        </SubMenu>
                        <SubMenu key="sub4" icon={<TeamOutlined />} title="内部管理">
                            <Menu.Item key="12">
                                <MyNavLink replace to={`interior/company`}>当行信息管理</MyNavLink>
                            </Menu.Item>
                            <Menu.Item key="13">
                                <MyNavLink replace to={`interior/employees`}>员工信息管理</MyNavLink>                                
                            </Menu.Item>
                        </SubMenu>
                        {/* <SubMenu key="sub5" icon={<PieChartOutlined />} title="经营统计">
                            <Menu.Item key="14">
                                <MyNavLink replace to={`statistics/daycount`}>按日结算</MyNavLink>
                            </Menu.Item>
                            <Menu.Item key="15">
                                <MyNavLink replace to={`statistics/monthcount`}>月报统计</MyNavLink>
                            </Menu.Item>
                            <Menu.Item key="16">
                                <MyNavLink replace to={`statistics/yearcount`}>年报统计</MyNavLink>
                            </Menu.Item>
                        </SubMenu> */}
                        <SubMenu key="sub6" icon={<ContactsOutlined />} title="专家服务">
                            <Menu.Item key="17">
                                <MyNavLink replace to={`expertservice/authenticate`}>鉴定服务</MyNavLink>
                            </Menu.Item>
                            <Menu.Item key="18">
                                <MyNavLink replace to={`expertservice/assess`}>估价服务</MyNavLink>
                            </Menu.Item>
                        </SubMenu>
                        <SubMenu key="sub7" icon={<SoundOutlined />} title="反馈处理">
                            <Menu.Item key="19">
                                <MyNavLink replace to={`feedback/feedbackofpawn`}>典当反馈处理</MyNavLink>
                            </Menu.Item>
                            <Menu.Item key="20">
                                <MyNavLink replace to={`feedback/feedbackofsale`}>销售反馈处理</MyNavLink>
                            </Menu.Item>
                        </SubMenu>
                    </Menu>
                </Sider>
                <Layout className="site-layout">
                    <Content style={{ margin: '10px 16px' }}>
                        <div className="site-layout-background" style={{ padding: 10, height: '80vh' }}>
                            <Routes>
                                <Route path="pawn/manageApply" element={<ManageApply/>}/>   
                                <Route path="pawn/createpawn" element={<CreatePawn/>}/>   
                                <Route path="pawn/renewpawn" element={<RenewPawn/>}/>    
                                <Route path="pawn/redeempawn" element={<RedeemPawn/>}/>   
                                <Route path="pawn/severpawn" element={<SeverPawn/>}/>    
                                <Route path="pawn/managepawn" element={<ManagePawn/>}/>
                                <Route path="pawn/assesspawn" element={<AssessPawn/>}/>
                                <Route path="sales/managegoods" element={<ManageGoods/>}/>
                                <Route path="sales/verifyOrder" element={<VerifyOrder/>}/>
                                <Route path="sales/manageSales" element={<ManageSales/>}/>
                                <Route path="store/managestoreinfo" element={<ManageStoreInfo/>}/>
                                <Route path="store/managestorehouse" element={<ManageStorehouse/>}/>
                                <Route path="interior/company" element={<Company/>}/>
                                <Route path="interior/employees" element={<Employees/>}/>
                                <Route path="statistics/daycount" element={<DayCount/>}/>
                                <Route path="statistics/monthcount" element={<MonthCount/>}/>
                                <Route path="statistics/yearcount" element={<YearCount/>}/>
                                <Route path="expertservice/authenticate" element={<Authenticate/>}/>
                                <Route path="expertservice/assess" element={<Assess/>}/>
                                <Route path="feedback/feedbackofpawn" element={<FeedbackOfPawn/>}/>
                                <Route path="feedback/feedbackofsale" element={<FeedbackOfSale/>}/>
                            </Routes>
                        </div>
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>典当管理信息平台 © xx典当行</Footer>
                </Layout>
            </Layout>
            }
        </Layout>
    )
}