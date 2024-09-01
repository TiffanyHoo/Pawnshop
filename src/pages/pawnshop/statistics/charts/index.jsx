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

export default class Charts extends PureComponent {
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
    this.getData(false, 'date', NowDate, NowDate);
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
        <Space>
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
              moment(new Date(), 'YYYY-MM-DD'),
              moment(new Date(), 'YYYY-MM-DD'),
            ]}
          />
          {flag ? (
            <>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;图表类型：
              <Select
                value={style}
                onChange={this.handleStyle}
                style={{ width: '100px' }}
              >
                <Option value="line">折线图</Option>
                <Option value="bar">柱状图</Option>
                {/* <Option value="pie">饼图</Option> */}
              </Select>
            </>
          ) : (
            ''
          )}
        </Space>
        {style === 'line' && flag ? (
          <div className="chartsDiv" style={{ width: '100%', height: '90%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
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
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="num1"
                  name="新建当单"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="num2"
                  name="完结当单"
                  stroke="#82ca9d"
                  activeDot={{ r: 8 }}
                />
                {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
              </LineChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
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
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="outAmount"
                  name="发放金额"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="inAmount"
                  name="收回金额"
                  stroke="#82ca9d"
                  activeDot={{ r: 8 }}
                />
                {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
              </LineChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
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
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sum"
                  name="典当总收入"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
              </LineChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
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
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sum"
                  name="商城销售额"
                  stroke="#82ca9d"
                  activeDot={{ r: 8 }}
                />
                {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : style === 'bar' && flag ? (
          <div className="chartsDiv" style={{ width: '100%', height: '90%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
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
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="num1" name="新建当单" fill="#8884d8" />
                <Bar dataKey="num2" name="完结当单" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
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
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="inAmount" name="发放金额" fill="#8884d8" />
                <Bar dataKey="outAmount" name="收回金额" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
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
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sum" name="典当总收入" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
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
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sum" name="商城销售额" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          ''
        )}
        {!flag ? (
          <div
            className="chartsDiv"
            style={{ width: '100%', height: '90%', marginTop: 10 }}
          >
            <Row gutter={16}>
              <Col span={11}>
                <Card>
                  <Statistic
                    title="新建当单"
                    value={obj1.num1}
                    valueStyle={{ color: 'orange' }}
                  />
                  <Statistic
                    title={
                      type === 'date'
                        ? '较昨日'
                        : type === 'month'
                        ? '较上月'
                        : type === 'year'
                        ? '较上年'
                        : ''
                    }
                    value={obj1.num1 - obj2.num1}
                    valueStyle={
                      obj1.num1 > obj2.num1
                        ? { color: '#cf1322' }
                        : obj1.num1 < obj2.num1
                        ? { color: '#3f8600' }
                        : { color: 'grey' }
                    }
                    prefix={
                      obj1.num1 > obj2.num1 ? (
                        <ArrowUpOutlined />
                      ) : obj1.num1 < obj2.num1 ? (
                        <ArrowUpOutlined />
                      ) : (
                        <LineOutlined />
                      )
                    }
                    suffix="单"
                  />
                </Card>
              </Col>
              <Col span={11}>
                <Card>
                  <Statistic
                    title="完结当单"
                    value={obj1.num2}
                    valueStyle={{ color: 'orange' }}
                  />
                  <Statistic
                    title={
                      type === 'date'
                        ? '较昨日'
                        : type === 'month'
                        ? '较上月'
                        : type === 'year'
                        ? '较上年'
                        : ''
                    }
                    value={obj1.num2 - obj2.num2}
                    valueStyle={
                      obj1.num2 > obj2.num2
                        ? { color: '#cf1322' }
                        : obj1.num2 < obj2.num2
                        ? { color: '#3f8600' }
                        : { color: 'grey' }
                    }
                    prefix={
                      obj1.num2 > obj2.num2 ? (
                        <ArrowUpOutlined />
                      ) : obj1.num2 < obj2.num2 ? (
                        <ArrowUpOutlined />
                      ) : (
                        <LineOutlined />
                      )
                    }
                    suffix="单"
                  />
                </Card>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={11}>
                <Card>
                  <Statistic
                    title="发放金额"
                    value={obj1.outAmount}
                    precision={2}
                    valueStyle={{ color: 'orange' }}
                  />
                  <Statistic
                    title={
                      type === 'date'
                        ? '较昨日'
                        : type === 'month'
                        ? '较上月'
                        : type === 'year'
                        ? '较上年'
                        : ''
                    }
                    value={
                      ((obj1.outAmount - obj2.outAmount) / obj2.outAmount) * 100
                    }
                    precision={2}
                    valueStyle={
                      obj1.outAmount > obj2.outAmount
                        ? { color: '#cf1322' }
                        : obj1.outAmount < obj2.outAmount
                        ? { color: '#3f8600' }
                        : { color: 'grey' }
                    }
                    prefix={
                      obj1.outAmount > obj2.outAmount ? (
                        <ArrowUpOutlined />
                      ) : obj1.outAmount < obj2.outAmount ? (
                        <ArrowUpOutlined />
                      ) : (
                        <LineOutlined />
                      )
                    }
                    suffix="%"
                  />
                </Card>
              </Col>
              <Col span={11}>
                <Card>
                  <Statistic
                    title="收回金额"
                    value={obj1.inAmount}
                    precision={2}
                    valueStyle={{ color: 'orange' }}
                  />
                  <Statistic
                    title={
                      type === 'date'
                        ? '较昨日'
                        : type === 'month'
                        ? '较上月'
                        : type === 'year'
                        ? '较上年'
                        : ''
                    }
                    value={
                      ((obj1.inAmount - obj2.inAmount) / obj2.inAmount) * 100
                    }
                    precision={2}
                    valueStyle={
                      obj1.inAmount > obj2.inAmount
                        ? { color: '#cf1322' }
                        : obj1.inAmount < obj2.inAmount
                        ? { color: '#3f8600' }
                        : { color: 'grey' }
                    }
                    prefix={
                      obj1.inAmount > obj2.inAmount ? (
                        <ArrowUpOutlined />
                      ) : obj1.inAmount < obj2.inAmount ? (
                        <ArrowUpOutlined />
                      ) : (
                        <LineOutlined />
                      )
                    }
                    suffix="%"
                  />
                </Card>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={22}>
                <Card>
                  <Statistic
                    title="典当总收入"
                    value={obj1.sum}
                    precision={2}
                    valueStyle={{ color: 'orange' }}
                    prefix="￥"
                  />
                  <Statistic
                    title={
                      type === 'date'
                        ? '较昨日'
                        : type === 'month'
                        ? '较上月'
                        : type === 'year'
                        ? '较上年'
                        : ''
                    }
                    value={obj1.sum - obj2.sum}
                    precision={2}
                    valueStyle={
                      obj1.sum > obj2.sum
                        ? { color: '#cf1322' }
                        : obj1.sum < obj2.sum
                        ? { color: '#3f8600' }
                        : { color: 'grey' }
                    }
                    suffix="元"
                  />
                  <Statistic
                    title={
                      type === 'date'
                        ? '较昨日'
                        : type === 'month'
                        ? '较上月'
                        : type === 'year'
                        ? '较上年'
                        : ''
                    }
                    value={((obj1.sum - obj2.sum) / obj2.sum) * 100}
                    precision={2}
                    valueStyle={
                      obj1.sum > obj2.sum
                        ? { color: '#cf1322' }
                        : obj1.sum < obj2.sum
                        ? { color: '#3f8600' }
                        : { color: 'grey' }
                    }
                    prefix={
                      obj1.sum > obj2.sum ? (
                        <ArrowUpOutlined />
                      ) : obj1.sum < obj2.sum ? (
                        <ArrowDownOutlined />
                      ) : (
                        <LineOutlined />
                      )
                    }
                    suffix="%"
                  />
                </Card>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={22}>
                <Card>
                  <Statistic
                    title="商城销售额"
                    value={0}
                    precision={2}
                    valueStyle={{ color: 'orange' }}
                  />
                  <Statistic
                    title={
                      type === 'date'
                        ? '较昨日'
                        : type === 'month'
                        ? '较上月'
                        : type === 'year'
                        ? '较上年'
                        : ''
                    }
                    value={0}
                    precision={2}
                    valueStyle={{ color: 'grey' }}
                    prefix={<LineOutlined />}
                    suffix="%"
                  />
                </Card>
              </Col>
            </Row>
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }
}
