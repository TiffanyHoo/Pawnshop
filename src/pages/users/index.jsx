import React, { Component } from 'react'
import { Route, Routes } from 'react-router-dom'
import MyNavLink from '../../components/MyNavLink'
import CreatePawn from './pawn/createPawn'
import RenewPawn from './pawn/renewPawn'
import RedeemPawn from './pawn/redeemPawn'
import SeverPawn from './pawn/severPawn'
import Onlineshop from './onlineshop'
import PersonalInfo from './infoManage/personalInfo'
import PawnshopInfo from './infoManage/pawnshopInfo'
import Pawnticket from './infoManage/pawnticket'
import OrderInfo from './infoManage/orderInfo'
import FbToCommerce from './feedback/fbToCommerce'
import FbToPawnshop from './feedback/fbToPawnshop'

//引入store，用于获取redux中保存状态
import store from '../../redux/store'
//引入actionCreator，专门用于创建action对象
import {createUserAction} from '../../redux/UserInfoAction'

import '../../style/pawnshop.less'
import { Layout, Menu, Button } from 'antd'
import {
    BankOutlined,
    FormOutlined,
    ShopOutlined,
    SoundOutlined
} from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

export default class Users extends Component {
    state = {
        collapsed: false
    };
    
    onCollapse = collapsed => {
        console.log(collapsed);
        this.setState({ collapsed });
    };

    render() {
        return (
            <Layout>
            <Header className="header">
                <div className="logo" />
                <h2 style={{color:'white',float:'left'}}>管理信息平台————用户端</h2>
                <Button className="exitBtn"
                style={{float:'right',color:'#888', top:16, right:10,width:72,height:32, cursor:'pointer'}}
                onClick={()=>{store.dispatch(createUserAction({})); window.history.back(-1)}}>
                    退出
                </Button>
            </Header>
            <Layout>
                <Sider collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse}>
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                    <SubMenu key="sub1" icon={<BankOutlined />} title="典当业务">
                        <Menu.Item key="1">
                            <MyNavLink replace to={`pawn/createpawn`}>建当估价</MyNavLink>
                        </Menu.Item>
                        <Menu.Item key="2">
                            <MyNavLink replace to={`pawn/renewpawn`}>续当申请</MyNavLink>
                        </Menu.Item>
                        <Menu.Item key="3">
                            <MyNavLink replace to={`pawn/redeempawn`}>赎当申请</MyNavLink>
                        </Menu.Item>
                        <Menu.Item key="4">
                            <MyNavLink replace to={`pawn/severpawn`}>绝当申请</MyNavLink>
                        </Menu.Item>
                    </SubMenu>
                    <SubMenu key="sub2" icon={<ShopOutlined />} title="在线商城">
                        <Menu.Item key="5">
                            <MyNavLink replace to={`onlineshop`}>绝当品信息</MyNavLink>
                        </Menu.Item>
                    </SubMenu>
                    <SubMenu key="sub3" icon={<FormOutlined />} title="信息管理">
                        <Menu.Item key="6">
                            <MyNavLink replace to={`infomanage/personalinfo`}>个人信息管理</MyNavLink>
                        </Menu.Item>
                        <Menu.Item key="7">
                            <MyNavLink replace to={`infomanage/pawnshopinfo`}>当行信息查询</MyNavLink>
                        </Menu.Item>
                        <Menu.Item key="8">
                            <MyNavLink replace to={`infomanage/pawnticket`}>当单信息查看</MyNavLink>
                        </Menu.Item>
                        <Menu.Item key="9">
                            <MyNavLink replace to={`infomanage/orderinfo`}>订单信息查看</MyNavLink>
                        </Menu.Item>
                    </SubMenu>
                    <SubMenu key="sub4" icon={<SoundOutlined />} title="反馈投诉">
                        <Menu.Item key="12">
                            <MyNavLink replace to={`feedback/fbtpawnshop`}>反馈典当行</MyNavLink>
                        </Menu.Item>
                        <Menu.Item key="13">
                            <MyNavLink replace to={`feedback/fbtocommerce`}>反馈商务部</MyNavLink>
                        </Menu.Item>
                    </SubMenu>
                </Menu>
                </Sider>
                <Layout className="site-layout">
                    <Content style={{ margin: '10px 16px' }}>
                        <div className="site-layout-background" style={{ padding: 10, height: '80vh' }}>
                        <Routes>
                            <Route path="pawn/createpawn" element={<CreatePawn/>}/>   
                            <Route path="pawn/renewpawn" element={<RenewPawn/>}/>    
                            <Route path="pawn/redeempawn" element={<RedeemPawn/>}/>   
                            <Route path="pawn/severpawn" element={<SeverPawn/>}/>    
                            <Route path="onlineshop" element={<Onlineshop/>}/>
                            <Route path="infomanage/personalinfo" element={<PersonalInfo/>}/>
                            <Route path="infomanage/pawnshopinfo" element={<PawnshopInfo/>}/>
                            <Route path="infomanage/pawnticket" element={<Pawnticket/>}/>
                            <Route path="infomanage/orderinfo" element={<OrderInfo/>}/>
                            <Route path="feedback/fbtpawnshop" element={<FbToPawnshop/>}/>
                            <Route path="feedback/fbtocommerce" element={<FbToCommerce/>}/>

                        </Routes>
                        </div>
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>典当管理信息平台 © xx典当行</Footer>
                </Layout>
            </Layout>
            </Layout>
        )
    }
}