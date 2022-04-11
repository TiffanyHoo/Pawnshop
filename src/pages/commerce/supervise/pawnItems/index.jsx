import React, { Component, useContext, useState, useEffect, useRef } from 'react'
import { Breadcrumb, Table, Input, Form, Drawer, Col, Row, Tag, Tooltip } from 'antd'
import axios from 'axios'
import '../../../../style/common.less'
//import 'antd/dist/antd.css';

const { CheckableTag } = Tag;
const { Search } = Input;

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


export default class PawnItems extends Component {
  constructor(props) {
    super(props);

    this.columns = [
      {
        title: '当物编号',
        dataIndex: 'PIID',
        key: 'PIID',
        editable: false
      },
      {
        title: '类别',
        dataIndex: 'title',
        key: 'title',
        editable: false
      },
      {
        title: '当户证件号',
        dataIndex: 'UserID',
        key: 'UserID',
        editable: false
      },
      {
        title: '姓名',
        dataIndex: 'UserName',
        key: 'UserName'
      },
      {
        title: '当行编号',
        dataIndex: 'PSID',
        key: 'PSID'
      },
      {
        title: '当行名称',
        dataIndex: 'PSName',
        key: 'PSName'
      },
      {
        title: '规格',
        dataIndex: 'Specification',
        key: 'Specification',
        ellipsis: {
          showTitle: false,
        },
        render: e => (
          <Tooltip placement="topLeft" title={e}>
            {e}
          </Tooltip>
        ),
      },
      {
        title: '附件',
        dataIndex: 'Documents',
        key: 'Documents',
        ellipsis: {
          showTitle: false,
        },
        render: e => (
          <Tooltip placement="topLeft" title={e}>
            {e}
          </Tooltip>
        ),
      }
    ];

    this.state = {
      visible: false ,
      dataSource: [],
      dataShow: [],
      count: 0,
      SpeDetailArr: [],
      DocDetailArr: [],
      SpecificationArr: [],
      SpecificationData: {},
      DocumentsArr: [],
      PIID: '',
      title: '',
      UserID: '',
      UserName: '',
      PSID: '',
      PSName: '',
      Specification: '',
      Documents: '',
      photopath: '',
      SpeDetail: '',
      DocDetail: ''
    };
  }

  formRef = React.createRef()

  async componentDidMount(){
    let dataSource = []
    await axios.get('/getPawnItems',{
      params:{
        usertype: "ComMem"
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
      dataShow: dataSource,
      count: dataSource.length
    })

  }

  showDrawer = async (record) => {
    const { PIID,title,UserID,UserName,userPhone,psPhone,PSID,PSName,Specification,Documents,photopath,SpeDetail,DocDetail } = record
    const SpeDetailArr = SpeDetail.split(";")
    const SpecificationArr = Specification.split(";")
    let SpecificationData = {}
    SpeDetailArr.map((obj)=>{
      SpecificationArr.map((obj1)=>{
        obj1 = obj1.split(":")
        if(obj1[0] === obj){
          SpecificationData[obj] = obj1[1]
        }
      });
    })
    const DocDetailArr = DocDetail.split(";")
    const DocumentsArr = Documents.split(";")
    
    this.setState({
      SpeDetailArr,SpecificationArr,SpecificationData,DocDetailArr,DocumentsArr,
      PIID,title,UserID,UserName,userPhone,psPhone,PSID,PSName,Specification,Documents,photopath,SpeDetail,DocDetail,
      visible: true
    });
    setTimeout(() => {
      this.formRef.current.setFieldsValue({
        PIID,title,UserID,UserName,userPhone,psPhone,PSID,PSName,...SpecificationData,Documents:DocDetailArr
      })
    }, 100); 

  }

  onClose = () => {
    this.setState({
      visible: false,
    });
  };

  onSearch = (e) => {
    let dataShow = []
    this.state.dataSource.forEach((item)=>{
      if(item.Specification.search(e) != -1){
        dataShow.push(item)
      }
    })
    this.setState({
      dataShow
    })
  };

  render() {
    const { dataShow,SpeDetailArr,DocDetailArr,SpecificationArr,SpecificationData,DocumentsArr,selectedTags,PIID } = this.state;    

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
          title: col.title
        }),
      };
    });

    return (
      <div>
        <Breadcrumb style={{ margin: '16px 0',float:'left' }}>
          <Breadcrumb.Item>典当监管</Breadcrumb.Item>
          <Breadcrumb.Item>当物合规管理</Breadcrumb.Item>
        </Breadcrumb>
        <Search placeholder="请输入物品信息" onSearch={this.onSearch} enterButton style={{width:'200px',margin: '16px 0',float:'right'}}/>
        <div className="site-layout-background" style={{ padding: 10 }}>
          <Table
            components={components}
            rowClassName={() => 'editable-row'}
            bordered
            dataSource={dataShow}
            columns={columns}
            pagination={{ pageSize: 5 }}
            onRow={record => {
              return {
                onDoubleClick: event => {this.showDrawer(record)}
              };
            }}
          />
        </div>
        <Drawer
          title="当物详细信息"
          width={720}
          onClose={this.onClose}
          visible={this.state.visible}
          bodyStyle={{ paddingBottom: 80 }}
        >
          <Form layout="vertical" ref={this.formRef} hideRequiredMark>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="PIID"
                  label="当物编号"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="title"
                  label="类目"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="UserID"
                  label="当户证件号"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="UserName"
                  label="姓名"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="PSID"
                  label="当户证件号"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="PSName"
                  label="姓名"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="userPhone"
                  label="当户电话号码"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="psPhone"
                  label="当行电话号码"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
            {
              SpeDetailArr.map((obj,index)=>{
                let value = ''
                SpecificationArr.map((obj1)=>{
                  obj1 = obj1.split(":")
                  if(obj1[0] === obj){
                    value=obj1[1]
                  }
                });
                return (
                  <Form.Item
                    name={obj}
                    label={obj}
                    value={value}
                  >
                    <Input value={value} disabled/>
                  </Form.Item>
                );
              })
            }
            <Form.Item
              name="Documents"
              label="Documents"
            >
              <div>
              {
                DocDetailArr.map((obj,index)=>{
                  return (
                    <CheckableTag
                      key={obj}
                      checked={DocumentsArr.indexOf(obj) > -1}
                      disabled
                    >
                      {obj}
                    </CheckableTag>
                  )
                })        
              }
              </div>            
            </Form.Item>
          </Form>
        </Drawer>
      </div>
    )
  }
}
