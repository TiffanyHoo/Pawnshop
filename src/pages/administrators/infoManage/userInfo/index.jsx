import React, { Component, useContext, useState, useEffect, useRef } from 'react'
import { Breadcrumb, Table, Input, Button, Popconfirm, Form, Drawer, Col, Row, Select, DatePicker, Space, Tooltip, notification, Upload, message, Modal } from 'antd'
import axios from 'axios'
import Qs from 'qs'
import moment from 'moment'
import '../../../../style/common.less'
//import 'antd/dist/antd.css';
import { PlusOutlined, SmileOutlined, LoadingOutlined } from '@ant-design/icons';

const { Option } = Select;

const normFile = (e) => {
  console.log('Upload event:', e);

  if (Array.isArray(e)) {
    return e;
  }

  return e && e.fileList;
};

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

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export default class UserInfo extends Component {
  constructor(props) {
    super(props);

    this.columns = [
      {
        title: '证件号',
        dataIndex: 'UserID',
        key: 'UserID',
        editable: false
      },
      {
        title: '姓名',
        dataIndex: 'UserName',
        key: 'UserName',
        width: '10%'
      },
      {
        title: '性别',
        dataIndex: 'GenderChar',
        key: 'GenderChar',
        width: '8%'
      },
      {
        title: '出生日期',
        dataIndex: 'BirthDate',
        key: 'BirthDate',
        width: '10%'
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
        key: 'Phone',
        width: '12%'
      },
      {
        title: '邮箱',
        dataIndex: 'Email',
        key: 'Email',
        width: '12%',
        ellipsis: {
          showTitle: false,
        },
        render: item => (
          <Tooltip placement="topLeft" title={item}>
            {item}
          </Tooltip>
        ),
      },
      {
        title: '操作',
        dataIndex: 'operation',
        width: '160px',
        render: (_, record) =>
          this.state.dataSource.length >= 1 ? (
            <div>
              <Popconfirm title="确认初始化密码吗?" onConfirm={() => this.initialPwd(record)}>
                <a>初始化密码</a>
              </Popconfirm>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Popconfirm title="确认删除用户吗?" onConfirm={() => this.delMember(record)}>
                <a>删除</a>
              </Popconfirm>
            </div>
          ) : null,
      },
    ];

    this.state = {
      previewVisible: false,
      previewImage: '',
      previewTitle: '',
      fileList: [],

      visible: false ,
      dataSource: [],
      count: 0,
      UserID: '',
      UserName: '',
      Gender: '',
      BirthDate: '',
      Address: '',
      JobState: '',
      Job: '',
      Company: '',
      Income: '',
      Phone: '',
      Email: '',   
      Wechat: '',
      IDcardFront: '',
      IDcardBack: '',
      AuditState: '',
      DrawerTitle: '新增用户'
    };
  }

  componentDidMount(){
    this.getData()
  }

  formRef = React.createRef()

  getData = async () => {
    let dataSource = []
    await axios.get('/getUsers').then(response=>{
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
        key: index,
        GenderChar:obj.Gender==='0'?'男':'女'
      };
    });

    this.setState({
      dataSource,
      count: dataSource.length
    })
  }

  beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  }

  //初始化密码
  initialPwd = (record) =>{
    let data = {
      id: record.UserID,
      usertype: 'User'
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
            {record.UserID}&nbsp;{record.UserName}&nbsp;已成功初始化密码
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
      id: record.UserID,
      usertype: 'User'
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
          <p>已删除用户&nbsp;{record.UserID}&nbsp;{record.UserName}</p>,
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

  handleID = (e) =>{
    this.setState({
      UserID: e.target.value
    })
  }

  handleName = (e) =>{
    this.setState({
      UserName: e.target.value
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

  showDrawer = () => {
    this.setState({
      fileList: [],
      UserID: '',
      UserName: '',
      Gender: '',
      BirthDate: '',
      Address: '',
      Phone: '',
      Email: '',   
      Wechat: '',
      IDcardFront: '',
      IDcardBack: '',
      AuditState: '',
      DrawerTitle: '新增用户',
      visible: true
    });

    setTimeout(() => {
      this.formRef.current.resetFields()
      this.formRef.current.setFieldsValue({
        BirthDate: '',
      })
    }, 200);
  };

  onClose = () => {
    this.setState({
      visible: false,
      UserID: '',
      UserName: '',
      Gender: '',
      BirthDate: '',
      Address: '',
      Phone: '',
      Email: '',   
      Wechat: '',
      IDcardFront: '',
      IDcardBack: '',
      AuditState: ''
    });
  };

  onSubmit = async () => {
    const {DrawerTitle,UserID,UserName,Gender,BirthDate,Address,JobState,Job,Company,Income,Phone,Email,Wechat,fileList} = this.state;

    if(fileList.length<2){
      notification['error']({
        message: '消息',
        description:
          <p>未上传完整身份证信息</p>,
      });
      return;
    }
    const IDcardFront = fileList[0].url;
    const IDcardBack = fileList[1].url;

    let data = {
      UserID,UserName,Gender,BirthDate,Address,Phone,Email,Wechat,IDcardFront,IDcardBack,JobState,Job,Company,Income,
      AuditState:"1"
    }
    if(DrawerTitle==="编辑用户信息"){
      axios({
        method: 'post',
        url: 'http://localhost:3000/modUser',
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
            description:<div style={{whiteSpace: 'pre-wrap'}}>已成功修改{UserName}信息</div>,
            duration: 2
          });
        }
        this.getData();
      }).catch(error=>{
        notification['error']({
          message: '注意',
          description: '出错啦!!!',
          duration: 2
        });
      });
    }else{
      axios({
        method: 'post',
        url: 'http://localhost:3000/addUser',
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
            description:<div style={{whiteSpace: 'pre-wrap'}}>已成功添加用户{UserName}<br/>初始密码为123456</div>,
            duration: 2
          });
        }
        this.getData();
      }).catch(error=>{
        notification['error']({
          message: '注意',
          description: '出错啦!!!',
          duration: 2
        });
      });
    }

    this.onClose();
  };

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
      previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
    });
  };

  // handleChange = ({ fileList }) => this.setState({ fileList });

  handleChange = ({ file, fileList }) => {
    if (file.status === 'done') { 
      const newList = fileList.map((v)=>{
        if(v.uid===file.uid){
          v.url='http://localhost:8080/filepath/user/'+file.response.targetfile
        }
        return v
      })
      this.setState({
        fileList: newList
      })
      console.log(this.state.fileList)
      message.success('上传图片成功')
    } else if (file.status === 'removed') { 
        // const result = await reqDeleteImg(file.name)
        message.success('删除图片成功！')
    }else if (file.status === 'error') { 
        message.error('图片编辑失败！')
    }else{

    }
    this.setState({ fileList })
  }

  render() {
    const { previewVisible, previewImage, fileList, previewTitle } = this.state;
    const { dataSource, UserID,UserName,Gender,BirthDate,Address,Phone,Email,Wechat,IDcardFront,IDcardBack,AuditState } = this.state;
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



    const props = {
      name: "avatar",
      listType: "picture-card",
      className: "avatar-uploader",

      customRequest: info => {//手动上传
        var that = this;
        console.log(info)
        const formData = new FormData();
        formData.append('avatar', info.file);//名字和后端接口名字对应
        axios({
          url: 'http://localhost:3000/upload?filename='+JSON.stringify(info.file.name),//上传url
          method: 'post',
          processData: false,
          data: formData
        }).then(response=>{ 
          const newList = fileList.map((v)=>{
            if(v.uid===info.file.uid){
              v.url='http://localhost:8080/filepath/user/'+response.data.targetfile
            }
            return v
          })
          that.setState({
            fileList: newList
          })
          message.success('上传成功！');
        }).catch(error=>{
          message.error('上传失败！');
        });
      },
      onRemove: file => {//删除图片调用
        this.setState(state => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
 
      beforeUpload: file => {//控制上传图片格式
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
 
        if (!isJpgOrPng) {
          message.error('您只能上传JPG/PNG 文件!');
          return;
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
          message.error('图片大小必须小于2MB!');
          return;
        }
        return isJpgOrPng && isLt2M;
      },
    };


    const uploadButton = (
      <div>
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
      </div>
    );

    return (
      <div>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>信息管理</Breadcrumb.Item>
          <Breadcrumb.Item>用户信息管理</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: 10 }}>
          <Button type="primary" onClick={this.showDrawer} icon={<PlusOutlined />} style={{marginBottom: 16}}>
            新增用户
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
                  const { UserID,UserName,Gender,BirthDate,Address,JobState,Job,Company,Income,Phone,Email,Wechat,IDcardFront,IDcardBack,AuditState } = record
                  this.setState({
                    UserID,UserName,Gender,BirthDate,Address,Phone,Email,Wechat,IDcardFront,IDcardBack,AuditState,
                    DrawerTitle: '编辑用户信息',
                    visible: true
                  });
                  setTimeout(() => {
                    this.formRef.current.setFieldsValue({
                      UserID,UserName,Gender,BirthDate:moment(BirthDate),Address,JobState,Job,Company,Income,Phone,Email,Wechat,IDcardFront,IDcardBack
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
          <Form layout="vertical" ref={this.formRef} hideRequiredMark>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="UserID"
                  label="证件号"
                  rules={[{ required: true, message: '请输入证件号' }]}
                >
                  <Input value={this.state.UserID} placeholder="请输入证件号" onChange={this.handleID} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="UserName"
                  label="姓名"
                  rules={[{ required: true, message: '请输入姓名' }]}
                >
                  <Input value={this.state.UserName} placeholder="请输入姓名" onChange={this.handleName} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="Gender"
                  label="性别"
                  rules={[{ required: true, message: '请选择性别' }]}
                >
                  <Select value={this.state.Gender} onChange={this.handleGender} placeholder="选择性别">
                    <Option value="0">男</Option>
                    <Option value="1">女</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="BirthDate"
                  label="出生日期"
                  rules={[{ required: true, message: '请选择出生日期' }]}
                >
                  <DatePicker style={{ width: '100%' }} value={this.state.BirthDate} onChange={this.handleDate} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="Address"
                  label="详细住址"
                  rules={[{ required: true, message: '请输入详细住址' }]}
                >
                  <Input.TextArea rows={3} value={this.state.Address} onChange={this.handleAddress} placeholder="请输入详细住址" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="JobState"
                  label="从业状态"
                  rules={[{ required: true, message: '请选择从业状态' }]}
                >
                  <Select value={this.state.JobState} onChange={(e)=>this.setState({JobState: e})} placeholder="请选择从业状态">
                    <Option value="待业">待业</Option>
                    <Option value="兼职">兼职</Option>
                    <Option value="正职">正职</Option>
                    <Option value="退休">退休</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="Job"
                  label="职业"
                  rules={[{ required: true, message: '请输入职业' }]}
                >
                  <Input value={this.state.Job} placeholder="请输入职业" onChange={(e)=>this.setState({JobState: e.target.value})} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="Company"
                  label="所在公司"
                  rules={[{ required: true, message: '请输入所在公司' }]}
                >
                  <Input value={this.state.Company} placeholder="请输入所在公司" onChange={(e)=>this.setState({Company: e.target.value})} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="Income"
                  label="月收入区间"
                  rules={[{ required: true, message: '请选择月收入区间' }]}
                >
                  <Select value={this.state.Income} onChange={(e)=>this.setState({Income: e})} placeholder="请选择月收入区间">
                    <Option value="5000以下">5000以下</Option>
                    <Option value="5000-10000">5000-10000</Option>
                    <Option value="10000-20000">10000-20000</Option>
                    <Option value="20000以上">20000以上</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="Phone"
                  label="联系电话"
                  rules={[{ required: true, message: '请输入联系电话' }]}
                >
                  <Input value={this.state.Phone} onChange={this.handlePhone} placeholder="请输入联系电话" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="Wechat"
                  label="微信号"
                  rules={[{ required: true, message: '请输入微信号' }]}
                >
                  <Input value={this.state.Wechat} onChange={this.handleWechat} placeholder="请输入微信号" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="Email"
                  label="邮箱地址"
                  rules={[{ required: true, message: '请输入邮箱地址' }]}
                >
                  <Input value={this.state.Email} onChange={this.handleEmail} placeholder="请输入邮箱地址" />
                </Form.Item>
              </Col>
            </Row>
            {
            IDcardFront!=''?(
            <Row gutter={16}>
              <Col span={12}>
                <img src={IDcardFront} style={{width:'90%'}}/>
              </Col>
              <Col span={12}>
                <img src={IDcardBack} style={{width:'90%'}}/>
              </Col>
            </Row>
            ):(
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="上传证件照"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                  extra="正面&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;反面"
                >
                  <Upload
                    action="http://localhost:3000/upload"
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={this.handlePreview}
                    onChange={this.handleChange}
                  >
                    {fileList.length >= 2 ? null : uploadButton}
                  </Upload>
                  <Modal
                    visible={previewVisible}
                    title={previewTitle}
                    footer={null}
                    onCancel={this.handleCancel}
                  >
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                  </Modal>
                </Form.Item>
              </Col>
            </Row>
            )
            }
          </Form>
        </Drawer>
      </div>
    )
  }
}


