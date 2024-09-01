import React, { PureComponent } from 'react';
import axios from 'axios';
import Qs from 'qs';
import store from '../../../../redux/store';
import moment from 'moment';

import {
  Breadcrumb,
  DatePicker,
  Select,
  Space,
  Statistic,
  Card,
  Row,
  Col,
} from 'antd';
import {
  ComposedChart,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  LineOutlined,
} from '@ant-design/icons';
import '../../../../style/charts.less';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default class Charts2 extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      type: 'date',
      dataSource: [],
      style: 'line',
      StartDate: '',
      EndDate: '',
      NowDate: '',
      flag: false,
      obj1: {},
      obj2: {},
    };
  }

  componentDidMount() {
    const NowDate = moment(new Date()).format('YYYY-MM-DD');
    this.setState({
      NowDate,
    });
    this.getData(true, 'date', '2022-05-01', '2022-05-14');
  }

  //获取信息
  getData = async (flag, type, StartDate, EndDate) => {
    var that = this;
    await axios
      .get('/getBusinessStatus', {
        params: {
          type,
          PSID: store.getState().PSID,
          StartDate,
          EndDate,
        },
      })
      .then((response) => {
        console.log(response.data);
        if (flag) {
          const dataSource = response.data.map((item, index) => {
            return {
              ...item,
              key: type + index,
              sum: item.Total * 1.0 + item.OverdueFare * 1.0,
            };
          });
          that.setState({ dataSource });
        } else {
          const dataSource = response.data.map((item, index) => {
            return {
              xdate: item.xdate,
              key: type + index,
              num1: item.num1 ? item.num1 * 1.0 : 0,
              num2: item.num2 ? item.num2 * 1.0 : 0,
              inAmount: item.inAmount ? item.inAmount * 1.0 : 0,
              outAmount: item.outAmount ? item.outAmount * 1.0 : 0,
              sum: item.Total * 1.0 + item.OverdueFare * 1.0,
            };
          });
          let obj1 = dataSource.find(function (obj) {
            return obj.xdate === EndDate;
          });
          obj1 = obj1
            ? obj1
            : {
                xdate: EndDate,
                num1: 0,
                num2: 0,
                inAmount: 0,
                outAmount: 0,
                sum: 0,
              };
          let obj2 = dataSource.find(function (obj) {
            return obj.xdate === StartDate;
          });
          obj2 = obj2
            ? obj2
            : {
                xdate: StartDate,
                num1: 0,
                num2: 0,
                inAmount: 0,
                outAmount: 0,
                sum: 0,
              };
          console.log(obj1);
          console.log(obj2);
          that.setState({ obj1, obj2 });
        }
      });
  };

  handleDate = (value, dateString) => {
    let { type, flag } = this.state;
    let StartDate = dateString[0];
    let EndDate = dateString[1];
    if (dateString[0] === dateString[1]) {
      flag = false;
      if (type === 'date') {
        // type = 'getOneDayCount'
        StartDate = moment(dateString[0])
          .subtract(1, 'days')
          .format('YYYY-MM-DD');
      } else if (type === 'month') {
        // type = 'getOneMonthCount'
        StartDate = moment(dateString[0])
          .subtract(1, 'month')
          .format('YYYY-MM');
      } else {
        // type = 'getOneYearCount'
        StartDate = moment(dateString[0]).subtract(1, 'year').format('YYYY');
      }
    } else {
      flag = true;
    }
    console.log(type, StartDate, EndDate);
    this.getData(flag, type, StartDate, EndDate);
    this.setState({ flag });
  };

  handletype = (e) => {
    this.setState({ type: e });
  };

  handleStyle = (e) => {
    this.setState({ style: e });
  };

  render() {
    const { flag, type, dataSource, style, obj1, obj2 } = this.state;
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <Breadcrumb style={{ margin: '10px 0' }}>
          <Breadcrumb.Item>经营统计</Breadcrumb.Item>
          <Breadcrumb.Item>图表统计</Breadcrumb.Item>
        </Breadcrumb>
        <Space style={{ marginBottom: '10px' }}>
          按
          <Select value={type} onChange={this.handletype}>
            <Option value="date">日</Option>
            <Option value="month">月</Option>
            <Option value="year">年</Option>
          </Select>
          统计&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日期区间：
          <RangePicker
            picker={type}
            onChange={this.handleDate}
            defaultValue={[
              moment(new Date('2022-05-01'), 'YYYY-MM-DD'),
              moment(new Date(), 'YYYY-MM-DD'),
            ]}
          />
        </Space>
        <ResponsiveContainer width="100%" height="88%">
          <ComposedChart
            width={500}
            height={300}
            data={dataSource}
            margin={{
              top: 10,
              right: 20,
              left: 5,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="xdate" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="outAmount"
              name="发放金额"
              fill="#8884d8"
            />
            <Bar
              yAxisId="left"
              dataKey="inAmount"
              name="收回金额"
              fill="#82ca9d"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="sum"
              name="典当总收入"
              stroke="#ff7300"
              activeDot={{ r: 8 }}
            />
            {/* <Line type="monotone" dataKey="num1" name="新建当单" stroke="#8884d8" activeDot={{ r: 8 }} /> */}
            {/* <Line type="monotone" dataKey="num2" name="完结当单" stroke="#82ca9d" activeDot={{ r: 8 }} /> */}
            {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }
}
