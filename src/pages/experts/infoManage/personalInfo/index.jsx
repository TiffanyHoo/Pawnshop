import React, { Component, useContext, useState, useEffect, useRef } from 'react'
import { Breadcrumb, Input, Button, Modal, Form, message, Col, Row, Select, Space, Tooltip, notification } from 'antd'
import axios from 'axios'
import Qs from 'qs'
import store from '../../../../redux/store'
import {createExpertAction} from '../../../../redux/UserInfoAction'
import '../../../../style/common.less'
//import 'antd/dist/antd.css';
import { SaveOutlined, EditOutlined, SmileOutlined } from '@ant-design/icons';

const { Option } = Select;

export default class PersonalInfo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      oldPwd: '',
      newPwd: '',
      dataSource: {},
      ExpertID: '',
      ExpertName: '',
      Pwd: '',
      Identification: '',
      TechQCcode: '',
      ResearchField: '',
      Address: '',
      Phone: '',
      Email: '',
      Wechat: '',
      AuditState: ''
    };
  }

  formRef = React.createRef();

  componentDidMount(){
    this.getData()
  }

  getData = async () => {
    const id = store.getState().ExpertID
    let dataSource = {} 
    await axios.get('/getExperts',{
      params: {
        id
      }
    }).then(response=>{
        if(response.data.length === 0){
          console.log('无数据')
        }else{
          dataSource = response.data[0]
        }
    }).catch(error=>{
        console.log(error);
    });

    const {ExpertID,ExpertName,Pwd,Identification,TechQCcode,ResearchField,Address,Phone,Email,Wechat,AuditState} = dataSource;

    this.setState({
      ExpertID,ExpertName,Pwd,Identification,TechQCcode,ResearchField,Address,Phone,Email,Wechat,AuditState,
      dataSource
    })

    this.formRef.current.setFieldsValue({
      ExpertID,ExpertName,Identification,TechQCcode,ResearchField,Address,Phone,Email,Wechat,AuditState
    })
  }

  handleName = (e) =>{
    this.setState({
      ExpertName: e.target.value
    })
  }

  handleEID = (e) =>{
    this.setState({
      Identification: e.target.value
    })
  }

  handleTechQCcode = (e) =>{
    this.setState({
      TechQCcode: e.target.value
    })
  }

  handleRSF = (e) =>{
    this.setState({
      ResearchField: e.target.value
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

  handleWechat = (e) =>{
    this.setState({
      Wechat: e.target.value
    })
  }

  showDrawer = () => {
    this.setState({
      visible: true,
    });
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
  };

  //修改密码
  modPwd = () =>{
    const {ExpertID,Pwd,oldPwd,newPwd,dataSource} = this.state;
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
      id: ExpertID,
      Pwd: newPwd,
      usertype: 'Expert'
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
    store.dispatch(createExpertAction(dataSource))
  }

  //保存
  handleSave = async () => {
    const { ExpertID,ExpertName,Pwd,Identification,TechQCcode,ResearchField,Address,Phone,Email,Wechat,AuditState } = this.state;

    let data = {
      usertype: 'Expert',
      ExpertID,ExpertName,Identification,TechQCcode,ResearchField,Address,Phone,Email,Wechat
    }

    await axios({
      method: 'post',
      url: 'http://localhost:3000/modExpert',
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
        ExpertID,ExpertName,Pwd,Identification,TechQCcode,ResearchField,Address,Phone,Email,Wechat,AuditState
      }
    })
    await store.dispatch(createExpertAction(this.state.dataSource))
  };

  render() {
    const { visible,ExpertID,ExpertName,Identification,TechQCcode,ResearchField,Address,Phone,Email,Wechat,AuditState } = this.state;

    return (
      <div>
        <Breadcrumb style={{ margin: '10px 0' }}>
          <Breadcrumb.Item>信息管理</Breadcrumb.Item>
          <Breadcrumb.Item>个人信息管理</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: 10 }}>
          <Button type="primary" onClick={this.handleSave} icon={<SaveOutlined />} style={{marginBottom: 16, marginRight: 10}}>
            保存
          </Button>
          <Button type="primary" onClick={()=>this.setState({visible:true})} icon={<EditOutlined />} style={{marginBottom: 16}}>
            修改密码
          </Button>
          <Form layout="vertical" ref={this.formRef} hideRequiredMark
          initialValues={{ExpertID,ExpertName,Identification,TechQCcode,ResearchField,Address,Phone,Email,Wechat}}
          style={{paddingRight:10,height: '62vh',overflow:'auto'}}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="ExpertID"
                  label="专家编号"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="ExpertName"
                  label="姓名"
                  rules={[{ required: true, message: '请输入姓名' }]}
                >
                  <Input placeholder="请输入姓名" onChange={this.handleName} />
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
                  rules={[{ required: true, message: '请输入详细住址' }]}
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
