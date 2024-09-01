import React, {
  Component,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import {
  Breadcrumb,
  Table,
  Input,
  InputNumber,
  Button,
  Popconfirm,
  Form,
  Drawer,
  Col,
  Row,
  Select,
  DatePicker,
  Space,
  Tooltip,
  notification,
  Modal,
  Tag,
  Image,
} from 'antd';
import axios from 'axios';
import Qs from 'qs';
import store from '../../../../redux/store';
import '../../../../style/common.less';
//import 'antd/dist/antd.css';
import { PlusOutlined, SmileOutlined, DownOutlined } from '@ant-design/icons';
import moment from 'moment';

const { RangePicker } = DatePicker;

const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

export default class RenewPawn extends Component {
  constructor(props) {
    super(props);

    this.columns = [
      {
        title: '操作',
        dataIndex: 'operation',
        fixed: 'left',
        width: '60px',
        render: (_, record) =>
          this.state.dataSource.length >= 1 ? (
            <div>
              <Popconfirm
                title="确认续当吗？"
                onConfirm={() => this.showModal(record)}
              >
                <a>续当</a>
              </Popconfirm>
            </div>
          ) : null,
      },
      {
        title: '当票编号',
        dataIndex: 'PTID',
        key: 'PTID',
        width: '90px',
      },
      {
        title: '当户姓名',
        dataIndex: 'UserName',
        key: 'UserName',
        width: '90px',
      },
      {
        title: '当户证件号',
        dataIndex: 'UserID',
        key: 'UserID',
        width: '130px',
      },
      {
        title: '开票日期',
        dataIndex: 'StartDate',
        key: 'StartDate',
        width: '100px',
      },
      {
        title: '到期日期',
        dataIndex: 'EndDate',
        key: 'EndDate',
        width: '100px',
      },
      {
        title: '当物数量',
        dataIndex: 'Quantity',
        key: 'Quantity',
        sorter: (a, b) => a.Quantity * 1 - b.Quantity * 1,
        width: '90px',
      },
      {
        title: '总当价',
        dataIndex: 'TotalPrice',
        key: 'TotalPrice',
        width: '100px',
      },
    ];

    this.state = {
      ImageVisible: false,
      visible: false,
      visible_modal: false,
      dataSource: [],
      dataSource1: [],
      expandedRowKeys: [],
      count: 0,
      TotalPrice: 0,
      Quantity: '',
      PTID: '',
      UserID: '',
      UserName: '',
      StartDate: '',
      EndDate: '',
      newEndDate: '',
      PSstaffIDA: '',
      Notes: '',
      PIID: '',
      CID: '',
      title: '',
      PSID: '',
      Specification: '',
      Documents: '',
      photopath: '',
      state: '',
      PriceOnSale: '',
      canDistribute: '',
      SpeDetail: '',
      DocDetail: '',
      newPTID: '',
      TotalExpense: 0,
      nowDate: '',
      ENotes: '',
    };
  }

  componentDidMount() {
    const nowDate = moment(new Date()).format('YYYY-MM-DD');
    this.setState({
      nowDate,
    });
    this.getData();
  }

  formRef = React.createRef();
  formRef2 = React.createRef();

  getData = async () => {
    const { PSID } = store.getState();
    let dataSource = [];
    await axios
      .get('/getPawnticket', {
        params: {
          id: PSID,
          state: 1,
        },
      })
      .then((response) => {
        if (response.data.length === 0) {
          console.log('无数据');
        } else {
          dataSource = response.data;
        }
      })
      .catch((error) => {
        console.log(error);
      });

    dataSource = dataSource.map((obj, index) => {
      return {
        ...obj,
        key: index,
      };
    });

    this.setState({
      dataSource,
      count: dataSource.length,
    });
  };

  getDetail = async (PTID) => {
    let dataSource1 = [];
    await axios
      .get('/getPawnItems', {
        params: {
          PTID,
          usertype: 'PS',
        },
      })
      .then((response) => {
        if (response.data.length === 0) {
          console.log('无数据');
        } else {
          dataSource1 = response.data;
        }
      })
      .catch((error) => {
        console.log(error);
      });

    const { StartDate, EndDate, Total, Notes, ENotes } = dataSource1[0]
      ? dataSource1[0]
      : {};
    console.log(StartDate, EndDate, Total, Notes, ENotes);
    const totalAmount = dataSource1.reduce(function (total, obj) {
      return total + obj.Amount * 1;
    }, 0);

    dataSource1 = dataSource1.map((obj, index) => {
      return {
        ...obj,
        key: obj.PIID,
        images: obj.photopath.split(';'),
      };
    });
    this.setState({
      dataSource1,
      StartDate,
      EndDate,
      Total,
      Notes,
      ENotes,
      totalAmount,
    });
  };

  onExpand = async (expanded, record) => {
    if (expanded) {
      this.setState({ expandedRowKeys: [record.key] });
    } else {
      this.setState({ expandedRowKeys: [] });
    }
    await this.getDetail(record.PTID);
  };

  expandedRowRender = (record) => {
    const columns1 = [
      {
        title: '当品编号',
        dataIndex: 'PIID',
        key: 'PIID',
        editable: false,
        width: '170px',
      },
      {
        title: '物品名称',
        dataIndex: 'title',
        key: 'title',
        width: '120px',
      },
      {
        title: '规格详情',
        dataIndex: 'Specification',
        key: 'Specification',
        ellipsis: {
          showTitle: false,
        },
        render: (Specification) => (
          <Tooltip placement="topLeft" title={Specification}>
            {Specification}
          </Tooltip>
        ),
      },
      {
        title: '附件',
        dataIndex: 'Documents',
        key: 'Documents',
      },
      {
        title: '估价',
        dataIndex: 'AssessPrice',
        key: 'AssessPrice',
        width: '100px',
      },
      {
        title: '折价率',
        dataIndex: 'Rate',
        key: 'Rate',
        width: '100px',
      },
      {
        title: '当价',
        dataIndex: 'Amount',
        key: 'Amount',
        width: '100px',
      },
      {
        title: '单位',
        dataIndex: 'Quantity',
        key: 'Quantity',
        width: '90px',
      },
    ];

    return (
      <div style={{ maxHeight: '100px', overflow: 'auto' }}>
        <Table
          className="expand-table"
          columns={columns1}
          dataSource={this.state.dataSource1}
          size="small"
          minHeight="80"
          style={{ minHeight: '80px !important' }}
          pagination={false}
        />
      </div>
    );
  };

  handleSave = (row) => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    this.setState({
      dataSource: newData,
    });
  };

  showDrawer = () => {
    this.setState({
      visible: true,
      TotalPrice: 0,
      Quantity: '',
    });
    setTimeout(() => {
      this.formRef.current.setFieldsValue({
        UserID: '',
        UserName: '',
        Gender: '',
        Address: '',
        Phone: '',
        Email: '',
        Wechat: '',
      });
    }, 200);
  };

  onClose = () => {
    this.setState({
      visible: false,
      PIID: '',
      CID: '',
      UserID: '',
      UserName: '',
      Address: '',
      Phone: '',
      Email: '',
      Wechat: '',
      PSID: '',
      Specification: '',
      Documents: '',
      photopath: '',
      state: '',
      PriceOnSale: '',
      canDistribute: '',
      title: '',
      SpeDetail: '',
      DocDetail: '',
    });
  };

  //保存
  onSubmit = async () => {
    const { newPTID, PTID, EndDate, newEndDate } = this.state;
    console.log(newPTID, PTID, EndDate, newEndDate);

    let data = {
      step: 0,
      PTID,
      RedeemDate: newEndDate,
      RenewPTID: newPTID,
      PSstaffID: store.getState().PSstaffID,
    };

    //先赎回
    await axios({
      method: 'post',
      url: 'http://localhost:3000/renewPawn',
      data: Qs.stringify(data),
    });
    await this.onSubmit1();
    await this.onSubmit2();
    await this.onSubmit3();

    notification.open({
      message: 'Notification',
      description: (
        <div style={{ whiteSpace: 'pre-wrap' }}>
          已成功续当，新建当单编号为{newPTID},可于当单信息管理模块中查看~
        </div>
      ),
      icon: <SmileOutlined style={{ color: 'orange' }} />,
      duration: 2,
    });

    this.setState({ visible_modal: false });
    this.getData();
  };

  onSubmit1 = async () => {
    const { newPTID, UserID, nowDate, newEndDate, Notes } = this.state;
    let data = {
      step: 1,
      PTID: newPTID,
      UserID,
      PSID: store.getState().PSID,
      StartDate: nowDate,
      EndDate: newEndDate,
      EID: newPTID,
      PSstaffID: store.getState().PSstaffID,
      Notes,
    };

    //再建当单
    await axios({
      method: 'post',
      url: 'http://localhost:3000/renewPawn',
      data: Qs.stringify(data),
    });
  };

  onSubmit2 = async () => {
    const { newPTID, PTID } = this.state;
    let data = {
      step: 2,
      newPTID,
      PTID,
    };

    //重录入详情
    await axios({
      method: 'post',
      url: 'http://localhost:3000/renewPawn',
      data: Qs.stringify(data),
    });
  };

  onSubmit3 = async () => {
    const {
      newPTID,
      Interest,
      StoreFare,
      OverdueFare,
      FreightFare,
      AuthenticateFare,
      AssessFare,
      NotaryFare,
      InsuranceFare,
      OtherFare,
      ENotes,
    } = this.state;
    let data = {
      step: 3,
      PTID: newPTID,
      PSstaffID: store.getState().PSstaffID,
      Interest,
      StoreFare,
      OverdueFare,
      FreightFare,
      AuthenticateFare,
      AssessFare,
      NotaryFare,
      InsuranceFare,
      OtherFare,
      ENotes,
    };

    //录入费用
    await axios({
      method: 'post',
      url: 'http://localhost:3000/renewPawn',
      data: Qs.stringify(data),
    });
  };

  showModal = async (record) => {
    await this.setPTID();
    this.setState({
      TotalExpense: 0,
      Interest: 0,
      StoreFare: 0,
      OverdueFare: 0,
      FreightFare: 0,
      AuthenticateFare: 0,
      AssessFare: 0,
      NotaryFare: 0,
      InsuranceFare: 0,
      OtherFare: 0,
      Notes: '',
      ENotes: '',
    });
    if (record.UserID != undefined) {
      const { newPTID, nowDate } = this.state;
      const { PTID, EndDate, UserID, UserName, TotalPrice, Quantity } = record;
      this.setState({
        PTID,
        EndDate,
        UserID,
        UserName,
        TotalPrice,
        Quantity,
        visible_modal: true,
        newEndDate: EndDate,
      });
      setTimeout(() => {
        this.formRef2.current.setFieldsValue({
          newPTID: newPTID,
          PTID,
          PawnDate: [moment(nowDate), moment(EndDate)],
          CusInfo: UserID + '  ' + UserName,
          TotalPrice,
          Quantity,
          Interest: 0,
          StoreFare: 0,
          OverdueFare: 0,
          FreightFare: 0,
          AuthenticateFare: 0,
          AssessFare: 0,
          NotaryFare: 0,
          InsuranceFare: 0,
          OtherFare: 0,
          Notes: '',
          ENotes: '',
        });
      }, 200);
    } else {
      const {
        newPTID,
        nowDate,
        PTID,
        EndDate,
        UserID,
        UserName,
        TotalPrice,
        Quantity,
      } = this.state;
      this.setState({
        PTID,
        EndDate,
        UserID,
        UserName,
        TotalPrice,
        Quantity,
        visible_modal: true,
        newEndDate: EndDate,
      });
      setTimeout(() => {
        this.formRef2.current.setFieldsValue({
          newPTID: newPTID,
          PTID,
          PawnDate: [moment(nowDate), moment(EndDate)],
          CusInfo: UserID + '  ' + UserName,
          TotalPrice,
          Quantity,
          Interest: 0,
          StoreFare: 0,
          OverdueFare: 0,
          FreightFare: 0,
          AuthenticateFare: 0,
          AssessFare: 0,
          NotaryFare: 0,
          InsuranceFare: 0,
          OtherFare: 0,
          Notes: '',
          ENotes: '',
        });
      }, 200);
    }
  };

  //取新id
  setPTID = async () => {
    var that = this;
    await axios
      .get('/createPawn', {
        params: {
          step: 0,
          PSID: store.getState().PSID,
        },
      })
      .then((response) => {
        if (response.data.length === 0) {
          console.log('无数据');
        } else {
          that.setState({ newPTID: response.data[0].PTID });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  //日期改变
  handleDate = (value, dateString) => {
    const { nowDate } = this.state;
    this.setState({ newEndDate: dateString[1] });
    const PawnDate = [moment(nowDate), moment(dateString[1])];
    setTimeout(() => {
      this.formRef2.current.setFieldsValue({
        PawnDate,
      });
    }, 200);
  };

  //费用合计
  handleFare = () => {
    setTimeout(() => {
      const {
        Interest,
        StoreFare,
        OverdueFare,
        FreightFare,
        AuthenticateFare,
        AssessFare,
        NotaryFare,
        InsuranceFare,
        OtherFare,
      } = this.state;
      const TotalExpense =
        Interest +
        StoreFare +
        OverdueFare +
        FreightFare +
        AuthenticateFare +
        AssessFare +
        NotaryFare +
        InsuranceFare +
        OtherFare;
      this.setState({ TotalExpense });
    }, 600);
  };

  render() {
    const {
      nowDate,
      newPTID,
      TotalExpense,
      ImageVisible,
      expandedRowKeys,
      dataSource,
      dataSource1,
      PIID,
      CID,
      UserID,
      UserName,
      Gender,
      Address,
      Phone,
      Email,
      Wechat,
      PSID,
      Specification,
      Documents,
      photopath,
      state,
      PriceOnSale,
      canDistribute,
      title,
      SpeDetail,
      DocDetail,
      PTID,
      Quantity,
      TotalPrice,
      PSstaffIDA,
      Notes,
      StartDate,
      EndDate,
      newEndDate,
    } = this.state;
    const components = {
      body: {
        row: EditableRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }

      return {
        ...col,
        onCell: (record) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
        }),
      };
    });

    const expandedRowRender = this.expandedRowRender;

    return (
      <div>
        <Breadcrumb style={{ margin: '10px' }}>
          <Breadcrumb.Item>典当管理</Breadcrumb.Item>
          <Breadcrumb.Item>续当管理</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: 10 }}>
          <Table
            components={components}
            rowClassName={() => 'editable-row'}
            bordered
            dataSource={dataSource}
            columns={columns}
            pagination={{ pageSize: 10 }}
            size="small"
            minHeight="600"
            onExpand={(expanded, record) => {
              this.onExpand(expanded, record);
            }}
            expandable={{ expandedRowRender }}
            expandedRowKeys={expandedRowKeys}
            onRow={(record) => {
              return {
                onDoubleClick: (event) => {
                  //console.log(record)
                  const {
                    PTID,
                    UserID,
                    UserName,
                    Gender,
                    Address,
                    Phone,
                    Email,
                    Wechat,
                    StartDate,
                    EndDate,
                    PSstaffIDA,
                    Notes,
                    Quantity,
                    TotalPrice,
                    Interest,
                    StoreFare,
                    OverdueFare,
                    FreightFare,
                    AuthenticateFare,
                    AssessFare,
                    NotaryFare,
                    InsuranceFare,
                    OtherFare,
                    Total,
                    ENotes,
                  } = record;
                  this.getDetail(PTID);
                  this.setState({
                    PTID,
                    UserID,
                    UserName,
                    StartDate,
                    EndDate,
                    PSstaffIDA,
                    Notes,
                    Quantity,
                    TotalPrice,
                    visible: true,
                  });
                  setTimeout(() => {
                    this.formRef.current.setFieldsValue({
                      PTID,
                      UserID,
                      UserName,
                      PawnDate: [moment(StartDate), moment(EndDate)],
                      PSstaffIDA,
                      Notes,
                      Quantity,
                      TotalPrice,
                      UserID,
                      UserName,
                      Gender: Gender === '0' ? '男' : '女',
                      Address,
                      Phone,
                      Email,
                      Wechat,
                      Interest,
                      StoreFare,
                      OverdueFare,
                      FreightFare,
                      AuthenticateFare,
                      AssessFare,
                      NotaryFare,
                      InsuranceFare,
                      OtherFare,
                      Total,
                      ENotes,
                    });
                  }, 200);
                },
              };
            }}
          />
        </div>
        <Drawer
          title="查看当单"
          width={780}
          onClose={this.onClose}
          visible={this.state.visible}
          bodyStyle={{ paddingBottom: 80 }}
          extra={
            <Space>
              {/* <Button onClick={this.onClose}>返回</Button> */}
              <Button onClick={this.showModal} type="primary">
                续当
              </Button>
            </Space>
          }
        >
          <Form layout="horizontal" ref={this.formRef} hideRequiredMark>
            <Row gutter={16} className="myRow">
              <Col span={8}>
                <Form.Item name="PTID" label="当票编号：">
                  <Input readOnly />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item name="PawnDate" label="典当期限：">
                  <RangePicker disabled style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <hr />
            <p style={{ margin: 0, minHeight: '30px' }}>当户信息</p>
            <Row gutter={16} className="myRow">
              <Col span={10}>
                <Form.Item name="UserID" label="当户证件号：">
                  <Input readOnly onPressEnter={this.searchUserInfo} />
                </Form.Item>
              </Col>
              <Col span={7}>
                <Form.Item name="UserName" label="当户姓名：">
                  <Input readOnly />
                </Form.Item>
              </Col>
              <Col span={7}>
                <Form.Item name="Gender" label="性&nbsp;&nbsp;&nbsp;&nbsp;别：">
                  <Input readOnly />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16} className="myRow">
              <Col span={10}>
                <Form.Item name="Email" label="邮 箱 地 址：">
                  <Input readOnly value={this.state.Email} />
                </Form.Item>
              </Col>
              <Col span={7}>
                <Form.Item name="Phone" label="联系电话：">
                  <Input readOnly value={this.state.Phone} />
                </Form.Item>
              </Col>
              <Col span={7}>
                <Form.Item name="Wechat" label="微信号：">
                  <Input readOnly value={this.state.Wechat} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16} className="myRow">
              <Col span={24}>
                <Form.Item name="Address" label="详 细 住 址：">
                  <Input readOnly value={this.state.Address} />
                </Form.Item>
              </Col>
            </Row>
            <hr />
            <Row gutter={16} className="myRow">
              <Col span={24}>
                <Form.Item name="detail" label="当单详情：">
                  <p>
                    当物数量 : {this.state.Quantity}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;总当价 :
                    <span style={{ color: 'orange' }}>
                      {this.state.TotalPrice}
                    </span>
                  </p>
                </Form.Item>
              </Col>
            </Row>
            {dataSource1.map((obj, index) => {
              const {
                PIID,
                title,
                AssessPrice,
                Rate,
                Amount,
                Quantity,
                Specification,
                Documents,
                Discript,
                images,
                key,
              } = obj;
              return (
                <Row gutter={16} key={index}>
                  <Col span={24}>
                    <Form.Item name={key} label={index + 1 * 1}>
                      <Space
                        size={10}
                        align="start"
                        style={{ display: 'flex', marginRight: '50px' }}
                      >
                        <Image
                          preview={{ visible: false }}
                          width={100}
                          src={images[0]}
                          onClick={() => this.setState({ ImageVisible: true })}
                        />
                        <div style={{ display: 'none' }}>
                          <Image.PreviewGroup
                            preview={{
                              visible: ImageVisible,
                              onVisibleChange: (vis) =>
                                this.setState({ ImageVisible: vis }),
                            }}
                          >
                            {images.map((item, i) => (
                              <Image key={i} src={item} />
                            ))}
                          </Image.PreviewGroup>
                        </div>
                        <Space size={5} direction="vertical">
                          <p>
                            当品编号 : {PIID}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;名称
                            : {title}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;类别 :{' '}
                            {title}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;数量 :{' '}
                            {Quantity}
                          </p>
                          <p>
                            估价 : {AssessPrice}
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;折价率 : {Rate}
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;当价 :{' '}
                            <span style={{ color: 'orange' }}>{Amount}</span>
                          </p>
                          <p>
                            物品详情 : {Specification ? Specification : '无'}
                          </p>
                          <p>包含附件 : {Documents ? Documents : '无'}</p>
                          {/* <p>物品描述 : {Discript?Discript:'无'}</p> */}
                        </Space>
                      </Space>
                    </Form.Item>
                  </Col>
                </Row>
              );
            })}
            <Row gutter={16} className="myRow">
              <Col span={24}>
                <Form.Item name="Notes" label="当 单 标 注：">
                  <Input
                    readOnly
                    value={this.state.Notes}
                    onChange={this.handleNotes}
                    placeholder="无"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16} className="myRow">
              <Col span={8}>
                <Form.Item name="PSstaffIDA" label="建当经办人：">
                  <Input readOnly onChange={this.handlePSstaffIDA} />
                </Form.Item>
              </Col>
            </Row>
            <hr />
            <Row gutter={16} className="myRow">
              <Col span={24}>
                <Form.Item name="expense" label="费用详情">
                  <p style={{ margin: 0, minHeight: 0 }}>
                    费用合计 : {this.state.TotalExpense}
                  </p>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16} className="myRow">
              <Col span={8}>
                <Form.Item
                  name="Interest"
                  label="利&nbsp;&nbsp;&nbsp;&nbsp;息："
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ Interest: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="StoreFare" label="仓管费：">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ StoreFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="OverdueFare" label="逾期费：">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ OverdueFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16} className="myRow">
              <Col span={8}>
                <Form.Item name="FreightFare" label="物流费：">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ FreightFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="AuthenticateFare" label="鉴定费：">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ AuthenticateFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="AssessFare" label="估价费：">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ AssessFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16} className="myRow">
              <Col span={8}>
                <Form.Item name="NotaryFare" label="公证费：">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ NotaryFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="InsuranceFare" label="保险费：">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ InsuranceFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="OtherFare" label="其他费：">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ OtherFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16} className="myRow">
              <Col span={24}>
                <Form.Item name="ENotes" label="费用备注：">
                  <Input
                    value={this.state.ENotes}
                    onChange={(e) => this.setState({ ENotes: e.target.value })}
                    placeholder="请输入费用备注"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Drawer>
        <Modal
          title="续当开票"
          centered
          visible={this.state.visible_modal}
          onOk={this.onSubmit}
          onCancel={() => {
            this.setState({ visible_modal: false });
          }}
          width={700}
        >
          <Form ref={this.formRef2} hideRequiredMark>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="newPTID" label="续当票号">
                  <Input readOnly />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="PTID" label="原当票号">
                  <Input readOnly />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="PawnDate"
                  label="典当期限"
                  rules={[{ required: true, message: '请选择典当期限' }]}
                >
                  <RangePicker
                    style={{ width: '100%' }}
                    disabledDate={(current) => {
                      return current <= moment(EndDate).subtract(1, 'days');
                    }}
                    onChange={this.handleDate}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="CusInfo" label="当户信息">
                  <Input readOnly />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="detail" label="当单含有">
                  <p style={{ margin: '0 auto', color: 'orange' }}>
                    &nbsp;&nbsp;当物数量 : {this.state.Quantity}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;总当价 :{' '}
                    {this.state.TotalPrice}
                  </p>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="PTNotes" label="当单标注">
                  <Input.TextArea
                    rows={2}
                    onChange={(e) => {
                      this.setState({ Notes: e.target.value });
                    }}
                    placeholder="请输入当单标注内容"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <p>
                  费用单详情&nbsp;&nbsp;
                  <span style={{ margin: '0 auto', color: 'orange' }}>
                    总费用 : {TotalExpense}
                  </span>
                </p>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="Interest" label="利&nbsp;&nbsp;&nbsp;&nbsp;息">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ Interest: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="StoreFare" label="仓管费">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ StoreFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="OverdueFare" label="逾期费">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ OverdueFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="FreightFare" label="物流费">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ FreightFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="AuthenticateFare" label="鉴定费">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ AuthenticateFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="AssessFare" label="估价费">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ AssessFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="NotaryFare" label="公证费">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ NotaryFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="InsuranceFare" label="保险费">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ InsuranceFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="OtherFare" label="其他费">
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="￥"
                    min="0"
                    step="1.00"
                    onChange={(e) => {
                      this.setState({ OtherFare: e });
                      this.handleFare();
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="ENotes" label="费用备注">
                  <Input.TextArea
                    rows={2}
                    value={this.state.ENotes}
                    onChange={(e) => {
                      this.setState({ ENotes: e.target.value });
                    }}
                    placeholder="请输入费用备注"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  }
}
