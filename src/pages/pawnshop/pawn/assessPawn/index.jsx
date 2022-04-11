import React, { Component } from 'react'
import { Breadcrumb, Layout, Tree, Input, InputNumber, Button, Form, Tooltip, notification, message } from 'antd'
import store from '../../../../redux/store'
import axios from 'axios'
import Qs from 'qs';
import '../../../../style/common.less'
//import 'antd/dist/antd.css';
import { DownOutlined, PlusOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';

const { Content, Sider } = Layout;
const { TextArea } = Input;

export default class AssessPawn extends Component {

    constructor(props) {
        super(props);
    
        this.state = {
          visible: false ,
          dataSource: [],
          count: 0,
          flag: false,
    
          selectedNode: "",
          title: '',
          Rate: '',
          Notes: ''
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
          this.setState({selectedNode:"",title:"",AuthenticateFare: '',AssessFare: '',flag: false})
          setTimeout(() => {
            this.formRef.current.setFieldsValue({
              title: "",Rate: "",Notes: ""
            })
          }, 200);
          return;
        }
        let selectedNode = {}
        await axios.get('/getAssessSD',{
          params:{
            PSID: store.getState().PSID,
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
    
        const {Rate,Notes} = selectedNode
    

    
        let flag = false  //判别是否设置过该类目
        if(Rate===undefined&&Notes===undefined){
            flag = false
        }else{
            flag = true
        }
    
        this.setState({
            selectedNode, title: selectedNode.title,
            Rate, Notes, flag
        })
    
        setTimeout(() => {
          this.formRef.current.setFieldsValue({
            title: selectedNode.title, Rate, Notes
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
        const {selectedNode,Rate,Notes,flag} = this.state
        if(selectedNode === ""){
            message.warning("请先选择指定类目");
            return;
        }
    
        let data = {}
        if(flag&&(Rate===null||Rate===undefined)&&(Notes===null||Notes===undefined||Notes.trim()==='')){
            data = {
                PSID: store.getState().PSID,
                id: selectedNode.CID,
                operation: 'del'    
            }
        }else if(flag&&((Rate!==null&&Rate!==undefined)||(Notes!==null&&Notes!==undefined&&Notes.trim()===''))){
            data = {
                PSID: store.getState().PSID,
                id: selectedNode.CID,
                Rate:Rate===null?undefined:Rate,
                Notes:Notes===null?undefined:Notes,
                operation: 'mod'    
            }
        }else if((!flag)&&((Rate!==null&&Rate!==undefined)||(Notes!==null&&Notes!==undefined&&Notes.trim()!==''))){
            data = {
                PSID: store.getState().PSID,
                id: selectedNode.CID,
                Rate:Rate===null?undefined:Rate,
                Notes:Notes===null?undefined:Notes,
                operation: 'add'    
            }
        }else{
            message.warning("未作更新");
            return;
        }
        console.log(data)
        axios({
            method: 'post',
            url: 'http://localhost:3000/modAssessSD',
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
                    description:<p>已成功设置类目估价折价率</p>,
                    duration: 2
                });
            }
        }).catch(error=>{
            notification['error']({
                message: '注意',
                description: error,
                duration: 2
            });
        });
    }
    
    
    render() {
        const { dataSource } = this.state;

        return (
        <div>
            <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>典当管理</Breadcrumb.Item>
            <Breadcrumb.Item>典当折价设置</Breadcrumb.Item>
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
                                <Input disabled style={{width:'380px'}}/>
                            </Form.Item>
                            <Form.Item name="Rate" label="估价折价率" >
                                <InputNumber addonAfter="%" min="0" max="100" step="0.01" style={{width:'380px'}} onChange={(e)=>this.setState({Rate:e})} />
                            </Form.Item>
                            <Form.Item name="Notes" label="备注" >
                                <TextArea rows={3} placeholder="请输入备注" maxLength={5} onChange={(e)=>this.setState({Notes:e.target.value})}/>
                            </Form.Item>
                        </Form>
                    </Content>
                </Layout>
            </div>
        </div>
        )
    }
}


