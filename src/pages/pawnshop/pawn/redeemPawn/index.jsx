import React, { Component, useContext, useState, useEffect, useRef } from 'react'
import { Breadcrumb, Table, Input, InputNumber, Button, Popconfirm, Form, Drawer, Col, Row, Select, DatePicker, Space, Tooltip, notification, Modal, Image } from 'antd'
import axios from 'axios'
import Qs from 'qs'
import store from '../../../../redux/store'
import '../../../../style/common.less'
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

export default class RedeemPawn extends Component {
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
              <Popconfirm title="确认赎当吗？" onConfirm={() => this.showModal(record)}>
                <a>赎当</a>
              </Popconfirm>
            </div>
          ) : null
      },
      {
        title: '当票编号',
        dataIndex: 'PTID',
        key: 'PTID',
        width: '90px'
      },
      {
        title: '当户姓名',
        dataIndex: 'UserName',
        key: 'UserName',
        width: '90px'
      },
      {
        title: '当户证件号',
        dataIndex: 'UserID',
        key: 'UserID',
        width: '130px'
      },
      {
        title: '开票日期',
        dataIndex: 'StartDate',
        key: 'StartDate',
        width: '100px'
      },
      {
        title: '到期日期',
        dataIndex: 'EndDate',
        key: 'EndDate',
        width: '100px'
      },
      {  
        title: '当物数量',
        dataIndex: 'Quantity',
        key: 'Quantity',
        width: '90px'
      },
      {
        title: '总当价',
        dataIndex: 'TotalPrice',
        key: 'TotalPrice',
        width: '100px'
      }, 
    ];

    this.state = {
      ImageVisible: false,
      visible: false ,
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
      TotalExpense: 0,
      nowDate: '',
      ENotes: '',
      OverdueFare: 0,
      EID: ''
    };
  }

  componentDidMount(){
    const nowDate = moment(new Date()).format('YYYY-MM-DD')
    this.setState({
      nowDate
    })
    this.getData()
  }

  formRef = React.createRef();
  formRef2 = React.createRef();

  getData = async () => {
    const {PSID} = store.getState()
    let dataSource = []
    await axios.get('/getPawnticket',{
      params:{
        id: PSID,
        state: 1
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

  getDetail = async (PTID) => {
    let dataSource1 = []
    await axios.get('/getPawnItems',{
      params:{
        PTID, usertype:'PS'
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

    const {StartDate,EndDate,Total,Notes,ENotes} = dataSource1[0]?dataSource1[0]:{}
    console.log(StartDate,EndDate,Total,Notes,ENotes)
    const totalAmount = dataSource1.reduce(function(total,obj) {
        return total + obj.Amount*1;
    }, 0);

    dataSource1 = dataSource1.map((obj,index) => {
      return {
        ...obj,
        key: obj.PIID,
        images: obj.photopath.split(";")
      };
    });
    this.setState({
      dataSource1,StartDate,EndDate,Total,Notes,ENotes,totalAmount
    })
  }

  onExpand = async (expanded,record) => {
    if (expanded) {
      this.setState({ expandedRowKeys: [record.key] });
    } else {
      this.setState({ expandedRowKeys: [] });
    }
    await this.getDetail(record.PTID)
  }

  expandedRowRender = (record) => {       
    const columns1 = [
      {
        title: '当品编号',
        dataIndex: 'PIID',
        key: 'PIID',
        editable: false,
        width: '170px'
      },
      {
        title: '物品名称',
        dataIndex: 'title',
        key: 'title',
        width: '120px'
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
        key: 'Documents'
      },
      {
        title: '估价',
        dataIndex: 'AssessPrice',
        key: 'AssessPrice',
        width: '100px'
      },
      {
        title: '折价率',
        dataIndex: 'Rate',
        key: 'Rate',
        width: '100px'
      },
      {
        title: '当价',
        dataIndex: 'Amount',
        key: 'Amount',
        width: '100px'
      },
      {
        title: '单位',
        dataIndex: 'Quantity',
        key: 'Quantity',
        width: '90px'
      }
    ];

    return (
    <div style={{maxHeight:'100px',overflow:'auto'}}>

    <Table className='expand-table' columns={columns1} dataSource={this.state.dataSource1} size="small" minHeight="80" style={{ minHeight: '80px !important' }} pagination={false} />
    </div>
    )
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
      Quantity: ''
    });
    setTimeout(() => {
      this.formRef.current.setFieldsValue({
        UserID: '',
        UserName: '',
        Gender: '',
        Address: '',
        Phone: '',
        Email: '',
        Wechat: ''
      })
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
      DocDetail: ''
    });
  };

  //赎
  onSubmit = async () => {
    const {things,nowDate,PTID,EndDate,EID,OverdueFare} = this.state
    const  pawnitems = things.split(";")

    const data1 = {
      step: 0,
      PTID,
      RedeemDate:nowDate,
      PSstaffID: store.getState().PSstaffID
    }

    await axios({
      method: 'post',
      url: 'http://localhost:3000/redeemPawn',
      data: Qs.stringify(data1)
    });

    if(EndDate < nowDate){ //过期了
      const data2 = {
        step: 1, EID, OverdueFare
      }
      await axios({
        method: 'post',
        url: 'http://localhost:3000/redeemPawn',
        data: Qs.stringify(data2)
      });
    }

    for (const item of pawnitems) {
      console.log(item);
      const data3 = {
        step: 2,
        PIID: item
      }
  
      //当品状态->未在当
      await axios({
        method: 'post',
        url: 'http://localhost:3000/redeemPawn',
        data: Qs.stringify(data3)
      });
    }

    notification.open({
      message: 'Notification',
      description:
        <div style={{whiteSpace: 'pre-wrap'}}>已成功赎当，可于典当信息管理模块中查看~</div>,
      icon: <SmileOutlined style={{color:'orange'}}/>,
      duration: 2
    });

    this.setState({visible_modal:false});
    this.getData();
  };

  showModal = async (record) => {
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
      ENotes: ''
    });
    if(record.UserID!=undefined){
      const { EID,things,PTID,StartDate,EndDate,UserID,UserName,TotalPrice,Quantity } = record
      this.setState({
        EID,things,PTID,EndDate,UserID,UserName,TotalPrice,Quantity,
        visible_modal: true
      });
      setTimeout(() => {
        this.formRef2.current.setFieldsValue({
          PTID,PawnDate:[moment(StartDate),moment(EndDate)],UserID,UserName,TotalPrice,Quantity,Interest: 0,StoreFare: 0,OverdueFare: 0,FreightFare: 0,AuthenticateFare: 0,AssessFare: 0,NotaryFare: 0,InsuranceFare: 0,OtherFare: 0,Notes: '',ENotes: ''
        })
      }, 200);
    }else{
      const { PTID,StartDate,EndDate,UserID,UserName,TotalPrice,Quantity } = this.state;
      this.setState({
        visible_modal: true
      });
      setTimeout(() => {
        this.formRef2.current.setFieldsValue({
          PTID,PawnDate:[moment(StartDate),moment(EndDate)],UserID,UserName,TotalPrice,Quantity,Interest: 0,StoreFare: 0,OverdueFare: 0,FreightFare: 0,AuthenticateFare: 0,AssessFare: 0,NotaryFare: 0,InsuranceFare: 0,OtherFare: 0,Notes: '',ENotes: ''
        })
      }, 200);
    }
  };

  render() {
    const { nowDate,ImageVisible,expandedRowKeys,dataSource,dataSource1,PIID,CID,UserID,UserName,photopath,state,canDistribute,title,PTID,Quantity,TotalPrice,PSstaffIDA,Notes,StartDate,EndDate} = this.state;    
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
          <Breadcrumb.Item>典当管理</Breadcrumb.Item>
          <Breadcrumb.Item>赎当管理</Breadcrumb.Item>
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
            onExpand={(expanded,record)=>{this.onExpand(expanded,record)}}
            expandable={{expandedRowRender}}
            expandedRowKeys={expandedRowKeys}
            onRow={record => {
              return {
                onDoubleClick: event => {
                  const { things,PTID,UserID,UserName,Gender,Address,Phone,Email,Wechat,StartDate,EndDate,PSstaffIDA,Notes,Quantity,TotalPrice,EID,Interest,StoreFare,OverdueFare,FreightFare,AuthenticateFare,AssessFare,NotaryFare,InsuranceFare,OtherFare,Total,ENotes } = record
                  this.getDetail(PTID)
                  this.setState({
                    things,PTID,UserID,UserName,StartDate,EndDate,PSstaffIDA,Notes,Quantity,TotalPrice,EID,
                    visible: true
                  });
                  setTimeout(() => {
                    this.formRef.current.setFieldsValue({
                      PTID,UserID,UserName,Gender:Gender==='0'?'男':'女',Address,Phone,Email,Wechat,
                      PawnDate:[moment(StartDate), moment(EndDate)],PSstaffIDA,Notes,Quantity,TotalPrice,
                      Interest,StoreFare,OverdueFare,FreightFare,AuthenticateFare,AssessFare,NotaryFare,InsuranceFare,OtherFare,Total,ENotes
                    })
                  }, 200);
                },
              };
            }}
          />
        </div>
        
        <Drawer
          title="查看当单"
          width={720}
          onClose={this.onClose}
          visible={this.state.visible}
          bodyStyle={{ paddingBottom: 80 }}
          extra={
            <Space>
              <Button onClick={this.onClose}>返回</Button>
              <Button onClick={this.showModal} type="primary">赎当</Button>
            </Space>
          }
        >
          <Form layout="vertical" ref={this.formRef} hideRequiredMark>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="PTID"
                  label="当票编号"
                >
                  <Input readOnly />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="PawnDate"
                  label="典当期限"
                >
                  <RangePicker style={{width:'100%'}} 
                  defaultValue={[moment(StartDate), moment(EndDate)]} />
                </Form.Item>
              </Col>
            </Row>
            <hr/>
            <p style={{margin:0,minHeight:'30px'}}>当户信息</p>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="UserID"
                  label="当户证件号"
                >
                  <Input readOnly onPressEnter={this.searchUserInfo}/>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="UserName"
                  label="当户姓名"
                >
                <Input readOnly />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                name="Gender"
                label="性别"
                >
                  <Input readOnly />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="Phone"
                  label="联系电话"
                >
                  <Input readOnly value={this.state.Phone} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="Email"
                  label="邮箱地址"
                >
                  <Input readOnly value={this.state.Email}/>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="Wechat"
                  label="微信号"
                >
                  <Input readOnly value={this.state.Wechat}/>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="Address"
                  label="详细住址"
                >
                  <Input.TextArea readOnly rows={2} value={this.state.Address}/>
                </Form.Item>
              </Col>
            </Row>
            <hr/>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="detail"
                  label="当单详情"
                >
                  <p>当物数量 : {this.state.Quantity}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;总当价 : <span style={{color:'orange'}}>{this.state.TotalPrice}</span></p>
                </Form.Item>
              </Col>
            </Row>        
            {dataSource1.map((obj,index) => {
              const {PIID,title,AssessPrice,Rate,Amount,Quantity,Specification,Documents,Discript,images,key} = obj
              return (
                <Row gutter={16} key={index}>
                  <Col span={24}>
                    <Form.Item
                      name={key}
                      label={index+1*1}
                    >
                      <Space size={20} align='start' style={{display:'flex',marginRight:'50px'}}>
                        <Image
                        preview={{visible:false}}
                        width={200}
                        src={images[0]}
                        onClick={() => this.setState({ImageVisible:true})}
                        />
                        <div style={{ display: 'none' }}>
                        <Image.PreviewGroup preview={{ visible:ImageVisible, onVisibleChange: vis => this.setState({ImageVisible:vis}) }}>
                            {images.map((item,i)=>
                                (
                                    <Image key={i} src={item} />
                                ) 
                            )}
                        </Image.PreviewGroup>
                        </div>
                        <Space size={5} direction="vertical">
                            <p>当品编号 : {PIID}</p>
                            <p>当品名称 : {title}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;数量 : {Quantity}</p>
                            <p>估价 : {AssessPrice}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;折价率 : {Rate}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;当价 : <span style={{color:'orange'}}>{Amount}</span></p>
                            <p>物品详情 : {Specification?Specification:'无'}</p>
                            <p>包含附件 : {Documents?Documents:'无'}</p>
                            <p>物品描述 : {Discript?Discript:'无'}</p>
                        </Space>
                      </Space>
                    </Form.Item>
                  </Col>
                </Row>
              );
            })}
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="Notes"
                  label="当单标注"
                  rules={[{ required: true, message: '请输入当单标注内容' }]}
                >
                  <Input.TextArea readOnly rows={2} placeholder="无" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="PSstaffIDA"
                  label="建当经办人"
                >
                  <Input onChange={this.handlePSstaffIDA} />
                </Form.Item>
              </Col>
            </Row>
            <hr/>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="expense"
                  label="费用详情"
                >
                  <p style={{margin:0,minHeight:0}}>费用合计 : {this.state.TotalExpense}</p>
                </Form.Item>
              </Col>
            </Row>  
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="Interest"
                  label="利&nbsp;&nbsp;&nbsp;&nbsp;息"
                >
                  <InputNumber style={{width:'100%'}} prefix="￥" min="0" step="1.00"/>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="StoreFare"
                  label="仓管费"
                >
                  <InputNumber style={{width:'100%'}} prefix="￥" min="0" step="1.00"/>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="OverdueFare"
                  label="逾期费"
                >
                  <InputNumber style={{width:'100%'}} prefix="￥" min="0" step="1.00"/>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="FreightFare"
                  label="物流费"
                >
                  <InputNumber style={{width:'100%'}} prefix="￥" min="0" step="1.00"/>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="AuthenticateFare"
                  label="鉴定费"
                >
                  <InputNumber style={{width:'100%'}} prefix="￥" min="0" step="1.00"/>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="AssessFare"
                  label="估价费"
                >
                  <InputNumber style={{width:'100%'}} prefix="￥" min="0" step="1.00"/>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="NotaryFare"
                  label="公证费"
                >
                  <InputNumber style={{width:'100%'}} prefix="￥" min="0" step="1.00"/>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="InsuranceFare"
                  label="保险费"
                >
                  <InputNumber style={{width:'100%'}} prefix="￥" min="0" step="1.00"/>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="OtherFare"
                  label="其他费"
                >
                  <InputNumber style={{width:'100%'}} prefix="￥" min="0" step="1.00"/>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="ENotes"
                  label="费用备注"
                >
                  <Input.TextArea rows={2} value={this.state.ENotes} placeholder="无" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Drawer>
        <Modal
          title="赎当确认"
          centered
          visible={this.state.visible_modal}
          onOk={this.onSubmit}
          onCancel={() => {this.setState({visible_modal:false})}}
          width={600}
        >
          <Form ref={this.formRef2} hideRequiredMark>
            <Row gutter={16}>
              <Col span={10}>
                <Form.Item
                  name="PTID"
                  label="当票编号"
                >
                  <Input readOnly/>
                </Form.Item>
              </Col>
              <Col span={14}>
                <Form.Item
                  name="PawnDate"
                  label="典 当 期 限"
                  rules={[{ required: true, message: '请选择典当期限' }]}
                >
                  <RangePicker style={{width:'100%'}} disabled
                  disabledDate={(current)=>{return current && current <moment().subtract(1, "days")}} 
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={10}>
                <Form.Item
                  name="UserName"
                  label="当户姓名"
                >
                  <Input readOnly/>
                </Form.Item>
              </Col>
              <Col span={14}>
                <Form.Item
                  name="UserID"
                  label="当户证件号"
                >
                  <Input readOnly/>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="detail"
                  label="当单详情"
                >
                  <p style={{margin:'0 auto', color:'orange'}}>&nbsp;&nbsp;当物数量 : {this.state.Quantity}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;总当价 : {this.state.TotalPrice}</p>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="PTNotes"
                  label="当单标注"
                >
                  <Input.TextArea readOnly rows={2} placeholder="无" />
                </Form.Item>
              </Col>
            </Row>
            {
              EndDate<nowDate?
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="Interest"
                    label="&nbsp;&nbsp;注&nbsp;&nbsp;&nbsp;意&nbsp;&nbsp;"
                  >
                    <p>已逾期<span style={{margin:'0 10px',color:'red',fontSize:18,fontWeight:'bold'}}>{moment(nowDate).diff(EndDate, 'day')}</span>天</p>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="OverdueFare"
                    label="逾&nbsp;期&nbsp;费"
                  >
                    <InputNumber style={{width:'100%'}} prefix="￥" min="0" step="1.00" onChange={(e)=>{this.setState({OverdueFare:e});}}/>
                  </Form.Item>
                </Col>
              </Row>:''
            }
          </Form>
        </Modal>
      </div>
    )
  }
}
