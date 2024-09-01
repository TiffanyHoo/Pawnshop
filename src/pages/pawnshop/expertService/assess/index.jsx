import React, { Component } from 'react';
import {
  Breadcrumb,
  Card,
  Button,
  Space,
  Pagination,
  Modal,
  Table,
  message,
  notification,
} from 'antd';
import axios from 'axios';
import Qs from 'qs';
import store from '../../../../redux/store';
import '../../../../style/FlipCard.less';
import '../../../../style/common.less';
import Search from 'antd/lib/transfer/search';
import { SmileOutlined } from '@ant-design/icons';

const gridStyle = {
  width: '25%',
  height: '250px',
  //textAlign: 'center',
};

export default class Assess extends Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: '专家姓名',
        dataIndex: 'ExpertName',
        fixed: 'left',
        width: '90px',
        render: (text) => <a>{text}</a>,
      },
      {
        title: '专业技术资格证书编号',
        width: '190px',
        dataIndex: 'TechQCcode',
      },
      {
        title: '研究领域',
        dataIndex: 'ResearchField',
      },
      {
        title: '费用',
        dataIndex: this.flag === 0 ? 'AuthenticateFare' : 'AssessFare',
        width: '80px',
      },
      {
        title: '联系电话',
        dataIndex: 'Phone',
      },
      {
        title: '邮箱地址',
        dataIndex: 'Email',
      },
      {
        title: '邮箱地址',
        dataIndex: 'Email',
      },
      {
        title: '微信号',
        dataIndex: 'Wechat',
      },
    ];
    this.state = {
      visible: false,
      items: [],
      flag: 0,
      total: 0,
      pageno: 1,
      pagesize: 8,
      service: 0,
      Authenticate: [],
      Assess: [],
      offerservice: [],
      obj: {},
      selectedService: -1,
      serviceInfo: {},
    };
  }

  componentDidMount() {
    this.getData(0, 1, 8);
    this.getService();
  }

  //获取物品信息
  getData = () => {
    const { flag, pageno, pagesize } = this.state;
    var that = this;
    axios
      .get('/getUserItems', {
        params: {
          PSID: store.getState().PSID,
          pageno,
          pagesize,
          type: 'AssessItem' + flag,
        },
      })
      .then((response) => {
        const total = response.data[0].total;
        const items = response.data.map((item, index) => {
          return { ...item, showImg: item.photopath.split(';')[0] };
        });
        that.setState({ items, total });
      });
  };

  //获取服务信息
  getService = () => {
    var that = this;
    axios
      .get('/getExpSer', {
        params: {
          type: 'offerExpSer',
        },
      })
      .then((response) => {
        const dataSource = response.data.map((item, index) => {
          return { ...item, key: index };
        });
        const Authenticate = dataSource.filter(
          (item) => item.AuthenticateFare != undefined
        );
        const Assess = dataSource.filter((item) => item.AssessFare != null);
        that.setState({ Authenticate, Assess });
      });
  };

  //切换物品类型
  handleClick = (e) => {
    this.setState(
      {
        flag: e,
        pageno: 1,
      },
      () => {
        this.getData(); //setState()的callBack()参数
      }
    );
  };

  //切换页码
  handlePage = (e) => {
    this.setState(
      {
        pageno: e,
      },
      () => {
        this.getData(); //setState()的callBack()参数
      }
    );
  };

  //打开服务
  handleService = (service, obj) => {
    const { Authenticate, Assess } = this.state;
    const offerservice =
      service === 0
        ? Authenticate.filter((item) => item.CID === obj.CID)
        : Assess.filter((item) => item.CID === obj.CID);
    this.setState({
      service,
      obj,
      offerservice,
      visible: true,
      selectedService: -1,
    });
    console.log(offerservice);
  };

  //确认服务
  handleOk = async () => {
    const { selectedService, service, serviceInfo, obj, flag } = this.state;
    const { ExpertID, ExpertName, AuthenticateFare, AssessFare } = serviceInfo;
    if (selectedService === -1) {
      message.warning('未选择服务！');
      return;
    }

    const PIID = flag === 0 ? obj.UIID : obj.PIID;

    const xflag = await this.handleCheck(service, PIID, ExpertID);
    if (!xflag) {
      message.error('申请失败！ 请勿重复提出申请，可于反馈结果中查看进度~');
    } else {
      let data = {
        step: 2,
        service,
        ExpertID,
        PIID,
        PSID: store.getState().PSID,
        Authenticate: service === 0 ? 1 : 0,
        Assess: service === 0 ? 1 : 0,
        AuthenticateFare: service === 0 ? AuthenticateFare : 0,
        AssessFare: service === 0 ? AssessFare : 0,
        state: 0,
        payment: 0,
      };

      await axios({
        method: 'post',
        url: 'http://localhost:3000/modExpSer',
        data: Qs.stringify(data),
      });

      notification.open({
        message: '消息',
        description: (
          <div style={{ whiteSpace: 'pre-wrap' }}>
            已成功申请{ExpertName}专家{service === 0 ? '鉴定' : '估价'}
            服务,可于反馈结果中查看~
          </div>
        ),
        icon: <SmileOutlined style={{ color: 'orange' }} />,
        duration: 2,
      });
      this.setState({ visible: false });
    }
  };

  //检查有无重复提出申请
  handleCheck = async (service, PIID, ExpertID) => {
    let flag = true;
    await axios
      .get('/modExpSer', {
        params: {
          step: 1,
          service,
          ExpertID,
          PIID,
          PSID: store.getState().PSID,
        },
      })
      .then((response) => {
        if (response.data.length !== 0) {
          flag = false;
        }
      });
    return flag;
  };

  render() {
    const {
      items,
      flag,
      total,
      pageno,
      pagesize,
      service,
      visible,
      Authenticate,
      Assess,
      offerservice,
    } = this.state;
    return (
      <div className="mainDiv">
        <Breadcrumb style={{ margin: '10px 0' }}>
          <Breadcrumb.Item>专家服务</Breadcrumb.Item>
          <Breadcrumb.Item>鉴定估价</Breadcrumb.Item>
        </Breadcrumb>
        <Card
          title="物品"
          extra={
            <Space>
              <Button
                type={flag === 0 ? 'primary' : ''}
                onClick={() => this.handleClick(0)}
              >
                未报价物品
              </Button>
              <Button
                type={flag === 1 ? 'primary' : ''}
                onClick={() => this.handleClick(1)}
              >
                已报价物品
              </Button>
              <Search></Search>
            </Space>
          }
        >
          {items.map((obj, index) => {
            return (
              <Card.Grid className="box" style={gridStyle} key={index}>
                <div
                  className="up"
                  style={{
                    backgroundImage: `url(${
                      obj.showImg
                        ? obj.showImg
                        : 'https://ww1.sinaimg.cn/large/007rAy9hgy1g24by9t530j30i20i2glm.jpg'
                    })`,
                    backgroundSize: '100% 100%',
                  }}
                >
                  {obj.title}
                </div>
                <div className="mask">
                  <div className="infoDiv">
                    <div className="info">物品名称：{obj.title}</div>
                    <div className="info">物品编码：{obj.UIID}</div>
                    <div className="info">
                      规格详情：{obj.Specification ? obj.Specification : '无'}
                    </div>
                    <div className="info">
                      所含附件：{obj.Documents ? obj.Documents : '无'}
                    </div>
                    <div className="info">
                      附加描述：{obj.Discript ? obj.Discript : '无'}
                    </div>
                  </div>
                  <Button onClick={() => this.handleService(0, obj)}>
                    鉴定
                  </Button>
                  <Button onClick={() => this.handleService(1, obj)}>
                    估价
                  </Button>
                </div>
              </Card.Grid>
            );
          })}
          {/* <Card.Grid hoverable={false} style={gridStyle}>
            Content
          </Card.Grid> */}
        </Card>
        <Pagination
          className="page"
          size="small"
          current={pageno}
          pageSize={pagesize}
          total={total}
          showSizeChanger={false}
          onChange={this.handlePage}
        />
        <Modal
          title={service === 0 ? '鉴定服务' : '估价服务'}
          width={1200}
          visible={visible}
          onOk={this.handleOk}
          onCancel={() => this.setState({ visible: false })}
        >
          <Table
            rowSelection={{
              type: 'radio',
              onChange: (selectedService, selectedRows) => {
                this.setState({
                  selectedService: selectedService[0],
                  serviceInfo: selectedRows[0],
                });
              },
              selectedRowKeys: [this.state.selectedService],
            }}
            columns={this.columns}
            dataSource={offerservice}
            pagination={false}
            scroll={{ x: 1400, y: 300 }}
          />
        </Modal>
      </div>
    );
  }
}
