import React, { Component, useContext, useState, useEffect, useRef } from 'react'
import { Breadcrumb, Table, Input, Button, Switch, Form, Drawer, Col, Row, Select, DatePicker, Space, Tooltip, notification, Tag, Popconfirm } from 'antd'
import axios from 'axios'
import store from '../../../../redux/store'
import '../../../../style/common.less'
//import 'antd/dist/antd.css';
import { PlusOutlined, SmileOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;
const { CheckableTag } = Tag;

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


export default class VerifyOrder extends Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: '订单编号',
        dataIndex: 'OrderID',
        key: 'OrderID',
        editable: false,
        width: '10%'
      },
      {
        title: '顾客证件号',
        dataIndex: 'UserID',
        key: 'UserID',
        editable: false
      },
      {
        title: '顾客姓名',
        dataIndex: 'UserName',
        key: 'UserName',
        width: '10%'
      },
      {
        title: '地址',
        dataIndex: 'Address',
        key: 'Address',
        ellipsis: {
          showTitle: false,
        },
        render: Address => (
          <Tooltip placement="topLeft" title={Address}>
            {Address}
          </Tooltip>
        )
      },
      {
        title: '下单日期',
        dataIndex: 'OrderDate',
        key: 'OrderDate',
        width: '10%'
      },
      {
        title: '数量',
        dataIndex: 'num',
        key: 'num',
        width: '8%'
      },
      {
        title: '总价',
        dataIndex: 'Amount',
        key: 'Amount',
        width: '10%'
      },
      {
        title: '审核操作',
        dataIndex: 'operation',
        width: '10%',
        render: (_, record) =>
          this.state.dataSource.length >= 1 ? (
            <div>
              <Popconfirm title="确认通过审核?" onConfirm={() => this.handlePass(record.key)}>
                <a>同意</a>
              </Popconfirm>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Popconfirm title="确认不通过审核?" onConfirm={() => this.handleNotPass(record.key)}>
                <a>拒绝</a>
              </Popconfirm>
            </div>     
          ) : null,
      },
    ];

    this.state = {
      visible: false ,
      childrenDrawer: false,
      SpeDetailArr: [],
      DocDetailArr: [],
      SpecificationArr: [],
      SpecificationData: {},
      DocumentsArr: [],
      selectedTags: [],
      dataSource: [],
      dataSource1: [],
      dataSource2: {},
      expandedRowKeys:[],
      count: 0,
      OrderID: '',
      UserID: '',
      UserName: '',
      OrderDate: '',
      state: '',
      Address: '',
      num: 0,
      Amount: 0,
      PIID: '',
      title: '',
      SpeDetail: '',
      DocDetail: '',
      PSID: '',
      Specification: '',
      Documents: '',
      photopath: '',
      Price: '',
      Quantity: '',
      PickUpWay: '',
      PayWay: '',
      PayState: '',
      canDistribute: '',
      state: '',
      Discript: ''
    };
  }

  componentDidMount(){
    this.getData()
  }

  formRef = React.createRef();
  formRef2 = React.createRef();

  getData = async () => {
    const {PSID} = store.getState()
    let dataSource = []
    await axios.get('/getOrders',{
      params:{
        id: PSID,
        state: 0
      }
    }).then(response=>{
      if(response.data.length === 0){
        console.log('无数据')
      }else{
        dataSource = response.data
      }
    }).catch(error=>{
        console.log(error);
    });

    dataSource = dataSource.map((obj,index) => {
      return {
        ...obj,
        key: index
      };
    });

    this.setState({
      dataSource,
      count: dataSource.length
    })
  }

  getDetail = async (oid) => {
    let dataSource1 = []
    await axios.get('/getOrders',{
      params:{
        oid
      }
    }).then(response=>{
        if(response.data.length === 0){
          console.log('无数据')
        }else{
          dataSource1 = response.data
        }
    }).catch(error=>{
        console.log(error);
    });

    dataSource1 = dataSource1.map((obj,index) => {
      return {
        ...obj,
        key: "shop"+obj.PIID
      };
    });
    this.setState({
      dataSource1
    })
  }

  getChildrenDetail = async (oid,piid) => {
    let dataSource2 = {}
    await axios.get('/getOrders',{
      params:{
        oid,
        piid
      }
    }).then(response=>{
        if(response.data.length === 0){
          console.log('无数据')
        }else{
          dataSource2 = response.data[0]
        }
    }).catch(error=>{
        console.log(error);
    });

    const {PIID,title,Quantity,photopath,canDistribute,Price,PickUpWay,PayWay,Notes} = dataSource2
    this.setState({
      PIID,title,Quantity,photopath,canDistribute,Price,PickUpWay,PayWay,Notes
    })
  }

  onExpand = async (expanded,record) => {
    if (expanded) {
      this.setState({ expandedRowKeys: [record.key] });
    } else {
      this.setState({ expandedRowKeys: [] });
    }
    await this.getDetail(record.OrderID)
  }
  
  expandedRowRender = (record) => {       
    const columns1 = [
      {
        title: '商品编号',
        dataIndex: 'PIID',
        key: 'PIID',
        editable: false,
        width: '10%'
      },
      {
        title: '类别',
        dataIndex: 'title',
        key: 'title',
        width: '10%'
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
        )
      },
      {
        title: '附件',
        dataIndex: 'Documents',
        key: 'Documents',
        ellipsis: {
          showTitle: false,
        },
        render: (Documents) => (
          <Tooltip placement="topLeft" title={Documents}>
            {Documents}
          </Tooltip>
        )
      },
      {
        title: '售价',
        dataIndex: 'Price',
        key: 'Price',
        width: '10%'
      },
      {
        title: '单位',
        dataIndex: 'Quantity',
        key: 'Quantity',
        width: '10%'
      },
      {
        title: '提货方式',
        dataIndex: 'PickUpWay',
        key: 'PickUpWay',
        width: '10%'
      },
      {
        title: '支付方式',
        dataIndex: 'PayWay',
        key: 'PayWay',
        width: '10%'
      },
      {
        title: '支付状态',
        dataIndex: 'PayState',
        key: 'PayState',
        width: '10%'
      },
    ];

    return <Table columns={columns1} dataSource={this.state.dataSource1} pagination={false} />;
  };

  handleDelete = (key) => {
    const dataSource = [...this.state.dataSource];
    this.setState({
      dataSource: dataSource.filter((item) => item.key !== key),
    });
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

  handleID = (e) =>{
    this.setState({
      ComMemID: e.target.value
    })
  }

  handleName = (e) =>{
    this.setState({
      ComMemName: e.target.value
    })
  }

  handleDate = (date, dateString) =>{
    this.setState({
      BirthDate: dateString
    })
  }

  handleAddress = (e) =>{
    this.setState({
      Address: e.target.value
    })
  }

  handlePhone = (e) =>{
    this.setState({
      Phone: e.target.value
    })
  }

  handleNotes = (e) =>{
    this.setState({
      Notes: e.target.value
    })
  }

  showDrawer = (record) => {
    this.getDetail(record.OrderID)
    this.setState({
      ...record,
      visible: true
    });
  };

  showChildrenDrawer = (record) => {
    this.getChildrenDetail(this.state.OrderID,record.PIID)
    const {SpeDetail,DocDetail,Specification,Documents} = record
    let selectedTags = [];

    const SpeDetailArr = SpeDetail.split(";")
    const SpecificationArr = Specification.split(";")
    let SpecificationData = {}
    SpeDetailArr.map((obj)=>{
      SpecificationArr.map((obj1)=>{
        obj1 = obj1.split(":")
        if(obj1[0] === obj){
          SpecificationData[obj] = obj1[1]
        }
      });
    })
    const DocDetailArr = DocDetail.split(";")
    const DocumentsArr = Documents.split(";")
    selectedTags = DocumentsArr
    this.setState({
      ...record,SpeDetailArr,DocDetailArr,SpecificationArr,DocumentsArr,SpecificationData,selectedTags,
      childrenDrawer: true
    });
  };

  handleTagsChange(tag, checked) {
    const { selectedTags } = this.state;
    const nextSelectedTags = checked ? [...selectedTags, tag] : selectedTags.filter(t => t !== tag);
    this.setState({ selectedTags: nextSelectedTags });
  }

  onClose = () => {
    this.setState({
      visible: false,
      PIID: '',
      title: '',
      SpeDetail: '',
      DocDetail: '',
      PSID: '',
      Specification: '',
      Documents: '',
      photopath: '',
      UnitPrice: '',
      Quantity: '',
      num: '',
      Amount: '',
      canDistribute: '',
      state: '',
      Discript: ''
    });
  };

  onSubmit = async () => {
    console.log(this.state)

    await axios.get('/addComMem',{
      params:{
        ComMemID: this.state.ComMemID,
        ComMemName: this.state.ComMemName,
        Gender: this.state.Gender,
        BirthDate: this.state.BirthDate,
        Address: this.state.Address,
        Phone: this.state.Phone,
        Email: this.state.Email,
        Notes: this.state.Notes
      }
    }).then(response=>{
      console.log(response);
    }).catch(error=>{
        console.log(error);
    });

    this.getData()

    notification.open({
      message: 'Notification',
      description:
        <div style={{whiteSpace: 'pre-wrap'}}>已成功添加人员<br/>初始密码为123456</div>,
      icon: <SmileOutlined style={{color:'orange'}}/>,
      duration: 2
    });
    this.onClose();
  };

  render() {
    const { expandedRowKeys,dataSource,dataSource1,SpeDetailArr,SpecificationArr,DocDetailArr,SpecificationData,selectedTags,OrderID,PIID,title,Quantity,photopath,canDistribute,Price,PickUpWay,PayWay,PickUpCode,PayState,Notes,UserID,UserName,OrderDate,state,Address,num,Amount,Discript } = this.state;
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
          handleSave: this.handleSave,
        }),
      };
    });

    const expandedRowRender = this.expandedRowRender

    return (
      <div>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>销售管理</Breadcrumb.Item>
          <Breadcrumb.Item>订单交易审核</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: 10 }}>
          <Table
            components={components}
            rowClassName={() => 'editable-row'}
            bordered
            dataSource={dataSource}
            columns={columns}
            pagination={{ pageSize: 5 }}
            onExpand={(expanded,record)=>{this.onExpand(expanded,record)}}
            expandable={{expandedRowRender}}
            expandedRowKeys={expandedRowKeys}
            onRow={record => {
              return {
                onDoubleClick: event => {
                  this.showDrawer(record)              
                },
              };
            }}
          />
        </div>
        <Drawer
          title="编辑信息"
          width={320}
          onClose={this.onClose}
          visible={this.state.visible}
          bodyStyle={{ paddingBottom: 80 }}
          extra={
            <Space>
              <Button onClick={this.onClose}>Cancel</Button>
              <Button onClick={this.onSubmit} type="primary">
                Submit
              </Button>
            </Space>
          }
        >
          <Form layout="vertical" ref={this.formRef} hideRequiredMark
          initialValues={{OrderID,UserID,UserName,OrderDate,Address,Discript,num,canDistribute,...SpecificationData,Documents:selectedTags}}
          >
            <Form.Item
              name="OrderID"
              label="订单编号"
              rules={[{ required: true, message: '请输入订单编号' }]}
            >
              <Input value={OrderID} placeholder="请输入订单编号" onChange={this.handleOrderID} />
            </Form.Item>
            <Form.Item
              name="UserID"
              label="顾客证件号"
            >
              <Input value={UserID} />
            </Form.Item>
            <Form.Item
              name="UserName"
              label="顾客姓名"
            >
              <Input value={UserName} />
            </Form.Item>
            <Form.Item
              name="Address"
              label="详细地址"
            >
              <Input.TextArea rows={3} value={Address} />
            </Form.Item>
            <Form.Item
              name="OrderDate"
              label="下单日期"
            >
              <Input value={OrderDate} onChange={this.handleOrderDate} />
            </Form.Item>
            <Form.Item
              name="detail"
              label="订单详情"
            >
              <p>物品数量 : {num}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;总估价 : {Amount}</p>
            </Form.Item>
            {dataSource1.map((obj,index) => {
              const {PIID,key} = obj
              return (
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name={key}
                      label={index+1*1}
                    >
                      <Space size={6} align="baseline">
                        <p>当物编号 : {PIID}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
                        <Button type="link" onClick={()=>{this.showChildrenDrawer(obj)}}>查看详情</Button>
                      </Space>
                    </Form.Item>
                  </Col>
                </Row>
              );
            })}
          </Form>
          <Drawer
            title="当物详情"
            width={320}
            closable
            onClose={()=>this.setState({childrenDrawer:false})}
            visible={this.state.childrenDrawer}
          >
            <Form layout="vertical" ref={this.formRef2} hideRequiredMark
            initialValues={{PIID,title,Price,Quantity,canDistribute,PickUpWay,PickUpCode,PayWay,PayState,...SpecificationData,Documents:selectedTags}}
            >
              <Form.Item
                name="PIID"
                label="当品编号"
                rules={[{ required: true, message: '请输入当品编号' }]}
              >
                <Input placeholder="请输入当品编号" onChange={this.handlePIID} />
              </Form.Item>
              <Form.Item
                name="title"
                label="类别"
              >
                <Input />
              </Form.Item>
              {
                SpeDetailArr.map((obj,index)=>{
                  let value = ''
                  SpecificationArr.map((obj1)=>{
                    obj1 = obj1.split(":")
                    if(obj1[0] === obj){
                      value=obj1[1]
                    }
                  });
                  return (
                    <Form.Item
                      name={obj}
                      label={obj}
                      rules={[{ required: true, message: '请输入'+obj }]}
                      value={value}
                    >
                      <Input value={value} placeholder={"请输入"+obj} />
                    </Form.Item>
                  );
                })
              }
              <Form.Item
                name="Documents"
                label="Documents"
                rules={[{ required: true, message: '请选择可提供附件' }]}
              >
                <div>
                {
                DocDetailArr.map((obj,index)=>{
                  return (
                      <CheckableTag
                        key={obj}
                        checked={selectedTags.indexOf(obj) > -1}
                        onChange={checked => this.handleTagsChange(obj, checked)}
                      >
                        {obj}
                      </CheckableTag>
                  )
                })        
                }
                </div>            
              </Form.Item>
              <Form.Item
                name="Price"
                label="售价"
                rules={[{ required: true, message: '请输入售价' }]}
              >
                <Input placeholder="请输入售价" onChange={this.handlePrice} />
              </Form.Item>
              <Form.Item
                name="Quantity"
                label="单位"
                rules={[{ required: true, message: '请输入单位' }]}
              >
                <Input placeholder="请输入单位" onChange={this.handleQuantity} />
              </Form.Item>
              <Form.Item
                name="canDistribute"
                label="支持邮寄"
                rules={[{ required: true, message: '请选择是否支持邮寄' }]}
              >
                <Select value={canDistribute} onChange={this.handleCanDistribute} placeholder="请选择是否支持邮寄">
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="PickUpWay"
                label="提货方式"
              >
                <Select value={PickUpWay} onChange={this.handlePickUpWay} placeholder="请选择提货方式">
                  <Option value="0">邮寄</Option>
                  <Option value="1">自提</Option>
                </Select>
              </Form.Item>
              {
                PickUpWay === "0" ?
                <Form.Item
                  name="PickUpCode"
                  label="运单号"
                >
                  <Input  onChange={this.handlePickUpCode} />
                </Form.Item>
                :
                <Form.Item
                  name="PickUpCode"
                  label="提货码"
                >
                  <Input onChange={this.handlePickUpCode} />
                </Form.Item>
              }
              <Form.Item
                name="PayWay"
                label="支付方式"
              >
                <Select value={PayWay} onChange={this.handlePayWay} placeholder="请选择支付方式">
                  <Option value="0">线上支付</Option>
                  <Option value="1">线下支付</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="PayState"
                label="支付状态"
                rules={[{ required: true, message: '请选择支付状态' }]}
              >
                <Select value={PayState} onChange={this.handlePayState} placeholder="请选择支付状态">
                  <Option value="0">未支付</Option>
                  <Option value="1">已支付</Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Space size='middle'>
                  <Button>
                    取消
                  </Button>
                  <Button type="primary">
                    保存
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Drawer>
        </Drawer>
      </div>
    )
  }
}
