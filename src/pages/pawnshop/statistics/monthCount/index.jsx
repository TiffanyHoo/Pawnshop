import React, { Component } from 'react';
import {
  Breadcrumb,
  Calendar,
  Badge,
  Input,
  Button,
  Popconfirm,
  Form,
  Tabs,
  Select,
  DatePicker,
  Space,
  Tooltip,
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

export default class MonthCount extends Component {
  constructor(props) {
    super(props);
  }
  getListData = (value) => {
    let listData;
    switch (value.date()) {
      case 8:
        listData = [
          { type: 'warning', content: 'This is warning event.' },
          { type: 'success', content: 'This is usual event.' },
        ];
        break;
      case 10:
        listData = [
          { type: 'warning', content: 'This is warning event.' },
          { type: 'success', content: 'This is usual event.' },
          { type: 'error', content: 'This is error event.' },
        ];
        break;
      case 15:
        listData = [
          { type: 'warning', content: 'This is warning event' },
          { type: 'success', content: 'This is very long usual event。。....' },
          { type: 'error', content: 'This is error event 1.' },
          { type: 'error', content: 'This is error event 2.' },
          { type: 'error', content: 'This is error event 3.' },
          { type: 'error', content: 'This is error event 4.' },
        ];
        break;
      default:
    }
    return listData || [];
  };

  dateCellRender = (value) => {
    const listData = this.getListData(value);
    return (
      <ul className="events">
        {listData.map((item) => (
          <li key={item.content}>
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  getMonthData = (value) => {
    if (value.month() === 8) {
      return 1394;
    }
  };

  monthCellRender = (value) => {
    const num = this.getMonthData(value);
    return num ? (
      <div className="notes-month">
        <section>{num}</section>
        <span>Backlog number</span>
      </div>
    ) : null;
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
