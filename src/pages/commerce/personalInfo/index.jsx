import React, { Component } from 'react'
import { Breadcrumb, Space, Input, Button, Form, Col, Row, Select, DatePicker, Modal, notification, message } from 'antd'
import axios from 'axios'
import Qs from 'qs'
import store from '../../../redux/store'
import {createCommerceAction} from '../../../redux/UserInfoAction'
import moment from 'moment'
import '../../../style/common.less'
//import 'antd/dist/antd.css';
import { EyeInvisibleOutlined, EyeTwoTone, SaveOutlined, EditOutlined, SmileOutlined } from '@ant-design/icons';

const { Option } = Select;

export default class PersonalInfo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      oldPwd: '',
      newPwd: '',
      dataSource: {},
      ComMemID: '',
      ComMemName: '',
      Pwd: '',
      Gender: '',
      BirthDate: '',
      Address: '',
      Phone: '',
      Email: '',
      Notes: ''
    };
  }

  formRef = React.createRef();

  componentDidMount(){
    this.getData()
  }

  getData = async () => {
    const id = store.getState().ComMemID
    let dataSource = []   
    await axios.get('/getComMem',{
      params: {
        id
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

    const {ComMemID,ComMemName,Pwd,Gender,BirthDate,Address,Phone,Email,Notes} = dataSource[0];

    this.setState({
      ComMemID,ComMemName,Pwd,Gender,BirthDate,Address,Phone,Email,Notes,
      dataSource: dataSource[0]
    })

    this.formRef.current.setFieldsValue({
      ComMemID,
      ComMemName,
      Gender,
      BirthDate: moment(BirthDate),
      Address,
      Phone,
      Email,
      Notes
    })
  }

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

  handleSave =async () =>{
    const {ComMemID,ComMemName,Gender,BirthDate,Address,Phone,Email,Notes} = this.state;
    let data = {
      usertype: 'ComMem',
      ComMemID,ComMemName,Gender,BirthDate,Address,Phone,Email,Notes
    }

    await axios({
      method: 'post',
      url: 'http://localhost:3000/modComMem',
      data: Qs.stringify(data)
    }).then(response=>{
      notification.open({
        message: '消息',
        description:
          <div style={{whiteSpace: 'pre-wrap'}}>
            您已成功修改信息
          </div>,
        icon: <SmileOutlined style={{color:'orange'}}/>,
        duration: 2
      });
    }).catch(error=>{
      console.log(error);
    });

    this.setState({
      dataSource:{
        ComMemID,ComMemName,Gender,BirthDate,Address,Phone,Email,Notes
      }
    })
    await store.dispatch(createCommerceAction(this.state.dataSource))
  }

  modPwd = () =>{
    const {ComMemID,Pwd,oldPwd,newPwd,dataSource} = this.state;
    if(Pwd!==oldPwd){
      message.warning("原密码有误!");
      return;
    }
    if(newPwd===""){
      message.warning("请输入新密码!");
      return;
    }
    if(newPwd.length<6){
      message.warning("密码设置不得少于6位!");
      return;
    }
    if(newPwd===Pwd){
      message.warning("新密码与原密码相同!");
      return;
    }

    let data = {
      id: ComMemID,
      Pwd: newPwd,
      usertype: 'ComMem'
    }
    axios({
      method: 'post',
      url: 'http://localhost:3000/modPwd',
      data: Qs.stringify(data)
    }).then(response=>{
      notification.open({
        message: '消息',
        description:
          <div style={{whiteSpace: 'pre-wrap'}}>
            您已成功修改密码
          </div>,
        icon: <SmileOutlined style={{color:'orange'}}/>,
        duration: 2
      });
    }).catch(error=>{
      console.log(error);
    });
    dataSource.Pwd=newPwd;
    this.setState({
      dataSource,
      visible: false,
      Pwd: newPwd,
      oldPwd: '',
      newPwd: ''
    })
    store.dispatch(createCommerceAction(dataSource))
  }

  render() {
    const {visible,ComMemID,ComMemName,Pwd,Gender,BirthDate,Address,Phone,Email,Notes} = this.state;

    return (
      <div>
        <Breadcrumb style={{ margin: '10px 0' }}>
          <Breadcrumb.Item>信息管理</Breadcrumb.Item>
          <Breadcrumb.Item>个人信息管理</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: "0 10px" }}>
          <Button type="primary" onClick={this.handleSave} icon={<SaveOutlined />} style={{marginBottom: 16, marginRight: 10}}>
            保存
          </Button>
          <Button type="primary" onClick={()=>this.setState({visible:true})} icon={<EditOutlined />} style={{marginBottom: 16}}>
            修改密码
          </Button>
          <Form layout="vertical" ref={this.formRef}
          initialValues={{ComMemID,ComMemName,Gender,BirthDate:moment(BirthDate),Address,Phone,Email,Notes}}
          style={{paddingRight:10,height: '62vh',overflow:'auto'}}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="ComMemID"
                  label="工号"
                  rules={[{ required: true, message: '请输入工号' }]}
                >
                  <Input value={this.state.ComMemID} placeholder="请输入工号" onChange={this.handleID} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="ComMemName"
                  label="姓名"
                  rules={[{ required: true, message: '请输入姓名' }]}
                >
                  <Input value={this.state.ComMemName} placeholder="请输入姓名" onChange={this.handleName} />
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
                  name="Phone"
                  label="联系电话"
                  rules={[{ required: true, message: '请输入联系电话' }]}
                >
                  <Input value={this.state.Phone} onChange={this.handlePhone} placeholder="请输入联系电话" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="Email"
                  label="邮箱地址"
                  rules={[{ required: true, message: '请输入邮箱地址' }]}
                >
                  <Input value={this.state.Email} onChange={this.handleEmail} placeholder="请输入邮箱地址" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="Notes"
                  label="备注"
                  rules={[
                    {
                      required: true,
                      message: '请输入备注',
                    },
                  ]}
                >
                  <Input.TextArea rows={4} value={this.state.Notes} onChange={this.handleNotes} placeholder="请输入备注" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <Modal
            title="修改密码"
            centered
            visible={visible}
            onOk={this.modPwd}
            onCancel={() => {this.setState({visible:false,oldPwd:'',newPwd:''})}}
            width={260}
            bodyStyle={{padding:10}}
          >
            <Space direction="vertical" style={{width:'100%'}}>
              <Input.Password value={this.state.oldPwd} placeholder="请输入原密码" showCount maxLength={20} onChange={(e)=>this.setState({oldPwd:e.target.value})} />
              <Input.Password value={this.state.newPwd} placeholder="请输入新密码" showCount maxLength={20} onChange={(e)=>this.setState({newPwd:e.target.value})} />
            </Space>
          </Modal>
        </div>
      </div>
    )
  }
}
