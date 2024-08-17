import React, { Component, useContext, useState, useEffect, useRef } from 'react'
import ReactDOM from "react-dom"
import { Breadcrumb, Table, Input, InputNumber, Button, Popconfirm, Form, Drawer, Col, Row, Select, DatePicker, Space, Tooltip, notification, Modal, Tag, Badge, Image, message } from 'antd'
import axios from 'axios'
import Qs from 'qs'
import store from '../../../../redux/store'
import '../../../../style/common.less'
//import 'antd/dist/antd.css';
import { PlusOutlined, SmileOutlined, DownOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;
const { CheckableTag } = Tag;
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


export default class ManagePawn extends Component {
  constructor(props) {
    super(props);

    this.columns = [
      {
        title: '操作',
        dataIndex: 'operation',
        width: '90px',
        render: (_, record) =>
          this.state.dataSource.length >= 1 ? (
            <div>
              <Popconfirm title="确认通知吗？" onConfirm={() => this.handleNotification(record)}>
                <a>通知</a>
              </Popconfirm>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Popconfirm title="确认删除吗？" onConfirm={() => this.handleDelete(record.key)}>
                <a>删除</a>
              </Popconfirm>
            </div>
          ) : null
      },
      {
        title: '当票编号',
        dataIndex: 'PTID',
        key: 'PTID',
        width: '100px'
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
        width: '80px',
      },
      {
        title: '总费用',
        dataIndex: 'Total',
        key: 'Total',
        width: '90px'
      },
      {
        title: '总当价',
        dataIndex: 'TotalPrice',
        key: 'TotalPrice',
        width: '100px'
      },
      {
        title: '状态',
        dataIndex: 'state',
        key: 'state',
        width: '90px',
        filters: [
            {text: '已建当',value: '1'},
            {text: '已续当',value: '2'},
            {text: '已赎当',value: '3'},
            {text: '已绝当',value: '4'},
        ],
        onFilter: (value, record) => record.state === value,
        render: (_, record) =>
          record.state === "1" ? (
              <Badge color="green" text="已建当" />
          ) : record.state === "2" ? (
              <Badge color="blue" text="已续当" />
          ) : record.state === "3" ? (
              <Badge color="orange" text="已赎当" />
          ) : <Badge color="volcano" text="已绝当" />
      }
    ];

    this.state = {
      ImageVisible: false,
      visible: false,
      visible_modal: false,
      childrenDrawer: false,
      isModalVisible: false,
      SpeDetailArr: [],
      DocDetailArr: [],
      SpecificationArr: [],
      SpecificationData: {},
      DocumentsArr: [],
      selectedTags: [],
      dataSource: [],
      dataSource1: [],
      expandedRowKeys: [],
      count: 0,
      TotalPrice: 0,
      Quantity: 0,
      PTID: '',
      UserID: '',
      UserName: '',
      Gender: '',
      Address: '',
      Phone: '',
      Email: '',
      Wechat: '',
      StartDate: '',
      EndDate: '',
      PSstaffIDA: '',
      PSstaffIDB: '',
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
      Delivery: '',
      SpeDetail: '',
      DocDetail: '',
      pawnshop:{},

      Content:'',
      PubType:''
    };
  }

  formRef = React.createRef();
  formRef2 = React.createRef();
  
  componentDidMount(){
    this.getData()
    this.getPS()
  }

  getData = async () => {
    const {PSID} = store.getState()
    let dataSource = []
    await axios.get('/getPawnticket',{
      params:{
        id: PSID
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

  getPS = async () => {
    var that = this;
    const {PSID} = store.getState()
    await axios.get('/getPawnshop',{
      params:{
        id: PSID
      }
    }).then(response=>{
      that.setState({
        pawnshop:response.data[0]
      })
    });

  }

  getDetail = async (PTID) => {
    let dataSource1 = []
    await axios.get('/getPawnItems',{
      params:{
        PTID
      }
    }).then(response=>{
        if(response.data.length === 0){
          console.log('无数据')
        }else{
          dataSource1 = response.data
          console.log(dataSource1)
        }
    }).catch(error=>{
        console.log(error);
    });

    dataSource1 = dataSource1.map((obj,index) => {
      return {
        ...obj,
        key: PTID+obj.PIID,
        images: obj.photopath.split(";")
      };
    });
    this.setState({
      dataSource1
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
//PIID,CID,title,Specification,Documents,photopath,canDistribute,SpeDetail,DocDetail
  expandedRowRender = (record) => {       
    const columns1 = [
      {
        title: '当品编号',
        dataIndex: 'PIID',
        key: 'PIID',
        editable: false,
        width: '15%'
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
        key: 'Documents'
      },
      {
        title: '当价(单件)',
        dataIndex: 'Amount',
        key: 'Amount',
        width: '10%'
      },
      {
        title: '数量',
        dataIndex: 'Quantity',
        key: 'Quantity',
        width: '10%'
      }
    ];

    return (
      <div style={{maxHeight:'150px',overflow:'auto'}}>
        <Table columns={columns1} dataSource={this.state.dataSource1} pagination={false} />
      </div>
    )
  };

  handleEditDetail = (data,record) =>{
    console.log(record)
  }

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

  handleUserName = (e) =>{
    this.setState({
      UserName: e.target.value
    })
  }

  handleUserID = (e) =>{
    this.setState({
      UserID: e.target.value
    })
  }

  handleGender = (e) =>{
    this.setState({
      Gender: e
    })
  }

  handlePhone = (e) =>{
    this.setState({
      Phone: e.target.value
    })
  }

  handleWechat = (e) =>{
    this.setState({
      Wechat: e.target.value
    })
  }

  handleEmail = (e) =>{
    this.setState({
      Email: e.target.value
    })
  }

  handleAddress = (e) =>{
    this.setState({
      Address: e.target.value
    })
  }

  handleTagsChange(tag, checked) {
    const { selectedTags } = this.state;
    const nextSelectedTags = checked ? [...selectedTags, tag] : selectedTags.filter(t => t !== tag);
    this.setState({ selectedTags: nextSelectedTags });
  }

  showDrawer = () => {
    this.setState({
      visible: true,
      TotalPrice: 0,
      Quantity: 0
    });
    this.formRef.current.setFieldsValue({
      UserID: '',
      UserName: '',
      Gender: '',
      Address: '',
      Phone: '',
      Email: '',
      Wechat: ''
    })
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

  showChildrenDrawer = (key) => {
    let selectedTags = [];
    const ChildrenDrawerData =this.state.dataSource1.find(function (obj) {
          return obj.key === key;
    })
    const SpeDetailArr = ChildrenDrawerData.SpeDetail.split(";")
    const SpecificationArr = ChildrenDrawerData.Specification.split(";")
    let SpecificationData = {}
    SpeDetailArr.map((obj)=>{
      SpecificationArr.map((obj1)=>{
        obj1 = obj1.split(":")
        if(obj1[0] === obj){
          SpecificationData[obj] = obj1[1]
        }
      });
    })
    const DocDetailArr = ChildrenDrawerData.DocDetail.split(";")
    const DocumentsArr = ChildrenDrawerData.Documents.split(";")
    selectedTags = DocumentsArr
    this.setState({
      ChildrenDrawerData,SpeDetailArr,DocDetailArr,SpecificationArr,DocumentsArr,SpecificationData,selectedTags,
      childrenDrawer:true
    })
  };

  // printTicket = async () => {
  //   const {PSID,PSName,SocCreCode} = this.state.pawnshop
  //   const {PTID,UserID,UserName,Address,Phone,StartDate,EndDate,PSstaffIDA,PSstaffIDB,Notes,Quantity,TotalPrice} = this.state;
  //   let i=0;
  //   let m=[];
    
  //   let data = {
  //     pageno:1,
	//     pagesize:0, //输出全部
	//     filter:'',
	// 	  sqlprocedure:'studenttopic_grid',
	// 	  studentid:'',
	// 	  usertype:'s',
	// 	  style:'table', //form;
	// 	  headerrows:9,
	// 	  nodetype:'datagrid',
	// 	  header:'学生选题信息表',
	// 	  date:'2021年3月份',
	// 	  username:'',
	// 	  image1:'/system/images/building2_big.jpg',
	// 	  template:'tstudenttopic.xls',
	// 	  action:'_exportexcel',
	// 	  exporttopdf:0, //同时生成pdf出文件
  //   }
  //   console.log(JSON.stringify(data))

  //   await axios({
  //     method: 'post',
  //     url: 'http://localhost:3000/doEvents',
  //       header:{
  //           'Content-Type':'application/json'  //如果写成contentType会报错
  //       },
  //       data: Qs.stringify(data)
  //   });

  // };


  //导出excel
  exportExcel = filename => {
    const linkElement = document.createElement('a');
    linkElement .style.display = 'none';
    linkElement .href = 'http://localhost:8080/myDemo/system/temp/'+filename+'.xls';
    document.body.appendChild(linkElement);
    linkElement .click();
    document.body.removeChild(linkElement);
  };

  //导出pdf
  exportPdf = filename => {
    const linkElement = document.createElement('a');
    linkElement.style.display = 'none';
    linkElement.href = 'http://localhost:8080/myDemo/system/temp/'+filename+'.pdf';
    linkElement.target = '_blank';
    document.body.appendChild(linkElement);
    linkElement .click();
    document.body.removeChild(linkElement);
  };

  printTicket = async () => {
    var that = this
    const {PSID,PSName,SocCreCode} = this.state.pawnshop
    const {PTID,UserID,UserName,Address,Phone,StartDate,EndDate,PSstaffIDA,PSstaffIDB,Notes,Quantity,TotalPrice,Total} = this.state;
    let i=0;
    let m=[];
    
    let data = {
      PSID,PSName,SocCreCode,PTID,
      PSAddress:store.getState().Address,
      PSPhone:store.getState().Phone,
      UserID,UserName,StartDate,EndDate,PSstaffIDA,PSstaffIDB,
      Notes:Notes?Notes:'无',Quantity,
      UserAddress:Address,
      UserPhone:Phone,
      TotalPrice:TotalPrice,
      Fare:Total,
      Payment: TotalPrice*1.0-Total*1.0,
      
      exporttopdf: 0,
      image1: "/system/images/building3_big.jpg",
      sysrowno: "2",
      template: "pawnticket.xls",
      _editable: "1",
      headerrows:9,
    }
    // console.log(JSON.stringify(data))

    await axios({
      method: 'post',
      url: 'http://localhost:3000/doExcel',
        header:{
            'Content-Type':'application/json'  //如果写成contentType会报错
        },
        data: Qs.stringify(data)
    }).then(response=>{
      const {filename} = response.data
      this.exportExcel(filename)
      this.exportPdf(filename)
      notification.open({
        message: 'Notification',
        description:
          <div style={{whiteSpace: 'pre-wrap'}}>已成功打印，票据保存在C:\apache-tomcat-8.0.32\webapps\myDemo\system\temp</div>,
        icon: <SmileOutlined style={{color:'orange'}}/>,
        duration: 2
      });
    });

  };

  handleNotification = (record) => {
    const {PTID,UserID,UserName,Gender} = record
    this.setState({
      isModalVisible:true,
      PTID,UserID,UserName,Gender
    })
  }

  handleCancel = () => {
    this.setState({isModalVisible:false,PTID:'',Content:''})
  }

  InsertInfo = () => {
    const {PubType,UserName,Gender,PTID} = this.state
    if(PubType===""){
      message.warning("请先选择通知类型")
      return
    }
    let Content = ''
    const GenderText = Gender==='0'?'先生':'女士'
    if(PubType==="到期提醒"){
      Content = '尊敬的'+UserName+GenderText+'，您在'+store.getState().PSName+'的当单('+PTID+')已到期，请尽快赎回。如有特殊情况，请联系'+store.getState().PSPhone+',感谢您的配合~'
    }else if(PubType==="售出提醒"){
      Content = '尊敬的'+UserName+GenderText+'，您在'+store.getState().PSName+'的到期当单('+PTID+')已售出，不再支持赎回，特此提醒。'
    }else{
      Content = '尊敬的'+UserName+GenderText+'，您在'+store.getState().PSName+'的当单('+PTID+')         ，特此提醒。'
    }
    this.setState({
      Content
    })
  }

  pubNotification = () => {
    var that = this
    const {PubType,UserID,PTID,Content} = this.state
    var timestamp=new Date().getTime()
    const PubDate = moment(new Date()).format('YYYY-MM-DD')

    let data = {
      PubID: timestamp,
      Publisher: store.getState().PSID,
      PubType,PTID,Content,PubDate,
      Receiver: UserID
    }

    axios({
      method: 'post',
      url: 'http://localhost:3000/Notification',
      data: Qs.stringify(data)
    }).then(response=>{
      notification.open({
        message: '消息',
        description:
          <div style={{whiteSpace: 'pre-wrap'}}>
            已成功发送通知给当户~
          </div>,
        icon: <SmileOutlined style={{color:'orange'}}/>,
        duration: 2
      });
      that.handleCancel()
    });
  }

  render() {
    const { ImageVisible,expandedRowKeys,dataSource,dataSource1,SpeDetailArr,DocDetailArr,SpecificationArr,SpecificationData,DocumentsArr,selectedTags,PIID,CID,UserID,UserName,Gender,Address,Phone,Email,Wechat,PSID,Specification,Documents,photopath,state,PriceOnSale,canDistribute,title,SpeDetail,DocDetail,PTID,Quantity,TotalPrice,PSstaffIDA,Notes,StartDate,EndDate} = this.state;    
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
        <Breadcrumb style={{ margin: '10px 0' }}>
          <Breadcrumb.Item>典当管理</Breadcrumb.Item>
          <Breadcrumb.Item>当单信息管理</Breadcrumb.Item>
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
                  console.log(this.state.pawnshop)
                  const { PTID,UserID,UserName,Gender,Address,Phone,Email,Wechat,StartDate,EndDate,PSstaffIDA,PSstaffIDB,Notes,Quantity,TotalPrice,Interest,StoreFare,OverdueFare,FreightFare,AuthenticateFare,AssessFare,NotaryFare,InsuranceFare,OtherFare,Total,ENotes } = record
                  this.getDetail(PTID)
                  this.setState({
                    PTID,UserID,UserName,Gender,Address,Phone,Email,Wechat,StartDate,EndDate,PSstaffIDA,PSstaffIDB,Notes,Quantity,TotalPrice,Interest,StoreFare,OverdueFare,FreightFare,AuthenticateFare,AssessFare,NotaryFare,InsuranceFare,OtherFare,Total,ENotes,
                    visible: true
                  });
                  setTimeout(() => {
                    this.formRef.current.setFieldsValue({
                      PTID,PawnDate:[moment(StartDate), moment(EndDate)],PSstaffIDA,PSstaffIDB,Notes,Quantity,TotalPrice,
                      UserID,UserName,Gender:Gender==='0'?'男':'女',Address,Phone,Email,Wechat,Interest,StoreFare,OverdueFare,FreightFare,AuthenticateFare,AssessFare,NotaryFare,InsuranceFare,OtherFare,Total,ENotes
                    })
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
              <Button onClick={this.printTicket} type="primary">打印</Button>
            </Space>
          }
        >
          <Form layout="horizontal" ref={this.formRef} hideRequiredMark
          initialValues={{PTID,UserID,UserName,Gender,Address,Phone,Email,Wechat,StartDate,EndDate,PSstaffIDA,Notes,Quantity,TotalPrice}}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="PTID"
                  label="当票编号"
                >
                  <Input onChange={this.handlePTID} />
                </Form.Item>
              </Col>
              <Col span={16}>
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
              <Col span={10}>
                <Form.Item
                  name="UserID"
                  label="当户证件号"
                >
                  <Input readOnly onPressEnter={this.searchUserInfo}/>
                </Form.Item>
              </Col>
              <Col span={7}>
                <Form.Item
                  name="UserName"
                  label="当户姓名"
                >
                <Input readOnly />
                </Form.Item>
              </Col>
              <Col span={7}>
                <Form.Item
                name="Gender"
                label="性&nbsp;&nbsp;&nbsp;&nbsp;别"
                >
                  <Input readOnly />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={10}>
                <Form.Item
                  name="Email"
                  label="邮 箱 地 址"
                >
                  <Input readOnly value={this.state.Email}/>
                </Form.Item>
              </Col>
              <Col span={7}>
                <Form.Item
                  name="Phone"
                  label="联系电话"
                >
                  <Input readOnly value={this.state.Phone} />
                </Form.Item>
              </Col>
              <Col span={7}>
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
                  label="详 细 住 址"
                >
                  <Input readOnly value={this.state.Address}/>
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
                  <p>当物数量 : {this.state.Quantity}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;总当价 :<span style={{color:'orange'}}>{this.state.TotalPrice}</span></p>
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
                      <Space size={10} align='start' style={{display:'flex',marginRight:'50px'}}>
                        <Image
                        preview={{visible:false}}
                        width={100}
                        src={images[0]?images[0]:'https://ww1.sinaimg.cn/large/007rAy9hgy1g24by9t530j30i20i2glm.jpg'}
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
                            <p>当品编号 : {PIID}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;名称 : {title}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;类别 : {title}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;数量 : {Quantity}</p>
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
                >
                  <Input value={this.state.Notes} onChange={this.handleNotes} placeholder="无" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="PSstaffIDA"
                  label="经&nbsp;&nbsp;办&nbsp;&nbsp;人"
                >
                  <Input onChange={this.handlePSstaffIDA} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="PSstaffIDB"
                  label="复&nbsp;&nbsp;核&nbsp;&nbsp;人"
                >
                  <Input onChange={this.handlePSstaffIDB} />
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
                  <InputNumber style={{width:'100%'}} prefix="￥" min="0" step="1.00" onChange={(e)=>{this.setState({Interest:e});this.handleFare();}}/>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="StoreFare"
                  label="仓管费"
                >
                  <InputNumber style={{width:'100%'}} prefix="￥" min="0" step="1.00" onChange={(e)=>{this.setState({StoreFare:e});this.handleFare();}}/>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="OverdueFare"
                  label="逾期费"
                >
                  <InputNumber style={{width:'100%'}} prefix="￥" min="0" step="1.00" onChange={(e)=>{this.setState({OverdueFare:e});this.handleFare();}}/>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="FreightFare"
                  label="物流费"
                >
                  <InputNumber style={{width:'100%'}} prefix="￥" min="0" step="1.00" onChange={(e)=>{this.setState({FreightFare:e});this.handleFare();}}/>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="AuthenticateFare"
                  label="鉴定费"
                >
                  <InputNumber style={{width:'100%'}} prefix="￥" min="0" step="1.00" onChange={(e)=>{this.setState({AuthenticateFare:e});this.handleFare();}}/>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="AssessFare"
                  label="估价费"
                >
                  <InputNumber style={{width:'100%'}} prefix="￥" min="0" step="1.00" onChange={(e)=>{this.setState({AssessFare:e});this.handleFare();}}/>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="NotaryFare"
                  label="公证费"
                >
                  <InputNumber style={{width:'100%'}} prefix="￥" min="0" step="1.00" onChange={(e)=>{this.setState({NotaryFare:e});this.handleFare();}}/>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="InsuranceFare"
                  label="保险费"
                >
                  <InputNumber style={{width:'100%'}} prefix="￥" min="0" step="1.00" onChange={(e)=>{this.setState({InsuranceFare:e});this.handleFare();}}/>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="OtherFare"
                  label="其他费"
                >
                  <InputNumber style={{width:'100%'}} prefix="￥" min="0" step="1.00" onChange={(e)=>{this.setState({OtherFare:e});this.handleFare();}}/>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="ENotes"
                  label="费用备注"
                >
                  <Input onChange={(e)=>this.setState({ENotes:e.target.value})} placeholder="无" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Drawer>

        <Modal
          visible={this.state.isModalVisible}
          title="通知内容"
          onCancel={this.handleCancel}
          onOk={this.pubNotification}
        >
          通知类型: 
          <Select onChange={(e)=>{this.setState({PubType:e})}} style={{width:'200px',margin:'0 0 10px 10px'}}>
            <Option value="到期提醒">到期提醒</Option>
            <Option value="售出提醒">售出提醒</Option>
            <Option value="普通提醒">普通提醒</Option>
          </Select>
          <Button type='primary' style={{marginLeft:'20px'}} onClick={this.InsertInfo}>快速录入</Button>
          <Input.TextArea value={this.state.Content} rows={3} onChange={(e)=>this.setState({Content:e.target.value})} placeholder="请输入提醒内容" />
        </Modal>
      </div>
    )
  }
}
