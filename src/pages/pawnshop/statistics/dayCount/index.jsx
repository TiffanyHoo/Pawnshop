import React, { Component } from 'react';
import {
  Breadcrumb,
  Calendar,
  Badge,
  Input,
  Button,
  Form,
  Tabs,
  notification,
  Modal,
  Tag,
  Cascader,
  Upload,
  message,
} from 'antd';
import axios from 'axios';
import Qs from 'qs';
import store from '../../../../redux/store';
import '../../../../style/common.less';
//import 'antd/dist/antd.css';
import {
  PlusOutlined,
  SmileOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import moment from 'moment';

export default class DayCount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource1: [],
      dataSource2: [],
    };
  }

  componentDidMount() {
    this.getData();
  }

  //获取信息
  getData = async () => {
    var that = this;
    await axios
      .get('/getBusinessStatus', {
        params: {
          type: 'getDayCount',
          PSID: store.getState().PSID,
        },
      })
      .then((response) => {
        console.log(response.data);
        const dataSource1 = response.data.map((item, index) => {
          return { ...item, key: 'day' + index };
        });
        that.setState({ dataSource1 });
      });

    await axios
      .get('/getBusinessStatus', {
        params: {
          type: 'getMonthCount',
          PSID: store.getState().PSID,
        },
      })
      .then((response) => {
        console.log(response.data);
        const dataSource2 = response.data.map((item, index) => {
          return { ...item, key: 'month' + index };
        });
        that.setState({ dataSource2 });
      });
  };

  getListData = (value) => {
    const date = moment(value).format('YYYY-MM-DD');
    const { dataSource1 } = this.state;
    const listData = dataSource1.find((item) => item.xdate == date);
    console.log(listData);

    return listData || {};
  };

  dateCellRender = (value) => {
    const listData = this.getListData(value);
    const income = listData ? listData.Total * 1 + listData.OverdueFare * 1 : 0;
    return (
      <ul className="events">
        {listData.num1 && listData.num1 != 0 ? (
          <li>新建单数：{listData.num1}</li>
        ) : (
          ''
        )}
        {listData.num2 && listData.num2 != 0 ? (
          <li>完结单数：{listData.num2}</li>
        ) : (
          ''
        )}
        {listData.outAmount && listData.outAmount != 0 ? (
          <li>发放￥{listData.outAmount}</li>
        ) : (
          ''
        )}
        {listData.inAmount && listData.inAmount != 0 ? (
          <li>收回￥{listData.inAmount}</li>
        ) : (
          ''
        )}
        {income && income != 0 ? <li>收入￥{income}</li> : ''}
      </ul>
    );
  };

  getMonthData = (value) => {
    const date = moment(value).format('YYYY-MM');
    const { dataSource2 } = this.state;
    const listData = dataSource2.find((item) => item.xdate == date);
    console.log(listData);

    return listData || {};
  };

  monthCellRender = (value) => {
    const listData = this.getMonthData(value);
    console.log(listData);
    const income = listData ? listData.Total * 1 + listData.OverdueFare * 1 : 0;
    return (
      <ul className="events">
        {listData.num1 && listData.num1 != 0 ? (
          <li>新建单数：{listData.num1}</li>
        ) : (
          ''
        )}
        {listData.num2 && listData.num2 != 0 ? (
          <li>完结单数：{listData.num2}</li>
        ) : (
          ''
        )}
        {listData.outAmount && listData.outAmount != 0 ? (
          <li>发放￥{listData.outAmount}</li>
        ) : (
          ''
        )}
        {listData.inAmount && listData.inAmount != 0 ? (
          <li>收回￥{listData.inAmount}</li>
        ) : (
          ''
        )}
        {income && income != 0 ? <li>收入￥{income}</li> : ''}
      </ul>
    );
  };

  render() {
    return (
      <div>
        {/* <Breadcrumb style={{ margin: '10px' }}>
          <Breadcrumb.Item>经营统计</Breadcrumb.Item>
          <Breadcrumb.Item>按日结算</Breadcrumb.Item>
        </Breadcrumb> */}
        <div className="site-layout-background">
          <Calendar
            dateCellRender={this.dateCellRender}
            monthCellRender={this.monthCellRender}
          />
        </div>
      </div>
    );
  }
}
