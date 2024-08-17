import React, { Component, useContext, useState, useEffect, useRef } from 'react'
import { Breadcrumb, Layout, Tree, Input, InputNumber, Button, Form, Tag, Tooltip, notification, message } from 'antd'
import store from '../../../../redux/store'
import axios from 'axios'
import Qs from 'qs';
import '../../../../style/common.less'
//import 'antd/dist/antd.css';
import { DownOutlined, PlusOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';

const {TreeNode} = Tree
const { Content, Sider } = Layout;

export default class Expenses extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false ,
      dataSource: [],
      count: 0,
      AuthenticateFare: '',
      AssessFare: '',
      flag: false,

      selectedNode: "",
      title: '',
      tags: [],
      DocTags: []
    };
  }

  componentDidMount(){
    this.getData();
  }

  formRef = React.createRef()

  getData = async () => {
    let dataSource = []

    await axios.get('/getCategory',{
      params:{
        level: 1
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
        key: obj.CID,
        isLeaf: obj.isLeafNode==="0"?false:true
      };  
    });

    this.setState({
      dataSource,
      count: dataSource.length
    })
  }

  updateTreeData(list, key, children) {
    return list.map((node) => {
      if (node.key === key) {
        console.log(node,children)
        return { ...node, children };
      }
  
      if (node.children) {
        return { ...node, children: this.updateTreeData(node.children, key, children) };
      }
  
      return node;
    });
  }

  selectTreeNode = async (treeNode) => {
    if(treeNode.length===0){
      this.setState({selectedNode:"",title:"",tags:[],DocTags:[],AuthenticateFare: '',AssessFare: '',flag: false})
      setTimeout(() => {
        this.formRef.current.setFieldsValue({
          title: "",AuthenticateFare: '',AssessFare: ''
        })
      }, 200);
      return;
    }
    let selectedNode = {}
    await axios.get('/getExpFare',{
      params:{
        expert: store.getState().ExpertID,
        id: treeNode[0]
      }
    }).then(response=>{
        if(response.data.length === 0){
          console.log('无数据')
        }else{
          selectedNode = response.data[0]
        }
    }).catch(error=>{
        console.log(error);
    });

    const {AuthenticateFare,AssessFare} = selectedNode
    
    let tags = []
    if(selectedNode.SpeDetail.trim()!==""){
      tags = selectedNode.SpeDetail.split(";");
    }

    let DocTags = []
    if(selectedNode.DocDetail.trim()!==""){
      DocTags = selectedNode.DocDetail.split(";");
    }

    let flag = false  //判别专家是否设置过该类目价格
    if(AuthenticateFare===undefined&&AssessFare===undefined){
      flag = false
    }else{
      flag = true
    }

    this.setState({
      tags, DocTags, selectedNode, title: selectedNode.title, btnType:"",
      AuthenticateFare,AssessFare,flag
    })

    setTimeout(() => {
      this.formRef.current.setFieldsValue({
        title: selectedNode.title,AuthenticateFare,AssessFare
      })
    }, 200);
  }

  onLoadData = treeNode => {
    return new Promise(async (resolve) => {
      const { key } = treeNode;
      let children = [];
      await axios.get('/getCategory',{
        params:{
          ParentNode: treeNode.CID
        }
      }).then(response=>{
          if(response.data.length === 0){
            console.log('无数据')
          }else{
            children = response.data
          }
      }).catch(error=>{
          console.log(error);
      });

      children = children.map((obj,index) => {
        return {
          ...obj,
          key: obj.CID,
          isLeaf: obj.isLeafNode==="0"?false:true
        };  
      });

      const {dataSource} = this.state
      let newtreeData = this.updateTreeData(dataSource, key, children);
      this.setState({
        dataSource:newtreeData
      });
      resolve();
    });
  }

  handleSave = () =>{
    const {selectedNode,AuthenticateFare,AssessFare,flag} = this.state
    if(selectedNode === ""){
      message.warning("请先选择指定类目");
      return;
    }

    console.log(AuthenticateFare,AssessFare)

    let data = {}
    if(flag&&(AuthenticateFare===null||AuthenticateFare===undefined)&&(AssessFare===null||AssessFare===undefined)){
      data = {
        expert: store.getState().ExpertID,
        id: selectedNode.CID,
        operation: 'del'    
      }
    }else if(flag&&((AuthenticateFare!==null&&AuthenticateFare!==undefined)||(AssessFare!==null&&AssessFare!==undefined))){
      data = {
        expert: store.getState().ExpertID,
        id: selectedNode.CID,
        AuthenticateFare:AuthenticateFare===null?undefined:AuthenticateFare,
        AssessFare:AssessFare===null?undefined:AssessFare,
        operation: 'mod'    
      }
    }else if((!flag)&&((AuthenticateFare!==null&&AuthenticateFare!==undefined)||(AssessFare!==null&&AssessFare!==undefined))){
      data = {
        expert: store.getState().ExpertID,
        id: selectedNode.CID,
        AuthenticateFare:AuthenticateFare===null?undefined:AuthenticateFare,
        AssessFare:AssessFare===null?undefined:AssessFare,
        operation: 'add'    
      }
    }else{
      message.warning("未作更新");
      return;
    }
    axios({
      method: 'post',
      url: 'http://localhost:3000/modExpFare',
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
          description:
            <p>已成功设置类目服务费用</p>,
        });
      }
    }).catch(error=>{
      console.log(error);
    });
  }

  render() {
    const { dataSource } = this.state;
    const { tags, DocTags } = this.state;

    return (
      <div>
        <Breadcrumb style={{ margin: '10px 0' }}>
          <Breadcrumb.Item>信息管理</Breadcrumb.Item>
          <Breadcrumb.Item>服务费用设置</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: 10 }}>
          <Layout style={{ height: '68vh' }}>
            <Sider theme='light'  width={260} style={{padding:10, border:'1px solid #eee'}}>
              <Tree
                showLine
                switcherIcon={<DownOutlined />}
                loadData={this.onLoadData}
                treeData={dataSource}
                height={500} 
                onSelect={this.selectTreeNode}
                style={{paddingLeft:10}}
              />
            </Sider>
            <Content style={{ paddingLeft: 10, backgroundColor: 'white' }}>
              <Button type="primary" onClick={this.handleSave} icon={<CheckOutlined />} style={{marginBottom: 10, marginLeft: 10}}>
                保存
              </Button>
              <Form layout="vertical" ref={this.formRef} style={{padding: 10}} >
                <Form.Item name="title" label="类目名称" >
                  <Input disabled style={{width:'200px'}}/>
                </Form.Item>
                <Form.Item name="AuthenticateFare" label="鉴定服务定价/单件" >
                  <InputNumber prefix="￥" min="0" step="1.00" style={{width:'200px'}} onChange={(e)=>this.setState({AuthenticateFare:e})} />
                </Form.Item>
                <Form.Item name="AssessFare" label="估价服务定价/单件" >
                  <InputNumber prefix="￥" min="0" step="1.00" style={{width:'200px'}} onChange={(e)=>this.setState({AssessFare:e})} />
                </Form.Item>
              </Form>
            </Content>
          </Layout>
        </div>
      </div>
    )
  }
}
