//专家子系统
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import MyNavLink from '../../components/MyNavLink';
import Assessment from './expertService/assessment';
import HandleOrders from './expertService/handleOrders';
import Expenses from './infoManage/expenses';
import Orders from './infoManage/orders';
import PersonalInfo from './infoManage/personalInfo';
import axios from 'axios';

//引入store，用于获取redux中保存状态
import store from '../../redux/store';
//引入actionCreator，专门用于创建action对象
import { createExpertAction } from '../../redux/UserInfoAction';

import '../../style/pawnshop.less';
import { Layout, Menu, Breadcrumb, Button } from 'antd';
import { ScheduleOutlined, FormOutlined } from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

const state = {
  collapsed: false,
  userid: '',
  userinfo: {},
  loginFlag: false,
};

export default function Experts() {
  const params = useLocation();

  if (state.userid !== '') {
  } else {
    state.userid = params.state ? params.state.id : state.userid;
  }

  const onCollapse = (collapsed) => {
    console.log(collapsed);
    this.setState({ collapsed });
  };

  const getData = async () => {
    if (state.loginFlag) {
    } else {
      let userinfo = {};
      await axios
        .get('/getExperts', {
          params: {
            id: state.userid,
          },
        })
        .then((response) => {
          if (response.data.length === 0) {
            console.log('无数据');
          } else {
            userinfo = response.data[0];
          }
        })
        .catch((error) => {
          console.log(error);
        });
      state.userinfo = userinfo;
      state.loginFlag = true;
    }
    store.dispatch(createExpertAction(state.userinfo));
    // console.log(state.userinfo)
  };

  getData();

  return (
    <Layout>
      <Header className="header">
        <div className="logo" />
        <h2 style={{ color: 'white', float: 'left' }}>
          典当管理信息平台————专家端
        </h2>
        <Button
          className="exitBtn"
          style={{
            float: 'right',
            color: '#888',
            top: 16,
            right: 10,
            width: 72,
            height: 32,
            cursor: 'pointer',
          }}
          onClick={() => {
            store.dispatch(createExpertAction({}));
            window.history.back(-1);
          }}
        >
          退出
        </Button>
        <p style={{ float: 'right', color: 'white', marginRight: 50 }}>
          专家： {JSON.parse(sessionStorage.getItem('userinfo')).ExpertName}
        </p>
      </Header>
      <Layout>
        <Sider collapsible collapsed={state.collapsed} onCollapse={onCollapse}>
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
            <SubMenu key="sub1" icon={<ScheduleOutlined />} title="鉴定估价">
              <Menu.Item key="1">
                <MyNavLink replace to={`expertservice/handleorders`}>
                  在线接拒单
                </MyNavLink>
              </Menu.Item>
              <Menu.Item key="2">
                <MyNavLink replace to={`expertservice/assessment`}>
                  评估信息录入
                </MyNavLink>
              </Menu.Item>
            </SubMenu>
            <SubMenu key="sub2" icon={<FormOutlined />} title="信息管理">
              <Menu.Item key="3">
                <MyNavLink replace to={`infomanage/personalinfo`}>
                  个人信息管理
                </MyNavLink>
              </Menu.Item>
              <Menu.Item key="4">
                <MyNavLink replace to={`infomanage/orders`}>
                  服务单管理
                </MyNavLink>
              </Menu.Item>
              <Menu.Item key="5">
                <MyNavLink replace to={`infomanage/expenses`}>
                  服务费用设置
                </MyNavLink>
              </Menu.Item>
            </SubMenu>
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Content style={{ margin: '10px 16px' }}>
            <div
              className="site-layout-background"
              style={{ padding: 10, height: '83vh' }}
            >
              <Routes>
                <Route
                  path="expertservice/handleorders"
                  element={<HandleOrders />}
                />
                <Route
                  path="expertservice/assessment"
                  element={<Assessment />}
                />
                <Route
                  path="infomanage/personalinfo"
                  element={<PersonalInfo />}
                />
                <Route path="infomanage/orders" element={<Orders />} />
                <Route path="infomanage/expenses" element={<Expenses />} />
              </Routes>
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            典当管理信息平台 © xx典当行
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
}
