import React, { Component } from 'react';
import axios from 'axios';
import Qs from 'qs';
import { Breadcrumb, Layout, Form, Button, Tag, Input, Tooltip, Tree, message, notification } from 'antd';
import { DownOutlined, PlusOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';

const {TreeNode} = Tree
const { Content, Sider } = Layout;

export default class AssessStandard extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      dataSource: [],
      selectedNode: "",
      title: '',
      btnType: '',
      tags: [],
      DocTags: [],
      inputVisibleA: false,
      inputVisibleB: false,
      inputValueA: '',
      inputValueB: '',
      editInputIndexA: -1,
      editInputIndexB: -1,
      editInputValueA: '',
      editInputValueB: '',
    };
  }

  componentDidMount(){
    this.getData();
  }

  formRef = React.createRef()
  inputA = React.createRef()
  inputB = React.createRef()

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

  selectTreeNode = async (treeNode) => {
    if(treeNode.length===0){
      this.setState({selectedNode:"",title:"",tags:[],DocTags:[]})
      setTimeout(() => {
        this.formRef.current.setFieldsValue({
          title: ""
        })
      }, 200);
      return;
    }
    let selectedNode = {}
    await axios.get('/getCategory',{
      params:{
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
    
    let tags = []
    if(selectedNode.SpeDetail.trim()!==""){
      tags = selectedNode.SpeDetail.split(";");
    }

    let DocTags = []
    if(selectedNode.DocDetail.trim()!==""){
      DocTags = selectedNode.DocDetail.split(";");
    }

    this.setState({
      tags, DocTags, selectedNode, title: selectedNode.title, btnType:""
    })

    setTimeout(() => {
      this.formRef.current.setFieldsValue({
        title: selectedNode.title
      })
    }, 200);
  }

  handleSave = () =>{
    const {selectedNode,btnType,title} = this.state
    if(selectedNode === ""){
      message.warning("请先选择指定类目");
      return;
    }

    let data = {
      operation: btnType===""?"save":btnType,
      id: selectedNode.CID,
      title
    }
    console.log(data)
    axios({
      method: 'post',
      url: 'http://localhost:3000/modCategory',
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
            <p>已成功修改类目信息</p>,
        });
      }
    }).catch(error=>{
      console.log(error);
    });

  }

  //标签编辑
  handleCloseA = removedTag => {
    const tags = this.state.tags.filter(tag => tag !== removedTag);
    this.setState({ tags });
  };

  handleCloseB = removedTag => {
    const DocTags = this.state.DocTags.filter(tag => tag !== removedTag);
    this.setState({ DocTags });
  };

  showInputA = () => {
    this.setState({ inputVisibleA: true }, () => this.inputA.current.focus());
  };

  showInputB = () => {
    this.setState({ inputVisibleB: true }, () => this.inputB.current.focus());
  };

  handleInputConfirmA = () => {
    const { inputValueA } = this.state;
    let { tags } = this.state;
    if (inputValueA && tags.indexOf(inputValueA) === -1) {
      tags = [...tags, inputValueA];
    }
    this.setState({
      tags,
      inputVisibleA: false,
      inputValueA: '',
    });
  };

  handleInputConfirmB = () => {
    const { inputValueB } = this.state;
    let { DocTags } = this.state;
    if (inputValueB && DocTags.indexOf(inputValueB) === -1) {
      DocTags = [...DocTags, inputValueB];
    }
    this.setState({
      DocTags,
      inputVisibleB: false,
      inputValueB: '',
    });
  };

  handleEditInputConfirmA = () => {
    this.setState(({ tags, editInputIndexA, editInputValueA }) => {
      const newTags = [...tags];
      newTags[editInputIndexA] = editInputValueA;

      return {
        tags: newTags,
        editInputIndexA: -1,
        editInputValueA: '',
      };
    });
  };

  handleEditInputConfirmB = () => {
    this.setState(({ DocTags, editInputIndexB, editInputValueB }) => {
      const newTags = [...DocTags];
      newTags[editInputIndexB] = editInputValueB;

      return {
        tags: DocTags,
        editInputIndexB: -1,
        editInputValueB: '',
      };
    });
  };

  render() {
    const { dataSource, DocTags } = this.state;
    const { tags, inputVisibleA, inputVisibleB, inputValueA, inputValueB, editInputIndexA, editInputIndexB, editInputValueA, editInputValueB } = this.state;

    return (
      <div>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>系统设置</Breadcrumb.Item>
          <Breadcrumb.Item>估价标准设置</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-background" style={{ padding: 10, height: '80vh'}}>
          <Layout style={{ height: '70vh' }}>
              <Sider theme='light' style={{padding:10, border:'1px solid #eee'}}>
                <Tree
                  showLine
                  switcherIcon={<DownOutlined />}
                  loadData={this.onLoadData}
                  treeData={dataSource}
                  height={500} 
                  onSelect={this.selectTreeNode}
                />
              </Sider>
              <Content style={{ paddingLeft: 10, backgroundColor: 'white' }}>
                <div>
                  <Button type="primary" onClick={this.handleSave} icon={<CheckOutlined />} style={{marginBottom: 10, marginLeft: 10}}>
                    保存
                  </Button>
                  <Form layout="vertical" ref={this.formRef} style={{padding: 10}} >
                    <Form.Item name="title" label="类目名称">
                      <Input disabled onChange={(e)=>this.setState({title:e.target.value})}/>
                    </Form.Item>
                    {/* <Form.Item name="SpeDetail" label="规格属性">
                      <>
                        {tags.map((tag, index) => {
                          if (editInputIndexA === index) {
                            return (
                              <Input
                                ref={this.editInputA}
                                key={tag}
                                size="small"
                                className="tag-input"
                                value={editInputValueA}
                                onChange={(e)=>this.setState({ editInputValueA: e.target.value })}
                                onBlur={this.handleEditInputConfirmA}
                                onPressEnter={this.handleEditInputConfirmA}
                              />
                            );
                          }

                          const isLongTag = tag.length > 20;

                          const tagElem = (
                            <Tag
                              className="edit-tag"
                              key={tag}
                              closable
                              color="orange"
                              onClose={() => this.handleCloseA(tag)}
                            >
                              <span
                                onDoubleClick={e => {
                                  if (index !== 0) {
                                    this.setState({ editInputIndexA: index, editInputValueA: tag }, () => {
                                      this.editInput.focus();
                                    });
                                    e.preventDefault();
                                  }
                                }}
                              >
                                {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                              </span>
                            </Tag>
                          );
                          return isLongTag ? (
                            <Tooltip title={tag} key={tag}>
                              {tagElem}
                            </Tooltip>
                          ) : (
                            tagElem
                          );
                        })}
                        {inputVisibleA && (
                          <Input
                            ref={this.inputA}
                            type="text"
                            size="small"
                            className="tag-input"
                            value={inputValueA}
                            onChange={(e)=>{this.setState({ inputValueA: e.target.value })}}
                            onBlur={this.handleInputConfirmA}
                            onPressEnter={this.handleInputConfirmA}
                          />
                        )}
                        {!inputVisibleA && (
                          <Tag className="site-tag-plus" onClick={this.showInputA}>
                            <PlusOutlined /> 新增
                          </Tag>
                        )}
                      </>
                    </Form.Item>
                    <Form.Item name="DocDetail" label="附件">
                      <>
                        {DocTags.map((tag, index) => {
                          if (editInputIndexB === index) {
                            return (
                              <Input
                                ref={this.editInputB}
                                key={tag}
                                size="small"
                                className="tag-input"
                                value={editInputValueB}
                                onChange={(e)=>this.setState({ editInputValueB: e.target.value })}
                                onBlur={this.handleEditInputConfirmB}
                                onPressEnter={this.handleEditInputConfirmB}
                              />
                            );
                          }

                          const isLongTag = tag.length > 20;

                          const tagElem = (
                            <Tag
                              className="edit-tag"
                              key={tag}
                              closable
                              color="orange"
                              onClose={() => this.handleCloseB(tag)}
                            >
                              <span
                                onDoubleClick={e => {
                                  if (index !== 0) {
                                    this.setState({ editInputIndexB: index, editInputValueB: tag }, () => {
                                      this.editInput.focus();
                                    });
                                    e.preventDefault();
                                  }
                                }}
                              >
                                {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                              </span>
                            </Tag>
                          );
                          return isLongTag ? (
                            <Tooltip title={tag} key={tag}>
                              {tagElem}
                            </Tooltip>
                          ) : (
                            tagElem
                          );
                        })}
                        {inputVisibleB && (
                          <Input
                            ref={this.inputB}
                            type="text"
                            size="small"
                            className="tag-input"
                            value={inputValueB}
                            onChange={(e)=>{this.setState({ inputValueB: e.target.value })}}
                            onBlur={this.handleInputConfirmB}
                            onPressEnter={this.handleInputConfirmB}
                          />
                        )}
                        {!inputVisibleB && (
                          <Tag className="site-tag-plus" onClick={this.showInputB}>
                            <PlusOutlined /> 新增
                          </Tag>
                        )}
                      </>
                    </Form.Item> */}
                  </Form>
                </div>
              </Content>
          </Layout>
        </div>
      </div>
    );
  }
}