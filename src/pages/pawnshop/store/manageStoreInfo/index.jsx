import React, { Component, useContext, useState, useEffect, useRef } from 'react'
import { Breadcrumb, Table, Input, Button, Popconfirm, Form, Drawer, Col, Row, Select, Space, Modal, notification, Badge } from 'antd'
import axios from 'axios'
import store from '../../../../redux/store'
import '../../../../style/common.less'
//import 'antd/dist/antd.css';
import { PlusOutlined, SmileOutlined } from '@ant-design/icons';

const { Option } = Select;

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


export default class ManageStoreInfo extends Component {
  constructor(props) {
    super(props);
    //SDID,SHID,PIID,title,state,PSstaffIDin,inDate,PSstaffIDout,outDate,Notes

    this.columns = [
      {
        title: '当票编号',
        dataIndex: 'PTID',
        key: 'PTID',
        width: '108px',
        sorter: (a, b) => {
          var stringA = a.PTID.toUpperCase(); // ignore upper and lowercase
          var stringB = b.PTID.toUpperCase(); // ignore upper and lowercase
          if (stringA < stringB) 
            return -1;
          if (stringA > stringB) 
            return 1;
          return 0;
        }
      },
      {
        title: '当物编号',
        dataIndex: 'PIID',
        key: 'PIID',
        width: '90px'
      },
      {
        title: '当物状态',
        dataIndex: 'state',
        key: 'state',
        width: '90px',
        render: (_, record) =>
          record.state === "1" ? (
            <Badge color="gold" text="在当" />
          ) : record.state === "2" ? (
            <Badge color="volcano" text="绝当" />
          ) : record.state === "3" ? (
            <Badge color="green" text="在售" />
          ) : (
            <Badge color="yellow" text="售出" />
          )
      },
      {
        title: '存储编号',
        dataIndex: 'SDID',
        key: 'SDID',
        editable: false,
        width: '90px'
      },
      {
        title: '仓库编号',
        dataIndex: 'SHID',
        key: 'SHID',
        width: '90px'
      },
      {
        title: '入库时间',
        dataIndex: 'inDate',
        key: 'inDate'
      },
      {
        title: '入库人员',
        dataIndex: 'PSstaffIDin',
        key: 'PSstaffIDin',
        width: '90px'
      },
      {
        title: '出库时间',
        dataIndex: 'outDate',
        key: 'outDate'
      },
      {
        title: '出库人员',
        dataIndex: 'PSstaffIDout',
        key: 'PSstaffIDout',
        width: '90px'
      },
      {
        title: '操作',
        dataIndex: 'operation',
        width: '108px',
        render: (_, record) =>
          this.state.dataSource.length >= 1 ? (
            <div>
              <Popconfirm title="确认入库" onConfirm={() => this.handlePass(record.key)}>
                <a>入库</a>
              </Popconfirm>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Popconfirm title="确认出库?" onConfirm={() => this.handleNotPass(record.key)}>
                <a>出库</a>
              </Popconfirm>
            </div>  
          ) : null,
      },
    ];

    this.state = {
      isModalVisible: false,
      visible: false ,
      DrawerTitle: '新增仓库',
      dataSource: [],
      count: 0,
      SDID: '',
      SHID: '',
      PTID: '',
      PIID: '',
      title: '',
      Specification: '',
      Documents: '',
      state: '',
      PSstaffIDin: '',
      inDate: '',
      PSstaffIDout: '',
      outDate: '',
      Notes: ''
    };
  }

  componentDidMount(){
    this.getData()
  }

  getData = async () => {
    let dataSource = []

    await axios.get('/getStoreDetail',{
      params:{
        id: store.getState().PSID,
      }
    }).then(response=>{
        if(response.data.length === 0){
          console.log('无数据')
        }else{
          dataSource = response.data
          console.log(dataSource)
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

  handleGender = (e) =>{
    this.setState({
      Gender: e
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

  handleEmail = (e) =>{
    this.setState({
      Email: e.target.value
    })
  }

  handleNotes = (e) =>{
    this.setState({
      Notes: e.target.value
    })
  }


  showDrawer = () => {
    this.setState({
      visible: true,
      DrawerTitle: '新增仓库'
    });
  };

  onClose = () => {
    this.setState({
      visible: false,
      ComMemID: '',
      ComMemName: '',
      Gender: '',
      BirthDate: '',
      Address: '',
      Phone: '',
      Email: '',
      Notes: ''
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

  showModal = () => {
    this.setState({isModalVisible:true})
  };

  handleOk = () => {
    alert(111)
    this.setState({isModalVisible:false})
  };

  handleCancel = () => {
    this.setState({isModalVisible:false})
  };

  render() {
    const { isModalVisible,dataSource,DrawerTitle,SHID,Address,Area,CanBulkObj,CanVehicle,Sedan,Motorbike,IsFull,PSstaffID,Notes } = this.state;
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

    return (
      <div>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>信息管理</Breadcrumb.Item>
          <Breadcrumb.Item>仓库存放管理</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: 10 }}>
          <Table
            components={components}
            rowClassName={() => 'editable-row'}
            bordered
            dataSource={dataSource}
            columns={columns}
            pagination={{ pageSize: 5 }}
            expandable={{
              expandedRowRender: record => <p style={{ margin: 0 }}>当物品类: {record.title}<br/>规格: {record.Specification}<br/>附件: {record.Documents}</p>,
              rowExpandable: record => record.title !== '' || record.Specification !== '' || record.Documents !== '',
            }}
            onRow={record => {
              return {
                onDoubleClick: event => {
                  const { SDID,SHID,PIID,title,Specification,Documents,state,PSstaffIDin,inDate,PSstaffIDout,outDate,Notes } = record
                  this.setState({
                    SDID,SHID,PIID,title,Specification,Documents,state,PSstaffIDin,inDate,PSstaffIDout,outDate,Notes,
                    DrawerTitle: '编辑仓库信息',
                    visible: true
                  });
                },
              };
            }}
          />
        </div>
        <Drawer
          title={DrawerTitle}
          width={720}
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
          initialValues={{SHID,Address,Area,CanBulkObj,CanVehicle,Sedan,Motorbike,IsFull,PSstaffID,Notes}}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="SDID"
                  label="仓库编号"
                  rules={[{ required: true, message: '请输入仓库编号' }]}
                >
                  <Input placeholder="请输入仓库编号" onChange={this.handleSHID} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="Area"
                  label="面积"
                  rules={[{ required: true, message: '请输入面积' }]}
                >
                  <Input value={Area} placeholder="请输入面积" onChange={this.handleArea} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="Address"
                  label="详细地址"
                  rules={[{ required: true, message: '请输入详细地址' }]}
                >
                  <Input.TextArea rows={3} value={Address} onChange={this.handleAddress} placeholder="请输入详细地址" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="CanBulkObj"
                  label="大宗物件存放"
                  rules={[{ required: true, message: '请选择是否可存放大宗物件' }]}
                >
                  <Select value={CanBulkObj} onChange={this.handleCanBulkObj} placeholder="请选择是否可放置大宗物件">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="CanVehicle"
                  label="车辆存放"
                  rules={[{ required: true, message: '请选择是否可存放车辆' }]}
                >
                  <Select value={CanBulkObj} onChange={this.handleCanBulkObj} placeholder="请选择是否可放置大宗物件">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </Select>                
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="Sedan"
                  label="小轿车"
                  rules={[{ required: true, message: '请输入小轿车可存放数量' }]}
                >
                  <Input value={Sedan} placeholder="请输入小轿车可存放数量" onChange={this.handleSedan} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="Motorbike"
                  label="摩托车"
                  rules={[{ required: true, message: '请输入摩托车可存放数量' }]}
                >
                  <Input value={Motorbike} placeholder="请输入摩托车可存放数量" onChange={this.handleMotorbike} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="IsFull"
                  label="满仓"
                  rules={[{ required: true, message: '请选择是否已满仓' }]}
                >
                  <Select value={IsFull} onChange={this.handleIsFull} placeholder="请选择是否已满仓">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="PSstaffID"
                  label="仓库管理人"
                  rules={[{ required: true, message: '请选择仓库管理人' }]}
                >
                  <Input value={PSstaffID} placeholder="请选择仓库管理人" onChange={this.handlePSstaffID} />              
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="Notes"
                  label="备注"
                  rules={[{required: true,message: '请输入备注'},]}
                >
                  <Input.TextArea rows={3} value={Notes} onChange={this.handleNotes} placeholder="请输入备注" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Drawer>
        <Modal title="Basic Modal" visible={isModalVisible} onOk={this.handleOk} onCancel={this.handleCancel}>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Modal>
      </div>
    )
  }
}
