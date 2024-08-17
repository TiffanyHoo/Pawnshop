import React, { Component, useContext, useState, useEffect, useRef } from 'react'
import { Breadcrumb, Table, Input, Button, Popconfirm, Form, Drawer, Col, Row, Select, DatePicker, Space, Tooltip, notification, Switch } from 'antd'
import axios from 'axios'
import Qs from 'qs'
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


export default class ExpertInfo extends Component {
  constructor(props) {
    super(props);

    //ExpertID,ExpertName,Identification,TechQCcode,ResearchField,Address,Phone,Email,Wechat,AuditState

    this.columns = [
      {
        title: '操作',
        dataIndex: 'operation',
        width: '160px',
        render: (_, record) =>
          this.state.dataSource.length >= 1 ? (
            <div>
              服务权限 : <Switch checked={record.AuditState==='1'?true:false} onChange={(e)=>this.handleAuditState(e,record.ExpertID)}/>
              <br />
              <Popconfirm title="确认初始化密码吗?" onConfirm={() => this.initialPwd(record)}>
                <a>初始化密码</a>
              </Popconfirm>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Popconfirm title="确认删除专家吗?" onConfirm={() => this.delMember(record)}>
                <a>删除</a>
              </Popconfirm>
            </div>
          ) : null
      },
      {
        title: '专家编号',
        dataIndex: 'ExpertID',
        key: 'ExpertID',
        editable: false,
        width: '90px'
      },
      {
        title: '姓名',
        dataIndex: 'ExpertName',
        key: 'ExpertName',
        width: '10%'
      },
      {
        title: '研究领域',
        dataIndex: 'ResearchField',
        key: 'ResearchField',
        width: '10%'
      },
      {
        title: '专业资格证书编号',
        dataIndex: 'TechQCcode',
        key: 'TechQCcode'
      },
      {
        title: '身份证号码',
        dataIndex: 'Identification',
        key: 'Identification',
        width: '180px'
      },
      {
        title: '地址',
        dataIndex: 'Address',
        key: 'Address',
        width: '12%',
        ellipsis: {
          showTitle: false,
        },
        render: Address => (
          <Tooltip placement="topLeft" title={Address}>
            {Address}
          </Tooltip>
        ),
      },
      {
        title: '联系电话',
        dataIndex: 'Phone',
        key: 'Phone'
      }
    ];

    this.state = {
      visible: false ,
      dataSource: [],
      count: 0,
      ExpertID: '',
      ExpertName: '',
      Identification: '',
      TechQCcode: '',
      ResearchField: '',
      Address: '',
      Phone: '',
      Email: '',
      Wechat: '',
      AuditState: '',
      DrawerTitle:'新增专家'
    };
  }

  componentDidMount(){
    this.getData()
  }

  formRef = React.createRef()

  getData = async () => {
    let dataSource = []
    await axios.get('/getExperts').then(response=>{
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

  //初始化密码
  initialPwd = (record) =>{
    let data = {
      id: record.ExpertID,
      usertype: 'Expert'
    }

    axios({
      method: 'post',
      url: 'http://localhost:3000/initialPwd',
      data: Qs.stringify(data)
    }).then(response=>{
      notification.open({
        message: '消息',
        description:
          <div style={{whiteSpace: 'pre-wrap'}}>
            {record.ExpertID}&nbsp;{record.ExpertName}&nbsp;已成功初始化密码
            <br/>
            初始密码为123456
          </div>,
        icon: <SmileOutlined style={{color:'orange'}}/>,
        duration: 2
      });
    }).catch(error=>{
      console.log(error);
    });
  }

  //删除人员
  delMember = (record) => {
    let data = {
      id: record.ExpertID,
      usertype: 'Expert'
    }

    axios({
      method: 'post',
      url: 'http://localhost:3000/delMember',
      data: Qs.stringify(data)
    }).then(response=>{
      if(response.data!==''){
        notification['error']({
          message: '注意',
          description: response.data,
          duration: 2
        });
      }else{
        notification['warning']({
          message: '消息',
          description:
          <p>已删除专家&nbsp;{record.ExpertID}&nbsp;{record.ExpertName}</p>,
        });
      }
      this.getData();
    }).catch(error=>{
      console.log(error);
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

  handleEID = (e) =>{
    this.setState({
      ExpertID: e.target.value
    })
  }

  handleName = (e) =>{
    this.setState({
      ExpertName: e.target.value
    })
  }

  handleRSF = (e) =>{
    this.setState({
      ResearchField: e.target.value
    })
  }

  handleTQCcode = (e) =>{
    this.setState({
      TechQCcode: e.target.value
    })
  }

  handleID = (e) =>{
    this.setState({
      Identification: e.target.value
    })
  }

  handlePhone = (e) =>{
    this.setState({
      Phone: e.target.value
    })
  }

  handleAddress = (e) =>{
    this.setState({
      Address: e.target.value
    })
  }

  handleEmail = (e) =>{
    this.setState({
      Email: e.target.value
    })
  }

  handleWechat = (e) =>{
    this.setState({
      Wechat: e.target.value
    })
  }

  handleAuditState = (e,ExpertID) =>{
    const { Identification,TechQCcode,ResearchField,Address,Phone,Email,Wechat } = this.state;

    let data = {}
    if(e){
      data = {
        ExpertID,ExpertName:"",Identification,TechQCcode,ResearchField,Address,Phone,Email,Wechat,AuditState:1
      }
    }else{
      data = {
        ExpertID,ExpertName:"",Identification,TechQCcode,ResearchField,Address,Phone,Email,Wechat,AuditState:0
      }
    }

    axios({
      method: 'post',
      url: 'http://localhost:3000/modExpert',
      data: Qs.stringify(data)
    }).then(response=>{
      if(response.data!==''){
        notification['error']({
          message: '注意',
          description: response.data,
          duration: 2
        });
      }else{
        notification['success']({
          message: '消息',
          description:e?<div style={{whiteSpace: 'pre-wrap'}}>已开启{this.state.ExpertID}专家的服务权限</div>:
          <div style={{whiteSpace: 'pre-wrap'}}>已关闭{this.state.ExpertID}专家的服务权限</div>,
          duration: 2
        });
      }
      this.getData();
    }).catch(error=>{
      console.log(error);
      notification['error']({
        message: '注意',
        description: '出错啦!!!',
        duration: 2
      });
    });
    
  }

  showDrawer = () => {
    this.setState({
      ExpertID: '',
      ExpertName: '',
      Identification: '',
      TechQCcode: '',
      ResearchField: '',
      Address: '',
      Phone: '',
      Email: '',
      Wechat: '',
      AuditState: '',
      DrawerTitle: '新增专家',
      visible: true
    });
    setTimeout(() => {
      this.formRef.current.resetFields()
    }, 200);
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
  };

  onSubmit = async () => {
    const { DrawerTitle,ExpertID,ExpertName,Identification,TechQCcode,ResearchField,Address,Phone,Email,Wechat,AuditState } = this.state;

    if(ExpertID===''||ExpertName===''||Identification===''||TechQCcode===''||ResearchField===''||Phone===''){
      notification['error']({
        message: '注意',
        description:'有必填字段未填写!',
        duration: 2
      });
      return;
    }

    let data = {
      ExpertID,ExpertName,Identification,TechQCcode,ResearchField,Address,Phone,Email,Wechat,AuditState
    }

    if(DrawerTitle === '新增专家'){
      axios({
        method: 'post',
        url: 'http://localhost:3000/addExpert',
        data: Qs.stringify(data)
      }).then(response=>{
        if(response.data!==''){
          notification['error']({
            message: '注意',
            description: response.data,
            duration: 2
          });
        }else{
          notification['success']({
            message: '消息',
            description:<div style={{whiteSpace: 'pre-wrap'}}>已成功添加专家{ExpertID}<br/>初始密码为123456</div>,
            duration: 2
          });
        }
        this.getData();
      }).catch(error=>{
        console.log(error);
        notification['error']({
          message: '注意',
          description: '出错啦!!!',
          duration: 2
        });
      });
    }else if(DrawerTitle === '编辑专家信息'){
      axios({
        method: 'post',
        url: 'http://localhost:3000/modExpert',
        data: Qs.stringify(data)
      }).then(response=>{
        if(response.data!==''){
          notification['error']({
            message: '注意',
            description: response.data,
            duration: 2
          });
        }else{
          notification['success']({
            message: '消息',
            description:<div style={{whiteSpace: 'pre-wrap'}}>已成功修改{ExpertID}专家信息</div>,
            duration: 2
          });
        }
        this.getData();
      }).catch(error=>{
        console.log(error);
        notification['error']({
          message: '注意',
          description: '出错啦!!!',
          duration: 2
        });
      });
    }

    this.onClose();

  };

  render() {
    const { dataSource, ExpertID, ExpertName, Identification, TechQCcode, ResearchField, Address, Phone, Email, Wechat, AuditState } = this.state;
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
        <Breadcrumb style={{ margin: '10px 0' }}>
          <Breadcrumb.Item>信息管理</Breadcrumb.Item>
          <Breadcrumb.Item>专家信息管理</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: 10 }}>
          <Button type="primary" onClick={this.showDrawer} icon={<PlusOutlined />} style={{marginBottom: 16}}>
            新增专家
          </Button>
          <Table
            components={components}
            rowClassName={() => 'editable-row'}
            bordered
            dataSource={dataSource}
            columns={columns}
            pagination={{ pageSize: 5 }}
            onRow={record => {
              return {
                onDoubleClick: event => {
                  const { ExpertID,ExpertName,Identification,TechQCcode,ResearchField,Address,Phone,Email,Wechat,AuditState } = record
                  this.setState({
                    ExpertID,ExpertName,Identification,TechQCcode,ResearchField,Address,Phone,Email,Wechat,AuditState,
                    DrawerTitle: '编辑专家信息',
                    visible: true
                  });
                  setTimeout(() => {
                    this.formRef.current.setFieldsValue({
                      ExpertID,ExpertName,Identification,TechQCcode,ResearchField,Address,Phone,Email,Wechat
                    })
                  }, 100); 
                },
              };
            }}
          />
        </div>

        <Drawer
          title={this.state.DrawerTitle}
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
          <Form layout="vertical" ref={this.formRef} >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="ExpertID"
                  label="专家编号"
                  rules={[{ required: true, message: '请输入专家编号' }]}
                >
                  <Input value={this.state.ExpertID} placeholder="请输入专家编号" onChange={this.handleEID} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="ExpertName"
                  label="姓名"
                  rules={[{ required: true, message: '请输入姓名' }]}
                >
                  <Input value={this.state.ExpertName} placeholder="请输入姓名" onChange={this.handleName} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="ResearchField"
                  label="研究领域"
                  rules={[{ required: true, message: '请输入研究领域' }]}
                >
                  <Input value={this.state.ResearchField} placeholder="请输入研究领域" onChange={this.handleRSF} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="TechQCcode"
                  label="专业资格证书编号"
                  rules={[{ required: true, message: '请输入专业资格证书编号' }]}
                >
                  <Input value={this.state.TechQCcode} placeholder="请输入专业资格证书编号" onChange={this.handleTQCcode} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="Identification"
                  label="身份证号码"
                  rules={[{ required: true, message: '请输入身份证号码' }]}
                >
                  <Input value={this.state.Identification} placeholder="请输入身份证号码" onChange={this.handleID} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="Phone"
                  label="联系电话"
                  rules={[{ required: true, message: '请输入联系电话' }]}
                >
                  <Input value={this.state.Phone} onChange={this.handlePhone} placeholder="请输入联系电话" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="Address"
                  label="详细住址"
                >
                  <Input.TextArea rows={3} value={this.state.Address} onChange={this.handleAddress} placeholder="请输入详细住址" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="Email"
                  label="邮箱地址"
                >
                  <Input value={this.state.Email} onChange={this.handleEmail} placeholder="请输入邮箱地址" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="Wechat"
                  label="微信号"
                >
                  <Input value={this.state.Wechat} onChange={this.handleWechat} placeholder="请输入微信号" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Drawer>
      </div>
    )
  }
}


