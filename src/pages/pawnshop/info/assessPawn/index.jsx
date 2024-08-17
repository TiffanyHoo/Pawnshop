import React, { Component } from 'react'
import { Breadcrumb, Layout, Tree, Input, InputNumber, Button, Form, Row, Col, notification, message } from 'antd'
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
          PawnDue: 0,
          InterestRatio: 0,
          StoreCost: 0,
          OverdueCost: 0,
          OtherCost: 0,
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

        console.log(selectedNode)
    
        const {Rate,Notes,PawnDue,InterestRatio,StoreCost,OverdueCost,OtherCost} = selectedNode
        
        let flag = false  //判别是否设置过该类目
        if(Rate===undefined&&Notes===undefined){
            flag = false
        }else{
            flag = true
        }
    
        this.setState({
            selectedNode, title: selectedNode.title,
            Rate, Notes, flag,
            PawnDue,InterestRatio:InterestRatio?InterestRatio:0,StoreCost,OverdueCost,OtherCost
        })
    
        setTimeout(() => {
          this.formRef.current.setFieldsValue({
            title: selectedNode.title, Rate, Notes,
            PawnDue,InterestRatio:InterestRatio?InterestRatio:0,StoreCost,OverdueCost,OtherCost
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
      
      const {selectedNode,Rate,flag,PawnDue,InterestRatio,StoreCost,OverdueCost,OtherCost,Notes} = this.state
        
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
              operation: 'mod',
              PawnDue,InterestRatio,StoreCost,OverdueCost,OtherCost
          }
      }else if((!flag)&&((Rate!==null&&Rate!==undefined)||(Notes!==null&&Notes!==undefined&&Notes.trim()!==''))){
          data = {
              PSID: store.getState().PSID,
              id: selectedNode.CID,
              Rate:Rate===null?undefined:Rate,
              Notes:Notes===null?undefined:Notes,
              operation: 'add' ,
              PawnDue,InterestRatio,StoreCost,OverdueCost,OtherCost,   
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
            <Breadcrumb style={{ margin: '10px 0' }}>
            <Breadcrumb.Item>典当管理</Breadcrumb.Item>
            <Breadcrumb.Item>折价率与收费设置</Breadcrumb.Item>
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
                        <Form layout="horizontal" ref={this.formRef} style={{padding: 10}} >
                            <Form.Item name="title" label="类 目 名 称" >
                                <Input disabled style={{width:'200px'}}/>
                            </Form.Item>
                            <Row gutter={16}>
                              <Col span={10}>
                                <Form.Item name="Rate" label="估价折价率" >
                                    <InputNumber addonAfter="%" min="0" max="100" step="0.01" style={{width:'200px'}} onChange={(e)=>this.setState({Rate:e})} />
                                </Form.Item>
                              </Col>
                              <Col span={10}>
                                <Form.Item name="PawnDue" label="典当周期" >
                                    <InputNumber addonAfter="天" min="0" max="100" step="1" style={{width:'200px'}} onChange={(e)=>this.setState({PawnDue:e})} />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={10}>
                                <Form.Item name="InterestRatio" label="利 息 比 率" >
                                    <InputNumber addonAfter="%" min="0" max="100" step="0.01" style={{width:'200px'}} onChange={(e)=>this.setState({InterestRatio:e})} />
                                </Form.Item>
                              </Col>
                              <Col span={10}>
                                <Form.Item name="StoreCost" label="仓管费用" >
                                    <InputNumber addonBefore="￥" addonAfter="/周期" min="0" max="100" step="1.00" style={{width:'200px'}} onChange={(e)=>this.setState({StoreCost:e})} />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={10}>
                                <Form.Item name="OverdueCost" label="逾 期 费 用" >
                                    <InputNumber addonBefore="￥" addonAfter="/周期" min="0" max="100" step="1.00" style={{width:'200px'}} onChange={(e)=>this.setState({OverdueCost:e})} />
                                </Form.Item>
                              </Col>
                              <Col span={10}>
                                <Form.Item name="OtherCost" label="其他费用" >
                                    <InputNumber addonBefore="￥" addonAfter="/周期" min="0" max="100" step="1.00" style={{width:'200px'}} onChange={(e)=>this.setState({OtherCost:e})} />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row>
                              <Col span={19}>
                                <Form.Item name="Notes" label="备&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;注&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" >
                                  <TextArea rows={2} placeholder="请输入备注" maxLength={5} style={{width:'525px'}} onChange={(e)=>this.setState({Notes:e.target.value})}/>
                                </Form.Item>
                              </Col>
                            </Row>
                        </Form>
                    </Content>
                </Layout>
            </div>
        </div>
        )
    }
}


